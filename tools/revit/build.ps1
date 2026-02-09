# ============================================
# Revit アドイン ビルドスクリプト
# ============================================

param(
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host " Revit アドイン ビルド開始" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 現在のディレクトリを確認
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "作業ディレクトリ: $scriptDir" -ForegroundColor Yellow
Write-Host "構成: $Configuration" -ForegroundColor Yellow
Write-Host ""

# ログディレクトリ作成
$logsDir = Join-Path $scriptDir "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $logsDir "build_$timestamp.log"

Write-Host "ログファイル: $logFile" -ForegroundColor Yellow
Write-Host ""

# ビルド開始
Write-Host "======================================" -ForegroundColor Green
Write-Host " ビルド実行中..." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

try {
    # dotnet build 実行
    $buildOutput = dotnet build NoRegretHome.Revit.csproj -c $Configuration 2>&1
    $buildOutput | Out-File -FilePath $logFile -Encoding UTF8
    $buildOutput | Write-Host

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "======================================" -ForegroundColor Red
        Write-Host " ビルド失敗" -ForegroundColor Red
        Write-Host "======================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "ログファイルを確認してください: $logFile" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host " ビルド成功" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""

    # 成果物の確認
    $outputDir = Join-Path $scriptDir "bin\$Configuration"
    $dllPath = Join-Path $outputDir "NoRegretHome.Revit.dll"
    $addinPath = Join-Path $outputDir "NoRegretHome.addin"

    if (Test-Path $dllPath) {
        Write-Host "✓ NoRegretHome.Revit.dll が生成されました" -ForegroundColor Green
    } else {
        Write-Host "✗ NoRegretHome.Revit.dll が見つかりません" -ForegroundColor Red
    }

    if (Test-Path $addinPath) {
        Write-Host "✓ NoRegretHome.addin が生成されました" -ForegroundColor Green
    } else {
        Write-Host "✗ NoRegretHome.addin が見つかりません" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "成果物の場所: $outputDir" -ForegroundColor Yellow
    Write-Host ""

    # インストール手順を表示
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host " インストール手順" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "以下のファイルを Revit アドインフォルダにコピーしてください:" -ForegroundColor White
    Write-Host ""
    Write-Host "  コピー元: $outputDir" -ForegroundColor Yellow
    Write-Host "  コピー先: C:\ProgramData\Autodesk\Revit\Addins\2024\" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  ファイル:" -ForegroundColor White
    Write-Host "    - NoRegretHome.Revit.dll" -ForegroundColor Cyan
    Write-Host "    - NoRegretHome.addin" -ForegroundColor Cyan
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host " エラー発生" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "ログファイル: $logFile" -ForegroundColor Red
    exit 1
}
