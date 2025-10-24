using System.ComponentModel.DataAnnotations;

namespace RealEstate.Domain.Domain_Models;

public class BaseEntity
{
    [Key] public Guid Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}