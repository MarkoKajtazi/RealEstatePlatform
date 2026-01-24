using Microsoft.AspNetCore.Http;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;

namespace RealEstate.Service.Interface;

public interface IListingService
{
    List<Listing> GetAll();
    Listing? GetById(Guid id);
    List<Listing> GetByPropertyId(Guid propertyId);
    Listing Insert(Listing listing);
    Listing Update(Listing listing);
    Listing DeleteById(Guid id);
    Task<Listing> InsertImageById(Guid id, UploadImageDTO dto);
    Task<Listing> DeleteImageById(Guid id, Guid imageId);
    Task<Listing> DeletePinById(Guid id, Guid pinId);
    Task<Listing> InsertFloorPlanPin(Guid id, FloorPlanPin floorPlanPin, UploadImageDTO dto);
    List<FloorPlanPin> GetFloorPlanPinsByListingId(Guid listingId);
}