import React, { useCallback, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef<number>(0);
  const previousFrameRef = useRef<number>(0);

  const gameStateRef = useRef<"new" | "play" | "over">("play");
  const distanceRef = useRef<number>(0);
  const isSpaceDown = useRef<boolean>(false);
  const playerYRef = useRef<number>(300);
  const playerVectorRef = useRef<number>(0.0);
  const vectorChangeRef = useRef<number>(Date.now());
  const wallHeightRef = useRef<number>(5);

  const PLAYER_SIZE = 5;

  const gameLogic = useCallback(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height } = context.canvas;

    if (gameStateRef.current === "play") {
      // Move to the right
      distanceRef.current += 1;

      // Player gravity
      const timeDelta = (Date.now() - vectorChangeRef.current) / 1000;
      if (isSpaceDown.current) {
        playerVectorRef.current -= timeDelta;
      } else {
        playerVectorRef.current += timeDelta;
      }
      playerYRef.current += playerVectorRef.current;

      // Collision detection
      const playerHitFloor =
        playerYRef.current + PLAYER_SIZE > height - wallHeightRef.current;
      const playerHitCeiling =
        playerYRef.current - PLAYER_SIZE < wallHeightRef.current;
      if (playerHitFloor || playerHitCeiling) {
        gameStateRef.current = "over";
      }
    }
  }, []);

  // Draw stuff
  const renderGame = useCallback(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height } = context.canvas;

    if (gameStateRef.current === "new") {
      context.fillStyle = "#222222";
      context.fillRect(0, 0, width, height);

      context.fillStyle = "white";
      context.font = "bold 72px Arial";
      context.fillText("Glidy Bird", width / 2 - 190, height / 2);
      context.font = "bold 24px Arial";
      context.fillText(
        "Press Space to start",
        width / 2 - 130,
        height / 2 + 100
      );
      return;
    }

    if (gameStateRef.current === "over") {
      context.fillStyle = "#222222";
      context.fillRect(0, 0, width, height);

      context.fillStyle = "white";
      context.font = "bold 72px Arial";
      context.fillText("Game Over", width / 2 - 190, height / 2);
      context.font = "bold 24px Arial";
      context.fillText(
        "Press Space to start again",
        width / 2 - 145,
        height / 2 + 100
      );
      return;
    }

    if (gameStateRef.current === "play") {
      // Background
      context.fillStyle = "#222222";
      context.fillRect(0, 0, width, height);

      // Scenery
      context.beginPath();
      context.fillStyle = "#44aaaa";
      context.rect(0, height - wallHeightRef.current, width, 100);
      context.rect(0, 0, width, wallHeightRef.current);
      context.fill();
      context.closePath();

      // Player
      const x = width / 3;
      context.fillStyle = "#4444aa";
      context.beginPath();
      context.arc(x, playerYRef.current, PLAYER_SIZE, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      return;
    }
  }, []);

  const animationFrame = useCallback(
    (time: number) => {
      const frameDelta = time - previousFrameRef.current;

      // Render frame
      if (frameDelta >= 1000 / 60) {
        gameLogic();
        renderGame();
        previousFrameRef.current = time;
      }

      currentFrameRef.current = requestAnimationFrame(animationFrame);
    },
    [renderGame]
  );

  // Begin rendering
  useEffect(() => {
    currentFrameRef.current = requestAnimationFrame(animationFrame);

    return () => {
      cancelAnimationFrame(currentFrameRef.current);
    };
  }, [animationFrame]);

  // Space bar handlers
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        if (gameStateRef.current === "new" || gameStateRef.current === "over") {
          playerYRef.current = 300;
          playerVectorRef.current = 0.0;
          gameStateRef.current = "play";
        }

        if (!isSpaceDown.current) {
          isSpaceDown.current = true;
          vectorChangeRef.current = Date.now();
        }
      }
    };
    window.addEventListener("keydown", keyDownHandler);

    const keyUpHandler = () => {
      isSpaceDown.current = false;
      vectorChangeRef.current = Date.now();
    };
    window.addEventListener("keyup", keyUpHandler);

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, []);

  return (
    <div className="container">
      <canvas width={850} height={600} className="game" ref={canvasRef} />
    </div>
  );
}

export default App;
