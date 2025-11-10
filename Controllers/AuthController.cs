using Microsoft.AspNetCore.Mvc;
using OnlineShopBackend.Data;
using OnlineShopBackend.Dtos;
using OnlineShopBackend.Models;
using System.Linq;

using BCryptNet = BCrypt.Net.BCrypt;

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

        [HttpPost("signup")]
        public IActionResult Signup([FromBody] SignupRequest request)
        {
            if (_context.Users.Any(u => u.Email == request.Email))
                return BadRequest(new { message = "Email already exists" });

            var hashedPassword = BCryptNet.HashPassword(request.Password);
            var user = new User
            {
                Name = request.Name,
                Surname = request.Surname,
                Email = request.Email,
                PasswordHash = hashedPassword
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var existingUser = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (existingUser == null)
                return Unauthorized(new { message = "Invalid email or password" });

            bool isPasswordValid = BCryptNet.Verify(request.Password, existingUser.PasswordHash);
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
}
