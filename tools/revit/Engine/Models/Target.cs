namespace NoRegretHome.Revit.Engine.Models
{
    /// <summary>
    /// 目標地点（視線の終点）
    /// </summary>
    public class Target
    {
        public Point3D Position { get; set; }
        public string Name { get; set; }

        public Target(Point3D position, string name = "")
        {
            Position = position;
            Name = name;
        }
    }
}
