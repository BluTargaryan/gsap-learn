'use client'; // Required in Next.js app router for client-side interactivity

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function KnobControl() {
  const knobRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    // Initialize draggable rotation
    Draggable.create(knobRef.current, {
      type: 'rotation',
      inertia: true, // Lower resistance for smoother spin
      onDrag: function () {
        console.log(this.rotation);
      },
    });
  });

  const handleRotationCheck = () => {
    if (!knobRef.current) return;
    console.log(gsap.getProperty(knobRef.current, 'rotation'), 'from element');
    console.log(Draggable.get(knobRef.current)?.rotation, 'from the Draggable');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <button
        onClick={handleRotationCheck}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        console.log() rotation
      </button>
      <img
        ref={knobRef}
        src="https://assets.codepen.io/16327/knob_Base.png"
        width={410}
        height={410}
        alt="Knob"
        className="select-none"
      />
    </div>
  );
}