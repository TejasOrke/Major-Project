const { GoogleGenerativeAI } = require("@google/generative-ai");

// Simple in-memory circuit breaker to avoid hammering service when overloaded
const breakerState = {
  failures: 0,
  openUntil: 0
};

function isBreakerOpen() {
  return Date.now() < breakerState.openUntil;
}

function recordFailure() {
  const threshold = parseInt(process.env.GEMINI_CIRCUIT_THRESHOLD || '5', 10);
  const cooldown = parseInt(process.env.GEMINI_CIRCUIT_COOLDOWN_MS || '60000', 10);
  breakerState.failures += 1;
  if (breakerState.failures >= threshold) {
    breakerState.openUntil = Date.now() + cooldown;
  }
}

function recordSuccess() {
  breakerState.failures = 0;
  breakerState.openUntil = 0;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI(apiKey);
}

function buildLORPrompt(student, { purpose, university, program }, templateText = null) {
  const internships = (student.internships || [])
    .map(i => `- ${i.company || 'Company'} (${i.duration || i.startDate || 'Start'}${i.endDate ? ' - ' + i.endDate : ''}) - ${i.status || 'Status'}`)
    .join("\n") || "None listed.";
  // Support either placements array or single placement object
  let placementArray = [];
  if (Array.isArray(student.placements)) placementArray = student.placements;
  else if (student.placement) placementArray = [student.placement];
  const placements = placementArray
    .map(p => `${p.company || 'Company'} - Package: ${p.package || 'N/A'}`)
    .join("\n") || "None recorded.";

  return `
You are an assistant generating a professional Letter of Recommendation.

Student:
Name: ${student.name}
Roll No: ${student.rollNo || 'N/A'}
Department: ${student.department?.name || 'N/A'}
CGPA: ${student.cgpa || 'N/A'}

Internships:
${internships}

Placements:
${placements}

Target:
Purpose: ${purpose}
University / Organization: ${university}
Program / Position: ${program}

Guidelines:
- Formal, specific, factual (no invented data).
- Link strengths to target program.
- 4–6 paragraphs, strong closing.
${templateText ? `Style Reference (do not output placeholders literally):\n${templateText}\n` : ''}

Output only the final letter.
`;
}

async function generateLetterWithGemini(prompt, options = {}) {
  const genAI = getGeminiClient();
  const candidateEnv = process.env.GEMINI_MODEL_CANDIDATES;
  const candidates = candidateEnv ? candidateEnv.split(',').map(s => s.trim()).filter(Boolean) : [];
  const primaryModel = process.env.GEMINI_MODEL || (candidates[0] || 'gemini-1.5-flash');
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || candidates[1] || 'gemini-1.5-flash-latest';
  const maxRetries = parseInt(process.env.GEMINI_RETRY_MAX || '3', 10);
  const baseDelay = parseInt(process.env.GEMINI_RETRY_BASE_MS || '500', 10);

  if (isBreakerOpen()) {
    const remainingMs = breakerState.openUntil - Date.now();
    const err = new Error('circuit_open');
    err.meta = { circuitOpen: true, retryAfterMs: remainingMs };
    throw err;
  }

  const attemptModel = async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const text = result.response?.text?.();
    if (!text || !text.trim()) throw new Error('Empty response from Gemini');
    return text.trim();
  };

  const errors = [];
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const modelName = attempt === 0 ? primaryModel : primaryModel; // keep same model for configured retries
    try {
      const text = await attemptModel(modelName);
      recordSuccess();
      return { text, modelUsed: modelName, attempts: attempt + 1, errors, breaker: { open: false, failures: breakerState.failures } };
    } catch (e) {
      errors.push({ attempt: attempt + 1, model: modelName, message: e.message, status: e.status || null });
      // Retry only for 429/503 or network style errors
      if (e.status === 429 || e.status === 503) recordFailure();
      if (!(e.status === 429 || e.status === 503)) break;
      const delay = baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 100);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  // Try fallback model once if configured and different
  if (fallbackModel && fallbackModel !== primaryModel) {
    try {
      const text = await attemptModel(fallbackModel);
      recordSuccess();
      return { text, modelUsed: fallbackModel, attempts: maxRetries + 1, errors, breaker: { open: false, failures: breakerState.failures } };
    } catch (e) {
      errors.push({ attempt: 'fallback', model: fallbackModel, message: e.message, status: e.status || null });
      if (e.status === 429 || e.status === 503) recordFailure();
    }
  }

  const err = new Error('Gemini generation failed after retries');
  err.meta = { errors, breaker: { open: isBreakerOpen(), failures: breakerState.failures, openUntil: breakerState.openUntil } };
  throw err;
}

module.exports = { buildLORPrompt, generateLetterWithGemini };