'use client'

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const circle = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // use selectors...
      gsap.to(".box", { rotation: "+=360", duration: 3 });

      // or refs...
      gsap.to(circle.current, { rotation: "-=360", duration: 3 });
    },
    { scope: container }
  ); // <-- scope for selector text (optional)
  return (
    <div ref={container} className="container">
        <div className="box bg-blue-700">selector</div>
        <div className="circle bg-emerald-800" ref={circle}>
          Ref
        </div>
      </div>
  );
}
