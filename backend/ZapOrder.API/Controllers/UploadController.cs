using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ZapOrder.API.Controllers
{
    /// <summary>
    /// File upload endpoints
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UploadController> _logger;
        private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        /// <summary>
        /// Upload a menu item image
        /// </summary>
        /// <param name="file">Image file to upload</param>
        /// <returns>URL of the uploaded image</returns>
        [HttpPost("menu-item-image")]
        [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadMenuItemImage(IFormFile file)
        {
            try
            {
                // Validate file
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });
                }

                if (file.Length > MaxFileSize)
                {
                    return BadRequest(new { message = $"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB" });
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!AllowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = $"File type not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}" });
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{extension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "images", "menu-items");

                // Ensure directory exists
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return URL
                var url = $"/images/menu-items/{fileName}";
                _logger.LogInformation("Image uploaded successfully: {Url}", url);

                return Ok(new UploadResponse { Url = url });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, new { message = "Error uploading file" });
            }
        }

        /// <summary>
        /// Delete a menu item image
        /// </summary>
        /// <param name="fileName">Name of the file to delete</param>
        [HttpDelete("menu-item-image/{fileName}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult DeleteMenuItemImage(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_environment.WebRootPath, "images", "menu-items", fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "File not found" });
                }

                System.IO.File.Delete(filePath);
                _logger.LogInformation("Image deleted successfully: {FileName}", fileName);

                return Ok(new { message = "File deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image");
                return StatusCode(500, new { message = "Error deleting file" });
            }
        }
    }

    public class UploadResponse
    {
        public string Url { get; set; } = null!;
    }
}
