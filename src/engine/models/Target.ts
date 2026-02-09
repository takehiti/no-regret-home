import { Point3D } from './Point3D';

/**
 * 目標地点（視線の終点）
 * 守りたい場所、確認したい場所を表す
 */
export interface Target {
  /** 位置（3D座標） */
  position: Point3D;

  /** 識別名（オプション） */
  name?: string;
}

/**
 * Targetを生成するヘルパー関数
 */
export function createTarget(position: Point3D, name?: string): Target {
  return { position, name };
}
