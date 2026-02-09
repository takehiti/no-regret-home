# API仕様 - no-regret-home

---

> **注意**: このドキュメントは実装の進行に伴い更新されます。
> 初期段階では、基本的なインターフェースのみを定義します。

---

## Engine API

### データモデル

#### Point3D
3次元座標を表す基本型。

```typescript
interface Point3D {
  x: number;  // X座標（m）
  y: number;  // Y座標（m）
  z: number;  // Z座標（m）
}
```

#### Point2D
2次元座標（平面）。

```typescript
interface Point2D {
  x: number;  // X座標（m）
  y: number;  // Y座標（m）
}
```

#### Line
線分を表す型。

```typescript
interface Line {
  start: Point3D;  // 始点
  end: Point3D;    // 終点
}
```

---

### 入力型

#### Observer
視線の起点（人物、窓など）。

```typescript
interface Observer {
  position: Point3D;      // 位置
  eyeHeight?: number;     // 目線高さ（デフォルト: 1.6m）
  name?: string;          // 識別名
}
```

#### Target
視線の終点（守りたい場所）。

```typescript
interface Target {
  position: Point3D;      // 位置
  name?: string;          // 識別名
}
```

#### Fence
フェンス（視線を遮る障害物）。

```typescript
interface Fence {
  line: Line;             // 線分
  height: number;         // 高さ（m）
  groundLevel?: number;   // 地盤高さ（デフォルト: 0）
  name?: string;          // 識別名
}
```

#### VisibilityCheckInput
視線判定の入力。

```typescript
interface VisibilityCheckInput {
  observers: Observer[];       // 観測者（複数可）
  targets: Target[];           // 目標地点（複数可）
  fence: Fence;                // フェンス
  groundLevels?: GroundLevel[];// 地盤レベル（オプション）
}
```

---

### 出力型

#### Sightline
視線ライン。

```typescript
interface Sightline {
  from: Point3D;                // 起点
  to: Point3D;                  // 終点
  obstructed: boolean;          // 遮られたか
  obstructionPoint?: Point3D;   // 遮蔽点
  obstructedBy?: string;        // 遮蔽物名
  distanceToObstruction?: number; // 遮蔽点までの距離（m）
}
```

#### VisibilityJudgment
視線判定結果。

```typescript
interface VisibilityJudgment {
  // 基本判定
  visible: boolean;                  // 見える/見えない
  obstructedBy?: string;             // 遮蔽物

  // 視線情報
  sightlines: Sightline[];           // 視線ライン（複数可）

  // フェンス評価
  minimumFenceHeight: number;        // 必要最小高さ（m）
  currentFenceHeight: number;        // 現在の高さ（m）
  heightMargin: number;              // 余裕（m）
  isAdequate: boolean;               // 十分か？

  // 推奨
  recommendation: string;            // 判断根拠と推奨文
}
```

---

### 主要関数

#### checkVisibility
視線判定を実行。

```typescript
function checkVisibility(
  input: VisibilityCheckInput
): VisibilityJudgment;
```

**説明**: 観測者から目標への視線が、フェンスによって遮られるかを判定します。

**戻り値**: 判定結果（`VisibilityJudgment`）

---

#### calculateMinimumFenceHeight
必要最小フェンス高さを計算。

```typescript
function calculateMinimumFenceHeight(
  observer: Observer,
  target: Target,
  fenceLine: Line
): number;
```

**説明**: 視線を遮るために必要な、フェンスの最小高さを算出します。

**戻り値**: 必要最小高さ（m）

---

## Viewer API

### ビュー設定

#### ViewConfig
ビュー生成の設定。

```typescript
interface ViewConfig {
  viewType: 'top' | 'side' | 'perspective';  // ビュー種類
  width: number;                             // 画像幅（px）
  height: number;                            // 画像高さ（px）
  cameraPosition?: Point3D;                  // カメラ位置（perspectiveのみ）
  showGrid?: boolean;                        // グリッド表示
  showDimensions?: boolean;                  // 寸法線表示
}
```

### 主要関数

#### generateView
ビューを生成。

```typescript
function generateView(
  judgment: VisibilityJudgment,
  input: VisibilityCheckInput,
  config: ViewConfig
): ViewOutput;
```

**説明**: 判定結果を視覚化したビューを生成します。

**戻り値**: ビュー出力（画像データまたはSVG）

---

#### generateDiagram
ダイアグラムを生成。

```typescript
function generateDiagram(
  judgment: VisibilityJudgment,
  input: VisibilityCheckInput
): DiagramOutput;
```

**説明**: 視線ラインと遮蔽ポイントを示す図を生成します。

**戻り値**: 図のデータ

---

## Output API

### レポート生成

#### ReportConfig
レポート生成の設定。

```typescript
interface ReportConfig {
  format: 'pdf' | 'html' | 'markdown';  // 出力形式
  includeImages: boolean;               // 画像を含むか
  language: 'ja' | 'en';                // 言語
  template?: string;                    // テンプレート名
}
```

#### generateReport
レポートを生成。

```typescript
function generateReport(
  judgment: VisibilityJudgment,
  views: ViewOutput[],
  config: ReportConfig
): ReportOutput;
```

**説明**: 判定結果とビューをまとめたレポートを生成します。

**戻り値**: レポートデータ

---

## CLI API

### コマンド

#### check
視線フェンス判定を実行。

```bash
npx no-regret-home check --input <file.json> [options]
```

**オプション**:
- `--input, -i`: 入力JSONファイルパス（必須）
- `--output, -o`: 出力先ディレクトリ（デフォルト: `./output`）
- `--verbose, -v`: 詳細出力

**出力**:
- `result.json`: 判定結果
- `summary.txt`: サマリーテキスト

---

#### visualize
ビューを生成。

```bash
npx no-regret-home visualize --input <file.json> [options]
```

**オプション**:
- `--input, -i`: 入力JSONファイルパス（必須）
- `--output, -o`: 出力先ディレクトリ（デフォルト: `./output`）
- `--views`: ビュー種類（`top`, `side`, `perspective`）（デフォルト: `top,side`）
- `--format`: 出力形式（`png`, `svg`）（デフォルト: `png`）

**出力**:
- `top-view.png`: 俯瞰図
- `side-view.png`: 側面図

---

#### report
レポートを生成。

```bash
npx no-regret-home report --input <file.json> [options]
```

**オプション**:
- `--input, -i`: 入力JSONファイルパス（必須）
- `--output, -o`: 出力ファイルパス（デフォルト: `./report.pdf`）
- `--format`: 出力形式（`pdf`, `html`, `markdown`）（デフォルト: `pdf`）
- `--template`: テンプレート名

**出力**:
- レポートファイル（PDF / HTML / Markdown）

---

## Revit Addin API

### コマンド

#### FenceCheckCommand
Revit 上で視線フェンス判定を実行。

**使用方法**:
1. Revit で「Add-Ins」タブを開く
2. 「Fence Check」コマンドを実行
3. 観測者位置、目標位置、フェンスを選択
4. 判定結果がビュー上に表示される

---

### Adapter

#### GeometryAdapter
Revit のジオメトリを engine の入力形式に変換。

```csharp
public class GeometryAdapter
{
    public VisibilityCheckInput ConvertToEngineInput(
        IEnumerable<Element> observers,
        IEnumerable<Element> targets,
        Element fence
    );
}
```

---

## 使用例

### TypeScript（Node.js）

```typescript
import { checkVisibility } from '@no-regret-home/engine';

const input = {
  observers: [{ position: { x: 0, y: 0, z: 1.6 }, name: "観測者" }],
  targets: [{ position: { x: 10, y: 0, z: 0 }, name: "目標" }],
  fence: {
    line: {
      start: { x: 5, y: -5, z: 0 },
      end: { x: 5, y: 5, z: 0 }
    },
    height: 1.8,
    name: "境界フェンス"
  }
};

const result = checkVisibility(input);

console.log(`遮蔽判定: ${result.visible ? '見える' : '見えない'}`);
console.log(`必要最小高さ: ${result.minimumFenceHeight}m`);
```

### CLI

```bash
# 入力ファイル: example.json
npx no-regret-home check -i example.json

# ビュー生成
npx no-regret-home visualize -i example.json -o ./views

# レポート生成
npx no-regret-home report -i example.json -o ./report.pdf
```

### JSON 入力例

```json
{
  "observers": [
    {
      "position": { "x": 0, "y": 0, "z": 1.6 },
      "name": "隣家1階窓"
    },
    {
      "position": { "x": 0, "y": 5, "z": 4.5 },
      "name": "隣家2階窓"
    }
  ],
  "targets": [
    {
      "position": { "x": 10, "y": 5, "z": 0.2 },
      "name": "ウッドデッキ"
    }
  ],
  "fence": {
    "line": {
      "start": { "x": 5, "y": 0, "z": 0 },
      "end": { "x": 5, "y": 10, "z": 0 }
    },
    "height": 1.8,
    "groundLevel": 0,
    "name": "境界フェンス"
  }
}
```

---

## 今後の拡張

- 複数フェンス対応
- 遮蔽物（樹木、建物）の追加
- 時刻・季節による太陽光の考慮
- REST API の提供（Webサービス化）

---

[戻る: README](../README.md)
