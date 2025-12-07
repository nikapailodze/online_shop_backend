namespace OnlineShopBackend.Dtos
{
    public class AddCartItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
        public string? Color { get; set; }
        public string? Size { get; set; }
    }
}
