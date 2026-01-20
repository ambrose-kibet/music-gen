import customAxios from "@/lib/axios-config";
import type { BotResponse, PromptDetails } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { PiRobotFill } from "react-icons/pi";
import { TbRobotOff } from "react-icons/tb";
import { FaGears } from "react-icons/fa6";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import CreateAgentForm from "@/components/agents/create-agent-form";
import MySongsComponent from "@/components/songs/my-songs";

const MyAgentPage: React.FC = () => {
  const params = useParams();
  const agentId = params.agentId;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user-bot", agentId],
    queryFn: async () => {
      const response = await customAxios.get<BotResponse>(`/bots/${agentId}`);
      return response.data;
    },
  });
  if (isLoading) {
    return <div>Loading agent details...</div>;
  }
  if (isError) {
    return (
      <div>
        Error loading agent details:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start px-2 py-2">
      <div className="w-full max-w-2xl gap-y-6 flex flex-col">
        <h1 className="text-2xl text-center font-bold capitalize text-primary">
          {data?.name}
        </h1>
        <div className="w-full  flex items-center justify-between gap-4 md:gap-6 mb-4">
          <div className="flex items-center gap-2 bg-muted rounded-full p-2 hidden md:flex">
            {data?.isActive ? (
              <PiRobotFill className="h-32 w-32 text-primary" />
            ) : (
              <TbRobotOff className="h-32 w-32 text-destructive" />
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{data?.description}</p>
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className=" cursor-pointer">
                  <FaGears /> Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 sm:w-96" sideOffset={-100}>
                <CreateAgentForm
                  defaultValues={{
                    title: data?.name || "",
                    description: data?.description || "",
                    frequency: data?.frequency,
                    promptDetails: JSON.parse(
                      data?.requests || "[]"
                    ) as PromptDetails[],
                    isActive: data?.isActive,
                  }}
                  isEditMode={true}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-center capitalize text-primary mt-2">
        Bot Songs
      </h2>
      <MySongsComponent botId={agentId} />
    </div>
  );
};
export default MyAgentPage;
