using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineShopBackend.Data;
using OnlineShopBackend.Dtos;
using OnlineShopBackend.Models;

namespace OnlineShopBackend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartItemResponse>>> GetCart()
        {
            var userId = GetUserId();

            var items = await _context.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return Ok(items.Select(MapToResponse));
        }

        [HttpPost]
        public async Task<ActionResult<CartItemResponse>> AddToCart([FromBody] AddCartItemRequest request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest(new { message = "Quantity must be greater than zero." });
            }

            var userId = GetUserId();
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            var existing = await _context.CartItems.FirstOrDefaultAsync(ci =>
                ci.UserId == userId &&
                ci.ProductId == request.ProductId &&
                ci.Color == request.Color &&
                ci.Size == request.Size);

            if (existing != null)
            {
                existing.Quantity += request.Quantity;
            }
            else
            {
                existing = new CartItem
                {
                    ProductId = request.ProductId,
                    UserId = userId,
                    Quantity = request.Quantity,
                    Color = request.Color,
                    Size = request.Size
                };
                _context.CartItems.Add(existing);
            }

            await _context.SaveChangesAsync();
            await _context.Entry(existing).Reference(e => e.Product).LoadAsync();

            return Ok(MapToResponse(existing));
        }

        [HttpPatch("{cartItemId:int}")]
        public async Task<ActionResult<CartItemResponse>> UpdateQuantity(int cartItemId, [FromBody] UpdateCartItemRequest request)
        {
            if (request.Quantity <= 0)
            {
                return BadRequest(new { message = "Quantity must be greater than zero." });
            }

            var userId = GetUserId();
            var item = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

            if (item == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            item.Quantity = request.Quantity;
            await _context.SaveChangesAsync();

            return Ok(MapToResponse(item));
        }

        [HttpDelete("{cartItemId:int}")]
        public async Task<IActionResult> RemoveItem(int cartItemId)
        {
            var userId = GetUserId();
            var item = await _context.CartItems.FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

            if (item == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            var items = await _context.CartItems.Where(ci => ci.UserId == userId).ToListAsync();
            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();

            return NoContent();
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

        private static CartItemResponse MapToResponse(CartItem item)
        {
            return new CartItemResponse
            {
                CartItemId = item.Id,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                Description = item.Product.Description,
                Price = item.Product.Price,
                Quantity = item.Quantity,
                ImageUrl = item.Product.ImageUrl,
                Color = item.Color,
                Size = item.Size
            };
        }
    }
}
