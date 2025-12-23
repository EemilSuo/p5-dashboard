export const bouncingBalls = (p) => {
  let balls = [];
  let gravity = 0.25;
  let lambda = 0.1;

  p.setup = () => {
    p.createCanvas(p.windowWidth - 250, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };

  p.draw = () => {
    p.background(0, 20);

    // Poisson-prosessi: uusi pallo syntyy tietyllä todennäköisyydellä
    if (p.random(1) < lambda) {
      balls.push(new Ball(p));
    }

    for (let i = balls.length - 1; i >= 0; i--) {
      balls[i].update();
      balls[i].display();
      if (balls[i].y > p.height + 100) balls.splice(i, 1);
    }
  };

  p.updateProps = (props) => {
    if (props.lambda !== undefined) lambda = props.lambda;
  };

  class Ball {
    constructor(p) {
      this.p = p;
      this.x = p.random(p.width);
      this.y = -20;
      this.velY = 0;
      this.size = p.random(10, 30);
      this.hue = p.random(0, 60); // Lämpimiä värejä palloille
    }
    update() {
      this.velY += gravity;
      this.y += this.velY;
      if (this.y + this.size / 2 > this.p.height) {
        this.y = this.p.height - this.size / 2;
        this.velY *= -0.7;
      }
    }
    display() {
      this.p.fill(this.hue, 80, 100);
      this.p.noStroke();
      this.p.ellipse(this.x, this.y, this.size);
    }
  }
};
