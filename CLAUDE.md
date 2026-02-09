# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Claudeへ

**このファイルは行動制約のみを定義する。**
**設計判断・手順の詳細・背景説明は docs/ 配下を必ず確認すること。**

---

## 言語について

あなたは英語で思考し、ユーザーへの応答は日本語で行ってください。

---

## ⚠️ 重要：作業開始前に必ずドキュメントを読んでください

このプロジェクトのガイドラインは、以下のファイルに分割されています。
**作業を開始する前に、必ず該当するドキュメントを読んでください。**

### Claude Code（AI）への指示

1. **該当するドキュメントを読む**
2. **「読んだ」とユーザーに報告する**
3. **読んだ内容に基づいて判断する**

---

## 📚 ドキュメント一覧

### 必読ドキュメント

| ファイル | 内容 | いつ読むか |
|---------|------|-----------|
| [`docs/concept.md`](docs/concept.md) | **プロジェクトの思想と背景** | プロジェクト理解のため最初に読む |
| [`docs/architecture.md`](docs/architecture.md) | **アーキテクチャ設計方針と層構造** | 実装開始前に必ず読む |
| [`docs/mvp-scope.md`](docs/mvp-scope.md) | **MVPスコープ（視線フェンス判定）** | 機能実装前に読む |
| [`docs/api-reference.md`](docs/api-reference.md) | **API仕様** | エンジンの公開APIを確認する際に読む |

### 将来追加予定のドキュメント

| ファイル | 内容 |
|---------|------|
| `docs/coding-standards.md` | コーディング規約 |
| `docs/testing-strategy.md` | テスト戦略 |
| `docs/build-and-deployment.md` | ビルド・デプロイ手順 |

---

## 🚀 クイックスタート

### 新しいタスクを開始する前に

```
1. タスク内容を確認
    ↓
2. 「どの層を触るか？」を判断
    ↓ engine → docs/architecture.md を読む
    ↓ viewer → docs/architecture.md を読む
    ↓ output → docs/architecture.md を読む
    ↓ tools  → docs/architecture.md を読む
    ↓
3. 実装開始
    ↓
4. ビルド・テスト
    → npm run build
    → npm test
    ↓
5. コードフォーマット（将来）
```

---

## 📖 ドキュメント読み込み例

### 良い例

```
ユーザー: 「視線判定エンジンを修正して」

Claude:
「了解しました。作業を開始する前に、該当ドキュメントを確認します。

📖 読み込んだドキュメント:
- docs/architecture.md （アーキテクチャ設計方針と層構造）
- docs/mvp-scope.md （視線フェンス判定の詳細仕様）

確認結果:
- 視線判定は `src/engine/sightline/` に存在
- エンジン層はUI非依存の純粋関数として実装
- 変更後は必ず単体テストを実行

質問: これはバグ修正ですか？機能改善ですか？」
```

### 悪い例（ドキュメントを読まない）

```
ユーザー: 「視線判定エンジンを修正して」

Claude:
「了解しました。src/engine/sightline/を修正します」
↑ ドキュメントを読んでいない
```

---

## Project Overview

**no-regret-home** は、一般の建築主が「後悔しない家づくり」を一度で実現するための判定・可視化ツール群です。

### 設計思想

1. **判定エンジンが核心**
   - UI非依存の純粋な計算・判定ロジック
   - Web / Unity / Revit など、あらゆるフロントエンドから利用可能

2. **ビューによる判断**
   - 「鑑賞用の3D」ではなく「判断できるビュー」
   - 代表的な視点からの静止画・図を優先

3. **Revitはプロ向けツール**
   - 一般ユーザーは Revit を持っていない
   - Revitアドインは検証者が使う「高精度チェックツール」

4. **言語中立な設計**
   - エンジン層は特定の言語やプラットフォームに依存しない

**詳細**: [`docs/concept.md`](docs/concept.md), [`docs/architecture.md`](docs/architecture.md)

---

## Build & Test

### ビルド

```bash
npm run build
```

### テスト

```bash
npm test
```

### コードフォーマット（将来）

```bash
npm run lint
```

---

## Architecture Overview

### 層構造

```
no-regret-home/
├─ src/
│  ├─ engine/      # UI非依存の判定核（視線・高さ・法規など）
│  ├─ viewer/      # "判断できるビュー"生成（静止画・図）
│  └─ output/      # PDF/HTML などの説明資料
│
├─ tools/
│  ├─ revit/       # Revitアドイン（プロ向け検証）
│  └─ cli/         # CLIツール
│
├─ tests/          # テスト
└─ examples/       # 使用例・サンプルデータ
```

### 依存方向

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

**詳細**: [`docs/architecture.md`](docs/architecture.md)

---

## Context7 の活用（APIリファレンス参照）

### Revit API の仕様を調べる

RevitAPIに関するコーディングをする際は**context7で必ず仕様を調査**し、最適なAPIを選定し、正しい実装方法を理解してから実装してください。

### Unity API の仕様を調べる

Unity関連のコーディングをする際も、context7でUnity APIの仕様を調査してください。

---

## 判断フロー

```
新しいタスクを依頼された
    ↓
❓ どの層を触るか？
    ↓ engine
    📖 docs/architecture.md を読む
    📖 docs/mvp-scope.md を読む
    ❓ どの種類の作業か？
        ↓ バグ修正 → 既存コードで修正
        ↓ 機能改善 → 既存コードで改善
        ↓ 新機能追加 → 新規モジュール追加
    ↓
    ↓ viewer
    📖 docs/architecture.md を読む
    ❓ 静止画ビュー？3Dビュー？
        → 実装方針を確認
    ↓
    ↓ output
    📖 docs/architecture.md を読む
    ❓ PDF？HTML？
        → 実装方針を確認
    ↓
    ↓ tools (Revit / Unity / CLI)
    📖 docs/architecture.md を読む
    ❓ どのプラットフォーム？
        → Revit: tools/revit/
        → Unity: （将来）tools/unity/
        → CLI: tools/cli/
```

---

## まとめ

### Claude Code（AI）への最重要指示

1. **作業前に必ず該当ドキュメントを読む**
2. **読んだことをユーザーに報告する**
3. **層の依存関係を守る**（engine → viewer → output、tools は利用側）
4. **エンジンはUI非依存で実装**
5. **判断に迷ったらユーザーに確認する**

### 開発者への最重要指示

#### エンジン実装
1. **UI非依存の純粋関数として実装**
2. **特定のプラットフォームに依存しない**
3. **単体テスト必須**
4. **npm run build で確認**

#### ビュー・出力実装
1. **エンジンの結果を視覚化**
2. **「判断できるビュー」を優先**
3. **静止画・図から始める**

#### ツール実装
1. **エンジンを利用する側**
2. **プラットフォーム固有の処理を隔離**
3. **Revitアドインは「エンジンの利用例」**

---

**思想の詳細**: [`docs/concept.md`](docs/concept.md)
