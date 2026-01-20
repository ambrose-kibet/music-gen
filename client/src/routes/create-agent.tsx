import CreateAgentForm from "@/components/agents/create-agent-form";

const CreateAgent: React.FC = () => {
  return (
    <div className="w-full  flex flex-col items-center justify-start px-2 py-8 mb-2 ">
      <div className="text-center mb-4  h-fit w-[min(90vw,430px)] bg-card p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-center text-primary">
          Create New Bot
        </h2>
        <CreateAgentForm />
      </div>
    </div>
  );
};
export default CreateAgent;
