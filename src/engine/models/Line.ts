import { Point3D } from './Point3D';

/**
 * 3次元空間における線分
 */
export interface Line {
  /** 始点 */
  start: Point3D;
  /** 終点 */
  end: Point3D;
}

/**
 * Lineを生成するヘルパー関数
 */
export function createLine(start: Point3D, end: Point3D): Line {
  return { start, end };
}

/**
 * 線分の長さを計算
 */
export function length(line: Line): number {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  const dz = line.end.z - line.start.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 線分の方向ベクトルを取得（正規化なし）
 */
export function direction(line: Line): Point3D {
  return {
    x: line.end.x - line.start.x,
    y: line.end.y - line.start.y,
    z: line.end.z - line.start.z,
  };
}

/**
 * 線分の中点を取得
 */
export function midpoint(line: Line): Point3D {
  return {
    x: (line.start.x + line.end.x) / 2,
    y: (line.start.y + line.end.y) / 2,
    z: (line.start.z + line.end.z) / 2,
  };
}

/**
 * 線分上の点を取得（t: 0〜1）
 * t=0: start, t=1: end
 */
export function pointAt(line: Line, t: number): Point3D {
  return {
    x: line.start.x + (line.end.x - line.start.x) * t,
    y: line.start.y + (line.end.y - line.start.y) * t,
    z: line.start.z + (line.end.z - line.start.z) * t,
  };
}
