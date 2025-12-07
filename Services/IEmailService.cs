using OnlineShopBackend.Models;

namespace OnlineShopBackend.Services
{
    public interface IEmailService
    {
        Task SendPurchaseNotificationAsync(string purchaserEmail, IEnumerable<CartItem> items, decimal totalPrice);
    }
}
