import { Outlet } from "react-router-dom";

const IntegrationsLayout: React.FC = () => {
  return (
    <div className="min-w-screen flex min-h-screen flex-col items-center justify-center px-2">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default IntegrationsLayout;
