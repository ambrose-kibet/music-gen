import customAxios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FaYoutube } from "react-icons/fa";
import { FaShareFromSquare } from "react-icons/fa6";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ShareSongForm from "@/components/songs/share-song-form";

const SongPage: React.FC = () => {
  const params = useParams<{ songId: string }>();
  const { songId } = params;
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["song", songId],
    queryFn: async () => {
      const res = await customAxios.get(`/songs/${songId}`);
      return res.data;
    },
  });
  if (isError) {
    console.error(JSON.stringify(error));
  }
  if (isPending) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-2 py-2">
        <h1 className="text-4xl font-bold text-center capitalize text-primary">
          Loading...
        </h1>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-evenly px-2 py-2 ">
      <div className="w-full h-auto mb-4 flex items-center justify-center md:justify-start max-w-3xl">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-primary "
                onClick={() =>
                  navigate(`${searchParams.get("from") || "/songs"}`)
                }
              >
                Back
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-4xl font-bold text-center capitalize text-primary">
        {data.title}
      </h1>
      <div className="mt-4 w-full max-w-3xl grid grid-cols-1 md:grid-cols-[400px_1fr] gap-4">
        <div className="w-full h-auto flex items-center justify-center">
          <img
            src={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${data.coverS3Key}`}
            alt={data.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div className="w-full h-auto flex flex-col items-start justify-start space-y-4">
          <p className="text-sm">
            <strong className="text-lg">Artist:</strong> {data.user.name}
          </p>
          <p className="text-sm">
            <strong className="text-lg">Title:</strong> {data.title}
          </p>
          <p className="text-sm">
            <strong className="text-lg">Prompt:</strong> {data.prompt}
          </p>
          <p className="text-sm">
            <strong className="text-lg">Instrumental:</strong>{" "}
            {data.instrumental ? "Yes" : "No"}
          </p>
          <div className="text-sm">
            <strong className="text-lg">Categories:</strong>
            <div className="mt-2 flex flex-wrap space-y-2">
              {data.songCategories.map((category: any) => (
                <span
                  key={category.categoryId}
                  className="p4  mr-2 bg-accent rounded-full px-3 py-1 border border-secondary "
                >
                  {category.category.name}
                </span>
              ))}
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary transition-colors">
                <FaShareFromSquare size={24} /> Share Song
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-70 " sideOffset={-100}>
              <ShareSongForm defaultValues={data.shareTo} songId={data.id} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <hr />
      <div className="mt-4 w-full max-w-3xl flex flex-col items-start justify-start space-y-4">
        <h2 className="text-2xl font-bold text-primary text-center">Videos</h2>
        <div className="mt-4 w-full max-w-3xl grid grid-cols-1 md:grid-cols-[1fr_400px] gap-4">
          <p className="text-xs">
            <strong className="text-lg">Lyrics:</strong> {data.lyrics || "N/A"}
          </p>
          {data.songVideos.map((video: any) => (
            <div
              className="w-full h-auto flex items-center justify-center relative"
              key={video.id}
            >
              {video.youtube_url && (
                <a
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-[50%] right-[50%] translate-x-1/2 translate-y-1/2 text-red-600 bg-white rounded-full p-2 shadow-lg hover:scale-105 transition-transform"
                >
                  <FaYoutube size={24} />
                </a>
              )}
              <img
                src={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${video.thumbnailS3Key}`}
                alt={data.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SongPage;
