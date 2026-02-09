import { Point3D } from '../models/Point3D';
import { Line } from '../models/Line';
import * as Vector from './vector';

/**
 * 交差判定ユーティリティ
 */

/**
 * レイと線分の交差判定（3D）
 * レイ: origin + direction * t（t >= 0）
 * 線分: line.start + (line.end - line.start) * s（0 <= s <= 1）
 *
 * @returns 交点（交差しない場合は null）
 */
export function rayLineIntersection(
  rayOrigin: Point3D,
  rayDirection: Point3D,
  line: Line
): Point3D | null {
  // 線分のベクトル
  const lineVec = Vector.subtract(line.end, line.start);
  const w = Vector.subtract(rayOrigin, line.start);

  // レイと線分の外積
  const crossRayLine = Vector.cross(rayDirection, lineVec);
  const crossWLine = Vector.cross(w, lineVec);

  const denom = Vector.magnitude(crossRayLine);

  // 平行チェック
  if (denom < 1e-8) {
    return null; // 平行または一致
  }

  // パラメータ t（レイ上）
  const t = Vector.dot(crossWLine, crossRayLine) / (denom * denom);

  if (t < 0) {
    return null; // レイの逆方向
  }

  // パラメータ s（線分上）
  const crossWRay = Vector.cross(w, rayDirection);
  const s = Vector.dot(crossWRay, crossRayLine) / (denom * denom);

  if (s < 0 || s > 1) {
    return null; // 線分の範囲外
  }

  // 交点を計算
  const intersection = Vector.add(
    rayOrigin,
    Vector.scale(rayDirection, t)
  );

  return intersection;
}

/**
 * 2本の線分の交差判定（2D、平面）
 *
 * @returns 交点（交差しない場合は null）
 */
export function lineLineIntersection2D(
  line1: Line,
  line2: Line
): Point3D | null {
  const x1 = line1.start.x;
  const y1 = line1.start.y;
  const x2 = line1.end.x;
  const y2 = line1.end.y;

  const x3 = line2.start.x;
  const y3 = line2.start.y;
  const x4 = line2.end.x;
  const y4 = line2.end.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (Math.abs(denom) < 1e-8) {
    return null; // 平行
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    // 交点を計算
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    const z = line1.start.z + t * (line1.end.z - line1.start.z);
    return { x, y, z };
  }

  return null; // 交差しない
}

/**
 * 視線とフェンス（垂直な壁）の交差判定
 * フェンスは line で定義される線分を、地面から height まで垂直に伸ばした壁
 *
 * @returns 交点（交差しない場合は null）
 */
export function rayFenceIntersection(
  rayOrigin: Point3D,
  rayDirection: Point3D,
  fenceLine: Line,
  fenceHeight: number,
  fenceGroundLevel: number = 0
): Point3D | null {
  // フェンスを2つの三角形で構成された四角形として扱う
  // 簡易実装: 平面との交差判定

  // フェンスの法線ベクトル（垂直方向）
  const fenceVec = Vector.subtract(fenceLine.end, fenceLine.start);
  const up = { x: 0, y: 0, z: 1 };
  const fenceNormal = Vector.normalize(Vector.cross(fenceVec, up));

  // 平面の方程式: normal · (P - P0) = 0
  // P0: フェンス線分上の任意の点
  const P0 = fenceLine.start;

  // レイと平面の交差判定
  const denom = Vector.dot(fenceNormal, rayDirection);

  if (Math.abs(denom) < 1e-8) {
    return null; // レイが平面と平行
  }

  const t = Vector.dot(Vector.subtract(P0, rayOrigin), fenceNormal) / denom;

  if (t < 0) {
    return null; // レイの逆方向
  }

  // 交点
  const intersection = Vector.add(
    rayOrigin,
    Vector.scale(rayDirection, t)
  );

  // 交点がフェンスの範囲内か確認
  // 1. 高さチェック
  if (intersection.z < fenceGroundLevel || intersection.z > fenceGroundLevel + fenceHeight) {
    return null;
  }

  // 2. 線分の範囲内かチェック
  const lineVec = Vector.subtract(fenceLine.end, fenceLine.start);
  const toIntersection = Vector.subtract(intersection, fenceLine.start);

  const lineLength = Vector.magnitude(lineVec);
  if (lineLength === 0) {
    return null;
  }

  const projection = Vector.dot(toIntersection, lineVec) / (lineLength * lineLength);

  if (projection < 0 || projection > 1) {
    return null; // 線分の範囲外
  }

  return intersection;
}
