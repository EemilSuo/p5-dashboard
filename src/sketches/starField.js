import { poissonProb } from "../utils/mathUtils";

export const starField = (p) => {
  let stars = [];
  let history = [];
  let counts = {};
  let frameCounter = 0;
  let starsInInterval = 0;
  
  p.lambdaPerFrame = 0.1;
  p.isPersistent = false;
  const intervalLength = 60;

  p.setup = () => {
    const canvasParent = p.canvas.parentElement;
    p.createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.updateProps = (props) => {
    if (props) {
      if (props.lambda !== undefined) p.lambdaPerFrame = props.lambda;
      if (props.persistent !== undefined) p.isPersistent = props.persistent;
      // Nollataan statsit jos resetFlag muuttuu
      if (props.resetFlag !== undefined) {
        history = [];
        counts = {};
        stars = []; // Tyhjennetään myös tähdet
      }
    }
  };

  p.draw = () => {
    p.background(240, 100, 5, 15);

    // Lasketaan dynaaminen väri (hue) lambdan mukaan
    // Matala (0.01) -> Kylmä sininen (220)
    // Korkea (0.50) -> Kuuma oranssi/punainen (20)
    let currentHue = p.map(p.lambdaPerFrame, 0.01, 0.5, 220, 20);

    if (p.random(1) < p.lambdaPerFrame) {
      stars.push(new Star(p, currentHue));
      starsInInterval++;
    }

    frameCounter++;
    if (frameCounter >= intervalLength) {
      history.push(starsInInterval);
      if (history.length > 300) history.shift();
      counts = {};
      history.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
      starsInInterval = 0;
      frameCounter = 0;
    }

    for (let i = stars.length - 1; i >= 0; i--) {
      stars[i].update();
      stars[i].display(p.isPersistent);
      if (!p.isPersistent && stars[i].isDead()) stars.splice(i, 1);
    }

    drawGraphs(p, p.lambdaPerFrame, intervalLength, counts, history.length, currentHue);
  };

  class Star {
    constructor(p, hue) {
      this.p = p;
      this.x = p.random(p.width);
      this.y = p.random(p.height * 0.7);
      this.life = 100;
      this.speed = p.random(1, 2.5);
      this.hue = hue; // Tallennetaan syntyhetken väri
    }
    update() { this.life -= this.speed; }
    display(persistent) {
      this.p.noStroke();
      let b = persistent ? 100 : this.p.map(this.life, 0, 100, 0, 100);
      this.p.fill(this.hue, 80, 100, Math.max(0, b));
      this.p.circle(this.x, this.y, 2);
    }
    isDead() { return this.life <= 0; }
  }
};

function drawGraphs(p, lambda, interval, counts, historyLen, hue) {
  const startX = 60;
  const startY = p.height - 80;
  const chartHeight = 120;
  const targetLambda = lambda * interval;

  // DYNAAMINEN SKAALAUS:
  // Määritetään kuinka monta pylvästä (k) näytetään.
  // Näytetään vähintään 15, mutta tarvittaessa enemmän jotta huippu mahtuu.
  let maxK = Math.max(15, Math.ceil(targetLambda * 2.2));
  let totalWidth = 500;
  let barWidth = totalWidth / maxK;

  p.push();
  p.fill(0, 0, 10, 90);
  p.noStroke();
  p.rect(startX - 20, startY - chartHeight - 40, totalWidth + 40, chartHeight + 80, 15);
  
  p.fill(255);
  p.textAlign(p.LEFT);
  p.textSize(14);
  p.text(`Odotusarvo E(X) = λt = ${targetLambda.toFixed(1)}`, startX, startY - chartHeight - 15);

  // Pylväät
  for (let k = 0; k <= maxK; k++) {
    let freq = counts[k] || 0;
    let prob = historyLen > 0 ? freq / historyLen : 0;
    let h = p.map(prob, 0, 0.5, 0, chartHeight);
    
    // Pylvään väri noudattaa samaa teemaa kuin tähdet
    p.fill(hue, 70, 80, 60);
    p.rect(startX + k * barWidth, startY - h, barWidth - 2, h);

    // Näytetään numerot vain joka toisessa jos k on suuri, jotta teksti ei puuroutuisi
    if (maxK < 25 || k % 2 === 0) {
      p.fill(255, 150);
      p.textSize(9);
      p.textAlign(p.CENTER);
      p.text(k, startX + k * barWidth + barWidth/2, startY + 15);
    }
  }

  // Teoreettinen Poisson-viiva
  p.noFill();
  p.stroke(hue, 100, 100); // Viivan väri dynaaminen
  p.strokeWeight(2);
  p.beginShape();
  for (let k = 0; k <= maxK; k++) {
    let tProb = poissonProb(k, targetLambda);
    let th = p.map(tProb, 0, 0.5, 0, chartHeight);
    p.vertex(startX + k * barWidth + barWidth/2, startY - th);
  }
  p.endShape();
  p.pop();
}
