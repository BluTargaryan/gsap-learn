'use client'

import React, { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react"; // your custom GSAP hook

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function FlairDemo() {
  const containerRef = useRef(null);
  const flair1Ref = useRef(null);
  const flair3bRef = useRef(null);
  const flair4bRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Draggable flair--1: draggable horizontally within container bounds
    Draggable.create(flair1Ref.current, {
      type: "x",
      bounds: containerRef.current,
    });

    // Draggable flair--3b: rotation with inertia
    Draggable.create(flair3bRef.current, {
      type: "rotation",
      inertia: true,
    });

    // Draggable flair--4b: draggable anywhere within container, with inertia
    Draggable.create(flair4bRef.current, {
      bounds: containerRef.current,
      inertia: true,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex m-auto items-center justify-around w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] rounded-lg border border-gray-300"
      style={{ touchAction: "none" }} // helps with better drag support on mobile
    >
      <div className="wrapper">
        <div
          ref={flair1Ref}
          className="flair w-[70px] h-[70px] max-h-[15vh] max-w-[15vh] bg-blue-400 cursor-pointer"
        />
      </div>

      <div className="wrapper">
        <div
          ref={flair3bRef}
          className="flair flair--3b w-[70px] h-[70px] max-h-[15vh] max-w-[15vh] cursor-pointer bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage: "url(https://assets.codepen.io/16327/ui-flair-2.png)",
          }}
        />
      </div>

      <div className="wrapper">
        <div
          ref={flair4bRef}
          className="flair flair--4b w-[70px] h-[70px] max-h-[15vh] max-w-[15vh] cursor-pointer bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage: "url(https://assets.codepen.io/16327/ui-flair-4.png)",
          }}
        />
      </div>

      <h4 className="absolute w-full left-0 right-0 bottom-4 text-center pointer-events-none text-white">
        Spin us, Drag us...
      </h4>
    </div>
  );
}
