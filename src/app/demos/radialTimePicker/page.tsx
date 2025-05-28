'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(Draggable)

interface DraggableInstance {
  rotation?: number;
}

declare global {
  interface Window {
    __RADIAL?: Draggable[];
  }
}

export default function Radial() {
  const inputRef = useRef<HTMLInputElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLButtonElement>(null)
  const sunRef = useRef<SVGSVGElement>(null)
  const moonRef = useRef<SVGSVGElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const INPUT = inputRef.current
    const RING = ringRef.current
    const TIME = timeRef.current
    const HANDLE = handleRef.current
    const SUN = sunRef.current
    const MOON = moonRef.current
    const TRACK = trackRef.current

    if (!INPUT || !RING || !TIME || !HANDLE || !SUN || !MOON || !TRACK) return

    const maxValue = parseInt(INPUT.max, 10)
    const ROTATE_MAPPER = gsap.utils.mapRange(0, maxValue, 0, 360)
    const PROGRESS_MAPPER = gsap.utils.mapRange(0, maxValue * 0.5, 0, 50)

    gsap.set(SUN, { scale: 1 })
    gsap.set(MOON, { scale: 0 })

    const minToTime = (minutes: number): string =>
      `${`${Math.floor(minutes / 60)}`.padStart(2, '0')}:${`${Math.floor(
        minutes % 60
      )}`.padStart(2, '0')}`

    const SUNRISE = 465
    const SUNSET = 465 + 12 * 60
    const rotationSnap = 15

    const onInput = function(this: DraggableInstance) {
      if (this.rotation !== undefined) {
        let VALUE = Math.floor(((this.rotation % 360) / 360) * maxValue)
        if (VALUE < 0) VALUE = maxValue - Math.abs(VALUE)
        INPUT.value = VALUE.toString()
      } else {
        gsap.set(RING, {
          rotate: ROTATE_MAPPER(parseInt(INPUT.value, 10)),
        })
      }
      const TIME_VAL = minToTime(
        gsap.utils.wrap(
          0,
          1440,
          parseInt(INPUT.value, 10) + (SUNSET + (SUNRISE - SUNSET) * 0.5)
        )
      )
      gsap.set(TIME, {
        innerText: TIME_VAL,
      })
      gsap.set(HANDLE, {
        rotate: ROTATE_MAPPER(-parseInt(INPUT.value, 10)),
      })

      if (parseInt(INPUT.value, 10) > maxValue * 0.25 && parseInt(INPUT.value, 10) < maxValue * 0.75) {
        gsap.to(SUN, { scale: 0, duration: 0.25 })
        gsap.to(MOON, { scale: 1, duration: 0.25 })
        gsap.set(HANDLE, { background: 'var(--gray-800)' })
        gsap.set(document.body, { background: 'var(--text-100)' })
        gsap.set(TIME, { color: 'var(--surface-100)' })
      } else {
        gsap.to(MOON, { scale: 0, duration: 0.25 })
        gsap.to(SUN, { scale: 1, duration: 0.25 })
        gsap.set(HANDLE, { background: 'var(--gray-50)' })
        gsap.set(document.body, { background: 'var(--surface-100)' })
        gsap.set(TIME, { color: 'var(--text-100)' })
      }

      const sunInput =
        parseInt(INPUT.value, 10) > maxValue * 0.75
          ? parseInt(INPUT.value, 10) - maxValue * 0.75
          : parseInt(INPUT.value, 10) + maxValue * 0.25
      const moonInput =
        parseInt(INPUT.value, 10) > maxValue * 0.75 ? 0 : parseInt(INPUT.value, 10) - maxValue * 0.25

      gsap.set(TRACK, {
        '--sun-stop': gsap.utils.clamp(0, 50, PROGRESS_MAPPER(sunInput)),
        '--moon-stop': gsap.utils.clamp(0, 50, PROGRESS_MAPPER(moonInput)),
      })
    }

    window.__RADIAL = Draggable.create(RING, {
      trigger: HANDLE,
      type: 'rotation',
      inertia: true,
      onThrowUpdate: onInput,
      onDrag: onInput,
      snap: (endValue) => Math.round(endValue / rotationSnap) * rotationSnap,
    })

    INPUT.addEventListener('input', onInput)
    onInput.call({ rotation: 0 })

    return () => {
      if (window.__RADIAL) window.__RADIAL[0].kill()
      INPUT.removeEventListener('input', onInput)
    }
  })

  return (
    <div className="radial relative grid place-items-center w-[clamp(200px,30vmin,28rem)] aspect-square">
      <div
        className="radial__track absolute inset-0 rounded-full bg-[conic-gradient(from_270deg,var(--yellow-400)_calc(var(--sun-stop,0)*1%),transparent_calc(var(--sun-stop,0)*1%)),conic-gradient(from_90deg,var(--gray-700)_calc(var(--moon-stop,0)*1%),transparent_calc(var(--moon-stop,0)*1%)),var(--surface-200)]"
        ref={trackRef}
        style={{
          mask:
            'radial-gradient(transparent calc(var(--diameter,14rem) / 2 - var(--border-width,12px)), black calc(var(--diameter,14rem) / 2 - var(--border-width,12px)))',
        }}
      ></div>
      <div className="radial__indicators absolute inset-0">
        <div className="radial__indicator absolute w-12 aspect-square top-1/2 right-full translate-x-[calc(50%+6px)] -translate-y-1/2 bg-gray-50 border-2 border-gray-400 rounded-full grid place-items-center">
          <svg
            viewBox="0 0 640 512"
            className="w-7 fill-yellow-400"
            dangerouslySetInnerHTML={{
              __html:
                '<path d="M575.2 325.7c.2-1.9.8-3.7.8-5.6 0-35.3-28.7-64-64-64-12.6 0-24.2 3.8-34.1 10-17.6-38.8-56.5-66-101.9-66-61.8 0-112 50.1-112 112 0 3 .7 5.8.9 8.7-49.6 3.7-88.9 44.7-88.9 95.3 0 53 43 96 96 96h272c53 0 96-43 96-96 0-42.1-27.2-77.4-64.8-90.4zm-430.4-22.6c-43.7-43.7-43.7-114.7 0-158.3 43.7-43.7 114.7-43.7 158.4 0 9.7 9.7 16.9 20.9 22.3 32.7 9.8-3.7 20.1-6 30.7-7.5L386 81.1c4-11.9-7.3-23.1-19.2-19.2L279 91.2 237.5 8.4C232-2.8 216-2.8 210.4 8.4L169 91.2 81.1 61.9C69.3 58 58 69.3 61.9 81.1l29.3 87.8-82.8 41.5c-11.2 5.6-11.2 21.5 0 27.1l82.8 41.4-29.3 87.8c-4 11.9 7.3 23.1 19.2 19.2l76.1-25.3c6.1-12.4 14-23.7 23.6-33.5-13.1-5.4-25.4-13.4-36-24zm-4.8-79.2c0 40.8 29.3 74.8 67.9 82.3 8-4.7 16.3-8.8 25.2-11.7 5.4-44.3 31-82.5 67.4-105C287.3 160.4 258 140 224 140c-46.3 0-84 37.6-84 83.9z"/>',
            }}
          />
        </div>
        <div className="radial__indicator absolute w-12 aspect-square top-1/2 left-full -translate-x-[calc(50%+6px)] -translate-y-1/2 bg-gray-50 border-2 border-gray-400 rounded-full grid place-items-center">
          <svg
            viewBox="0 0 576 512"
            className="w-7 fill-gray-400"
            dangerouslySetInnerHTML={{
              __html:
                '<path d="M342.8 352.7c5.7-9.6 9.2-20.7 9.2-32.7 0-35.3-28.7-64-64-64-17.2 0-32.8 6.9-44.3 17.9-16.3-29.6-47.5-49.9-83.7-49.9-53 0-96 43-96 96 0 2 .5 3.8.6 5.7C27.1 338.8 0 374.1 0 416c0 53 43 96 96 96h240c44.2 0 80-35.8 80-80 0-41.9-32.3-75.8-73.2-79.3zm222.5-54.3c-93.1 17.7-178.5-53.7-178.5-147.7 0-54.2 29-104 76.1-130.8 7.3-4.1 5.4-15.1-2.8-16.7C448.4 1.1 436.7 0 425 0 319.1 0 233.1 85.9 233.1 192c0 8.5.7 16.8 1.8 25 5.9 4.3 11.6 8.9 16.7 14.2 11.4-4.7 23.7-7.2 36.4-7.2 52.9 0 96 43.1 96 96 0 3.6-.2 7.2-.6 10.7 23.6 10.8 42.4 29.5 53.5 52.6 54.4-3.4 103.7-29.3 137.1-70.4 5.3-6.5-.5-16.1-8.7-14.5z"/>',
            }}
          />
        </div>
      </div>

      <div
        className="radial__ring absolute inset-0"
        ref={ringRef}
        style={{ touchAction: 'none' }}
      >
        <button
          className="radial__handle absolute left-1/2 bottom-[calc(100%-6px)] -translate-x-1/2 translate-y-1/2 rounded-full w-12 aspect-square border-2 border-gray-300 bg-gray-50 shadow-md grid place-items-center p-0"
          ref={handleRef}
          aria-label="Toggle sun/moon"
          type="button"
        >
          <svg
            viewBox="0 0 512 512"
            className="absolute top-1/2 left-1/2 w-7 fill-yellow-400 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
            ref={sunRef}
          >
            <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.8-47.4c12.8-6.4 12.8-24.6 0-31z" />
          </svg>
          <svg
            viewBox="0 0 512 512"
            className="absolute top-1/2 left-1/2 w-7 fill-gray-400 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
            ref={moonRef}
          >
            <path d="M279.135 512c137.4 0 249-111.6 249-249 0-119.9-82.1-220.1-191.2-243.5-20-4.3-41.6 7.6-44.2 28.1-7.9 58-46.7 103.6-102.6 122.6-18.2 6.2-30.7 23.5-30.7 42.6 0 27 21.9 48.9 48.9 48.9 4 0 7.8-.6 11.4-1.5 21.1-6.7 41.3-17.4 59.6-31.2 6.8-5 17.5-7.2 24.1-2.9 8.9 6.4 9.7 22.1 1.7 34-14.8 24.6-36.3 45.9-61.9 62.3-15.7 10-23.1 29.6-16.3 46.7C192.3 469 232.1 512 279.1 512z" />
          </svg>
        </button>
      </div>

      <div
        className="radial__time absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xl font-semibold text-gray-900 dark:text-white select-none"
        ref={timeRef}
        aria-live="polite"
      >
        12:00
      </div>

      <input
        ref={inputRef}
        aria-label="Set time"
        type="range"
        min={0}
        max={1440}
        defaultValue={0}
        className="radial__input absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  )
}
