import React, { useState } from "react"

type TimeSelectorProps = {
  value: string // in format "HH:mm"
  onChange?: (time: string) => void
  className?: string
}

const utcToLocal = (utcTime: string): string => {
  const [hours, minutes] = utcTime.split(":")
  const date = new Date()
  date.setUTCHours(parseInt(hours), parseInt(minutes))
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
}

const localToUtc = (localTime: string): string => {
  const [hours, minutes] = localTime.split(":")
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))
  return `${date.getUTCHours().toString().padStart(2, "0")}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`
}

const TimeSelector = ({ value, onChange, className = "" }: TimeSelectorProps) => {
  // Parse initial value or use defaults
  const localTime = value ? utcToLocal(value) : "00:00"
  const [hour, setHour] = useState(localTime ? localTime.split(":")[0] : "00")
  const [minute, setMinute] = useState(localTime ? localTime.split(":")[1] : "00")

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value
    setHour(newHour)
    const newLocalTime = `${newHour}:${minute}`
    const newUtcTime = localToUtc(newLocalTime)
    onChange?.(newUtcTime)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value
    setMinute(newMinute)
    const newLocalTime = `${hour}:${newMinute}`
    const newUtcTime = localToUtc(newLocalTime)
    onChange?.(newUtcTime)
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <select
        className="border bg-white rounded px-2 py-1 w-16"
        value={hour}
        onChange={handleHourChange}
      >
        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
          <option key={h} value={h.toString().padStart(2, "0")}>
            {h.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
      <span>:</span>
      <select
        className="border bg-white rounded px-2 py-1 w-16"
        value={minute}
        onChange={handleMinuteChange}
      >
        {Array.from({ length: 6 }, (_, i) => i * 10).map((m) => (
          <option key={m} value={m.toString().padStart(2, "0")}>
            {m.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  )
}

export default TimeSelector
