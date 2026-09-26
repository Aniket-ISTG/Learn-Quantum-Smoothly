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

- Node.js
- JavaScript
- HTTP API
- Groq API

### Quantum & Execution

- Qiskit
- Qiskit Aer
- PennyLane
- Cirq
- Python 3.11
- Docker
- Jupyter
- nbconvert

## Project Architecture

```text
User
  ↓
Next.js Frontend
  ↓
Node.js Backend
  ├── AI Features
  └── Code Execution
        ↓
      Docker
        ↓
Python Quantum Environment
  ├── Qiskit
  ├── Qiskit Aer
  ├── PennyLane
  └── Cirq
```

## Prerequisites

Install the following:

- Node.js 20+
- npm
- Docker Desktop
- WSL 2
- Virtualization enabled
- Groq API key

## Installation

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Learn-Quantum-Smoothly
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

### 4. Configure Environment Variables

Create:

```text
backend/.env.local
```

Add:

```env
PORT=4000
GROQ_API_KEY=your_api_key_here
```

> Never commit `.env.local` to GitHub.

---

# Docker Setup

Docker is used to run the Python quantum computing environment separately from the user's computer.

## 1. Install Docker Desktop

Download and install Docker Desktop:

https://www.docker.com/products/docker-desktop/

Make sure:

- WSL 2 is enabled
- Hardware virtualization is enabled
- Docker Desktop is running

You can verify Docker from the terminal:

```bash
docker --version
```

You should see something similar to:

```text
Docker version 29.x.x
```

Test Docker:

```bash
docker run hello-world
```

If you see:

```text
Hello from Docker!
```

Docker is working correctly.

---

## 2. Build the Quantum Python Image

Open a terminal and go to the backend:

```bash
cd backend
```

Build the image:

```bash
docker build -t quantum-python .
```

This creates an image named:

```text
quantum-python
```

The image contains the Python environment and quantum libraries required by the Quantum Code Lab.

It includes:

- Python 3.11
- Qiskit
- Qiskit Aer
- PennyLane
- Cirq
- Jupyter
- nbconvert
- ipykernel

---

## 3. Verify the Docker Image

Run:

```bash
docker run --rm quantum-python python -c "import qiskit; import qiskit_aer; import pennylane; import cirq; print('Quantum libraries working!')"
```

Expected output:

```text
Quantum libraries working!
```

---

## 4. Check Docker Images

To see the images installed on your computer:

```bash
docker images
```

You should see:

```text
quantum-python
```

---

## 5. Check Running Containers

To see currently running containers:

```bash
docker ps
```

To see all containers, including stopped containers:

```bash
docker ps -a
```

---

## 6. Stop a Container

If you manually start a container and need to stop it:

```bash
docker stop <container_id>
```

For example:

```bash
docker stop abc123
```

The Quantum Code Lab normally handles temporary containers automatically.

---

## 7. Remove a Container

If you need to remove a stopped container:

```bash
docker rm <container_id>
```

---

## 8. Remove the Quantum Image

If you need to rebuild the Docker image from scratch:

```bash
docker rmi quantum-python
```

Then build it again:

```bash
docker build -t quantum-python .
```

> You normally do not need to remove the image. Only rebuild it when `requirements.txt`, the `Dockerfile`, or the Python environment changes.

---

# Running the Project

## Start Docker

Before using the Quantum Code Lab:

1. Open **Docker Desktop**
2. Wait until Docker is running
3. Make sure the `quantum-python` image exists

Check:

```bash
docker images
```

---

## Start the Backend

Open Terminal 1:

```bash
cd backend
node server.js
```

Backend:

```text
http://localhost:4000
```

---

## Start the Frontend

Open Terminal 2:

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# Quantum Code Lab

The Quantum Code Lab supports:

- Qiskit
- Qiskit Aer
- PennyLane
- Cirq
- Python
- Jupyter Notebook (`.ipynb`)

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

### AI Quantum Tutor

Helps learners understand quantum computing concepts and code.

### Circuit Analysis

Analyzes quantum circuits and provides explanations.

### Circuit Optimization

Provides suggestions for improving quantum circuits.

### Learning Path

Generates learning paths for learners.

---

# Jupyter Notebook Support

The Quantum Code Lab also supports Python `.ipynb` notebooks.

The notebook runs inside the Docker quantum environment, so the required Python quantum libraries are already available inside the container.

---

# Updating the Docker Environment

If you modify:

```text
backend/requirements.txt
```

you must rebuild the image:

```bash
cd backend
docker build -t quantum-python .
```

If you modify the `Dockerfile`, rebuild the image as well:

```bash
docker build -t quantum-python .
```

You do **not** need to reinstall Qiskit, PennyLane, Cirq, etc. on your host computer.

---

# Project Structure

```text
Learn-Quantum-Smoothly/
│
├── backend/
│   ├── ai/
│   ├── server.js
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# Important Notes

- Docker Desktop must be running when using the Quantum Code Lab locally.
- The `quantum-python` Docker image must be built before running quantum Python code.
- If `requirements.txt` changes, rebuild the Docker image.
- `.env.local` should never be committed to GitHub.
- Node.js dependencies are installed using `npm install`.
- Python quantum dependencies are provided through the Docker image.
- Users do not need to manually install Qiskit, Qiskit Aer, PennyLane, or Cirq on their host machine when using the Docker-based execution system.

## License

This project is developed as an educational quantum computing platform.