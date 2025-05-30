'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin();
import gsap from 'gsap';

const RADIUS = 100;
const STROKE = 12;
const HANDLE_RADIUS = 28;
const PADDING = 32;
const CENTER = RADIUS + PADDING;
const SVG_SIZE = (RADIUS + HANDLE_RADIUS + PADDING) * 2;
const CIRCUM = 2 * Math.PI * RADIUS;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

function angleFromCoords(x: number, y: number, cx: number, cy: number) {
  const dx = x - cx;
  const dy = y - cy;
  let theta = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (theta < 0) theta += 360;
  return theta;
}

export default function RadialTimePicker() {
  const [minutes, setMinutes] = useState(825); // 13:45
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const handleRef = useRef<SVGCircleElement>(null);

  // Animate arc and handle on minutes change
  useGSAP(() => {
    const progress = minutes / 1440;
    gsap.to('.arc-progress', {
      strokeDashoffset: CIRCUM * (1 - progress),
      duration: 0.4,
      ease: 'power2.out',
    });
    if (handleRef.current) {
      const angle = (minutes / 1440) * 360;
      const { x, y } = polarToCartesian(CENTER, CENTER, RADIUS, angle);
      gsap.to(handleRef.current, {
        cx: x,
        cy: y,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [minutes]);

  // Drag logic
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let angle = angleFromCoords(x, y, CENTER, CENTER);
    let mins = Math.round((angle / 360) * 1440);
    if (mins < 0) mins += 1440;
    setMinutes(mins);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Time formatting
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  const timeStr = `${hours}:${mins}`;

  // Arc positions
  const progress = minutes / 1440;
  const arcOffset = CIRCUM * (1 - progress);
  const handleAngle = progress * 360;
  const handlePos = polarToCartesian(CENTER, CENTER, RADIUS, handleAngle);

  // Day/Night logic: night if between moon (90°) and cloud-sun (270°), else day
  const isNight = handleAngle >= 90 && handleAngle < 270;

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${isNight ? 'bg-black' : 'bg-gray-100'}`}>
      <svg
        ref={svgRef}
        width={SVG_SIZE}
        height={SVG_SIZE}
        className="block"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Background arc */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <circle
          className="arc-progress"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="#FFD600"
          strokeWidth={STROKE}
          strokeDasharray={CIRCUM}
          strokeDashoffset={arcOffset}
          strokeLinecap="round"
          style={{ transition: dragging ? 'none' : 'stroke-dashoffset 0.4s' }}
        />
        {/* Cloud-sun icon (left) */}
        <g transform={`translate(${CENTER - RADIUS},${CENTER})`}>
          <circle r="24" fill="#fff" stroke="#e5e7eb" strokeWidth="3" />
          <svg x="-16" y="-16" width="32" height="32" viewBox="0 0 640 512">
            <path fill="#FFD600" d="M575.2 325.7c.2-1.9.8-3.7.8-5.6 0-35.3-28.7-64-64-64-12.6 0-24.2 3.8-34.1 10-17.6-38.8-56.5-66-101.9-66-61.8 0-112 50.1-112 112 0 3 .7 5.8.9 8.7-49.6 3.7-88.9 44.7-88.9 95.3 0 53 43 96 96 96h272c53 0 96-43 96-96 0-42.1-27.2-77.4-64.8-90.4zm-430.4-22.6c-43.7-43.7-43.7-114.7 0-158.3 43.7-43.7 114.7-43.7 158.4 0 9.7 9.7 16.9 20.9 22.3 32.7 9.8-3.7 20.1-6 30.7-7.5L386 81.1c4-11.9-7.3-23.1-19.2-19.2L279 91.2 237.5 8.4C232-2.8 216-2.8 210.4 8.4L169 91.2 81.1 61.9C69.3 58 58 69.3 61.9 81.1l29.3 87.8-82.8 41.5c-11.2 5.6-11.2 21.5 0 27.1l82.8 41.4-29.3 87.8c-4 11.9 7.3 23.1 19.2 19.2l76.1-25.3c6.1-12.4 14-23.7 23.6-33.5-13.1-5.4-25.4-13.4-36-24zm-4.8-79.2c0 40.8 29.3 74.8 67.9 82.3 8-4.7 16.3-8.8 25.2-11.7 5.4-44.3 31-82.5 67.4-105C287.3 160.4 258 140 224 140c-46.3 0-84 37.6-84 83.9z" />
          </svg>
        </g>
        {/* Moon icon (right) */}
        <g transform={`translate(${CENTER + RADIUS},${CENTER})`}>
          <circle r="24" fill="#fff" stroke="#e5e7eb" strokeWidth="3" />
          <svg x="-16" y="-16" width="32" height="32" viewBox="0 0 576 512">
            <path fill="#bdbdbd" d="M342.8 352.7c5.7-9.6 9.2-20.7 9.2-32.7 0-35.3-28.7-64-64-64-17.2 0-32.8 6.9-44.3 17.9-16.3-29.6-47.5-49.9-83.7-49.9-53 0-96 43-96 96 0 2 .5 3.8.6 5.7C27.1 338.8 0 374.1 0 416c0 53 43 96 96 96h240c44.2 0 80-35.8 80-80 0-41.9-32.3-75.8-73.2-79.3zm222.5-54.3c-93.1 17.7-178.5-53.7-178.5-147.7 0-54.2 29-104 76.1-130.8 7.3-4.1 5.4-15.1-2.8-16.7C448.4 1.1 436.7 0 425 0 319.1 0 233.1 85.9 233.1 192c0 8.5.7 16.8 1.8 25 5.9 4.3 11.6 8.9 16.7 14.2 11.4-4.7 23.7-7.2 36.4-7.2 52.9 0 96 43.1 96 96 0 3.6-.2 7.2-.6 10.7 23.6 10.8 42.4 29.5 53.5 52.6 54.4-3.4 103.7-29.3 137.1-70.4 5.3-6.5-.5-16.1-8.7-14.5z" />
          </svg>
        </g>
        {/* Sun or Moon handle (draggable) */}
        <g>
          <circle
            ref={handleRef}
            cx={handlePos.x}
            cy={handlePos.y}
            r={HANDLE_RADIUS}
            fill="#fff"
            stroke={isNight ? '#bdbdbd' : '#FFD600'}
            strokeWidth="4"
            style={{ cursor: 'pointer' }}
            onPointerDown={onPointerDown}
          />
          {isNight ? (
            // Moon SVG
            <svg
              x={handlePos.x - 16}
              y={handlePos.y - 16}
              width="32"
              height="32"
              viewBox="0 0 512 512"
              style={{ pointerEvents: 'none', position: 'absolute' }}
            >
              <path fill="#bdbdbd" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z" />
            </svg>
          ) : (
            // Sun SVG
            <svg
              x={handlePos.x - 16}
              y={handlePos.y - 16}
              width="32"
              height="32"
              viewBox="0 0 512 512"
              style={{ pointerEvents: 'none', position: 'absolute' }}
            >
              <path fill="#FFD600" d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z" />
            </svg>
          )}
        </g>
        {/* Center digital time */}
        <text
          x={CENTER}
          y={CENTER + 24}
          textAnchor="middle"
          fontSize="56"
          fontWeight="bold"
          fill={isNight ? '#fff' : '#111'}
          style={{ fontFamily: 'sans-serif', userSelect: 'none' }}
        >
          {timeStr}
        </text>
      </svg>
    </div>
  );
}
