using GymGenius.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GymGenius.Api.Infrastructure.Persistence;

public class GymDbContext : IdentityDbContext<User>
{
    public GymDbContext(DbContextOptions<GymDbContext> options) : base(options) { }
    
    public DbSet<Split> Splits { get; set; }
    public DbSet<Workout> Workouts { get; set; }
    public DbSet<Exercise> Exercises { get; set; }
    public DbSet<Set> Sets { get; set; }
    
    public DbSet<WorkoutLog> WorkoutLogs { get; set; }
    public DbSet<ExerciseLog> ExerciseLogs { get; set; }
    public DbSet<SetLog> SetLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.HasPostgresExtension("postgis");

        builder.Entity<User>(entity =>
        {
            entity.Property(u => u.Weight).HasPrecision(5, 2);
            entity.Property(u => u.Height).HasPrecision(5, 2);
        });
        
        builder.Entity<Split>()
            .HasMany(s => s.Workouts).WithOne(w => w.Split).HasForeignKey(w => w.SplitId).OnDelete(DeleteBehavior.Cascade);
        
        builder.Entity<Workout>()
            .HasMany(w => w.Exercises).WithOne(e => e.Workout).HasForeignKey(e => e.WorkoutId).OnDelete(DeleteBehavior.Cascade);
        
        builder.Entity<Exercise>()
            .HasMany(e => e.Sets).WithOne(s => s.Exercise).HasForeignKey(s => s.ExerciseId).OnDelete(DeleteBehavior.Cascade);
        
        builder.Entity<WorkoutLog>()
            .HasMany(l => l.Exercises).WithOne(e => e.WorkoutLog).HasForeignKey(e => e.WorkoutLogId).OnDelete(DeleteBehavior.Cascade);
        
        builder.Entity<ExerciseLog>()
            .HasMany(e => e.Sets).WithOne(s => s.ExerciseLog).HasForeignKey(s => s.ExerciseLogId).OnDelete(DeleteBehavior.Cascade);
        
        builder.Entity<Exercise>()
            .HasIndex(e => new { e.WorkoutId, e.Name })
            .IsUnique();
    }
}