using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace RealEstate.Domain.Domain_Models;

public class FloorPlanPin : BaseEntity
{
    public Guid ListingId { get; set; }
    public Listing? Listing { get; set; }
    public Guid ImageId { get; set; }     
    public Image? Image { get; set; }
    [Range(0.0, 1.0)] public double X { get; set; }
    [Range(0.0, 1.0)] public double Y { get; set; }
}