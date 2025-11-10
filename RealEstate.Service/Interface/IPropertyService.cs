using Microsoft.AspNetCore.Http;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;

namespace RealEstate.Service.Interface;

public interface IPropertyService
{
    List<Property> GetAll();
    Property? GetById(Guid id);
    Property Insert(Property property);
    Property Update(Property property);
    Property DeleteById(Guid id);
    Task<Property> InsertImageById(Guid id,  UploadImageDTO dto);
    Task<Property> DeleteImageById(Guid id, Guid imageId);
    Task<Property> InsertListingById(Guid id,  Listing listing);
}