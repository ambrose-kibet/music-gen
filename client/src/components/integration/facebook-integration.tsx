import { FaFacebook } from "react-icons/fa";
import customAxios from "@/lib/axios-config";

const FacebookIntegration: React.FC = () => {
  const initiateOAuthFlow = async () => {
    try {
      const responseUrl = await customAxios.get("integrations/facebook");
      window.location.href = responseUrl.data.url;
      console.log("Facebook OAuth flow initiated", responseUrl.data);
    } catch (error) {
      console.error("Failed to initiate Facebook OAuth flow", error);
    }
  };
  return (
    <button
      className="flex flex-col items-center justify-center space-y-2 p-4 border rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => initiateOAuthFlow()}
    >
      <FaFacebook className="h-12 w-12 text-blue-600" />
      <h2 className="text-xl font-semibold">Facebook</h2>
      <p className="text-center text-sm text-primary">
        Share your creations directly to Facebook and connect with your friends.
      </p>
    </button>
  );
};
export default FacebookIntegration;
