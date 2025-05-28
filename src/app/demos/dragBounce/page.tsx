'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function BounceBall() {
  const ballRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (!ballRef.current) return;

    const friction = -0.5;
    const ball = ballRef.current;
    const ballProps = gsap.getProperty(ball);
    const radius = ball.getBoundingClientRect().width / 2;
    const tracker = InertiaPlugin.track(ball, 'x,y')[0];

    let vw = window.innerWidth;
    let vh = window.innerHeight;

    gsap.defaults({ overwrite: true });

    gsap.set(ball, {
      xPercent: -50,
      yPercent: -50,
      x: vw / 2,
      y: vh / 2,
    });

    const updateViewport = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
    };
    window.addEventListener('resize', updateViewport);

    const animateBounce = (
      x: number | string = '+=0',
      y: number | string = '+=0',
      vx: number | string = 'auto',
      vy: number | string = 'auto'
    ) => {
      gsap.fromTo(
        ball,
        { x, y },
        {
          inertia: { x: vx, y: vy },
          onUpdate: checkBounds,
        }
      );
    };

    function checkBounds() {
      const x = ballProps('x') as number;
      const y = ballProps('y') as number;
      let vx = tracker.get('x');
      let vy = tracker.get('y');

      let xPos = x;
      let yPos = y;
      let hitting = false;

      if (x + radius > vw) {
        xPos = vw - radius;
        vx *= friction;
        hitting = true;
      } else if (x - radius < 0) {
        xPos = radius;
        vx *= friction;
        hitting = true;
      }

      if (y + radius > vh) {
        yPos = vh - radius;
        vy *= friction;
        hitting = true;
      } else if (y - radius < 0) {
        yPos = radius;
        vy *= friction;
        hitting = true;
      }

      if (hitting) {
        animateBounce(xPos, yPos, vx, vy);
      }
    }

    Draggable.create(ball, {
      bounds: window,
      onPress() {
        gsap.killTweensOf(ball);
        this.update();
      },
      onDragEnd: animateBounce,
      onDragEndParams: [],
    });

    return () => {
      window.removeEventListener('resize', updateViewport);
      gsap.killTweensOf(ball);
    };
  }, []);

  return (
    <main className="bg-[#0e100f] overflow-hidden min-h-screen w-full relative">
      <img
        ref={ballRef}
        className="absolute w-[125px] h-[125px] rounded-full"
        src="https://assets.codepen.io/16327/circle.png"
        alt="ball"
      />
    </main>
  );
}
