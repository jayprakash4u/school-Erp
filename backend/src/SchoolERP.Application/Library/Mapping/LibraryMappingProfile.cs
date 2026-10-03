using AutoMapper;
using SchoolERP.Contracts.Library;
using SchoolERP.Domain.Entities.Library;

namespace SchoolERP.Application.Library.Mapping;

public class LibraryMappingProfile : Profile
{
    public LibraryMappingProfile()
    {
        CreateMap<Author, AuthorDto>();
        CreateMap<Publisher, PublisherDto>();
        CreateMap<BookCategory, BookCategoryDto>();
        CreateMap<Book, BookDto>();
        CreateMap<BookCopy, BookCopyDto>();
        CreateMap<LibraryMember, LibraryMemberDto>();
        CreateMap<BookIssue, BookIssueDto>();
        CreateMap<BookReturn, BookReturnDto>();
        CreateMap<LibraryFine, LibraryFineDto>();
    }
}
