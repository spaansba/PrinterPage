import type { Toaster } from "@/app/types/printer"
import React from "react"
import SubscriptionTemplate from "./SubscriptionTemplate"
import { Calendar, Star } from "lucide-react"

type ToasterSubscriptionsProps = {
  toaster: Toaster
}

function ToasterSubscriptions({ toaster }: ToasterSubscriptionsProps) {
  function setWeatherEnabled() {}
  return (
    <div>
      <div className="flex items-center gap-3 w-full">
        <div className="text-sm font-medium text-gray-700">Toaster Subscriptions</div>
        <div className="h-px  flex-grow" />
      </div>
      <SubscriptionTemplate
        title="Weather Updates"
        description="Daily weather forecasts"
        isEnabled={true}
        onToggle={setWeatherEnabled}
        settings={[
          {
            label: "Location",
            component: <input type="text" className="border rounded px-2 py-1" />,
          },
          {
            label: "Temperature Unit",
            component: (
              <select className="border rounded px-2 py-1">
                <option value="c">Celsius</option>
                <option value="f">Fahrenheit</option>
              </select>
            ),
          },
        ]}
      />
    </div>
  )
}

export default ToasterSubscriptions
