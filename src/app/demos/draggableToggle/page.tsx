'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Draggable);

export default function DraggableToggle() {
  const boxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableInstance = useRef<Draggable | null>(null);

  const [enabled, setEnabled] = useState(true);

  useGSAP(() => {
    const [instance] = Draggable.create(boxRef.current, {
      bounds: containerRef.current,
      edgeResistance: 0.65,
      type: 'x,y',
    });
    draggableInstance.current = instance;
  }, { dependencies: [] });

  const handleCheckboxChange = () => {
    const isChecked = !enabled;
    setEnabled(isChecked);
    draggableInstance.current?.enabled(isChecked);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h2 className="max-w-[40ch] text-center text-xl font-semibold mb-4">
        Use the Enabled check box to toggle the enabled() state of the green div
      </h2>

      <label className="text-lg mb-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleCheckboxChange}
          className="mr-2"
        />
        Enabled
      </label>

      <div
        ref={containerRef}
        className="relative w-[800px] h-[400px] border-2 border-dashed border-white rounded-lg mt-4"
      >
        <div
          ref={boxRef}
          className="absolute top-2 left-2 w-[196px] h-[100px] leading-[100px] text-center rounded-lg bg-green-500 text-white font-bold cursor-move"
        >
          drag me
        </div>
      </div>
    </div>
  );
}
