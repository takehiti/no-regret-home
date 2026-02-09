namespace NoRegretHome.Revit.Engine.Models
{
    /// <summary>
    /// 視線ライン
    /// </summary>
    public class Sightline
    {
        public Point3D From { get; set; }
        public Point3D To { get; set; }
        public bool Obstructed { get; set; }
        public Point3D? ObstructionPoint { get; set; }
        public string ObstructedBy { get; set; }
        public double? DistanceToObstruction { get; set; }

        public Sightline(Point3D from, Point3D to, bool obstructed = false,
                        Point3D? obstructionPoint = null, string obstructedBy = "")
        {
            From = from;
            To = to;
            Obstructed = obstructed;
            ObstructionPoint = obstructionPoint;
            ObstructedBy = obstructedBy;

            if (obstructed && obstructionPoint.HasValue)
            {
                var dx = obstructionPoint.Value.X - from.X;
                var dy = obstructionPoint.Value.Y - from.Y;
                var dz = obstructionPoint.Value.Z - from.Z;
                DistanceToObstruction = System.Math.Sqrt(dx * dx + dy * dy + dz * dz);
            }
        }
    }
}
