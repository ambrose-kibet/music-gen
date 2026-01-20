import customAxios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";
import ReactPlayer from "react-player";

const SongPlayer: React.FC<{ songId: string }> = ({ songId }) => {
  const { data, isError, error, isPending } = useQuery({
    queryKey: ["current-song", songId],
    queryFn: async () => {
      const res = await customAxios(`songs/signed-url/${songId}`);
      return res.data;
    },
  });
  if (isError) {
    console.error(error);
  }
  if (isPending) {
    return;
  }

  return (
    <div className="w-full h-full flex items-center justify-center ">
      <ReactPlayer src={data} playing controls height={60} />
    </div>
  );
};
export default SongPlayer;
