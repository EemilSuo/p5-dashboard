import React, { useState } from "react";
import P5Wrapper from "./P5Wrapper";
import { starField } from "../sketches/starField";
import { funnelSim } from "../sketches/funnelSim";
import { galtonBoard } from "../sketches/galtonBoard";
import { diceSim } from "../sketches/diceSim"; // Tuo uusi sketsi

const Dashboard = () => {
  const [activeSketchStr, setActiveSketchStr] = useState("dice");
  const [rollLimit, setRollLimit] = useState(100); // Noppien heittomäärä
  const [interval, setInterval] = useState(1000); // Viive millisekunteina
  const [ballLimit, setBallLimit] = useState(500);
  const [capacity, setCapacity] = useState(0.1);
  const [resetFlag, setResetFlag] = useState(0);

  const getActiveSketchObj = () => {
    switch(activeSketchStr) {
      case "starField": return starField;
      case "funnel": return funnelSim;
      case "galton": return galtonBoard;
      case "dice": return diceSim;
      default: return diceSim;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#000", color: "white" }}>
      <aside style={{ width: "300px", background: "#111", padding: "20px", display: "flex", flexDirection: "column", borderRight: "1px solid #333" }}>
        <h2>Statistics Lab</h2>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "20px" }}>
          <button onClick={() => setActiveSketchStr("starField")} style={{flex: "1 0 45%", padding: "8px", background: activeSketchStr === "starField" ? "#444" : "#222", border: "none", color: "white", cursor: "pointer"}}>✨ Tähdet</button>
          <button onClick={() => setActiveSketchStr("funnel")} style={{flex: "1 0 45%", padding: "8px", background: activeSketchStr === "funnel" ? "#444" : "#222", border: "none", color: "white", cursor: "pointer"}}>⏳ Suppilo</button>
          <button onClick={() => setActiveSketchStr("galton")} style={{flex: "1 0 45%", padding: "8px", background: activeSketchStr === "galton" ? "#444" : "#222", border: "none", color: "white", cursor: "pointer"}}>🎯 Galton</button>
          <button onClick={() => setActiveSketchStr("dice")} style={{flex: "1 0 45%", padding: "8px", background: activeSketchStr === "dice" ? "#444" : "#222", border: "none", color: "white", cursor: "pointer"}}>🎲 Nopat</button>
        </div>

        {activeSketchStr === "dice" ? (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label>Heittokierrokset: <b>{rollLimit}</b></label>
              <input type="range" min="10" max="1000" step="10" value={rollLimit} onChange={(e) => setRollLimit(parseInt(e.target.value))} style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label>Heittoväli: <b>{interval} ms</b></label>
              <input type="range" min="50" max="2000" step="50" value={interval} onChange={(e) => setInterval(parseInt(e.target.value))} style={{ width: "100%" }} />
            </div>
          </>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <label>Pallojen/Kohteiden määrä: <b>{ballLimit}</b></label>
            <input type="range" min="50" max="2000" step="50" value={ballLimit} onChange={(e) => setBallLimit(parseInt(e.target.value))} style={{ width: "100%" }} />
          </div>
        )}

        <button onClick={() => setResetFlag(prev => prev + 1)} style={{ marginTop: "auto", padding: "12px", background: "#d32f2f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          🔄 Nollaa simulaatio
        </button>
      </aside>

      <main style={{ flexGrow: 1 }}>
        <P5Wrapper 
          sketch={getActiveSketchObj()} 
          rollLimit={rollLimit}
          interval={interval}
          ballLimit={ballLimit}
          capacity={capacity}
          resetFlag={resetFlag}
        />
      </main>
    </div>
  );
};

export default Dashboard;
