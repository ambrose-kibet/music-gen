import React from "react";
import { NavLink } from "react-router-dom";

const AgentNavbar: React.FC = () => {
  const baseClass =
    "px-4 py-1 rounded-full tracking-widest shadow transition-all duration-200 fade-in";
  return (
    <div className="flex justify-center space-x-2 w-fit mx-auto rounded-full shadow">
      <NavLink
        to="/my-agents"
        end
        className={({ isActive }) =>
          `${baseClass} ${
            isActive
              ? "bg-primary text-white shadow shadow-primary"
              : "bg-transparent text-primary"
          }`
        }
      >
        My bots
      </NavLink>

      <NavLink
        to="/my-agents/create-agent"
        className={({ isActive }) =>
          `${baseClass} ${
            isActive
              ? "bg-primary text-white shadow shadow-primary"
              : "bg-transparent text-primary"
          }`
        }
      >
        Create bot
      </NavLink>
    </div>
  );
};

export default AgentNavbar;
