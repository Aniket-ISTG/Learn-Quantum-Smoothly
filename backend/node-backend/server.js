const fs = require("fs");
const path = require("path");
const http = require("http");

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
// Execution service configuration
// ========================================

const EXECUTION_SERVICE_URL = (
  process.env.EXECUTION_SERVICE_URL || ""
).replace(/\/+$/, "");

const EXECUTION_TIMEOUT = 20000;

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
const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || "http://localhost:3000";

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
    JSON.stringify(
      deterministicIssues,
      null,
      2
    )
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
    console.error(
      "Circuit analysis error:",
      error
    );

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
      circuitOptimizationPrompt(
        payload.context
      ),
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
    console.error(
      "Circuit optimization error:",
      error
    );

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
      learningPathPrompt(
        payload.context
      ),
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
    console.error(
      "Learning path error:",
      error
    );

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
// Docker Python Runner
// ========================================

async function executeRemotePython(
  code,
  framework,
  timeout = EXECUTION_TIMEOUT
) {
  if (!EXECUTION_SERVICE_URL) {
    throw new Error(
      "EXECUTION_SERVICE_URL is not configured."
    );
  }

  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(
      `${EXECUTION_SERVICE_URL}/execute`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          code,
          framework,
        }),

        signal: controller.signal,
      }
    );

    const rawText = await response.text();

    let payload = {};

    try {
      payload = rawText
        ? JSON.parse(rawText)
        : {};
    } catch {
      payload = {
        output: rawText,
      };
    }

    if (!response.ok) {
      throw new Error(
        payload?.error ||
        payload?.message ||
        payload?.stderr ||
        `Execution service returned HTTP ${response.status}`
      );
    }

    return {
      output:
        payload?.output ??
        payload?.stdout ??
        "",

      warning:
        payload?.warning ??
        payload?.stderr ??
        "",

      error:
        payload?.error ??
        "",

      raw: payload,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Quantum execution service timed out."
      );
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}
// ========================================
// Execute Jupyter Notebook
// ========================================
async function executeNotebook(
  notebook,
  _unused,
  framework
) {
  if (!EXECUTION_SERVICE_URL) {
    throw new Error(
      "EXECUTION_SERVICE_URL is not configured."
    );
  }

  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, EXECUTION_TIMEOUT);

  try {
    const response = await fetch(
      `${EXECUTION_SERVICE_URL}/execute-notebook`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          notebook,
          framework,
        }),

        signal: controller.signal,
      }
    );

    const rawText = await response.text();

    let payload = {};

    try {
      payload = rawText
        ? JSON.parse(rawText)
        : {};
    } catch {
      throw new Error(
        rawText ||
        "Invalid response from execution service."
      );
    }

    if (!response.ok) {
      throw new Error(
        payload?.error ||
        payload?.message ||
        payload?.stderr ||
        `Execution service returned HTTP ${response.status}`
      );
    }

    return {
      cells: Array.isArray(payload.cells)
        ? payload.cells
        : [],

      stdout:
        payload.stdout || "",

      stderr:
        payload.stderr || "",
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Quantum notebook execution service timed out."
      );
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}


// ========================================
// Quantum Code Execution Handler
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

  const {
    language,
    framework,
    fileType = "python",
    code,
    notebook,
  } = payload;

  // ========================================
  // Validate language
  // ========================================

  if (language !== "python") {
    return sendJson(res, 400, {
      error:
        "Only Python is supported in the Quantum Code Lab.",
    });
  }

  // ========================================
  // Validate file type
  // ========================================

  if (
    fileType !== "python" &&
    fileType !== "notebook"
  ) {
    return sendJson(res, 400, {
      error:
        "Unsupported file type. Use python or notebook.",
    });
  }

  // ========================================
  // Validate framework
  // ========================================

  const allowedFrameworks = [
    "qiskit",
    "pennylane",
    "cirq",
  ];

  if (!allowedFrameworks.includes(framework)) {
    return sendJson(res, 400, {
      error:
        "Unsupported framework. Choose Qiskit, PennyLane, or Cirq.",
    });
  }

  // ========================================
  // JUPYTER NOTEBOOK
  // ========================================

  if (fileType === "notebook") {
    if (
      !notebook ||
      typeof notebook !== "object"
    ) {
      return sendJson(res, 400, {
        error: "Notebook data is required.",
      });
    }

    if (!Array.isArray(notebook.cells)) {
      return sendJson(res, 400, {
        error: "Notebook cells are required.",
      });
    }

    if (notebook.cells.length > 50) {
      return sendJson(res, 400, {
        error:
          "Notebook cannot contain more than 50 cells.",
      });
    }

    try {
      console.log(
        `Running ${framework} Jupyter notebook on remote execution service...`
      );

      const result = await executeNotebook(
        notebook,
        null,
        framework
      );

      return sendJson(res, 200, {
        cells: result.cells,

        output: result.stdout || "",

        warning: result.stderr || "",

        framework,

        fileType: "notebook",

        execution: "remote",
      });
    } catch (error) {
      console.error(
        "Remote notebook execution error:",
        error
      );

      return sendJson(res, 400, {
        error:
          error instanceof Error
            ? error.message
            : "Notebook execution failed.",

        framework,

        fileType: "notebook",

        execution: "remote",
      });
    }
  }

  // ========================================
  // NORMAL PYTHON FILE
  // ========================================

  if (
    typeof code !== "string" ||
    !code.trim()
  ) {
    return sendJson(res, 400, {
      error: "Code is required.",
    });
  }

  // ========================================
  // Execute on remote quantum executor
  // ========================================

  try {
    console.log(
      `Running ${framework} Python program on remote execution service...`
    );

    const result = await executeRemotePython(
      code,
      framework,
      EXECUTION_TIMEOUT
    );

    // ========================================
    // Success
    // ========================================

    return sendJson(res, 200, {
      output:
        result.output?.trim() ||
        "Program executed successfully.",

      warning:
        result.warning?.trim() ||
        "",

      framework,

      fileType: "python",

      execution: "remote",
    });
  } catch (error) {
    // ========================================
    // Remote execution failure
    // ========================================

    console.error(
      `${framework} remote execution error:`,
      error
    );

    return sendJson(res, 400, {
      error:
        error?.message ||
        "Python execution failed.",

      output: "",

      framework,

      fileType: "python",

      execution: "remote",
    });
  }
}

// ========================================
// HTTP Server
// ========================================

const server =
  http.createServer(
    async (
      req,
      res
    ) => {
      try {
        setCorsHeaders(res);

        // ========================================
        // CORS preflight
        // ========================================

        if (
          req.method ===
          "OPTIONS"
        ) {
          res.writeHead(
            204
          );

          return res.end();
        }

        const url =
          new URL(
            req.url,
            `http://${
              req.headers.host ||
              "localhost"
            }`
          );

        // ========================================
        // Code execution endpoint
        // ========================================
        


        // ========================================
        // Health check
        // ========================================

        if (
          url.pathname === "/health" &&
          req.method === "GET"
        ) {
          return sendJson(res, 200, {
            status: "ok",
            executionServiceConfigured:
              Boolean(EXECUTION_SERVICE_URL),
          });
        }

        if (
          url.pathname ===
            "/api/run" &&
          req.method ===
            "POST"
        ) {
          return await handleRunCode(
            req,
            res
          );
        }

        // ========================================
        // AI chat endpoint
        // ========================================

        if (
          url.pathname ===
            "/api/ai/chat" &&
          req.method ===
            "POST"
        ) {
          return await handleChat(
            req,
            res
          );
        }

        // ========================================
        // Circuit analysis endpoint
        // ========================================

        if (
          url.pathname ===
            "/api/ai/analyze-circuit" &&
          req.method ===
            "POST"
        ) {
          return await handleAnalyze(
            req,
            res
          );
        }

        // ========================================
        // Circuit optimization endpoint
        // ========================================

        if (
          url.pathname ===
            "/api/ai/optimize-circuit" &&
          req.method ===
            "POST"
        ) {
          return await handleOptimize(
            req,
            res
          );
        }

        // ========================================
        // Learning path endpoint
        // ========================================

        if (
          url.pathname ===
            "/api/ai/learning-path" &&
          req.method ===
            "POST"
        ) {
          return await handleLearningPath(
            req,
            res
          );
        }

        // ========================================
        // Unknown route
        // ========================================

        return sendJson(
          res,
          404,
          {
            error:
              "Not found.",
          }
        );
      } catch (
        error
      ) {
        console.error(
          "Server error:",
          error
        );

        if (
          !res.headersSent
        ) {
          return sendJson(
            res,
            500,
            {
              error:
                "Internal server error.",
            }
          );
        }

        if (
          !res.writableEnded
        ) {
          res.end();
        }
      }
    }
  );

// ========================================
// Start server
// ========================================

server.listen(PORT, "0.0.0.0", () => {
  console.log(`AI backend running on port ${PORT}`);
});