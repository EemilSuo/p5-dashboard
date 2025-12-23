import { poissonProb } from "../utils/mathUtils";

export const galtonBoard = (p) => {
  p.disableFriendlyErrors = true;

  let balls = [];
  let pegs = [];
  let bins = [];
  let theoreticalProbs = [];

  // KIINTEÄT NOPEUDET
  const dropSpeed = 0.3;
  let ballsDropped = 0; // Laskuri pudotetuille palloille
  p.ballLimit = 200; // Haetaan propsista

  let resetFlag = 0;
  let isInitialized = false;

  const rows = 18;
  const pegSpacingX = 28;
  const pegSpacingY = 28;
  const ballRadius = 4.0;
  const pegRadius = 3.0;
  const startY = 60;

  let binAreaMinX = 0;
  let binAreaMaxX = 0;

  p.setup = () => {
    const canvasParent = p.canvas.parentElement;
    if (!canvasParent) return;

    p.createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
    p.pixelDensity(1);
    p.colorMode(p.HSB, 360, 100, 100);

    initBoard();
    isInitialized = true;
  };

  p.updateProps = (props) => {
    if (props) {
      if (props.ballLimit !== undefined) p.ballLimit = props.ballLimit;
      if (props.resetFlag !== undefined && props.resetFlag !== resetFlag) {
        resetFlag = props.resetFlag;
        balls = [];
        ballsDropped = 0; // Nollataan laskuri
        if (isInitialized) initBins();
      }
    }
  };

  const factorial = (n) => {
    if (n <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const precomputeProbabilities = () => {
    theoreticalProbs = [];
    for (let k = 0; k <= rows; k++) {
      let coeff = factorial(rows) / (factorial(k) * factorial(rows - k));
      let prob = coeff * Math.pow(0.5, rows);
      theoreticalProbs.push(prob);
    }
  };

  const initBoard = () => {
    if (!p.width) return;
    pegs = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c <= r; c++) {
        let xOffset = p.width / 2 + c * pegSpacingX - (r * pegSpacingX) / 2;
        let y = startY + r * pegSpacingY;
        pegs.push(new Peg(p, xOffset, y, pegRadius));
      }
    }
    precomputeProbabilities();
    initBins();
  };

  const initBins = () => {
    if (!p.width) return;
    bins = [];
    let binCount = rows + 1;
    let totalWidth = binCount * pegSpacingX;
    let startX = p.width / 2 - totalWidth / 2;
    let binY = startY + rows * pegSpacingY + 40;
    let binHeight = p.height - binY - 10;

    for (let i = 0; i < binCount; i++) {
      bins.push(
        new Bin(p, startX + i * pegSpacingX, binY, pegSpacingX, binHeight),
      );
    }

    if (bins.length > 0) {
      binAreaMinX = bins[0].x;
      binAreaMaxX = bins[bins.length - 1].x + bins[bins.length - 1].w;
    }
  };

  const drawTheoreticalCurve = () => {
    if (bins.length < 2 || theoreticalProbs.length === 0) return;
    let totalBallsInBins = 0;
    bins.forEach((b) => (totalBallsInBins += b.count));
    if (totalBallsInBins < 5) return;

    p.push();
    p.noFill();
    p.stroke(0, 100, 100, 70);
    p.strokeWeight(2);
    p.beginShape();
    for (let k = 0; k <= rows; k++) {
      let expectedHeight =
        theoreticalProbs[k] * totalBallsInBins * (ballRadius * 1.8 * 2);
      let x = bins[k].x + bins[k].w / 2;
      let y = bins[k].y + bins[k].h - expectedHeight;
      p.vertex(x, y);
    }
    p.endShape();
    p.pop();
  };

  p.draw = () => {
    if (!isInitialized) return;
    p.background(0);

    // KORJAUS: Tiputetaan palloja vain jos raja ei ole täynnä
    if (ballsDropped < p.ballLimit && p.random(1) < dropSpeed) {
      balls.push(
        new Ball(p, p.width / 2 + p.random(-0.5, 0.5), 20, ballRadius),
      );
      ballsDropped++;
    }

    for (let peg of pegs) peg.display();
    for (let bin of bins) bin.display();

    if (bins.length > 0) {
      p.stroke(0, 0, 40);
      p.strokeWeight(2);
      p.line(binAreaMaxX, bins[0].y, binAreaMaxX, bins[0].y + bins[0].h);
    }

    // Fysiikka
    let subSteps = 3;
    for (let s = 0; s < subSteps; s++) {
      for (let i = balls.length - 1; i >= 0; i--) {
        let b = balls[i];
        if (b.active) {
          b.update(subSteps, binAreaMinX, binAreaMaxX);
          for (let peg of pegs) b.checkPegCollision(peg);
          for (let bin of bins) bin.checkBallEntry(b);
        }
      }
    }

    // Piirretään pallot
    p.noStroke();
    for (let b of balls) {
      b.display();
    }

    // Siivous
    for (let i = balls.length - 1; i >= 0; i--) {
      if (balls[i].y > p.height + 50) balls.splice(i, 1);
    }

    drawTheoreticalCurve();

    // Statsit
    p.fill(255);
    p.noStroke();
    p.textSize(16);
    p.textAlign(p.LEFT);
    p.text(`Edistyminen: ${ballsDropped} / ${p.ballLimit}`, 30, 40);
    if (ballsDropped >= p.ballLimit && balls.every((b) => !b.active)) {
      p.fill(0, 100, 100);
      p.text("VALMIS", 30, 65);
    }
  };

  // --- LUOKAT ---
  class Peg {
    constructor(p, x, y, r) {
      this.p = p;
      this.x = x;
      this.y = y;
      this.r = r;
    }
    display() {
      this.p.noStroke();
      this.p.fill(0, 0, 85);
      this.p.circle(this.x, this.y, this.r * 2);
    }
  }

  class Bin {
    constructor(p, x, y, w, h) {
      this.p = p;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.count = 0;
    }
    checkBallEntry(ball) {
      if (ball.x > this.x && ball.x < this.x + this.w && ball.y > this.y) {
        ball.active = false;
        ball.vx = 0;
        ball.vy = 0;
        ball.x = this.x + this.w / 2;
        ball.y = this.y + this.h - this.count * ball.r * 1.8 - ball.r;
        this.count++;
      }
    }
    display() {
      this.p.stroke(0, 0, 45);
      this.p.strokeWeight(2);
      this.p.line(this.x, this.y, this.x, this.y + this.h);
    }
  }

  class Ball {
    constructor(p, x, y, r) {
      this.p = p;
      this.x = x;
      this.y = y;
      this.r = r;
      this.active = true;
      this.vx = 0;
      this.vy = 2;
      this.hue = p.random(0, 360);
      this.color = p.color(this.hue, 100, 100);
      this.elasticity = 0.45;
    }
    update(steps, minX, maxX) {
      this.vy += 0.25 / steps;
      this.x += this.vx / steps;
      this.y += this.vy / steps;
      this.vx *= 0.992;
      if (this.x < minX + this.r) {
        this.x = minX + this.r;
        this.vx = Math.abs(this.vx) * 0.4;
      } else if (this.x > maxX - this.r) {
        this.x = maxX - this.r;
        this.vx = -Math.abs(this.vx) * 0.4;
      }
    }
    checkPegCollision(peg) {
      let dx = this.x - peg.x;
      let dy = this.y - peg.y;
      let distSq = dx * dx + dy * dy;
      let minDist = this.r + peg.r;
      if (distSq < minDist * minDist) {
        let distance = Math.sqrt(distSq);
        let nx = dx / distance;
        let ny = dy / distance;
        this.x += nx * (minDist - distance);
        this.y += ny * (minDist - distance);
        let dot = this.vx * nx + this.vy * ny;
        this.vx = (this.vx - 2 * dot * nx) * this.elasticity;
        this.vy = (this.vy - 2 * dot * ny) * this.elasticity;
        this.vx += this.p.random(-0.4, 0.4);
      }
    }
    display() {
      this.p.fill(this.color);
      this.p.circle(this.x, this.y, this.r * 2);
    }
  }
};
