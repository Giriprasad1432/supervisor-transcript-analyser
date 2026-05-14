import express from "express";
import callOllama from "../services/ollamaService.js";
import { isValidJson } from "../utils/validateJson.js";

const router = express.Router();

router.post("/", async (req, res) => {
  let attempts = 2;

  while (attempts > 0) {

    try {

      const result = await callOllama(req.body.prompt);
      console.log("Raw Ollama response:", result);

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

      if (
        err.code === "ECONNREFUSED" ||
        err.message?.includes("fetch failed")
      ) {
        return res.status(503).json({
          error: "Ollama isn't running. Make sure it's open!"
        });
      }

      console.error("Ollama error:", err.message);

      attempts--;
    }
  }

  res.status(500).json({
    error: "Ollama is acting up, couldn't get a good response."
  });

});

export default router;