"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

export default function DialSpinner() {
  const logRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<SVGGElement>(null);

  useGSAP(() => {
    const rotationOffset = 90;
    const RAD2DEG = 180 / Math.PI;
    const log = logRef.current;
    const spinner = spinnerRef.current;
    if (!log || !spinner) return;

    gsap.set(spinner, { transformOrigin: "center center" });

    const draggable = Draggable.create(spinner, {
      type: "rotation",
      onPressInit: function (e) {
        if (!this.rotationOrigin) return;

        let rotation =
          Math.atan2(
            this.pointerY - this.rotationOrigin.y,
            this.pointerX - this.rotationOrigin.x
          ) *
            RAD2DEG +
          rotationOffset;

        if (rotation < 0) {
          rotation += 360;
        } else if (rotation > 270) {
          rotation -= 360;
        }

        gsap.set(this.target, { rotation });
      },
      onPress: updateRotation,
      onDrag: updateRotation,
    })[0];

    draggable.startDrag(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
    draggable.endDrag(new MouseEvent('mouseup', { clientX: 0, clientY: 0 }));

    function updateRotation(this: { rotation: number }) {
      if (log) {
        log.innerText = this.rotation.toFixed(1);
      }
    }
  }, { dependencies: [] });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div
        ref={logRef}
        className="text-2xl font-mono mb-6 text-center"
      >
        0
      </div>

      <svg
        viewBox="0 0 400 400"
        className="w-[80%] max-w-[400px] h-auto touch-none"
      >
        <defs>
          <linearGradient
            id="grad-1"
            x1="0"
            y1="0"
            x2="400"
            y2="400"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.2" stopColor="#00bae2" />
            <stop offset="0.8" stopColor="#fec5fb" />
          </linearGradient>
        </defs>

        <g ref={spinnerRef} id="spinner" className="cursor-pointer">
          <circle
            className="big-circle"
            cx="200"
            cy="200"
            r="150"
            fill="url(#grad-1)"
            stroke="#0e100f"
            strokeWidth="6"
          />
          <circle
            className="small-circle"
            cx="200"
            cy="200"
            r="12"
            fill="#0e100f"
          />
          <polyline
            className="line"
            points="200,200 200,50"
            fill="none"
            stroke="#0e100f"
            strokeWidth="6"
          />
        </g>
      </svg>
    </div>
  );
}
