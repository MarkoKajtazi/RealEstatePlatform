using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;
using RealEstate.Repository.Interface;
using RealEstate.Service.Interface;

namespace RealEstate.Service.Implementation;

public class ImageService : IImageService
{
    private readonly IRepository<Image> _imageRepository;
    private readonly ICloudinaryService _cloudinaryService;
    private const string Folder = "RealEstate";
    
    public ImageService(IRepository<Image> imageRepository, ICloudinaryService cloudinaryService)
    {
        _imageRepository = imageRepository;
        _cloudinaryService = cloudinaryService;
    }


    public List<Image> GetAll()
    {
        return _imageRepository.GetAll(selector: x => x).ToList();
    }

    public Task<List<Image>> GetAllAsync()
    {
        return Task.FromResult(GetAll());
    }

    public Image? GetById(Guid id)
    {
        return _imageRepository.Get(selector: x => x, predicate: x => x.Id.Equals(id));
    }

    public Task<Image?> GetByIdAsync(Guid id)
    {
        return Task.FromResult(GetById(id));
    }

    public List<Image> GetByPropertyId(Guid propertyId)
    {
        return _imageRepository.GetAll(selector: x => x,
            predicate: x => x.PropertyId.Equals(propertyId)).ToList();
    }

    public Task<List<Image>> GetByPropertyIdAsync(Guid propertyId)
    {
        return Task.FromResult(GetByPropertyId(propertyId));
    }

    public List<Image> GetByListingId(Guid listingId)
    {
        return _imageRepository.GetAll(selector: x => x,
                predicate: x => x.ListingId.Equals(listingId)).ToList();
    }
    

    public async Task<Image> Insert(UploadImageDTO dto)
    {
        if (dto?.File == null)
            throw new ArgumentException("File is not found", nameof(dto));

        bool isImage = dto.File.ContentType?.StartsWith("image/", StringComparison.OrdinalIgnoreCase) == true;

        dynamic uploadResult = isImage
            ? (dynamic)await _cloudinaryService.UploadImageAsync(dto.File, Folder)
            : (dynamic)await _cloudinaryService.UploadVideoAsync(dto.File, Folder);

        if (uploadResult == null)
            throw new Exception("Upload returned no result.");

        if (uploadResult.Error != null)
            throw new Exception(uploadResult.Error.Message ?? "Upload failed.");

        string url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? string.Empty;

        var image = new Image
        {
            Id = Guid.NewGuid(),
            Url = url,
            PublicId = uploadResult.PublicId,
            FileName = uploadResult.OriginalFilename,
            MimeType = uploadResult.Type,
            Width = uploadResult.Width ?? 0,
            Height = uploadResult.Height ?? 0,
            Type = dto.Type,
            SortOrder = dto.SortOrder,
            Label = dto.Label,
            ListingId = dto.ListingId,
            PropertyId = dto.PropertyId,
        };

        return _imageRepository.Insert(image);
    }


    public async Task<Image> Update(Image image, IFormFile? file)
    {
        if (file == null) return _imageRepository.Update(image);
        
        DeletionResult deletionResult = await _cloudinaryService.DeleteByPublicIdAsync(image.PublicId);
        if (deletionResult.Error != null) throw new Exception(deletionResult.Error.Message);
        
        ImageUploadResult uploadResult = await _cloudinaryService.UploadImageAsync(file, Folder);
        if (uploadResult.Error != null) throw new Exception(uploadResult.Error.Message);
        
        image.Url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? string.Empty;
        image.PublicId = uploadResult.PublicId;
        image.FileName = uploadResult.OriginalFilename;
        image.Width = uploadResult.Width;
        image.Height = uploadResult.Height;
        
        return _imageRepository.Update(image);
    }

    public async Task<Image> DeleteById(Guid id)
    {
        var image = GetById(id);
        if (image == null) throw new Exception("Image not found");
        await _cloudinaryService.DeleteByPublicIdAsync(image.PublicId);
        return _imageRepository.Delete(image);
    }
}