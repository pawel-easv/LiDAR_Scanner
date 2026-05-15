using System;
using System.Collections.Generic;

namespace api;

public partial class SweepPoint
{
    public string SweepId { get; set; } = null!;

    public short AngleDeg { get; set; }

    public float DistanceCm { get; set; }

    public virtual Sweep Sweep { get; set; } = null!;
}
