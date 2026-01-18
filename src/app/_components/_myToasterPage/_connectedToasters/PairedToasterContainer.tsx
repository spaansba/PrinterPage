import type { Toaster } from "@/app/types/printer";
import PairedUserList from "./PairedUserList";
import ToasterInformation from "./ToasterInformation";
import ToasterSubscriptions from "./ToasterSubscriptions";

type PairedToasterContainerProps = {
  toaster: Toaster;
};

function PairedToasterContainer({ toaster }: PairedToasterContainerProps) {
  return (
    <div className="[&:not(:last-child)]:border-b-2 [&:not(:last-child)]:border-gray-300 p-4 ">
      <div className="flex flex-col gap-4">
        <ToasterInformation toaster={toaster} />
        <div className="w-full h-px my-1 bg-gray-500" />
        <PairedUserList toaster={toaster} />
        <div className="w-full h-px my-1 bg-gray-500" />
        <ToasterSubscriptions toaster={toaster} />
      </div>
    </div>
  );
}

export default PairedToasterContainer;
