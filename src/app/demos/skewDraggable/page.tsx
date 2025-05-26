"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function SkewDraggableImages() {
  useGSAP(() => {
    const clampSkew = gsap.utils.clamp(-20, 20);

    class DraggableImg {
      drag: Draggable;
      
      constructor(Image: HTMLElement) {
        const proxy = document.createElement("div");
        const tracker = InertiaPlugin.track(proxy, "x")[0];
        const skewTo = gsap.quickTo(Image, "skewX");
        const xTo = gsap.quickTo(Image, "x", { duration: 0.5 });
        const yTo = gsap.quickTo(Image, "y", { duration: 0.5 });

        const updateSkew = () => {
          const vx = tracker.get("x");
          skewTo(clampSkew(vx / -50));
          if (!vx && !this.drag.isPressed) gsap.ticker.remove(updateSkew);
        };

        const align = () => {
          gsap.set(proxy, {
            x: gsap.getProperty(Image, "x"),
            y: gsap.getProperty(Image, "y"),
            width: Image.offsetWidth,
            height: Image.offsetHeight,
            position: "absolute",
            top: Image.offsetTop,
            left: Image.offsetLeft,
            pointerEvents: "none",
            border: "2px dashed white",
            borderRadius: "10px",
          });
        };

        align();
        if (Image.parentNode) {
          Image.parentNode.appendChild(proxy);
        }
        window.addEventListener("resize", align);

        this.drag = Draggable.create(proxy, {
          type: "x,y",
          trigger: Image,
          bounds: ".content-drag-area",
          edgeResistance: 0.6,
          inertia: true,
          onPressInit: () => {
            align();
            xTo.tween.pause();
            yTo.tween.pause();
            gsap.ticker.add(updateSkew);
          },
          onPress: () => {
            Image.style.zIndex = proxy.style.zIndex;
          },
          onDrag: function () {
            xTo(this.x);
            yTo(this.y);
          },
          onThrowUpdate: function () {
            xTo(this.x);
            yTo(this.y);
          },
        })[0];
      }
    }

    gsap.utils.toArray<HTMLElement>(".img-drag").forEach((img) => new DraggableImg(img));
  }, { dependencies: [] });

  return (
    <div className="flex items-center justify-center min-h-screen content-drag-area relative overflow-hidden">
      <img
        src="https://assets.codepen.io/16327/flair-2.png"
        className="img-drag relative w-[16vw] min-w-[100px] max-w-[300px] m-16"
        alt="flair 2"
      />
      <img
        src="https://assets.codepen.io/16327/flair-3.png"
        className="img-drag relative w-[16vw] min-w-[100px] max-w-[300px] m-16"
        alt="flair 3"
      />
    </div>
  );
}
