using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace api;

public partial class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Device> Devices { get; set; }

    public virtual DbSet<Sweep> Sweeps { get; set; }

    public virtual DbSet<SweepPoint> SweepPoints { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Device>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("devices_pkey");

            entity.ToTable("devices");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.LastSeen)
                .HasDefaultValueSql("now()")
                .HasColumnName("last_seen");
        });

        modelBuilder.Entity<Sweep>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("sweeps_pkey");

            entity.ToTable("sweeps");

            entity.HasIndex(e => new { e.DeviceId, e.CapturedAt }, "sweeps_device_captured_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AreaM2).HasColumnName("area_m2");
            entity.Property(e => e.CapturedAt).HasColumnName("captured_at");
            entity.Property(e => e.DeviceId).HasColumnName("device_id");
            entity.Property(e => e.ReceivedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("received_at");
            entity.Property(e => e.StepDeg)
                .HasDefaultValue((short)1)
                .HasColumnName("step_deg");

            entity.HasOne(d => d.Device).WithMany(p => p.Sweeps)
                .HasForeignKey(d => d.DeviceId)
                .HasConstraintName("sweeps_device_id_fkey");
        });

        modelBuilder.Entity<SweepPoint>(entity =>
        {
            entity.HasKey(e => new { e.SweepId, e.AngleDeg }).HasName("sweep_points_pkey");

            entity.ToTable("sweep_points");

            entity.Property(e => e.SweepId).HasColumnName("sweep_id");
            entity.Property(e => e.AngleDeg).HasColumnName("angle_deg");
            entity.Property(e => e.DistanceCm).HasColumnName("distance_cm");

            entity.HasOne(d => d.Sweep).WithMany(p => p.SweepPoints)
                .HasForeignKey(d => d.SweepId)
                .HasConstraintName("sweep_points_sweep_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
