# Revit アドイン クイックスタート

Revitでフェンス視線チェックを実行するための手順です。

---

## 📋 準備

### 前提条件
- ✅ Revit 2024 がインストールされている
- ✅ Visual Studio 2022 または dotnet CLI がインストールされている

---

## 🚀 ビルドとインストール

### 1. ビルド

```powershell
# tools/revit ディレクトリに移動
cd tools/revit

# ビルドスクリプトを実行
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

**確認**: `Build SUCCEEDED` のメッセージが表示されること

### 2. 成果物の確認

以下のファイルが生成されます：

```
tools/revit/bin/Release/
├─ NoRegretHome.Revit.dll
└─ NoRegretHome.addin
```

### 3. Revit アドインフォルダにコピー

以下のコマンドで自動コピー（管理者権限が必要）：

```powershell
# 管理者権限でPowerShellを開く
$source = "bin\Release"
$dest = "C:\ProgramData\Autodesk\Revit\Addins\2024"

Copy-Item "$source\NoRegretHome.Revit.dll" $dest -Force
Copy-Item "$source\NoRegretHome.addin" $dest -Force
```

または、手動でコピー：
- コピー元: `tools/revit/bin/Release/`
- コピー先: `C:\ProgramData\Autodesk\Revit\Addins\2024\`

---

## 🎯 Revitでの実行

### 1. Revit を起動

Revit 2024 を起動すると、アドインが自動的に読み込まれます。

### 2. テスト用プロジェクトを準備

簡単なテストシナリオ：

1. 新規プロジェクトを開く
2. 3Dビューまたは平面図を開く
3. モデル線を描画（例：X軸方向に10mの線）
   - これがフェンスの位置になります

### 3. コマンドを実行

**方法1**: リボンから実行
- **アドイン** タブ → **外部ツール** → **フェンス視線チェック**

**方法2**: コマンド検索から実行
- `Ctrl + F` → "フェンス視線チェック" と入力 → Enter

### 4. 操作手順

#### ステップ1: 観測者位置を選択
```
「観測者の位置をクリックしてください」
→ フェンスの片側をクリック（例：X=0, Y=0, Z=0）
→ 目線の高さを入力（デフォルト: 1.6m）
```

#### ステップ2: 目標地点を選択
```
「目標地点をクリックしてください」
→ フェンスの反対側をクリック（例：X=10, Y=0, Z=0）
```

#### ステップ3: フェンス線を選択
```
「フェンスの位置を示す線を選択してください」
→ 事前に描画したモデル線を選択
→ フェンスの高さを入力（デフォルト: 1.8m）
```

### 5. 判定結果の確認

ダイアログに判定結果が表示されます：

```
【判定結果】

見える/見えない: 見えない
現在のフェンス高さ: 1.80m
必要最小高さ: 0.90m
高さの余裕: +0.90m
十分な高さか: はい

【推奨】
現在のフェンス高さ（1.80m）で視線を遮ることができます。
余裕は 0.90m です。
```

### 6. 視線の可視化

判定後、Revitのビュー上に視線がモデル線として描画されます：

- **緑色の線**: 視線が遮られている ✅
- **赤色の線**: 視線が通っている ⚠️

---

## 📊 テストシナリオ例

### シナリオ1: 1階窓からの視線（遮蔽成功）

- **観測者**: (0, 0, 0) + 目線1.6m
- **目標**: (10, 0, 0.2)
- **フェンス**: X=5の位置、高さ1.8m
- **期待結果**: ✅ 遮蔽成功

### シナリオ2: 2階窓からの視線（遮蔽失敗）

- **観測者**: (0, 0, 3.0) + 目線1.5m
- **目標**: (10, 0, 0.2)
- **フェンス**: X=5の位置、高さ1.8m
- **期待結果**: ⚠️ 見える（約2.35m必要）

### シナリオ3: 高いフェンス（遮蔽成功）

- **観測者**: (0, 0, 3.0) + 目線1.5m
- **目標**: (10, 0, 0.2)
- **フェンス**: X=5の位置、高さ2.5m
- **期待結果**: ✅ 遮蔽成功

---

## 🐛 トラブルシューティング

### アドインが表示されない

**確認1**: アドインファイルの存在確認
```powershell
Test-Path "C:\ProgramData\Autodesk\Revit\Addins\2024\NoRegretHome.Revit.dll"
Test-Path "C:\ProgramData\Autodesk\Revit\Addins\2024\NoRegretHome.addin"
```

**確認2**: Revit ジャーナルログを確認
```
%LOCALAPPDATA%\Autodesk\Revit\Autodesk Revit 2024\Journals\
```
最新のジャーナルファイルを開き、エラーメッセージを確認

**確認3**: .NET Framework 4.8 の確認
```powershell
Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full'
```

### ビルドエラー

**エラー**: `RevitAPI.dll が見つかりません`

**解決策**: `NoRegretHome.Revit.csproj` の参照パスを確認
```xml
<Reference Include="RevitAPI">
  <HintPath>C:\Program Files\Autodesk\Revit 2024\RevitAPI.dll</HintPath>
</Reference>
```

### 実行時エラー

**エラー**: `選択された要素は線ではありません`

**解決策**: モデル線またはDetail線を選択してください。壁や床などの要素は選択できません。

---

## 📚 関連ドキュメント

- [README.md](README.md) - Revitアドインの概要
- [../../CLAUDE.md](../../CLAUDE.md) - プロジェクト全体のガイド
- [../../docs/architecture.md](../../docs/architecture.md) - アーキテクチャ設計

---

**「二度建てなくても分かる」未来へ。**
