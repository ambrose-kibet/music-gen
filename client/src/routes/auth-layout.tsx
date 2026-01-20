import useUserStore from "@/store/user-store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const AuthLayout: React.FC = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  return (
    <div className="min-w-screen flex min-h-screen flex-col items-center justify-center px-2">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
