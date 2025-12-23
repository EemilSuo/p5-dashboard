import React, { useRef, useEffect } from "react";
import p5 from "p5";

const P5Wrapper = ({ sketch, lambda, capacity, persistent, resetFlag }) => {
  const wrapperRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    // Luodaan instanssi
    const p5Instance = new p5(sketch, wrapperRef.current);
    canvasRef.current = p5Instance;

    // Alustetaan arvot heti
    if (p5Instance.updateProps) {
      p5Instance.updateProps({ lambda, capacity, persistent, resetFlag });
    }

    return () => p5Instance.remove();
  }, [sketch]);

  // PÄIVITYS: Lisätty capacity tarkkailtavien listaan
  useEffect(() => {
    if (canvasRef.current && canvasRef.current.updateProps) {
      canvasRef.current.updateProps({ lambda, capacity, persistent, resetFlag });
    }
  }, [lambda, capacity, persistent, resetFlag]); // Reagoi kapasiteetin muutokseen

  return <div ref={wrapperRef} style={{ width: "100%", height: "100%", overflow: "hidden" }} />;
};

export default P5Wrapper;
