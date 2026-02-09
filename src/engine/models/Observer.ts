import { Point3D } from './Point3D';

/**
 * 観測者（視線の起点）
 * 人物、窓、カメラなどを表す
 */
export interface Observer {
  /** 位置（3D座標） */
  position: Point3D;

  /** 目線の高さ（デフォルト: 1.6m = 標準的な人の目線） */
  eyeHeight?: number;

  /** 識別名（オプション） */
  name?: string;
}

/**
 * Observerを生成するヘルパー関数
 */
export function createObserver(
  position: Point3D,
  eyeHeight: number = 1.6,
  name?: string
): Observer {
  return { position, eyeHeight, name };
}

/**
 * 観測者の実際の目線位置を取得
 * position.z + eyeHeight を考慮
 */
export function getEyePosition(observer: Observer): Point3D {
  const eyeHeight = observer.eyeHeight ?? 1.6;
  return {
    x: observer.position.x,
    y: observer.position.y,
    z: observer.position.z + eyeHeight,
  };
}
