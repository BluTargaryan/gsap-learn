'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function Home() {
  const ballRef = useRef(null);

  useGSAP(() => {
    gsap.set('.needle', {
      transformOrigin: '99% 50%',
    });

    Draggable.create('.ball', {
      bounds: '.demo',
      type: 'x,y',
      inertia: true,
      onDragEnd: function () {
        const xVel = Math.abs(InertiaPlugin.getVelocity(this.target, 'x')) / 20;
        const yVel = Math.abs(InertiaPlugin.getVelocity(this.target, 'y')) / 20;

        gsap
          .timeline({
            defaults: {
              duration: this.tween.duration() / 2,
              ease: 'power1',
              yoyoEase: 'sine.inOut',
              repeat: 1,
            },
          })
          .fromTo(
            '.needle-x',
            { rotate: 0 },
            { rotate: gsap.utils.clamp(0, 180, xVel) }
          )
          .fromTo(
            '.needle-y',
            { rotate: 0 },
            { rotate: gsap.utils.clamp(0, 180, yVel) },
            0
          );
      },
    });
  }, []);

  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <div className="demo w-[90%] max-w-[800px] min-h-[400px] h-[74vh] border-2 border-dashed border-white relative mt-2.5 flex items-center justify-center rounded-lg">
        <div
          ref={ballRef}
          className="ball bg-gradient-to-br from-cyan-300 to-purple-400 text-black text-center w-[100px] h-[100px] leading-[100px] absolute rounded-full cursor-pointer"
        >
          throw me
        </div>
        <div className="meters absolute bottom-4 flex items-end justify-center flex-row w-[88%] max-w-[800px] h-[20vh] space-x-4">
          {['X Velocity', 'Y Velocity'].map((label, idx) => (
            <svg
              key={label}
              viewBox="0 0 100 50"
              fill="none"
              className="w-32 h-20"
            >
              <circle
                cx="50"
                cy="50"
                r="25"
                stroke="#fff"
                strokeDasharray="1 7"
                strokeWidth="3"
                strokeDashoffset="-1.2"
              />
              <path
                className={`needle ${idx === 0 ? 'needle-x' : 'needle-y'}`}
                stroke="#fff"
                strokeWidth="1.2"
                d="M33 47 L50 47"
              />
              <circle cx="50" cy="47" r="1.5" fill="#fff" />
              <text
                fill="#fff"
                fontSize="5"
                x="50"
                y="18"
                textAnchor="middle"
              >
                {label}
              </text>
            </svg>
          ))}
        </div>
      </div>
    </main>
  );
}
