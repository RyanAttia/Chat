
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

// Format a header like "Today", "Yesterday", or "March 27, 2025"

export function formatDateHeader(date) {
  const d = dayjs(date);
  const now = dayjs();

  if (d.isToday()) return "Today";
  if (d.isYesterday()) return "Yesterday";

  // If the year is the same as the current year, omit it
  if (d.year() === now.year()) {
    return d.format("MMMM D");
  }

  // Otherwise, include the year
  return d.format("MMMM D, YYYY");
}

// Format time like "12:34 PM"
export function formatTime(date) {
  return dayjs(date).format("h:mm A");
}

// Optional: group messages by day if needed
export function groupMessagesByDate(messages) {
  const grouped = [];

  let lastDate = null;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const nextMsg = messages[i + 1];

    const msgDate = dayjs(msg.createdAt).format("YYYY-MM-DD");

    // Insert a date divider if the date changes
    if (msgDate !== lastDate) {
      grouped.push({
        type: "divider",
        date: msg.createdAt,
        key: `divider-${msgDate}`,
      });
      lastDate = msgDate;
    }

    // Determine whether to show the time
    const showTime =
      !nextMsg ||
      dayjs(nextMsg.createdAt).diff(dayjs(msg.createdAt), "minute") > 10;

    grouped.push({
      ...msg,
      type: "message",
      key: msg._id,
      showTime,
    });
  }

  return grouped;
}


