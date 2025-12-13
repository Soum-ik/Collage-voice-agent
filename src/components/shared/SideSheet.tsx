import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import showToast from "@/src/hooks/customToast";
import { Check, CornerRightDown } from "lucide-react";
import { useState } from "react";
import { IoIosSettings } from "react-icons/io";

const SideSheet = () => {
  interface VoiceModel {
    id: number;
    style: string;
    sex: "Male" | "Female";
    description?: string; // Optional: helps identify the tone
  }

  const [voiceStyles, setVoiceStyles] = useState<VoiceModel[]>([
    {
      id: 1,
      style: "Despina",
      sex: "Female",
      description: "Mischievous & Witty",
    },
    {
      id: 2,
      style: "Puck",
      sex: "Male",
      description: "Mischievous & Witty",
    },
    {
      id: 3,
      style: "Charon",
      sex: "Male",
      description: "Deep & Authoritative",
    },
    {
      id: 4,
      style: "Kore",
      sex: "Female",
      description: "Relaxed & Soothing",
    },
    {
      id: 5,
      style: "Fenrir",
      sex: "Male",
      description: "Big & Booming",
    },
    {
      id: 6,
      style: "Aoede",
      sex: "Female",
      description: "Bright & Enthusiastic",
    },
  ]);

  const [activeVoice, setActiveVoice] = useState<string>(
    localStorage.getItem("voiceStyle") || "Despina"
  );

  console.log(activeVoice);

  const setActiveVoiceStyle = (style: string) => {
    setActiveVoice(style);
    localStorage.setItem("voiceStyle", style);
    showToast(
      "Voice style updated",
      `Current style: ${style}, if the agent is active, please restart the session to apply changes.`
    );
  };

  return (
    <div>
      <Sheet>
        <SheetTrigger className="cursor-pointer">
          <IoIosSettings size={24} />
        </SheetTrigger>
        <SheetContent className="bg-black border border-gray-800 m-2 rounded-lg ">
          <SheetHeader className="border-b border-b-gray-800">
            <SheetTitle className="text-white">Agent Settings</SheetTitle>
          </SheetHeader>
          {/* Voice  Styles */}
          <div className="p-4">
            <h1 className="text-base">Voice Styles</h1>
            <div className="space-y-2 pt-4">
              {voiceStyles.map((model) => (
                <>
                  <button
                    key={model.id}
                    className={`hover:text-blue-600  rounded-lg flex items-center gap-2 w-full text-xs cursor-pointer transition-colors duration-200 font-bold ${
                      activeVoice === model?.style
                        ? "text-blue-600"
                        : "text-white"
                    }`}
                    onClick={() => setActiveVoiceStyle(model.style)}
                  >
                    <Check size={16} /> {model.style}{" "}
                    <span className="font-thin">({model.sex})</span>
                  </button>
                </>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SideSheet;
