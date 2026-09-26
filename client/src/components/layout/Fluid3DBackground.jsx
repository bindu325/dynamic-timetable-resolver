import React, { useEffect, useRef } from 'react';

const Fluid3DBackground = ({ staticMode = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    
    // Resize handler
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      if (staticMode) renderStatic();
    };
    
    window.addEventListener('resize', resize);

    // Exact same colors as requested
    const colors = ['#ec4899', '#f97316', '#8b5cf6', '#fca5a5'];
    
    // Detailed 3D Rectangles/Squares System
    const shapes = [];
    const SHAPE_COUNT = 75; // Dense and detailed
    const FOV = 600; // Field of view for 3D projection

    for (let i = 0; i < SHAPE_COUNT; i++) {
      // Create a mix of perfect squares and various rectangles
      const isSquare = Math.random() > 0.5;
      const baseSize = Math.random() * 80 + 30;
      
      shapes.push({
        x: (Math.random() - 0.5) * window.innerWidth * 2,
        y: (Math.random() - 0.5) * window.innerHeight * 2,
        z: Math.random() * 1000 + 100, // Depth
        w: baseSize,
        h: isSquare ? baseSize : baseSize * (Math.random() * 1.5 + 0.5), // Combos of rectangles and squares
        
        // 3D Rotation
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        
        // Rotation speeds
        drx: (Math.random() - 0.5) * 0.02,
        dry: (Math.random() - 0.5) * 0.02,
        drz: (Math.random() - 0.5) * 0.02,
        
        // Movement speed
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        vz: (Math.random() - 0.5) * 4,
        
        color: colors[i % colors.length],
        isWireframe: Math.random() > 0.6, // Mix of solid and wireframe for detail
        baseAlpha: Math.random() * 0.4 + 0.1
      });
    }

    let animationFrameId;

    // Helper for 3D rotation of vertices
    const rotate3D = (x, y, z, rx, ry, rz) => {
      // X rotation
      let cos = Math.cos(rx), sin = Math.sin(rx);
      let y1 = y * cos - z * sin;
      let z1 = y * sin + z * cos;
      
      // Y rotation
      cos = Math.cos(ry); sin = Math.sin(ry);
      let x2 = x * cos + z1 * sin;
      let z2 = -x * sin + z1 * cos;
      
      // Z rotation
      cos = Math.cos(rz); sin = Math.sin(rz);
      let x3 = x2 * cos - y1 * sin;
      let y3 = x2 * sin + y1 * cos;
      
      return { x: x3, y: y3, z: z2 };
    };

    const drawShape = (shape) => {
      // 4 corners of the rectangle relative to its center
      const hw = shape.w / 2;
      const hh = shape.h / 2;
      
      const vertices = [
        { x: -hw, y: -hh, z: 0 },
        { x: hw, y: -hh, z: 0 },
        { x: hw, y: hh, z: 0 },
        { x: -hw, y: hh, z: 0 }
      ];
      
      const projected = [];
      let outOfBounds = true;
      
      for (let v of vertices) {
        // Apply rotation
        const rotated = rotate3D(v.x, v.y, v.z, shape.rx, shape.ry, shape.rz);
        
        // Translate to world position
        const wx = rotated.x + shape.x;
        const wy = rotated.y + shape.y;
        const wz = rotated.z + shape.z;
        
        // Prevent drawing behind camera
        if (wz < 50) return; 
        
        // Perspective projection
        const scale = FOV / wz;
        const px = wx * scale + width / 2;
        const py = wy * scale + height / 2;
        
        if (px > 0 && px < width && py > 0 && py < height) outOfBounds = false;
        projected.push({ x: px, y: py });
      }
      
      // Depth-based opacity fading
      const depthAlpha = Math.max(0, 1 - (shape.z / 1200));
      const finalAlpha = shape.baseAlpha * depthAlpha;
      
      if (finalAlpha <= 0) return;

      ctx.beginPath();
      ctx.moveTo(projected[0].x, projected[0].y);
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(projected[i].x, projected[i].y);
      }
      ctx.closePath();

      if (shape.isWireframe) {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = finalAlpha * 1.5;
        ctx.stroke();
      } else {
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = finalAlpha;
        ctx.fill();
        
        // Add subtle border to solid shapes for extreme detail
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = finalAlpha * 0.5;
        ctx.stroke();
      }
    };

    const renderStatic = () => {
      ctx.fillStyle = '#fcfbf9';
      ctx.fillRect(0, 0, width, height);

      // Sort by Z for correct depth rendering (painter's algorithm)
      const sortedShapes = [...shapes].sort((a, b) => b.z - a.z);
      sortedShapes.forEach(drawShape);
      ctx.globalAlpha = 1.0;
    };

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      
      // Creamy background base
      ctx.fillStyle = '#fcfbf9';
      ctx.fillRect(0, 0, width, height);

      shapes.forEach(shape => {
        // Move
        shape.x += shape.vx;
        shape.y += shape.vy;
        shape.z += shape.vz;
        
        // Rotate
        shape.rx += shape.drx;
        shape.ry += shape.dry;
        shape.rz += shape.drz;

        // Wrap around in 3D space
        if (shape.z < 50) shape.z = 1200;
        if (shape.z > 1200) shape.z = 50;
        if (shape.x > width * 1.5) shape.x = -width * 1.5;
        if (shape.x < -width * 1.5) shape.x = width * 1.5;
        if (shape.y > height * 1.5) shape.y = -height * 1.5;
        if (shape.y < -height * 1.5) shape.y = height * 1.5;
      });

      // Sort by Z for correct depth rendering
      const sortedShapes = [...shapes].sort((a, b) => b.z - a.z);
      sortedShapes.forEach(drawShape);
      
      ctx.globalAlpha = 1.0;
    };

    resize();
    if (!staticMode) {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [staticMode]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#fcfbf9' // Ensuring constant background color
      }}
    />
  );
};

export default Fluid3DBackground;
