import React, { useRef, useEffect } from "react";
import p5 from "p5";

const P5Wrapper = ({ 
  sketch, 
  lambda, 
  ballLimit, 
  rollLimit, 
  interval, 
  capacity, 
  persistent, 
  resetFlag,
  cooldown,  // Uusi: Lampun vaihtoaika
  simSpeed   // Uusi: Simulaation yleinen nopeus
}) => {
  const wrapperRef = useRef();
  const canvasRef = useRef();

  // Luodaan p5-instanssi, kun komponentti ladataan tai sketsi vaihtuu
  useEffect(() => {
    const p5Instance = new p5(sketch, wrapperRef.current);
    canvasRef.current = p5Instance;

    return () => p5Instance.remove();
  }, [sketch]);

  // Päivitetään muuttujat sketsille aina, kun jokin propseista muuttuu
  useEffect(() => {
    if (canvasRef.current && canvasRef.current.updateProps) {
      canvasRef.current.updateProps({ 
        lambda, 
        ballLimit, 
        rollLimit, 
        interval, 
        capacity, 
        persistent, 
        resetFlag,
        cooldown,
        simSpeed
      });
    }
  }, [
    lambda, 
    ballLimit, 
    rollLimit, 
    interval, 
    capacity, 
    persistent, 
    resetFlag, 
    cooldown, 
    simSpeed
  ]);

  return (
    <div 
      ref={wrapperRef} 
      style={{ 
        width: "100%", 
        height: "100%", 
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#000" 
      }} 
    />
  );
};

export default P5Wrapper;
