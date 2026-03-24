"use client";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export function FireConfetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#30D158", "#0A84FF", "#BF5AF2"]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#30D158", "#0A84FF", "#BF5AF2"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        onDone();
      }
    };
    frame();
  }, [onDone]);

  return <div className="fixed inset-0 pointer-events-none z-[999]" />;
}
