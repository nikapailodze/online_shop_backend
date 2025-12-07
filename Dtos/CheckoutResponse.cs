namespace OnlineShopBackend.Dtos
{
    public class CheckoutResponse
    {
        public int OrderId { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}
