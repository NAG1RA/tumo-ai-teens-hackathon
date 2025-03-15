'use client';

import { useEffect, useRef } from 'react';
import styles from '../styles/bubbles.module.css';

export function Bubbles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Create bubbles
    const bubbles: Bubble[] = [];
    const colors = ['rgba(26, 77, 124, 0.2)', 'rgba(45, 138, 107, 0.2)', 'rgba(255, 255, 255, 0.15)'];
    
    class Bubble {
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
      opacity: number;
      opacityChange: number;
      growing: boolean;
      maxRadius: number;
      minRadius: number;
      
      constructor() {
        this.x = Math.random() * (canvas?.width ?? 0);
        this.y = Math.random() * (canvas?.height ?? 0);
        this.radius = Math.random() * 50 + 20;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.opacityChange = Math.random() * 0.01;
        this.growing = Math.random() > 0.5;
        this.maxRadius = this.radius + Math.random() * 30;
        this.minRadius = Math.max(10, this.radius - Math.random() * 20);
      }
      
      update() {
        // Move bubble
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x + this.radius > (canvas?.width ?? 0) || this.x - this.radius < 0) {
          this.speedX = -this.speedX;
        }
        
        if (this.y + this.radius > (canvas?.height ?? 0) || this.y - this.radius < 0) {
          this.speedY = -this.speedY;
        }
        
        // Pulse size
        if (this.growing) {
          this.radius += 0.2;
          if (this.radius >= this.maxRadius) {
            this.growing = false;
          }
        } else {
          this.radius -= 0.2;
          if (this.radius <= this.minRadius) {
            this.growing = true;
          }
        }
        
        // Pulse opacity
        this.opacity += this.opacityChange;
        if (this.opacity > 0.6 || this.opacity < 0.1) {
          this.opacityChange = -this.opacityChange;
        }
      }
      
      draw() {
        if (!ctx) return;
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        
        const color = this.color.replace(/[\d.]+\)$/g, `${this.opacity})`);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // Draw bubble
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add subtle highlight
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
        ctx.fill();
      }
    }
    
    // Initialize bubbles
    for (let i = 0; i < 15; i++) {
      bubbles.push(new Bubble());
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, 'rgba(26, 77, 124, 0.1)');
      bgGradient.addColorStop(1, 'rgba(45, 138, 107, 0.1)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw bubbles
      bubbles.forEach(bubble => {
        bubble.update();
        bubble.draw();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.bubblesCanvas} />;
} 