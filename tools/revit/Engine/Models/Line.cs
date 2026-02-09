namespace NoRegretHome.Revit.Engine.Models
{
    /// <summary>
    /// 3次元空間における線分
    /// </summary>
    public class Line
    {
        public Point3D Start { get; set; }
        public Point3D End { get; set; }

        public Line(Point3D start, Point3D end)
        {
            Start = start;
            End = end;
        }
    }
}
