using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;
using RealEstate.Repository.Interface;
using RealEstate.Service.Interface;

namespace RealEstate.Service.Implementation;

public class PropertyService : IPropertyService
{
    private readonly IRepository<Property> _propertyRepository;
    private readonly IImageService _imageService;
    private readonly IListingService _listingService;

    public PropertyService(IRepository<Property> propertyRepository, IImageService imageService,
        IListingService listingService)
    {
        _propertyRepository = propertyRepository;
        _imageService = imageService;
        _listingService = listingService;
    }


    public List<Property> GetAll()
    {
        return _propertyRepository.GetAll(selector: x => x,
            include: x => x.Include(q => q.Images)).ToList();
    }

    public Property? GetById(Guid id)
    {
        return _propertyRepository.Get(
            selector: x => x, predicate: x => x.Id == id,
            include: x => x.Include(q => q.Images).Include(q => q.Listings)
        );
    }

    public Property Insert(Property property)
    {
        property.Id = Guid.NewGuid();
        return _propertyRepository.Insert(property);
    }

    public Property Update(Property property)
    {
        return _propertyRepository.Update(property);
    }

    public Property DeleteById(Guid id)
    {
        var property = GetById(id);
        if (property == null) throw new Exception("Property not found");

        List<Image> images = _imageService.GetByPropertyId(id);
        foreach (var image in images) _imageService.DeleteById(image.Id);

        List<Listing> listings = _listingService.GetByPropertyId(id);
        foreach (var listing in listings) _listingService.DeleteById(listing.Id);

        return _propertyRepository.Delete(property);
    }

    public async Task<Property> InsertImageById(Guid id, UploadImageDTO dto)
    {
        var property = GetById(id);

        if (property == null) throw new Exception("Property not found");
        if (dto.File == null) throw new Exception("File null");

        dto.PropertyId = property.Id;
        Image newImage = await _imageService.Insert(dto);

        property.Images.Add(newImage);
        return _propertyRepository.Update(property);
    }

    public async Task<Property> DeleteImageById(Guid propertyId, Guid imageId)
    {
        var property = GetById(propertyId);
        if (property == null) throw new Exception("Property not found");

        var image = _imageService.GetById(imageId);
        if (image == null) throw new Exception("Image not found");

        property.Images.Remove(image);

        await _imageService.DeleteById(imageId);
        _propertyRepository.Update(property);

        return property;
    }


    public Task<Property> InsertListingById(Guid id, Listing listing)
    {
        var property = GetById(id);
        if (property == null) throw new Exception("Property not found");

        listing.PropertyId = id;
        Listing newListing = _listingService.Insert(listing);
        property.Listings.Add(newListing);

        return Task.FromResult(_propertyRepository.Update(property));
    }
}