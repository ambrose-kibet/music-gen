import Pagination from "@/components/pagination";
import SearchForm from "@/components/search-form";
import SongContainer from "@/components/songs/song-container";
import SortTabs from "@/components/sort-component";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import customAxios from "@/lib/axios-config";
import type { SongsResponse } from "@/utils/types";
import useCurrentSongStore, {
  useCurrentUserSongsParametersStore,
} from "@/store/current-song-store";
import MySongsComponent from "@/components/songs/my-songs";

const MySongsPage: React.FC = () => {
  const {
    queryParameters: { orderBy, page, searchTerm },
    setQueryParameters,
  } = useCurrentUserSongsParametersStore((state) => state);

  const { setCurrentSongId } = useCurrentSongStore((state) => state);

  const { data, isPending, isError, error } = useQuery<SongsResponse, Error>({
    queryKey: ["userSongs", orderBy, page, searchTerm],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        orderBy: orderBy,
        page: page,
      };
      if (searchTerm) {
        params.search = searchTerm;
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
    <div className="w-full h-full flex flex-col items-center justify-start px-2 py-2">
      <h1 className="text-4xl font-bold text-center capitalize text-primary">
        My Songs{" "}
      </h1>
      <MySongsComponent />
    </div>
  );
};
export default MySongsPage;
