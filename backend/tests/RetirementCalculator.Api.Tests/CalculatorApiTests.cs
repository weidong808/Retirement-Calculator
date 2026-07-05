using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace RetirementCalculator.Api.Tests;

public class CalculatorApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public CalculatorApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetFra_Returns67_For1960BirthYear()
    {
        var response = await _client.GetAsync("/api/calculator/fra?birthYear=1960");
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<FraResponse>();
        Assert.NotNull(body);
        Assert.Equal(67, body.Fra);
        Assert.Equal("67", body.Label);
    }

    [Fact]
    public async Task PostPlan_ReturnsBadRequest_WhenSpendingMissing()
    {
        var payload = new
        {
            yourAge = 45,
            targetRetirementAge = 65,
            lifeExpectancy = 90,
            retirementSpending = 0,
            yourClaimAge = 67,
            yourFra = 67
        };

        var response = await _client.PostAsJsonAsync("/api/calculator/plan", payload);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostPlan_ReturnsOk_ForValidPayload()
    {
        var payload = new
        {
            birthDate = "1975-03-10",
            targetRetirementAge = 65,
            lifeExpectancy = 90,
            traditional401k = 500000,
            retirementSpending = 80000,
            yourMonthlySsFra = 3000,
            yourClaimAge = 67
        };

        var response = await _client.PostAsJsonAsync("/api/calculator/plan", payload);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<PlanResponse>();
        Assert.NotNull(body);
        Assert.True(body.PortfolioAtRetirement > 0);
        Assert.NotEmpty(body.YourSsClaiming);
    }

    private sealed record FraResponse(decimal Fra, string Label);

    private sealed record PlanResponse(
        decimal PortfolioAtRetirement,
        IReadOnlyList<object> YourSsClaiming);
}
