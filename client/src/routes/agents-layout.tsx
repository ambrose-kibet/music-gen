import AgentNavbar from "@/components/agents/agent-navbar";
import { Outlet } from "react-router-dom";

const AgentsLayout: React.FC = () => {
  return (
    <div className="h-fit w-full flex flex-col items-center justify-start px-2 py-4 space-y-6">
      <h1 className="text-4xl font-bold text-center capitalize text-primary mb-4">
        my bots
      </h1>
      <AgentNavbar />
      <Outlet />
    </div>
  );
};
export default AgentsLayout;
