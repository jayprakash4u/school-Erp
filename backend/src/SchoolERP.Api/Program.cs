using System.Text.Json.Serialization;
using Scalar.AspNetCore;
using Serilog;
using SchoolERP.Api.Middleware;
using SchoolERP.Application;
using SchoolERP.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "SchoolERP.Api")
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Add Layers (Clean Architecture)
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 3. Add Controllers & JSON Settings
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// 4. Add OpenAPI & API Explorer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// 5. Add CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:3000", "https://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("SchoolErpCorsPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // In development, permit requests from localhost and all local network IP addresses
            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                try
                {
                    var uri = new Uri(origin);
                    var host = uri.Host.ToLowerInvariant();

                    return host == "localhost"
                        || host == "127.0.0.1"
                        || host.StartsWith("192.168.")
                        || host.StartsWith("10.")
                        || host.StartsWith("172.");
                }
                catch
                {
                    return false;
                }
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

var app = builder.Build();

// 6. Custom Middleware Pipeline
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("School ERP API Explorer")
            .WithTheme(ScalarTheme.Moon);
    });
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("SchoolErpCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new
{
    Status = "Healthy",
    Timestamp = DateTime.UtcNow,
    Version = "1.0.0"
})).WithName("HealthCheck");

try
{
    Log.Information("Starting School ERP API host...");

    // Seed initial identity data (permissions, roles, superadmin)
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<SchoolERP.Infrastructure.Persistence.ApplicationDbContext>();
            var seeder = scope.ServiceProvider.GetRequiredService<SchoolERP.Infrastructure.Persistence.Seed.IdentityDataSeeder>();
            
            // Ensures database created if local development and seeds baseline
            if (app.Environment.IsDevelopment())
            {
                await dbContext.Database.EnsureCreatedAsync();
                await seeder.SeedAsync();
            }
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Could not automatically initialize / seed database on startup. Please ensure SQL Server is running.");
        }
    }

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}
