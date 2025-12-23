import React, { useState } from "react";
import P5Wrapper from "./P5Wrapper";
import { starField } from "../sketches/starField";
import { funnelSim } from "../sketches/funnelSim";

const Dashboard = () => {
  const [activeSketch, setActiveSketch] = useState("starField");
  const [lambda, setLambda] = useState(0.1); // Tippumisnopeus
  const [capacity, setCapacity] = useState(0.1); // Vetävyys
  const [persistent, setPersistent] = useState(false);
  const [resetFlag, setResetFlag] = useState(0);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#000" }}>
      <aside style={{ width: "280px", background: "#111", color: "white", padding: "20px", zIndex: 10 }}>
        <h2>Poisson Lab</h2>
        
        <div style={{ display: "flex", gap: "5px", marginBottom: "30px" }}>
          <button 
            onClick={() => setActiveSketch("starField")}
            style={{ flex: 1, padding: "8px", background: activeSketch === "starField" ? "#444" : "#222", color: "white", border: "none", cursor: "pointer" }}
          >✨ Tähdet</button>
          <button 
            onClick={() => setActiveSketch("funnel")}
            style={{ flex: 1, padding: "8px", background: activeSketch === "funnel" ? "#444" : "#222", color: "white", border: "none", cursor: "pointer" }}
          >⏳ Suppilo</button>
        </div>

        {/* Slider 1: Tippumisnopeus (Kaikille) */}
        <div style={{ marginBottom: "20px" }}>
          <label>Tippumisnopeus (λ): {lambda.toFixed(2)}</label>
          <input
            type="range" min="0.01" max="0.5" step="0.01"
            value={lambda}
            onChange={(e) => setLambda(parseFloat(e.target.value))}
            style={{ width: "100%", marginTop: "10px" }}
          />
        </div>

        {/* Slider 2: Vain suppilolle */}
        {activeSketch === "funnel" && (
          <div style={{ marginBottom: "20px" }}>
            <label>Suppilon vetävyys: {capacity.toFixed(2)}</label>
            <input
              type="range" min="0.01" max="0.5" step="0.01"
              value={capacity}
              onChange={(e) => setCapacity(parseFloat(e.target.value))}
              style={{ width: "100%", marginTop: "10px" }}
            />
          </div>
        )}

        {/* Tähdet-asetus */}
        {activeSketch === "starField" && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input type="checkbox" checked={persistent} onChange={(e) => setPersistent(e.target.checked)} />
            <label>Jätä tähdet palamaan</label>
          </div>
        )}
      </aside>

      <main style={{ flexGrow: 1, position: "relative" }}>
// Dashboard.jsx sisällä
<P5Wrapper 
  sketch={activeSketch === "starField" ? starField : funnelSim} 
  lambda={lambda} 
  capacity={capacity}
  persistent={persistent} 
  resetFlag={resetFlag} // Tämä nollaa nyt myös pallot
/>
      </main>
    </div>
  );
};

export default Dashboard;
