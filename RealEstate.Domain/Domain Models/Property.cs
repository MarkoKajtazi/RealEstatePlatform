using System.ComponentModel.DataAnnotations;
namespace RealEstate.Domain.Domain_Models;

public enum PropertyType : byte { Building = 0, House = 1 }

public class Property : BaseEntity
{
    [Required] public string Name { get; set; }
    [Required] public int SquareMeters { get; set; }
    [Required] public int FloorCount { get; set; }
    public int ParkingSpaceCount { get; set; }
    public PropertyType PropertyType { get; set; } = PropertyType.Building;
    public bool HasElevator {get; set; }

    [Required] public string Street { get; set; } = null!;
    [Required] public string City { get; set; } = null!;
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    [Required] public string Country { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public ICollection<Listing>? Listings { get; set; } = new List<Listing>();
    public ICollection<Image>? Images { get; set; } = new List<Image>();
}