# クイックスタート

このドキュメントでは、no-regret-home エンジンの実行方法を説明します。

---

## 前提条件

- **Node.js**: v20.x 以上
- **npm**: v9.x 以上

---

## 1. 依存関係のインストール

プロジェクトのルートディレクトリで以下を実行：

```bash
npm install
```

---

## 2. ビルド

TypeScriptをJavaScriptにコンパイルします。

```bash
npm run build
```

**確認**: `dist/` ディレクトリが作成され、コンパイル済みのJSファイルが生成されます。

---

## 3. テストの実行

単体テストを実行して、エンジンが正しく動作することを確認します。

```bash
npm test
```

**期待される結果**:
```
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

---

## 4. デモの実行

視線フェンス判定のデモを実行します。

```bash
npm run demo
```

**出力例**:
```
=== 視線フェンス判定デモ ===

【シナリオ1】隣家1階窓 → ウッドデッキ（フェンス1.8m）
---
見える/見えない: 見えない
現在のフェンス高さ: 1.8m
必要最小高さ: 0.80m
高さの余裕: +1.00m
十分な高さか: はい

推奨: 現在のフェンス高さ（1.80m）で視線を遮ることができます。余裕は 1.00m です。

【シナリオ2】隣家2階窓 → ウッドデッキ（フェンス1.8m）
---
見える/見えない: 見える
現在のフェンス高さ: 1.8m
必要最小高さ: 2.25m
高さの余裕: -0.45m
十分な高さか: いいえ

推奨: 現在のフェンス高さ（1.80m）では不十分です。視線を遮るためには、最低でも 2.25m が必要です（0.45m 不足）。

【シナリオ3】隣家2階窓 → ウッドデッキ（フェンス2.5m）
---
見える/見えない: 見えない
現在のフェンス高さ: 2.5m
必要最小高さ: 2.25m
高さの余裕: +0.25m
十分な高さか: はい

推奨: 現在のフェンス高さ（2.50m）で視線を遮ることができます。余裕は 0.25m です。

=== デモ終了 ===
```

---

## 5. プログラムから利用する

### TypeScript / Node.js

```typescript
import {
  createObserver,
  createTarget,
  createFence,
  createLine,
  checkVisibility,
} from 'no-regret-home';

// 観測者: 隣家2階窓
const observer = createObserver(
  { x: 0, y: 5, z: 3.0 },
  1.5,
  '隣家2階窓'
);

// 目標: ウッドデッキ
const target = createTarget(
  { x: 10, y: 5, z: 0.2 },
  'ウッドデッキ'
);

// フェンス: 境界線（x=5）、高さ1.8m
const fence = createFence(
  createLine(
    { x: 5, y: 0, z: 0 },
    { x: 5, y: 10, z: 0 }
  ),
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

console.log(`見える/見えない: ${result.visible ? '見える' : '見えない'}`);
console.log(`必要最小高さ: ${result.minimumFenceHeight.toFixed(2)}m`);
console.log(`推奨: ${result.recommendation}`);
```

---

## 6. サンプルデータを使う

[examples/sample-data/basic-fence-check.json](examples/sample-data/basic-fence-check.json) に、基本的なフェンスチェックのサンプルデータがあります。

```json
{
  "observers": [
    {
      "position": { "x": 0, "y": 0, "z": 0 },
      "eyeHeight": 1.6,
      "name": "隣家1階窓"
    },
    {
      "position": { "x": 0, "y": 5, "z": 3.0 },
      "eyeHeight": 1.5,
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
    "name": "東側境界フェンス"
  }
}
```

このJSONを読み込んで判定することも可能です（将来のCLIツールで対応予定）。

---

## 7. 開発モード（ウォッチモード）

テストをウォッチモードで実行（コード変更時に自動再実行）：

```bash
npm run test:watch
```

---

## トラブルシューティング

### ビルドエラーが出る場合

```bash
# クリーンビルド
npm run clean
npm run build
```

### テストが失敗する場合

1. ビルドが成功しているか確認
2. `dist/` ディレクトリが存在するか確認
3. 依存関係を再インストール:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 次のステップ

- [docs/concept.md](docs/concept.md) - プロジェクトの思想を理解
- [docs/architecture.md](docs/architecture.md) - 設計方針と層構造を理解
- [docs/mvp-scope.md](docs/mvp-scope.md) - MVPの詳細仕様を確認
- [docs/api-reference.md](docs/api-reference.md) - API仕様を確認

---

**「二度建てなくても分かる」未来へ。**
