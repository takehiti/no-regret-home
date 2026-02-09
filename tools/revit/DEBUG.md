# Visual Studio でのデバッグ手順

Revit アドインを Visual Studio でデバッグする方法を説明します。

---

## 前提条件

- ✅ Visual Studio 2022 がインストールされている
- ✅ Revit 2024 がインストールされている
- ✅ 管理者権限で実行可能（ビルド後のコピーに必要）

---

## デバッグ設定（既に完了）

プロジェクトファイル（`NoRegretHome.Revit.csproj`）に以下の設定が追加されています：

### 1. デバッグ起動設定

```xml
<PropertyGroup Condition="'$(Configuration)' == 'Debug'">
  <StartAction>Program</StartAction>
  <StartProgram>C:\Program Files\Autodesk\Revit 2024\Revit.exe</StartProgram>
</PropertyGroup>
```

これにより、F5（デバッグ開始）で Revit が自動的に起動します。

### 2. ビルド後の自動コピー

```xml
<Target Name="PostBuild" AfterTargets="PostBuildEvent" Condition="'$(Configuration)' == 'Debug'">
  <PropertyGroup>
    <RevitAddinsFolder>C:\ProgramData\Autodesk\Revit\Addins\$(RevitVersion)</RevitAddinsFolder>
  </PropertyGroup>
  <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(RevitAddinsFolder)" />
  <Copy SourceFiles="$(TargetDir)NoRegretHome.addin" DestinationFolder="$(RevitAddinsFolder)" />
</Target>
```

デバッグビルド時に、以下のファイルが自動的に Revit アドインフォルダにコピーされます：
- `NoRegretHome.Revit.dll`
- `NoRegretHome.addin`

---

## デバッグ手順

### 1. Visual Studio でプロジェクトを開く

```powershell
# tools/revit ディレクトリに移動
cd c:\Users\TakehisaNakamura\source\PersonalDevelopment\no-regret-home\tools\revit

# Visual Studio で開く
start NoRegretHome.Revit.csproj
```

または、Visual Studio から直接 `NoRegretHome.Revit.csproj` を開く。

### 2. 構成を Debug に設定

Visual Studio のツールバーで：
- **ソリューション構成**: `Debug`
- **ソリューション プラットフォーム**: `x64`

### 3. ブレークポイントを設定

デバッグしたいコードにブレークポイントを設定します。

例：`Commands/FenceCheckCommand.cs` の `Execute` メソッド内

```csharp
public Result Execute(
    ExternalCommandData commandData,
    ref string message,
    ElementSet elements)
{
    // ここにブレークポイント
    var uiApp = commandData.Application;
    var uiDoc = uiApp.ActiveUIDocument;
    var doc = uiDoc.Document;

    try
    {
        // ...
```

### 4. デバッグ開始

**方法1**: キーボードショートカット
```
F5 キーを押す
```

**方法2**: メニューから
```
デバッグ (D) → デバッグの開始 (S)
```

**方法3**: ツールバーから
```
緑色の再生ボタン（▶）をクリック
```

### 5. Revit が起動する

Visual Studio が Revit を自動的に起動します。

**重要**: 初回起動時は時間がかかる場合があります（数十秒〜1分程度）。

### 6. Revit でアドインを実行

Revit が起動したら：

1. 新規プロジェクトを開く（または既存プロジェクトを開く）
2. **アドイン** タブ → **外部ツール** → **フェンス視線チェック** をクリック

### 7. ブレークポイントでヒット

コマンドを実行すると、設定したブレークポイントで実行が停止します。

この時点で：
- ✅ **ステップ実行** (F10, F11) でコードを1行ずつ実行
- ✅ **変数の値を確認** (ローカル、ウォッチウィンドウ)
- ✅ **即時ウィンドウで式を評価**
- ✅ **コールスタックを確認**

### 8. デバッグ継続

- **続行** (F5): 次のブレークポイントまで実行
- **ステップオーバー** (F10): 次の行へ
- **ステップイン** (F11): 関数内部に入る
- **ステップアウト** (Shift+F11): 現在の関数から出る

### 9. デバッグ終了

**方法1**: Revit を閉じる
```
Revit を手動で閉じると、デバッグセッションも終了します
```

**方法2**: Visual Studio で停止
```
Shift + F5 キーを押す
または、赤い停止ボタン（■）をクリック
```

---

## デバッグのヒント

### 1. 出力ウィンドウを活用

Visual Studio の **出力** ウィンドウに、以下が表示されます：
- ビルドログ
- ビルド後のコピー処理
- デバッグメッセージ

### 2. 即時ウィンドウで式を評価

デバッグ中に `Ctrl + Alt + I` で即時ウィンドウを開き、式を評価できます：

```csharp
// 例: 変数の値を確認
? observerPoint
? observerPoint.X
? observerPoint.Y
? observerPoint.Z

// 例: メソッドを呼び出し
? GeometryAdapter.ToPoint3D(observerPoint)
```

### 3. 条件付きブレークポイント

ブレークポイントを右クリック → **条件** で、特定の条件でのみ停止させることができます。

例：
```csharp
// 観測者のZ座標が3.0より大きい場合のみ停止
observerPoint.Z > 3.0
```

### 4. TracePoint を使う

コードを変更せずに、ブレークポイントで値をログ出力できます。

ブレークポイントを右クリック → **アクション** で、以下のようなメッセージを設定：
```
観測者位置: {observerPoint.X}, {observerPoint.Y}, {observerPoint.Z}
```

### 5. ホットリロード（限定的）

一部のコード変更は、デバッグ中に適用できます（ホットリロード）。
ただし、Revit アドインでは制限があるため、基本的には再ビルドが必要です。

---

## トラブルシューティング

### Revit が起動しない

**原因**: Revit のインストールパスが異なる

**解決策**: `NoRegretHome.Revit.csproj` の以下の行を確認：
```xml
<StartProgram>C:\Program Files\Autodesk\Revit 2024\Revit.exe</StartProgram>
```

### ブレークポイントでヒットしない

**原因1**: Debug ビルドになっていない

**解決策**: ソリューション構成が `Debug` になっているか確認

**原因2**: 古い DLL が読み込まれている

**解決策**: Revit を完全に終了してから再度デバッグ開始

**原因3**: .pdb ファイルが見つからない

**解決策**: Clean & Rebuild を実行
```
ビルド → ソリューションのクリーン
ビルド → ソリューションのリビルド
```

### アクセス拒否エラー（ビルド後のコピー失敗）

**原因**: 管理者権限がない

**解決策**: Visual Studio を管理者として実行
```
Visual Studio を右クリック → 管理者として実行
```

### Revit が遅い

**原因**: デバッグモードでは最適化されていない

**解決策**: デバッグ時は仕方ないが、リリースビルドでは高速化されます

---

## ログ出力によるデバッグ

ブレークポイントの代わりに、ログ出力でデバッグすることもできます。

### TaskDialog でログ表示

```csharp
TaskDialog.Show("デバッグ", $"観測者位置: {observerPoint}");
```

### ファイルにログ出力

```csharp
using System.IO;

var logPath = @"C:\Temp\no-regret-home-debug.log";
File.AppendAllText(logPath, $"{DateTime.Now}: 観測者位置 = {observerPoint}\n");
```

---

## 参考：BUSAT のデバッグ方法との違い

### 共通点
- ✅ F5 でデバッグ開始
- ✅ ブレークポイントで停止
- ✅ ステップ実行が可能
- ✅ Revit が自動起動

### 相違点
- ⚙️ **ビルドツール**: BUSAT は `build.ps1`、no-regret-home は `dotnet build` または VS
- ⚙️ **ブランチ戦略**: BUSAT は `phase2/develop`、no-regret-home は単純な `main`

---

## まとめ

1. Visual Studio でプロジェクトを開く
2. Debug 構成にする
3. ブレークポイントを設定
4. **F5** でデバッグ開始
5. Revit が起動したらコマンドを実行
6. ブレークポイントでヒット → ステップ実行で確認

**重要**: 管理者権限で Visual Studio を実行することを推奨（ビルド後の自動コピーのため）

---

**「二度建てなくても分かる」未来へ。**
