"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function EditableStar() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pointsRef = useRef([]);

  useGSAP(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const star = svg.querySelector("#star") as SVGPolygonElement;
    const markerLayer = svg.querySelector("#marker-layer") as SVGGElement;
    const handleLayer = svg.querySelector("#handle-layer") as SVGGElement;
    const markerDef = svg.querySelector("defs .marker") as SVGElement;
    const handleDef = svg.querySelector("defs .handle") as SVGElement;

    const points: { x: number, y: number }[] = [];
    const numPoints = star.points.numberOfItems;

    for (let i = 0; i < numPoints; i++) {
      const pt = star.points.getItem(i);
      points[i] = { x: pt.x, y: pt.y };
      createHandle(pt);
    }

    function createHandle(point: { x: number, y: number }) {
      const marker = createClone(markerDef, markerLayer, point);
      const handle = createClone(handleDef, handleLayer, point);

      const update = function(this: { x: number, y: number }) {
        point.x = this.x;
        point.y = this.y;
      };

      Draggable.create(handle as Element, {
        onDrag: update,
        onThrowUpdate: update,
        inertia: true,
        bounds: window,
        liveSnap: {
          points: points,
          radius: 15,
        },
      });
    }

    function createClone(node: SVGElement, parent: SVGElement, point: { x: number, y: number }) {
      const el = node.cloneNode(true) as SVGElement;
      parent.appendChild(el);
      gsap.set(el, { x: point.x, y: point.y });
      return el;
    }
  }, { dependencies: [] });

  return (
    <div className="fixed inset-0 bg-[#0e100f] text-[#7c7c6f] font-sans">
      <style jsx>{`
        .handle {
  fill: transparent;
  stroke-width: 4;
  stroke: white;
}

.marker {
  fill: #fec5fb;
  stroke: #fec5fb;
  pointer-events: none;
} 
      `}</style>
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="absolute top-[10%] left-[10%] w-[80%] h-[80%] overflow-visible"
      >
        <defs>
          <circle className="handle" r="10" />
          <circle className="marker" r="4" />
          <linearGradient id="grad-1" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0.2" stopColor="#00bae2" />
            <stop offset="0.8" stopColor="#fec5fb" />
          </linearGradient>
        </defs>

        <polygon
          id="star"
          stroke="url(#grad-1)"
          points="261,220 298,335 200,264 102,335 139,220 42,149 162,148 200,34 238,148 358,149"
          strokeWidth="20"
          strokeLinejoin="round"
          fill="none"
        />
        <g id="marker-layer" />
        <g id="handle-layer" />
      </svg>
    </div>
  );
}
