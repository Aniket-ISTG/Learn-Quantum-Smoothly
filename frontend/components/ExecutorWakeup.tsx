"use client";

import { useEffect } from "react";


export default function ExecutorWakeup() {
  useEffect(() => {
    let stopped = false;

    const wakeExecutor = async () => {
      while (!stopped) {
        try {
          const response = await fetch(`https://quantum-executor.onrender.com/health`, {
            cache: "no-store",
          });

          if (response.ok) {
            console.log("Quantum executor is ready.");
            return;
          }

          console.log(
            `Quantum executor not ready yet: HTTP ${response.status}`
          );
        } catch {
          console.log("Quantum executor is waking up...");
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    };

    // Run completely in the background.
    void wakeExecutor();

    return () => {
      stopped = true;
    };
  }, []);

  return null;
}