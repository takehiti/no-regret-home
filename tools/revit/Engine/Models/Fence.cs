namespace NoRegretHome.Revit.Engine.Models
{
    /// <summary>
    /// フェンス（視線を遮る障害物）
    /// </summary>
    public class Fence
    {
        public Line Line { get; set; }
        public double Height { get; set; }
        public double GroundLevel { get; set; }
        public string Name { get; set; }

        public Fence(Line line, double height, double groundLevel = 0, string name = "")
        {
            Line = line;
            Height = height;
            GroundLevel = groundLevel;
            Name = name;
        }

        /// <summary>
        /// フェンスの上端の高さを取得
        /// </summary>
        public double GetTopHeight()
        {
            return GroundLevel + Height;
        }
    }
}
