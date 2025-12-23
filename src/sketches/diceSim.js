export const diceSim = (p) => {
  let diceValues = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  let history = []; // Kaikki heitetyt silmäluvut
  let counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let rollsDone = 0;
  let lastRollTime = 0;

  p.rollLimit = 100;
  p.interval = 1000; // ms
  let resetFlag = 0;

  p.setup = () => {
    const canvasParent = p.canvas.parentElement;
    p.createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
  };

  p.updateProps = (props) => {
    if (props) {
      if (props.rollLimit !== undefined) p.rollLimit = props.rollLimit;
      if (props.interval !== undefined) p.interval = props.interval;
      if (props.resetFlag !== undefined && props.resetFlag !== resetFlag) {
        resetFlag = props.resetFlag;
        diceValues = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        history = [];
        counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        rollsDone = 0;
      }
    }
  };

  p.draw = () => {
    p.background(10, 15, 25);

    // Heitto-logiikka
    if (rollsDone < p.rollLimit && p.millis() - lastRollTime > p.interval) {
      for (let i = 0; i < 10; i++) {
        let val = p.floor(p.random(1, 7));
        diceValues[i] = val;
        counts[val]++;
        history.push(val);
      }
      rollsDone++;
      lastRollTime = p.millis();
    }

    // 1. Piirretään nopat
    drawDice(p, diceValues);

    // 2. Piirretään kaaviot
    drawGraphs(p, counts, history.length);

    // Statsit
    p.fill(255);
    p.noStroke();
    p.textSize(16);
    p.text(`Heittokierrokset: ${rollsDone} / ${p.rollLimit}`, 40, 40);
    p.textSize(12);
    p.fill(150);
    p.text(`Yksittäisiä noppia heitetty: ${history.length} kpl`, 40, 60);
  };
};

function drawDice(p, values) {
  const size = 50;
  const startX = p.width / 2 - 275;
  const y = 120;

  for (let i = 0; i < 10; i++) {
    let x = startX + i * 60;

    // Nopan runko
    p.fill(255);
    p.stroke(200);
    p.strokeWeight(1);
    p.rect(x, y, size, size, 10);

    // Silmäluvun pisteet
    p.fill(0);
    p.noStroke();
    drawDots(p, x + size / 2, y + size / 2, values[i], size);
  }
}

function drawDots(p, cx, cy, val, size) {
  const d = size * 0.2;
  const off = size * 0.25;

  if (val % 2 === 1) p.circle(cx, cy, d); // Keskipiste
  if (val > 1) {
    p.circle(cx - off, cy - off, d);
    p.circle(cx + off, cy + off, d);
  }
  if (val > 3) {
    p.circle(cx + off, cy - off, d);
    p.circle(cx - off, cy + off, d);
  }
  if (val === 6) {
    p.circle(cx - off, cy, d);
    p.circle(cx + off, cy, d);
  }
}

function drawGraphs(p, counts, total) {
  const x = 60;
  const y = p.height - 100;
  const w = 500;
  const h = 150;
  const barW = w / 6;

  // Teoreettinen tasajakauma (1/6 ≈ 16.67%)
  p.stroke(255, 100, 100, 150);
  p.strokeWeight(2);
  p.noFill();
  let theoY = y - (1 / 6) * h * 2.5; // Skaalaus
  p.line(x, theoY, x + w, theoY);
  p.fill(255, 100, 100);
  p.noStroke();
  p.textSize(10);
  p.text("Teoreettinen (16.7%)", x + w + 10, theoY + 4);

  // Toteutunut jakauma
  for (let i = 1; i <= 6; i++) {
    let pct = total > 0 ? counts[i] / total : 0;
    let barH = pct * h * 2.5;

    p.fill(100, 150, 255);
    p.rect(x + (i - 1) * barW + 5, y - barH, barW - 10, barH);

    p.fill(255);
    p.textAlign(p.CENTER);
    p.text(i, x + (i - 1) * barW + barW / 2, y + 20);
    p.textSize(9);
    p.text(
      (pct * 100).toFixed(1) + "%",
      x + (i - 1) * barW + barW / 2,
      y - barH - 5,
    );
  }
  p.textAlign(p.LEFT);
}
