# MVPスコープ - 視線フェンス判定

---

## MVP の目的

最初の実装では、**「フェンスで視線を遮れるか？」** という
最もシンプルかつ実用的な問題に取り組みます。

### なぜフェンスか？

1. **理解しやすい**: 専門知識なしで判断できる
2. **実用的**: 「隣から見える/見えない」は誰もが気にする
3. **典型的な後悔事例**: 「もっと高くすれば良かった」は頻出
4. **計算がシンプル**: 幾何計算として明確で、エンジン実装の練習に最適

---

## 機能要件

### 1. 入力仕様

#### 1.1 観測者（Observer）
視線の起点となる人物や窓。

```typescript
interface Observer {
  position: Point3D;      // 位置（x, y, z）
  eyeHeight?: number;     // 目線高さ（デフォルト: 1.6m）
  name?: string;          // 識別名（例: "隣家2階窓"）
}
```

**例**:
- 隣家2階の窓: `{ position: { x: 10, y: 5, z: 4.5 }, name: "隣家2階窓" }`
- 道路からの視線: `{ position: { x: -2, y: 0, z: 1.6 }, name: "道路通行人" }`

#### 1.2 目標地点（Target）
視線の終点、守りたい場所。

```typescript
interface Target {
  position: Point3D;      // 位置（x, y, z）
  name?: string;          // 識別名（例: "ウッドデッキ"）
}
```

**例**:
- 庭のウッドデッキ: `{ position: { x: 3, y: 3, z: 0.2 }, name: "ウッドデッキ" }`
- 1階リビング窓: `{ position: { x: 2, y: 2, z: 1.0 }, name: "リビング窓" }`

#### 1.3 フェンス（Fence）
視線を遮る障害物。

```typescript
interface Fence {
  line: Line;             // 線分（始点・終点）
  height: number;         // フェンスの高さ（m）
  groundLevel?: number;   // 地盤高さ（デフォルト: 0）
  name?: string;          // 識別名（例: "境界フェンス"）
}

interface Line {
  start: Point3D;
  end: Point3D;
}
```

**例**:
```json
{
  "line": {
    "start": { "x": 5, "y": 0, "z": 0 },
    "end": { "x": 5, "y": 10, "z": 0 }
  },
  "height": 1.8,
  "name": "東側境界フェンス"
}
```

#### 1.4 地盤レベル差（オプション）
敷地に高低差がある場合。

```typescript
interface GroundLevel {
  position: Point2D;      // 平面座標
  elevation: number;      // 地盤高さ（m）
}
```

**MVP では簡易実装**:
- 観測者・目標・フェンスそれぞれに `groundLevel` を持たせる
- 将来: より詳細な地形モデル（メッシュ、等高線）

---

### 2. 出力仕様

#### 2.1 判定結果（Judgment）

```typescript
interface VisibilityJudgment {
  // 基本判定
  visible: boolean;                    // 見える/見えない
  obstructedBy?: string;               // 遮蔽物（"fence" / null）

  // 視線情報
  sightlines: Sightline[];             // 視線ライン（複数可）

  // フェンス評価
  minimumFenceHeight: number;          // 必要最小高さ
  currentFenceHeight: number;          // 現在の高さ
  heightMargin: number;                // 余裕（current - minimum）
  isAdequate: boolean;                 // 十分か？

  // 推奨
  recommendation: string;              // 判断根拠と推奨文
}
```

#### 2.2 視線ライン（Sightline）

```typescript
interface Sightline {
  from: Point3D;                      // 起点
  to: Point3D;                        // 終点
  obstructed: boolean;                // 遮られたか
  obstructionPoint?: Point3D;         // 遮蔽点
  obstructedBy?: string;              // 遮蔽物名
}
```

#### 2.3 ビジュアル出力

**必須（MVP）**:
1. **俯瞰図（Top View）**
   - 平面的な配置: 観測者、目標、フェンス
   - 視線ライン（直線）
   - 遮蔽ポイントをマーク

2. **側面図（Side View）**
   - 高さ関係を明示
   - フェンスの高さ寸法
   - 視線の傾き
   - 必要最小高さを点線で表示

3. **判定サマリーテキスト**
   ```
   【判定結果】
   ✅ 遮蔽可能

   現在のフェンス高さ: 1.8m
   必要最小高さ: 1.75m
   余裕: +0.05m

   推奨: 現在の設計で問題ありません。
   ```

**オプション（将来）**:
- パース図（3D視点）
- Unity / AR での没入体験

---

### 3. 計算仕様

#### 3.1 視線判定（Visibility Check）

**アルゴリズム**:
1. 観測者から目標地点への視線ベクトルを計算
2. フェンスの線分（3D）との交差判定
3. 交差する場合、交差点の高さを確認
4. フェンスが視線を遮るか判定

**擬似コード**:
```typescript
function checkVisibility(
  observer: Observer,
  target: Target,
  fence: Fence
): VisibilityJudgment {
  // 1. 視線ベクトル
  const ray = {
    origin: observer.position,
    direction: normalize(target.position - observer.position)
  };

  // 2. フェンスとの交差判定
  const intersection = rayIntersectFence(ray, fence);

  if (!intersection) {
    return { visible: true, obstructed: false };
  }

  // 3. 交差点の高さチェック
  const intersectionHeight = intersection.z;
  const fenceTopHeight = fence.groundLevel + fence.height;

  if (intersectionHeight <= fenceTopHeight) {
    return {
      visible: false,
      obstructed: true,
      obstructedBy: fence.name,
      obstructionPoint: intersection
    };
  }

  return { visible: true, obstructed: false };
}
```

#### 3.2 必要最小高さ計算（Minimum Height）

**目的**: 視線を遮るために必要なフェンスの最小高さを算出。

**アルゴリズム**:
1. 観測者と目標を結ぶ直線を計算
2. フェンス線分との交点（平面上）を求める
3. その交点での視線の高さを計算
4. 地盤高さを考慮して、必要なフェンス高さを算出

**擬似コード**:
```typescript
function calculateMinimumFenceHeight(
  observer: Observer,
  target: Target,
  fenceLine: Line
): number {
  // 1. 視線と平面交点（XY平面）
  const intersectionXY = linePlaneIntersection(
    observer.position,
    target.position,
    fenceLine
  );

  if (!intersectionXY) {
    return 0; // 交差しない場合
  }

  // 2. 交点での視線高さを補間
  const t = distanceRatio(observer.position, target.position, intersectionXY);
  const sightlineHeight = lerp(observer.position.z, target.position.z, t);

  // 3. 地盤高さを考慮
  const fenceGroundLevel = fence.groundLevel || 0;
  const minimumHeight = sightlineHeight - fenceGroundLevel;

  return Math.max(0, minimumHeight);
}
```

---

## 非機能要件

### パフォーマンス
- 1回の判定: 10ms 以内（ローカル実行）
- 100件のシナリオ一括判定: 1秒以内

### 精度
- 座標精度: 小数点以下2桁（cm単位）
- 高さ精度: 小数点以下2桁（cm単位）
- 角度精度: 小数点以下1桁（度）

### エラーハンドリング
- 入力値の妥当性チェック
  - 座標が有効範囲内か
  - 高さが正の値か
  - フェンス線分の長さが0でないか
- 計算エラーの明示的なメッセージ

---

## MVP の制約（意図的な簡略化）

### 含まない機能
- ❌ 複雑な地形（メッシュ、等高線）
- ❌ 複数のフェンス（将来拡張）
- ❌ 遮蔽物（樹木、建物）の考慮
- ❌ 時刻・季節による変化
- ❌ 3D没入体験（Unity / VR）

### 簡略化した仮定
- ✅ フェンスは直線
- ✅ 地盤は平坦、または単純な高低差のみ
- ✅ 観測者・目標は点として扱う（身長・広がりは考慮しない）

---

## 実装の優先順位

### Phase 1: エンジン実装（最優先）
1. ✅ データモデル定義（`models/`）
2. ✅ 幾何計算（`geometry/`）
3. ✅ 視線判定（`sightline/`）
4. ✅ フェンス判定（`fence/`）
5. ✅ 単体テスト

### Phase 2: ビュー生成
1. ✅ 俯瞰図生成
2. ✅ 側面図生成
3. ✅ 判定サマリーテキスト

### Phase 3: CLIツール
1. ✅ JSON 入力対応
2. ✅ コマンド実装（check / visualize）
3. ✅ 画像出力（PNG / SVG）

### Phase 4: Revitアドイン
1. ✅ Adapter 実装（Revit → engine）
2. ✅ コマンド実装
3. ✅ 結果表示（Revit ビュー上に描画）

---

## テストケース

### 基本ケース
1. **遮蔽成功**
   - 観測者: (0, 0, 1.6)
   - 目標: (10, 0, 0)
   - フェンス: x=5, 高さ2.0m
   - 期待: 遮蔽される

2. **遮蔽失敗（低すぎ）**
   - 観測者: (0, 0, 1.6)
   - 目標: (10, 0, 0)
   - フェンス: x=5, 高さ0.5m
   - 期待: 見える

3. **高低差あり**
   - 観測者: (0, 0, 3.0)（2階窓）
   - 目標: (10, 0, 0.2)（ウッドデッキ）
   - フェンス: x=5, 高さ1.8m
   - 期待: 必要最小高さ > 1.8m

### エッジケース
- 視線がフェンス線分の延長上（交差しない）
- 観測者と目標が同じ高さ
- フェンス線分が視線と平行
- 地盤レベル差が極端（±10m）

---

## 成功基準

### MVP完了の定義
1. ✅ エンジンが正しく判定できる（テスト通過率100%）
2. ✅ 俯瞰図・側面図が生成できる
3. ✅ CLIで実行できる
4. ✅ サンプルデータで動作確認
5. ✅ ドキュメントが整備されている

### ユーザー受け入れ基準
- 建築の知識がない人でも、出力を見て判断できる
- 「なぜ見える/見えない」が図で理解できる
- 「あと何cm高くすればいい」が分かる

---

## 次のステップ（MVP完了後）

1. **複数のフェンス対応**
   - L字型、コの字型の配置

2. **遮蔽物の追加**
   - 樹木、建物、塀

3. **Web UI の実装**
   - ブラウザで入力・確認

4. **PDF レポート生成**
   - 説明資料として出力

5. **Unity / AR 対応**
   - 現地での体験

---

## まとめ

MVP では、**視線フェンス判定** という
シンプルで実用的な問題に絞り込み、
以下を実現します。

- ✅ UI非依存の判定エンジン
- ✅ 判断できるビュー（俯瞰図・側面図）
- ✅ CLIツールとRevitアドイン

これにより、プロジェクトの設計思想を
実証し、今後の拡張への基盤を作ります。

---

[次へ: API仕様](api-reference.md)
