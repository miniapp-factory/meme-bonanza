"use client";
import { useEffect, useRef, useState } from "react";

const BOX_SIZE = 50;
const SPIKE_SIZE = 20;
const MOVE_STEP = 4;
const SPAWN_INTERVAL = 1500; // ms
const SPIKE_LIFETIME = 2000; // ms

type Spike = {
  id: number;
  x: number;
  y: number;
  collided: boolean;
};

export function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boxPos, setBoxPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState(0); // 0:right,1:down,2:left,3:up
  const [spikes, setSpikes] = useState<Spike[]>([]);
  const [score, setScore] = useState(0);
  const spikeIdRef = useRef(0);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setBoxPos((prev) => {
        let { x, y } = prev;
        switch (direction) {
          case 0:
            x += MOVE_STEP;
            if (x + BOX_SIZE >= window.innerWidth) {
              x = window.innerWidth - BOX_SIZE;
              setDirection(1);
            }
            break;
          case 1:
            y += MOVE_STEP;
            if (y + BOX_SIZE >= window.innerHeight) {
              y = window.innerHeight - BOX_SIZE;
              setDirection(2);
            }
            break;
          case 2:
            x -= MOVE_STEP;
            if (x <= 0) {
              x = 0;
              setDirection(3);
            }
            break;
          case 3:
            y -= MOVE_STEP;
            if (y <= 0) {
              y = 0;
              setDirection(0);
            }
            break;
        }
        return { x, y };
      });
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [direction]);

  // Handle jump
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setBoxPos((prev) => ({
          ...prev,
          y: Math.max(0, prev.y - 100),
        }));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Spawn spikes
  useEffect(() => {
    const spawn = () => {
      const id = spikeIdRef.current++;
      const side = Math.floor(Math.random() * 4);
      let x = 0,
        y = 0;
      switch (side) {
        case 0: // top
          x = Math.random() * (window.innerWidth - SPIKE_SIZE);
          y = 0;
          break;
        case 1: // right
          x = window.innerWidth - SPIKE_SIZE;
          y = Math.random() * (window.innerHeight - SPIKE_SIZE);
          break;
        case 2: // bottom
          x = Math.random() * (window.innerWidth - SPIKE_SIZE);
          y = window.innerHeight - SPIKE_SIZE;
          break;
        case 3: // left
          x = 0;
          y = Math.random() * (window.innerHeight - SPIKE_SIZE);
          break;
      }
      const newSpike: Spike = { id, x, y, collided: false };
      setSpikes((prev) => [...prev, newSpike]);

      // Remove after lifetime
      setTimeout(() => {
        setSpikes((prev) => prev.filter((s) => s.id !== id));
        setScore((s) => s + 1);
      }, SPIKE_LIFETIME);
    };
    const interval = setInterval(spawn, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Collision detection
  useEffect(() => {
    const check = () => {
      setSpikes((prev) =>
        prev.map((s) => {
          if (
            s.x < boxPos.x + BOX_SIZE &&
            s.x + SPIKE_SIZE > boxPos.x &&
            s.y < boxPos.y + BOX_SIZE &&
            s.y + SPIKE_SIZE > boxPos.y
          ) {
            // Collision: reset score
            setScore(0);
            return { ...s, collided: true };
          }
          return s;
        })
      );
    };
    const interval = setInterval(check, 50);
    return () => clearInterval(interval);
  }, [boxPos]);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
    >
      <div
        className="absolute bg-white"
        style={{
          width: BOX_SIZE,
          height: BOX_SIZE,
          left: boxPos.x,
          top: boxPos.y,
        }}
      />
      {spikes.map((s) => (
        <div
          key={s.id}
          className="absolute bg-red-600"
          style={{
            width: SPIKE_SIZE,
            height: SPIKE_SIZE,
            left: s.x,
            top: s.y,
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl text-white">{score}</span>
      </div>
    </div>
  );
}
