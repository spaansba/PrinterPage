import type { Toaster } from "@/app/types/printer"
import React from "react"
import SubscriptionTemplate from "./SubscriptionTemplate"
import TimeSelector from "./TimeSelector"
import WeatherSubscription from "./WeatherSubscription"

type ToasterSubscriptionsProps = {
  toaster: Toaster
}

function ToasterSubscriptions({ toaster }: ToasterSubscriptionsProps) {
  return (
    <div>
      <div className="flex items-center gap-3 w-full">
        <div className="text-sm font-medium text-gray-700">Toaster Subscriptions</div>
        <div className="h-px  flex-grow" />
      </div>
      <WeatherSubscription toaster={toaster} />
    </div>
  )
}

export default ToasterSubscriptions
