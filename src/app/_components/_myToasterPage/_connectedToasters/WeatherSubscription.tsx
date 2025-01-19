import React from "react"
import SubscriptionTemplate from "./SubscriptionTemplate"
import TimeSelector from "./TimeSelector"
import type { Toaster } from "@/app/types/printer"

type ToasterSubscriptionsProps = {
  toaster: Toaster
}

function WeatherSubscription({ toaster }: ToasterSubscriptionsProps) {
  console.log(toaster.subscriptions)
  function setWeatherEnabled() {}
  return (
    <SubscriptionTemplate
      title="Weather"
      description="Daily weather forecasts"
      isEnabled={true}
      onToggle={setWeatherEnabled}
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
  )
}

export default WeatherSubscription
