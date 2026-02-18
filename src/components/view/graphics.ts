import { Graphics } from "pixi.js";

// todo: draw actual star
export function drawStar(g: Graphics) {
  g.clear();
  g.beginFill(0x275a9c);
  g.drawCircle(0, 0, 16);
  g.beginHole();
  g.drawCircle(0, 0, 12);
  g.endHole();
  g.drawCircle(0, 0, 4);
}

export function drawChevron(g: Graphics, size = 8) {
  g.clear();
  g.lineStyle(2, 0xffffff);
  g.moveTo(-size, -size);
  g.lineTo(size, 0);
  g.moveTo(-size, size);
  g.lineTo(size, 0);
}
