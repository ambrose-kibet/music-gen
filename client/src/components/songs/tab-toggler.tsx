const ToggleTabs: React.FC<{
  value: "simple" | "custom";
  handleChange: (value: "simple" | "custom") => void;
}> = ({ value, handleChange }) => {
  return (
    <div className="flex justify-center space-x-2  w-fit mx-auto rounded-full shadow">
      <button
        onClick={() => handleChange("simple")}
        className={`px-4 py-1 rounded-full tracking-widest shadow transition-all duration-200   fade-in ${
          value === "simple"
            ? "bg-primary text-white shadow shadow-primary"
            : "bg-transparent text-primary"
        }`}
      >
        Simple
      </button>
      <button
        onClick={() => handleChange("custom")}
        className={`px-4 py-1 rounded-full tracking-widest shadow transition-all duration-200  fade-in ${
          value === "custom"
            ? "bg-primary text-white shadow shadow-primary"
            : "bg-transparent text-primary"
        }`}
      >
        Custom
      </button>
    </div>
  );
};
export default ToggleTabs;
