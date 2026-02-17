import { TouchZone } from "@/lib/chart";

export interface SensorPosition {
  x: number;
  y: number;
  angle: number;
}

const SENSOR_RADIUS_RATIO = 0.65;

export function getSensorPosition(
  zone: TouchZone,
  position: number,
  radius: number,
): SensorPosition {
  const centerRadius = radius * SENSOR_RADIUS_RATIO;

  switch (zone) {
    case "A":
      return getASensorPosition(position, centerRadius);
    case "B":
      return getBSensorPosition(position, centerRadius);
    case "C":
      return getCSensorPosition(centerRadius);
    case "D":
      return getDSensorPosition(position, centerRadius);
    case "E":
      return getESensorPosition(position, centerRadius);
  }
}

function getASensorPosition(position: number, radius: number): SensorPosition {
  const clampedPosition = Math.max(1, Math.min(8, position));
  const angle = ((clampedPosition - 1) * 45 + 22.5) * (Math.PI / 180);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    angle,
  };
}

function getBSensorPosition(position: number, radius: number): SensorPosition {
  const clampedPosition = Math.max(1, Math.min(8, position));
  const angle = ((clampedPosition - 1) * 45 - 22.5) * (Math.PI / 180);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    angle,
  };
}

function getCSensorPosition(_radius: number): SensorPosition {
  return {
    x: 0,
    y: 0,
    angle: 0,
  };
}

function getDSensorPosition(position: number, radius: number): SensorPosition {
  const clampedPosition = Math.max(1, Math.min(8, position));
  const angle = ((clampedPosition - 1) * 45 - 22.5 + 180) * (Math.PI / 180);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    angle,
  };
}

function getESensorPosition(position: number, radius: number): SensorPosition {
  const clampedPosition = Math.max(1, Math.min(8, position));
  const angle = ((clampedPosition - 1) * 45 + 22.5 + 180) * (Math.PI / 180);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    angle,
  };
}

export function getSensorColor(zone: TouchZone): number {
  switch (zone) {
    case "A":
      return 0xff6666;
    case "B":
      return 0x66ff66;
    case "C":
      return 0x6666ff;
    case "D":
      return 0xffff66;
    case "E":
      return 0xff66ff;
  }
}
