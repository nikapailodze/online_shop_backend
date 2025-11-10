using Microsoft.AspNetCore.Mvc;
using OnlineShopBackend.Data;
using OnlineShopBackend.Models;
using BCrypt.Net;
using System.Linq;

namespace OnlineShopBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ SIGNUP ENDPOINT
        [HttpPost("signup")]
        public IActionResult Signup([FromBody] User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
                return BadRequest(new { message = "Email already exists" });

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            user.PasswordHash = hashedPassword;
            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User registered successfully" });
        }

        // ✅ LOGIN ENDPOINT
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var existingUser = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (existingUser == null)
                return Unauthorized(new { message = "Invalid email or password" });

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, existingUser.PasswordHash);
            if (!isPasswordValid)
                return Unauthorized(new { message = "Invalid email or password" });

            return Ok(new 
            { 
                message = "Login successful",
                user = new 
                {
                    existingUser.Name,
                    existingUser.Surname,
                    existingUser.Email
                }
            });
        }
    }

    // Separate class for login data
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
