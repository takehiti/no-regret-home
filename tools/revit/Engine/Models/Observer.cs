namespace NoRegretHome.Revit.Engine.Models
{
    /// <summary>
    /// 観測者（視線の起点）
    /// </summary>
    public class Observer
    {
        public Point3D Position { get; set; }
        public double EyeHeight { get; set; }
        public string Name { get; set; }

        public Observer(Point3D position, double eyeHeight = 1.6, string name = "")
        {
            Position = position;
            EyeHeight = eyeHeight;
            Name = name;
        }

        /// <summary>
        /// 実際の目線位置を取得
        /// </summary>
        public Point3D GetEyePosition()
        {
            return new Point3D(Position.X, Position.Y, Position.Z + EyeHeight);
        }
    }
}
