import customAxios from "@/lib/axios-config";
import useCurrentSongStore, {
  useCurrentUserSongsParametersStore,
} from "@/store/current-song-store";
import type { SongsResponse } from "@/utils/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import SearchForm from "../search-form";
import SortTabs from "../sort-component";
import SongContainer from "./song-container";
import Pagination from "../pagination";

const MySongsComponent: React.FC<{ botId?: string }> = ({ botId }) => {
  const {
    queryParameters: { orderBy, page, searchTerm },
    setQueryParameters,
  } = useCurrentUserSongsParametersStore((state) => state);

  const { setCurrentSongId } = useCurrentSongStore((state) => state);

  const { data, isPending, isError, error } = useQuery<SongsResponse, Error>({
    queryKey: ["userSongs", orderBy, page, searchTerm, botId],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        orderBy: orderBy,
        page: page,
      };
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (botId) {
        params.botId = botId;
      }

      const response = await customAxios.get<SongsResponse>("songs", {
        params,
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
  if (isError) {
    console.error(JSON.stringify(error));
  }
  return (
    <div className="w-full h-auto flex flex-col items-center justify-start px-2 py-2 mb-10">
      <div className="w-full max-w-2xl mt-4 gap-y-6 flex flex-col">
        <div className="grid md:flex  gap-y-2 justify-between items-center w-full gap-2">
          <SearchForm
            onSubmit={(values) => {
              setQueryParameters({
                searchTerm: values.query?.trim() ? values.query : undefined,
                orderBy: orderBy,
                page: 1,
              });
            }}
            defaultValues={{ query: searchTerm }}
          />
          <SortTabs
            handleChange={(value) => {
              setQueryParameters({
                searchTerm: searchTerm,
                orderBy: value,
                page: 1,
              });
            }}
            sortOptions={[
              { value: "title asc", label: "Title (A-Z)" },
              { value: "title desc", label: "Title (Z-A)" },
              { value: "date asc", label: "Date (Oldest)" },
              { value: "date desc", label: "Date (Newest)" },
            ]}
            value={orderBy}
            isPending={isPending}
          />
        </div>
        <SongContainer
          songs={data?.songs ?? []}
          onPlay={(songId) => {
            setCurrentSongId(songId);
          }}
        />
      </div>

      <Pagination
        currentPage={page}
        pageCount={Math.ceil((data?.total || 0) / 10)}
        handlePageChange={(page) => {
          setQueryParameters({
            searchTerm: searchTerm,
            orderBy: orderBy,
            page: page,
          });
        }}
        isPending={isPending}
      />
    </div>
  );
};
export default MySongsComponent;
