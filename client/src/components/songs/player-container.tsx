import useCurrentSongStore from "../../store/current-song-store";
import SongPlayer from "./song-player";
import { FaTimes } from "react-icons/fa";

const PlayerContainer: React.FC = () => {
  const { currentSongId, setCurrentSongId } = useCurrentSongStore(
    (state) => state,
  );

  if (!currentSongId) {
    return null;
  }
  return (
    <div className="w-full flex items-center justify-center backdrop-blur-md relative ">
      <button
        className="absolute -top-2 right-0 text-primary z-10"
        onClick={() => {
          setCurrentSongId(null);
        }}
      >
        <FaTimes size={16} />
      </button>

      <SongPlayer songId={currentSongId} />
    </div>
  );
};
export default PlayerContainer;
