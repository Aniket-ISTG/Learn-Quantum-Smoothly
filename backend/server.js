const fs = require("fs");
const path = require("path");
const http = require("http");

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

const PORT = Number(process.env.PORT || 4000);

const FRONTEND_ORIGIN = "http://localhost:3000";

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

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);

  res.writeHead(statusCode, {
    "Content-Type": "application/json",
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
      res.end();
    }
  }

  pump();
}

async function handleChat(req, res) {
  let body = "";

  for await (const chunk of req) {
    body += chunk;
  }
  
  console.log("print statement 1")

  const payload = JSON.parse(body || "{}");

  if (
    !payload.context ||
    typeof payload.message !== "string" ||
    !payload.message.trim()
  ) {
    return sendJson(res, 400, {
      error: "A message and context are required.",
    });
  }

  console.log("print statement 2")

  const messages = [
    ...(payload.messages ?? []),
    {
      role: "user",
      content: payload.message.slice(0, 4000),
    },
  ].slice(-12);


  console.log("print statement 3")

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

    sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to contact the AI service.",
      retryable: true,
    });
  }

  console.log("print statement 3")
}

async function handleAnalyze(req, res) {
  let body = "";

  for await (const chunk of req) {
    body += chunk;
  }

  const payload = JSON.parse(body || "{}");

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
    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to analyze the circuit.",
      retryable: true,
    });
  }
}

async function handleOptimize(req, res) {
  let body = "";

  for await (const chunk of req) {
    body += chunk;
  }

  const payload = JSON.parse(body || "{}");

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
    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to optimize the circuit.",
      retryable: true,
    });
  }
}

async function handleLearningPath(req, res) {
  let body = "";

  for await (const chunk of req) {
    body += chunk;
  }

  const payload = JSON.parse(body || "{}");

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
    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate the learning path.",
      retryable: true,
    });
  }
}

const server = http.createServer(
  async (req, res) => {
    try {
      setCorsHeaders(res);

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
      }

      if (req.method !== "POST") {
        return sendJson(res, 405, {
          error: "Method not allowed.",
        });
      }

      const url = new URL(
        req.url,
        `http://${req.headers.host}`
      );

      if (url.pathname === "/api/ai/chat") {
        return await handleChat(req, res);
      }

      if (
        url.pathname ===
        "/api/ai/analyze-circuit"
      ) {
        return await handleAnalyze(req, res);
      }

      if (
        url.pathname ===
        "/api/ai/optimize-circuit"
      ) {
        return await handleOptimize(req, res);
      }

      if (
        url.pathname ===
        "/api/ai/learning-path"
      ) {
        return await handleLearningPath(req, res);
      }

      return sendJson(res, 404, {
        error: "Not found.",
      });
    } catch (error) {
      console.error(error);

      return sendJson(res, 500, {
        error: "Internal server error.",
      });
    }
  }
);

server.listen(PORT, () => {
  console.log(
    `AI backend running on http://localhost:${PORT}`
  );
});