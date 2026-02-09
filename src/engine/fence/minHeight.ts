import { Point3D } from '../models/Point3D';
import { Line } from '../models/Line';
import { Observer, getEyePosition } from '../models/Observer';
import { Target } from '../models/Target';
import { Fence } from '../models/Fence';
import * as Vector from '../geometry/vector';
import * as Intersection from '../geometry/intersection';

/**
 * 必要最小フェンス高さ計算
 */

/**
 * 視線を遮るために必要な最小フェンス高さを計算
 *
 * @param observer 観測者
 * @param target 目標地点
 * @param fenceLine フェンス線分
 * @param fenceGroundLevel フェンスの地盤高さ
 * @returns 必要最小高さ（メートル）、交差しない場合は 0
 */
export function calculateMinimumHeight(
  observer: Observer,
  target: Target,
  fenceLine: Line,
  fenceGroundLevel: number = 0
): number {
  // 観測者の目線位置
  const eyePos = getEyePosition(observer);

  // 視線ベクトル
  const sightlineVec = Vector.subtract(target.position, eyePos);
  const sightlineDir = Vector.normalize(sightlineVec);

  // フェンス平面（垂直）との交差判定
  // フェンスの法線ベクトル
  const fenceVec = Vector.subtract(fenceLine.end, fenceLine.start);
  const up = { x: 0, y: 0, z: 1 };
  const fenceNormal = Vector.normalize(Vector.cross(fenceVec, up));

  // 平面との交差パラメータ t
  const P0 = fenceLine.start;
  const denom = Vector.dot(fenceNormal, sightlineDir);

  if (Math.abs(denom) < 1e-8) {
    // レイが平面と平行 → 交差しない
    return 0;
  }

  const t = Vector.dot(Vector.subtract(P0, eyePos), fenceNormal) / denom;

  if (t < 0) {
    // レイの逆方向 → 交差しない
    return 0;
  }

  // 交点（仮想）
  const intersection = Vector.add(eyePos, Vector.scale(sightlineDir, t));

  // 交点がフェンス線分の範囲内かチェック
  const lineVec = Vector.subtract(fenceLine.end, fenceLine.start);
  const toIntersection = Vector.subtract(intersection, fenceLine.start);

  const lineLength = Vector.magnitude(lineVec);
  if (lineLength === 0) {
    return 0;
  }

  const projection = Vector.dot(toIntersection, lineVec) / (lineLength * lineLength);

  if (projection < 0 || projection > 1) {
    // 線分の範囲外 → 交差しない
    return 0;
  }

  // 交点の高さ
  const intersectionHeight = intersection.z;

  // 必要最小高さ = 交点高さ - 地盤高さ
  const minHeight = intersectionHeight - fenceGroundLevel;

  return Math.max(0, minHeight);
}

/**
 * 複数の観測者・目標に対して必要最小高さを計算（最大値を返す）
 *
 * @param observers 観測者リスト
 * @param targets 目標地点リスト
 * @param fenceLine フェンス線分
 * @param fenceGroundLevel フェンスの地盤高さ
 * @returns すべての視線を遮るために必要な最大高さ
 */
export function calculateMaximumMinimumHeight(
  observers: Observer[],
  targets: Target[],
  fenceLine: Line,
  fenceGroundLevel: number = 0
): number {
  let maxHeight = 0;

  for (const observer of observers) {
    for (const target of targets) {
      const height = calculateMinimumHeight(observer, target, fenceLine, fenceGroundLevel);
      maxHeight = Math.max(maxHeight, height);
    }
  }

  return maxHeight;
}
