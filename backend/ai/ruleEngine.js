const rules = require("./rules.json");

/**
 * Builds a complete system prompt by combining:
 * global rules + role-specific persona + context-specific rules
 *
 * @param {string} role    - "student" | "teacher" | "admin"
 * @param {string} context - "marketplace" | "lostFound" | "academics" | "admin" | "general"
 * @returns {string} system prompt
 */
function buildSystemPrompt(role = "student", context = "general") {
  const roleConfig    = rules.roles[role]    || rules.roles.student;
  const contextConfig = rules.contexts[context] || rules.contexts.general;
  const global        = rules.global;

  const lines = [
    // Persona
    roleConfig.persona,
    "",
    // Tone & language
    `Tone: ${global.tone}. Use ${global.language}.`,
    "",
    // Uncertainty rule
    `Uncertainty rule: ${global.uncertainty}`,
    "",
    // Allowed domains
    "You may ONLY answer questions related to:",
    ...global.allowedDomains.map(d => `  - ${d}`),
    "",
    // Global restrictions
    "GLOBAL RESTRICTIONS (always apply):",
    ...global.restrictions.map(r => `  • ${r}`),
    "",
    // Role-specific extra rules
    `ROLE RULES (${role}):`,
    ...roleConfig.extraRules.map(r => `  • ${r}`),
    "",
    // Context-specific rules
    `CONTEXT RULES (${contextConfig.description}):`,
    ...contextConfig.rules.map(r => `  • ${r}`),
  ];

  return lines.join("\n");
}

/**
 * Checks if a query contains any blocked pattern.
 * Returns the matched pattern string or null.
 *
 * @param {string} text
 * @returns {string|null}
 */
function detectBlockedPattern(text) {
  const lower = text.toLowerCase();
  return rules.blockedPatterns.find(p => lower.includes(p)) || null;
}

/**
 * Basic output sanitisation — strips any accidental PII-like leakage patterns.
 * Extend this list as needed.
 *
 * @param {string} text
 * @returns {string}
 */
function sanitizeOutput(text) {
  return text
    .replace(/\b\d{10}\b/g, "[PHONE REDACTED]")           // 10-digit phone numbers
    .replace(/[\w.-]+@[\w.-]+\.\w{2,}/g, "[EMAIL REDACTED]") // email addresses
    .replace(/\b\d{12}\b/g, "[AADHAAR REDACTED]");         // 12-digit Aadhaar-like numbers
}

module.exports = { buildSystemPrompt, detectBlockedPattern, sanitizeOutput };
