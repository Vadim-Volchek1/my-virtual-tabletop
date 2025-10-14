import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';

const DrawingTool = ({ sessionId, isActive, color = '#000000', brushSize = 5 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const drawLine = (from, to) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Send drawing data to other players
    if (socket) {
      socket.emit('drawing', {
        sessionId,
        from,
        to,
        color,
        brushSize
      });
    }
  };

  const handleMouseDown = (e) => {
    if (!isActive) return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    setLastPosition(pos);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !isActive || !lastPosition) return;
    
    const currentPos = getMousePos(e);
    drawLine(lastPosition, currentPos);
    setLastPosition(currentPos);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  // Listen for drawing updates from other players
  useEffect(() => {
    if (!socket) return;

    const handleDrawingUpdate = (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(data.from.x, data.from.y);
      ctx.lineTo(data.to.x, data.to.y);
      ctx.stroke();
    };

    socket.on('drawing-update', handleDrawingUpdate);

    return () => {
      socket.off('drawing-update', handleDrawingUpdate);
    };
  }, [socket]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isActive ? 'auto' : 'none',
        cursor: isActive ? 'crosshair' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default DrawingTool;