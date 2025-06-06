import gsap from "gsap";
import Draggable from "gsap/Draggable";
import InertiaPlugin from "gsap/InertiaPlugin";

interface Config {
  onChange?: (item: Element, index: number) => void;
  repeat?: number;
  paused?: boolean;
  center?: boolean | Element;
  speed?: number;
  snap?: number | boolean;
  paddingRight?: string;
  reversed?: boolean;
  draggable?: boolean;
}

function horizontalLoop(items: Element[], config?: Config): gsap.core.Timeline {
    let timeline: gsap.core.Timeline | undefined;
    items = gsap.utils.toArray(items);
    config = config || {};
    gsap.context(() => {
      let onChange = config.onChange,
        lastIndex = 0,
        tl = gsap.timeline({
          repeat: config.repeat,
          onUpdate: onChange && function() {
            let i = tl.closestIndex();
            if (lastIndex !== i) {
              lastIndex = i;
              onChange(items[i], i);
            }
          },
          paused: config.paused,
          defaults: {ease: "none"},
          onReverseComplete: () => {
            tl.totalTime(tl.rawTime() + tl.duration() * 100);
          }
        }),
        length = items.length,
        startX = (items[0] as HTMLElement).offsetLeft,
        times: number[] = [],
        widths: number[] = [],
        spaceBefore: number[] = [],
        xPercents: number[] = [],
        curIndex = 0,
        indexIsDirty = false,
        center = config.center,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap === true ? 1 : (config.snap || 1)),
        timeOffset = 0,
        container = center === true ? items[0].parentNode : gsap.utils.toArray(center || null)[0] || items[0].parentNode,
        totalWidth: number,
        getTotalWidth = () => {
          const lastItem = items[length-1] as HTMLElement;
          return lastItem.offsetLeft + 
                 xPercents[length-1] / 100 * widths[length-1] - 
                 startX + 
                 spaceBefore[0] + 
                 lastItem.offsetWidth * (gsap.getProperty(lastItem, "scaleX") as number) + 
                 (parseFloat(config.paddingRight || "0"));
        },
        populateWidths = () => {
          if (!container) return;
          let b1 = (container as HTMLElement).getBoundingClientRect(), b2;
          items.forEach((el, i) => {
            widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string);
            xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px") as string) / widths[i] * 100 + (gsap.getProperty(el, "xPercent") as number));
            b2 = el.getBoundingClientRect();
            spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
            b1 = b2;
          });
          gsap.set(items, {
            xPercent: i => xPercents[i]
          });
          totalWidth = getTotalWidth();
        },
        timeWrap: (time: number) => number,
        populateOffsets = () => {
          if (!container) return;
          timeOffset = center ? tl.duration() * ((container as HTMLElement).offsetWidth / 2) / totalWidth : 0;
          center && times.forEach((t, i) => {
            times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * widths[i] / 2 / totalWidth - timeOffset);
          });
        },
        getClosest = (values: number[], value: number, wrap: number) => {
          let i = values.length,
            closest = 1e10,
            index = 0, d;
          while (i--) {
            d = Math.abs(values[i] - value);
            if (d > wrap / 2) {
              d = wrap - d;
            }
            if (d < closest) {
              closest = d;
              index = i;
            }
          }
          return index;
        },
        populateTimeline = () => {
          let i, item, curX, distanceToStart, distanceToLoop;
          tl.clear();
          for (i = 0; i < length; i++) {
            item = items[i] as HTMLElement;
            curX = xPercents[i] / 100 * widths[i];
            distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
            distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, "scaleX") as number);
            tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
              .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
              .add("label" + i, distanceToStart / pixelsPerSecond);
            times[i] = distanceToStart / pixelsPerSecond;
          }
          timeWrap = gsap.utils.wrap(0, tl.duration());
        },
        refresh = (deep?: boolean) => {
          let progress = tl.progress();
          tl.progress(0, true);
          populateWidths();
          deep && populateTimeline();
          populateOffsets();
          deep && tl.draggable && tl.paused() ? tl.time(times[curIndex], true) : tl.progress(progress, true);
        },
        onResize = () => refresh(true),
        proxy: HTMLElement;
      gsap.set(items, {x: 0});
      populateWidths();
      populateTimeline();
      populateOffsets();
      window.addEventListener("resize", onResize);
      function toIndex(index: number, vars?: gsap.TweenVars) {
        vars = vars || {};
        (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
        let newIndex = gsap.utils.wrap(0, length, index),
          time = times[newIndex];
        if (time > tl.time() !== index > curIndex && index !== curIndex) {
          time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        if (time < 0 || time > tl.duration()) {
          vars.modifiers = {time: timeWrap};
        }
        curIndex = newIndex;
        vars.overwrite = true;
        gsap.killTweensOf(proxy);    
        return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
      }
      tl.toIndex = (index: number, vars?: gsap.TweenVars) => toIndex(index, vars);
      tl.closestIndex = (setCurrent?: boolean) => {
        let index = getClosest(times, tl.time(), tl.duration());
        if (setCurrent) {
          curIndex = index;
          indexIsDirty = false;
        }
        return index;
      };
      tl.current = () => indexIsDirty ? tl.closestIndex(true) : curIndex;
      tl.next = (vars?: gsap.TweenVars) => toIndex(tl.current()+1, vars);
      tl.previous = (vars?: gsap.TweenVars) => toIndex(tl.current()-1, vars);
      tl.times = times;
      tl.progress(1, true).progress(0, true);
      if (config.reversed) {
        tl.vars.onReverseComplete?.();
        tl.reverse();
      }
      if (config.draggable && typeof(Draggable) === "function") {
        proxy = document.createElement("div");
        let wrap = gsap.utils.wrap(0, 1),
          ratio: number,
          startProgress: number,
          draggable: Draggable,
          dragSnap: number,
          lastSnap: number,
          initChangeX: number,
          wasPlaying: boolean,
          align = () => {
            tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio));
          },
          syncIndex = () => tl.closestIndex(true);
        typeof(InertiaPlugin) === "undefined" && console.warn("InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club");
        draggable = Draggable.create(proxy, {
          trigger: items[0].parentNode as Element,
          type: "x",
          onPressInit() {
            let x = this.x;
            gsap.killTweensOf(tl);
            wasPlaying = !tl.paused();
            tl.pause();
            startProgress = tl.progress();
            refresh(true);
            ratio = 1 / totalWidth;
            initChangeX = (startProgress / -ratio) - x;
            gsap.set(proxy, {x: startProgress / -ratio});
          },
          onDrag: align,
          onThrowUpdate: align,
          overshootTolerance: 0,
          inertia: true,
          snap(value: number) {
            if (Math.abs(startProgress / -ratio - this.x) < 10) {
              return lastSnap + initChangeX;
            }
            let time = -(value * ratio) * tl.duration(),
              wrappedTime = timeWrap(time),
              snapTime = times[getClosest(times, wrappedTime, tl.duration())],
              dif = snapTime - wrappedTime;
            Math.abs(dif) > tl.duration() / 2 && (dif += dif < 0 ? tl.duration() : -tl.duration());
            lastSnap = (time + dif) / tl.duration() / -ratio;
            return lastSnap;
          },
          onRelease() {
            syncIndex();
            draggable.isThrowing && (indexIsDirty = true);
          },
          onThrowComplete: () => {
            syncIndex();
            wasPlaying && tl.play();
          }
        })[0];
        tl.draggable = draggable;
      }
      tl.closestIndex(true);
      lastIndex = curIndex;
      onChange && onChange(items[curIndex], curIndex);
      timeline = tl;
      return () => window.removeEventListener("resize", onResize);
    });
    if (!timeline) {
      throw new Error("Timeline was not initialized");
    }
    return timeline;
  }

export default horizontalLoop;