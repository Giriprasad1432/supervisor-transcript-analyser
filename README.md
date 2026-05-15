# Supervisor Feedback Analyzer — Trinethra Module

## Overview
This is a web application designed to assist DeepThought psychology interns in analyzing supervisor transcripts. The tool leverages a local LLM via Ollama to extract structured insights, evaluate performance against a predefined rubric, and identify gaps in the supervisor's feedback.

## Architecture
The application is built with a decoupled client-server architecture:
- **Frontend**: A React SPA (built with Vite) that provides a user-friendly interface for interns to input transcripts and review structured AI-generated analyses.
- **Backend**: A Node.js/Express server that acts as a proxy between the frontend and the local LLM. It manages prompt engineering, handles multi-step LLM calls, and cleans raw AI output.
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
**Why?** `llama3.2` offers an excellent balance between performance (can run on most laptops with >=8GB RAM) and reasoning capability. It handles structured JSON output relatively well and is fast enough to keep the analysis within a 10-15 second window.

## Design Challenges Tackled

### Challenge 1: One Prompt or Many?
**Approach Taken:** Two-Phase Pipeline.
The analysis process is split into two phases:
1. **Extraction Phase**: We first ask the LLM to extract factual evidence and map KPIs. This grounds the model in the actual text without making judgments yet.
2. **Diagnostic Phase**: We feed the extracted evidence into a second prompt that acts as a "Diagnostic Critic" to score the performance and identify missing gaps.
*Tradeoff*: While this takes slightly longer than a single prompt, the quality of the structured output is significantly higher because the LLM focuses on extraction before reasoning.

### Challenge 2: Structured Output Reliability (Survivability)
**Approach Taken:** Automatic Retries & Robust Filtering.
We implemented a "Survivability" layer in the backend:
- **Automatic Retry**: If the LLM returns malformed JSON, the `ollamaservice` automatically catches the error and retries the request (up to 3 times) to get a valid response.
- **Deep Filtering**: We use a custom processing layer to strip out placeholder text (like "Detailed reasoning" or "...") that LLMs sometimes hallucinate when following a schema.

## Improvements with More Time
- **Evidence Linking UI**: Make the evidence interactive. When a user hovers over a score or a gap, highlight the specific quotes in the transcript that led to that conclusion.
- **Side-by-Side View**: Redesign the layout to show the raw transcript on the left and the analysis on the right for easier review.
- **Persistent Storage**: Add a database to save finalized analyses so they can be tracked over time as a Fellow's performance history.
- **Draft Editing**: Allow the intern to edit the AI's suggestions directly in the UI before "finalizing" the report.

## Video Walkthrough Rationale
The code is written to be **Human-Generated** and **Clean**. We avoided over-engineering (no excessive abstractions or complex utility libraries) to ensure that a psychology intern or a junior developer could read the route logic and immediately understand how the AI prompts work.
