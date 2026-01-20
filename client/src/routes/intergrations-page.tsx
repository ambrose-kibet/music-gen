import audius from "@/assets/audius.svg";

import { NavLink } from "react-router-dom";
import YoutubeIntegration from "@/components/integration/youtube-integration";
import FacebookIntegration from "@/components/integration/facebook-integration";

const IntegrationsPage: React.FC = () => {
  return (
    <div className="w-full h-full flex  flex-col items-center justify-center-safe px-2 overflow-auto">
      <h1 className="text-4xl font-bold text-center capitalize text-primary">
        integrations
      </h1>
      <div className="grid w-full max-w-3xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-10">
        <NavLink
          to="/integrations/audius"
          className="flex flex-col items-center justify-center space-y-2 p-4 border rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        >
          <img src={audius} alt="Audius" className="h-12 w-12" />
          <h2 className="text-xl font-semibold">Audius</h2>
          <p className="text-center text-sm text-primary">
            Publish your music on Audius and engage with the music community.
          </p>
        </NavLink>

        <YoutubeIntegration />
        <FacebookIntegration />
        <button className="flex flex-col items-center justify-center space-y-2 p-4 border rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer">
          <h2 className="text-xl font-semibold">Instagram</h2>
          <p className="text-center text-sm text-primary">coming soon...</p>
        </button>
      </div>
    </div>
  );
};
export default IntegrationsPage;
