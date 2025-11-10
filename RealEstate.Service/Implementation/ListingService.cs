using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;
using RealEstate.Repository.Interface;
using RealEstate.Service.Interface;

namespace RealEstate.Service.Implementation;

public class ListingService : IListingService
{
    private readonly IRepository<Listing> _listingRepository;
    private readonly IImageService _imageService;
    private readonly IFloorPlanPinService _floorPlanPinService;

    public ListingService(IRepository<Listing> listingRepository, IImageService imageService, IFloorPlanPinService floorPlanPinService)
    {
        _listingRepository = listingRepository;
        _imageService = imageService;
        _floorPlanPinService = floorPlanPinService;
    }

    public List<Listing> GetAll()
    {
        return _listingRepository.GetAll(selector: x => x).ToList();
    }

    public Listing? GetById(Guid id)
    {
        return _listingRepository.Get(selector: x => x, 
            predicate: x => x.Id == id, 
            include: x => x.Include(q => q.Images));
    }

    public List<Listing> GetByPropertyId(Guid propertyId)
    {
        return _listingRepository.GetAll(selector: x => x, predicate: x => x.PropertyId == propertyId).ToList();
    }

    public Listing Insert(Listing listing)
    {
        listing.Id = Guid.NewGuid();
        return _listingRepository.Insert(listing);
    }

    public Listing Update(Listing listing)
    {
            return _listingRepository.Update(listing);
    }
    
    public Listing DeleteById(Guid id)
    {
        var listing = GetById(id);
        if (listing == null) throw new Exception("Listing not found");
        
        List<Image> images = _imageService.GetByListingId(id);
        foreach (var image in images) _imageService.DeleteById(image.Id);
        
        return _listingRepository.Delete(listing);
    }

    public async Task<Listing> InsertImageById(Guid id, UploadImageDTO dto)
    {
        var listing = GetById(id);
        
        if (listing == null) throw new Exception("Listing not found");
        if (dto.File == null) throw new Exception("file is null");
        
        dto.ListingId = listing.Id;
        var newImage = await _imageService.Insert(dto);
        listing.Images.Add(newImage);
        
        return Update(listing);
    }

    public async Task<Listing> DeleteImageById(Guid id, Guid imageId)
    {
        var listing = GetById(id);
        if (listing == null) throw new Exception("Listing not found");

        var image = _imageService.GetById(imageId);
        if (image == null) throw new Exception("Image not found");

        listing.Images.Remove(image);

        await _imageService.DeleteById(imageId);
        _listingRepository.Update(listing);

        return listing;
    }

    public async Task<Listing> InsertFloorPlanPin(Guid id, FloorPlanPin floorPlanPin, UploadImageDTO dto)
    {
        var listing = GetById(id);
        if (listing == null) throw new Exception("Listing not found");
        
        var pin = await _floorPlanPinService.Insert(floorPlanPin, dto);
        listing.FloorPlanPins.Add(pin);
        
        return Update(listing);
    }
}