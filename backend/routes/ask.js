import express from "express";
import { callOllama } from "../services/ollamaService.js";

const router = express.Router();

router.post("/", async (req, res) => {

  let attempts = 2;

  while (attempts > 0) {

    try {

      const result = await callOllama(req.body.prompt);

      let parsed;

      try {
        parsed = JSON.parse(result);
      } catch (e) {
        attempts--;
        continue;
      }

      if (!isValidJson(parsed)) {
        attempts--;
        continue;
      }

      return res.json(parsed);

    } catch (err) {

      attempts--;
    }
  }

  res.status(500).json({
    error: "Ollama failed after retries"
  });

});

export default router;