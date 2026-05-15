using System;
using System.Collections.Generic;

namespace api;

public partial class Sweep
{
    public string Id { get; set; } = null!;

    public string DeviceId { get; set; } = null!;

    public DateTime CapturedAt { get; set; }

    public DateTime ReceivedAt { get; set; }

    public decimal? AreaM2 { get; set; }

    public short StepDeg { get; set; }

    public virtual Device Device { get; set; } = null!;

    public virtual ICollection<SweepPoint> SweepPoints { get; set; } = new List<SweepPoint>();
}
