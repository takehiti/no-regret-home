# Revit アドイン - フェンス視線チェック

no-regret-home の Revit 2024 アドインです。

---

## 概要

このアドインは、Revit上で「フェンスで視線を遮れるか」を判定するツールです。

- 観測者の位置（隣家の窓など）
- 目標地点（守りたい場所）
- フェンスの位置と高さ

を指定することで、視線が遮られるかを判定し、必要最小フェンス高さを計算します。

---

## 前提条件

- **Revit 2024** がインストールされていること
- **Visual Studio 2022** または **MSBuild** がインストールされていること
- **.NET Framework 4.8**

---

## ビルド手順

### 1. プロジェクトをビルド

```powershell
# tools/revit ディレクトリに移動
cd tools/revit

# ビルド実行
dotnet build NoRegretHome.Revit.csproj -c Release
```

または、Visual Studioで `NoRegretHome.Revit.csproj` を開いてビルド。

### 2. ビルド成果物の確認

ビルドが成功すると、以下のファイルが生成されます：

```
tools/revit/bin/Release/
├─ NoRegretHome.Revit.dll
└─ NoRegretHome.addin
```

---

## インストール手順

### 1. Revit アドインフォルダにコピー

以下のフォルダに、ビルド成果物をコピーします：

```
C:\ProgramData\Autodesk\Revit\Addins\2024\
```

コピーするファイル：
- `NoRegretHome.Revit.dll`
- `NoRegretHome.addin`

### 2. Revit を起動

Revit 2024 を起動すると、アドインが自動的に読み込まれます。

---

## 使い方

### 1. コマンドの実行

Revit のリボンから、以下のいずれかの方法で実行：

- **アドイン** タブ → **外部ツール** → **フェンス視線チェック**
- または、コマンド検索（キーボードショートカット `Ctrl + F` → "フェンス視線チェック"）

### 2. 操作手順

#### ステップ1: 観測者位置を選択
- 「観測者の位置をクリックしてください」というダイアログが表示されます
- 隣家の窓など、視線の起点となる位置をクリック
- 目線の高さ（デフォルト: 1.6m）を入力

#### ステップ2: 目標地点を選択
- 「目標地点をクリックしてください」というダイアログが表示されます
- ウッドデッキなど、守りたい場所をクリック

#### ステップ3: フェンス線を選択
- 「フェンスの位置を示す線を選択してください」というダイアログが表示されます
- モデル線またはDetail線を選択
- フェンスの高さ（デフォルト: 1.8m）を入力

### 3. 判定結果の確認

判定結果がダイアログで表示されます：

```
【判定結果】

見える/見えない: 見えない
現在のフェンス高さ: 1.80m
必要最小高さ: 0.90m
高さの余裕: +0.90m
十分な高さか: はい

【推奨】
現在のフェンス高さ（1.80m）で視線を遮ることができます。余裕は 0.90m です。
```

### 4. 視線の可視化

判定後、Revitのビュー上に視線がモデル線として描画されます：

- **緑色の線**: 視線が遮られている
- **赤色の線**: 視線が通っている（見える）

---

## トラブルシューティング

### アドインが表示されない

1. **アドインフォルダを確認**
   ```
   C:\ProgramData\Autodesk\Revit\Addins\2024\
   ```
   に、`NoRegretHome.Revit.dll` と `NoRegretHome.addin` があるか確認

2. **Revit のログを確認**
   ```
   %LOCALAPPDATA%\Autodesk\Revit\Autodesk Revit 2024\Journals\
   ```
   最新のジャーナルファイルを開き、エラーメッセージを確認

3. **.NET Framework 4.8 がインストールされているか確認**

### ビルドエラー

1. **Revit API の参照パスを確認**
   `NoRegretHome.Revit.csproj` の以下の行を確認：
   ```xml
   <Reference Include="RevitAPI">
     <HintPath>C:\Program Files\Autodesk\Revit 2024\RevitAPI.dll</HintPath>
   </Reference>
   ```
   Revitのインストールパスが異なる場合は修正

---

## 制限事項（MVP版）

- 観測者・目標地点は1つずつのみ対応（複数選択は未対応）
- フェンスは直線のみ対応（L字型・コの字型は未対応）
- 地盤高低差は未対応（将来対応予定）
- 数値入力ダイアログが簡易版（WPF Dialogは未実装）

---

## アーキテクチャ

このアドインは、no-regret-home の設計思想に従い、以下の構造で実装されています：

```
tools/revit/
├─ Engine/              # UI非依存の判定核（C#移植版）
│  ├─ Models/           # データモデル
│  ├─ Geometry/         # 幾何計算
│  └─ FenceChecker.cs   # 判定エンジン
│
├─ Adapters/            # Revit Geometry ⇔ Engine Models 変換
├─ Commands/            # Revitコマンド（UI）
└─ NoRegretHome.addin   # マニフェスト
```

**重要**: `Engine/` は TypeScript版エンジンの C# 移植です。
ロジックは同一であり、将来的には REST API 経由での統合も検討されています。

---

## ライセンス

（親プロジェクトと同じ）

---

**「二度建てなくても分かる」未来へ。**
