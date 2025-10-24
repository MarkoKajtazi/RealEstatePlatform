using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using RealEstate.Service.Interface;

namespace RealEstate.Service.Implementation;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
    }

    public async Task<ImageUploadResult> UploadImageAsync(IFormFile file, string? folder = null)
    {
        if (file == null || file.Length == 0) 
            throw new ArgumentException("file not specified");

        try
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
                throw new InvalidOperationException(result.Error.Message);

            return result;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Cloudinary upload failed: " + ex.Message, ex);
        }
    }
    
    public async Task<VideoUploadResult> UploadVideoAsync(IFormFile file, string? folder = null)
    {
        if (file == null || file.Length == 0) 
            throw new ArgumentException("file not specified");

        try
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
                throw new InvalidOperationException(result.Error.Message);

            return result;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Cloudinary upload failed: " + ex.Message, ex);
        }
    }

    public async Task<DeletionResult> DeleteByPublicIdAsync(string publicId, bool invalidate = false)
    {
        if (string.IsNullOrWhiteSpace(publicId))
            throw new ArgumentException("publicId is required", nameof(publicId));

        var deletionParams = new DeletionParams(publicId)
        {
            Invalidate = invalidate,            
            ResourceType = ResourceType.Image
        };

        var result = await _cloudinary.DestroyAsync(deletionParams);
        return result;
    }
}