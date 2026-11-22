/**
 * Pure helpers for the Skylight wall. No DOM, so the rules can be tested
 * and the card can stay a thin view. Keep chore streak math here — the
 * Home Assistant script only stores the numbers this module computes.
 */

export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const MEALS = ["breakfast", "lunch", "dinner"];
export const MEMBER_IDS = ["p1", "p2", "p3", "p4"];

export function safeColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || "")) ? value : "#7d8b96";
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const text = String(value).trim();
  if (!text || text.startsWith("unknown") || text.startsWith("unavailable")) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [y, m, d] = text.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function sameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function addDays(date, days) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfDay(date) {
  const next = new Date(date.getTime());
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isoWeekKey(date) {
  const d = startOfDay(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((d - firstThursday) / 604800000);
  return d.getFullYear() * 100 + week;
}

export function startOfWeek(date, weekStart) {
  const d = startOfDay(date);
  const want = weekStart === "sunday" ? 0 : 1;
  const delta = (d.getDay() - want + 7) % 7;
  return addDays(d, -delta);
}

export function dayKey(date) {
  return DAY_KEYS[date.getDay()];
}

export function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseHHMM(value) {
  const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function minutesNow(date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function inSleepWindow(now, start, end, enabled) {
  if (!enabled) return false;
  const cur = minutesNow(now);
  const s = parseHHMM(start);
  const e = parseHHMM(end);
  if (s == null || e == null || s === e) return false;
  if (s < e) return cur >= s && cur < e;
  return cur >= s || cur < e;
}

/** 0–1 darkness over the 30 minutes before sleep starts. */
export function dimAmount(now, start, enabled) {
  if (!enabled) return 0;
  const s = parseHHMM(start);
  if (s == null) return 0;
  const cur = minutesNow(now);
  let delta = s - cur;
  if (delta < 0) delta += 1440;
  if (delta === 0 || delta > 30) return 0;
  return (30 - delta) / 30;
}

export function neverDone(date) {
  return !date || date.getFullYear() < 2001;
}

export function choreView(lastDone, cadence, storedStreak, today) {
  const last = parseDate(lastDone);
  const streak = Number(storedStreak) || 0;
  if (cadence === "weekly") {
    const done = !neverDone(last) && isoWeekKey(last) === isoWeekKey(today);
    const lastWeek = isoWeekKey(addDays(startOfWeek(today, "monday"), -1));
    const fresh = !neverDone(last) && (isoWeekKey(last) === isoWeekKey(today) || isoWeekKey(last) === lastWeek);
    return { done, streak: fresh ? streak : 0 };
  }
  const done = !neverDone(last) && sameDay(last, today);
  const fresh = !neverDone(last) && (sameDay(last, today) || sameDay(last, addDays(today, -1)));
  return { done, streak: fresh ? streak : 0 };
}

export function streakAfterComplete(lastDone, cadence, storedStreak, today) {
  const last = parseDate(lastDone);
  const streak = Number(storedStreak) || 0;
  if (cadence === "weekly") {
    if (neverDone(last)) return 1;
    if (isoWeekKey(last) === isoWeekKey(today)) return Math.max(streak, 1);
    const lastWeek = isoWeekKey(addDays(startOfWeek(today, "monday"), -1));
    if (isoWeekKey(last) === lastWeek) return streak + 1;
    return 1;
  }
  if (neverDone(last)) return 1;
  if (sameDay(last, today)) return Math.max(streak, 1);
  if (sameDay(last, addDays(today, -1))) return streak + 1;
  return 1;
}

export function mealEntityId(day, meal) {
  return `input_text.skylight_meal_${day}_${meal}`;
}

export function doneEntityId(person, slot) {
  return `input_datetime.skylight_${person}_c${slot}_done`;
}

export function streakEntityId(person, slot) {
  return `counter.skylight_${person}_c${slot}_streak`;
}

export function starsEntityId(person) {
  return `counter.skylight_${person}_stars`;
}

export function rewardsEntityId(person) {
  return `input_text.skylight_${person}_rewards`;
}

export function validPerson(person) {
  return MEMBER_IDS.includes(person);
}

export function validSlot(slot) {
  const n = Number(slot);
  return Number.isInteger(n) && n >= 1 && n <= 8;
}

export function greeting(date) {
  const h = date.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function formatTime(date, withMinutes = true) {
  let h = date.getHours();
  const m = date.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  if (!withMinutes || m === 0) return `${h} ${ap}`;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}

export function formatClock(date) {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function weekdayName(date, width = "long") {
  return date.toLocaleDateString(undefined, { weekday: width });
}

export function monthDay(date) {
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

export function countdownLabel(target, now) {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return "Now";
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `in ${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) return rem ? `in ${hours}h ${rem}m` : `in ${hours}h`;
  const days = Math.round(mins / 1440);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

export function countdownParts(target, now) {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const total = Math.round(ms / 60000);
  return {
    hours: Math.floor(total / 60),
    minutes: total % 60,
    label: countdownLabel(target, now),
  };
}

const WEATHER_EMOJI = {
  sunny: "☀️",
  clear: "☀️",
  "clear-night": "🌙",
  "sunny-night": "🌙",
  partlycloudy: "⛅",
  "partly-cloudy": "⛅",
  cloudy: "☁️",
  overcast: "☁️",
  rainy: "🌧️",
  rain: "🌧️",
  pouring: "🌧️",
  lightning: "⛈️",
  "lightning-rainy": "⛈️",
  snowy: "❄️",
  snow: "❄️",
  "snowy-rainy": "🌨️",
  fog: "🌫️",
  windy: "💨",
  "windy-variant": "💨",
  hail: "🧊",
  exceptional: "⚠️",
};

export function weatherEmoji(condition) {
  return WEATHER_EMOJI[String(condition || "").toLowerCase()] || "🌡️";
}

const WEATHER_LABELS = {
  partlycloudy: "Partly cloudy",
  "partly-cloudy": "Partly cloudy",
  sunny: "Sunny",
  clear: "Clear",
  "clear-night": "Clear night",
  cloudy: "Cloudy",
  rainy: "Rain",
  pouring: "Heavy rain",
  lightning: "Storms",
  "lightning-rainy": "Storms",
  snowy: "Snow",
  fog: "Fog",
  windy: "Windy",
};

export function weatherLabel(condition) {
  const key = String(condition || "").toLowerCase();
  if (!key) return "Weather";
  if (WEATHER_LABELS[key]) return WEATHER_LABELS[key];
  const text = key.replace(/[-_]/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function normalizeEvent(raw, meta) {
  const startRaw = raw.start;
  const endRaw = raw.end;
  const allDay = typeof startRaw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(startRaw);
  const start = allDay ? parseDate(startRaw) : parseDate(startRaw);
  let end = endRaw ? parseDate(endRaw) : null;
  if (allDay && end) end = addDays(end, -1);
  return {
    summary: raw.summary || raw.title || "Busy",
    description: raw.description || "",
    location: raw.location || "",
    start,
    end,
    allDay,
    calendarId: meta.id,
    calendarName: meta.name,
    color: meta.color,
    avatar: meta.avatar,
    birthday: meta.id === "birthdays" || /birthday/i.test(raw.summary || ""),
  };
}

export function nextUp(events, now) {
  const timed = events
    .filter((event) => event.start && !event.allDay && event.start.getTime() >= now.getTime() - 60000)
    .slice()
    .sort((a, b) => a.start - b.start);
  const laterToday = timed.find((event) => sameDay(event.start, now) && event.start >= now);
  if (laterToday) return { event: laterToday, when: "today" };
  const upcoming = timed[0];
  if (upcoming) {
    const tomorrow = addDays(startOfDay(now), 1);
    return { event: upcoming, when: sameDay(upcoming.start, tomorrow) ? "tomorrow" : "later" };
  }
  const allDay = events.find((event) => event.allDay && event.start && sameDay(event.start, now));
  if (allDay) return { event: allDay, when: "allday" };
  return null;
}

export function soonestBirthday(events, now) {
  const today = startOfDay(now);
  return events
    .filter((event) => event.birthday && event.start)
    .map((event) => {
      const next = new Date(today.getFullYear(), event.start.getMonth(), event.start.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return { event, next };
    })
    .sort((a, b) => a.next - b.next)[0] || null;
}

export function eventsOnDay(events, day) {
  return events
    .filter((event) => {
      if (!event.start) return false;
      if (event.allDay) {
        const end = event.end || event.start;
        return startOfDay(event.start) <= startOfDay(day) && startOfDay(day) <= startOfDay(end);
      }
      return sameDay(event.start, day);
    })
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return a.start - b.start;
    });
}

export function filterVisible(events, hiddenIds) {
  const hidden = new Set(hiddenIds);
  return events.filter((event) => !hidden.has(event.calendarId));
}

export function isShown(filterState) {
  return filterState !== "^$";
}

export function capitalizeFirst(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function clampStars(current, delta) {
  return Math.max(0, (Number(current) || 0) + (Number(delta) || 0));
}

export function parseRewardLog(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function appendRewardLog(previous, rewardName, when) {
  const stamp = `${when.getMonth() + 1}/${when.getDate()}`;
  const line = `${stamp} ${rewardName}`;
  return [line, ...parseRewardLog(previous)].join("\n").slice(0, 240);
}

export function monthGrid(anchor, weekStart) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first, weekStart);
  const days = [];
  for (let i = 0; i < 42; i += 1) days.push(addDays(start, i));
  return days;
}

export function householdCalendars(household) {
  const people = (household.members || []).map((member) => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    color: member.color,
    entity: member.calendar,
    filter_entity: member.filter_entity,
    toggle_script: member.toggle_script,
    kind: "person",
  }));
  const extras = (household.calendars || []).map((calendar) => ({ ...calendar, kind: "extra" }));
  return [...people, ...extras].filter((calendar) => calendar.entity);
}

export function activeChores(household) {
  return (household.chores || []).filter((chore) => chore && String(chore.name || "").trim() && validPerson(chore.person) && validSlot(Number(chore.slot)));
}
