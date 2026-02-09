import { Sightline } from './Sightline';

/**
 * 視線判定結果
 */
export interface VisibilityJudgment {
  /** 見える / 見えない */
  visible: boolean;

  /** 遮蔽物（遮られた場合） */
  obstructedBy?: string;

  /** 視線ライン（複数可） */
  sightlines: Sightline[];

  /** 必要最小フェンス高さ（メートル） */
  minimumFenceHeight: number;

  /** 現在のフェンス高さ（メートル） */
  currentFenceHeight: number;

  /** 高さの余裕（current - minimum） */
  heightMargin: number;

  /** 現在の高さで十分か */
  isAdequate: boolean;

  /** 推奨事項・判断根拠 */
  recommendation: string;
}

/**
 * VisibilityJudgmentを生成するヘルパー関数
 */
export function createVisibilityJudgment(params: {
  visible: boolean;
  obstructedBy?: string;
  sightlines: Sightline[];
  minimumFenceHeight: number;
  currentFenceHeight: number;
}): VisibilityJudgment {
  const { visible, obstructedBy, sightlines, minimumFenceHeight, currentFenceHeight } = params;

  const heightMargin = currentFenceHeight - minimumFenceHeight;
  const isAdequate = heightMargin >= 0;

  let recommendation: string;
  if (isAdequate) {
    if (heightMargin < 0.1) {
      recommendation = `現在のフェンス高さ（${currentFenceHeight.toFixed(2)}m）で視線を遮ることができますが、余裕がほとんどありません。0.1m程度高くすることを推奨します。`;
    } else {
      recommendation = `現在のフェンス高さ（${currentFenceHeight.toFixed(2)}m）で視線を遮ることができます。余裕は ${heightMargin.toFixed(2)}m です。`;
    }
  } else {
    const shortage = Math.abs(heightMargin);
    recommendation = `現在のフェンス高さ（${currentFenceHeight.toFixed(2)}m）では不十分です。視線を遮るためには、最低でも ${minimumFenceHeight.toFixed(2)}m が必要です（${shortage.toFixed(2)}m 不足）。`;
  }

  return {
    visible,
    obstructedBy,
    sightlines,
    minimumFenceHeight,
    currentFenceHeight,
    heightMargin,
    isAdequate,
    recommendation,
  };
}
