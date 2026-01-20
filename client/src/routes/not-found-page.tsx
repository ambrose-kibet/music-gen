import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import BackButton from "@/components/auth/back-button";
import Header from "@/components/auth/header";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-w-screen flex min-h-screen flex-col items-center justify-center px-2">
      <Card className=" w-full max-w-[400px]">
        <CardHeader>
          <Header label="Page Not Found" />
        </CardHeader>
        <CardFooter>
          <BackButton backButtonHref="/" backButtonLabel="Back to home" />
        </CardFooter>
      </Card>
    </div>
  );
};
export default NotFoundPage;
