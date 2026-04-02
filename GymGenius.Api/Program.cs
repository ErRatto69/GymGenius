using GymGenius.Api.Domain.Entities;
using GymGenius.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Database con supporto PostGIS
builder.Services.AddDbContext<GymDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"), 
        o => o.UseNetTopologySuite()));

// Identity configurato sul nostro User
builder.Services.AddIdentityCore<User>(options => {
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<GymDbContext>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();
app.Run();