using RealEstate.Domain.Domain_Models;

namespace RealEstate.Repository;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }
    
    public virtual DbSet<Property> Properties { get; set; }
    public virtual DbSet<Listing> Listings { get; set; }
    public virtual DbSet<Image> Images { get; set; }
    public virtual DbSet<FloorPlanPin> FloorPlanPins { get; set; }
}