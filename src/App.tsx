import React, {useCallback, useEffect, useRef} from 'react';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef<number>(0);
  const previousFrameRef = useRef<number>(0);

  // Draw stuff
  const renderGame = useCallback(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) {
      return;
    }

    const { width, height } = context.canvas;

    context.fillStyle = '#222222';
    context.fillRect(0, 0, width, height);
  }, []);

  const animationFrame = useCallback(
    (time: number) => {
      const frameDelta = time - previousFrameRef.current;
      if (frameDelta >= 1000 / 60) {
        renderGame();
        previousFrameRef.current = time;
      }

      currentFrameRef.current = requestAnimationFrame(animationFrame);
    },
    [renderGame]
  );

  // Being rendering
  useEffect(() => {
    currentFrameRef.current = requestAnimationFrame(animationFrame);

    return () => {
      cancelAnimationFrame(currentFrameRef.current);
    };
  }, [animationFrame]);

  return (
    <div className="container">
      <canvas width={850} height={600} className="game" ref={canvasRef}>
      </canvas>
    </div>
  );
}

export default App;
