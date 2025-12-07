using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineShopBackend.Data;
using OnlineShopBackend.Dtos;
using OnlineShopBackend.Models;
using OnlineShopBackend.Services;

namespace OnlineShopBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public OrdersController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderResponse>>> GetOrders()
        {
            var userId = GetUserId();
            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAtUtc)
                .ToListAsync();

            var result = orders.Select(o => new OrderResponse
            {
                OrderId = o.Id,
                TotalPrice = o.TotalPrice,
                CreatedAtUtc = o.CreatedAtUtc,
                Items = o.Items.Select(oi => new OrderItemResponse
                {
                    OrderItemId = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    Color = oi.Color,
                    Size = oi.Size
                }).ToList()
            });

            return Ok(result);
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<CheckoutResponse>> Checkout()
        {
            var userId = GetUserId();

            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
            {
                return BadRequest(new { message = "Cart is empty." });
            }

            var totalPrice = cartItems.Sum(ci => ci.Product.Price * ci.Quantity);
            var order = new Order
            {
                UserId = userId,
                TotalPrice = totalPrice,
                CreatedAtUtc = DateTime.UtcNow,
                Items = cartItems.Select(ci => new OrderItem
                {
                    ProductId = ci.ProductId,
                    Quantity = ci.Quantity,
                    UnitPrice = ci.Product.Price,
                    Color = ci.Color,
                    Size = ci.Size
                }).ToList()
            };

            _context.Orders.Add(order);
            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                await _emailService.SendPurchaseNotificationAsync(user.Email, cartItems, totalPrice);
            }

            var response = new CheckoutResponse
            {
                OrderId = order.Id,
                TotalPrice = totalPrice,
                CreatedAtUtc = order.CreatedAtUtc
            };

            return Ok(response);
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub) ??
                              User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                throw new InvalidOperationException("User id claim missing.");
            }

            return int.Parse(userIdClaim.Value);
        }
    }
}
