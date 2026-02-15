'use client';

import { DashboardColors } from '@/types/config';
import { getTextColor, getCardBorder, getContrastText } from '@/lib/view-colors';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  configColors: DashboardColors;
  pageSize?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  configColors,
  pageSize = 25,
}: PaginationProps) {
  const textColor = getTextColor(configColors);
  const borderColor = getCardBorder(configColors);
  const buttonColor = configColors.buttons || '#3B82F6';

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate showing range
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate middle range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if near start or end
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      // Add ellipsis before middle range if needed
      if (startPage > 2) {
        pages.push('ellipsis');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis after middle range if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between py-3 px-1">
      {/* Count text */}
      <div className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
        Showing {start}-{end} of {totalCount}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
          style={{
            borderColor: borderColor,
            color: textColor,
          }}
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1.5 text-sm"
                  style={{ color: textColor, opacity: 0.5 }}
                >
                  ...
                </span>
              );
            }

            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className="w-8 h-8 text-sm rounded-md transition-colors"
                style={{
                  backgroundColor: isActive ? buttonColor : 'transparent',
                  color: isActive ? getContrastText(buttonColor) : textColor,
                  borderColor: isActive ? buttonColor : borderColor,
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
          style={{
            borderColor: borderColor,
            color: textColor,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
