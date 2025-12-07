namespace OnlineShopBackend.Dtos
{
    public class OrderItemResponse
    {
        public int OrderItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
    }

    public class OrderResponse
    {
        public int OrderId { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public IReadOnlyCollection<OrderItemResponse> Items { get; set; } = Array.Empty<OrderItemResponse>();
    }
}
