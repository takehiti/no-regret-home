using System;
using NoRegretHome.Revit.Engine.Models;

namespace NoRegretHome.Revit.Engine.Geometry
{
    /// <summary>
    /// 交差判定ユーティリティ
    /// </summary>
    public static class IntersectionUtils
    {
        /// <summary>
        /// レイとフェンス（垂直な壁）の交差判定
        /// </summary>
        public static Point3D? RayFenceIntersection(
            Point3D rayOrigin,
            Point3D rayDirection,
            Line fenceLine,
            double fenceHeight,
            double fenceGroundLevel = 0)
        {
            // フェンスの法線ベクトル（垂直方向）
            var fenceVec = VectorUtils.Subtract(fenceLine.End, fenceLine.Start);
            var up = new Point3D(0, 0, 1);
            var fenceNormal = VectorUtils.Normalize(VectorUtils.Cross(fenceVec, up));

            // 平面の方程式: normal · (P - P0) = 0
            var P0 = fenceLine.Start;

            // レイと平面の交差判定
            var denom = VectorUtils.Dot(fenceNormal, rayDirection);

            if (Math.Abs(denom) < 1e-8)
            {
                return null; // レイが平面と平行
            }

            var t = VectorUtils.Dot(VectorUtils.Subtract(P0, rayOrigin), fenceNormal) / denom;

            if (t < 0)
            {
                return null; // レイの逆方向
            }

            // 交点
            var intersection = VectorUtils.Add(rayOrigin, VectorUtils.Scale(rayDirection, t));

            // 交点がフェンスの範囲内か確認
            // 1. 高さチェック
            if (intersection.Z < fenceGroundLevel || intersection.Z > fenceGroundLevel + fenceHeight)
            {
                return null;
            }

            // 2. 線分の範囲内かチェック
            var lineVec = VectorUtils.Subtract(fenceLine.End, fenceLine.Start);
            var toIntersection = VectorUtils.Subtract(intersection, fenceLine.Start);

            var lineLength = VectorUtils.Magnitude(lineVec);
            if (lineLength == 0)
            {
                return null;
            }

            var projection = VectorUtils.Dot(toIntersection, lineVec) / (lineLength * lineLength);

            if (projection < 0 || projection > 1)
            {
                return null; // 線分の範囲外
            }

            return intersection;
        }
    }
}
