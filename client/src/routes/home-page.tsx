import CreateSongContainer from "@/components/songs/create-song-container";
import SongContainer from "@/components/songs/song-container";
import customAxios from "@/lib/axios-config";
import useCurrentSongStore from "@/store/current-song-store";
import type { SongsResponse } from "@/utils/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const HomePage: React.FC = () => {
  const { setCurrentSongId } = useCurrentSongStore((state) => state);
  const { data, isError, error } = useQuery<SongsResponse, Error>({
    queryKey: ["userSongs", "latest"],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        orderBy: "date desc",
        page: 1,
        limit: 1,
      };

      const response = await customAxios.get<SongsResponse>("songs", {
        params,
      });

      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  if (isError) {
    console.error(JSON.stringify(error));
  }
  return (
    <div className="w-full h-full flex  flex-col items-center justify-center-safe px-2 overflow-auto">
      <h1 className="text-4xl font-bold text-center capitalize text-primary">
        create song
      </h1>
      <div className="grid w-full max-w-5xl grid-cols-1 lg:grid-cols-[450px_1fr] gap-2 mt-6 mb-10 lg:mb-0">
        <CreateSongContainer />
        <SongContainer
          onPlay={(id) => setCurrentSongId(id)}
          songs={data?.songs ?? []}
        />
      </div>
    </div>
  );
};
export default HomePage;
