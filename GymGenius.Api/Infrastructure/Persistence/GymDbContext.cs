using GymGenius.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GymGenius.Api.Infrastructure.Persistence;

public class GymDbContext : IdentityDbContext<User>
{
    public GymDbContext(DbContextOptions<GymDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Attivazione estensione PostGIS
        builder.HasPostgresExtension("postgis");

        builder.Entity<User>(entity =>
        {
            entity.Property(u => u.Weight).HasPrecision(5, 2);
            entity.Property(u => u.Height).HasPrecision(5, 2);
            
            // Indice spaziale per future query geocalizzate
            entity.HasIndex(u => u.Location);
        });
    }
}