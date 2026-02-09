using System;
using System.Collections.Generic;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Selection;
using NoRegretHome.Revit.Adapters;
using NoRegretHome.Revit.Engine;
using NoRegretHome.Revit.Engine.Models;

namespace NoRegretHome.Revit.Commands
{
    [Transaction(TransactionMode.Manual)]
    [Regeneration(RegenerationOption.Manual)]
    public class FenceCheckCommand : IExternalCommand
    {
        public Result Execute(
            ExternalCommandData commandData,
            ref string message,
            ElementSet elements)
        {
            var uiApp = commandData.Application;
            var uiDoc = uiApp.ActiveUIDocument;
            var doc = uiDoc.Document;

            try
            {
                // ステップ1: 観測者位置を選択
                TaskDialog.Show("フェンス視線チェック",
                    "観測者の位置をクリックしてください\n（例：隣家の窓の位置）");

                var observerPoint = PickPoint(uiDoc, "観測者位置を選択");
                if (observerPoint == null)
                {
                    return Result.Cancelled;
                }

                // 観測者の高さ入力
                var eyeHeightStr = ShowInputDialog("目線の高さ（m）", "1.6");
                if (!double.TryParse(eyeHeightStr, out var eyeHeight))
                {
                    eyeHeight = 1.6;
                }

                var observer = new Observer(
                    GeometryAdapter.ToPoint3D(observerPoint),
                    eyeHeight,
                    "観測者"
                );

                // ステップ2: 目標地点を選択
                TaskDialog.Show("フェンス視線チェック",
                    "目標地点をクリックしてください\n（例：守りたい場所）");

                var targetPoint = PickPoint(uiDoc, "目標地点を選択");
                if (targetPoint == null)
                {
                    return Result.Cancelled;
                }

                var target = new Target(
                    GeometryAdapter.ToPoint3D(targetPoint),
                    "目標地点"
                );

                // ステップ3: フェンス線を選択（モデル線またはDetail線）
                TaskDialog.Show("フェンス視線チェック",
                    "フェンスの位置を示す線を選択してください");

                var fenceLine = PickLine(uiDoc);
                if (fenceLine == null)
                {
                    TaskDialog.Show("エラー", "フェンス線の選択がキャンセルされました");
                    return Result.Cancelled;
                }

                // フェンスの高さ入力
                var fenceHeightStr = ShowInputDialog("フェンスの高さ（m）", "1.8");
                if (!double.TryParse(fenceHeightStr, out var fenceHeight))
                {
                    fenceHeight = 1.8;
                }

                var fence = new Fence(
                    GeometryAdapter.ToEngineLine(fenceLine),
                    fenceHeight,
                    0,
                    "境界フェンス"
                );

                // 判定実行
                var result = FenceChecker.CheckVisibility(
                    new List<Observer> { observer },
                    new List<Target> { target },
                    fence
                );

                // 結果表示
                ShowResult(result);

                // 視線を可視化（モデル線として描画）
                using (Transaction trans = new Transaction(doc, "視線表示"))
                {
                    trans.Start();
                    DrawSightlines(doc, result.Sightlines);
                    trans.Commit();
                }

                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                TaskDialog.Show("エラー", $"エラーが発生しました:\n{ex.Message}");
                return Result.Failed;
            }
        }

        /// <summary>
        /// 点を選択
        /// </summary>
        private XYZ PickPoint(UIDocument uiDoc, string prompt)
        {
            try
            {
                return uiDoc.Selection.PickPoint(prompt);
            }
            catch (Autodesk.Revit.Exceptions.OperationCanceledException)
            {
                return null;
            }
        }

        /// <summary>
        /// 線を選択
        /// </summary>
        private Line PickLine(UIDocument uiDoc)
        {
            try
            {
                var reference = uiDoc.Selection.PickObject(
                    ObjectType.Element,
                    "線を選択してください"
                );

                var element = uiDoc.Document.GetElement(reference);

                // ModelCurve または DetailCurve から線を取得
                if (element is CurveElement curveElement)
                {
                    var curve = curveElement.GeometryCurve;
                    if (curve is Line line)
                    {
                        return line;
                    }
                }

                TaskDialog.Show("エラー", "選択された要素は線ではありません");
                return null;
            }
            catch (Autodesk.Revit.Exceptions.OperationCanceledException)
            {
                return null;
            }
        }

        /// <summary>
        /// 入力ダイアログを表示
        /// </summary>
        private string ShowInputDialog(string prompt, string defaultValue)
        {
            // 簡易実装：TaskDialogで数値入力を表示
            var dialog = new TaskDialog("入力")
            {
                MainInstruction = prompt,
                CommonButtons = TaskDialogCommonButtons.Ok | TaskDialogCommonButtons.Cancel
            };

            // 実際にはWPFのInputDialogを使うべきだが、簡易版としてデフォルト値を使用
            // TODO: WPFのInputDialogを実装
            return defaultValue;
        }

        /// <summary>
        /// 判定結果を表示
        /// </summary>
        private void ShowResult(VisibilityJudgment result)
        {
            var resultText = $"【判定結果】\n\n" +
                             $"見える/見えない: {(result.Visible ? "見える" : "見えない")}\n" +
                             $"現在のフェンス高さ: {result.CurrentFenceHeight:F2}m\n" +
                             $"必要最小高さ: {result.MinimumFenceHeight:F2}m\n" +
                             $"高さの余裕: {(result.HeightMargin >= 0 ? "+" : "")}{result.HeightMargin:F2}m\n" +
                             $"十分な高さか: {(result.IsAdequate ? "はい" : "いいえ")}\n\n" +
                             $"【推奨】\n{result.Recommendation}";

            var dialog = new TaskDialog("フェンス視線チェック結果")
            {
                MainInstruction = result.Visible ? "⚠️ 視線が通っています" : "✅ 視線を遮ることができます",
                MainContent = resultText,
                CommonButtons = TaskDialogCommonButtons.Ok
            };

            dialog.Show();
        }

        /// <summary>
        /// 視線をモデル線として描画
        /// </summary>
        private void DrawSightlines(Document doc, List<Sightline> sightlines)
        {
            var sketchPlane = FindOrCreateSketchPlane(doc);

            foreach (var sightline in sightlines)
            {
                var start = GeometryAdapter.ToXYZ(sightline.From);
                var end = GeometryAdapter.ToXYZ(sightline.To);

                var line = Line.CreateBound(start, end);
                var modelCurve = doc.Create.NewModelCurve(line, sketchPlane);

                // 色を設定（遮られた場合は緑、通った場合は赤）
                var pattern = new OverrideGraphicSettings();
                var color = sightline.Obstructed
                    ? new Color(0, 255, 0)  // 緑
                    : new Color(255, 0, 0); // 赤
                pattern.SetProjectionLineColor(color);
                pattern.SetProjectionLineWeight(5);

                doc.ActiveView.SetElementOverrides(modelCurve.Id, pattern);
            }
        }

        /// <summary>
        /// SketchPlaneを検索または作成
        /// </summary>
        private SketchPlane FindOrCreateSketchPlane(Document doc)
        {
            var plane = Plane.CreateByNormalAndOrigin(XYZ.BasisZ, XYZ.Zero);
            return SketchPlane.Create(doc, plane);
        }
    }
}
