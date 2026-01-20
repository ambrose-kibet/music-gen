import useCurrentSongStore from "@/store/current-song-store";
import SongComponent from "./song-component";
import useUserStore from "@/store/user-store";

const SongContainer: React.FC<{
  songs: Array<{
    id: string;
    title?: string;
    status: string;
    coverS3Key?: string;
  }>;
  onPlay: (id: string) => void;
}> = ({ songs, onPlay }) => {
  const { user } = useUserStore();
  const { currentSongId } = useCurrentSongStore();

  return (
    <div className="border rounded py-4 px-2 flex flex-col gap-2">
      {songs.map((song, index) => (
        <SongComponent
          key={song.id}
          index={index + 1}
          id={song.id}
          title={song.title}
          artist={user?.name || "unknown artist"}
          coverSrc={undefined}
          isPlaying={currentSongId === song.id}
          onPlay={() => onPlay(song.id)}
          isPending={song.status === "queued" || song.status === "processing"}
        />
      ))}
    </div>
  );
};
export default SongContainer;
