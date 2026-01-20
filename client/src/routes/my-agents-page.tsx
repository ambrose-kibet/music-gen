import AgentComponent from "@/components/agents/agent-component";
import customAxios from "@/lib/axios-config";
import type { MyBot } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const MyAgentsPage: React.FC = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["user-bots"],
    queryFn: async () => {
      const response = await customAxios.get<MyBot[]>("/bots");
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Loading your agents...</div>;
  }

  if (error) {
    const errorMessage =
      error instanceof AxiosError
        ? error?.response?.data.message || error.message
        : "An unexpected error occurred.";
    return <div>Error: {errorMessage}</div>;
  }
  return (
    <div className="w-full flex flex-col items-center justify-start px-2 py-8">
      <div className="w-full flex flex-wrap gap-3 justify-center max-w-5xl">
        {data?.map((bot) => (
          <AgentComponent
            key={bot.id}
            id={bot.id}
            title={bot.name}
            description={bot.description}
            isDisabled={!bot.isActive}
          />
        ))}
      </div>
    </div>
  );
};
export default MyAgentsPage;
