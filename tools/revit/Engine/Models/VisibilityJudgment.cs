using System.Collections.Generic;

namespace NoRegretHome.Revit.Engine.Models
{
    /// <summary>
    /// 視線判定結果
    /// </summary>
    public class VisibilityJudgment
    {
        public bool Visible { get; set; }
        public string ObstructedBy { get; set; }
        public List<Sightline> Sightlines { get; set; }
        public double MinimumFenceHeight { get; set; }
        public double CurrentFenceHeight { get; set; }
        public double HeightMargin { get; set; }
        public bool IsAdequate { get; set; }
        public string Recommendation { get; set; }

        public VisibilityJudgment()
        {
            Sightlines = new List<Sightline>();
        }

        public static VisibilityJudgment Create(
            bool visible,
            string obstructedBy,
            List<Sightline> sightlines,
            double minimumFenceHeight,
            double currentFenceHeight)
        {
            var result = new VisibilityJudgment
            {
                Visible = visible,
                ObstructedBy = obstructedBy,
                Sightlines = sightlines,
                MinimumFenceHeight = minimumFenceHeight,
                CurrentFenceHeight = currentFenceHeight
            };

            result.HeightMargin = currentFenceHeight - minimumFenceHeight;
            result.IsAdequate = result.HeightMargin >= 0;

            // 推奨文を生成
            if (result.IsAdequate)
            {
                if (result.HeightMargin < 0.1)
                {
                    result.Recommendation = $"現在のフェンス高さ（{currentFenceHeight:F2}m）で視線を遮ることができますが、余裕がほとんどありません。0.1m程度高くすることを推奨します。";
                }
                else
                {
                    result.Recommendation = $"現在のフェンス高さ（{currentFenceHeight:F2}m）で視線を遮ることができます。余裕は {result.HeightMargin:F2}m です。";
                }
            }
            else
            {
                var shortage = System.Math.Abs(result.HeightMargin);
                result.Recommendation = $"現在のフェンス高さ（{currentFenceHeight:F2}m）では不十分です。視線を遮るためには、最低でも {minimumFenceHeight:F2}m が必要です（{shortage:F2}m 不足）。";
            }

            return result;
        }
    }
}
