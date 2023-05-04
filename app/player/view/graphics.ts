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
