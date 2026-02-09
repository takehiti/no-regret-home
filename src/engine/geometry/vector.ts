import { Point3D } from '../models/Point3D';

/**
 * ベクトル演算ユーティリティ
 */

/**
 * 2点間のベクトルを計算（from → to）
 */
export function subtract(to: Point3D, from: Point3D): Point3D {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
    z: to.z - from.z,
  };
}

/**
 * ベクトルの加算
 */
export function add(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

/**
 * ベクトルのスカラー倍
 */
export function scale(v: Point3D, scalar: number): Point3D {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar,
  };
}

/**
 * ベクトルの長さ（ノルム）
 */
export function magnitude(v: Point3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * ベクトルの正規化（単位ベクトル化）
 */
export function normalize(v: Point3D): Point3D {
  const mag = magnitude(v);
  if (mag === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: v.x / mag,
    y: v.y / mag,
    z: v.z / mag,
  };
}

/**
 * ベクトルの内積（ドット積）
 */
export function dot(a: Point3D, b: Point3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * ベクトルの外積（クロス積）
 */
export function cross(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * 2つのベクトルのなす角度（ラジアン）
 */
export function angleBetween(a: Point3D, b: Point3D): number {
  const magA = magnitude(a);
  const magB = magnitude(b);

  if (magA === 0 || magB === 0) {
    return 0;
  }

  const cosTheta = dot(a, b) / (magA * magB);
  // 数値誤差で範囲外になることを防ぐ
  const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));
  return Math.acos(clampedCosTheta);
}

/**
 * 線形補間（lerp）
 */
export function lerp(a: Point3D, b: Point3D, t: number): Point3D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}
