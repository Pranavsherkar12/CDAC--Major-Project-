using System.ComponentModel.DataAnnotations;

namespace BookMyFieldBackend.DTOs
{
    public class RegisterDTO
    {
        [Required]
        [RegularExpression(@"^[a-zA-Z0-9]{5,50}$", ErrorMessage = "Username must be 5-50 alphanumeric characters.")]
        public string Username { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        [RegularExpression(@"^[987][0-9]{9}$", ErrorMessage = "Mobile number must start with 9, 8, or 7 and be 10 digits.")]
        public string MobileNumber { get; set; }

        [Required]
        [RegularExpression(@"^[a-zA-Z ]{5,50}$", ErrorMessage = "Customer name must be 5-50 alphabetic characters.")]
        public string CustomerName { get; set; }

        [Required]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must be 8+ characters, include uppercase, number, and special character.")]
        public string Password { get; set; }

        [Required]
        [RegularExpression(@"^(Customer|FieldOwner|Admin)$", ErrorMessage = "Invalid role.")]
        public string Role { get; set; }
    }
}
