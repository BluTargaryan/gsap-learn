'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function Home() {
  const boxRef = useRef(null);

  useGSAP(() => {
    Draggable.create('.box', {
      bounds: '.demo',
      inertia: true,
      onDrag: function () {
        if (!this.hitTest('.demo', '100%')) {
          console.log('hit the edge!');
        }
      },
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h3 className="my-1 text-white text-lg">Edge Detector</h3>
      <div className="demo relative w-[90%] max-w-[800px] h-[400px] mt-2.5 border-2 border-dashed border-white rounded-lg flex items-center justify-center">
        <div
          ref={boxRef}
          className="box absolute bg-gradient-to-br from-cyan-300 to-purple-400 w-[196px] h-[100px] leading-[100px] text-center text-black rounded-lg cursor-pointer"
        >
          throw me
        </div>
      </div>
    </main>
  );
}
