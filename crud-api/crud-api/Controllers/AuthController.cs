using crud_api.Data;
using crud_api.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace crud_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly EmployeeRepository _employeeRepository;
        private readonly JwtOption _jwtOption;
        public AuthController(EmployeeRepository employeeRepository, IOptions<JwtOption> options) 
        { 
            _employeeRepository = employeeRepository; 
            _jwtOption = options.Value;
        }
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginDto model)
        {
            var employee = await _employeeRepository.GetEmployeeByEmail(model.Email);
            if (employee == null)
            {
                return BadRequest(new { error = "Email does not exist" });
            }
            if (employee.Password != model.Password)
            {
                return BadRequest(new { error = "Email/Password is incorrect" });
            }
            var jwtKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtOption.Key!));
            var credential = new SigningCredentials(jwtKey, SecurityAlgorithms.HmacSha256);
            List<Claim> claims = new List<Claim>()
            {
                new Claim("Email",model.Email)
            };
            var sToken = new JwtSecurityToken(_jwtOption.Key, _jwtOption.Issuer, claims, expires: DateTime.Now.AddHours(5), signingCredentials: credential);
            var token = new JwtSecurityTokenHandler().WriteToken(sToken);
            
            return Ok(new { token = token});
        }
    }
}
