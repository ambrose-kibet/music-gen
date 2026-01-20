import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "./ui/button";

type Props = {
  pageCount: number;
  handlePageChange: (page: number) => void;
  currentPage: number;
  isPending: boolean;
};

const Pagination = ({
  handlePageChange,
  pageCount,
  currentPage,
  isPending,
}: Props) => {
  const prevPage = () => {
    if (currentPage === 1) return;
    handlePageChange(currentPage - 1);
  };
  const nextPage = () => {
    if (currentPage === pageCount) return;
    handlePageChange(currentPage + 1);
  };
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <div className="w-full flex items-center justify-center mt-auto pt-1">
      <PaginationContent>
        <PaginationItem>
          <Button variant="ghost" size="sm" disabled={isPending} asChild>
            <PaginationPrevious onClick={prevPage} />
          </Button>
        </PaginationItem>
        {pages.map((page) => {
          if (page === currentPage) {
            return (
              <PaginationItem
                key={page}
                className="bg-primary text-primary-foreground rounded-md py-1 px-2"
              >
                <span>{page}</span>
              </PaginationItem>
            );
          }
          if (
            page === currentPage - 1 ||
            page === currentPage + 1 ||
            page === 1 ||
            page === pageCount
          ) {
            return (
              <PaginationItem key={page}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-md p-3"
                  disabled={isPending}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              </PaginationItem>
            );
          }
          if (page === currentPage - 2 || page === currentPage + 2) {
            return <PaginationEllipsis key={page} />;
          }
          return null;
        })}

        <PaginationItem>
          <Button variant="ghost" size="sm" disabled={isPending} asChild>
            <PaginationNext onClick={nextPage} />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </div>
  );
};
export default Pagination;
