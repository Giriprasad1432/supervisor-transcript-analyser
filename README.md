# Supervisor Feedback Analyzer — Trinethra Module

## Overview
This is a web application designed to assist DeepThought psychology interns in analyzing supervisor transcripts. The tool leverages a local LLM via Ollama to extract structured insights, evaluate performance against a predefined rubric, and identify gaps in the supervisor's feedback.

## Architecture
The application is built with a decoupled client-server architecture:
- **Frontend**: A React SPA (built with Vite) that provides a user-friendly interface for interns to input transcripts and review structured AI-generated analyses.
- **Backend**: A Node.js/Express server that acts as a proxy between the frontend and the local LLM. It manages the prompt engineering, handles multi-step LLM calls, and enforces JSON validation.
- **LLM Engine**: A local Ollama instance running `llama3.2`, ensuring data privacy and offline capability.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Ollama installed locally ([Download here](https://ollama.com))

### 1. Start Ollama
Ensure Ollama is running on your machine and you have pulled the `llama3.2` model.
```bash
ollama pull llama3.2
ollama run llama3.2
```
Leave it running in the background.

### 2. Start the Backend
Open a new terminal window in the project root:
```bash
npm install
npm run dev
```
The backend server will start on `http://localhost:3000`.

### 3. Start the Frontend
Open another terminal window, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Model Selection
**Model Used:** `llama3.2`
**Why?** `llama3.2` offers an excellent balance between performance (can run on most laptops with >=8GB RAM) and reasoning capability. It handles structured JSON output relatively well and is fast enough to keep the analysis within a 10-15 second window, which is crucial for a smooth user experience.

## Design Challenges Tackled

### Challenge 1: One Prompt or Many?
**Approach Taken:** Multiple focused calls.
The analysis process is split into two phases:
1. **Extraction Phase**: We first ask the LLM to extract factual evidence and map KPIs. This grounds the model in the actual text without making judgments yet.
2. **Diagnostic Phase**: We feed the extracted evidence into a second prompt that acts as a "Diagnostic Critic" to score the performance, identify missing gaps, and generate follow-up questions.
*Tradeoff*: While this takes slightly longer than a single prompt, the quality and accuracy of the structured output are significantly higher because the LLM is focusing on extraction first, then reasoning.

### Challenge 2: Structured Output Reliability
**Approach Taken:** Strict schema enforcement and JSON validation.
We prompt the model to act as an API returning strict JSON and define a precise SCHEMA in the prompt. The backend parses the response and uses a validation utility (`isValidJson`) to ensure the frontend doesn't crash on malformed output. If the validation fails, it catches the error gracefully and can be expanded to include retry logic.

## Improvements with More Time
- **Retry Logic for LLM Parsing**: If the LLM returns invalid JSON, implement an automatic retry mechanism with a higher temperature or a "fix this JSON" fallback prompt.
- **Evidence Linking UI**: Make the evidence interactive. When a user hovers over a score or a gap, highlight the specific quotes in the transcript that led to that conclusion.
- **Side-by-Side View**: Redesign the layout to show the raw transcript on the left and the analysis on the right, synchronized so the intern can read and review concurrently.
- **Streaming Responses**: Implement SSE (Server-Sent Events) to stream the LLM's thought process (e.g., loading states like "Extracting evidence...", "Analyzing gaps...") to make the wait time feel shorter.
