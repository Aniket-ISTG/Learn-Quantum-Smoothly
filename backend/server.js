const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const os = require("os");
const http = require("http");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

// ========================================
// Load environment variables
// ========================================

const envPath = path.join(__dirname, ".env.local");

if (fs.existsSync(envPath)) {
  const parsed = fs.readFileSync(envPath, "utf8");

  for (const line of parsed.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      !trimmed.includes("=")
    ) {
      continue;
    }

    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// ========================================
// Import AI modules
// ========================================

const {
  generalTutorPrompt,
  circuitAnalysisPrompt,
  circuitOptimizationPrompt,
  learningPathPrompt,
} = require("./ai/prompts.js");

const {
  generateGrokJson,
  streamGrokText,
} = require("./ai/grok.js");

const {
  validateCircuit,
} = require("./ai/circuit-analysis.js");

const {
  parseCircuitAnalysis,
  parseOptimization,
  parseLearningPath,
} = require("./ai/validation.js");

// ========================================
// Server configuration
// ========================================

const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = "http://localhost:3000";

// ========================================
// CORS
// ========================================

function setCorsHeaders(res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    FRONTEND_ORIGIN
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}

// ========================================
// Response helpers
// ========================================

function sendJson(res, statusCode, payload) {
  if (res.headersSent) {
    return;
  }

  setCorsHeaders(res);

  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  res.end(JSON.stringify(payload));
}

function sendStream(res, readableStream) {
  setCorsHeaders(res);

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const reader = readableStream.body?.getReader?.();

  if (!reader) {
    res.end();
    return;
  }

  async function pump() {
    try {
      const { value, done } = await reader.read();

      if (done) {
        res.end();
        return;
      }

      res.write(Buffer.from(value));

      await pump();
    } catch (error) {
      console.error("AI stream error:", error);

      if (!res.writableEnded) {
        res.end();
      }
    }
  }

  pump();
}

// ========================================
// Read request body
// ========================================

async function readRequestBody(req) {
  let body = "";

  for await (const chunk of req) {
    body += chunk.toString();

    if (body.length > 1024 * 1024) {
      throw new Error("Request body is too large.");
    }
  }

  return body;
}

// ========================================
// AI Chat Handler
// ========================================

async function handleChat(req, res) {
  let body;

  try {
    body = await readRequestBody(req);
  } catch {
    return sendJson(res, 400, {
      error: "Unable to read request body.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(body || "{}");
  } catch {
    return sendJson(res, 400, {
      error: "Invalid JSON request.",
    });
  }

  console.log("Chat request received");

  if (
    !payload.context ||
    typeof payload.message !== "string" ||
    !payload.message.trim()
  ) {
    return sendJson(res, 400, {
      error: "A message and context are required.",
    });
  }

  const messages = [
    ...(Array.isArray(payload.messages)
      ? payload.messages
      : []),
    {
      role: "user",
      content: payload.message.slice(0, 4000),
    },
  ].slice(-12);

  try {
    const upstream = await streamGrokText(
      generalTutorPrompt(payload.context),
      messages
    );

    sendStream(res, upstream);
  } catch (error) {
    console.error("========== CHAT ERROR ==========");
    console.error(error);
    console.error("================================");

    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to contact the AI service.",
      retryable: true,
    });
  }
}

// ========================================
// Circuit Analysis Handler
// ========================================

async function handleAnalyze(req, res) {
  let body;

  try {
    body = await readRequestBody(req);
  } catch {
    return sendJson(res, 400, {
      error: "Unable to read request body.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(body || "{}");
  } catch {
    return sendJson(res, 400, {
      error: "Invalid JSON request.",
    });
  }

  if (!payload.context || !payload.circuit) {
    return sendJson(res, 400, {
      error: "Circuit and context are required.",
    });
  }

  const deterministicIssues = validateCircuit(
    payload.circuit
  );

  const systemPrompt = circuitAnalysisPrompt(
    payload.context,
    JSON.stringify(deterministicIssues, null, 2)
  );

  try {
    const result = await generateGrokJson(
      systemPrompt,
      JSON.stringify({
        circuit: payload.circuit,
        simulation: payload.simulation,
        note: payload.note ?? "",
      })
    );

    const parsed = parseCircuitAnalysis(
      result,
      deterministicIssues
    );

    return sendJson(res, 200, parsed);
  } catch (error) {
    console.error("Circuit analysis error:", error);

    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to analyze the circuit.",
      retryable: true,
    });
  }
}

// ========================================
// Circuit Optimization Handler
// ========================================

async function handleOptimize(req, res) {
  let body;

  try {
    body = await readRequestBody(req);
  } catch {
    return sendJson(res, 400, {
      error: "Unable to read request body.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(body || "{}");
  } catch {
    return sendJson(res, 400, {
      error: "Invalid JSON request.",
    });
  }

  if (!payload.context || !payload.circuit) {
    return sendJson(res, 400, {
      error: "Circuit and context are required.",
    });
  }

  try {
    const result = await generateGrokJson(
      circuitOptimizationPrompt(payload.context),
      JSON.stringify({
        circuit: payload.circuit,
        note: payload.note ?? "",
      })
    );

    return sendJson(
      res,
      200,
      parseOptimization(result)
    );
  } catch (error) {
    console.error("Circuit optimization error:", error);

    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to optimize the circuit.",
      retryable: true,
    });
  }
}

// ========================================
// Learning Path Handler
// ========================================

async function handleLearningPath(req, res) {
  let body;

  try {
    body = await readRequestBody(req);
  } catch {
    return sendJson(res, 400, {
      error: "Unable to read request body.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(body || "{}");
  } catch {
    return sendJson(res, 400, {
      error: "Invalid JSON request.",
    });
  }

  if (!payload.context) {
    return sendJson(res, 400, {
      error: "Context is required.",
    });
  }

  try {
    const result = await generateGrokJson(
      learningPathPrompt(payload.context),
      JSON.stringify({
        context: payload.context,
        note: payload.note ?? "",
      })
    );

    return sendJson(
      res,
      200,
      parseLearningPath(result)
    );
  } catch (error) {
    console.error("Learning path error:", error);

    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate the learning path.",
      retryable: true,
    });
  }
}

// ========================================
// Code Execution Handler
// Supports:
// C
// C++
// Python
// Java
// JavaScript
// ========================================

async function handleRunCode(req, res) {
  let body;

  try {
    body = await readRequestBody(req);
  } catch {
    return sendJson(res, 400, {
      error: "Unable to read request body.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(body || "{}");
  } catch {
    return sendJson(res, 400, {
      error: "Invalid JSON request.",
    });
  }

  const { language, code } = payload;

  const supportedLanguages = [
    "c",
    "cpp",
    "python",
    "java",
    "javascript",
  ];

  if (!supportedLanguages.includes(language)) {
    return sendJson(res, 400, {
      error: "Unsupported language.",
    });
  }

  if (typeof code !== "string" || !code.trim()) {
    return sendJson(res, 400, {
      error: "Code is required.",
    });
  }

  const temporaryDirectory = await fsPromises.mkdtemp(
    path.join(os.tmpdir(), "qubit-lab-")
  );

  let sourceFile;
  let compileCommand = null;
  let compileArguments = [];
  let runCommand;
  let runArguments = [];

  try {
    // ========================================
    // C
    // ========================================

    if (language === "c") {
      sourceFile = path.join(
        temporaryDirectory,
        "main.c"
      );

      await fsPromises.writeFile(
        sourceFile,
        code,
        "utf8"
      );

      const executableName =
        process.platform === "win32"
          ? "main.exe"
          : "main";

      compileCommand = "gcc";

      compileArguments = [
        sourceFile,
        "-o",
        path.join(temporaryDirectory, executableName),
      ];

      runCommand = path.join(
        temporaryDirectory,
        executableName
      );
    }

    // ========================================
    // C++
    // ========================================

    if (language === "cpp") {
      sourceFile = path.join(
        temporaryDirectory,
        "main.cpp"
      );

      await fsPromises.writeFile(
        sourceFile,
        code,
        "utf8"
      );

      const executableName =
        process.platform === "win32"
          ? "main.exe"
          : "main";

      compileCommand = "g++";

      compileArguments = [
        sourceFile,
        "-o",
        path.join(temporaryDirectory, executableName),
      ];

      runCommand = path.join(
        temporaryDirectory,
        executableName
      );
    }

    // ========================================
    // Python
    // ========================================

    if (language === "python") {
      sourceFile = path.join(
        temporaryDirectory,
        "main.py"
      );

      await fsPromises.writeFile(
        sourceFile,
        code,
        "utf8"
      );

      runCommand =
        process.platform === "win32"
          ? "python"
          : "python3";

      runArguments = [sourceFile];
    }

    // ========================================
    // Java
    // ========================================

    if (language === "java") {
      sourceFile = path.join(
        temporaryDirectory,
        "Main.java"
      );

      await fsPromises.writeFile(
        sourceFile,
        code,
        "utf8"
      );

      compileCommand = "javac";
      compileArguments = [sourceFile];

      runCommand = "java";
      runArguments = [
        "-cp",
        temporaryDirectory,
        "Main",
      ];
    }

    // ========================================
    // JavaScript
    // ========================================

    if (language === "javascript") {
      sourceFile = path.join(
        temporaryDirectory,
        "main.js"
      );

      await fsPromises.writeFile(
        sourceFile,
        code,
        "utf8"
      );

      runCommand = process.execPath;
      runArguments = [sourceFile];
    }

    // ========================================
    // Compile C, C++, or Java
    // ========================================

    if (compileCommand) {
      try {
        await execFileAsync(
          compileCommand,
          compileArguments,
          {
            cwd: temporaryDirectory,
            timeout: 10000,
            maxBuffer: 1024 * 1024,
            windowsHide: true,
          }
        );
      } catch (error) {
        return sendJson(res, 400, {
          output: "",
          error:
            error.stderr ||
            error.stdout ||
            error.message ||
            "Compilation failed.",
        });
      }
    }

    // ========================================
    // Run the code
    // ========================================

    try {
      const result = await execFileAsync(
        runCommand,
        runArguments,
        {
          cwd: temporaryDirectory,
          timeout: 5000,
          maxBuffer: 1024 * 1024,
          windowsHide: true,
        }
      );

      return sendJson(res, 200, {
        output: result.stdout || "",
        error: result.stderr || "",
      });
    } catch (error) {
      return sendJson(res, 400, {
        output: error.stdout || "",
        error:
          error.stderr ||
          error.message ||
          "Execution failed.",
      });
    }
  } finally {
    await fsPromises.rm(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
}

// ========================================
// HTTP Server
// ========================================

const server = http.createServer(
  async (req, res) => {
    try {
      setCorsHeaders(res);

      // Handle CORS preflight request
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
      }

      const url = new URL(
        req.url,
        `http://${req.headers.host || "localhost"}`
      );

      // ========================================
      // Code execution endpoint
      // ========================================

      if (
        url.pathname === "/api/run" &&
        req.method === "POST"
      ) {
        return await handleRunCode(req, res);
      }

      // ========================================
      // AI chat endpoint
      // ========================================

      if (
        url.pathname === "/api/ai/chat" &&
        req.method === "POST"
      ) {
        return await handleChat(req, res);
      }

      // ========================================
      // Circuit analysis endpoint
      // ========================================

      if (
        url.pathname === "/api/ai/analyze-circuit" &&
        req.method === "POST"
      ) {
        return await handleAnalyze(req, res);
      }

      // ========================================
      // Circuit optimization endpoint
      // ========================================

      if (
        url.pathname === "/api/ai/optimize-circuit" &&
        req.method === "POST"
      ) {
        return await handleOptimize(req, res);
      }

      // ========================================
      // Learning path endpoint
      // ========================================

      if (
        url.pathname === "/api/ai/learning-path" &&
        req.method === "POST"
      ) {
        return await handleLearningPath(req, res);
      }

      // ========================================
      // Unknown route
      // ========================================

      return sendJson(res, 404, {
        error: "Not found.",
      });
    } catch (error) {
      console.error("Server error:", error);

      if (!res.headersSent) {
        return sendJson(res, 500, {
          error: "Internal server error.",
        });
      }

      if (!res.writableEnded) {
        res.end();
      }
    }
  }
);

// ========================================
// Start server
// ========================================

server.listen(PORT, () => {
  console.log(
    `AI backend running on http://localhost:${PORT}`
  );
});