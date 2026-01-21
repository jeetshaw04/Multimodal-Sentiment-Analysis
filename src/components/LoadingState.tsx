import { useEffect, useRef } from 'react';

const LoadingState = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    let rotation = 0;
    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;

      // Outer glow
      const outerGradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 80);
      outerGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
      outerGradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.2)');
      outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGradient;
      ctx.fillRect(0, 0, size, size);

      // Rotating ring 1
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 1.5);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Rotating ring 2 (opposite direction)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-rotation * 0.7);
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 1.2);
      ctx.strokeStyle = 'rgba(138, 43, 226, 0.8)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Inner pulsing core
      const pulseScale = 1 + Math.sin(rotation * 3) * 0.1;
      const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 25 * pulseScale);
      innerGradient.addColorStop(0, 'rgba(0, 255, 255, 1)');
      innerGradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.8)');
      innerGradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 * pulseScale, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();

      rotation += 0.05;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <canvas ref={canvasRef} className="mb-6" />
      <p className="text-muted-foreground text-lg animate-pulse">Analyzing sentiment...</p>
      <p className="text-muted-foreground/70 text-sm mt-2">This may take a few seconds</p>
    </div>
  );
};

export default LoadingState;
