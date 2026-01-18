import type { Toaster } from "@/app/types/printer";
import React from "react";
import SubscriptionTemplate from "./SubscriptionTemplate";
import { CloudSun, Home, Smile } from "lucide-react";

type ToasterSubscriptionsProps = {
  toaster: Toaster;
};

function ToasterSubscriptions({ toaster }: ToasterSubscriptionsProps) {
  //TODO set icons in database
  const getIcon = (subTitle: string) => {
    switch (subTitle) {
      case "Weather":
        return <CloudSun className="size-6" />;
      case "Dad Jokes":
        return <Smile className="size-6" />;
      default:
        return <Home className="size-6" />;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 w-full">
        <div className="text-sm font-bold text-gray-700">
          Toaster Subscriptions
        </div>
        <div className="h-px flex-grow" />
      </div>
      {toaster.subscriptions.map((sub, index) => (
        <SubscriptionTemplate
          key={sub.description + index}
          toaster={toaster}
          title={sub.title}
          description={sub.description}
          isEnabled={sub.status == "active"}
          subId={sub.subId}
          sendTime={sub.sendTime}
          icon={getIcon(sub.title)}
          settings={Object.entries(sub.settings).map(([, setting]) => ({
            label: setting.label,
            component: setting.component,
            default: setting.default,
            selectOptions: setting.selectOptions,
            userValue: setting.userValue,
          }))}
        />
      ))}
    </div>
  );
}

export default ToasterSubscriptions;
