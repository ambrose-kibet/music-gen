import { FaYoutube } from "react-icons/fa";
import customAxios from "@/lib/axios-config";

const YoutubeIntegration: React.FC = () => {
  const initiateOAuthFlow = async () => {
    try {
      const response = await customAxios.get("integrations/youtube");
      const { url } = response.data;
      window.location.href = url;
    } catch (error) {
      console.error("Failed to initiate YouTube OAuth flow", error);
    }
  };
  return (
    <button
      className="flex flex-col items-center justify-center space-y-2 p-4 border rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => initiateOAuthFlow()}
    >
      <FaYoutube className="h-12 w-12 text-red-600" />
      <h2 className="text-xl font-semibold">YouTube</h2>
      <p className="text-center text-sm text-primary">
        Upload your songs to YouTube and reach a wider audience.
      </p>
    </button>
  );
};
export default YoutubeIntegration;
