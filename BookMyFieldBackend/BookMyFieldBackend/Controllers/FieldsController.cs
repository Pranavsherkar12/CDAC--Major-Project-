using BookMyFieldBackend.Data;
using BookMyFieldBackend.DTOs;
using BookMyFieldBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IO;

namespace BookMyFieldBackend.Controllers
{
    [Route("api/fields")]
    [ApiController]
    public class FieldsController : ControllerBase
    {
        private readonly BookMyFieldDbContext _context;
        private readonly IWebHostEnvironment _environment; // ✅ To access wwwroot path

        public FieldsController(BookMyFieldDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

   

        /// <summary>
        /// ✅ API to Add a New Field with Image Upload
        /// </summary>
        [Authorize(Roles = "FieldOwner")]
        [HttpPost("add")]
        public async Task<IActionResult> AddField([FromForm] AddFieldDto fieldDto, [FromForm] IFormFile image)
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            Console.WriteLine($"🔹 Debugging Authorization - User ID: {ownerId}, Role: {userRole}");

            // ✅ Fix Case-Sensitive Role Issue
            if (string.IsNullOrEmpty(ownerId) || string.IsNullOrEmpty(userRole) || userRole.ToLower() != "fieldowner")
            {
                Console.WriteLine("⛔ Unauthorized: User is not a FieldOwner");
                return Unauthorized(new { message = "You are not authorized to add a field" });
            }

            if (image == null || image.Length == 0)
            {
                return BadRequest(new { message = "Image file is required" });
            }

            try
            {
                // ✅ Save Image
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + image.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // ✅ Save Field to DB
                var newField = new Field
                {
                    Name = fieldDto.Name,
                    Location = fieldDto.Location,
                    Description = fieldDto.Description,
                    AvailableTimings = fieldDto.AvailableTimings,
                    PricePerHour = fieldDto.PricePerHour,
                    Category = fieldDto.Category,
                    OwnerId = ownerId,
                    ImageUrl = "/uploads/" + uniqueFileName,
                    ApprovalStatus = "Pending"
                };

                _context.Fields.Add(newField);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Field added successfully!", field = newField });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                return StatusCode(500, new { message = "Internal Server Error", error = ex.Message });
            }
        }





        [HttpPut("{id}")]
        [Authorize(Roles = "FieldOwner")]
        public async Task<IActionResult> UpdateField(int id, [FromForm] UpdateFieldDto fieldDto, [FromForm] IFormFile? image)
        {
            Console.WriteLine($"🔹 Update Request Received for Field ID: {id}");

            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (ownerId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var field = await _context.Fields.FirstOrDefaultAsync(f => f.Id == id && f.OwnerId == ownerId);
            if (field == null)
                return NotFound(new { message = "Field not found or unauthorized" });

            Console.WriteLine($"🔹 Name: {fieldDto.Name}, Location: {fieldDto.Location}, Price: {fieldDto.PricePerHour}");
            Console.WriteLine($"🔹 Image: {(image != null ? image.FileName : "No new image uploaded")}");

            // ✅ Allow Partial Updates: Update only non-null fields
            if (!string.IsNullOrWhiteSpace(fieldDto.Name)) field.Name = fieldDto.Name;
            if (!string.IsNullOrWhiteSpace(fieldDto.Location)) field.Location = fieldDto.Location;
            if (!string.IsNullOrWhiteSpace(fieldDto.Description)) field.Description = fieldDto.Description;
            if (!string.IsNullOrWhiteSpace(fieldDto.AvailableTimings)) field.AvailableTimings = fieldDto.AvailableTimings;
            if (!string.IsNullOrWhiteSpace(fieldDto.Category)) field.Category = fieldDto.Category;
            if (!string.IsNullOrWhiteSpace(fieldDto.Status)) field.ApprovalStatus = fieldDto.Status;

            // ✅ Ensure Price is Only Updated If Provided
            if (fieldDto.PricePerHour > 0) field.PricePerHour = fieldDto.PricePerHour;

            // ✅ Handle optional Image Upload
            if (image != null && image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + image.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // ✅ Update image path in database only if a new image was uploaded
                field.ImageUrl = "/uploads/" + uniqueFileName;
            }

            try
            {
                await _context.SaveChangesAsync();
                Console.WriteLine("✅ Field updated successfully.");
                return Ok(new { message = "Field updated successfully", field });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⛔ Error updating field: {ex.Message}");
                return StatusCode(500, new { message = "Error updating field, please try again later." });
            }
        }




        /// <summary>
        /// ✅ Get All Fields Owned by Logged-in FieldOwner
        /// </summary>
        [HttpGet("my-fields")]
        [Authorize(Roles = "FieldOwner")]
        public async Task<IActionResult> GetMyFields()
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (ownerId == null)
                return Unauthorized(new { message = "User not authenticated" });

            var fields = await _context.Fields.Where(f => f.OwnerId == ownerId).ToListAsync();
            return Ok(fields);
        }



        /// <summary>
        /// ✅ Delete a Field (Only the Owner Can Delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "FieldOwner")]
        public async Task<IActionResult> DeleteField(int id)
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var field = await _context.Fields.FirstOrDefaultAsync(f => f.Id == id && f.OwnerId == ownerId);

            if (field == null)
                return NotFound(new { message = "Field not found or unauthorized" });

            _context.Fields.Remove(field);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Field deleted successfully" });
        }

        /// <summary>
        /// ✅ Get Approval Status of Fields
        /// </summary>
        [HttpGet("approval-status")]
        [Authorize(Roles = "FieldOwner")]
        public async Task<IActionResult> GetApprovalStatus()
        {
            var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var fields = await _context.Fields
                .Where(f => f.OwnerId == ownerId)
                .Select(f => new { f.Name, f.ApprovalStatus })
                .ToListAsync();

            return Ok(fields);
        }


        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingFields()
        {
            var pendingFields = await _context.Fields
                .Where(f => f.ApprovalStatus == "Pending")
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.Location,
                    f.PricePerHour,
                    f.ApprovalStatus
                })
                .ToListAsync();

            return Ok(pendingFields);
        }



    }
}
