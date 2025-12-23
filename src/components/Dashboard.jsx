import React, { useState } from "react";
import P5Wrapper from "./P5Wrapper";
import { starField } from "../sketches/starField";
import { funnelSim } from "../sketches/funnelSim";
import { galtonBoard } from "../sketches/galtonBoard";
import { diceSim } from "../sketches/diceSim";
import { bulbSim } from "../sketches/bulbSim";

// --- TYYLIT SIIRRETTY ULKOPUOLELLE VAKAUDEN VUOKSI ---
const styles = {
  container: {
    display: "flex", height: "100vh", width: "100vw", overflow: "hidden",
    background: "#0a0a0f"
  },
  sidebar: {
    width: "340px",
    background: "#14141c",
    padding: "30px 25px",
    display: "flex", flexDirection: "column",
    borderRight: "1px solid #252535",
    boxShadow: "5px 0 15px rgba(0,0,0,0.2)",
    zIndex: 10, overflowY: "auto"
  },
  title: {
    fontSize: "24px", fontWeight: "700", marginBottom: "30px",
    background: "linear-gradient(90deg, #fff, #aaa)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    letterSpacing: "0.5px", margin: 0
  },
  navButton: (isActive) => ({
    flex: "1 0 45%", padding: "12px 10px", border: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: "600", borderRadius: "8px",
    background: isActive ? "#3a86ff" : "#1e1e2a",
    color: isActive ? "white" : "#a0a0b0",
    boxShadow: isActive ? "0 4px 12px rgba(58, 134, 255, 0.4)" : "none",
    transition: "all 0.2s ease-in-out",
  }),
  controlCard: {
    background: "#1e1e2a", padding: "20px", borderRadius: "12px",
    marginBottom: "20px", border: "1px solid #2a2a35"
  },
  labelRow: {
    display: "flex", justifyContent: "space-between", marginBottom: "12px",
    color: "#a0a0b0", fontSize: "13px", fontWeight: "500"
  },
  valueText: { color: "#3a86ff", fontWeight: "700" },
  sliderBox: { marginBottom: "20px" },
  resetButton: {
    marginTop: "auto", width: "100%", padding: "14px", border: "none",
    borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px",
    background: "#ef233c", color: "white",
    boxShadow: "0 4px 12px rgba(239, 35, 60, 0.4)"
  }
};

// --- ERILLINEN KOMPONENTTI (EI DASHBOARDIN SISÄLLÄ) ---
const SliderControl = ({ label, value, displayValue, min, max, step, onChange }) => (
  <div style={styles.sliderBox}>
    <div style={styles.labelRow}>
      <span>{label}</span>
      <span style={styles.valueText}>{displayValue}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={onChange} 
      style={{ width: "100%", cursor: "pointer" }}
    />
  </div>
);

const Dashboard = () => {
  const [activeSketchStr, setActiveSketchStr] = useState("galton");
  
  // Tilat
  const [lambda, setLambda] = useState(0.2);
  const [capacity, setCapacity] = useState(0.1);
  const [ballLimit, setBallLimit] = useState(500);
  const [rollLimit, setRollLimit] = useState(100);
  const [interval, setInterval] = useState(1000);
  const [cooldown, setCooldown] = useState(3);
  const [simSpeed, setSimSpeed] = useState(1);
  const [persistent, setPersistent] = useState(false);
  const [resetFlag, setResetFlag] = useState(0);

  const getActiveSketchObj = () => {
    switch(activeSketchStr) {
      case "starField": return starField;
      case "funnel": return funnelSim;
      case "galton": return galtonBoard;
      case "dice": return diceSim;
      case "bulbs": return bulbSim;
      default: return galtonBoard;
    }
  }

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h1 style={styles.title}>Statistics Lab</h1>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "25px 0" }}>
          {["starField", "funnel", "galton", "dice", "bulbs"].map(sketch => (
            <button 
              key={sketch}
              onClick={() => setActiveSketchStr(sketch)} 
              style={styles.navButton(activeSketchStr === sketch)}
            >
              {sketch === "starField" ? "✨ Tähdet" : 
               sketch === "funnel" ? "⏳ Suppilo" :
               sketch === "galton" ? "🎯 Galton" :
               sketch === "dice" ? "🎲 Nopat" : "💡 Lamput"}
            </button>
          ))}
        </div>

        <div style={{ flexGrow: 1 }}>
          {activeSketchStr === "starField" && (
            <div style={styles.controlCard}>
              <SliderControl label="Tiheys (λ)" value={lambda} displayValue={lambda.toFixed(2)} min="0.01" max="0.5" step="0.01" onChange={(e) => setLambda(parseFloat(e.target.value))} />
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#a0a0b0", fontSize: "13px" }}>
                <input type="checkbox" id="persist" checked={persistent} onChange={(e) => setPersistent(e.target.checked)} />
                <label htmlFor="persist" style={{cursor: "pointer"}}>Jätä tähdet palamaan</label>
              </div>
            </div>
          )}

          {activeSketchStr === "funnel" && (
            <div style={styles.controlCard}>
              <SliderControl label="Tippumisnopeus (λ)" value={lambda} displayValue={lambda.toFixed(2)} min="0.01" max="0.5" step="0.01" onChange={(e) => setLambda(parseFloat(e.target.value))} />
              <SliderControl label="Suppilon vetävyys" value={capacity} displayValue={capacity.toFixed(2)} min="0.01" max="0.5" step="0.01" onChange={(e) => setCapacity(parseFloat(e.target.value))} />
            </div>
          )}

          {activeSketchStr === "galton" && (
            <div style={styles.controlCard}>
              <SliderControl label="Pallojen määrä" value={ballLimit} displayValue={ballLimit} min="50" max="2000" step="50" onChange={(e) => setBallLimit(parseInt(e.target.value))} />
            </div>
          )}

          {activeSketchStr === "dice" && (
            <div style={styles.controlCard}>
              <SliderControl label="Heittokierrokset" value={rollLimit} displayValue={rollLimit} min="10" max="1000" step="10" onChange={(e) => setRollLimit(parseInt(e.target.value))} />
              <SliderControl label="Heittoväli" value={interval} displayValue={`${interval} ms`} min="50" max="2000" step="50" onChange={(e) => setInterval(parseInt(e.target.value))} />
            </div>
          )}

          {activeSketchStr === "bulbs" && (
            <div style={styles.controlCard}>
              <SliderControl label="Rikkoutumisnopeus (λ)" value={lambda} displayValue={lambda.toFixed(2)} min="0.05" max="1.0" step="0.05" onChange={(e) => setLambda(parseFloat(e.target.value))} />
              <SliderControl label="Vaihtoaika" value={cooldown} displayValue={`${cooldown.toFixed(1)} s`} min="0.1" max="10" step="0.1" onChange={(e) => setCooldown(parseFloat(e.target.value))} />
              <SliderControl label="Simulaation nopeus" value={simSpeed} displayValue={`${simSpeed}x`} min="0.5" max="10" step="0.5" onChange={(e) => setSimSpeed(parseFloat(e.target.value))} />
            </div>
          )}
        </div>

        <button 
          onClick={() => setResetFlag(prev => prev + 1)} 
          style={styles.resetButton}
        >
          🔄 Nollaa kaikki data
        </button>
      </aside>

      <main style={{ flexGrow: 1, position: "relative" }}>
        <P5Wrapper 
          sketch={getActiveSketchObj()} 
          lambda={lambda} ballLimit={ballLimit} rollLimit={rollLimit} interval={interval} capacity={capacity} persistent={persistent} resetFlag={resetFlag} cooldown={cooldown} simSpeed={simSpeed}
        />
      </main>
    </div>
  );
};

export default Dashboard;
