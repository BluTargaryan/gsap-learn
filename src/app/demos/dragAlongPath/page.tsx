'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Draggable);
gsap.registerPlugin(useGSAP);

export default function Home() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const DEG = 180 / Math.PI;
    const drag = dragRef.current;
    const path = pathRef.current;
    if (!path || !drag) return;
    const pathLength = path.getTotalLength();
    const startPoint = path.getPointAtLength(0);
    const nextPoint = path.getPointAtLength(1);
    const startAngle = getRotation(startPoint, nextPoint) * DEG;

    gsap.set(drag, {
      transformOrigin: 'center',
      rotation: startAngle,
      x: startPoint.x,
      y: startPoint.y,
    });

    Draggable.create(drag, {
      type: 'x,y',
      liveSnap: {
        points: (point: { x: number, y: number }) => {
          const { point: p, rotation } = closestPoint(path, pathLength, point);
          gsap.set(drag, { rotation });
          return { x: p.x, y: p.y };
        }
      },
    });
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#0e100f] overflow-hidden p-4">
      <svg
        ref={svgRef}
        viewBox="0 0 500 400"
        className="w-[90%] max-w-[600px]"
      >
        <defs>
          <linearGradient
            id="grad-1"
            x1="0"
            y1="0"
            x2="500"
            y2="400"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.2" stopColor="rgb(255, 135, 9)" />
            <stop offset="0.8" stopColor="rgb(247, 189, 248)" />
          </linearGradient>
        </defs>

        <path
          ref={pathRef}
          fill="none"
          stroke="url(#grad-1)"
          strokeWidth="4"
          d="M159 70c-50.386 35.428-74.284 72.547-71.691 111.355
             2.592 38.81 31.514 76.92 86.765 114.333L447.7 84.137l-9.812 263.996"
        />

        <g ref={dragRef}>
          <circle cx="0" cy="0" r="15" fill="rgb(255, 135, 9)" />
          <polygon points="-5,-5 10,0 -5,5" fill="#FFFCDC" />
        </g>
      </svg>
    </main>
  );
}

// Utility functions
function closestPoint(pathNode: SVGPathElement, pathLength: number, point: { x: number, y: number }) {
  const DEG = 180 / Math.PI;
  let precision = 8;
  let best: DOMPoint = pathNode.getPointAtLength(0);
  let bestLength: number = 0;
  let bestDistance = Infinity;

  const distance2 = (p: DOMPoint) => {
    const dx = p.x - point.x;
    const dy = p.y - point.y;
    return dx * dx + dy * dy;
  };

  for (let scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
    scan = pathNode.getPointAtLength(scanLength);
    scanDistance = distance2(scan);
    if (scanDistance < bestDistance) {
      best = scan;
      bestLength = scanLength;
      bestDistance = scanDistance;
    }
  }

  precision /= 2;
  while (precision > 0.5) {
    let beforeLength: number = bestLength - precision;
    let afterLength: number = bestLength + precision;
    let before: DOMPoint, after: DOMPoint;
    let beforeDistance: number, afterDistance: number;

    if (beforeLength >= 0) {
      before = pathNode.getPointAtLength(beforeLength);
      beforeDistance = distance2(before);
      if (beforeDistance < bestDistance) {
        best = before;
        bestLength = beforeLength;
        bestDistance = beforeDistance;
      }
    }

    if (afterLength <= pathLength) {
      after = pathNode.getPointAtLength(afterLength);
      afterDistance = distance2(after);
      if (afterDistance < bestDistance) {
        best = after;
        bestLength = afterLength;
        bestDistance = afterDistance;
      }
    }

    precision /= 2;
  }

  const len2 = bestLength + (bestLength === pathLength ? -0.1 : 0.1);
  const rotation = getRotation(best, pathNode.getPointAtLength(len2)) * DEG;

  return { point: best, rotation };
}

function getRotation(p1: { x: number, y: number }, p2: { x: number, y: number }) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}
