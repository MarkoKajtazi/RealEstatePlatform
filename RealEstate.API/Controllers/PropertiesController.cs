using Microsoft.AspNetCore.Mvc;
using RealEstate.Domain.Domain_Models;
using RealEstate.Domain.DTO;
using RealEstate.Service.Interface;

namespace RealEstate.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : Controller
{
    private readonly IPropertyService _propertyService;
    private readonly IImageService _imageService;
    private readonly IListingService _listingService;

    public PropertiesController(IPropertyService propertyService, IImageService imageService, IListingService listingService)
    {
        _propertyService = propertyService;
        _imageService = imageService;
        _listingService = listingService;
    }

    [HttpGet]
    public IActionResult GetAllProperties()
    {
        return Ok(_propertyService.GetAll());
    }

    [HttpGet("{id}")]
    public IActionResult GetPropertyById(string id)
    {
        return Ok(_propertyService.GetById(Guid.Parse(id)));
    }

    [HttpPost]
    public IActionResult Insert([FromBody] Property property)
    {
        return Ok(_propertyService.Insert(property));
    }

    [HttpPut("{id}")]
    public IActionResult Update([FromBody] Property property)
    {
        return Ok(_propertyService.Update(property));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        return Ok(_propertyService.DeleteById(Guid.Parse(id)));
    }

    [HttpGet("{id}/images")]
    public IActionResult GetImageById(string id)
    {
        return Ok(_imageService.GetByPropertyId(Guid.Parse(id)));
    }

    [RequestSizeLimit(100_000_000)]
    [HttpPost("{id}/images")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> InsertImageById(string id, UploadImageDTO dto)
    {
        return Ok(await _propertyService.InsertImageById(Guid.Parse(id), dto));
    }
    
    [HttpGet("{id}/listings")]
    public IActionResult GetListingById(string id)
    {
        return Ok(_listingService.GetByPropertyId(Guid.Parse(id)));
    }
    
    [HttpPost("{id}/listings")]
    public async Task<IActionResult> InsertListingById(string id, [FromBody] Listing listing)
    {
        return Ok(await _propertyService.InsertListingById(Guid.Parse(id), listing));
    }
}