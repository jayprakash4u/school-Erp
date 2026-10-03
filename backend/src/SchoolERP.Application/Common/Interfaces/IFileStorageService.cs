namespace SchoolERP.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream stream, string fileName, string contentType, string? folder = null, CancellationToken cancellationToken = default);
    Task<(Stream Stream, string ContentType, string FileName)> DownloadAsync(string filePath, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string filePath, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string filePath, CancellationToken cancellationToken = default);
    string GetFileUrl(string relativePath);
}
