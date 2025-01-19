import React, { useState } from "react"

type TimeSelectorProps = {
  value?: string // in format "HH:mm"
  onChange?: (time: string) => void
  className?: string
}

const TimeSelector = ({ value, onChange, className = "" }: TimeSelectorProps) => {
  // Parse initial value or use defaults
  const [hour, setHour] = useState(value ? value.split(":")[0] : "00")
  const [minute, setMinute] = useState(value ? value.split(":")[1] : "00")

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value
    setHour(newHour)
    onChange?.(`${newHour}:${minute}`)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value
    setMinute(newMinute)
    onChange?.(`${hour}:${newMinute}`)
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <select className="border rounded px-2 py-1 w-16" value={hour} onChange={handleHourChange}>
        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
          <option key={h} value={h.toString().padStart(2, "0")}>
            {h.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
      <span>:</span>
      <select
        className="border rounded px-2 py-1 w-16"
        value={minute}
        onChange={handleMinuteChange}
      >
        {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
          <option key={m} value={m.toString().padStart(2, "0")}>
            {m.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  )
}

export default TimeSelector
