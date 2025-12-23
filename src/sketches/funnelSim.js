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
    p.colorMode(p.HSB, 360, 100, 100);
  };

  p.updateProps = (props) => {
    if (props) {
      if (props.lambda !== undefined) p.dropRate = props.lambda;
      if (props.capacity !== undefined) p.flowCapacity = props.capacity;
      if (props.resetFlag !== undefined && props.resetFlag !== resetFlag) {
        balls = [];
        resetFlag = props.resetFlag;
      }
    }
  };

  p.draw = () => {
    p.background(5, 5, 12);

    const topY = 150,
      botY = 350;
    const topXOff = 160,
      botXOff = 25;
    const holeWidth = p.map(p.flowCapacity, 0.01, 0.5, 10, 85);

    if (p.random(1) < p.dropRate && balls.length < 800) {
      const spawnX = p.random(p.width / 2 - 110, p.width / 2 + 110);
      balls.push(new Ball(p, spawnX, 50));
    }

    const subSteps = 8;
    for (let s = 0; s < subSteps; s++) {
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.updatePhysics(subSteps, botY);
        b.checkWallCollision(topY, botY, topXOff, botXOff, holeWidth);

        for (let j = i + 1; j < balls.length; j++) {
          b.resolveCollision(balls[j]);
        }
      }
    }

    drawFunnel(p, topY, botY, topXOff, botXOff, holeWidth);

    for (let i = balls.length - 1; i >= 0; i--) {
      balls[i].display();
      if (balls[i].y > p.height + 50) balls.splice(i, 1);
    }

    displayStats(p, p.dropRate * 60, p.flowCapacity * 60, balls.length);
  };

  class Ball {
    constructor(p, x, y) {
      this.p = p;
      this.x = x;
      this.y = y;
      this.vx = p.random(-0.2, 0.2);
      this.vy = 2;
      this.radius = 5.0;
    }

    updatePhysics(steps, botY) {
      // Painovoima (vakiovoima alas)
      const gravity = 0.35;
      this.vy += gravity / steps;

      this.x += this.vx / steps;
      this.y += this.vy / steps;

      // Ilmanvastus (estää kiihtymästä loputtomiin)
      this.vx *= 0.995;
      this.vy *= 0.995;

      // --- KORJATTU LEVIÄMINEN ---
      if (this.y > botY) {
        // Lisätään hajontaa vain hyvin pieni määrä, ettei pallo "leijailu" tapahdu
        // Spread force on nyt murto-osa aiemmasta
        const spreadFactor = 0.0004;
        this.vx += (this.x - this.p.width / 2) * spreadFactor;

        // Varmistetaan, että pystysuuntainen nopeus säilyy vähintään painovoiman tasolla
        if (this.vy < 2) this.vy += 0.1;
      }
    }

    checkWallCollision(topY, botY, topXOff, botXOff, holeWidth) {
      // Suppilon viistot seinät
      if (this.y > topY - 10 && this.y < botY) {
        let pct = (this.y - topY) / (botY - topY);
        let curOff = this.p.lerp(topXOff, botXOff, pct);
        let leftWall = this.p.width / 2 - curOff;
        let rightWall = this.p.width / 2 + curOff;

        if (this.x - this.radius < leftWall) {
          this.x = leftWall + this.radius;
          this.vx = Math.abs(this.vx) * 0.3 + 0.1; // Pieni potku poispäin seinästä
        }
        if (this.x + this.radius > rightWall) {
          this.x = rightWall - this.radius;
          this.vx = -Math.abs(this.vx) * 0.3 - 0.1;
        }
      }

      // Suppilon pohja ja reuna aukon kohdalla
      if (this.y + this.radius > botY && this.y < botY + 10) {
        let distFromCenter = Math.abs(this.x - this.p.width / 2);
        // Jos pallo on aukon ulkopuolella pohjan päällä
        if (distFromCenter > holeWidth / 2 - 2) {
          this.y = botY - this.radius;
          this.vy *= -0.05; // Erittäin pieni kimpoaminen
          // Ohjataan palloa kohti aukkoa
          let steer = (this.p.width / 2 - this.x) * 0.08;
          this.vx += steer;
        }
      }
    }

    resolveCollision(other) {
      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let minDistance = this.radius + other.radius + 0.1;
      let distSq = dx * dx + dy * dy;

      if (distSq < minDistance * minDistance) {
        let dist = Math.sqrt(distSq);
        if (dist === 0) return;
        let overlap = (minDistance - dist) / 2;
        let nx = dx / dist;
        let ny = dy / dist;

        // Siirretään palloja poispäin toisistaan
        this.x -= nx * overlap;
        this.y -= ny * overlap;
        other.x += nx * overlap;
        other.y += ny * overlap;

        // Kitka törmäyksessä
        let damping = 0.95;
        this.vx *= damping;
        this.vy *= damping;
        other.vx *= damping;
        other.vy *= damping;
      }
    }

    display() {
      // Väri muuttuu dynaamisesti korkeuden mukaan
      let currentHue = this.p.map(this.y, 50, 600, 200, 340);
      this.p.noStroke();
      this.p.fill(currentHue, 85, 100);
      this.p.circle(this.x, this.y, this.radius * 2);
    }
  }
};

function drawFunnel(p, topY, botY, topXOff, botXOff, holeWidth) {
  p.stroke(210, 70, 100);
  p.strokeWeight(5);
  p.noFill();

  p.line(p.width / 2 - topXOff, topY, p.width / 2 - botXOff, botY);
  p.line(p.width / 2 + topXOff, topY, p.width / 2 + botXOff, botY);
  p.line(p.width / 2 - botXOff, botY, p.width / 2 - holeWidth / 2, botY);
  p.line(p.width / 2 + botXOff, botY, p.width / 2 + holeWidth / 2, botY);
}

function displayStats(p, inRate, outCap, ballCount) {
  p.noStroke();
  p.fill(255, 200);
  p.textSize(14);
  p.textAlign(p.LEFT);
  p.text(`📥 Syöttö: ~${inRate.toFixed(0)}/s`, 40, 50);
  p.text(`📤 Kapasiteetti: ${outCap.toFixed(0)}`, 40, 75);

  let col = ballCount > 400 ? p.color(0, 90, 100) : p.color(55, 10, 100);
  p.fill(col);
  p.text(`📦 Sumassa: ${ballCount} kpl`, 40, 100);
}
