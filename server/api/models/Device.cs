using System;
using System.Collections.Generic;

namespace api;

public partial class Device
{
    public string Id { get; set; } = null!;

    public DateTime LastSeen { get; set; }

    public virtual ICollection<Sweep> Sweeps { get; set; } = new List<Sweep>();
}
