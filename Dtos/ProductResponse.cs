namespace OnlineShopBackend.Dtos
{
    public class ProductResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public IReadOnlyList<string> Sizes { get; set; } = Array.Empty<string>();
        public IReadOnlyList<string> Colors { get; set; } = Array.Empty<string>();
    }
}
