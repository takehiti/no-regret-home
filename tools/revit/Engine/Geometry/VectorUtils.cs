using System;
using NoRegretHome.Revit.Engine.Models;

namespace NoRegretHome.Revit.Engine.Geometry
{
    /// <summary>
    /// ベクトル演算ユーティリティ
    /// </summary>
    public static class VectorUtils
    {
        public static Point3D Subtract(Point3D to, Point3D from)
        {
            return new Point3D(to.X - from.X, to.Y - from.Y, to.Z - from.Z);
        }

        public static Point3D Add(Point3D a, Point3D b)
        {
            return new Point3D(a.X + b.X, a.Y + b.Y, a.Z + b.Z);
        }

        public static Point3D Scale(Point3D v, double scalar)
        {
            return new Point3D(v.X * scalar, v.Y * scalar, v.Z * scalar);
        }

        public static double Magnitude(Point3D v)
        {
            return Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);
        }

        public static Point3D Normalize(Point3D v)
        {
            var mag = Magnitude(v);
            if (mag == 0) return new Point3D(0, 0, 0);
            return new Point3D(v.X / mag, v.Y / mag, v.Z / mag);
        }

        public static double Dot(Point3D a, Point3D b)
        {
            return a.X * b.X + a.Y * b.Y + a.Z * b.Z;
        }

        public static Point3D Cross(Point3D a, Point3D b)
        {
            return new Point3D(
                a.Y * b.Z - a.Z * b.Y,
                a.Z * b.X - a.X * b.Z,
                a.X * b.Y - a.Y * b.X
            );
        }

        public static Point3D Lerp(Point3D a, Point3D b, double t)
        {
            return new Point3D(
                a.X + (b.X - a.X) * t,
                a.Y + (b.Y - a.Y) * t,
                a.Z + (b.Z - a.Z) * t
            );
        }
    }
}
