import { Observer } from '../models/Observer';
import { Target } from '../models/Target';
import { Fence } from '../models/Fence';
import { VisibilityJudgment, createVisibilityJudgment } from '../models/VisibilityJudgment';
import { checkMultipleSightlines, isAnyVisible } from '../sightline/visibility';
import { calculateMaximumMinimumHeight } from './minHeight';

/**
 * フェンス判定の総合評価
 */

/**
 * 視線フェンス判定の入力
 */
export interface VisibilityCheckInput {
  /** 観測者リスト */
  observers: Observer[];

  /** 目標地点リスト */
  targets: Target[];

  /** フェンス */
  fence: Fence;
}

/**
 * 視線フェンス判定を実行
 *
 * @param input 入力パラメータ
 * @returns 判定結果（VisibilityJudgment）
 */
export function checkVisibility(input: VisibilityCheckInput): VisibilityJudgment {
  const { observers, targets, fence } = input;

  // 1. すべての視線を判定
  const sightlines = checkMultipleSightlines(observers, targets, fence);

  // 2. 少なくとも1つの視線が通っているか
  const visible = isAnyVisible(sightlines);

  // 3. 必要最小高さを計算
  const fenceGroundLevel = fence.groundLevel ?? 0;
  const minimumFenceHeight = calculateMaximumMinimumHeight(
    observers,
    targets,
    fence.line,
    fenceGroundLevel
  );

  // 4. 現在のフェンス高さ
  const currentFenceHeight = fence.height;

  // 5. 遮蔽物名
  const obstructedBy = visible ? undefined : (fence.name || 'fence');

  // 6. 判定結果を生成
  return createVisibilityJudgment({
    visible,
    obstructedBy,
    sightlines,
    minimumFenceHeight,
    currentFenceHeight,
  });
}
