using OnlineShopBackend.Models;

namespace OnlineShopBackend.Services
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
