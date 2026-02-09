/**
 * 視線フェンス判定のデモ実行スクリプト
 */

import {
  createObserver,
  createTarget,
  createFence,
  createLine,
  checkVisibility,
} from '../../src/engine';

console.log('=== 視線フェンス判定デモ ===\n');

// シナリオ1: 1階窓からウッドデッキへの視線（フェンス高さ1.8m）
console.log('【シナリオ1】隣家1階窓 → ウッドデッキ（フェンス1.8m）');
console.log('---');

const observer1 = createObserver(
  { x: 0, y: 0, z: 0 },
  1.6,
  '隣家1階窓'
);

const target1 = createTarget(
  { x: 10, y: 5, z: 0.2 },
  'ウッドデッキ'
);

const fence1 = createFence(
  createLine(
    { x: 5, y: 0, z: 0 },
    { x: 5, y: 10, z: 0 }
  ),
  1.8,
  0,
  '東側境界フェンス'
);

const result1 = checkVisibility({
  observers: [observer1],
  targets: [target1],
  fence: fence1,
});

console.log(`見える/見えない: ${result1.visible ? '見える' : '見えない'}`);
console.log(`現在のフェンス高さ: ${result1.currentFenceHeight}m`);
console.log(`必要最小高さ: ${result1.minimumFenceHeight.toFixed(2)}m`);
console.log(`高さの余裕: ${result1.heightMargin >= 0 ? '+' : ''}${result1.heightMargin.toFixed(2)}m`);
console.log(`十分な高さか: ${result1.isAdequate ? 'はい' : 'いいえ'}`);
console.log(`\n推奨: ${result1.recommendation}\n`);

// シナリオ2: 2階窓からウッドデッキへの視線（フェンス高さ1.8m - 低すぎる）
console.log('【シナリオ2】隣家2階窓 → ウッドデッキ（フェンス1.8m）');
console.log('---');

const observer2 = createObserver(
  { x: 0, y: 5, z: 3.0 },
  1.5,
  '隣家2階窓'
);

const target2 = createTarget(
  { x: 10, y: 5, z: 0.2 },
  'ウッドデッキ'
);

const fence2 = createFence(
  createLine(
    { x: 5, y: 0, z: 0 },
    { x: 5, y: 10, z: 0 }
  ),
  1.8,
  0,
  '東側境界フェンス'
);

const result2 = checkVisibility({
  observers: [observer2],
  targets: [target2],
  fence: fence2,
});

console.log(`見える/見えない: ${result2.visible ? '見える' : '見えない'}`);
console.log(`現在のフェンス高さ: ${result2.currentFenceHeight}m`);
console.log(`必要最小高さ: ${result2.minimumFenceHeight.toFixed(2)}m`);
console.log(`高さの余裕: ${result2.heightMargin >= 0 ? '+' : ''}${result2.heightMargin.toFixed(2)}m`);
console.log(`十分な高さか: ${result2.isAdequate ? 'はい' : 'いいえ'}`);
console.log(`\n推奨: ${result2.recommendation}\n`);

// シナリオ3: 2階窓からウッドデッキへの視線（フェンス高さ2.5m - 十分）
console.log('【シナリオ3】隣家2階窓 → ウッドデッキ（フェンス2.5m）');
console.log('---');

const fence3 = createFence(
  createLine(
    { x: 5, y: 0, z: 0 },
    { x: 5, y: 10, z: 0 }
  ),
  2.5,
  0,
  '東側境界フェンス'
);

const result3 = checkVisibility({
  observers: [observer2],
  targets: [target2],
  fence: fence3,
});

console.log(`見える/見えない: ${result3.visible ? '見える' : '見えない'}`);
console.log(`現在のフェンス高さ: ${result3.currentFenceHeight}m`);
console.log(`必要最小高さ: ${result3.minimumFenceHeight.toFixed(2)}m`);
console.log(`高さの余裕: ${result3.heightMargin >= 0 ? '+' : ''}${result3.heightMargin.toFixed(2)}m`);
console.log(`十分な高さか: ${result3.isAdequate ? 'はい' : 'いいえ'}`);
console.log(`\n推奨: ${result3.recommendation}\n`);

console.log('=== デモ終了 ===');
