import {
  createObserver,
  createTarget,
  createFence,
  createLine,
  checkVisibility,
} from '../../src/engine';

describe('Fence Visibility Check', () => {
  test('視線が遮られる場合（1階からウッドデッキ）', () => {
    // 観測者: 隣家1階窓
    const observer = createObserver({ x: 0, y: 0, z: 0 }, 1.6, '隣家1階窓');

    // 目標: ウッドデッキ
    const target = createTarget({ x: 10, y: 5, z: 0.2 }, 'ウッドデッキ');

    // フェンス: 境界線（x=5）、高さ1.8m
    const fence = createFence(
      createLine({ x: 5, y: 0, z: 0 }, { x: 5, y: 10, z: 0 }),
      1.8,
      0,
      '東側境界フェンス'
    );

    // 判定実行
    const result = checkVisibility({
      observers: [observer],
      targets: [target],
      fence,
    });

    // 検証
    expect(result.visible).toBe(false); // 遮られる
    expect(result.isAdequate).toBe(true); // 高さが十分
    expect(result.sightlines).toHaveLength(1);
    expect(result.sightlines[0].obstructed).toBe(true);
  });

  test('視線が通る場合（フェンスが低すぎる）', () => {
    // 観測者: 隣家2階窓（高い位置）
    const observer = createObserver({ x: 0, y: 5, z: 3.0 }, 1.5, '隣家2階窓');

    // 目標: ウッドデッキ
    const target = createTarget({ x: 10, y: 5, z: 0.2 }, 'ウッドデッキ');

    // フェンス: 境界線（x=5）、高さ1.8m（低すぎる）
    const fence = createFence(
      createLine({ x: 5, y: 0, z: 0 }, { x: 5, y: 10, z: 0 }),
      1.8,
      0,
      '東側境界フェンス'
    );

    // 判定実行
    const result = checkVisibility({
      observers: [observer],
      targets: [target],
      fence,
    });

    // 検証
    expect(result.visible).toBe(true); // 見える
    expect(result.isAdequate).toBe(false); // 高さが不十分
    expect(result.minimumFenceHeight).toBeGreaterThan(1.8); // 1.8mより高い必要がある
  });

  test('複数の観測者・目標（最も厳しい条件）', () => {
    // 観測者: 1階と2階
    const observer1 = createObserver({ x: 0, y: 0, z: 0 }, 1.6, '隣家1階窓');
    const observer2 = createObserver({ x: 0, y: 5, z: 3.0 }, 1.5, '隣家2階窓');

    // 目標: ウッドデッキ
    const target = createTarget({ x: 10, y: 5, z: 0.2 }, 'ウッドデッキ');

    // フェンス: 境界線（x=5）、高さ2.5m
    const fence = createFence(
      createLine({ x: 5, y: 0, z: 0 }, { x: 5, y: 10, z: 0 }),
      2.5,
      0,
      '東側境界フェンス'
    );

    // 判定実行
    const result = checkVisibility({
      observers: [observer1, observer2],
      targets: [target],
      fence,
    });

    // 検証
    expect(result.sightlines).toHaveLength(2); // 2本の視線
    expect(result.visible).toBe(false); // すべて遮られる
    expect(result.isAdequate).toBe(true); // 高さが十分
  });

  test('必要最小高さの計算', () => {
    const observer = createObserver({ x: 0, y: 5, z: 3.0 }, 1.5, '隣家2階窓');
    const target = createTarget({ x: 10, y: 5, z: 0.2 }, 'ウッドデッキ');

    const fence = createFence(
      createLine({ x: 5, y: 0, z: 0 }, { x: 5, y: 10, z: 0 }),
      1.8,
      0,
      '東側境界フェンス'
    );

    const result = checkVisibility({
      observers: [observer],
      targets: [target],
      fence,
    });

    // 必要最小高さが計算されている
    expect(result.minimumFenceHeight).toBeGreaterThan(0);
    expect(result.heightMargin).toBe(result.currentFenceHeight - result.minimumFenceHeight);

    // 推奨文が生成されている
    expect(result.recommendation).toBeTruthy();
  });
});
