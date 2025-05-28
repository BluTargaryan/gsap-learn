'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function RotatingCircle() {
  const circleRef = useRef<HTMLDivElement>(null);
  const spin = useRef<GSAPTimeline | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useGSAP(() => {
    if (!circleRef.current) return;

    const circle = circleRef.current;
    const imageURLs = [
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/16327/flair-36.png",
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/16327/flair-25.png",
      "https://s3-us-west-2.amazonaws.com/s.cdpn.io/16327/flair-24.png"
    ];

    // Clear old images if any
    circle.querySelectorAll('img').forEach(img => img.remove());
    imagesRef.current = [];

    // Place images evenly around the circle
    function placeImages(urls: string[]) {
      const angleIncrement = (Math.PI * 2) / urls.length;
      const radius = circle.offsetWidth / 2;
      const imgs: HTMLImageElement[] = [];

      for (let i = 0; i < urls.length; i++) {
        const img = new Image();
        imgs.push(img);
        circle.appendChild(img);
        const angle = angleIncrement * i;

        gsap.set(img, {
          attr: { src: urls[i] },
          position: "absolute",
          top: 0,
          left: 0,
          xPercent: -50,
          yPercent: -50,
          width: 72,
          height: 72,
          transformOrigin: "50% 50%",
          x: radius + Math.cos(angle) * radius,
          y: radius + Math.sin(angle) * radius,
        });
      }
      return imgs;
    }

    imagesRef.current = placeImages(imageURLs);

    // Create infinite spin timeline
    spin.current = gsap.timeline({ repeat: -1, defaults: { duration: 50, ease: "none" } });
    spin.current.to(circle, { rotation: 360 })
      .to(imagesRef.current, { rotation: -360 }, 0);

    // Setup Draggable
    Draggable.create(circle, {
      type: "rotation",
      inertia: true,
      onPressInit() {
        spin.current?.pause();
      },
      onDrag() {
        // Normalize rotation between 0-360 and set timeline progress
        const angle = (this.rotation + 360 * 100000) % 360;
        spin.current?.progress(angle / 360);
      },
      onThrowUpdate() {
        const angle = (this.rotation + 360 * 100000) % 360;
        spin.current?.progress(angle / 360);
      },
      onThrowComplete() {
        spin.current?.resume();
        gsap.fromTo(spin.current, { timeScale: 0 }, { duration: 1, timeScale: 1, ease: "power1.in" });
      }
    });

    return () => {
      spin.current?.kill();
      imagesRef.current.forEach(img => img.remove());
      Draggable.get(circle)?.kill();
    };
  }, []);

  return (
    <div className="viewport-box w-full min-w-[400px] h-screen flex items-center justify-center">
      <div
        ref={circleRef}
        className="main-circle w-[400px] h-[400px] border-2 border-[#fffce1] rounded-full relative"
      />
    </div>
  );
}
