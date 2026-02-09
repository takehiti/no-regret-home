import { Line } from './Line';
import { Point3D } from './Point3D';

/**
 * フェンス（視線を遮る障害物）
 */
export interface Fence {
  /** フェンスの線分（地面レベルでの配置） */
  line: Line;

  /** フェンスの高さ（メートル） */
  height: number;

  /** 地盤高さ（デフォルト: 0） */
  groundLevel?: number;

  /** 識別名（オプション） */
  name?: string;
}

/**
 * Fenceを生成するヘルパー関数
 */
export function createFence(
  line: Line,
  height: number,
  groundLevel: number = 0,
  name?: string
): Fence {
  return { line, height, groundLevel, name };
}

/**
 * フェンスの上端の高さを取得
 */
export function getTopHeight(fence: Fence): number {
  const groundLevel = fence.groundLevel ?? 0;
  return groundLevel + fence.height;
}

/**
 * フェンスの上端の始点を取得
 */
export function getTopStart(fence: Fence): Point3D {
  const topHeight = getTopHeight(fence);
  return {
    x: fence.line.start.x,
    y: fence.line.start.y,
    z: topHeight,
  };
}

/**
 * フェンスの上端の終点を取得
 */
export function getTopEnd(fence: Fence): Point3D {
  const topHeight = getTopHeight(fence);
  return {
    x: fence.line.end.x,
    y: fence.line.end.y,
    z: topHeight,
  };
}

/**
 * フェンスの上端を線分として取得
 */
export function getTopLine(fence: Fence): Line {
  return {
    start: getTopStart(fence),
    end: getTopEnd(fence),
  };
}
