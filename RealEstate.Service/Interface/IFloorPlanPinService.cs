using Microsoft.AspNetCore.Http;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;

namespace RealEstate.Service.Interface;

public interface IFloorPlanPinService
{
    List<FloorPlanPin> GetAll();
    FloorPlanPin? GetById(Guid id);
    List<FloorPlanPin> GetByListingId(Guid listingId);
    Task<FloorPlanPin> Insert(FloorPlanPin floorPlanPin, UploadImageDTO dto);
    Task<FloorPlanPin> Update(FloorPlanPin floorPlanPin, Image image, IFormFile? file);
    Task<FloorPlanPin> DeleteById(Guid id);
}