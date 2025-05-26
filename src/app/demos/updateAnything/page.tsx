'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Draggable);
gsap.registerPlugin(useGSAP);

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grabberRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const partsRef = useRef<any[]>([]);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ts, setTs] = useState(1);

  // GSAP animations and Draggable
  useGSAP(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let cw = (canvas.width = window.innerWidth);
    let ch = (canvas.height = window.innerHeight);

    const parts = Array(333);
    partsRef.current = parts;

    const img = new Image(124, 124);
    img.src = 'https://assets.codepen.io/16327/flair-11.png';
    imgRef.current = img;

    img.onload = () => {
      const xDist = 50;
      const yDist = 99;
      const freq = 4;

      for (let i = 0; i < parts.length; i++) {
        parts[i] = {
          x: -xDist,
          y: gsap.utils.interpolate(-yDist, yDist, i / parts.length),
        };

        parts[i].tween = gsap
          .to(parts[i], {
            duration: 1.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            x: xDist,
          })
          .progress((i / parts.length) * freq);
      }
    };

    gsap.ticker.add(() => {
      if (!imgRef.current) return;

      ctx.clearRect(0, 0, cw, ch);
      parts.forEach((pt) => {
        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.drawImage(
          imgRef.current!,
          -imgRef.current!.width / 2 + pt.x,
          -imgRef.current!.height / 2 + pt.y,
          imgRef.current!.width,
          imgRef.current!.height
        );
        ctx.restore();
      });
    });

    window.addEventListener('resize', () => {
      cw = canvas.width = window.innerWidth;
      ch = canvas.height = window.innerHeight;
    });

    // Set initial position to center (1.0)
    gsap.set(grabberRef.current!, {
      x: 0,
      innerHTML: "1.0"
    });

    Draggable.create(grabberRef.current!, {
      type: 'x',
      bounds: sliderRef.current!,
      onDrag: function () {
        const newTs = gsap.utils.mapRange(-135, 135, 0, 2, this.x);
        setTs(newTs);
        gsap.to(grabberRef.current!, {
          duration: 0.3,
          innerHTML: newTs.toFixed(1),
        });
        parts.forEach((pt) => gsap.to(pt.tween, { duration: 0.3, timeScale: newTs }));
      },
    });
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0e100f] overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

      <div
        ref={sliderRef}
        className="absolute w-[300px] h-[5px] bg-[#555] rounded-md left-1/2 top-1/2 translate-x-[-50%] translate-y-[200px]"
      >
        <div
          ref={grabberRef}
          className="absolute w-9 h-9 bg-[#999] rounded-md text-[#0e100f] flex items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] select-none"
        >
          1.0
        </div>
      </div>
    </div>
  );
}
