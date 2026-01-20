import { Button } from "@/components/ui/button";

const ToggleAuth: React.FC<{
  isLogin: boolean;
  toggleAuth: () => void;
}> = ({ isLogin, toggleAuth }) => {
  return (
    <div className="flex w-full items-center justify-center">
      <Button
        variant={"link"}
        className="font-normal"
        onClick={() => toggleAuth()}
      >
        {isLogin ? "Create an account?" : "Already have an account? "}
      </Button>
    </div>
  );
};
export default ToggleAuth;
