using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace RealEstate.Domain.Domain_Models;

public enum ImageType : byte
{
    Exterior = 0,
    Panorama360 = 1,
    FloorPlan = 2,
    Hero = 3
};

public class Image : BaseEntity
{
    [Required] public string Url { get; set; } = null!;
    [Required] public string PublicId { get; set; } = null!;
    public ImageType Type { set; get; }
    public string? FileName { get; set; }
    public string? MimeType { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? SortOrder { get; set; }
    public string? Label { get; set; }

    public Guid? PropertyId { get; set; }
    [JsonIgnore] public Property? Property { get; set; }
    public Guid? ListingId { get; set; }
    [JsonIgnore] public Listing? Listing { get; set; }
}