# アーキテクチャ - no-regret-home

---

## 設計原則

### 1. **エンジン駆動アーキテクチャ**
判定・計算ロジック（エンジン）が中心であり、すべてのフロントエンドはエンジンを利用します。

```
             ┌─────────────────┐
             │  Revit Addin    │
             │  (C#)           │
             └────────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐   ┌───▼────┐   ┌───▼────┐
   │   Web   │   │  Unity  │   │  CLI   │
   │   App   │   │  Viewer │   │  Tool  │
   └────┬────┘   └────┬────┘   └────┬───┘
        │             │             │
        └─────────────┼─────────────┘
                      │
              ┌───────▼───────┐
              │  ENGINE 層   │
              │ （UI非依存）  │
              └───────────────┘
```

### 2. **言語中立性**
エンジンは特定の言語に依存しない設計を心がけます。

- データ構造は JSON / YAML 等で表現可能
- 計算ロジックは純粋関数として実装
- プラットフォーム固有のAPIは各 Adapter で吸収

### 3. **依存方向の制御**
```
engine  →  viewer  →  output
  ↑          ↑          ↑
  │          │          │
  └──────────┴──────────┘
      tools（利用する側）
```

- `engine` は何にも依存しない
- `viewer` は `engine` のみに依存
- `output` は `viewer` の結果を利用
- `tools` は必要に応じて `engine`, `viewer`, `output` を利用

### 4. **テスタビリティ**
すべての層で単体テストが可能な設計。

- engine: 純粋関数 → 入力に対して決定的な出力
- viewer: engine の結果 → 期待通りのビューが生成されるか
- output: viewer の結果 → 期待通りのフォーマットか

---

## 層の詳細

### 層1: Engine（判定・計算エンジン）

#### 責務
- 幾何計算（交差判定、距離、角度など）
- 視線判定（どこから見えるか／遮れるか）
- 高さ・圧迫感の計算
- 法規チェック（将来）

#### 特徴
- **UI非依存**: 3Dエンジン、グラフィクスライブラリに依存しない
- **純粋関数中心**: 同じ入力に対して同じ出力
- **データ構造の明確化**: `Point3D`, `Line`, `Plane` など基本要素の定義

#### 構成
```
src/engine/
├─ models/              # データ構造定義
│  ├─ Point3D.ts        # 3D座標
│  ├─ Line.ts           # 線分
│  ├─ Plane.ts          # 平面
│  ├─ ViewPoint.ts      # 視点（位置 + 方向）
│  └─ Fence.ts          # フェンス（線 + 高さ）
│
├─ geometry/            # 幾何計算
│  ├─ distance.ts       # 距離計算
│  ├─ intersection.ts   # 交差判定
│  ├─ projection.ts     # 投影計算
│  └─ angle.ts          # 角度計算
│
├─ sightline/           # 視線判定
│  ├─ raycast.ts        # レイキャスト
│  ├─ visibility.ts     # 可視性判定
│  └─ obstruction.ts    # 遮蔽判定
│
├─ fence/               # フェンス判定
│  ├─ minHeight.ts      # 必要最小高さ
│  ├─ coverage.ts       # カバー範囲
│  └─ evaluation.ts     # 総合評価
│
└─ validators/          # 入力検証
   ├─ inputValidator.ts # 入力値の妥当性チェック
   └─ rangeValidator.ts # 数値範囲チェック
```

#### 入力例（JSON形式）
```json
{
  "observers": [
    { "position": { "x": 0, "y": 0, "z": 1.6 }, "name": "観測者1" }
  ],
  "targets": [
    { "position": { "x": 5, "y": 5, "z": 0 }, "name": "目標地点" }
  ],
  "fence": {
    "line": {
      "start": { "x": 3, "y": 0, "z": 0 },
      "end": { "x": 3, "y": 10, "z": 0 }
    },
    "height": 1.8
  },
  "groundLevels": [
    { "position": { "x": 0, "y": 0 }, "elevation": 0 },
    { "position": { "x": 5, "y": 5 }, "elevation": 0.5 }
  ]
}
```

#### 出力例（判定結果）
```json
{
  "visible": false,
  "sightlines": [
    {
      "from": { "x": 0, "y": 0, "z": 1.6 },
      "to": { "x": 5, "y": 5, "z": 0 },
      "obstructedBy": "fence",
      "obstructionPoint": { "x": 3, "y": 2.5, "z": 1.2 }
    }
  ],
  "minimumFenceHeight": 1.8,
  "currentFenceHeight": 1.8,
  "isAdequate": true,
  "recommendation": "現在の高さで視線を遮ることができます"
}
```

---

### 層2: Viewer（ビュー生成）

#### 責務
- エンジンの判定結果を視覚化
- 代表視点の定義
- 静止画ビューの生成
- ダイアグラム（図）の生成

#### 特徴
- **判断のためのビュー**: 鑑賞用ではなく、判断できる情報を提供
- **代表視点の選定**: ユーザーが最も知りたい視点を自動選定
- **視線の可視化**: 見える／見えないを直感的に示す

#### 構成
```
src/viewer/
├─ static/                    # 静止画ビュー（MVP優先）
│  ├─ cameraConfig.ts         # カメラ配置
│  ├─ viewGenerator.ts        # ビュー生成
│  ├─ diagramBuilder.ts       # 図面生成
│  └─ sightlineRenderer.ts    # 視線描画
│
└─ interfaces/                # 共通インターフェース
   ├─ IViewer.ts              # ビューア共通IF
   └─ ViewConfig.ts           # ビュー設定
```

#### ビューの種類
1. **俯瞰図（Top View）**
   - 平面的な配置関係
   - 視線が通る経路を線で表示

2. **側面図（Side View）**
   - 高さ関係の把握
   - フェンスの高さと視線の交差

3. **パース図（Perspective）**
   - 実際の見え方に近い
   - 代表視点からの静止画

4. **視線図（Sightline Diagram）**
   - 視線ライン + 遮蔽ポイント
   - 必要最小高さの表示

---

### 層3: Output（出力・説明資料）

#### 責務
- ビューをレポート化
- PDF / HTML 生成
- 判断根拠の文章化

#### 構成
```
src/output/
├─ report/
│  ├─ reportBuilder.ts    # レポート構築
│  ├─ textGenerator.ts    # 説明文生成
│  └─ summary.ts          # サマリー作成
│
└─ templates/             # テンプレート
   ├─ pdf-template.html   # PDF用テンプレート
   └─ web-template.html   # Web表示用
```

#### 出力例
```
【視線フェンス判定レポート】

■ 判定結果: 遮蔽可能
現在のフェンス高さ（1.8m）で、隣家2階からの視線を遮ることができます。

■ 視線分析
- 観測者位置: 隣家2階窓（高さ4.5m）
- 目標地点: 敷地内ウッドデッキ（高さ0.2m）
- フェンス位置: 境界線上（敷地境界から0m）
- 必要最小高さ: 1.75m

■ 視覚資料
[俯瞰図]
[側面図]
[パース図]

■ 推奨事項
- 現在の設計で問題ありません
- 余裕を持たせる場合は、2.0m も検討可能です
```

---

### Tools層（プラットフォーム固有実装）

#### Revit Addin
```
tools/revit/
├─ Addin/                    # UI・コマンド
│  ├─ Commands/
│  │  ├─ FenceCheckCommand.cs    # フェンスチェックコマンド
│  │  └─ ExportDataCommand.cs    # データエクスポート
│  └─ UI/
│     ├─ FenceInputDialog.xaml   # 入力ダイアログ
│     └─ ResultPanel.xaml         # 結果表示パネル
│
├─ Adapters/                 # engine 呼び出し境界
│  ├─ GeometryAdapter.cs     # Revit Geometry → engine models
│  ├─ EngineClient.cs        # engine 呼び出し（REST or 直接）
│  └─ ResultAdapter.cs       # engine 結果 → Revit 表示
│
└─ RevitApi/                 # Revit API 直触り隔離
   ├─ ElementSelector.cs     # 要素選択
   ├─ ViewCreator.cs         # ビュー作成
   └─ GeometryExtractor.cs   # ジオメトリ抽出
```

**重要**: Revitアドインは「engineの利用例」であり、
engine に Revit 依存のコードを入れない。

#### CLI Tool
```
tools/cli/
├─ commands/
│  ├─ check.ts            # フェンスチェック実行
│  ├─ visualize.ts        # ビュー生成
│  └─ report.ts           # レポート生成
└─ index.ts               # エントリポイント
```

使用例:
```bash
# フェンスチェック実行
npx no-regret-home check --input example.json

# ビュー生成
npx no-regret-home visualize --input example.json --output views/

# レポート生成
npx no-regret-home report --input example.json --output report.pdf
```

---

## データフロー

### 全体の流れ
```
1. 入力データ（JSON/UI）
   ↓
2. engine: 判定実行
   ↓
3. viewer: ビュー生成
   ↓
4. output: レポート化
   ↓
5. 成果物（PDF/HTML/画像）
```

### 具体例: Revit での使用
```
1. Revit で要素選択
   ↓
2. Adapter: Revit Geometry → engine 入力形式
   ↓
3. engine 実行（REST API or 直接呼び出し）
   ↓
4. 結果受信
   ↓
5. Adapter: engine 結果 → Revit ビュー
   ↓
6. Revit 上に視線ライン描画
```

---

## 技術選定

### Engine 層
- **言語**: TypeScript（初期実装）
  - 理由: JSON との親和性、型安全、クロスプラットフォーム
  - 将来: C# / Python への移植も視野

- **ライブラリ**: 最小限
  - 幾何計算は自前実装（依存を減らすため）
  - テスト: Jest / Vitest

### Viewer 層
- **静止画生成**: Canvas API / SVG
  - 理由: ブラウザで動作、軽量
  - 将来: Three.js（3Dビュー）

### Output 層
- **PDF生成**: Puppeteer / PDFKit
- **テンプレート**: Handlebars / EJS

### Revit Addin
- **言語**: C#
- **.NET**: .NET Framework 4.8（Revit 2024対応）
- **UI**: WPF

---

## テスト戦略

### Engine 層
- **単体テスト**: 各関数の入出力を検証
- **統合テスト**: 複数モジュールを組み合わせた判定

例:
```typescript
test('視線が遮られる場合', () => {
  const observer = { x: 0, y: 0, z: 1.6 };
  const target = { x: 5, y: 5, z: 0 };
  const fence = { line: {...}, height: 1.8 };

  const result = checkVisibility(observer, target, fence);

  expect(result.visible).toBe(false);
  expect(result.obstructedBy).toBe('fence');
});
```

### Viewer 層
- **スナップショットテスト**: 生成画像が期待通りか
- **視覚的回帰テスト**: 変更前後の差分確認

### Revit Addin
- **手動テスト**: Revit 上で実際に動作確認
- **Adapter のテスト**: Revit Geometry → engine 変換が正しいか

---

## 拡張性の考慮

### 新しい判定機能の追加
```
src/engine/
├─ sightline/      （既存）
├─ fence/          （既存）
├─ ceiling/        （追加: 天井高判定）
├─ sunlight/       （追加: 日射判定）
└─ regulation/     （追加: 法規チェック）
```

各判定は独立しており、相互依存を最小化。

### 新しいプラットフォームの追加
```
tools/
├─ revit/          （既存）
├─ unity/          （追加: Unity版ビューア）
├─ web/            （追加: Webアプリ）
└─ mobile/         （追加: モバイルAR）
```

すべて `engine` を利用する形で実装。

---

## セキュリティとプライバシー

### データの扱い
- **個人情報を含まない**: 座標・高さなどの幾何情報のみ
- **ローカル実行優先**: 可能な限りユーザー環境で完結
- **クラウド利用時**: データは暗号化、保存しない

### オープンソース化の準備
- ライセンス選定（MIT / Apache 2.0 など）
- 機密情報の分離
- 貢献ガイドライン整備

---

## まとめ

no-regret-home のアーキテクチャは、
**UI非依存の判定エンジン** を核とし、
複数のフロントエンドから利用可能な設計です。

- エンジン駆動
- 言語中立
- テスタブル
- 拡張可能

この設計により、長期的な成長と、
多様なプラットフォームへの展開が可能になります。

---

[次へ: MVPスコープ](mvp-scope.md)
