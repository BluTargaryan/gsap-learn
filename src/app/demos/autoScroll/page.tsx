'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(Draggable, ScrollToPlugin);

const GRID_WIDTH = 74;
const GRID_HEIGHT = 50;
const GRID_ROWS = 28;
const GRID_COLUMNS = 40;

export default function DraggableGridPage() {
  const snapRef = useRef<HTMLInputElement>(null);
  const liveSnapRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current!;
    const wrapper = wrapperRef.current!;
    const box = boxRef.current!;
    const snapCheckbox = snapRef.current!;
    const liveSnapCheckbox = liveSnapRef.current!;

    for (let i = 0; i < GRID_ROWS * GRID_COLUMNS; i++) {
      const y = Math.floor(i / GRID_COLUMNS) * GRID_HEIGHT;
      const x = (i * GRID_WIDTH) % (GRID_COLUMNS * GRID_WIDTH);
      const cell = document.createElement('div');
      cell.className = 'absolute border border-zinc-700';
      cell.style.width = `${GRID_WIDTH - 1}px`;
      cell.style.height = `${GRID_HEIGHT - 1}px`;
      cell.style.top = `${y}px`;
      cell.style.left = `${x}px`;
      container.prepend(cell);
    }

    gsap.set(container, {
      height: GRID_ROWS * GRID_HEIGHT + 1,
      width: GRID_COLUMNS * GRID_WIDTH + 1,
    });
    gsap.set(box, { width: 150, height: 100, lineHeight: '100px' });

    const updateDraggable = () => {
      const snap = snapCheckbox.checked;
      const liveSnap = liveSnapCheckbox.checked;

      Draggable.create(box, {
        bounds: container,
        autoScroll: 1,
        edgeResistance: 0.65,
        type: 'x,y',
        throwProps: true,
        liveSnap: liveSnap,

        onRelease: function () {
          this.tween?.progress(1);
          const tBounds = box.getBoundingClientRect();
          const wBounds = wrapper.getBoundingClientRect();
          let wCenter = wBounds.left + wBounds.width / 2;
          let tCenter = tBounds.left + tBounds.width / 2;
          const scroll: { x?: number; y?: number } = {};

          if (tBounds.right > wBounds.right || tBounds.left < wBounds.left) {
            scroll.x = wrapper.scrollLeft + (tCenter - wCenter);
          }

          if (tBounds.bottom > wBounds.bottom || tBounds.top < wBounds.top) {
            wCenter = wBounds.top + wBounds.height / 2;
            tCenter = tBounds.top + tBounds.height / 2;
            scroll.y = wrapper.scrollTop + (tCenter - wCenter);
          }

          gsap.to(wrapper, {
            scrollTo: scroll,
            duration: this.tween?.duration() || 0.5,
          });

          this.tween?.progress(0);
        },

        snap: {
          x: (endValue: number) =>
            snap || liveSnap ? Math.round(endValue / GRID_WIDTH) * GRID_WIDTH : endValue,
          y: (endValue: number) =>
            snap || liveSnap ? Math.round(endValue / GRID_HEIGHT) * GRID_HEIGHT : endValue,
        },
      });
    };

    const applySnap = () => {
      if (snapCheckbox.checked || liveSnapCheckbox.checked) {
        const x = gsap.getProperty(box, 'x') as number;
        const y = gsap.getProperty(box, 'y') as number;
        gsap.to(box, {
          x: Math.round(x / GRID_WIDTH) * GRID_WIDTH,
          y: Math.round(y / GRID_HEIGHT) * GRID_HEIGHT,
          duration: 0.5,
          delay: 0.1,
          ease: 'power2.inOut',
        });
      }
      updateDraggable();
    };

    snapCheckbox.addEventListener('change', applySnap);
    liveSnapCheckbox.addEventListener('change', applySnap);
    updateDraggable();

    return () => {
      snapCheckbox.removeEventListener('change', applySnap);
      liveSnapCheckbox.removeEventListener('change', applySnap);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
      <h1 className="text-2xl font-bold">Draggable autoScroll</h1>
      <p className="max-w-[70ch] text-center">
        As of version 0.12.0, Draggable has auto-scrolling capabilities! Add <code>autoScroll:1</code>{' '}
        to the config object for normal-speed scrolling, or <code>autoScroll:2</code> would be twice
        as fast, etc. When your mouse moves within 40px of the edge of a scrollable container, it
        will start scrolling. The closer you get to the edge, the faster it will scroll. Try it out
        below...
      </p>

      <div ref={wrapperRef} className="w-[60vw] h-[1020px] overflow-scroll border">
        <div id="container" ref={containerRef} className="relative">
          <div
            ref={boxRef}
            className="absolute top-0 left-0 text-center text-black text-lg rounded-xl bg-green-400 leading-[100px] select-none cursor-pointer"
          >
            Drag me
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-600 text-zinc-300 text-lg px-4 py-2">
        <ul className="flex gap-4 items-center">
          <li className="pr-4 border-r border-zinc-600 font-semibold">Options</li>
          <li>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" ref={snapRef} className="cursor-pointer" /> Snap to grid
            </label>
          </li>
          <li>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" ref={liveSnapRef} className="cursor-pointer" /> Live snap
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
}
