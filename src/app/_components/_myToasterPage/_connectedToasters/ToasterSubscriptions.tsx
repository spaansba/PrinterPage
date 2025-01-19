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
          key={index}
          title=""
          description="Daily weather forecasts"
          isEnabled={true}
          settings={[
            {
              label: "Location",
              component: <input type="text" className="border rounded px-2 py-1" />,
            },
            {
              label: "Send Each Day At",
              component: (
                <TimeSelector
                  value="08:00" // Optional initial value
                  onChange={(time) => console.log("New time:", time)}
                />
              ),
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
      ))}
    </div>
  )
}

export default ToasterSubscriptions
