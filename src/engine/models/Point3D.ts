/**
 * 3次元座標を表す基本型
 */
export interface Point3D {
  /** X座標（メートル） */
  x: number;
  /** Y座標（メートル） */
  y: number;
  /** Z座標（メートル、高さ） */
  z: number;
}

/**
 * 2次元座標を表す型（平面）
 */
export interface Point2D {
  /** X座標（メートル） */
  x: number;
  /** Y座標（メートル） */
  y: number;
}

/**
 * Point3Dを生成するヘルパー関数
 */
export function createPoint3D(x: number, y: number, z: number): Point3D {
  return { x, y, z };
}

/**
 * Point2Dを生成するヘルパー関数
 */
export function createPoint2D(x: number, y: number): Point2D {
  return { x, y };
}

/**
 * Point3DをPoint2Dに投影（Z座標を削除）
 */
export function toPoint2D(point: Point3D): Point2D {
  return { x: point.x, y: point.y };
}

/**
 * Point2DをPoint3Dに拡張（Z座標を追加）
 */
export function toPoint3D(point: Point2D, z: number = 0): Point3D {
  return { x: point.x, y: point.y, z };
}

/**
 * 2つの Point3D が等しいかチェック（許容誤差あり）
 */
export function equals(a: Point3D, b: Point3D, epsilon: number = 1e-6): boolean {
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon
  );
}
