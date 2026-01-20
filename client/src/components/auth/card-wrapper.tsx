import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Header from "@/components/auth/header";
import Socials from "@/components/auth/socials";
import BackButton from "./back-button";

const CardWrapper: React.FC<{
  children: React.ReactNode;
  toggleAuth?: React.ReactNode;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonLink?: string;
  showSocials?: boolean;
}> = ({
  backButtonLabel,
  backButtonLink,
  headerLabel,
  children,
  showSocials,
  toggleAuth,
}) => {
  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocials && (
        <CardFooter>
          <Socials />
        </CardFooter>
      )}
      {backButtonLabel && backButtonLink && (
        <CardFooter>
          <BackButton
            backButtonLabel={backButtonLabel}
            backButtonHref={backButtonLink}
          />
        </CardFooter>
      )}
      {toggleAuth && <CardFooter>{toggleAuth}</CardFooter>}
    </Card>
  );
};
export default CardWrapper;
