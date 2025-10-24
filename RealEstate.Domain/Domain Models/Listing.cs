using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace RealEstate.Domain.Domain_Models;

public enum OrientationType
{
    North,
    South,
    East,
    West
}

public class Listing : BaseEntity
{
    [Required] public int Floor { get; set; }
    [Required] public int SquareMeters { get; set; }
    [Required] public decimal PricePerSquareMeter { get; set; }
    [Required] public OrientationType Orientation { get; set; }
    [Required] public int RoomCount { get; set; }
    [Required] public int BathroomCount { get; set; }
    [Required] public bool HasBalcony { get; set; }
    [Required] public bool Available { get; set; } = true;

    public Guid PropertyId { get; set; }
    [JsonIgnore] public Property? Property { get; set; }
    public ICollection<Image>? Images { get; set; } = new List<Image>();
}