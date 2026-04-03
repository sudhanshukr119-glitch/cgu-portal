const pdfParse    = require("pdf-parse");
const OpenAI      = require("openai");
const KnowledgeChunk = require("../models/KnowledgeChunk");
const { buildSystemPrompt, sanitizeOutput } = require("../ai/ruleEngine");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Text utilities ──────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","is","it","in","on","at","to","of","and","or","for",
  "with","this","that","are","was","were","be","been","has","have","had",
  "do","does","did","will","would","can","could","should","may","might",
  "not","no","but","by","from","as","so","if","its","their","they","we",
  "you","he","she","i","my","your","our","his","her","all","any","each",
]);

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

function tfVector(tokens) {
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const total = tokens.length || 1;
  Object.keys(freq).forEach(k => (freq[k] /= total));
  return freq;
}

function cosineSim(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (const [k, v] of Object.entries(a)) {
    dot  += v * (b[k] || 0);
    magA += v * v;
  }
  for (const v of Object.values(b)) magB += v * v;
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

function chunkText(text, size = 400, overlap = 80) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    const chunk = words.slice(i, i + size).join(" ").trim();
    if (chunk.length > 60) chunks.push(chunk);
  }
  return chunks;
}

// ── Upload & index PDF ──────────────────────────────────────────────────────

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });

    const data   = await pdfParse(req.file.buffer);
    const chunks = chunkText(data.text);

    // Remove old chunks from same source
    await KnowledgeChunk.deleteMany({ source: req.file.originalname });

    const docs = chunks.map((text, i) => ({
      source: req.file.originalname,
      chunkIndex: i,
      text,
      terms: tfVector(tokenize(text)),
    }));

    await KnowledgeChunk.insertMany(docs);

    res.json({ message: `Indexed ${docs.length} chunks from "${req.file.originalname}"`, chunks: docs.length });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── List indexed sources ────────────────────────────────────────────────────

exports.getSources = async (_req, res) => {
  try {
    const sources = await KnowledgeChunk.aggregate([
      { $group: { _id: "$source", chunks: { $sum: 1 }, updatedAt: { $max: "$updatedAt" } } },
      { $sort: { updatedAt: -1 } },
    ]);
    res.json(sources);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Delete a source ─────────────────────────────────────────────────────────

exports.deleteSource = async (req, res) => {
  try {
    await KnowledgeChunk.deleteMany({ source: decodeURIComponent(req.params.source) });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Ask question (RAG) ──────────────────────────────────────────────────────

exports.ask = async (req, res) => {
  try {
    const { question, context: aiContext = "general" } = req.body;

    const allChunks = await KnowledgeChunk.find({}).lean();

    if (allChunks.length === 0) {
      return res.json({ answer: "⚠️ No knowledge base found. Please ask an admin to upload the college handbook PDF first." });
    }

    // Retrieve top-5 relevant chunks via cosine similarity
    const qVec = tfVector(tokenize(question));
    const scored = allChunks
      .map(c => ({ text: c.text, score: cosineSim(qVec, Object.fromEntries(c.terms)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const ragContext = scored.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n");

    // Build rule-aware system prompt based on user role + request context
    const userRole     = req.user?.role || "student";
    const systemPrompt = buildSystemPrompt(userRole, aiContext);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\nAnswer questions based ONLY on the provided context from the college knowledge base. Use bullet points where helpful. Do NOT make up information.`,
        },
        {
          role: "user",
          content: `Context from college knowledge base:\n\n${ragContext}\n\nQuestion: ${question}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const rawAnswer = completion.choices[0].message.content;
    res.json({ answer: sanitizeOutput(rawAnswer) });
  } catch (err) {
    console.error("Chatbot ask error:", err);
    if (err?.status === 401 || err?.code === "invalid_api_key") {
      return res.status(500).json({ message: "OpenAI API key is invalid or not set. Please configure OPENAI_API_KEY in backend .env" });
    }
    res.status(500).json({ message: err.message });
  }
};
