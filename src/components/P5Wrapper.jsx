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
}) => {
  const wrapperRef = useRef();
  const canvasRef = useRef();

  // Luodaan sketsi-instanssi vain kerran tai kun sketsi vaihtuu
  useEffect(() => {
    const p5Instance = new p5(sketch, wrapperRef.current);
    canvasRef.current = p5Instance;

    return () => p5Instance.remove();
  }, [sketch]);

  // PÄIVITYS: Tämä useEffect huolehtii, että KAIKKI arvot menevät perille asti
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
      });
    }
  }, [lambda, ballLimit, rollLimit, interval, capacity, persistent, resetFlag]);

  return (
    <div
      ref={wrapperRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    />
  );
};

export default P5Wrapper;
