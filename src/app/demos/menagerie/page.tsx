'use client'

import React from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';
import Physics2DPlugin from 'gsap/Physics2DPlugin';


const Page2 = () => {
  // Constants
  const CreatureStates = {
    spawning: 'spawning',
    idle: 'idle',
    pulling: 'pulling',
    dragging: 'dragging',
    dropping: 'dropping',
    leaving: 'leaving',
  };

  // Utility functions
  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  const length = (x: number, y: number) => {
    return Math.sqrt(x * x + y * y);
  }
  
  const angle = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  }

  const createGroup = ({
    color = 'yellow',
    size = '80',
    leg = '40',
  }) => {
    const html = `
    <div class="group" style="--color: ${color}; --leg: ${leg}px; --size: ${size}px;">
      <div class="dragger"></div>
      <div class="creature">
        <div class="leg"></div>
        <div class="leg"></div>
        <div class="body"></div>
      </div>
    </div>
    `;
    
    const template = document.createElement('div');
    template.innerHTML = html;
    
    return template.querySelector('.group');
  }

  const spawnParticle = ({
    className,
    cssVars = {},
    text = '',
    startX,
    startY,
    scale = 1,
    duration,
    delay = 0,
    velocity,
    angle,
    gravity,
  }: {
    className: string;
    cssVars: Record<string, string>;
    text: string;
    startX: number;
    startY: number;
    scale: number;
    duration: number;
    delay: number;
    velocity: number;
    angle: number;
    gravity: number;
  }) => {
    const $el = document.createElement('div');
    $el.classList.add(className);
    $el.innerText = text;
    Object.keys(cssVars).forEach((key) => {
      $el.style.setProperty(key, cssVars[key]);
    });
      
    gsap.set($el, {
      x: startX,
      y: startY,
      xPercent: -50,
      yPercent: -50,
      scale: scale,
    });
      
    const tl = gsap.timeline({
      delay,
      onStart: () => {
        if ($stage) {
          $stage.appendChild($el);
        }
      },
      onComplete: () => {
        if ($el) {
          $el.remove();
        }
      }
    });
    
    tl.to($el, {
      duration,
      physics2D: { velocity, angle, gravity },
    }, 0);
    tl.to($el, {
      duration,
      opacity: 0,
    }, 0);
  }

  // Class definitions
  class CreatureState {
    protected creature: any;
    constructor (creature: any) {
      this.creature = creature;
    }
    onEnter (fromState: any) {}
    onExit (toState: any) {}
  }

  class CreatureIdleState extends CreatureState {
    private transition: gsap.core.Timeline | null = null;
    private idleAnimation: gsap.core.Timeline | null = null;
    onEnter (fromState: any) {
      if (fromState === CreatureStates.spawning) {
        this.spawningToIdle();
      } else if (fromState === CreatureStates.pulling) {
        this.pullingToIdle();
      }
    }
    
    spawningToIdle () {
      this.transition?.kill();
      
      const tl = gsap.timeline({
        onComplete: this.playIdleAnimation,
      });
      
      tl.fromTo(this.creature.$el, {
        scaleX: 0,
        scaleY: 0,
      },{
        scaleX: 1,
        scaleY: 1,
        ease: 'elastic.out',
        duration: gsap.utils.random(0.8, 1),
      }, 0);
      
      this.transition = tl;
    }
  
    pullingToIdle () {
      this.transition?.kill();
      
      const tl = gsap.timeline({
        onComplete: this.playIdleAnimation,
      });
      
      tl.set(this.creature.$dragger, {
        x: this.creature.startX,
        y: this.creature.startY,
      });
      tl.to(this.creature.$el, {
        scaleX: 1,
        scaleY: 1,
        ease: 'elastic.out',
        duration: 1,
      }, 0);
      tl.set(this.creature.$el, {
        rotation: 0,
      });
  
      this.transition = tl;
    }
  
    playIdleAnimation = () => {
      const tl = gsap.timeline({
        repeat: -1,
      });
      
      tl.add(() => {
        for (let i = 0; i < 3; i++) {
          spawnParticle({
            className: 'snooze-particle',
            cssVars: {},
            text: 'Z',
            startX: this.creature.startX + 20,
            startY: this.creature.startY - 20,
            scale: 1,
            velocity: gsap.utils.random(90, 110),
            angle: gsap.utils.random(-55, -65),
            gravity: -100,
            duration: 2,
            delay: i * 0.25,
          });
        }
      }, 0.5);
      tl.to(this.creature.$el, {
        scaleX: 1.1,
        scaleY: 0.9,
        duration: 2,
      }, 0.25);
      tl.to(this.creature.$el, {
        scaleX: 1,
        scaleY: 1,
        duration: 1,
      }, 2.5);
      
      this.idleAnimation = tl;
    }
    
    onExit (toState: any) {
      this.idleAnimation?.kill();
      this.transition?.kill();
    }
  }
  
  class CreaturePullingState extends CreatureState {
    onEnter (fromState: any) {
      gsap.ticker.add(this.tick);
    }
    
    onExit (toState: any) {
      gsap.ticker.remove(this.tick);
    }
  
    tick = () => {
      const d = distance(this.creature.startX, this.creature.startY, this.creature.dragX, this.creature.dragY);
      const a = angle(this.creature.startX, this.creature.startY, this.creature.dragX, this.creature.dragY);
      const stretch = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, (stageSize.h ?? 800) * 0.5, 0, 1, d));
      
      gsap.set(this.creature.$el, {
        rotation: a,
        scaleX: 1 + stretch * 2,
        scaleY: 1 - (stretch * 0.25),
      });
      
      if (stretch === 1) {
        this.creature.setState(CreatureStates.dragging);
        
        for (let i = 0; i < 20; i++) {
          spawnParticle({
            className: 'ground-particle',
            cssVars: {},
            text: 'Z',
            startX: this.creature.startX + gsap.utils.random(-this.creature.radius * 0.5, this.creature.radius * 0.5),
            startY: this.creature.startY,
            scale: gsap.utils.random(0.25, 1),
            velocity: gsap.utils.random(400, 800),
            angle: a + gsap.utils.random(-40, 40), 
            gravity: 1200,
            duration: gsap.utils.random(0.5, 2),
            delay: 0,
          });
        }
      }
    }
  }
  
  class CreatureDraggingState extends CreatureState {
    private lockStretch: boolean = false;
    private transition: gsap.core.Timeline | null = null;
    onEnter (fromState: any) {
      gsap.ticker.add(this.tick);
  
      const tl = gsap.timeline({
        onComplete: () => { this.lockStretch = false; },
      });
  
      this.lockStretch = true;
      this.transition = tl.to(this.creature.$el, {
        scaleX: 1,
        scaleY: 1,
        ease: 'elastic.out',
        duration: 1,
      }, 0);
    }
    
    onExit (toState: any) {
      gsap.ticker.remove(this.tick);
    }
  
    tick = () => {
      const { deltaX, deltaY, x, y, } = this.creature.draggable;
      const l = length(deltaX, deltaY);
      
      this.creature.qX(x);
      this.creature.qY(y);
      
      if (l > 20) {
        this.transition?.kill();
        this.lockStretch = false;
      }
  
      if (this.lockStretch) {
        return;
      }
      
      const a = angle(0, 0, deltaX, deltaY);
      const stretch = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 50, 0, 1, l));
  
      gsap.set(this.creature.$el, {
        rotation: a,
        scaleX: 1 + stretch * 0.5,
        scaleY: 1 - (stretch * 0.125),
      });
    }
  }
  
  class CreatureDroppingState extends CreatureState {
    onEnter () {
      this.creature.draggable.disable();
  
      const tl = gsap.timeline({
        onComplete: () => {
          this.creature.setState(CreatureStates.leaving);
        }
      });
      const d = (stageSize.h ?? 800) - this.creature.dragY;
      const duration = d * 0.002;
      const squish = gsap.utils.mapRange(0, (stageSize.h ?? 800), 0.25, 1, d);
      
      tl.set(this.creature.$el, { zIndex: 1 });
      tl.to(this.creature.$el, {
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        duration: duration * 0.5,
      }, 0)
      tl.to(this.creature.$el, {
        y: (stageSize.h ?? 800) - this.creature.radius,
        ease: 'power3.in',
        duration: duration,
      }, 0);
      tl.add(() => {
        const count = gsap.utils.mapRange(0, (stageSize.h ?? 800), 4, 20, d) | 0;
        const impact = gsap.utils.mapRange(0, (stageSize.h ?? 800), 1, 4, d);
        
        for (let i = 0; i < count; i++) {
          spawnParticle({
            className: 'ground-particle',
            cssVars: {},
            text: 'Z',
            startX: this.creature.dragX,
            startY: this.creature.startY,
            scale: gsap.utils.random(0.25, 1),
            velocity: gsap.utils.random(100, 300) * impact,
            angle: -90 + gsap.utils.random(-30, 30), 
            gravity: 1200,
            duration: gsap.utils.random(1, 4),
            delay: 0,
          });
        }
      });
      tl.set(this.creature.$el, {
        transformOrigin: '50% 100%'
      })
      tl.to(this.creature.$el, {
        scaleY: 1 - 0.75 * squish,
        scaleX: 1 + 0.5 * squish,
        // scaleY: 0.25,
        // scaleX: 1.5,
        duration: 0.25,
        ease: 'expo.out',
      });
      tl.to(this.creature.$el, {
        scaleY: 1,
        scaleX: 1,
        duration: 1,
        ease: 'elastic.out',
      });
      tl.set(this.creature.$el, {
        transformOrigin: '50% 50%',
      });
    }
  }
  
  class CreatureLeavingState extends CreatureState {
    onEnter () {
      const tl = gsap.timeline({
        onComplete: this.creature.handleComplete
      });
      const legs = Array.from(this.creature.$el.querySelectorAll('.leg')) as HTMLElement[];
      const body = this.creature.$el;
      const gait = ((this.creature.radius + this.creature.leg) * Math.PI * 2) / 8;
      const dir = gsap.utils.random([-1, 1]);
      const start = 0;
      const steps = Math.ceil(dir === 1 ? (this.creature.dragX / gait) : ((stageSize.w ?? 800) - this.creature.dragX) / gait) + 1;
      
      tl.set(body, {
        scaleX: dir,
        rotation: 0,
      });
      tl.to(body, {
        y: (stageSize.h ?? 800) - (this.creature.radius + this.creature.leg),
        duration: .5,
        ease: 'back.out(3)',
      }, start);
      tl.to(legs, {
        y: this.creature.leg * 0.5 + this.creature.radius,
        duration: .125,
        ease: 'expo.out',
      }, start);
      tl.to(legs[0], {
        rotation: '+=45',
        duration: 1,
      });
      
      const step = (even: boolean) => {
        tl.to(body, {
          rotation: dir === 1 ? '-=45' : '+=45',
          x: (dir === 1 ? '-=' : '+=') + gait,
          duration: 0.25,
          ease: 'circ.inOut'
        }, '-=0.25');
  
        tl.to(legs[even ? 1 : 0], {
          rotation: '+=90',
          duration: 0.5,
          ease: 'back.out'
        });
      }
      
      for (let i = 0; i < steps; i++) {
        step(i % 2 === 0);
      }
    }
  }
  
  class Creature {
    private $group: HTMLElement;
    private $dragger: HTMLElement;
    private $el: HTMLElement;
    private onComplete: () => void;
    private qX: gsap.QuickToFunc;
    private qY: gsap.QuickToFunc;
    private draggable: Draggable;
    private states: Record<string, CreatureState>;
    private radius: number;
    previousState: string | null = null;
    state = CreatureStates.spawning;
    startX = 0;
    startY = 0;
    width = 80;
    height = 80;
    leg = 40;
    
    constructor (x: number, y: number, color: string, size: number, leg: number, onComplete: () => void) {
      this.$group = createGroup({
        color,
        size: size.toString(),
        leg: leg.toString(),
      }) as HTMLElement;
      if ($stage) {
        $stage.appendChild(this.$group);
      }
  
      this.$dragger = this.$group.querySelector('.dragger') as HTMLElement;
      this.$el = this.$group.querySelector('.creature') as HTMLElement;
      this.onComplete = onComplete;
      this.startX = x;
      this.startY = y;
      this.width = size;
      this.height = size;
      this.leg = leg,
      this.radius = this.width * 0.5;
      
      gsap.set([this.$dragger, this.$el], {
        xPercent: -50,
        yPercent: -50,
        x: this.startX,
        y: this.startY,
      });
      
      this.qX = gsap.quickTo(this.$el, 'x', { duration: 0.2, ease: 'back.out' });
      this.qY = gsap.quickTo(this.$el, 'y', { duration: 0.2, ease: 'back.out' });
      
      this.draggable = Draggable.create(this.$dragger, {
        bounds: {top: 0, left: 0, width: (stageSize.w ?? 800), height: (stageSize.h ?? 800) + this.radius},
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
      })[0];
      
      this.states = {
        [CreatureStates.idle]: new CreatureIdleState(this),
        [CreatureStates.pulling]: new CreaturePullingState(this),
        [CreatureStates.dragging]: new CreatureDraggingState(this),
        [CreatureStates.dropping]: new CreatureDroppingState(this),
        [CreatureStates.leaving]: new CreatureLeavingState(this),
      };
      
      this.setState(CreatureStates.idle);
    }
    
    setState (state: any) {
      const prev = this.states[this.state];
      const next = this.states[state];
  
      if (prev) { prev.onExit(state); }
      if (next) { next.onEnter(this.state); }
      
      this.previousState = this.state;
      this.state = state;
    }
  
    onDragStart = () => {
      this.setState(CreatureStates.pulling);
    }
    
    onDragEnd = () => {
      if (this.state === CreatureStates.dragging) {
        this.setState(CreatureStates.dropping);
      } else if (this.state === CreatureStates.pulling) {
        this.setState(CreatureStates.idle);
      }
    }
    
    handleComplete = () => {
      this.destroy();
      this.onComplete();
    }
    
    destroy () {
      this.draggable.kill();
      this.$group.remove();
    }
  
    get dragX () { return this.draggable.x }
    get dragY () { return this.draggable.y }
  }
  
  // Component state
  let creatureCount = 0;
  let $stage: HTMLElement | null = null;
  let stageSize = { w: 800, h: 800 };

  const spawnCreature = ({
    startX = gsap.utils.random(100, stageSize.w - 100, 1),
    color = gsap.utils.random(['gold', 'salmon', 'lightpink', 'coral', 'violet', 'slateblue']),
    size = gsap.utils.random(40, 180, 1) as number,
    leg = size * gsap.utils.random(0.1, 0.8, 0.1) as number,
  } = {}) => {
    creatureCount++;
    
    const creature = new Creature(startX, (stageSize.h ?? 800), color, size, leg, () => {
      if (--creatureCount < 5) {
        spawnCreature();
      }
      spawnCreature();
    });
  };

  useGSAP(() => {
    console.clear();
    gsap.registerPlugin(Draggable, InertiaPlugin, Physics2DPlugin);
    
    $stage = document.querySelector('.stage');
    stageSize = {
      w: $stage?.clientWidth ?? 800,
      h: $stage?.clientHeight ?? 800,
    };
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      stageSize.w = Math.round(width);
      stageSize.h = Math.round(height);
    });
    
    if ($stage) {
      resizeObserver.observe($stage);
    }

    // Initial spawn
    spawnCreature({
      color: 'gold',
      size: 160,
      leg: 60,
      startX: stageSize.w * 0.5,
    });
  });

  return (
    <main className='m-0 '>
      <div className='stage h-screen w-screen bg-blue-300 outline-2 outline-black inset-0 m-auto overflow-hidden absolute'>

      </div>
    </main>
  )
}

export default Page2