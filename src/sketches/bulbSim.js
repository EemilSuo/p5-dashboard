export const bulbSim = (p) => {
  p.disableFriendlyErrors = true;

  let bulbs = [];
  let failureHistory = [];
  let lambda = 0.1;
  let cooldownTime = 3000;
  let simSpeed = 1;
  let simTime = 0; // Seurataan omaa aikaa reaaliajan sijaan
  let resetFlag = 0;

  p.setup = () => {
    const canvasParent = p.canvas.parentElement;
    p.createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
    for (let i = 0; i < 10; i++) bulbs.push(new Bulb(i));
  };

  p.updateProps = (props) => {
    if (props) {
      if (props.lambda !== undefined) lambda = props.lambda;
      if (props.cooldown !== undefined) cooldownTime = props.cooldown * 1000;
      if (props.simSpeed !== undefined) simSpeed = props.simSpeed;
      if (props.resetFlag !== undefined && props.resetFlag !== resetFlag) {
        resetFlag = props.resetFlag;
        failureHistory = [];
        simTime = 0;
        bulbs.forEach((b) => b.reset());
      }
    }
  };

  p.draw = () => {
    p.background(5, 5, 10);

    // Kasvatetaan simulaatioaikaa nopeuskertoimen mukaan
    // deltaTime on millisekunteja edellisestä framesta (n. 16.6ms)
    simTime += p.deltaTime * simSpeed;

    bulbs.forEach((b) => {
      b.update(simTime);
      b.display(simTime);
    });

    drawFailureGraph(p, failureHistory, lambda);

    // Simulaation aikaleima
    p.fill(255, 150);
    p.textSize(14);
    p.textAlign(p.RIGHT);
    p.text(`Simulaatioaika: ${(simTime / 1000).toFixed(1)}s`, p.width - 30, 40);
  };

  class Bulb {
    constructor(index) {
      this.index = index;
      this.reset();
    }

    reset() {
      this.status = "ALIVE";
      this.startTime = simTime;
      // Eksponentiaalinen jakauma
      this.lifeDuration = (-Math.log(p.random(0.0001, 1)) / lambda) * 1000;
      this.deathTime = 0;
    }

    update(now) {
      if (this.status === "ALIVE") {
        if (now - this.startTime > this.lifeDuration) {
          this.status = "COOLDOWN";
          this.deathTime = now;
          failureHistory.push(this.lifeDuration / 1000);
          if (failureHistory.length > 500) failureHistory.shift();
        }
      } else if (this.status === "COOLDOWN") {
        if (now - this.deathTime > cooldownTime) {
          this.reset();
        }
      }
    }

    display(now) {
      const x = p.width / 2 - 270 + this.index * 60;
      const y = 150;

      if (this.status === "ALIVE") {
        p.noStroke();
        p.fill(255, 230, 100);
        p.circle(x, y, 30);
        // Hehku (läpinäkyvyys vähenee ajan myötä hieman)
        p.fill(255, 200, 0, 40);
        p.circle(x, y, 45);
      } else {
        p.stroke(100);
        p.noFill();
        p.circle(x, y, 30);
        const rem = Math.max(0, (cooldownTime - (now - this.deathTime)) / 1000);
        p.noStroke();
        p.fill(150);
        p.textSize(10);
        p.textAlign(p.CENTER);
        p.text(rem.toFixed(1) + "s", x, y + 5);
      }
    }
  }
};

function drawFailureGraph(p, history, lambda) {
    // Vakiomitat yhtenäisyyden vuoksi
    const graphW = 500;
    const graphH = 150;
    
    // Keskitetään kuuvaaja vaakasuunnassa
    const x = p.width / 2 - graphW / 2;
    const y = p.height - 70;

    p.push(); 

    // 1. Taustaverkko
    p.stroke(40, 40, 60, 80);
    p.strokeWeight(1);
    for (let i = 0; i <= 4; i++) {
        let lineY = y - (graphH / 4) * i;
        p.line(x, lineY, x + graphW, lineY);
    }

    // 2. Histogroomi (Palkit)
    if (history.length > 0) {
        p.noStroke();
        const binCount = 20;
        const counts = new Array(binCount).fill(0);
        history.forEach(t => {
            const b = Math.floor(t);
            if (b < binCount) counts[b]++;
        });

        const bw = graphW / binCount;
        
        p.drawingContext.shadowBlur = 12;
        p.drawingContext.shadowColor = p.color(200, 70, 80, 150);

        counts.forEach((c, i) => {
            if (c > 0) {
                // Skaalataan korkeus yhtenäiseksi
                const h = p.map(c / history.length, 0, 0.4, 0, graphH * 1.5);
                p.fill(200, 80, 90, 180);
                p.rect(x + i * bw + 2, y, bw - 4, -Math.min(h, graphH + 20), 4, 4, 0, 0);
            }
        });
        p.drawingContext.shadowBlur = 0;
    }

    // 3. Teoreettinen käyrä (Neon-punainen)
    p.noFill();
    p.stroke(0, 100, 100);
    p.strokeWeight(3);
    
    p.drawingContext.shadowBlur = 15;
    p.drawingContext.shadowColor = p.color(0, 100, 100);

    p.beginShape();
    for (let t = 0; t <= 20; t += 0.1) {
        const val = lambda * Math.exp(-lambda * t);
        const px = x + p.map(t, 0, 20, 0, graphW);
        const py = y - p.map(val, 0, lambda, 0, graphH);
        p.vertex(px, py);
    }
    p.endShape();
    
    p.pop();

    // 4. Tekstit ja selitteet
    p.noStroke();
    p.fill(255, 200);
    p.textSize(13);
    p.textAlign(p.LEFT);
    p.text(`Toteutunut jakauma (n=${history.length})`, x, y - graphH - 20);
    
    p.fill(0, 100, 100);
    p.text(`Teoreettinen malli f(t) = λe⁻λᵗ`, x, y - graphH);
}
