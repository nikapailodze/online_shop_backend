using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OnlineShopBackend.Data;
using OnlineShopBackend.Dtos;
using OnlineShopBackend.Models;
using OnlineShopBackend.Services;
using System.Linq;
using System;

using BCryptNet = BCrypt.Net.BCrypt;

namespace OnlineShopBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly JwtSettings _jwtSettings;

        public AuthController(AppDbContext context, ITokenService tokenService, IOptions<JwtSettings> jwtOptions)
        {
            _context = context;
            _tokenService = tokenService;
            _jwtSettings = jwtOptions.Value;
        }

        [HttpPost("signup")]
        public IActionResult Signup([FromBody] SignupRequest request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var email = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
            var name = (request.Name ?? string.Empty).Trim();
            var surname = (request.Surname ?? string.Empty).Trim();

            if (_context.Users.Any(u => u.Email.ToLower() == email))
                return BadRequest(new { message = "Email already exists" });

            var hashedPassword = BCryptNet.HashPassword(request.Password);
            var user = new User
            {
                Name = name,
                Surname = surname,
                Email = email,
                PasswordHash = hashedPassword
            };

            try
            {
                _context.Users.Add(user);
                _context.SaveChanges();
            }
            catch (DbUpdateException)
            {
                return Conflict(new { message = "Email already exists" });
            }

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

            var token = _tokenService.GenerateToken(existingUser);
            var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiresInMinutes);

            return Ok(new
            {
                message = "Login successful",
                token,
                expiresAtUtc = expiresAt,
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
