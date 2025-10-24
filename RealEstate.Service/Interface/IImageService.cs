using Microsoft.AspNetCore.Http;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;

namespace RealEstate.Service.Interface;

public interface IImageService
{
    List<Image> GetAll();
    Image? GetById(Guid id);
    List<Image> GetByPropertyId(Guid propertyId);
    List<Image> GetByListingId(Guid listingId);
    Task<Image> Insert(UploadImageDTO dto);
    Task<Image> Update(Image image, IFormFile? file);
    Task<Image> DeleteById(Guid id);
}