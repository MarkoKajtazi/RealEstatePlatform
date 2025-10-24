using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using RealEstate.Domain.Domain_Models;

namespace RealEstate.Domain.DTO;

public class UploadImageDTO
{
    public IFormFile File { get; set; }
    public ImageType Type { set; get; }
    public string? Label { get; set; }
    public int? SortOrder { get; set; }
    public Guid? ListingId { get; set; }
    public Guid? PropertyId { get; set; }
}