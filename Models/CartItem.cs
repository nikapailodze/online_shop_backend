namespace OnlineShopBackend.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }

        public User User { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
