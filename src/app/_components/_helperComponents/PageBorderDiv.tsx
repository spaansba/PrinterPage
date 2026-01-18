import React from "react";

interface PageBorderDivProps {
  children: React.ReactNode;
}

function PageBorderDiv({ children }: PageBorderDivProps) {
  return (
    <div className="border-t border-[1px] bg-toastWhite border-gray-500 flex flex-col relative">
      {children}
    </div>
  );
}

export default PageBorderDiv;
