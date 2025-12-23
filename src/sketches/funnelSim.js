import { poissonProb } from "../utils/mathUtils";

export const funnelSim = (p) => {
  let balls = [];
  p.dropRate = 0.1;
  p.flowCapacity = 0.1;
  let resetFlag = 0;

  p.setup = () => {
    const canvasParent = p.canvas.parentElement;
    p.createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
    p.pixelDensity(1);
  };

  p.updateProps = (props) => {
    if (props) {
      if (props.lambda !== undefined) p.dropRate = props.lambda;
      if (props.capacity !== undefined) p.flowCapacity = props.capacity;
      if (props.resetFlag !== resetFlag) {
        balls = [];
        resetFlag = props.resetFlag;
      }
    }
  };

  p.draw = () => {
    p.background(10, 10, 20);

    // --- PÄIVITETTY: LEVEÄMPI SYNTYALUE ---
    // Suppilon yläosan leveys on noin 160px keskeltä kumpaankin suuntaan.
    // Asetetaan syntyalueeksi +/- 120px, jotta pallot putoavat suppiloon mutta hajautetusti.
    if (p.random(1) < p.dropRate && balls.length < 600) {
      const spawnX = p.random(p.width / 2 - 120, p.width / 2 + 120);
      balls.push(new Ball(p, spawnX, 50));
    }

    const topY = 150,
      botY = 350;
    const topXOff = 160,
      botXOff = 25;
    const holeWidth = p.map(p.flowCapacity, 0.01, 0.5, 8, 80);

    // Fysiikan alivaiheet
    const subSteps = 8;
    for (let s = 0; s < subSteps; s++) {
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.updatePhysics(subSteps);
        b.checkWallCollision(topY, botY, topXOff, botXOff, holeWidth);
        for (let j = i + 1; j < balls.length; j++) {
          b.resolveCollision(balls[j]);
        }
      }
    }

    drawFunnel(p, topY, botY, topXOff, botXOff, holeWidth);

    p.noStroke();
    for (let i = balls.length - 1; i >= 0; i--) {
      balls[i].display();
      if (balls[i].y > p.height) balls.splice(i, 1);
    }

    displayStats(p, p.dropRate * 60, p.flowCapacity * 60, balls.length);
  };

  class Ball {
    constructor(p, x, y) {
      this.p = p;
      this.x = x;
      this.y = y;
      this.vx = p.random(-0.3, 0.3); // Pieni sivuttaisliike heti alussa
      this.vy = 2;
      this.radius = 5.0;
    }

    updatePhysics(steps) {
      this.vy += 0.25 / steps;
      this.x += this.vx / steps;
      this.y += this.vy / steps;
      this.vx *= 0.995;
      this.vy *= 0.995;
    }

    checkWallCollision(topY, botY, topXOff, botXOff, holeWidth) {
      if (this.y > topY - 20 && this.y < botY + 10) {
        let pct = (this.y - topY) / (botY - topY);
        pct = Math.max(0, Math.min(1, pct));
        let curOff = p.lerp(topXOff, botXOff, pct);
        let leftWall = p.width / 2 - curOff;
        let rightWall = p.width / 2 + curOff;

        if (this.x - this.radius < leftWall) {
          this.x = leftWall + this.radius;
          this.vx = Math.abs(this.vx) * 0.2;
        }
        if (this.x + this.radius > rightWall) {
          this.x = rightWall - this.radius;
          this.vx = -Math.abs(this.vx) * 0.2;
        }

        if (this.y + this.radius > botY) {
          let distFromCenter = Math.abs(this.x - p.width / 2);
          if (distFromCenter > holeWidth / 2) {
            this.y = botY - this.radius;
            this.vy *= -0.05;
            this.vx += (p.width / 2 - this.x) * 0.05;
          }
        }
      }
    }

    resolveCollision(other) {
      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let minDistance = this.radius + other.radius;
      let distanceSq = dx * dx + dy * dy;

      if (distanceSq < minDistance * minDistance) {
        let distance = Math.sqrt(distanceSq);
        if (distance === 0) return;
        let overlap = minDistance - distance;
        let nx = dx / distance;
        let ny = dy / distance;
        let moveX = nx * overlap * 0.5;
        let moveY = ny * overlap * 0.5;
        this.x -= moveX;
        this.y -= moveY;
        other.x += moveX;
        other.y += moveY;
        this.vx *= 0.9;
        this.vy *= 0.9;
        other.vx *= 0.9;
        other.vy *= 0.9;
      }
    }

    display() {
      let hue = this.p.map(this.y, 150, 350, 45, 25);
      this.p.fill(hue, 90, 100);
      this.p.circle(this.x, this.y, this.radius * 2);
    }
  }
};

function drawFunnel(p, topY, botY, topXOff, botXOff, holeWidth) {
  p.stroke(100, 150, 255);
  p.strokeWeight(6);
  p.line(p.width / 2 - topXOff, topY, p.width / 2 - botXOff, botY);
  p.line(p.width / 2 + topXOff, topY, p.width / 2 + botXOff, botY);
  p.line(p.width / 2 - botXOff, botY, p.width / 2 - holeWidth / 2, botY);
  p.line(p.width / 2 + botXOff, botY, p.width / 2 + holeWidth / 2, botY);
}

function displayStats(p, inRate, outCap, ballCount) {
  p.noStroke();
  p.fill(255);
  p.textSize(15);
  p.text(`📥 Tulo: ~${inRate.toFixed(0)}/min`, 30, 50);
  p.text(`📤 Aukon kapasiteetti: ${outCap.toFixed(0)}`, 30, 80);
  let col = ballCount > 300 ? p.color(255, 100, 100) : p.color(255, 255, 150);
  p.fill(col);
  p.text(`📦 Jonossa: ${ballCount} palloa`, 30, 110);
}
