import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import PlayerContainer from "@/components/songs/player-container";
import useUserStore from "@/store/user-store";
import { useQuery } from "@tanstack/react-query";
import customAxios from "@/lib/axios-config";

const Root: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const { data, isSuccess } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await customAxios.get("/auth/me");
      return res.data;
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isSuccess, data, setUser]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  return (
    <div className="w-screen flex  flex-col items-center justify-center ">
      <Navbar />
      <div className="h-auto w-full flex items-center justify-center overflow-auto">
        <Outlet />
        <div className="fixed bottom-0 left-0 right-0 w-fit mx-auto">
          <PlayerContainer />
        </div>
      </div>
    </div>
  );
};
export default Root;
