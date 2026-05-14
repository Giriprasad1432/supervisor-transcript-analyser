import express from "express";
import cors from "cors";
import askRoute from "./routes/ask.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/ask", askRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});