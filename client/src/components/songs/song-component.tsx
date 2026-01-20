import React from "react";
import { FaCirclePlay } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";

const SongComponent: React.FC<{
  index?: number;
  id: string;
  title?: string;
  artist: string;
  coverSrc?: string;
  isPlaying?: boolean;
  isPending?: boolean;
  onPlay: (songId: string) => void;
}> = ({
  id,
  index,
  title = "untitled",
  artist = "unknown artist",
  coverSrc,
  isPending,
  isPlaying = false,
  onPlay,
}) => {
  const location = useLocation();

  return (
    <button
      className={`group flex items-center justify-center gap-3 gap-x-5 px-3 py-2 hover:bg-muted rounded ${
        isPlaying ? "text-primary" : ""
      }`}
      onClick={() => {
        if (!isPlaying && !isPending) {
          onPlay(id);
        }
      }}
    >
      <div
        className={
          "w-6  text-sm text-muted-foreground group/inner  text-right relative "
        }
      >
        <span
          className={`transition-opacity duration-150 ease-in-out opacity-100 group-hover:opacity-0 ${
            isPlaying ? "text-primary" : ""
          }`}
        >
          {index ?? ""}
        </span>
        <div
          aria-label={`Play ${title}`}
          className={`absolute left-0 top-0  flex items-center justify-center text-2xl  opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
            isPlaying ? "text-primary" : ""
          }`}
        >
          <FaCirclePlay />
        </div>
      </div>
      {coverSrc && (
        <img
          src={coverSrc}
          alt={artist.charAt(0)}
          className="w-12 h-12 rounded object-cover"
        />
      )}
      <div className="flex flex-1 flex-col items-start min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/songs/${id}?from=${location.pathname}`}
            className="truncate font-medium"
          >
            {title}
          </Link>
        </div>
        {artist && (
          <div
            className={`text-xs text-muted-foreground truncate ${
              isPlaying ? "text-primary" : ""
            }`}
          >
            {artist}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 ">
        {isPending && (
          <span className="text-xs text-primary animate-pulse">processing</span>
        )}
      </div>
    </button>
  );
};

export default SongComponent;
