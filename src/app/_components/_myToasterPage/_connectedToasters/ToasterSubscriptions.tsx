import type { Toaster } from "@/app/types/printer"
import React from "react"
import SubscriptionTemplate from "./SubscriptionTemplate"
import TimeSelector from "./TimeSelector"
import WeatherSubscription from "./WeatherSubscription"

type ToasterSubscriptionsProps = {
  toaster: Toaster
}

function ToasterSubscriptions({ toaster }: ToasterSubscriptionsProps) {
  console.log(toaster.subscriptions)
  return (
    <div>
      <div className="flex items-center gap-3 w-full">
        <div className="text-sm font-medium text-gray-700">Toaster Subscriptions</div>
        <div className="h-px  flex-grow" />
      </div>
      {toaster.subscriptions.map((sub, index) => (
        <SubscriptionTemplate
          key={sub.description + index}
          title={sub.title}
          description={sub.description}
          isEnabled={sub.status == "active"}
          settings={Object.entries(sub.settings).map(([key, setting]) => ({
            label: setting.label,
            component: setting.component,
            default: setting.default,
            select_options: setting.select_options,
          }))}
        />
      ))}
    </div>
  )
}

export default ToasterSubscriptions
