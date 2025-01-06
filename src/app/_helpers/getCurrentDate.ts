export const testRelativeDate = () => {
  console.log(formatDate(new Date(), true)) // "Today"
  console.log(formatDate(new Date(Date.now() - 86400000), true)) // "Yesterday"
  console.log(formatDate(new Date(Date.now() - 86400000 * 3), true)) // "3 days ago"
  console.log(formatDate(new Date(Date.now() - 86400000 * 7), true)) // 1 week ago
  console.log(formatDate(new Date(Date.now() - 86400000 * 8), true)) // regular date
}

export const formatDate = (date: string | Date, relative: boolean) => {
  const dateObj = new Date(date)

  if (relative) {
    const relativeDate = makeDateRelative(dateObj)

    // If the date cant be made relative we just return the usual
    if (relativeDate) return relativeDate
  }

  const day = String(dateObj.getDate()).padStart(2, "0")
  const month = String(dateObj.getMonth() + 1).padStart(2, "0") // Months are 0-based
  const year = dateObj.getFullYear()

  return `${day}/${month}/${year}`
}

const makeDateRelative = (date: Date): string | null => {
  console.log("\nInput date:", date)
  console.log("Input date ISO:", date.toISOString())

  // Get the timezone offset difference between UTC and local
  const tzOffset = new Date().getTimezoneOffset() * 60 * 1000
  console.log("Timezone offset (ms):", tzOffset)

  // Adjust the input date to local time - FIXING THE SIGN
  const localDate = new Date(date.getTime() - tzOffset) // Changed + to -
  console.log("Adjusted local date:", localDate)
  console.log("Local date ISO:", localDate.toISOString())

  const today = new Date()
  console.log("\nCurrent date:", today)

  const diffTime = today.getTime() - localDate.getTime()
  console.log("Time difference (ms):", diffTime)

  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  console.log("Minutes difference:", diffMinutes)
  console.log("Hours difference:", diffHours)
  console.log("Days difference:", diffDays)

  if (diffMinutes === 0) return "Just now"
  if (diffMinutes === 1) return "1 minute ago"
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours === 1) return "1 hour ago"
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
  if (diffDays === 7) return "1 week ago"

  return null
}
