'use client'

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react"; // your custom hook replacing useEffect
import horizontalLoop from "@/app/utils/horizontalLoopFunc";

gsap.registerPlugin(Draggable, InertiaPlugin);

const colors = ["#0ae448", "#9d95ff", "#abff84", "#00bae2"];

interface LoopTimeline extends gsap.core.Timeline {
  next: (vars?: gsap.TweenVars) => gsap.core.Timeline;
  previous: (vars?: gsap.TweenVars) => gsap.core.Timeline;
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Timeline;
}

export default function Carousel() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<(HTMLDivElement | null)[]>([]);
  const loopRef = useRef<LoopTimeline | null>(null);
  const [overflowVisible, setOverflowVisible] = useState(false);

  useGSAP(() => {
    if (!wrapperRef.current) return;

    const boxes = boxesRef.current.filter((box): box is HTMLDivElement => box !== null);
    gsap.set(boxes, {
      backgroundColor: gsap.utils.wrap(colors),
    });

    let activeElement: HTMLElement | null = null;
    const loop = horizontalLoop(boxes, {
      paused: true,
      draggable: true,
      center: true,
      onChange: (element: Element, index: number) => {
        if (activeElement) activeElement.classList.remove("active");
        element.classList.add("active");
        activeElement = element as HTMLElement;
      },
    }) as LoopTimeline;
    loopRef.current = loop;

    boxes.forEach((box: HTMLElement, i: number) =>
      box.addEventListener("click", () => loop.toIndex(i, { duration: 0.8, ease: "power1.inOut" }))
    );

    return () => {
      // Cleanup event listeners on boxes
      boxes.forEach((box: HTMLElement, i: number) => {
        box.replaceWith(box.cloneNode(true)); // simple way to remove all listeners
      });
      loop.kill();
    };
  }, []);

  function toggleOverflow() {
    setOverflowVisible((v) => !v);
  }

  function next() {
    loopRef.current?.next({ duration: 0.4, ease: "power1.inOut" });
  }

  function prev() {
    loopRef.current?.previous({ duration: 0.4, ease: "power1.inOut" });
  }

  // horizontalLoop function (same as your original, wrapped here)
  // For brevity, I'll add a minimized comment here. You should include the entire
  // horizontalLoop function below (exact same as your original, just inside the component file or imported).
  // (I will attach it below after the component)

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-sans">
      <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
        <button onClick={prev} className="prev px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          prev
        </button>
        <button
          onClick={toggleOverflow}
          className="toggle px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        >
          toggle overflow
        </button>
        <button onClick={next} className="next px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
          next
        </button>
      </div>

      <div
        ref={wrapperRef}
        className={`relative flex items-center w-3/5 h-1/5 border-l-2 border-r-2 border-dashed border-gray-500 ${
          overflowVisible ? "overflow-visible" : "overflow-hidden"
        }`}
      >
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              boxesRef.current[i] = el;
            }}
            className="box flex items-center justify-center cursor-pointer text-black text-lg h-4/5 flex-shrink-0"
            style={{
              width: i === 3 ? "350px" : "20%",
              backgroundColor: "transparent", // will be set by GSAP dynamically
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

/* horizontalLoop function goes here exactly as you provided, just inside this file or imported from another */

