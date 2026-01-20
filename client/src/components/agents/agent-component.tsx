import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiRobotFill } from "react-icons/pi";
import { MdExitToApp } from "react-icons/md";
import { TbRobotOff } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const AgentComponent: React.FC<{
  id: string;
  title?: string;
  description?: string;
  isDisabled?: boolean;
}> = ({
  id,
  title = "Beat Bot",
  description = "Generates beats based on prompts.",
  isDisabled = false,
}) => {
  const navigate = useNavigate();
  const handleView = () => navigate(`/my-agents/${id}`);

  return (
    <Card className="max-w-xs min-w-[250px]">
      <CardHeader>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          {isDisabled ? (
            <TbRobotOff className="h-11 w-11 text-destructive" />
          ) : (
            <PiRobotFill className="h-11 w-11 text-primary" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-center mb-2 text-primary">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          onClick={handleView}
          className="rounded-full justify-center mx-auto"
        >
          <MdExitToApp className="mr-1" /> View Bot
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentComponent;
