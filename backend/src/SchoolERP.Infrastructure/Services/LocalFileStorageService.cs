using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using SchoolERP.Application.Common.Exceptions;
using SchoolERP.Application.Common.Interfaces;

namespace SchoolERP.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _storageRoot;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(
        IWebHostEnvironment environment,
        ILogger<LocalFileStorageService> logger)
    {
        _logger = logger;
        _storageRoot = Path.Combine(environment.ContentRootPath, "uploads");

        if (!Directory.Exists(_storageRoot))
        {
            Directory.CreateDirectory(_storageRoot);
        }
    }

    public async Task<string> UploadAsync(
        Stream stream, 
        string fileName, 
        string contentType, 
        string? folder = null, 
        CancellationToken cancellationToken = default)
    {
        if (stream == null || stream.Length == 0)
        {
            throw new ValidationException("File", "File stream cannot be empty.");
        }

        var extension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";
        
        var targetDirectory = string.IsNullOrWhiteSpace(folder)
            ? _storageRoot
            : Path.Combine(_storageRoot, folder.TrimStart('/', '\\'));

        if (!Directory.Exists(targetDirectory))
        {
            Directory.CreateDirectory(targetDirectory);
        }

        var destinationPath = Path.Combine(targetDirectory, uniqueFileName);

        // Prevent path traversal
        var fullDestinationPath = Path.GetFullPath(destinationPath);
        if (!fullDestinationPath.StartsWith(Path.GetFullPath(_storageRoot), StringComparison.OrdinalIgnoreCase))
        {
            throw new ForbiddenAccessException("Invalid destination file path traversal attempt.");
        }

        using (var fileStream = new FileStream(fullDestinationPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await stream.CopyToAsync(fileStream, cancellationToken);
        }

        _logger.LogInformation("File uploaded successfully to {Path}", fullDestinationPath);

        var relativePath = Path.GetRelativePath(_storageRoot, fullDestinationPath).Replace('\\', '/');
        return relativePath;
    }

    public Task<(Stream Stream, string ContentType, string FileName)> DownloadAsync(
        string filePath, 
        CancellationToken cancellationToken = default)
    {
        var safePath = Path.GetFullPath(Path.Combine(_storageRoot, filePath.TrimStart('/', '\\')));

        if (!safePath.StartsWith(Path.GetFullPath(_storageRoot), StringComparison.OrdinalIgnoreCase) || !File.Exists(safePath))
        {
            throw new NotFoundException("File", filePath);
        }

        var stream = new FileStream(safePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var fileName = Path.GetFileName(safePath);
        var contentType = GetContentType(fileName);

        return Task.FromResult<(Stream Stream, string ContentType, string FileName)>((stream, contentType, fileName));
    }

    public Task<bool> DeleteAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var safePath = Path.GetFullPath(Path.Combine(_storageRoot, filePath.TrimStart('/', '\\')));

        if (!safePath.StartsWith(Path.GetFullPath(_storageRoot), StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(false);
        }

        if (File.Exists(safePath))
        {
            File.Delete(safePath);
            _logger.LogInformation("File deleted: {Path}", safePath);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    public Task<bool> ExistsAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var safePath = Path.GetFullPath(Path.Combine(_storageRoot, filePath.TrimStart('/', '\\')));

        if (!safePath.StartsWith(Path.GetFullPath(_storageRoot), StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(false);
        }

        return Task.FromResult(File.Exists(safePath));
    }

    public string GetFileUrl(string relativePath)
    {
        return $"/api/files/{relativePath.TrimStart('/')}";
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            ".csv" => "text/csv",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".zip" => "application/zip",
            _ => "application/octet-stream"
        };
    }
}
