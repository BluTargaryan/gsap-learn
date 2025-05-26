'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function Home() {
  const container = useRef(null);
  const targetRef = useRef(null);
  const oneRef = useRef(null);
  const twoRef = useRef(null);
  const threeRef = useRef(null);

  useGSAP(() => {
    const follower = (el: HTMLElement, duration: number) => {
      const xTo = gsap.quickTo(el, 'x', { duration, ease: 'back' });
      const yTo = gsap.quickTo(el, 'y', { duration, ease: 'back' });
      return (x: number, y: number) => {
        xTo(x);
        yTo(y);
      };
    };

    const followers = [oneRef.current, twoRef.current, threeRef.current]
      .reverse()
      .map((el, i) => follower(el!, 0.25 + i * 0.1));

    Draggable.create(targetRef.current, {
      bounds: window,
      inertia: true,
      onDrag() {
        followers.forEach(f => f(this.x, this.y));
      },
      onThrowUpdate() {
        followers.forEach(f => f(this.x, this.y));
      },
    });
  }, []);

  return (
    <div
      ref={container}
      className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-900"
    >
      <div
        ref={threeRef}
        className="w-5 h-5 bg-green-400 rounded-sm"
      ></div>
      <div
        ref={twoRef}
        className="w-7 h-7 bg-green-400 rounded-sm"
      ></div>
      <div
        ref={oneRef}
        className="w-10 h-10 bg-green-400 rounded-sm"
      ></div>
      <div
        ref={targetRef}
        className="w-24 h-24 bg-green-500 rounded-sm grid place-content-center text-white font-semibold cursor-pointer"
      >
        DRAG
      </div>
    </div>
  );
}
