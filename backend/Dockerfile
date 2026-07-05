FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/src/RetirementCalculator.Domain/ RetirementCalculator.Domain/
COPY backend/src/RetirementCalculator.Api/ RetirementCalculator.Api/
RUN dotnet publish RetirementCalculator.Api/RetirementCalculator.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "RetirementCalculator.Api.dll"]
