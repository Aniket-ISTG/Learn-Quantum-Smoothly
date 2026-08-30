const endpoint = "https://api.x.ai/v1/chat/completions";
const model = "grok-4.6";

function key() {
  const value = process.env.GROK_API_KEY;

  if (!value) {
    throw new Error(
      "GROK_API_KEY is not configured. Add it to backend/.env.local and restart the dev server."
    );
  }

  return value;
}

async function request(body, timeoutMs = 45_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key()}`,
      },
      body: JSON.stringify({ model, ...body }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        response.status === 429
          ? "The AI service is rate-limited. Please try again shortly."
          : `Grok request failed (${response.status}).`
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
      { role: "system", content: system },
      ...messages,
    ],
  });

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("The AI service returned an empty response.");
  }

  return content;
}

async function generateGrokJson(system, prompt) {
  const response = await request({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("The AI service returned an empty response.");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("The AI service returned malformed structured data.");
  }
}

async function streamGrokText(system, messages) {
  return request(
    {
      messages: [
        { role: "system", content: system },
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
