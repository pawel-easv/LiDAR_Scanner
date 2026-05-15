

using System.Text.Json;
using System.Text.Json.Serialization;
using api;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Mqtt.Controllers;
using Npgsql;
using NSwag;
using NSwag.Generation.Processors.Security;
using server;
using StackExchange.Redis;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.Extensions;
using StateleSSE.AspNetCore.GroupRealtime;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;
// var connectionStrings = new ConnectionStrings();
// configuration.GetSection(nameof(ConnectionStrings)).Bind(connectionStrings);
//
//
// builder.Services.AddSingleton(connectionStrings);

builder.Services.Configure<HostOptions>(opts => opts.ShutdownTimeout = TimeSpan.FromSeconds(0));
// builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
// {
//     var config = ConfigurationOptions.Parse(connectionStrings.Redis);
//     config.AbortOnConnectFail = false;
//     return ConnectionMultiplexer.Connect(config);
// });

builder.Services.AddRedisSseBackplane();
builder.Services.AddEfRealtime();
builder.Services.AddGroupRealtime();

// var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionStrings.DbConnectionString);
// var dataSource = dataSourceBuilder.Build();
//
// builder.Services.AddDbContext<AppDbContext>((sp, conf) =>
// {
//     conf.AddEfRealtimeInterceptor(sp);
//     conf.UseNpgsql(connectionStrings.DbConnectionString);
// });
builder.Services.AddOpenApiDocument(config =>
{
    config.AddSecurity("Bearer", new OpenApiSecurityScheme
    {
        Type = OpenApiSecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter your JWT token"
    });
    config.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("Bearer"));
    
});
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        var exception = context.HttpContext.Features.Get<IExceptionHandlerFeature>()?.Error;
        if (exception != null)
        {
            context.ProblemDetails.Detail = exception.Message;
        }
    };
});
builder.Services.AddMqttControllers();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddCors();

var app = builder.Build();
app.UseExceptionHandler();
app.UseOpenApi();
app.UseSwaggerUi();
app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/sse"))
    {
        var token = context.Request.Query["access_token"].ToString();
        if (!string.IsNullOrEmpty(token))
            context.Request.Headers.Authorization = $"Bearer {token}";
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();



 var mqttClient = app.Services.GetRequiredService<IMqttClientService>();
 // await mqttClient.ConnectAsync(connectionStrings.MqttBroker, connectionStrings.MqttPort);

 app.GenerateApiClientsFromOpenApi("../client/src/generated-ts-client.ts", "./openapi.json").GetAwaiter().GetResult();

using(var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MyDbContext>();
    db.Database.EnsureCreated();
}

app.Run();

