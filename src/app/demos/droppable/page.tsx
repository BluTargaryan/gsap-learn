'use client'

import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';

const Droppable = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const droppablesRef = useRef<HTMLElement[]>([]);
  const overlapThreshold = "50%";

  function onDrop(dragged: HTMLElement, dropped: HTMLElement) {
    gsap.fromTo(dropped, {opacity:1}, {duration: 0.1, opacity:0, repeat:3, yoyo:true});
  }

  useGSAP(() => {
    gsap.registerPlugin(Draggable, InertiaPlugin);

    if(containerRef.current) {
      droppablesRef.current = Array.from(containerRef.current.querySelectorAll('.box'));
    }

    Draggable.create(droppablesRef.current, {
      bounds: containerRef.current,
      onDrag: function() {
        droppablesRef.current.forEach(droppable => {
          if (this.hitTest(droppable, overlapThreshold)) {
            droppable.classList.add("highlight");
          } else {
            droppable.classList.remove("highlight");
          }
        });
      },
      onDragEnd: function() {
        droppablesRef.current.forEach(droppable => {
          if (this.hitTest(droppable, overlapThreshold)) {
            onDrop(this.target, droppable);
          }
        });
      }
    });
  });

  const boxStyle = 'w-52 h-20 text-center leading-[80px] text-xl text-black rounded box'  
  return (
    <div ref={containerRef}  className='droppable flex items-center justify-center min-h-screen flex-col p-1'>
      <style jsx global>{`
        .highlight {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
          transform: scale(1.05);
          transition: all 0.2s ease;
        }
      `}</style>
      <h1 className='text-center'>Draggable with "droppable" logic</h1>
      <p className='w-[80vw]'>Drag the boxes around. We'll run <code>hitTest()</code> logic inside an <code>onDrag</code>, highlighting "droppable" elements but only when at least 50% of their surface area overlaps (you can change the <code>overlapThreshold</code> variable to whatever you want). Then, in an <code>onDragEnd</code>, we'll do the same and make any intersecting "droppable" elements flash. Read the comments in the code to find out how to test for the mouse/touch overlapping an element instead.</p>
      <div className='relative flex items-center justify-around gap-1 mt-2'>
        <div id="box1" className={`${boxStyle} bg-gradient-to-r from-pink-500 to-purple-500`}>box1</div>
        <div id="box2" className={`${boxStyle} bg-gradient-to-r from-blue-500 to-cyan-500`}>box2</div>
        <div id="box3" className={`${boxStyle} bg-gradient-to-r from-green-500 to-emerald-500`}>box3</div>
      </div>
    </div>
  )
}

export default Droppable
