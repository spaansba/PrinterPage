import { SignInButton } from "@clerk/nextjs";
import React from "react";
import Image from "next/image";

function NotSignedInPage() {
  return (
    <SignInButton>
      <div className="w-[288px] p-2 bg-toastPrimary">
        <button className="w-full justify-center flex items-center gap-3 py-2 px-3 bg-toastPrimary border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
          <div className="w-8 h-8 relative">
            <Image
              src="/images/Logo512.png"
              alt="Toaster"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-sans text-black text-base">
            Login to Toaster
          </span>
        </button>
      </div>
    </SignInButton>
  );
}

export default NotSignedInPage;
