import { audiusSdk, audiusSdkReady } from "@/utils/audiusSdk";
import { useEffect, useRef, useState } from "react";
import customAxios from "@/lib/axios-config";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
const AudiusIntegrationPage: React.FC = () => {
  const buttonDivRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [loggedInHandle, setLoggedInHandle] = useState<{
    handle: string;
    userId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  type AudiusProfile = {
    userId: string;
    email: string;
    name: string;
    handle: string;
    verified: boolean;
    profilePicture: {
      "150x150": string;
      "480x480": string;
      "1000x1000": string;
    } | null;
    apiKey: string | null;
    sub: number;
    iat: string;
  };
  async function loadOauth() {
    try {
      await audiusSdkReady;
    } catch (e) {
      // initialization failed
      setError("Failed to initialize Audius SDK");
      return;
    }

    if (!audiusSdk) {
      setError("Audius SDK not available");
      return;
    }

    audiusSdk.oauth.init({
      successCallback: (profile: AudiusProfile) => {
        console.log("Audius profile:", profile);
        // Send the audiusUserId to the backend to save the integration
        customAxios
          .post("/integrations/audius", {
            audiusUserId: profile.userId,
          })
          .then(() => {
            console.log("Audius integration saved successfully");
            setError(null);
            navigate("/integrations?status=success");
          })
          .catch((error: AxiosError | any) => {
            console.error("Error saving Audius integration:", error?.message);
            setError("Failed to save Audius integration");
            navigate("/integrations?status=error");
          });

        console.log("Audius integration saved successfully");
        setLoggedInHandle(profile);
        setError(null);
      },
      errorCallback: (errorMessage: Error) => {
        setError(errorMessage?.message);
      },
    });
    audiusSdk.oauth.renderButton({
      element: buttonDivRef.current,
      scope: "write",
      buttonOptions: {
        size: "large",
        corners: "pill",
        customText: "Add Audius Integration",
      },
    });
  }

  useEffect(() => {
    loadOauth();
  }, []);

  const handleSaveIntegration = async () => {
    if (!loggedInHandle) return;

    try {
      await customAxios.post("/integrations/audius", {
        audiusUserId: loggedInHandle.userId,
      });
      console.log("Audius integration saved successfully");
      setError(null);
    } catch (error: AxiosError | any) {
      console.error("Error saving Audius integration:", error?.message);
      setError("Failed to save Audius integration");
    }
  };

  useEffect(() => {
    if (loggedInHandle) {
      handleSaveIntegration();
    }
  }, [loggedInHandle]);

  return (
    <div className="w-full max-w-3xl p-4 flex flex-col items-center mx-auto">
      <h1 className="text-3xl text-primary font-bold mb-4">
        Audius Integration
      </h1>
      <div className="p-6 flex flex-col">
        <div ref={buttonDivRef} />
        {loggedInHandle && (
          <p className="mt-4 text-green-600">
            Successfully logged in as: {loggedInHandle.handle}
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-600">Error during login: {error}</p>
        )}
      </div>
    </div>
  );
};
export default AudiusIntegrationPage;
