import subprocess
import tempfile
import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class ExecuteRequest(BaseModel):
    code: str
    framework: str = "qiskit"


ALLOWED_FRAMEWORKS = {
    "qiskit",
    "pennylane",
    "cirq",
}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/execute")
def execute(request: ExecuteRequest):

    if request.framework not in ALLOWED_FRAMEWORKS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported framework"
        )

    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Code is required"
        )

    with tempfile.TemporaryDirectory() as temp_dir:

        file_path = os.path.join(temp_dir, "main.py")

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(request.code)

        try:

            result = subprocess.run(
                [
                    "python",
                    file_path
                ],
                capture_output=True,
                text=True,
                timeout=20,
                cwd=temp_dir,
            )

            return {
                "output": result.stdout,
                "error": result.stderr,
                "framework": request.framework,
            }

        except subprocess.TimeoutExpired:

            raise HTTPException(
                status_code=408,
                detail="Execution timed out"
            )