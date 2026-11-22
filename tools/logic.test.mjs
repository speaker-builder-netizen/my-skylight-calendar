import test from "node:test";
import assert from "node:assert/strict";
import {
  choreView,
  streakAfterComplete,
  inSleepWindow,
  dimAmount,
  nextUp,
  countdownLabel,
  appendRewardLog,
  clampStars,
  isoWeekKey,
  mealEntityId,
  escapeHtml,
  soonestBirthday,
} from "../www/skylight-wall/skylight-logic.js";

const today = new Date(2026, 10, 22, 16, 47, 0);

test("daily chore is done only when last completed today", () => {
  assert.equal(choreView("2026-11-22", "daily", 3, today).done, true);
  assert.equal(choreView("2026-11-21", "daily", 3, today).done, false);
  assert.equal(choreView("2000-01-01", "daily", 0, today).done, false);
});

test("daily streak stays visible through yesterday and breaks after a miss", () => {
  assert.equal(choreView("2026-11-22", "daily", 4, today).streak, 4);
  assert.equal(choreView("2026-11-21", "daily", 4, today).streak, 4);
  assert.equal(choreView("2026-11-20", "daily", 4, today).streak, 0);
});

test("completing a daily chore continues, keeps, or resets the streak", () => {
  assert.equal(streakAfterComplete("2026-11-21", "daily", 4, today), 5);
  assert.equal(streakAfterComplete("2026-11-22", "daily", 4, today), 4);
  assert.equal(streakAfterComplete("2026-11-18", "daily", 4, today), 1);
  assert.equal(streakAfterComplete("2000-01-01", "daily", 0, today), 1);
});

test("weekly chores follow ISO weeks", () => {
  assert.equal(choreView("2026-11-18", "weekly", 2, today).done, true);
  assert.equal(choreView("2026-11-14", "weekly", 2, today).done, false);
  assert.equal(streakAfterComplete("2026-11-14", "weekly", 2, today), 3);
  assert.equal(isoWeekKey(today) > 0, true);
});

test("sleep window wraps past midnight", () => {
  const night = new Date(2026, 10, 22, 22, 10);
  const morning = new Date(2026, 10, 23, 6, 0);
  const midday = new Date(2026, 10, 22, 12, 0);
  assert.equal(inSleepWindow(night, "21:30:00", "06:30:00", true), true);
  assert.equal(inSleepWindow(morning, "21:30:00", "06:30:00", true), true);
  assert.equal(inSleepWindow(midday, "21:30:00", "06:30:00", true), false);
  assert.equal(inSleepWindow(night, "21:30:00", "06:30:00", false), false);
});

test("pre-sleep dim ramps across the half hour before bedtime", () => {
  assert.equal(dimAmount(new Date(2026, 10, 22, 21, 15), "21:30", true) > 0.4, true);
  assert.equal(dimAmount(new Date(2026, 10, 22, 18, 0), "21:30", true), 0);
  assert.equal(dimAmount(new Date(2026, 10, 22, 21, 15), "21:30", false), 0);
});

test("what's next prefers the soonest later event today", () => {
  const events = [
    { summary: "Past", allDay: false, start: new Date(2026, 10, 22, 9, 0), birthday: false },
    { summary: "Soccer", allDay: false, start: new Date(2026, 10, 22, 17, 30), birthday: false },
    { summary: "Tomorrow", allDay: false, start: new Date(2026, 10, 23, 8, 0), birthday: false },
  ];
  const next = nextUp(events, today);
  assert.equal(next.event.summary, "Soccer");
  assert.equal(next.when, "today");
  assert.match(countdownLabel(next.event.start, today), /in 4[0-9] min/);
});

test("birthday countdown rolls into next year", () => {
  const found = soonestBirthday([
    { birthday: true, summary: "Alex", start: new Date(2026, 0, 2), allDay: true },
  ], today);
  assert.equal(found.next.getFullYear(), 2027);
});

test("reward log and star clamp stay inside helper limits", () => {
  const log = appendRewardLog("11/20 Movie", "Pick dessert", today);
  assert.match(log, /^11\/22 Pick dessert/);
  assert.equal(clampStars(4, -10), 0);
  assert.equal(clampStars(4, 2), 6);
});

test("entity ids and escaped text stay safe", () => {
  assert.equal(mealEntityId("mon", "dinner"), "input_text.skylight_meal_mon_dinner");
  assert.equal(escapeHtml(`<b class="x">`), "&lt;b class=&quot;x&quot;&gt;");
});
