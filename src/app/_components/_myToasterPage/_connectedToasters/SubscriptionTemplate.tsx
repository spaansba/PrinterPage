import React, { useState } from "react"
import { Calendar } from "lucide-react"
import type { SettingDefinition, Toaster } from "@/app/types/printer"
import TimeSelector from "./TimeSelector"
import { useToasterUser } from "@/app/context/userDataContext"
import {
  updateSubscriptionStatus,
  updateSubSettings,
} from "@/lib/queries/subscriptions/generalSubscription"

type SubscriptionTemplateProps = {
  toaster: Toaster
  title: string
  description: string
  isEnabled: boolean
  subId: string
  settings: SettingDefinition[]
  icon?: React.ReactNode
  iconBgColor?: string
  iconColor?: string
}

const SubscriptionTemplate = ({
  toaster,
  title,
  description,
  subId,
  isEnabled: initialIsEnabled,
  settings: initialSettings,
  icon = <Calendar className="size-6" />,
  iconBgColor = "bg-toastPrimary",
  iconColor = "text-gray-700",
}: SubscriptionTemplateProps) => {
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled)
  const [settings, setSettings] = useState(initialSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const { setPairedToasters } = useToasterUser()

  // TODO zod
  const onToggle = async () => {
    setIsEnabled(!isEnabled)
    setHasChanges(true)
    await updateSubscriptionStatus(toaster.id, subId, !isEnabled ? "active" : "paused")
  }

  const handleSave = async () => {
    const updatedSettings: Record<string, string> = {}

    // Collect all the current values from initialSettings
    settings.forEach((setting) => {
      updatedSettings[setting.label] = setting.userValue || setting.default
    })
    const update = await updateSubSettings(toaster.id, subId, updatedSettings)
    console.log(update)
    if (!update.success || !update.data) {
      return
    }

    setPairedToasters((prev) => {
      return prev.map((findToaster) => {
        if (findToaster.id !== toaster.id) {
          return findToaster
        }

        return {
          ...findToaster,
          subscriptions: findToaster.subscriptions.map((sub) => {
            if (sub.subId !== subId) {
              return sub
            }

            // Create a settings map using the labels as keys
            const settingsMap = Object.fromEntries(
              settings.map((setting) => [setting.label, setting])
            )

            // Update the subscription settings
            const newSettings = { ...sub.settings }
            for (const [key, setting] of Object.entries(settingsMap)) {
              if (newSettings[key]) {
                newSettings[key] = {
                  ...newSettings[key],
                  userValue: setting.userValue || setting.default,
                }
              }
            }

            return {
              ...sub,
              settings: newSettings,
            }
          }),
        }
      })
    })
    setHasChanges(false)
  }

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    settingKey: string
  ) => {
    const value = e.target.type === "checkbox" ? e.target.checked.toString() : e.target.value
    setHasChanges(true)

    setSettings((prev) =>
      prev.map((setting, index) =>
        index.toString() === settingKey ? { ...setting, userValue: value } : setting
      )
    )
  }
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
      {isEnabled && (
        <div className="mt-3">
          {Object.entries(settings).map(([key, setting]) => (
            <div key={`${key}-${setting.label}`} className="text-sm text-gray-600 gap-2">
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
                          onChange={(e) => handleOnChange(e, key)}
                        />
                      )
                    case "number":
                      return (
                        <input
                          type="number"
                          value={setting.userValue || setting.default}
                          className="border rounded-sm px-2 py-1 text-gray-900"
                          onChange={(e) => handleOnChange(e, key)}
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
                          onChange={(e) => handleOnChange(e, key)}
                        />
                      )
                    case "select":
                      return (
                        <select
                          value={setting.userValue || setting.default}
                          className="border rounded-sm px-2 py-1 text-gray-900"
                          onChange={(e) => handleOnChange(e, key)}
                        >
                          {setting.selectOptions?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )
                    case "time":
                      return (
                        <TimeSelector value={setting.userValue || setting.default || "08:00"} />
                      )
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
      )}
    </div>
  )
}

export default SubscriptionTemplate
