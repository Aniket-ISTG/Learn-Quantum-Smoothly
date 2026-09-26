# AI-Based Quantum Computing Learning Platform

An interactive quantum computing learning platform designed to help beginners learn quantum computing through structured lessons, interactive simulations, coding exercises, and an AI tutor.

## Features

- Interactive quantum computing lessons
- Quantum circuit playground
- Qiskit and Qiskit Aer support
- PennyLane support
- Cirq support
- Python code execution
- Jupyter Notebook (`.ipynb`) support
- AI quantum tutor
- Circuit analysis and optimization
- AI-generated learning paths
- Docker-isolated code execution

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- **Node.js AI & Gateway Backend (`backend/node-backend`)**:
  - Node.js (v18+)
  - JavaScript
  - Native HTTP server
  - Groq API (LLM inference)
- **Quantum Execution Service (`backend/executor`)**:
  - Python 3.11
  - FastAPI & Uvicorn
  - Docker containerization

### Quantum & Execution

- Qiskit
- Qiskit Aer
- PennyLane
- Cirq
- Python 3.11
- Docker
- Jupyter & nbconvert

## Project Architecture

```text
User
  ↓
Next.js Frontend (port 3000)
  ↓
Node.js Backend (port 4000)
  ├── AI Features (Groq API)
  └── Code Execution Proxy (/api/run)
        ↓
Quantum Execution Service (port 10000 / Render Cloud)
  ├── FastAPI (executor.py)
  ├── Qiskit & Qiskit Aer
  ├── PennyLane
  └── Cirq
```

## Prerequisites

Install the following on your machine:

- **Node.js 18+** (recommended Node 20+)
- **npm**
- **Docker Desktop** (optional if using the cloud-hosted execution service)
- **WSL 2** (if on Windows)
- **Groq API key** (free from [console.groq.com](https://console.groq.com))

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Learn-Quantum-Smoothly
```

### 2. Setup Node Backend (`backend/node-backend`)

The Node backend handles AI tutoring, circuit analysis, and proxies code execution requests to the quantum executor.

1. Navigate to the node backend folder:
   ```bash
   cd backend/node-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the environment configuration file `.env.local`:
   ```bash
   touch .env.local
   ```

4. Add the following variables to `backend/node-backend/.env.local`:
   ```env
   # Server Port
   PORT=4000

   # Groq API Key for AI Quantum Tutor & Circuit Analysis
   GROQ_API_KEY=your_groq_api_key_here

   # Quantum Code Execution Service URL:
   # Option A: Cloud-hosted execution service (no local Docker needed)
   EXECUTION_SERVICE_URL=https://quantum-executor.onrender.com

   # Option B: Local Docker execution service (if running backend/executor locally)
   # EXECUTION_SERVICE_URL=http://localhost:10000

   # Frontend Origin for CORS
   FRONTEND_ORIGIN=http://localhost:3000
   ```

> [!WARNING]
> Never commit `.env.local` to version control.

---

### 3. Setup Frontend (`frontend`)

1. In a new terminal, navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

### 4. Setup Quantum Execution Service (`backend/executor`)

The quantum executor runs user Python code in an isolated environment with Qiskit, PennyLane, and Cirq.

> [!TIP]
> **Cloud Executor Available**: If you configured `EXECUTION_SERVICE_URL=https://quantum-executor.onrender.com` in `backend/node-backend/.env.local`, you can **skip** setting up the local executor!

If you prefer to run the execution service locally:

#### Option A: Run via Docker (Recommended for Isolation)

1. Make sure **Docker Desktop** is running.
2. Build the Docker image:
   ```bash
   cd backend/executor
   docker build -t quantum-executor .
   ```
3. Run the container:
   ```bash
   docker run -d -p 10000:10000 --name quantum-executor quantum-executor
   ```
4. Verify the container is running:
   ```bash
   curl http://localhost:10000/health
   # Response: {"status":"ok"}
   ```

#### Option B: Run via Local Python Environment

1. Navigate to the executor directory:
   ```bash
   cd backend/executor
   ```
2. (Optional) Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn executor:app --host 0.0.0.0 --port 10000
   ```

---

# Running the Project

To run the complete application, open separate terminals for each service:

### Terminal 1: Node.js Backend

```bash
cd backend/node-backend

# Development mode (with auto-reload on file change):
npm run dev

# Or standard start:
npm start
```

- **URL**: `http://localhost:4000`
- **Verify**: Open `http://localhost:4000/health` in your browser or run:
  ```bash
  curl http://localhost:4000/health
  # Response: {"status":"ok","executionServiceConfigured":true}
  ```

### Terminal 2: Next.js Frontend

```bash
cd frontend
npm run dev
```

- **URL**: `http://localhost:3000`
- Open [http://localhost:3000](http://localhost:3000) in your browser to access the platform.

### Terminal 3: (Optional) Local Quantum Executor

*Only required if you are not using the cloud-hosted executor.*

```bash
cd backend/executor
# If running with Docker:
docker start quantum-executor
# Or run new container:
# docker run -p 10000:10000 --name quantum-executor quantum-executor

# Or if running with Python directly:
uvicorn executor:app --host 0.0.0.0 --port 10000
```

- **URL**: `http://localhost:10000`
- **Verify**: `curl http://localhost:10000/health` -> `{"status":"ok"}`

---

# Quantum Code Lab

The Quantum Code Lab supports:

- **Qiskit & Qiskit Aer**
- **PennyLane**
- **Cirq**
- **Python Standard Library**
- **Jupyter Notebook (`.ipynb`)**

Example Qiskit Aer program:

```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2, 2)

qc.h(0)
qc.cx(0, 1)

qc.measure([0, 1], [0, 1])

simulator = AerSimulator()

result = simulator.run(
    qc,
    shots=1000
).result()

print(result.get_counts())
```

---

# AI Features

- **AI Quantum Tutor**: Interactive conversational tutor to guide beginners through quantum concepts and debugging.
- **Circuit Analysis**: Analyzes user-created quantum circuits and explains quantum state evolution, superposition, and entanglement.
- **Circuit Optimization**: Recommends gate reductions and simplifications to optimize circuit depth and gate count.
- **Learning Path Generation**: Generates customized study roadmaps based on user skill level and interests.

---

# Docker Maintenance Commands

When running the quantum executor container locally:

- **View running containers**:
  ```bash
  docker ps
  ```
- **View all containers (including stopped)**:
  ```bash
  docker ps -a
  ```
- **Stop executor container**:
  ```bash
  docker stop quantum-executor
  ```
- **Remove executor container**:
  ```bash
  docker rm quantum-executor
  ```
- **Rebuild image** (after changing `backend/executor/requirements.txt` or `Dockerfile`):
  ```bash
  cd backend/executor
  docker build -t quantum-executor .
  ```

---

# Project Structure

```text
Learn-Quantum-Smoothly/
│
├── backend/
│   ├── executor/                # Python Quantum Code Execution Service
│   │   ├── Dockerfile           # Python 3.11 + Quantum libraries container
│   │   ├── executor.py          # FastAPI service running /execute endpoint
│   │   ├── requirements.txt     # Qiskit, PennyLane, Cirq, FastAPI, Uvicorn
│   │   └── .dockerignore
│   │
│   └── node-backend/            # Node.js AI & Gateway Backend
│       ├── ai/                  # AI prompts, Grok/Groq integration, circuit analysis
│       ├── .env.local           # Environment variables (PORT, GROQ_API_KEY, etc.)
│       ├── package.json         # Node dependencies (express, cors)
│       └── server.js            # Main HTTP API server (port 4000)
│
├── frontend/                    # Next.js Frontend Application
│   ├── app/                     # Next.js App Router pages
│   ├── components/              # React UI components (IDE, Chat, Playground)
│   ├── public/                  # Static assets
│   └── package.json
│
└── README.md
```

---

# Important Notes

- The Node backend must be running on port `4000` (or the port specified in `PORT`) for the frontend to communicate with AI and code execution services.
- The execution service URL can be configured in `backend/node-backend/.env.local`. You can either use the remote Render execution service (`https://quantum-executor.onrender.com`) or run the local Docker/FastAPI container at `http://localhost:10000`.
- `.env.local` contains sensitive API credentials and should never be committed to Git.
- Node.js dependencies are installed inside `backend/node-backend/` via `npm install`.

## License

This project is developed as an educational quantum computing platform.