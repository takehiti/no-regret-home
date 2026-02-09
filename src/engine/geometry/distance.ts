import { Point3D, Point2D } from '../models/Point3D';
import { Line } from '../models/Line';
import * as Vector from './vector';

/**
 * 距離計算ユーティリティ
 */

/**
 * 2点間の距離（3D）
 */
export function between3D(a: Point3D, b: Point3D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 2点間の距離（2D、平面）
 */
export function between2D(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 点から線分への最短距離（3D）
 */
export function pointToLine(point: Point3D, line: Line): number {
  const lineVec = Vector.subtract(line.end, line.start);
  const pointVec = Vector.subtract(point, line.start);

  const lineLengthSq = Vector.dot(lineVec, lineVec);

  if (lineLengthSq === 0) {
    // 線分の長さが0（始点=終点）
    return between3D(point, line.start);
  }

  // 線分上の最近点のパラメータ t（0〜1にクランプ）
  let t = Vector.dot(pointVec, lineVec) / lineLengthSq;
  t = Math.max(0, Math.min(1, t));

  // 線分上の最近点
  const closestPoint = Vector.lerp(line.start, line.end, t);

  return between3D(point, closestPoint);
}

/**
 * 点から線分への最近点を取得（3D）
 */
export function closestPointOnLine(point: Point3D, line: Line): Point3D {
  const lineVec = Vector.subtract(line.end, line.start);
  const pointVec = Vector.subtract(point, line.start);

  const lineLengthSq = Vector.dot(lineVec, lineVec);

  if (lineLengthSq === 0) {
    return line.start;
  }

  let t = Vector.dot(pointVec, lineVec) / lineLengthSq;
  t = Math.max(0, Math.min(1, t));

  return Vector.lerp(line.start, line.end, t);
}
