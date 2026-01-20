import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BackButton: React.FC<{
  backButtonLabel: string;
  backButtonHref: string;
}> = ({ backButtonHref, backButtonLabel }) => {
  return (
    <div className="flex w-full items-center justify-center">
      <Button asChild variant={"link"} className="font-normal">
        <Link to={backButtonHref}>{backButtonLabel}</Link>
      </Button>
    </div>
  );
};
export default BackButton;
