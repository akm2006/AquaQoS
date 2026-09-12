"use client";

import { useEffect, useRef, useState } from "react";

// Decorative digit scramble on first view that settles left to right. The static HTML and
// the screen-reader text always carry the real value (the template rendered zeros instead).
export function Scramble({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const frames = 18;
      let frame = 0;
      timer = window.setInterval(() => {
        frame++;
        if (frame >= frames) {
          window.clearInterval(timer);
          setDisplay(value);
          return;
        }
        const settled = Math.floor((frame / frames) * value.length);
        setDisplay(
          value.replace(/\d/g, (digit, i: number) =>
            i < settled ? digit : String(Math.floor(Math.random() * 10)),
          ),
        );
      }, 50);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [value]);
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
