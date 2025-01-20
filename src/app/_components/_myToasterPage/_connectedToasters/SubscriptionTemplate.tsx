import React, { useState } from "react"
import { Calendar } from "lucide-react"
import type { SettingDefinition, Toaster } from "@/app/types/printer"
import TimeSelector from "./TimeSelector"
import { useToasterUser } from "@/app/context/userDataContext"

type SubscriptionTemplateProps = {
  toaster: Toaster
  title: string
  description: string
  isEnabled: boolean
  settings: SettingDefinition[]
  icon?: React.ReactNode
  iconBgColor?: string
  iconColor?: string
}

const SubscriptionTemplate = ({
  toaster,
  title,
  description,
  isEnabled: initialIsEnabled,
  settings: initialSettings,
  icon = <Calendar className="size-6" />,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-700",
}: SubscriptionTemplateProps) => {
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled)
  const [hasChanges, setHasChanges] = useState(true)
  const { pairedToasters, setPairedToasters } = useToasterUser()
  const onToggle = () => {
    setIsEnabled(!isEnabled)
    setHasChanges(true)
  }

  const handleSave = () => {
    setPairedToasters((prev) => {
      console.log("paired toastes", prev)
      const printer = prev.find((findToaster) => {
        return findToaster.id === toaster.id
      })
      console.log("printer", printer)
      return [...prev]
    })
  }
  const handleOnChange = () => {}
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
          onChange={onToggle}
          className="size-4 accent-gray-600 cursor-pointer mt-1"
        />
      </div>

      {initialSettings.map((setting, index) => (
        <div key={index} className="text-sm text-gray-600 gap-2">
          <span className="min-w-32">{setting.label}:</span>
          <div className="mt-1 mb-2">
            {(() => {
              switch (setting.component) {
                case "string":
                  return (
                    <input
                      type="text"
                      value={setting.userValue || setting.default}
                      className="border rounded-sm px-2 py-1 text-gray-900"
                      onChange={handleOnChange}
                    />
                  )
                case "number":
                  return (
                    <input
                      type="number"
                      value={setting.userValue || setting.default}
                      className="border rounded-sm px-2 py-1 text-gray-900"
                      onChange={handleOnChange}
                    />
                  )
                case "boolean":
                  return (
                    <input
                      type="checkbox"
                      checked={
                        setting.userValue
                          ? setting.userValue === "true"
                          : setting.default === "true"
                      }
                      className="size-4 accent-gray-600 cursor-pointer"
                      onChange={handleOnChange}
                    />
                  )
                case "select":
                  return (
                    <select
                      value={setting.userValue || setting.default}
                      className="border rounded-sm px-2 py-1 text-gray-900"
                      onChange={handleOnChange}
                    >
                      {setting.selectOptions?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )
                case "time":
                  return <TimeSelector value={setting.userValue || setting.default || "08:00"} />
                default:
                  return null
              }
            })()}
          </div>
        </div>
      ))}

      {/* Save Button */}
      {hasChanges && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleSave}
            className="bg-toastTertiary text-white px-4 py-2 md:hover:opacity-80"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}

export default SubscriptionTemplate
