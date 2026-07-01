import React, { useEffect, useRef } from "react";

export default function ParticlesBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      r: number;
      dx: number;
      dy: number;
      pulse: number;
      pulseDir: number;
    }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Re-populate particles to fit new sizes appropriately
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 25000));
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.5,
          dx: (Math.random() - 0.5) * 0.4,
          dy: (Math.random() - 0.5) * 0.4,
          pulse: Math.random(),
          pulseDir: Math.random() > 0.5 ? 0.01 : -0.01,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle futuristic cyber grid
      ctx.strokeStyle = "rgba(255, 32, 32, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 45;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw interconnected neural threat paths (lines between near particles)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.08;
            ctx.strokeStyle = `rgba(255, 32, 32, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw moving security node dots
      particles.forEach((p) => {
        p.pulse += p.pulseDir;
        if (p.pulse > 1 || p.pulse < 0.2) {
          p.pulseDir *= -1;
        }

        ctx.fillStyle = `rgba(255, 32, 32, ${0.15 + p.pulse * 0.45})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + p.pulse * 0.3), 0, Math.PI * 2);
        ctx.fill();

        // Optional micro-glow
        if (p.r > 1.2) {
          ctx.shadowColor = "#ff2020";
          ctx.shadowBlur = 6;
          ctx.fillStyle = "rgba(255, 32, 32, 0.6)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }

        p.x += p.dx;
        p.y += p.dy;

        // Bounce back
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 bg-[#05070d]/95"
      style={{ zIndex: -1 }}
    />
  );
}
