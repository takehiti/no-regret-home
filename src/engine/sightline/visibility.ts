import { Point3D } from '../models/Point3D';
import { Observer, getEyePosition } from '../models/Observer';
import { Target } from '../models/Target';
import { Fence } from '../models/Fence';
import { Sightline, createSightline } from '../models/Sightline';
import * as Vector from '../geometry/vector';
import * as Intersection from '../geometry/intersection';

/**
 * 視線可視性判定
 */

/**
 * 観測者から目標への視線がフェンスによって遮られるかチェック
 *
 * @param observer 観測者
 * @param target 目標地点
 * @param fence フェンス
 * @returns 視線情報（Sightline）
 */
export function checkSightlineObstruction(
  observer: Observer,
  target: Target,
  fence: Fence
): Sightline {
  // 観測者の目線位置
  const eyePos = getEyePosition(observer);

  // 視線ベクトル（方向）
  const sightlineVec = Vector.subtract(target.position, eyePos);
  const sightlineDir = Vector.normalize(sightlineVec);

  // フェンスとの交差判定
  const fenceGroundLevel = fence.groundLevel ?? 0;
  const intersection = Intersection.rayFenceIntersection(
    eyePos,
    sightlineDir,
    fence.line,
    fence.height,
    fenceGroundLevel
  );

  if (intersection) {
    // 交差した = 遮られた
    return createSightline(
      eyePos,
      target.position,
      true, // obstructed
      intersection,
      fence.name || 'fence'
    );
  }

  // 遮られなかった
  return createSightline(
    eyePos,
    target.position,
    false // not obstructed
  );
}

/**
 * 複数の観測者・目標に対して視線判定を実行
 *
 * @param observers 観測者リスト
 * @param targets 目標地点リスト
 * @param fence フェンス
 * @returns すべての視線情報
 */
export function checkMultipleSightlines(
  observers: Observer[],
  targets: Target[],
  fence: Fence
): Sightline[] {
  const sightlines: Sightline[] = [];

  for (const observer of observers) {
    for (const target of targets) {
      const sightline = checkSightlineObstruction(observer, target, fence);
      sightlines.push(sightline);
    }
  }

  return sightlines;
}

/**
 * すべての視線が遮られているかチェック
 *
 * @param sightlines 視線リスト
 * @returns すべて遮られている場合 true
 */
export function areAllObstructed(sightlines: Sightline[]): boolean {
  return sightlines.every((s) => s.obstructed);
}

/**
 * 少なくとも1つの視線が遮られていないかチェック
 *
 * @param sightlines 視線リスト
 * @returns 1つでも遮られていない場合 true
 */
export function isAnyVisible(sightlines: Sightline[]): boolean {
  return sightlines.some((s) => !s.obstructed);
}
