import React from "react"
import { Calendar } from "lucide-react"

type Setting = {
  label: string
  component: React.ReactNode
}

type SubscriptionTemplateProps = {
  title: string
  description: string
  isEnabled: boolean
  settings?: Setting[]
  icon?: React.ReactNode
  iconBgColor?: string
  iconColor?: string
}

const SubscriptionTemplate = ({
  title,
  description,
  isEnabled,
  settings = [],
  icon = <Calendar className="size-6" />,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-700",
}: SubscriptionTemplateProps) => {
  const onToggle = () => {}
  return (
    <div className="mt-3 bg-toastWhite border border-gray-300 rounded-sm p-3">
      {/* Title row with icon and enable checkbox */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="pt-1">
            <div
              className={`relative size-12 flex-shrink-0 ${iconBgColor} rounded-sm flex items-center justify-center`}
            >
              <div className={iconColor}>{icon}</div>
            </div>
          </div>

          {/* Title and description */}
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => onToggle()}
          className="size-4 accent-gray-600 cursor-pointer mt-1"
        />
      </div>

      {settings.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {settings.map((setting, index) => (
            <div key={index} className="text-sm text-gray-600">
              <span className="">{setting.label}:</span>
              <div className="mt-1">{setting.component}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubscriptionTemplate
