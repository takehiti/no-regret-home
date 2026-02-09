using System;
using System.Collections.Generic;
using System.Linq;
using NoRegretHome.Revit.Engine.Models;
using NoRegretHome.Revit.Engine.Geometry;

namespace NoRegretHome.Revit.Engine
{
    /// <summary>
    /// フェンス視線判定エンジン
    /// </summary>
    public class FenceChecker
    {
        /// <summary>
        /// 視線フェンス判定を実行
        /// </summary>
        public static VisibilityJudgment CheckVisibility(
            List<Observer> observers,
            List<Target> targets,
            Fence fence)
        {
            // 1. すべての視線を判定
            var sightlines = CheckMultipleSightlines(observers, targets, fence);

            // 2. 少なくとも1つの視線が通っているか
            var visible = sightlines.Any(s => !s.Obstructed);

            // 3. 必要最小高さを計算
            var minimumFenceHeight = CalculateMaximumMinimumHeight(observers, targets, fence.Line, fence.GroundLevel);

            // 4. 現在のフェンス高さ
            var currentFenceHeight = fence.Height;

            // 5. 遮蔽物名
            var obstructedBy = visible ? "" : (fence.Name ?? "fence");

            // 6. 判定結果を生成
            return VisibilityJudgment.Create(
                visible,
                obstructedBy,
                sightlines,
                minimumFenceHeight,
                currentFenceHeight
            );
        }

        /// <summary>
        /// 複数の観測者・目標に対して視線判定を実行
        /// </summary>
        private static List<Sightline> CheckMultipleSightlines(
            List<Observer> observers,
            List<Target> targets,
            Fence fence)
        {
            var sightlines = new List<Sightline>();

            foreach (var observer in observers)
            {
                foreach (var target in targets)
                {
                    var sightline = CheckSightlineObstruction(observer, target, fence);
                    sightlines.Add(sightline);
                }
            }

            return sightlines;
        }

        /// <summary>
        /// 観測者から目標への視線がフェンスによって遮られるかチェック
        /// </summary>
        private static Sightline CheckSightlineObstruction(
            Observer observer,
            Target target,
            Fence fence)
        {
            // 観測者の目線位置
            var eyePos = observer.GetEyePosition();

            // 視線ベクトル（方向）
            var sightlineVec = VectorUtils.Subtract(target.Position, eyePos);
            var sightlineDir = VectorUtils.Normalize(sightlineVec);

            // フェンスとの交差判定
            var intersection = IntersectionUtils.RayFenceIntersection(
                eyePos,
                sightlineDir,
                fence.Line,
                fence.Height,
                fence.GroundLevel
            );

            if (intersection.HasValue)
            {
                // 交差した = 遮られた
                return new Sightline(
                    eyePos,
                    target.Position,
                    true, // obstructed
                    intersection.Value,
                    fence.Name ?? "fence"
                );
            }

            // 遮られなかった
            return new Sightline(
                eyePos,
                target.Position,
                false // not obstructed
            );
        }

        /// <summary>
        /// 複数の観測者・目標に対して必要最小高さを計算（最大値を返す）
        /// </summary>
        private static double CalculateMaximumMinimumHeight(
            List<Observer> observers,
            List<Target> targets,
            Line fenceLine,
            double fenceGroundLevel)
        {
            var maxHeight = 0.0;

            foreach (var observer in observers)
            {
                foreach (var target in targets)
                {
                    var height = CalculateMinimumHeight(observer, target, fenceLine, fenceGroundLevel);
                    maxHeight = Math.Max(maxHeight, height);
                }
            }

            return maxHeight;
        }

        /// <summary>
        /// 視線を遮るために必要な最小フェンス高さを計算
        /// </summary>
        private static double CalculateMinimumHeight(
            Observer observer,
            Target target,
            Line fenceLine,
            double fenceGroundLevel)
        {
            // 観測者の目線位置
            var eyePos = observer.GetEyePosition();

            // 視線ベクトル
            var sightlineVec = VectorUtils.Subtract(target.Position, eyePos);
            var sightlineDir = VectorUtils.Normalize(sightlineVec);

            // フェンス平面（垂直）との交差判定
            var fenceVec = VectorUtils.Subtract(fenceLine.End, fenceLine.Start);
            var up = new Point3D(0, 0, 1);
            var fenceNormal = VectorUtils.Normalize(VectorUtils.Cross(fenceVec, up));

            // 平面との交差パラメータ t
            var P0 = fenceLine.Start;
            var denom = VectorUtils.Dot(fenceNormal, sightlineDir);

            if (Math.Abs(denom) < 1e-8)
            {
                // レイが平面と平行 → 交差しない
                return 0;
            }

            var t = VectorUtils.Dot(VectorUtils.Subtract(P0, eyePos), fenceNormal) / denom;

            if (t < 0)
            {
                // レイの逆方向 → 交差しない
                return 0;
            }

            // 交点（仮想）
            var intersection = VectorUtils.Add(eyePos, VectorUtils.Scale(sightlineDir, t));

            // 交点がフェンス線分の範囲内かチェック
            var lineVec = VectorUtils.Subtract(fenceLine.End, fenceLine.Start);
            var toIntersection = VectorUtils.Subtract(intersection, fenceLine.Start);

            var lineLength = VectorUtils.Magnitude(lineVec);
            if (lineLength == 0)
            {
                return 0;
            }

            var projection = VectorUtils.Dot(toIntersection, lineVec) / (lineLength * lineLength);

            if (projection < 0 || projection > 1)
            {
                // 線分の範囲外 → 交差しない
                return 0;
            }

            // 交点の高さ
            var intersectionHeight = intersection.Z;

            // 必要最小高さ = 交点高さ - 地盤高さ
            var minHeight = intersectionHeight - fenceGroundLevel;

            return Math.Max(0, minHeight);
        }
    }
}
