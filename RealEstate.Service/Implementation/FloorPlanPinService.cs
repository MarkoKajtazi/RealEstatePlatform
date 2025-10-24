using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;
using RealEstate.Repository.Interface;
using RealEstate.Service.Interface;

namespace RealEstate.Service.Implementation;

public class FloorPlanPinService : IFloorPlanPinService
{
    private readonly IRepository<FloorPlanPin> _floorPlanPinRepository;
    private readonly IImageService _imageService;

    public FloorPlanPinService(IRepository<FloorPlanPin> floorPlanPinRepository, IImageService imageService)
    {
        _floorPlanPinRepository = floorPlanPinRepository;
        _imageService = imageService;
    }


    public List<FloorPlanPin> GetAll()
    {
        return _floorPlanPinRepository.GetAll(selector: x => x, 
            include: x => x.Include(z => z.Image)).ToList();
    }

    public FloorPlanPin? GetById(Guid id)
    {
        return _floorPlanPinRepository.Get(selector: x => x, 
            predicate: x => x.Id == id,
            include: x => x.Include(z => z.Image));
    }

    public List<FloorPlanPin> GetByListingId(Guid listingId)
    {
        return _floorPlanPinRepository.GetAll(selector: x => x, 
            predicate: x => x.ListingId == listingId,
            include: x => x.Include(z => z.Image)).ToList();
    }

    public async Task<FloorPlanPin> Insert(FloorPlanPin floorPlanPin, UploadImageDTO dto)
    {
        var newImage = await _imageService.Insert(dto);
        floorPlanPin.ImageId = newImage.Id;
        floorPlanPin.Id = Guid.NewGuid();
        return _floorPlanPinRepository.Insert(floorPlanPin);
    }

    public async Task<FloorPlanPin> Update(FloorPlanPin floorPlanPin, Image image, IFormFile? file)
    {
        if (file == null) return _floorPlanPinRepository.Update(floorPlanPin);
        var newImage = await _imageService.Update(image, file);
        floorPlanPin.ImageId = newImage.Id;
        return _floorPlanPinRepository.Update(floorPlanPin);
    }

    public async Task<FloorPlanPin> DeleteById(Guid id)
    {
        var floorPlanPin = GetById(id);
        if (floorPlanPin == null) throw new Exception("FloorPlan not found");
        
        Image image = _imageService.GetById(floorPlanPin.ImageId);
        _imageService.DeleteById(image.Id);
        
        return _floorPlanPinRepository.Delete(floorPlanPin);
    }
}