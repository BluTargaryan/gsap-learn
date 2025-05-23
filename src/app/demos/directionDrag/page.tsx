'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function DirectionDraggable() {
  useEffect(() => {
    const directionStart = document.getElementById("directionStart")!;
    const directionVelocity = document.getElementById("directionVelocity")!;
    const directionObject = document.getElementById("directionObject")!;
    const original = document.getElementById("original")!;
    const logoElement = document.getElementById("logoElement")!;

    Draggable.create("#box1", {
      bounds: "#container",
      edgeResistance: 0.65,
      inertia: true,
      autoScroll: 1,
      onDrag: updateDirections,
      onThrowUpdate: updateDirections,
      onThrowComplete: function () {
        // Animate original marker to end position
        gsap.to(original, { duration: 1, x: this.x, y: this.y });
      }
    });

    function updateDirections(this: any) {
      directionStart.innerText = `"${this.getDirection("start")}"`;
      directionVelocity.innerText = `"${this.getDirection("velocity")}"`;
      directionObject.innerText = `"${this.getDirection(logoElement)}"`;
    }

    gsap.set(logoElement, { xPercent: -50, yPercent: -50 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
      <h1 className="text-2xl font-light mb-2">Draggable with direction sensing</h1>

      <div className="text-lg font-mono my-2">
        this.getDirection(<strong className="text-orange-500">"start"</strong>):{' '}
        <span id="directionStart" className="text-lime-400 font-normal">-</span>
      </div>
      <div className="text-lg font-mono my-2">
        this.getDirection(<strong className="text-orange-500">"velocity"</strong>):{' '}
        <span id="directionVelocity" className="text-lime-400 font-normal">-</span>
      </div>
      <div className="text-lg font-mono my-2">
        this.getDirection(<strong className="text-orange-500">logoElement</strong>):{' '}
        <span id="directionObject" className="text-lime-400 font-normal">-</span>
      </div>

      <div
        id="container"
        className="relative w-[90%] h-[440px] border-2 border-dashed border-white rounded-lg mt-4"
      >
        <img
          src="https://assets.codepen.io/16327/gsap-logo-green.svg"
          id="logoElement"
          width="150"
          className="absolute left-1/2 top-1/2"
        />
        <div
          id="original"
          className="absolute top-0 w-[196px] h-[100px] text-center leading-[100px] text-white border-2 border-white rounded-lg"
        >
          Start position
        </div>
        <div
          id="box1"
          className="absolute top-0 w-[196px] h-[100px] text-center leading-[100px] text-black text-lg rounded-lg bg-gradient-to-br from-green-300 to-green-600"
        >
          Drag me
        </div>
      </div>
    </div>
  );
}
