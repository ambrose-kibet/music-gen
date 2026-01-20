import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { ExitIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { MdAdminPanelSettings, MdAttachMoney } from "react-icons/md";
import { MdWindow } from "react-icons/md";
import { PiVinylRecordFill } from "react-icons/pi";
import { TbPlugConnected } from "react-icons/tb";
import { RiRobot3Fill } from "react-icons/ri";
import { FaHome } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customAxios from "@/lib/axios-config";
import useUserStore from "@/store/user-store";
import { FaUsersCog } from "react-icons/fa";

const Navbar: React.FC = () => {
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const removeUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };
  const { mutate } = useMutation({
    mutationFn: () => {
      return customAxios.delete("/auth/logout");
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      removeUser();
      queryClient.removeQueries();
      navigate("/auth");
    },
  });
  const logout = () => {
    mutate();
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen w-screen ${
        isMenuOpen ? "" : "-translate-x-full"
      } z-40 flex flex-col justify-between bg-background transition-transform duration-200 animate-out sm:translate-x-full`}
    >
      <div className="z-0 flex items-center justify-between px-2 py-1">
        <div className="sm:mr-1 sm:-translate-x-full sm:pr-2">
          <ModeToggle />
        </div>
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`text-bold text-2xl ${
            isMenuOpen ? "translate-x-0" : "translate-x-full pl-2"
          } transition-transform duration-100 animate-in`}
        >
          {isMenuOpen ? "✖" : <HamburgerMenuIcon height={28} width={28} />}
        </button>
      </div>
      <div className="z-10 flex w-full flex-col items-start justify-start px-2 py-1">
        <div className="flex w-full flex-col space-y-4 sm:hidden">
          <p className="text-2xl">{user ? `Welcome, ${user.name}` : ""}</p>
          <p className="text-sm"> You have {user?.credits} credits remaining</p>
          {user && (
            <>
              <NavLink to="/integrations" onClick={() => setIsMenuOpen(false)}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "link" : "ghost"}
                    size={"lg"}
                    className="ml-0 flex w-full items-center justify-start gap-x-2 pl-0"
                  >
                    <TbPlugConnected className="h-8 w-8" />
                    <span className="text-xl">Integrations</span>
                  </Button>
                )}
              </NavLink>
              <NavLink to="/my-songs" onClick={() => setIsMenuOpen(false)}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "link" : "ghost"}
                    size={"lg"}
                    className="ml-0 flex w-full items-center justify-start gap-x-2 pl-0"
                  >
                    <PiVinylRecordFill className="h-8 w-8" />
                    <span className="text-xl">My Songs</span>
                  </Button>
                )}
              </NavLink>
              <NavLink to="/my-agents" onClick={() => setIsMenuOpen(false)}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "link" : "ghost"}
                    size={"lg"}
                    className="ml-0 flex w-full items-center justify-start gap-x-2 pl-0"
                  >
                    <RiRobot3Fill className="h-8 w-8" />
                    <span className="text-xl">Beat Bot</span>
                  </Button>
                )}
              </NavLink>
              <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "link" : "ghost"}
                    size={"lg"}
                    className="ml-0 flex w-full items-center justify-start gap-x-2 pl-0"
                  >
                    <FaHome className="h-8 w-8" />
                    <span className="text-xl">Home</span>
                  </Button>
                )}
              </NavLink>
              <NavLink to="/my-profile" onClick={() => setIsMenuOpen(false)}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "link" : "ghost"}
                    size={"lg"}
                    className="ml-0 flex w-full items-center justify-start gap-x-2 pl-0"
                  >
                    <FaUsersCog className="h-8 w-8" />
                    <span className="text-xl">My Profile</span>
                  </Button>
                )}
              </NavLink>
              {user && user?.userRole === "ADMIN" && (
                <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "link" : "ghost"}
                      size={"lg"}
                      className="ml-0 flex w-full items-center justify-start gap-x-2 pl-0"
                    >
                      <MdAdminPanelSettings className="h-8 w-8" />
                      <span className="text-xl">Admin</span>
                    </Button>
                  )}
                </NavLink>
              )}
            </>
          )}
          {!user && (
            <NavLink to="/auth">
              <Button
                size={"lg"}
                variant={"default"}
                className="mx-auto flex w-fit justify-center rounded-full text-xl capitalize text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started ?
              </Button>
            </NavLink>
          )}
        </div>
      </div>
      <div className="z-0 flex w-full max-w-[300px] items-center  sm:mr-1 sm:-translate-x-full">
        {user && (
          <div className=" group  z-10 w-full flex-col items-start justify-end hidden - translate-x-full sm:flex transition-transform duration-200">
            <div className="flex-col items-end hidden pb-8 space-y-1 group-hover:flex -mb-5 -ml-3 w-fit group-hover:-translate-x-full gap-y-2 transition-all duration-300">
              <h3 className="text-sm font-normal ">
                Hello <span className="text-primary">{user.name}</span>
              </h3>
              <h3 className="text-sm font-normal  ">
                Credits: <span className="text-primary">{user.credits} </span>
              </h3>

              <NavLink to="/my-songs">
                {({ isActive }) => (
                  <div
                    className={`group/inner flex w-full  items-center translate-x-3/4 ${
                      isActive ? "animate-bounce" : ""
                    }`}
                  >
                    <span
                      className={`z-10 flex items-center justify-center rounded-full p-2 ${
                        isActive ? "bg-primary" : "bg-muted"
                      } text-2xl transition-all  duration-200 group-hover/inner:bg-primary group-hover/inner:scale-120`}
                    >
                      <PiVinylRecordFill
                        className={`${
                          isActive ? "text-white animate-spin" : "text-primary"
                        } group-hover/inner:text-white`}
                      />
                    </span>
                    <span
                      className="flex h-10 items-center rounded-full pl-2 pr-[42px] text-lg capitalize text-transparent transition-transform duration-200 group-hover/inner:translate-x-[-100%] group-hover/inner:bg-primary group-hover/inner:text-white group-hover/inner:scale-120 group-hover/inner:pr-[48px]
                    "
                    >
                      my songs
                    </span>
                  </div>
                )}
              </NavLink>
              <NavLink to="/my-agents">
                {({ isActive }) => (
                  <div
                    className={`group/inner flex w-full  items-center translate-x-3/4 ${
                      isActive ? "animate-bounce" : ""
                    }`}
                  >
                    <span
                      className={`z-10 flex items-center justify-center rounded-full p-2 ${
                        isActive ? "bg-primary " : "bg-muted"
                      } text-2xl transition-all  duration-200 group-hover/inner:bg-primary group-hover/inner:scale-120`}
                    >
                      <RiRobot3Fill
                        className={`${
                          isActive ? "text-white" : "text-primary"
                        } group-hover/inner:text-white `}
                      />
                    </span>
                    <span
                      className="flex h-10 items-center rounded-full pl-2 pr-[42px] text-lg capitalize text-transparent transition-transform duration-200 group-hover/inner:translate-x-[-100%] group-hover/inner:bg-primary group-hover/inner:text-white group-hover/inner:scale-120 group-hover/inner:pr-[48px]
                    "
                    >
                      Beat Bot
                    </span>
                  </div>
                )}
              </NavLink>
              <NavLink to="/integrations">
                {({ isActive }) => (
                  <div
                    className={`group/inner flex w-full  items-center translate-x-3/4 ${
                      isActive ? "animate-bounce" : ""
                    }`}
                  >
                    <span
                      className={`z-10 flex items-center justify-center rounded-full p-2 ${
                        isActive ? "bg-primary " : "bg-muted"
                      } text-2xl transition-all duration-200 group-hover/inner:bg-primary group-hover/inner:scale-120`}
                    >
                      <TbPlugConnected
                        className={`${
                          isActive ? "text-white " : "text-primary"
                        } group-hover/inner:text-white  `}
                      />
                    </span>
                    <span
                      className="flex h-10 items-center rounded-full pl-2 pr-[42px] text-lg capitalize text-transparent transition-transform duration-200 group-hover/inner:translate-x-[-100%] group-hover/inner:bg-primary group-hover/inner:text-white group-hover/inner:scale-120 group-hover/inner:pr-[48px]
                    "
                    >
                      integrations
                    </span>
                  </div>
                )}
              </NavLink>
              <NavLink to="/">
                {({ isActive }) => (
                  <div
                    className={`group/inner flex w-full  items-center translate-x-2/3 ${
                      isActive ? "animate-bounce" : ""
                    }`}
                  >
                    <span
                      className={`z-10 flex items-center justify-center rounded-full p-2 ${
                        isActive ? "bg-primary" : "bg-muted"
                      } text-2xl transition-all  duration-200 group-hover/inner:bg-primary group-hover/inner:scale-120`}
                    >
                      <FaHome
                        className={`${
                          isActive ? "text-white" : "text-primary"
                        } group-hover/inner:text-white`}
                      />
                    </span>
                    <span
                      className="flex h-10 items-center rounded-full pl-2 pr-[42px] text-lg capitalize text-transparent transition-transform duration-200 group-hover/inner:translate-x-[-100%] group-hover/inner:bg-primary group-hover/inner:text-white group-hover/inner:scale-120 group-hover/inner:pr-[48px]
                    "
                    >
                      home
                    </span>
                  </div>
                )}
              </NavLink>
              <NavLink to="/my-profile">
                {({ isActive }) => (
                  <div
                    className={`group/inner flex w-full  items-center translate-x-3/4 ${
                      isActive ? "animate-bounce" : ""
                    }`}
                  >
                    <span
                      className={`z-10 flex items-center justify-center rounded-full p-2 ${
                        isActive ? "bg-primary " : "bg-muted"
                      } text-2xl transition-all duration-200 group-hover/inner:bg-primary group-hover/inner:scale-120`}
                    >
                      <FaUsersCog
                        className={`${
                          isActive ? "text-white " : "text-primary"
                        } group-hover/inner:text-white  `}
                      />
                    </span>
                    <span
                      className="flex h-10 items-center rounded-full pl-2 pr-[42px] text-lg capitalize text-transparent transition-transform duration-200 group-hover/inner:translate-x-[-100%] group-hover/inner:bg-primary group-hover/inner:text-white group-hover/inner:scale-120 group-hover/inner:pr-[48px]
                    "
                    >
                      my profile
                    </span>
                  </div>
                )}
              </NavLink>
              <button
                className="group/inner flex w-full  items-center translate-x-3/4 "
                onClick={logout}
              >
                <span
                  className={`z-10 flex items-center justify-center rounded-full p-2 h-10 w-10  text-2xl transition-all duration-200 group-hover/inner:bg-primary  bg-muted group-hover/inner:scale-120`}
                >
                  <ExitIcon
                    className={"group-hover/inner:text-white text-primary "}
                  />
                </span>{" "}
                <span
                  className="flex h-10 items-center rounded-full pl-2 pr-[42px] text-lg capitalize text-transparent transition-transform duration-200 group-hover/inner:-translate-x-full group-hover/inner:bg-primary group-hover/inner:text-white group-hover/inner:scale-120 group-hover/inner:pr-[48px]
                    "
                >
                  logout
                </span>
              </button>
            </div>
            <Button className="flex items-center mb-1 justify-center w-14 h-14 rounded-full -translate-x-full transition-transform group-hover:rotate-90">
              <MdWindow />
            </Button>
          </div>
        )}
        {user && (
          <button
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="flex justify-start py-1 capitalize  mr-auto sm:hidden"
          >
            <ExitIcon className="mr-2 h-6 w-6" /> Logout
          </button>
        )}
      </div>
    </div>
  );
};
export default Navbar;
