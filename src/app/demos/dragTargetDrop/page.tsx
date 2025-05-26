"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

export default function dragTargetDrop() {
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    Draggable.create(boxRefs.current, {
      bounds: window,
      onDrag: function () {
        if (this.hitTest(dropAreaRef.current, "99%")) {
          this.target.classList.add("outline-dashed", "outline-4", "outline-orange-500");
        } else {
          this.target.classList.remove("outline-dashed", "outline-4", "outline-orange-500");
        }
      },
      onDragEnd: function () {
        if (!this.target.classList.contains("outline-dashed")) {
          gsap.to(this.target, { duration: 0.2, x: 0, y: 0 });
        }
      },
    });
  }, { dependencies: [] });

  const boxColors = [
    "from-green-500 to-green-700",
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-2xl font-bold mb-2">Draggable: Drop on target only</h1>
      <p className="max-w-xl mb-6">
        The boxes below can only be dragged and dropped on Drop Area. If boxes are dropped and do not
        overlap the drop area entirely they will return to starting position. When boxes are eligible
        to be dropped in Drop Area their border will be highlighted.
      </p>

      <div className="flex flex-wrap justify-center items-start gap-4">
        <div className="relative space-y-4">
          {boxColors.map((colorClass, i) => (
            <div
              key={i}
              ref={(el) => {
                boxRefs.current[i] = el;
              }}
              className={`w-[200px] h-[80px] rounded-lg border-2 border-black text-white text-xl font-semibold leading-[80px] text-center bg-gradient-to-r ${colorClass} cursor-grab`}
            >
              box{i + 1}
            </div>
          ))}
        </div>

        <div
          ref={dropAreaRef}
          className="w-[60vw] h-[30vh] border-2 border-dashed border-white rounded-lg flex items-center justify-center p-4 bg-gray-800 text-white"
        >
          Drop Area
        </div>
      </div>
    </div>
  );
}
