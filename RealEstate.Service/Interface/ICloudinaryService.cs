using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace RealEstate.Service.Interface;

public interface ICloudinaryService
{
    Task<ImageUploadResult> UploadImageAsync(IFormFile file, string? folder = null);
    Task<VideoUploadResult> UploadVideoAsync(IFormFile file, string? folder = null);
    Task<DeletionResult> DeleteByPublicIdAsync(string publicId, bool invalidate = false, bool isVideo = false);
}