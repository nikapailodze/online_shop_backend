using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineShopBackend.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string SizesCsv { get; set; } = string.Empty;
        public string ColorsCsv { get; set; } = string.Empty;

        [NotMapped]
        public IReadOnlyList<string> AvailableSizes =>
            SizesCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        [NotMapped]
        public IReadOnlyList<string> AvailableColors =>
            ColorsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}
