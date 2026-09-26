const object = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? value
    : undefined;

const text = (value, fallback = "") =>
  typeof value === "string" ? value.slice(0, 2400) : fallback;

const list = (value) => (Array.isArray(value) ? value : []);

module.exports = { object, text, list };
