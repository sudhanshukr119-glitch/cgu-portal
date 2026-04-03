const mongoose = require("mongoose");

const knowledgeChunkSchema = new mongoose.Schema({
  source:    { type: String, required: true },   // PDF filename
  chunkIndex:{ type: Number, required: true },
  text:      { type: String, required: true },
  terms:     { type: Map, of: Number },          // TF-IDF term frequencies
}, { timestamps: true });

module.exports = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
