using Autodesk.Revit.DB;
using NoRegretHome.Revit.Engine.Models;
using System.Collections.Generic;

namespace NoRegretHome.Revit.Adapters
{
    /// <summary>
    /// Revit Geometry ⇔ Engine Models の変換
    /// </summary>
    public static class GeometryAdapter
    {
        /// <summary>
        /// Revit XYZ → Engine Point3D
        /// </summary>
        public static Point3D ToPoint3D(XYZ xyz)
        {
            // Revitは内部単位がフィート、メートルに変換
            return new Point3D(
                xyz.X * 0.3048, // フィート → メートル
                xyz.Y * 0.3048,
                xyz.Z * 0.3048
            );
        }

        /// <summary>
        /// Engine Point3D → Revit XYZ
        /// </summary>
        public static XYZ ToXYZ(Point3D point)
        {
            // メートル → フィート
            return new XYZ(
                point.X / 0.3048,
                point.Y / 0.3048,
                point.Z / 0.3048
            );
        }

        /// <summary>
        /// Revit Line → Engine Line
        /// </summary>
        public static Engine.Models.Line ToEngineLine(Autodesk.Revit.DB.Line revitLine)
        {
            var start = ToPoint3D(revitLine.GetEndPoint(0));
            var end = ToPoint3D(revitLine.GetEndPoint(1));
            return new Engine.Models.Line(start, end);
        }

        /// <summary>
        /// 2点から Engine Line を作成
        /// </summary>
        public static Engine.Models.Line CreateEngineLine(XYZ start, XYZ end)
        {
            return new Engine.Models.Line(ToPoint3D(start), ToPoint3D(end));
        }
    }
}
