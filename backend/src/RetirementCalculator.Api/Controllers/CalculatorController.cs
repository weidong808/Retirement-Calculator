using Microsoft.AspNetCore.Mvc;
using RetirementCalculator.Domain.Models;
using RetirementCalculator.Domain.Services;

namespace RetirementCalculator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalculatorController(IRetirementCalculatorEngine engine) : ControllerBase
{
    [HttpPost("plan")]
    [ProducesResponseType(typeof(RetirementPlanResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<RetirementPlanResult> CalculatePlan([FromBody] RetirementPlanInput input)
    {
        var validation = RetirementPlanValidator.Validate(input);
        if (!validation.IsValid)
        {
            return BadRequest(new { errors = validation.Errors });
        }

        var result = engine.Calculate(input);
        return Ok(result);
    }

    [HttpGet("fra")]
    [ProducesResponseType(typeof(FraLookupResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<FraLookupResponse> GetFra([FromQuery] int? birthYear, [FromQuery] string? birthDate)
    {
        int year;
        if (birthYear.HasValue)
        {
            year = birthYear.Value;
        }
        else if (!string.IsNullOrWhiteSpace(birthDate) && DateOnly.TryParse(birthDate, out var parsed))
        {
            year = parsed.Year;
        }
        else
        {
            return BadRequest(new { error = "Provide birthYear or birthDate (YYYY-MM-DD)." });
        }

        if (year < 1900 || year > DateTime.UtcNow.Year)
        {
            return BadRequest(new { error = "Birth year is out of range." });
        }

        var fra = FraCalculator.GetFullRetirementAge(year);
        return Ok(new FraLookupResponse(fra, FraCalculator.FormatFra(fra)));
    }
}

public record FraLookupResponse(decimal Fra, string Label);
