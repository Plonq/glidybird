import React, { useCallback, useEffect, useRef } from "react";
import "./App.css";

function random(min: number, max: number) {
  // min and max included
  return min + Math.random() * (max - min);
}

function App() {
  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 600;
  const PLAYER_SIZE = 5;
  const WALL_COUNT = 300;
  const PLAYER_X = CANVAS_WIDTH / 3;
  const PLAYER_WALL_INDEX = Math.floor(WALL_COUNT / (CANVAS_WIDTH / PLAYER_X));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef<number>(0);
  const previousFrameRef = useRef<number>(0);

  const gameStateRef = useRef<"new" | "play" | "over">("play");
  const isSpaceDown = useRef<boolean>(false);
  const playerYRef = useRef<number>(CANVAS_HEIGHT / 2);
  const playerVectorRef = useRef<number>(0.0);
  const vectorChangeRef = useRef<number>(Date.now());
  const wallsRef = useRef<number[]>([]);

  function createWall() {
    const previous = wallsRef.current[wallsRef.current.length - 1] || 0;
    let height = random(previous - 2, previous + 2) + 0.5;
    if (height < 0) {
      height = 0;
    }
    return height;
  }

  for (let i = 0; i < WALL_COUNT; i++) {
    wallsRef.current.push(createWall());
  }

  const gameLogic = useCallback(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height } = context.canvas;

    if (gameStateRef.current === "play") {
      // Move to the right

      // Player gravity
      const timeDelta = (Date.now() - vectorChangeRef.current) / 1000;
      if (isSpaceDown.current) {
        playerVectorRef.current -= timeDelta;
      } else {
        playerVectorRef.current += timeDelta;
      }
      playerYRef.current += playerVectorRef.current;

      // Collision detection
      const wallAtPlayer = wallsRef.current[PLAYER_WALL_INDEX];
      const playerHitFloor =
        playerYRef.current + PLAYER_SIZE > height - wallAtPlayer;
      const playerHitCeiling = playerYRef.current - PLAYER_SIZE < wallAtPlayer;
      if (playerHitFloor || playerHitCeiling) {
        gameStateRef.current = "over";
      }
    }
  }, [PLAYER_WALL_INDEX]);

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

      // Floor
      context.beginPath();
      context.fillStyle = "#44aaaa";
      const wallWidth = width / WALL_COUNT;
      for (let [index, wall] of wallsRef.current.entries()) {
        context.rect(index * wallWidth, 0, wallWidth, wall);
        context.rect(index * wallWidth, height - wall, wallWidth, wall);
      }
      context.fill();
      context.closePath();

      // Player
      context.fillStyle = "#4444aa";
      context.beginPath();
      context.arc(PLAYER_X, playerYRef.current, PLAYER_SIZE, 0, 2 * Math.PI);
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
      <canvas
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="game"
        ref={canvasRef}
      />
    </div>
  );
}

export default App;
