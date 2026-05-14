import express from "express";
import cors from "cors";
import askRoute from "./routes/ask.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/ask", askRoute);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});