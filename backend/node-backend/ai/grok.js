const endpoint =
  "https://api.groq.com/openai/v1/chat/completions";

const model = "openai/gpt-oss-20b";

function key() {
  const value = process.env.GROQ_API_KEY;

  if (!value) {
    throw new Error(
      "GROQ_API_KEY is not configured. Add it to backend/.env.local and restart the dev server."
    );
  }

  return value;
}

async function request(body, timeoutMs = 45_000) {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key()}`,
      },

      body: JSON.stringify({
        model,
        ...body,
      }),

      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();

      console.error("========== GROQ API ERROR ==========");
      console.error("Status:", response.status);
      console.error("Response:", errorBody);
      console.error("====================================");

      throw new Error(
        response.status === 429
          ? "The AI service is rate-limited. Please try again shortly."
          : `Groq request failed (${response.status}): ${errorBody}`
      );
    }

    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function generateGrokText(system, messages) {
  const response = await request({
    messages: [
      {
        role: "system",
        content: system,
      },
      ...messages,
    ],
  });

  const payload = await response.json();

  const content =
    payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error(
      "The AI service returned an empty response."
    );
  }

  return content;
}

async function generateGrokJson(system, prompt) {
  const response = await request({
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    response_format: {
      type: "json_object",
    },
  });

  const payload = await response.json();

  const content =
    payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "The AI service returned an empty response."
    );
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(
      "The AI service returned malformed structured data."
    );
  }
}

async function streamGrokText(system, messages) {
  return request(
    {
      messages: [
        {
          role: "system",
          content: system,
        },
        ...messages,
      ],

      stream: true,
    },
    60_000
  );
}

module.exports = {
  generateGrokText,
  generateGrokJson,
  streamGrokText,
};