import { Button } from "./button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const maxVisiblePages = 5;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {!pageNumbers.includes(1) && (
        <>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {!pageNumbers.includes(2) && (
            <MoreHorizontal className="h-4 w-4 mx-1 text-gray-500" />
          )}
        </>
      )}

      {pageNumbers.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {!pageNumbers.includes(totalPages) && (
        <>
          {!pageNumbers.includes(totalPages - 1) && (
            <MoreHorizontal className="h-4 w-4 mx-1 text-gray-500" />
          )}
          <Button
            variant={currentPage === totalPages ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
};

export default Pagination; 