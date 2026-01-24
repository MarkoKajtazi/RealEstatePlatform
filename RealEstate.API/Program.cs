using System.Globalization;
using System.Text.Json.Serialization;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using RealEstate.Repository;
using RealEstate.Repository.Implementation;
using RealEstate.Repository.Interface;
using RealEstate.Service.Implementation;
using RealEstate.Service.Interface;

// Set invariant culture for consistent decimal parsing (use "." not ",")
CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

var builder = WebApplication.CreateBuilder(args);

DotNetEnv.Env.TraversePath().Load();
builder.Configuration.AddEnvironmentVariables();

var host = Environment.GetEnvironmentVariable("DB_HOST");
var port = Environment.GetEnvironmentVariable("DB_PORT");
var database = Environment.GetEnvironmentVariable("DB_NAME");
var user = Environment.GetEnvironmentVariable("DB_USER");
var password = Environment.GetEnvironmentVariable("DB_PASS");

var connectionString = $"Host={host};Port={port};Database={database};Username={user};Password={password}";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAdB2C"));
builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

builder.Services.AddTransient<ICloudinaryService, CloudinaryService>();
builder.Services.AddTransient<IImageService, ImageService>();
builder.Services.AddTransient<IPropertyService, PropertyService>();
builder.Services.AddTransient<IListingService, ListingService>();
builder.Services.AddTransient<IFloorPlanPinService, FloorPlanPinService>();

var account = new Account(
    Environment.GetEnvironmentVariable("CLOUD_NAME"),
    Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY"),
    Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET")
);

Cloudinary cloudinary = new Cloudinary(account)
{
    Api = { Secure = true }
};
builder.Services.AddSingleton(cloudinary);
cloudinary.Api.Secure = true;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.MapControllers();
app.Run();