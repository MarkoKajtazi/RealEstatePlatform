using Microsoft.AspNetCore.Mvc;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;
using RealEstate.Service.Interface;

namespace RealEstate.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : Controller
{
    private readonly IListingService _listingService;
    private readonly IImageService _imageService;

    public ListingsController(IListingService listingService, IImageService imageService)
    {
        _listingService = listingService;
        _imageService = imageService;
    }
    
    [HttpGet]
    public IActionResult GetAllListings()
    {
        return Ok(_listingService.GetAll());
    }
    
    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        return Ok(_listingService.GetById(Guid.Parse(id)));
    }
    
    [HttpPost]
    public async Task<IActionResult> Insert([FromBody] Listing listing)
    {
        return Ok(_listingService.Insert(listing));
    }

    [HttpPut("{id}")]
    public IActionResult Update([FromBody] Listing listing)
    {
        return Ok(_listingService.Update(listing));
    }
    
    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        return Ok(_listingService.DeleteById(Guid.Parse(id)));
    }
    
    [RequestSizeLimit(100_000_000)]
    [HttpPost("{id}/images")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> InsertImageById(string id, UploadImageDTO dto)
    {
        return Ok(await _listingService.InsertImageById(Guid.Parse(id), dto));
    }
    
    [HttpDelete("{id}/images/{imageId}")]
    public async Task<IActionResult> DeleteImageById(string id, string imageId)
    {
        return Ok(await _listingService.DeleteImageById(Guid.Parse(id), Guid.Parse(imageId)));
    }
}