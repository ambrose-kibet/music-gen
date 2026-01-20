import { create } from "zustand";

interface CurrentSongState {
  currentSongId: string | null;
  setCurrentSongId: (songId: string | null) => void;
}

interface CurrentUserSongsParametersState {
  queryParameters: {
    searchTerm?: string;
    orderBy: string;
    page: number;
  };
  setQueryParameters: (params: {
    searchTerm?: string;
    orderBy: string;
    page: number;
  }) => void;
}
const useCurrentSongStore = create<CurrentSongState>((set) => ({
  currentSongId: null,
  setCurrentSongId: (songId: string | null) =>
    set(() => ({ currentSongId: songId })),
}));

const useCurrentUserSongsParametersStore =
  create<CurrentUserSongsParametersState>((set) => ({
    queryParameters: {
      searchTerm: undefined,
      orderBy: "date desc",
      page: 1,
    },
    setQueryParameters: (params: {
      searchTerm?: string;
      orderBy: string;
      page: number;
    }) => set(() => ({ queryParameters: { ...params } })),
  }));

export { useCurrentUserSongsParametersStore };
export default useCurrentSongStore;
