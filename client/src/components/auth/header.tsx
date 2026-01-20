import Logo from "@/components/logo";

const Header: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div className={"w-full space-y-4"}>
      <div className="flex items-center justify-center">
        <Logo />
      </div>
      <p className="text-center text-sm capitalize text-muted-foreground">
        {label}
      </p>
    </div>
  );
};
export default Header;
