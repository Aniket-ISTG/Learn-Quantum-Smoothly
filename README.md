# AI-Based Quantum Computing Learning Platform

An interactive quantum computing learning platform designed to help beginners learn quantum computing through structured lessons, interactive simulations, coding exercises, and an AI tutor.

## Project Architecture

The project has two main runtime parts:

- **Frontend:** Next.js application for the learner UI
- **Backend:** Node.js API service that handles AI features and Docker-based quantum code execution

The backend uses **Docker** to provide an isolated Python environment for executing quantum computing programs.

---

## Features

- Interactive quantum computing lessons
- Quantum circuit playground
- Qiskit support
- Qiskit Aer simulator support
- PennyLane support
- Cirq support
- Python code execution
- Jupyter Notebook (`.ipynb`) execution
- AI quantum tutor
- Circuit analysis
- Circuit optimization
- AI-generated learning paths
- Docker-isolated code execution

---

## Technology Stack

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

### Quantum Computing

- Qiskit
- Qiskit Aer
- PennyLane
- Cirq

### Code Execution

- Docker
- Python 3.11
- Jupyter
- nbconvert
- ipykernel

---

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 20+
- npm
- Docker Desktop
- WSL 2
- Virtualization enabled
- A valid Groq API key

> Docker Desktop must be running when using the Quantum Code Lab locally.

---

# Installation

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Learn-Quantum-Smoothly