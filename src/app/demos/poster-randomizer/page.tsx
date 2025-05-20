'use client'

import React from 'react'
import GSAPlogo from '@/app/components/GSAPlogo'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';
import * as htmlToImage from 'html-to-image';

const PosterRandomizer = () => {
    const gradients = [
        "linear-gradient(45deg, #4CAF50, #8BC34A)",
        "linear-gradient(45deg, #FF9800, #FF5722)",
        "linear-gradient(45deg, #E91E63, #C2185B)",
        "linear-gradient(45deg, #9C27B0, #673AB7)",
        "linear-gradient(45deg, #2196F3, #03A9F4)",
        "linear-gradient(45deg, #00BCD4, #009688)",
        "linear-gradient(45deg, #FFEB3B, #FFC107)"
    ];
      
    const circleColors = [
        "#4CAF50",
        "#FFFFFF",
        "#E91E63",
        "#C2185B",
        "#FF9800",
        "#9C27B0",
        "#8BC34A",
        "#2196F3"
    ];
      
    const letterColors = [
        "#424242",
        "#FFFFFF",
        "#4CAF50",
        "#388E3C",
        "#8BC34A",
        "#2196F3",
        "#9C27B0",
        "#F44336",
        "#FF9800"
    ];

    let posterW = null;
    let posterH = null;

    function getCSSVarValue(varName: string) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(varName)
            .trim();
    }

    function getRandomItem(array: string[]) {
        return array[Math.floor(Math.random() * array.length)];
    }

    useGSAP(() => {
        gsap.registerPlugin(Draggable, InertiaPlugin);

        // Get DOM elements
        const poster = document.getElementById("poster");
        const logo = document.querySelector(".logo");
        const circle = document.querySelector(".circle");
        const sticker = document.querySelector(".sticker");
        const smooothContainer = document.querySelector(".smoooth-container");
        const smoooth = document.querySelector(".smoooth");
        const controls = document.querySelector(".controls");
        const pauseBtn = document.getElementById("pause");
        const hideBtn = document.getElementById("screenshot");

        // Spin & Drag setup
        const initialRotationOffset = -36.25;
        const letterPos = [0, 15.25, 30.25, 42.25, 54.25, 64.25, 73.5];
        const shapes = gsap.utils.toArray(".letter");
        const proxy = document.createElement("div");
        const progressWrap = gsap.utils.wrap(0, 1);
        const wrapRotation = gsap.utils.wrap(-90, 90);

        const spin = gsap.fromTo(shapes, {
            rotationY: (i) => letterPos[i] + initialRotationOffset
        }, {
            rotationY: `-=${360}`,
            modifiers: {
                rotationY: (value) => wrapRotation(parseFloat(value)) + "deg"
            },
            duration: 10,
            ease: "none",
            repeat: -1
        });

        let screenRange = gsap.utils.mapRange(0, 2000, 500, 4500), 
            dragDistancePerRotation = screenRange(window.innerWidth),
            startProgress: any;
            
        function updateRotation(this: Draggable) {
            const p = startProgress + (this.startX - this.x) / dragDistancePerRotation;
            spin.progress(progressWrap(p));
        }
          
        function adjustRadius() {
            const radius = Math.min(window.innerWidth * 0.5, 650, window.innerHeight * 0.43);
            
            gsap.set(shapes, {
                xPercent: -50,
                yPercent: -50,
                x: 0,
                y: 0,
                transformOrigin: `50% 50% ${-radius}px`
            });
        }

        function randomizeVisuals() {
            // Background
            if (poster) {
                const gradientValue = getRandomItem(gradients);
                poster.style.background = gradientValue;
            }
        
            // Circle
            if (circle) {
                const circleColor = getRandomItem(circleColors);
                (circle as HTMLElement).style.backgroundColor = circleColor;
            }
        
            // Sticker
            if (sticker) {
                const excluded = [5, 9, 24, 27];
                const validFlairs = Array.from({ length: 35 }, (_, i) => i + 1).filter(
                    (i) => !excluded.includes(i)
                );
                const flairNumber = getRandomItem(validFlairs.map(String));
                const flairClass = flairNumber === "1" ? "flair" : `flair--${flairNumber}`;
        
                sticker.classList.remove(
                    "flair",
                    ...Array.from({ length: 35 }, (_, i) => `flair--${i + 1}`)
                );
                sticker.classList.add(flairClass);
            }
        
            // Letters
            if (smoooth) {
                const letterColor = getRandomItem(letterColors);
                (smoooth as HTMLElement).style.color = letterColor;
            }
        }

        function resetPoster() {
            if (!controls || !smooothContainer || !logo || !poster || !sticker || !circle) return;
            
            (controls as HTMLElement).style.removeProperty("display");
            (smooothContainer as HTMLElement).style.removeProperty("display");
            gsap.set([logo, poster, sticker, circle], {clearProps:"width,height,maxWidth,maxHeight"});
            gsap.set(logo, {clearProps: "top,bottom"});
        }

        // Event Listeners
        let isPaused = false;
        pauseBtn?.addEventListener("click", () => {
            if (isPaused) {
                spin.resume();
                pauseBtn.classList.remove("paused");
            } else {
                spin.pause();
                pauseBtn.classList.add("paused");
            }
            isPaused = !isPaused;
        });

        hideBtn?.addEventListener("click", () => {
            if (!controls || !poster) return;

            pauseBtn?.click();

            const posterRect = poster.getBoundingClientRect();
            posterW = `${posterRect.width}px`;
            posterH = `${posterRect.height}px`;

            (controls as HTMLElement).style.display = "none";
            (smooothContainer as HTMLElement).style.display = "none";

            if (logo) {
                Object.assign((logo as HTMLElement).style, {
                    width: "300px",
                    maxWidth: "none",
                    top: "auto",
                    bottom: "7%"
                });
            }

            Object.assign((poster as HTMLElement).style, {
                width: "1290px",
                height: "2796px"
            });

            if (sticker) {
                Object.assign((sticker as HTMLElement).style, {
                    width: "484px",
                    height: "484px",
                    maxWidth: "none",
                    maxHeight: "none"
                });
            }

            if (circle) {
                Object.assign((circle as HTMLElement).style, {
                    width: "968px",
                    height: "968px",
                    maxWidth: "none",
                    maxHeight: "none"
                });
            }

            window.requestAnimationFrame(() => {
                htmlToImage
                    .toPng(poster as HTMLElement)
                    .then((dataUrl: string) => {
                        const link = document.createElement("a");
                        link.download = "gsap-smoooth-poster_randomizer.png";
                        link.href = dataUrl;
                        link.click();
                        resetPoster();
                        pauseBtn?.click();
                    })
                    .catch((error: Error) => {
                        console.error("Screenshot failed:", error);
                        resetPoster();
                        pauseBtn?.click();
                    });
            });
        });

        // Initialize
        adjustRadius();
        randomizeVisuals();

        // Event Listeners
        window.addEventListener("resize", () => {
            dragDistancePerRotation = screenRange(window.innerWidth);
            adjustRadius();
        });

        document.getElementById("reroll")?.addEventListener("click", randomizeVisuals);

        // Draggable setup
        if (smoooth) {
            Draggable.create(proxy, {
                trigger: smoooth,
                type: "x",
                inertia: true,
                allowNativeTouchScrolling: true,
                onPress() {
                    gsap.killTweensOf(spin);
                    spin.timeScale(0);
                    startProgress = spin.progress();
                },
                onDrag: updateRotation,
                onThrowUpdate: updateRotation,
                onRelease() {
                    if (!this.tween || !this.tween.isActive()) {
                        gsap.to(spin, { timeScale: 1, duration: 1 });
                    }
                },
                onThrowComplete() {
                    gsap.to(spin, { timeScale: 1, duration: 1 });
                }
            });
        }
    });

    return (
        <div id="poster" className="noise">
            <GSAPlogo />
            <div className="smoooth-container">
                <div className="smoooth" aria-label="Rotating Smoooth letters">
                    <div className="letter" data-letter="S">S</div>
                    <div className="letter" data-letter="m">m</div>
                    <div className="letter" data-letter="o">o</div>
                    <div className="letter" data-letter="o">o</div>
                    <div className="letter" data-letter="o">o</div>
                    <div className="letter" data-letter="t">t</div>
                    <div className="letter" data-letter="h">h</div>
                </div>
            </div>
            <div className="sticker flair" aria-hidden="true"></div>
            <div className="circle" aria-hidden="true"></div>
            <div className="controls">
                <button id="pause" type="button" aria-label="Pause or Play Carousel">
                    <span className="label"></span>
                </button>
                <button id="screenshot" type="button" aria-label="Download Screenshot">
                    <span className="label"></span>
                </button>
                <button id="reroll" type="button" aria-label="Randomize Visuals">
                    <span className="label">&#x21bb;</span>
                </button>
            </div>
        </div>
    );
}

export default PosterRandomizer;