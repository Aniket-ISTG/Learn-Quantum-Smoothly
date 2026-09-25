const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const os = require("os");
const http = require("http");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

// ========================================
// Docker configuration
// ========================================

const DOCKER_IMAGE = "quantum-python";
const DOCKER_MEMORY = "512m";
const DOCKER_CPUS = "1";
const DOCKER_TIMEOUT = 20000;

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

async function runDockerPython(
  tempDir,
  pythonArgs,
  timeout = DOCKER_TIMEOUT
) {
  const dockerArgs = [
    "run",
    "--rm",

    // No internet access
    "--network",
    "none",

    // CPU limit
    "--cpus",
    DOCKER_CPUS,

    // Memory limit
    "--memory",
    DOCKER_MEMORY,

    // Process limit
    "--pids-limit",
    "128",

    // Mount temporary workspace
    "-v",
    `${tempDir}:/workspace`,

    // Docker image
    DOCKER_IMAGE,

    // Python
    "python",

    // UTF-8
    "-X",
    "utf8",

    ...pythonArgs,
  ];

  return execFileAsync(
    "docker",
    dockerArgs,
    {
      timeout,
      maxBuffer: 5 * 1024 * 1024,
      windowsHide: true,
    }
  );
}

// ========================================
// Execute Jupyter Notebook
// ========================================

async function executeNotebook(
  notebook,
  tempDir,
  framework
) {
  const notebookPath = path.join(
    tempDir,
    "main.ipynb"
  );

  const executedPath = path.join(
    tempDir,
    "executed.ipynb"
  );

  // Save notebook
  fs.writeFileSync(
    notebookPath,
    JSON.stringify(
      notebook,
      null,
      2
    ),
    "utf8"
  );

  try {
    const {
      stdout,
      stderr,
    } = await runDockerPython(
      tempDir,
      [
        "-m",
        "jupyter",
        "nbconvert",
        "--to",
        "notebook",
        "--execute",

        "--ExecutePreprocessor.timeout=30",

        "--output",
        "executed.ipynb",

        "--output-dir",
        "/workspace",

        "/workspace/main.ipynb",
      ],
      60000
    );

    // ========================================
    // Read executed notebook
    // ========================================

    if (!fs.existsSync(executedPath)) {
      throw new Error(
        stderr?.trim() ||
        stdout?.trim() ||
        "Executed notebook was not created."
      );
    }

    const executedNotebook =
      JSON.parse(
        fs.readFileSync(
          executedPath,
          "utf8"
        )
      );

    // ========================================
    // Extract cell outputs
    // ========================================

    const cells =
      executedNotebook.cells.map(
        (cell) => {
          let output = "";
          let cellError = "";

          // Ignore markdown cells
          if (
            cell.cell_type !== "code"
          ) {
            return {
              output: "",
              error: "",
            };
          }

          for (
            const item of
              cell.outputs || []
          ) {
            // -----------------------------
            // print() output
            // -----------------------------

            if (
              item.output_type ===
              "stream"
            ) {
              output +=
                Array.isArray(
                  item.text
                )
                  ? item.text.join("")
                  : item.text || "";
            }

            // -----------------------------
            // Expression output
            // -----------------------------

            if (
              item.output_type ===
              "execute_result"
            ) {
              const text =
                item.data?.[
                  "text/plain"
                ];

              if (text) {
                output +=
                  Array.isArray(text)
                    ? text.join("")
                    : text;
              }
            }

            // -----------------------------
            // display() output
            // -----------------------------

            if (
              item.output_type ===
              "display_data"
            ) {
              const text =
                item.data?.[
                  "text/plain"
                ];

              if (text) {
                output +=
                  Array.isArray(text)
                    ? text.join("")
                    : text;
              }
            }

            // -----------------------------
            // Python error
            // -----------------------------

            if (
              item.output_type ===
              "error"
            ) {
              cellError =
                Array.isArray(
                  item.traceback
                )
                  ? item.traceback.join(
                      "\n"
                    )
                  : item.traceback || "";

              if (!cellError) {
                cellError =
                  `${
                    item.ename ||
                    "Error"
                  }: ${
                    item.evalue ||
                    "Execution failed"
                  }`;
              }
            }
          }

          return {
            output:
              output.trim(),

            error:
              cellError.trim(),
          };
        }
      );

    return {
      cells,

      stdout:
        stdout?.trim() || "",

      stderr:
        stderr?.trim() || "",
    };
  } catch (error) {
    throw new Error(
      error?.stderr?.trim() ||
      error?.stdout?.trim() ||
      error?.message ||
      `${framework} notebook execution failed.`
    );
  }
}

// ========================================
// Quantum Code Execution Handler
// ========================================

async function handleRunCode(
  req,
  res
) {
  let body;

  try {
    body =
      await readRequestBody(req);
  } catch {
    return sendJson(
      res,
      400,
      {
        error:
          "Unable to read request body.",
      }
    );
  }

  let payload;

  try {
    payload =
      JSON.parse(
        body || "{}"
      );
  } catch {
    return sendJson(
      res,
      400,
      {
        error:
          "Invalid JSON request.",
      }
    );
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

  if (
    language !== "python"
  ) {
    return sendJson(
      res,
      400,
      {
        error:
          "Only Python is supported in the Quantum Code Lab.",
      }
    );
  }

  // ========================================
  // Validate file type
  // ========================================

  if (
    fileType !== "python" &&
    fileType !== "notebook"
  ) {
    return sendJson(
      res,
      400,
      {
        error:
          "Unsupported file type. Use python or notebook.",
      }
    );
  }

  // ========================================
  // Validate framework
  // ========================================

  const allowedFrameworks = [
    "qiskit",
    "pennylane",
    "cirq",
  ];

  if (
    !allowedFrameworks.includes(
      framework
    )
  ) {
    return sendJson(
      res,
      400,
      {
        error:
          "Unsupported framework. Choose Qiskit, PennyLane, or Cirq.",
      }
    );
  }

  // ========================================
  // JUPYTER NOTEBOOK
  // ========================================

  if (
    fileType === "notebook"
  ) {
    if (
      !notebook ||
      typeof notebook !==
        "object"
    ) {
      return sendJson(
        res,
        400,
        {
          error:
            "Notebook data is required.",
        }
      );
    }

    if (
      !Array.isArray(
        notebook.cells
      )
    ) {
      return sendJson(
        res,
        400,
        {
          error:
            "Notebook cells are required.",
        }
      );
    }

    if (
      notebook.cells.length >
      50
    ) {
      return sendJson(
        res,
        400,
        {
          error:
            "Notebook cannot contain more than 50 cells.",
        }
      );
    }

    const tempDir =
      path.join(
        os.tmpdir(),
        `qubit-lab-notebook-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`
      );

    try {
      fs.mkdirSync(
        tempDir,
        {
          recursive: true,
        }
      );

      console.log(
        `Running ${framework} Jupyter notebook inside Docker...`
      );

      const result =
        await executeNotebook(
          notebook,
          tempDir,
          framework
        );

      // Cleanup
      try {
        fs.rmSync(
          tempDir,
          {
            recursive: true,
            force: true,
          }
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Notebook cleanup error:",
          cleanupError
        );
      }

      return sendJson(
        res,
        200,
        {
          cells:
            result.cells,

          output:
            result.stdout,

          warning:
            result.stderr,

          framework,

          fileType:
            "notebook",

          execution:
            "docker",
        }
      );
    } catch (error) {
      try {
        fs.rmSync(
          tempDir,
          {
            recursive: true,
            force: true,
          }
        );
      } catch {}

      console.error(
        "Notebook execution error:",
        error
      );

      return sendJson(
        res,
        400,
        {
          error:
            error instanceof Error
              ? error.message
              : "Notebook execution failed.",

          framework,

          fileType:
            "notebook",

          execution:
            "docker",
        }
      );
    }
  }

  // ========================================
  // NORMAL PYTHON FILE
  // ========================================

  if (
    typeof code !==
      "string" ||
    !code.trim()
  ) {
    return sendJson(
      res,
      400,
      {
        error:
          "Code is required.",
      }
    );
  }

  // ========================================
  // Create temporary directory
  // ========================================

  const tempDir =
    path.join(
      os.tmpdir(),
      `qubit-lab-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`
    );

  const filePath =
    path.join(
      tempDir,
      "main.py"
    );

  try {
    fs.mkdirSync(
      tempDir,
      {
        recursive: true,
      }
    );

    fs.writeFileSync(
      filePath,
      code,
      "utf8"
    );

    console.log(
      `Running ${framework} Python program inside Docker...`
    );

    // ========================================
    // Execute inside Docker
    // ========================================

    const {
      stdout,
      stderr,
    } =
      await runDockerPython(
        tempDir,
        [
          "/workspace/main.py",
        ],
        DOCKER_TIMEOUT
      );

    // ========================================
    // Cleanup
    // ========================================

    try {
      fs.rmSync(
        tempDir,
        {
          recursive: true,
          force: true,
        }
      );
    } catch (
      cleanupError
    ) {
      console.error(
        "Temporary file cleanup error:",
        cleanupError
      );
    }

    // ========================================
    // Success
    // ========================================

    return sendJson(
      res,
      200,
      {
        output:
          stdout?.trim() ||
          "Program executed successfully.",

        warning:
          stderr?.trim() ||
          "",

        framework,

        fileType:
          "python",

        execution:
          "docker",
      }
    );
  } catch (error) {
    // ========================================
    // Cleanup after failure
    // ========================================

    try {
      fs.rmSync(
        tempDir,
        {
          recursive: true,
          force: true,
        }
      );
    } catch {}

    console.error(
      `${framework} Docker execution error:`,
      error
    );

    return sendJson(
      res,
      400,
      {
        error:
          error?.stderr?.trim() ||
          error?.message ||
          "Python execution failed.",

        output:
          error?.stdout?.trim() ||
          "",

        framework,

        fileType:
          "python",

        execution:
          "docker",
      }
    );
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

server.listen(
  PORT,
  () => {
    console.log(
      `AI backend running on http://localhost:${PORT}`
    );
  }
);