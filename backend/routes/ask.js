import express from "express";
import { callOllama } from "../services/ollamaService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const result = await callOllama(req.body.prompt);

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from model",
        result
      });
    }

    res.json(parsed);

  } catch (err) {
    res.status(500).json({ error: "Ollama failed" });
  }
});

export default router;