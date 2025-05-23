'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Draggable, Physics2DPlugin);

export default function ExplodingDot() {
  const emitterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const explosionRef = useRef<gsap.core.Timeline | null>(null);

  const emitterSize = 100;
  const dotQuantity = 30;
  const dotSizeMax = 30;
  const dotSizeMin = 10;
  const speed = 1;
  const gravity = 1;

  useGSAP(() => {
    const emitter = emitterRef.current!;
    const container = document.createElement('div');
    container.style.cssText =
      'position:absolute; left:0; top:0; overflow:visible; z-index:5000; pointer-events:none;';
    document.body.appendChild(container);
    containerRef.current = container;

    gsap.set(emitter, {
      width: emitterSize,
      height: emitterSize,
      xPercent: -50,
      yPercent: -50,
    });

    const explosion = gsap.timeline({ paused: true });

    for (let i = 0; i < dotQuantity; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      const size = getRandom(dotSizeMin, dotSizeMax);
      container.appendChild(dot);

      const angle = Math.random() * Math.PI * 2;
      const length = Math.random() * (emitterSize / 2 - size / 2);

      gsap.set(dot, {
        x: Math.cos(angle) * length,
        y: Math.sin(angle) * length,
        width: size,
        height: size,
        xPercent: -50,
        yPercent: -50,
        background: '#0ae448',
        borderRadius: '50%',
        position: 'absolute',
        force3D: true,
      });

      explosion.to(
        dot,
        {
          physics2D: {
            angle: (angle * 180) / Math.PI,
            velocity: 100 + Math.random() * 250 * speed,
            gravity: 500 * gravity,
          },
          duration: 1 + Math.random(),
        },
        0
      ).to(
        dot,
        {
          opacity: 0,
          duration: 0.4,
        },
        0.7
      );
    }

    explosionRef.current = explosion;

    function explode(el: HTMLElement) {
      const bounds = el.getBoundingClientRect();
      gsap.set(container, {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      });
      explosion.play(0);
    }

    explode(emitter);

    emitter.addEventListener('click', () => explode(emitter));

    Draggable.create(emitter, {
      inertia: true,
      bounds: window,
      edgeResistance: 0.7,
    });

    return () => {
      container.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0e100f] overflow-hidden">
      <div
        id="emitter"
        ref={emitterRef}
        className="absolute border-2 border-dashed border-white rounded-full cursor-pointer"
        style={{
          width: emitterSize,
          height: emitterSize,
          top: '50%',
          left: '50%',
        }}
      />
      <div
        id="instructions"
        className="fixed top-2 w-full text-center text-gray-400 font-sans"
      >
        Click the dot. Dragging works too.
      </div>
    </div>
  );
}

function getRandom(min: number, max: number) {
  return min + Math.random() * (max - min);
}
