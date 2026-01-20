import { Button } from "./ui/button";

const LandingPageComponent: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative bg-[url('/src/assets/landing-sm.png')] lg:bg-[url('/src/assets/landing.png')] bg-cover bg-center">
      <div className="w-96 h-96  lg:w-128 lg:h-128   bg-black  rounded-full animate-[spin_2s_linear_infinite] transition-all duration-500  hidden absolute top-0 left-0 lg:-translate-x-1/2 lg:-translate-y-1/4 lg:flex items-center justify-center">
        <div className=" w-64 h-64 lg:w-96 lg:h-96 border border-transparent border-r-2 border-r-gray-700   rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className=" w-16 h-16 lg:w-32 lg:h-32 bg-primary rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-background rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </div>
      <h1 className="text-4xl text-center font-bold text-Primary">
        Welcome to
      </h1>
      <h1 className="text-4xl font-bold text-Primary mb-4">Music Gen</h1>
      <p className="text-lgmb-8 text-center px-4 mb-4">
        Create music effortlessly with our AI-powered platform.
      </p>
      <Button className="text-white rounded-full">Get Started</Button>
    </div>
  );
};
export default LandingPageComponent;
