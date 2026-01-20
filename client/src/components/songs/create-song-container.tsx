import CustomCreateSongForm from "./custom-create-song-form";
import SimpleCreateSongForm from "./simple-create-song-form";
import ToggleTabs from "./tab-toggler";
import { useState } from "react";

const CreateSongContainer: React.FC = () => {
  const [tab, setTab] = useState<"simple" | "custom">("simple");

  return (
    <div className="p-4  grid grid-cols-1 gap-4  ">
      <ToggleTabs value={tab} handleChange={setTab} />
      {tab === "simple" ? <SimpleCreateSongForm /> : <CustomCreateSongForm />}
    </div>
  );
};
export default CreateSongContainer;
