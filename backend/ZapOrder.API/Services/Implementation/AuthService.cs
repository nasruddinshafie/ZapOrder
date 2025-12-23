using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ZapOrder.API.Data;
using ZapOrder.API.Data.Entities;
using ZapOrder.API.DTOs.Auth;
using ZapOrder.API.Services.Interfaces;
using BCrypt.Net;

namespace ZapOrder.API.Services.Implementation
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(AppDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            _logger.LogInformation("Attempting to register restaurant with email: {Email}", request.Email);

            // Check if email already exists
            if (await _context.Restaurants.AnyAsync(r => r.Email == request.Email))
            {
                _logger.LogWarning("Registration failed: Email {Email} already exists", request.Email);
                throw new InvalidOperationException("A restaurant with this email already exists.");
            }

            // Generate unique slug from name
            var slug = GenerateSlug(request.Name);
            var originalSlug = slug;
            var counter = 1;

            while (await _context.Restaurants.AnyAsync(r => r.Slug == slug))
            {
                slug = $"{originalSlug}-{counter}";
                counter++;
            }

            // Hash password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create restaurant
            var restaurant = new Restaurant
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = passwordHash,
                Slug = slug,
                Phone = request.Phone,
                Address = request.Address,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Restaurant registered successfully: {RestaurantId}", restaurant.Id);

            // Generate JWT token
            var token = GenerateJwtToken(restaurant);

            return new AuthResponse
            {
                RestaurantId = restaurant.Id,
                Name = restaurant.Name,
                Email = restaurant.Email,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            _logger.LogInformation("Attempting login for email: {Email}", request.Email);

            // Find restaurant by email
            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.Email == request.Email);

            if (restaurant == null)
            {
                _logger.LogWarning("Login failed: Restaurant with email {Email} not found", request.Email);
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, restaurant.PasswordHash))
            {
                _logger.LogWarning("Login failed: Invalid password for email {Email}", request.Email);
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            if (!restaurant.IsActive)
            {
                _logger.LogWarning("Login failed: Restaurant account {RestaurantId} is inactive", restaurant.Id);
                throw new UnauthorizedAccessException("Your restaurant account is inactive. Please contact support.");
            }

            _logger.LogInformation("Login successful for restaurant: {RestaurantId}", restaurant.Id);

            // Generate JWT token
            var token = GenerateJwtToken(restaurant);

            return new AuthResponse
            {
                RestaurantId = restaurant.Id,
                Name = restaurant.Name,
                Email = restaurant.Email,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
        }

        private string GenerateJwtToken(Restaurant restaurant)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
            var jwtAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, restaurant.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, restaurant.Email),
                new Claim(JwtRegisteredClaimNames.Name, restaurant.Name),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("restaurantId", restaurant.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateSlug(string name)
        {
            // Convert to lowercase and replace spaces with hyphens
            var slug = name.ToLowerInvariant()
                .Replace(" ", "-")
                .Replace("'", "")
                .Replace("\"", "");

            // Remove invalid characters
            slug = new string(slug.Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray());

            // Remove consecutive hyphens
            while (slug.Contains("--"))
            {
                slug = slug.Replace("--", "-");
            }

            return slug.Trim('-');
        }
    }
}
