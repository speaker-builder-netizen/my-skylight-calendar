import {
  DAY_KEYS,
  MEALS,
  activeChores,
  addDays,
  appendRewardLog,
  capitalizeFirst,
  choreView,
  countdownLabel,
  dateKey,
  dayKey,
  dimAmount,
  doneEntityId,
  escapeHtml,
  eventsOnDay,
  filterVisible,
  formatClock,
  formatTime,
  greeting,
  householdCalendars,
  inSleepWindow,
  isShown,
  mealEntityId,
  monthDay,
  monthGrid,
  nextUp,
  normalizeEvent,
  parseDate,
  parseRewardLog,
  rewardsEntityId,
  safeColor,
  sameDay,
  soonestBirthday,
  startOfDay,
  startOfWeek,
  starsEntityId,
  streakAfterComplete,
  streakEntityId,
  weatherEmoji,
  weatherLabel,
  weekdayName,
} from "./skylight-logic.js";

const VIEWS = [
  ["home", "Home"],
  ["calendar", "Calendar"],
  ["chores", "Chores"],
  ["meals", "Meals"],
  ["lists", "Lists"],
  ["rewards", "Rewards"],
];

const NAV_ICON = {
  home: `<path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z"/>`,
  calendar: `<path d="M8 3.5v3M16 3.5v3"/><path d="M4.5 8.5h15"/><rect x="4.5" y="5" width="15" height="15" rx="2"/>`,
  chores: `<circle cx="12" cy="12" r="8"/><path d="M8.5 12.2 11 14.6 15.7 9.6"/>`,
  meals: `<path d="M7 3.5v7a2.5 2.5 0 0 0 5 0v-7"/><path d="M9.5 3.5V20"/><path d="M16.5 3.5c1.8 2.4 1.8 5 0 7.2V20"/>`,
  lists: `<path d="M9 7h10M9 12h10M9 17h10"/><path d="M5 7h.01M5 12h.01M5 17h.01"/>`,
  rewards: `<path d="M12 3.2 14.4 8l5.3.7-3.8 3.6.9 5.2L12 15.2 7.2 17.5l.9-5.2L4.3 8.7 9.6 8z"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3V20.5M3.5 12h2.2M18.3 12H20.5M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6"/>`,
};

const FALLBACK_ART = [
  ["#f6d5a8", "#f3a57a", "#8fb8d8"],
  ["#c9e4d4", "#8ec6b2", "#f7e7c4"],
  ["#d9d4f0", "#a9b7e4", "#f7d6c8"],
  ["#f7e1c2", "#e7b18a", "#8aa8c2"],
];

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${NAV_ICON[name] || ""}</svg>`;
}

function css(fontBase, background) {
  return `
    @font-face { font-family: "Ovo"; src: url("${fontBase}Ovo-Regular.ttf") format("truetype"); font-weight: 400; font-display: swap; }
    @font-face { font-family: "Nunito"; src: url("${fontBase}Nunito-Variable.ttf") format("truetype"); font-weight: 200 1000; font-display: swap; }
    :host { display: block; height: 100%; min-height: 100vh; color: var(--ink); font-family: Nunito, "Avenir Next", "Segoe UI", sans-serif; --ink: #1d2a33; --muted: #6b7b88; --accent: #e07a5f; --paper: rgba(255,255,255,.8); --line: rgba(29,42,51,.08); --shadow: 0 18px 50px rgba(36,64,88,.08); }
    * { box-sizing: border-box; }
    button, input { font: inherit; color: inherit; }
    button { border: 0; background: none; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
    button:active { transform: scale(.98); }
    .app { height: 100%; min-height: 100%; display: grid; grid-template-columns: 112px 1fr; position: relative; overflow: hidden; background:
      linear-gradient(180deg, rgba(255,255,255,.42), rgba(241,247,252,.62)),
      url("${background}") center/cover no-repeat, #e7eef5; }
    .nav { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 10px 14px; background: rgba(255,255,255,.42); border-right: 1px solid rgba(255,255,255,.7); backdrop-filter: blur(18px); }
    .brand { width: 52px; height: 52px; border-radius: 18px; display: grid; place-items: center; background: white; box-shadow: var(--shadow); color: var(--accent); margin-bottom: 8px; }
    .brand svg { width: 28px; height: 28px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }
    .nav button.nav-btn { width: 88px; min-height: 68px; border-radius: 20px; color: #60717e; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-weight: 800; font-size: 12px; letter-spacing: .01em; }
    .nav button.nav-btn svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .nav button.nav-btn.active { background: white; color: var(--ink); box-shadow: var(--shadow); }
    .nav .spacer { flex: 1; }
    .stage { min-width: 0; min-height: 0; display: grid; grid-template-rows: auto 1fr; padding: 16px 18px 16px 14px; gap: 12px; }
    .topbar { display: flex; align-items: center; gap: 14px; min-height: 46px; padding: 0 6px; }
    .family { font-family: Ovo, Georgia, serif; font-size: 28px; line-height: 1; }
    .chip { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.8); border-radius: 999px; padding: 8px 14px; font-weight: 800; color: var(--ink); box-shadow: 0 6px 18px rgba(36,64,88,.05); }
    .top-gap { flex: 1; }
    .wx-pill { font-weight: 800; }
    .view { min-height: 0; overflow: auto; }
    .view.enter { animation: rise .35s ease; }
    @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .card { background: var(--paper); border: 1px solid rgba(255,255,255,.85); border-radius: 28px; box-shadow: var(--shadow); min-width: 0; min-height: 0; }
    .eyebrow { font-size: 13px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
    .home { height: 100%; display: grid; grid-template-rows: minmax(250px, 36%) minmax(0, 1fr); gap: 14px; }
    .hero, .lower { display: grid; gap: 14px; min-height: 0; }
    .hero { grid-template-columns: 1.02fr 1.22fr .86fr; }
    .lower { grid-template-columns: 1.25fr .95fr .8fr; }
    .clock-card, .next-card, .dinner-card, .agenda-card, .people-card, .grocery-card { padding: 20px 22px; overflow: hidden; display: flex; flex-direction: column; }
    .clock-date { font-family: Ovo, Georgia, serif; font-size: 28px; margin-top: 6px; }
    .clock-time { font-family: Ovo, Georgia, serif; font-size: 92px; line-height: .88; letter-spacing: -1px; margin: 8px 0 12px; }
    .weather-row { margin-top: auto; display: flex; align-items: center; gap: 12px; }
    .weather-emoji { font-size: 42px; line-height: 1; }
    .weather-temp { font-family: Ovo, Georgia, serif; font-size: 36px; line-height: 1; }
    .weather-sub { color: var(--muted); font-weight: 700; margin-top: 2px; }
    .next-card { background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,247,242,.9)); position: relative; }
    .next-card::before { content: ""; position: absolute; inset: auto -20px -40px auto; width: 180px; height: 180px; border-radius: 50%; background: color-mix(in srgb, var(--c, var(--accent)) 28%, transparent); filter: blur(8px); }
    .next-main { position: relative; display: flex; gap: 12px; align-items: center; height: 100%; }
    .next-copy { min-width: 0; flex: 1; }
    .next-when { font-weight: 800; color: var(--muted); margin: 8px 0; }
    .next-title { font-family: Ovo, Georgia, serif; font-size: 46px; line-height: 1.02; margin: 0 0 10px; }
    .next-count { display: inline-flex; align-items: center; min-height: 42px; padding: 0 14px; border-radius: 999px; background: var(--ink); color: white; font-weight: 800; font-size: 18px; }
    .ring { width: 112px; height: 112px; flex: none; }
    .ring circle { fill: none; stroke-width: 3.2; }
    .ring .track { stroke: rgba(29,42,51,.08); }
    .ring .value { stroke: var(--c, var(--accent)); stroke-linecap: round; transform-origin: 18px 18px; transform: rotate(-90deg); }
    .who-dot { display: inline-flex; align-items: center; gap: 6px; }
    .dinner-name { font-family: Ovo, Georgia, serif; font-size: 48px; line-height: 1.02; margin: 10px 0; }
    .dinner-tomorrow { color: var(--muted); font-weight: 800; }
    .text-btn { margin-top: auto; align-self: flex-start; min-height: 46px; padding: 0 16px; border-radius: 14px; background: white; font-weight: 800; box-shadow: 0 6px 16px rgba(36,64,88,.06); }
    .section-h { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .section-h h3 { margin: 0; font-size: 22px; font-family: Ovo, Georgia, serif; font-weight: 400; }
    .section-h span, .muted { color: var(--muted); font-weight: 800; }
    .agenda-list, .stack-list { overflow: auto; display: flex; flex-direction: column; gap: 8px; }
    .event-row, .check-row, .person-row, .chore { width: 100%; text-align: left; border-radius: 16px; }
    .event-row { display: grid; grid-template-columns: 92px 1fr auto; gap: 8px; align-items: center; min-height: 58px; padding: 8px 10px; background: color-mix(in srgb, var(--c) 12%, white); border-left: 5px solid var(--c); }
    .event-row b { display: block; font-size: 16px; }
    .event-row small, .check-row small, .chore small { color: var(--muted); font-weight: 800; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: white; font-size: 20px; }
    .person-row { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; min-height: 64px; padding: 6px; }
    .person-row b, .person-row small, .chore b, .chore small { display: block; }
    .bar { height: 8px; border-radius: 99px; background: rgba(29,42,51,.08); overflow: hidden; margin-top: 6px; }
    .bar span { display: block; height: 100%; border-radius: inherit; background: var(--c); }
    .stars { font-weight: 800; color: #c4841d; }
    .check-row { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 4px 2px; font-weight: 800; }
    .box { width: 26px; height: 26px; border-radius: 8px; border: 2px solid #c5d0d8; display: grid; place-items: center; flex: none; }
    .check-row.done { color: var(--muted); text-decoration: line-through; }
    .check-row.done .box { background: #2e9b4f; border-color: #2e9b4f; color: white; }
    .calendar { height: 100%; min-height: 0; display: flex; flex-direction: column; gap: 10px; }
    .cal-toolbar, .view-head { display: flex; align-items: center; gap: 10px; }
    .cal-toolbar .add-btn, .view-head .add-btn { margin-left: auto; }
    .page-title { font-family: Ovo, Georgia, serif; font-size: 32px; font-weight: 400; margin: 0; }
    .view-head .arrow { margin-left: auto; }
    .agenda-days { flex: 1; min-height: 0; overflow: auto; }
    .switch { display: flex; background: rgba(255,255,255,.7); border-radius: 16px; padding: 4px; }
    .switch button { min-height: 44px; padding: 0 16px; border-radius: 12px; font-weight: 800; color: var(--muted); }
    .switch button.on { background: white; color: var(--ink); box-shadow: var(--shadow); }
    .arrow, .add-btn { min-height: 48px; min-width: 48px; padding: 0 14px; border-radius: 14px; background: white; font-weight: 800; box-shadow: var(--shadow); }
    .add-btn { background: var(--ink); color: white; margin-left: auto; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .filters button { min-height: 44px; padding: 0 12px; border-radius: 999px; background: white; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; opacity: .45; }
    .filters button.on { opacity: 1; box-shadow: inset 0 0 0 2px var(--c, var(--ink)); }
    .week { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
    .day-col { background: rgba(255,255,255,.78); border-radius: 22px; padding: 10px 10px 12px; display: flex; flex-direction: column; min-width: 0; min-height: 0; height: 100%; }
    .day-col.today { background: white; box-shadow: 0 12px 30px rgba(224,122,95,.14); outline: 2px solid rgba(224,122,95,.45); }
    .day-h { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .day-h .num { font-family: Ovo, Georgia, serif; font-size: 32px; line-height: 1; }
    .day-h .wd { font-weight: 800; color: var(--muted); }
    .day-col.today .wd { color: var(--accent); }
    .pills { overflow: auto; display: flex; flex-direction: column; gap: 6px; }
    .pill { text-align: left; border-radius: 12px; padding: 8px 8px 8px 10px; background: color-mix(in srgb, var(--c) 16%, white); border-left: 4px solid var(--c); }
    .pill b { display: block; font-size: 14px; line-height: 1.25; }
    .pill small { color: #4d5d6a; font-weight: 800; }
    .month { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(7, 1fr); grid-template-rows: auto repeat(6, 1fr); gap: 6px; }
    .month .wd { text-align: center; font-weight: 800; color: var(--muted); }
    .cell { text-align: left; background: rgba(255,255,255,.7); border-radius: 14px; padding: 6px; min-width: 0; overflow: hidden; }
    .cell.off { opacity: .4; }
    .cell.today { outline: 2px solid var(--accent); background: white; }
    .cell .num { font-family: Ovo, Georgia, serif; font-size: 20px; }
    .mini { display: block; font-size: 11px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-left: 3px solid var(--c); padding-left: 4px; margin-top: 2px; }
    .agenda-days { display: flex; flex-direction: column; gap: 14px; }
    .agenda-day h4 { margin: 0 0 6px; font-family: Ovo, Georgia, serif; font-size: 26px; }
    .chores { height: 100%; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .person-col { background: rgba(255,255,255,.78); border-radius: 28px; padding: 16px; display: flex; flex-direction: column; gap: 8px; min-width: 0; box-shadow: var(--shadow); }
    .person-top { display: flex; gap: 10px; align-items: center; }
    .big-avatar { width: 64px; height: 64px; border-radius: 22px; display: grid; place-items: center; font-size: 34px; background: color-mix(in srgb, var(--c) 18%, white); }
    .person-top h3 { margin: 0; font-family: Ovo, Georgia, serif; font-size: 30px; font-weight: 400; }
    .flame { color: #e07a00; font-weight: 800; }
    .chore { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; min-height: 76px; padding: 8px 10px; background: white; border-radius: 18px; box-shadow: 0 6px 16px rgba(36,64,88,.04); }
    .chore .ico { font-size: 26px; width: 36px; text-align: center; }
    .chore b { font-size: 18px; }
    .chore.done { background: #f3faf4; }
    .chore.done b { text-decoration: line-through; color: #6d7c89; }
    .mark { width: 42px; height: 42px; border-radius: 50%; border: 2px solid #d5dee6; display: grid; place-items: center; font-weight: 800; color: var(--muted); }
    .chore.done .mark { background: #2e9b4f; border-color: #2e9b4f; color: white; }
    .all-done { font-weight: 800; color: #2e9b4f; }
    .meals { height: 100%; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
    .grid-meal { flex: 1; min-height: 0; display: grid; grid-template-columns: 112px repeat(7, 1fr); grid-template-rows: auto repeat(3, 1fr); gap: 8px; }
    .mh, .ml { font-weight: 800; color: var(--muted); display: grid; place-items: center; }
    .mh.today, .meal.today { background: white; box-shadow: var(--shadow); }
    .mh { border-radius: 16px; min-height: 64px; }
    .mh b { display: block; font-family: Ovo, Georgia, serif; font-size: 26px; color: var(--ink); font-weight: 400; }
    .meal { min-height: 72px; border-radius: 18px; background: rgba(255,255,255,.82); padding: 10px; text-align: center; font-family: Ovo, Georgia, serif; font-size: 22px; font-weight: 400; display: flex; align-items: center; justify-content: center; }
    .meal em { display: block; font-style: normal; color: #a0adb6; font-weight: 800; }
    .lists { height: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .list-card { background: rgba(255,255,255,.8); border-radius: 28px; padding: 18px; display: flex; flex-direction: column; min-height: 0; box-shadow: var(--shadow); }
    .list-card h3 { font-family: Ovo, Georgia, serif; font-size: 34px; margin: 0; font-weight: 400; }
    .list-card .view-head { margin-top: auto; }
    .items { overflow: auto; display: flex; flex-direction: column; gap: 4px; margin: 8px 0; }
    .item { display: flex; align-items: center; gap: 8px; min-height: 64px; }
    .item-main { flex: 1; display: flex; align-items: center; gap: 12px; min-height: 64px; text-align: left; font-weight: 800; font-size: 20px; border-radius: 16px; padding: 0 8px; }
    .item.done { color: var(--muted); }
    .item.done span.name { text-decoration: line-through; }
    .ghost { color: var(--muted); font-weight: 800; min-height: 44px; }
    .rewards { height: 100%; display: grid; grid-template-rows: auto auto 1fr auto; gap: 12px; }
    .balance { display: flex; align-items: center; gap: 16px; }
    .balance strong { font-family: Ovo, Georgia, serif; font-size: 64px; font-weight: 400; line-height: .9; }
    .reward-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; min-height: 0; }
    .reward { text-align: left; background: rgba(255,255,255,.84); border-radius: 24px; padding: 16px; min-height: 150px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 4px; }
    .reward .emoji { font-size: 36px; }
    .reward b { font-size: 20px; }
    .reward small { color: var(--muted); font-weight: 700; }
    .cost { margin-top: auto; align-self: flex-start; background: #fff4d8; color: #9a6410; font-weight: 800; border-radius: 999px; padding: 6px 10px; }
    .reward.short { opacity: .55; }
    .person-switch { display: flex; gap: 8px; }
    .person-switch button { min-height: 56px; padding: 0 14px; border-radius: 18px; background: rgba(255,255,255,.7); font-weight: 800; display: flex; align-items: center; gap: 8px; }
    .person-switch button.on { background: white; box-shadow: var(--shadow); }
    .sheet-back, .sleep, .saver, .dim { position: absolute; inset: 0; }
    .dim { background: #120e0c; pointer-events: none; opacity: 0; transition: opacity 1.2s linear; }
    .sleep, .saver, .sheet-back { display: none; }
    .sleep.show, .saver.show, .sheet-back.show { display: block; }
    .sleep { background: #100e0c; color: #6d6258; z-index: 30; display: none; place-items: center; text-align: center; }
    .sleep.show { display: grid; }
    .sleep .clock-time { font-size: 120px; color: #6a5f56; }
    .sleep p { font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
    .saver { z-index: 25; background: #111; color: white; overflow: hidden; }
    .slide { position: absolute; inset: -6%; background-size: cover; background-position: center; opacity: 0; transform: scale(1); }
    .slide.show { opacity: 1; animation: ken 18s ease-out both; }
    @keyframes ken { from { transform: scale(1) translate3d(0,0,0); } to { transform: scale(1.12) translate3d(-2%, -1.5%, 0); } }
    .saver-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.08) 45%, rgba(0,0,0,.62)); }
    .sun { position: absolute; width: 180px; height: 180px; border-radius: 50%; right: 16%; top: 16%; background: rgba(255,248,230,.85); box-shadow: 0 0 80px rgba(255,244,214,.9); }
    .hill { position: absolute; left: -10%; right: -10%; bottom: -8%; height: 34%; border-radius: 50% 50% 0 0; background: rgba(255,255,255,.18); }
    .saver-copy { position: absolute; left: 48px; right: 48px; bottom: 42px; display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: end; }
    .saver .clock-time { font-size: 96px; margin: 0; text-shadow: 0 8px 30px rgba(0,0,0,.35); }
    .saver-next { justify-self: end; text-align: right; max-width: 520px; }
    .saver-next b { font-family: Ovo, Georgia, serif; font-size: 36px; font-weight: 400; display: block; }
    .sheet-back { z-index: 20; background: rgba(20, 30, 40, .28); backdrop-filter: blur(6px); display: none; place-items: center; padding: 24px; }
    .sheet-back.show { display: grid; }
    .sheet { width: min(1080px, 100%); max-height: calc(100% - 20px); overflow: auto; background: #fffdfb; border-radius: 28px; padding: 22px; box-shadow: 0 30px 80px rgba(0,0,0,.2); }
    .sheet h2 { font-family: Ovo, Georgia, serif; font-size: 36px; margin: 0 0 12px; font-weight: 400; }
    .sheet-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .choices, .keys { display: flex; flex-wrap: wrap; gap: 8px; }
    .choices button, .key, .choice { min-height: 56px; padding: 0 14px; border-radius: 14px; background: #f4f7fa; font-weight: 800; }
    .choices button.primary, button.primary { background: var(--accent); color: white; }
    .choice.on, .choices button.on, .key.on { background: var(--ink); color: white; }
    .draft { min-height: 64px; border-radius: 16px; background: #f6f8fb; display: flex; align-items: center; padding: 0 16px; font-size: 28px; font-family: Ovo, Georgia, serif; margin: 8px 0; }
    .key { min-width: 58px; justify-content: center; }
    .key.wide { min-width: 110px; }
    .split { display: grid; grid-template-columns: 1.1fr .9fr; gap: 18px; }
    .primary { min-height: 64px; padding: 0 18px; border-radius: 16px; background: var(--accent); color: white; font-weight: 800; font-size: 18px; }
    .primary:disabled { opacity: .45; }
    .toast { position: absolute; top: 22px; left: 50%; transform: translateX(-50%) translateY(-20px); background: white; color: var(--ink); border-radius: 999px; padding: 14px 18px; font-weight: 800; box-shadow: var(--shadow); opacity: 0; pointer-events: none; z-index: 40; transition: .25s ease; }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .confetti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 35; }
    .setup { max-width: 760px; margin: 40px auto; background: white; border-radius: 28px; padding: 28px; }
    .error { white-space: pre-wrap; color: #9b2c2c; }
    @media (prefers-reduced-motion: reduce) { .view.enter, .slide.show { animation: none; } }
  `;
}

function ring(pct, color) {
  const amount = Math.max(0, Math.min(100, pct));
  return `<svg class="ring" viewBox="0 0 36 36" style="--c:${color}"><circle class="track" cx="18" cy="18" r="15"></circle><circle class="value" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="${amount} 100"></circle></svg>`;
}

class SkylightWallCard extends HTMLElement {
  static getStubConfig() {
    return { demo: true };
  }

  setConfig(config) {
    this.config = {
      demo: false,
      weather_entity: "weather.home",
      background: "/local/calbackgrd.png",
      photo_media: "media-source://media_source/local/photos",
      photo_manifest: "/local/photos/manifest.json",
      ...config,
    };
    this._ensure();
  }

  set hass(hass) {
    this._hass = hass;
    this._ensure();
    this._onHass();
  }

  getCardSize() {
    return 20;
  }

  connectedCallback() {
    this._ensure();
    this._timer = window.setInterval(() => this._tick(), 1000);
    this._ro = new ResizeObserver(() => this._fit());
    this._ro.observe(this);
    this._fit();
  }

  disconnectedCallback() {
    window.clearInterval(this._timer);
    this._ro?.disconnect();
    this._audio?.close?.();
  }

  _fit() {
    const parent = this.parentElement;
    if (parent && parent.clientHeight > 400) this.style.height = `${parent.clientHeight}px`;
  }

  _ensure() {
    if (this._ready || !this.config) return;
    this._ready = true;
    this._now = new Date();
    this._lastInput = Date.now();
    this._overrides = {};
    this._events = [];
    this._forecast = [];
    this._lists = { groceries: [], todos: [] };
    this._listMissing = {};
    this._photos = [];
    this._photo = 0;
    this._ui = {
      view: this.config.initial_view && this.config.initial_view !== "saver" && this.config.initial_view !== "sleep"
        ? this.config.initial_view
        : (location.hash || "").replace("#", "") || "home",
      cal: "week",
      weekOffset: 0,
      monthOffset: 0,
      sheet: null,
      saver: this.config.initial_view === "saver",
      sleep: this.config.initial_view === "sleep",
      awakeUntil: 0,
      rewardPerson: "p1",
      toast: "",
    };
    if (!VIEWS.some(([id]) => id === this._ui.view)) this._ui.view = "home";
    this.attachShadow({ mode: "open" });
    const fontBase = this.config.font_base || new URL("./fonts/", import.meta.url).href;
    this.shadowRoot.innerHTML = `<style>${css(fontBase, this.config.background)}</style>
      <div class="app">
        <nav class="nav"></nav>
        <div class="stage"><header class="topbar"></header><div class="view"></div></div>
        <div class="dim"></div>
        <div class="saver"></div>
        <div class="sleep"></div>
        <div class="sheet-back"></div>
        <div class="toast"></div>
        <canvas class="confetti"></canvas>
      </div>`;
    this.shadowRoot.addEventListener("pointerdown", () => this._poke());
    this.shadowRoot.addEventListener("click", (event) => {
      const node = event.target.closest("[data-act]");
      if (!node) return;
      Promise.resolve(this._act(node.dataset)).catch((error) => {
        console.error(error);
        this._toast(error?.message || "Something went wrong");
      });
    });
    if (this.config.initial_sheet) this._ui.sheet = { type: this.config.initial_sheet };
    if (this.config.demo) this._seedDemo();
    this._loadHousehold();
    if (!this.config.demo) {
      this._loadEvents();
      this._loadForecast();
      this._loadLists();
      this._loadPhotos();
    }
  }

  async _loadHousehold() {
    try {
      const response = await fetch(new URL("./household.json", import.meta.url), { cache: "no-cache" });
      if (!response.ok) throw new Error(`household.json ${response.status}`);
      this._household = await response.json();
      this._householdError = "";
      if (this.config.demo && this._demo) this._events = this._demoEvents();
    } catch (error) {
      this._household = null;
      this._householdError = error.message || String(error);
    }
    this._sig = "";
    this._paint();
    if (this.config.demo_celebrate) {
      const model = this._model();
      const member = model?.members?.[0];
      const chore = member?.chores?.[0];
      if (member && chore) this._celebrate(member, chore, false);
    }
  }

  _seedDemo() {
    const now = new Date();
    const yday = dateKey(addDays(now, -1));
    const today = dateKey(now);
    const wed = dateKey(addDays(startOfWeek(now, "monday"), 2));
    this._demo = {
      done: {
        "p1:1": today, "p1:2": yday, "p1:4": wed,
        "p2:1": today, "p2:2": today, "p2:3": today,
        "p3:1": today, "p3:2": yday,
        "p4:1": dateKey(addDays(now, -3)),
      },
      streak: { "p1:1": 6, "p1:2": 3, "p1:4": 2, "p2:1": 4, "p2:2": 8, "p2:3": 2, "p3:1": 3, "p3:2": 2, "p4:1": 4 },
      stars: { p1: 14, p2: 26, p3: 9, p4: 4 },
      rewards: { p2: "11/20 Choose the movie" },
      meals: {
        mon: { breakfast: "Oatmeal", lunch: "Leftovers", dinner: "Pasta" },
        tue: { breakfast: "Eggs", lunch: "Sandwiches", dinner: "Stir fry" },
        wed: { breakfast: "Yogurt", lunch: "Soup", dinner: "Roast chicken" },
        thu: { breakfast: "Smoothie", lunch: "Quesadillas", dinner: "Soup & grilled cheese" },
        fri: { breakfast: "Pancakes", lunch: "Leftovers", dinner: "Pizza" },
        sat: { breakfast: "Eggs", lunch: "Eat out", dinner: "Burgers" },
        sun: { breakfast: "Pancakes", lunch: "Sandwiches", dinner: "Tacos" },
      },
      filters: {},
      idle: 8,
      sound: true,
      sleepOn: true,
      sleepStart: "21:30",
      sleepEnd: "06:30",
      wake: 10,
      lists: {
        groceries: [
          { uid: "1", summary: "Tortillas", status: "needs_action" },
          { uid: "2", summary: "Limes", status: "needs_action" },
          { uid: "3", summary: "Sour cream", status: "needs_action" },
          { uid: "4", summary: "Lettuce", status: "needs_action" },
          { uid: "5", summary: "Milk", status: "needs_action" },
          { uid: "6", summary: "Cheese", status: "completed" },
        ],
        todos: [
          { uid: "a", summary: "Pack library books", status: "needs_action" },
          { uid: "b", summary: "RSVP to the party", status: "needs_action" },
          { uid: "c", summary: "Schedule checkup", status: "needs_action" },
          { uid: "d", summary: "Replace water filter", status: "completed" },
        ],
      },
    };
    this._events = this._demoEvents();
    this._forecast = this._demoForecast();
  }

  _demoEvents() {
    const now = new Date();
    const at = (offset, h, m) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, h, m, 0, 0);
    const specs = [
      [-6, 9, 0, 45, "Dentist", "p1"],
      [-5, 16, 0, 90, "Practice", "p2"],
      [-4, 15, 30, 45, "Piano", "p3"],
      [-3, 14, 0, 120, "Playdate", "p4"],
      [-2, 16, 0, 60, "Tutoring", "p1"],
      [-2, 17, 0, 90, "Game", "p2"],
      [-1, 15, 0, 120, "Party", "p3"],
      [-1, 19, 0, 120, "Family movie", "family"],
      [0, 9, 0, 90, "Play rehearsal", "p1"],
      [0, 11, 0, 75, "Farmers market", "family"],
      [1, 8, 15, 45, "Dentist", "p3"],
      [2, 16, 0, 60, "Lessons", "p4"],
      [3, 18, 30, 90, "Dinner with grandparents", "family"],
    ];
    const household = this._household || { members: [], calendars: [] };
    const metas = new Map(householdCalendars(household).map((item) => [item.id, item]));
    const soon = new Date(now.getTime() + 48 * 60000);
    const later = new Date(now.getTime() + 3 * 3600000);
    specs.push([0, soon.getHours(), soon.getMinutes(), 75, "Soccer practice", "p2"]);
    if (later.getDate() === now.getDate()) specs.push([0, later.getHours(), later.getMinutes(), 90, "Game night", "family"]);
    const events = specs.map(([offset, h, m, dur, summary, who]) => {
      const meta = metas.get(who) || { id: who, name: who, color: "#3D7EC8", avatar: "🏠", entity: "" };
      return normalizeEvent({
        summary,
        start: at(offset, h, m).toISOString(),
        end: new Date(at(offset, h, m).getTime() + dur * 60000).toISOString(),
      }, meta);
    });
    const birthday = metas.get("birthdays") || { id: "birthdays", name: "Birthdays", color: "#2E9B4F", avatar: "🎂" };
    const bday = addDays(startOfDay(now), 6);
    events.push(normalizeEvent({ summary: "Casey's birthday", start: dateKey(bday), end: dateKey(addDays(bday, 1)) }, birthday));
    return events;
  }

  _demoForecast() {
    const start = startOfDay(new Date());
    const conditions = ["partlycloudy", "sunny", "cloudy", "rainy", "partlycloudy", "sunny", "clear-night"];
    return Array.from({ length: 7 }, (_, i) => ({
      datetime: addDays(start, i).toISOString(),
      condition: conditions[i % conditions.length],
      temperature: 58 - i,
      templow: 42 - (i % 3),
    }));
  }

  _onHass() {
    if (!this._ready) return;
    const sig = this._signature();
    if (sig !== this._sig) {
      this._sig = sig;
      this._paint();
    }
  }

  _tick() {
    if (!this.shadowRoot) return;
    this._now = new Date();
    this._paintClocks();
    this._checkIdle();
    if (this._now.getSeconds() === 0) this._sig = "";
  }

  _poke() {
    this._lastInput = Date.now();
    const settings = this._settings();
    const inWindow = inSleepWindow(this._now || new Date(), settings.sleepStart, settings.sleepEnd, settings.sleepOn);
    if (inWindow) this._ui.awakeUntil = Date.now() + (settings.wake || 10) * 60000;
    const sleepShowing = this.shadowRoot?.querySelector(".sleep")?.classList.contains("show");
    if (this._ui.saver || sleepShowing) {
      this._ui.saver = false;
      this._wasAsleep = false;
      this._sig = "";
      this._paint();
    }
  }

  _signature() {
    if (!this._household) return `err:${this._householdError}`;
    const bits = [
      this._ui.view, this._ui.cal, this._ui.weekOffset, this._ui.monthOffset,
      this._ui.sheet ? JSON.stringify(this._ui.sheet) : "",
      this._ui.rewardPerson, this._events.length, this._forecast.length,
      this._photo, this._photos.length, this._now.getHours(), this._now.getMinutes(),
    ];
    if (this.config.demo) bits.push(JSON.stringify(this._demo));
    else if (this._hass) {
      const watch = [];
      for (const member of this._household.members || []) {
        watch.push(member.filter_entity, starsEntityId(member.id), rewardsEntityId(member.id));
      }
      for (const calendar of this._household.calendars || []) watch.push(calendar.filter_entity);
      for (const chore of activeChores(this._household)) {
        watch.push(doneEntityId(chore.person, chore.slot), streakEntityId(chore.person, chore.slot));
      }
      for (const day of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) {
        for (const meal of MEALS) watch.push(mealEntityId(day, meal));
      }
      watch.push(
        "input_number.skylight_idle_minutes",
        "input_boolean.skylight_sound",
        "input_boolean.skylight_sleep_enabled",
        "input_datetime.skylight_sleep_start",
        "input_datetime.skylight_sleep_end",
        "input_number.skylight_wake_minutes",
        "input_boolean.skylight_asleep",
        this.config.weather_entity,
      );
      for (const entity of watch) {
        const state = this._hass.states?.[entity];
        bits.push(entity, this._overrides[entity]?.state ?? state?.state ?? "");
      }
      bits.push(JSON.stringify(this._lists), JSON.stringify(this._listMissing));
    }
    return bits.join("|");
  }

  _state(entity, fallback = "") {
    if (Object.prototype.hasOwnProperty.call(this._overrides, entity)) return this._overrides[entity].state;
    const state = this._hass?.states?.[entity];
    return state ? state.state : fallback;
  }

  _num(entity, fallback) {
    const value = Number(this._state(entity, fallback));
    return Number.isFinite(value) ? value : fallback;
  }

  _model() {
    const household = this._household;
    if (!household) return null;
    const now = this._now || new Date();
    const members = (household.members || []).map((member) => {
      const chores = activeChores(household).filter((chore) => chore.person === member.id).map((chore) => {
        const last = this.config.demo ? this._demo.done[`${member.id}:${chore.slot}`] : this._state(doneEntityId(member.id, chore.slot), "2000-01-01");
        const stored = this.config.demo ? (this._demo.streak[`${member.id}:${chore.slot}`] || 0) : this._num(streakEntityId(member.id, chore.slot), 0);
        const view = choreView(last, chore.cadence, stored, now);
        return { ...chore, last, stored, ...view };
      });
      const daily = chores.filter((chore) => chore.cadence !== "weekly");
      const stars = this.config.demo ? this._demo.stars[member.id] || 0 : this._num(starsEntityId(member.id), 0);
      const log = this.config.demo ? (this._demo.rewards[member.id] || "") : this._state(rewardsEntityId(member.id), "");
      return {
        ...member,
        color: safeColor(member.color),
        shown: this._filterOn(member.filter_entity),
        chores,
        stars,
        log: parseRewardLog(log),
        doneCount: chores.filter((chore) => chore.done).length,
        dailyLeft: daily.filter((chore) => !chore.done).length,
        bestStreak: chores.reduce((best, chore) => Math.max(best, chore.streak), 0),
        allDailyDone: daily.length > 0 && daily.every((chore) => chore.done),
        presence: member.person_entity ? this._state(member.person_entity, "") : "",
      };
    });
    const extras = (household.calendars || []).map((calendar) => ({
      ...calendar,
      color: safeColor(calendar.color),
      shown: this._filterOn(calendar.filter_entity),
    }));
    const hidden = new Set([
      ...members.filter((member) => !member.shown).map((member) => member.id),
      ...extras.filter((calendar) => !calendar.shown).map((calendar) => calendar.id),
    ]);
    const events = filterVisible(this._events, hidden);
    const meals = {};
    for (const key of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) {
      meals[key] = {};
      for (const meal of MEALS) {
        meals[key][meal] = this.config.demo
          ? (this._demo.meals[key]?.[meal] || "")
          : this._state(mealEntityId(key, meal), "");
      }
    }
    const weatherEntity = this.config.weather_entity;
    const weatherState = this._hass?.states?.[weatherEntity];
    const forecastToday = this._forecast[0];
    return {
      household,
      familyName: household.family_name || "Our Family",
      members,
      extras,
      events,
      next: nextUp(events, now),
      birthday: soonestBirthday(events, now),
      meals,
      weather: this.config.demo
        ? { temp: 54, condition: "partlycloudy", high: this._forecast[0]?.temperature, low: this._forecast[0]?.templow }
        : {
          temp: weatherState ? Math.round(Number(weatherState.attributes?.temperature)) : null,
          condition: weatherState?.state || forecastToday?.condition || "",
          high: forecastToday ? Math.round(Number(forecastToday.temperature)) : null,
          low: forecastToday ? Math.round(Number(forecastToday.templow)) : null,
          unit: weatherState?.attributes?.temperature_unit || "°",
        },
      lists: this.config.demo ? this._demo.lists : this._lists,
      listMissing: this.config.demo ? {} : this._listMissing,
      now,
      settings: this._settings(),
    };
  }

  _filterOn(entity) {
    if (!entity) return true;
    if (this.config.demo) return this._demo.filters[entity] !== "^$";
    const state = this._state(entity, ".*");
    if (!state || state === "unknown" || state === "unavailable") return true;
    return isShown(state);
  }

  _settings() {
    if (this.config.demo && this._demo) {
      return {
        idle: this._demo.idle,
        sound: this._demo.sound,
        sleepOn: this._demo.sleepOn,
        sleepStart: this._demo.sleepStart,
        sleepEnd: this._demo.sleepEnd,
        wake: this._demo.wake,
      };
    }
    return {
      idle: this._num("input_number.skylight_idle_minutes", 5),
      sound: this._state("input_boolean.skylight_sound", "on") !== "off",
      sleepOn: this._state("input_boolean.skylight_sleep_enabled", "on") !== "off",
      sleepStart: this._state("input_datetime.skylight_sleep_start", "21:30"),
      sleepEnd: this._state("input_datetime.skylight_sleep_end", "06:30"),
      wake: this._num("input_number.skylight_wake_minutes", 10),
    };
  }

  _wakeMinutes() {
    return this._settings().wake || 10;
  }

  _asleep() {
    if (this._ui.sleep) return true;
    const settings = this._settings();
    return inSleepWindow(this._now || new Date(), settings.sleepStart, settings.sleepEnd, settings.sleepOn)
      && Date.now() > (this._ui.awakeUntil || 0);
  }

  _paint() {
    if (!this._ready) return;
    const view = this.shadowRoot.querySelector(".view");
    try {
      const model = this._model();
      this._modelCache = model;
      this.shadowRoot.querySelector(".nav").innerHTML = this._navHtml();
      this.shadowRoot.querySelector(".topbar").innerHTML = model ? this._topHtml(model) : "";
      view.classList.remove("enter");
      view.innerHTML = model ? this._viewHtml(model) : this._setupHtml();
      this.dataset.ready = model ? "1" : "0";
      void view.offsetWidth;
      if (!this.config.preview) view.classList.add("enter");
      this._syncChrome(model);
    } catch (error) {
      console.error(error);
      view.innerHTML = `<pre class="error">${escapeHtml(error.stack || error.message)}</pre>`;
    }
  }

  _setupHtml() {
    return `<div class="setup"><h2>Add the wall files</h2><p>The card could not read <b>household.json</b> (${escapeHtml(this._householdError || "missing")}).</p><p>Copy <b>www/skylight-wall</b> to <b>/config/www/skylight-wall</b>, add the Lovelace resource, and refresh.</p></div>`;
  }

  _navHtml() {
    const buttons = VIEWS.map(([id, label]) => `<button class="nav-btn ${this._ui.view === id ? "active" : ""}" data-act="nav" data-view="${id}">${icon(id)}<span>${label}</span></button>`).join("");
    return `<div class="brand">${icon("home")}</div>${buttons}<div class="spacer"></div><button class="nav-btn ${this._ui.sheet?.type === "settings" ? "active" : ""}" data-act="settings">${icon("settings")}<span>Settings</span></button>`;
  }

  _topHtml(model) {
    const birthday = model.birthday;
    let chip = "";
    if (birthday) {
      const days = Math.round((startOfDay(birthday.next) - startOfDay(model.now)) / 86400000);
      const when = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
      if (days <= 21) chip = `<div class="chip">🎂 ${escapeHtml(birthday.event.summary)} ${when}</div>`;
    }
    const weather = model.weather?.temp != null && !Number.isNaN(model.weather.temp)
      ? `<div class="chip wx-pill">${weatherEmoji(model.weather.condition)} ${model.weather.temp}°</div>`
      : "";
    return `<div class="family">${escapeHtml(model.familyName)}</div>${chip}<div class="top-gap"></div>${weather}<div class="chip" data-clock>${formatClock(model.now)}</div>`;
  }

  _viewHtml(model) {
    if (this._ui.view === "home") return this._homeHtml(model);
    if (this._ui.view === "calendar") return this._calendarHtml(model);
    if (this._ui.view === "chores") return this._choresHtml(model);
    if (this._ui.view === "meals") return this._mealsHtml(model);
    if (this._ui.view === "lists") return this._listsHtml(model);
    if (this._ui.view === "rewards") return this._rewardsHtml(model);
    return this._homeHtml(model);
  }

  _homeHtml(model) {
    const dinnerKey = dayKey(model.now);
    const tomorrow = dayKey(addDays(model.now, 1));
    const dinner = model.meals[dinnerKey]?.dinner || "Add dinner";
    const breakfast = model.meals[tomorrow]?.breakfast;
    const next = model.next;
    const color = next ? safeColor(next.event.color) : "#e07a5f";
    let nextHtml;
    if (!next) {
      nextHtml = `<div class="next-main"><div class="next-copy"><div class="eyebrow">Up next</div><h2 class="next-title">Wide open</h2><div class="next-when">Nothing else on the calendars.</div></div></div>`;
    } else if (next.when === "allday") {
      nextHtml = `<div class="next-main"><div class="next-copy"><div class="eyebrow">Up next</div><div class="next-when">All day · ${escapeHtml(next.event.calendarName)}</div><h2 class="next-title">${escapeHtml(next.event.summary)}</h2></div></div>`;
    } else {
      const mins = Math.max(1, Math.round((next.event.start - model.now) / 60000));
      const pct = mins >= 120 ? 18 : Math.round(((120 - Math.min(mins, 120)) / 120) * 100);
      const when = next.when === "today"
        ? `Today · ${formatTime(next.event.start)}`
        : `${next.when === "tomorrow" ? "Tomorrow" : weekdayName(next.event.start, "short")} · ${formatTime(next.event.start)}`;
      nextHtml = `<div class="next-main"><div class="next-copy"><div class="eyebrow">Up next</div><div class="next-when">${when} · <span class="who-dot">${escapeHtml(next.event.avatar || "")} ${escapeHtml(next.event.calendarName)}</span></div><h2 class="next-title">${escapeHtml(next.event.summary)}</h2><div class="next-count" data-countdown="${next.event.start.toISOString()}">${escapeHtml(countdownLabel(next.event.start, model.now))}</div></div>${ring(pct, color)}</div>`;
    }
    const todayEvents = eventsOnDay(model.events, model.now);
    const rows = todayEvents.length
      ? todayEvents.map((event) => this._eventRow(event)).join("")
      : `<div class="muted">A clear day. Tap Add event when something comes up.</div>`;
    const people = model.members.map((member) => {
      const total = member.chores.length || 1;
      const pct = Math.round((member.doneCount / total) * 100);
      const nextChore = member.chores.find((chore) => !chore.done);
      return `<button class="person-row" data-act="nav" data-view="chores" style="--c:${member.color}"><span class="avatar">${escapeHtml(member.avatar)}</span><span><b>${escapeHtml(member.name)}</b><small class="muted"> ${nextChore ? escapeHtml(nextChore.name) : "All caught up"}</small><div class="bar"><span style="width:${pct}%"></span></div></span><span class="stars">★ ${member.stars}</span></button>`;
    }).join("");
    const groceries = (model.lists.groceries || []).filter((item) => item.status !== "completed").slice(0, 5);
    const groceryHtml = groceries.length
      ? groceries.map((item) => `<button class="check-row" data-act="toggle-item" data-list="groceries" data-uid="${escapeHtml(item.uid)}" data-summary="${escapeHtml(item.summary)}"><span class="box"></span>${escapeHtml(item.summary)}</button>`).join("")
      : `<div class="muted">${model.listMissing.groceries ? "Shopping list not set up yet." : "Grocery list is clear."}</div>`;
    const unit = model.weather.unit || "°";
    const temp = model.weather.temp == null || Number.isNaN(model.weather.temp) ? "—" : `${model.weather.temp}${unit}`;
    const high = model.weather.high == null ? "" : `H ${model.weather.high}°`;
    const low = model.weather.low == null ? "" : `L ${model.weather.low}°`;
    return `<div class="home">
      <section class="hero">
        <article class="card clock-card">
          <div class="eyebrow">${greeting(model.now)}</div>
          <div class="clock-date">${weekdayName(model.now)} · ${monthDay(model.now)}</div>
          <div class="clock-time" data-clock>${formatClock(model.now)}</div>
          <div class="weather-row"><span class="weather-emoji">${weatherEmoji(model.weather.condition)}</span><div><div class="weather-temp">${temp}</div><div class="weather-sub">${escapeHtml(weatherLabel(model.weather.condition))} · ${high} ${low}</div></div></div>
        </article>
        <article class="card next-card" style="--c:${color}">${nextHtml}</article>
        <article class="card dinner-card">
          <div class="eyebrow">Tonight</div>
          <div class="dinner-name">${escapeHtml(dinner)}</div>
          <div class="dinner-tomorrow">${breakfast ? `Tomorrow morning · ${escapeHtml(breakfast)}` : "Tomorrow's breakfast is open"}</div>
          <button class="text-btn" data-act="nav" data-view="meals">Meal plan</button>
        </article>
      </section>
      <section class="lower">
        <article class="card agenda-card">
          <div class="section-h"><h3>Today</h3><span>${todayEvents.length ? `${todayEvents.length} on the calendar` : "Nothing scheduled"}</span></div>
          <div class="agenda-list">${rows}</div>
        </article>
        <article class="card people-card"><div class="section-h"><h3>Chores</h3><span>tap a name</span></div><div class="stack-list">${people}</div></article>
        <article class="card grocery-card"><div class="section-h"><h3>Groceries</h3><button class="ghost" data-act="nav" data-view="lists">Open</button></div><div class="stack-list">${groceryHtml}</div></article>
      </section>
    </div>`;
  }

  _eventRow(event) {
    const time = event.allDay ? "All day" : formatTime(event.start);
    return `<button class="event-row" style="--c:${safeColor(event.color)}" data-act="event" data-id="${escapeHtml(event.summary)}|${event.start?.toISOString?.() || ""}"><span>${time}</span><span><b>${escapeHtml(event.summary)}</b><small>${escapeHtml(event.location || event.calendarName)}</small></span><span class="avatar">${escapeHtml(event.avatar || "")}</span></button>`;
  }

  _calendarHtml(model) {
    const modes = ["agenda", "week", "month"].map((mode) => `<button class="${this._ui.cal === mode ? "on" : ""}" data-act="cal" data-mode="${mode}">${capitalizeFirst(mode)}</button>`).join("");
    const filters = [...model.members, ...model.extras].map((item) => `<button class="${item.shown ? "on" : ""}" style="--c:${item.color}" data-act="filter" data-entity="${escapeHtml(item.filter_entity || "")}" data-script="${escapeHtml(item.toggle_script || "")}">${escapeHtml(item.avatar || "")} ${escapeHtml(item.name)}</button>`).join("");
    let body = "";
    if (this._ui.cal === "week") body = this._weekHtml(model);
    else if (this._ui.cal === "month") body = this._monthHtml(model);
    else body = this._agendaHtml(model);
    const label = this._ui.cal === "month"
      ? new Date(model.now.getFullYear(), model.now.getMonth() + this._ui.monthOffset, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : `Week of ${monthDay(addDays(startOfWeek(model.now, model.household.week_start), this._ui.weekOffset * 7))}`;
    return `<div class="calendar"><div class="cal-toolbar"><div class="switch">${modes}</div><button class="arrow" data-act="shift" data-dir="-1" aria-label="Previous">‹</button><strong>${label}</strong><button class="arrow" data-act="shift" data-dir="1" aria-label="Next">›</button><button class="add-btn" data-act="add-event">Add event</button></div><div class="filters">${filters}</div>${body}</div>`;
  }

  _weekHtml(model) {
    const start = addDays(startOfWeek(model.now, model.household.week_start), this._ui.weekOffset * 7);
    const cols = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(start, index);
      const items = eventsOnDay(model.events, day).map((event) => `<button class="pill" style="--c:${safeColor(event.color)}" data-act="event" data-id="${escapeHtml(event.summary)}|${event.start?.toISOString?.() || ""}"><small>${event.allDay ? "All day" : formatTime(event.start)}</small><b>${escapeHtml(event.summary)}</b></button>`).join("");
      const forecast = this._forecastFor(day);
      return `<section class="day-col ${sameDay(day, model.now) ? "today" : ""}"><div class="day-h"><div><div class="wd">${weekdayName(day, "short")}</div><div class="num">${day.getDate()}</div></div><small class="muted">${forecast ? `${forecast.temperature}°` : ""}</small></div><div class="pills">${items || `<span class="muted">Open</span>`}</div></section>`;
    }).join("");
    return `<div class="week">${cols}</div>`;
  }

  _monthHtml(model) {
    const anchor = new Date(model.now.getFullYear(), model.now.getMonth() + this._ui.monthOffset, 1);
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const headers = (model.household.week_start === "sunday" ? ["Sun", ...names.slice(0, 6)] : names).map((name) => `<div class="wd">${name}</div>`).join("");
    const cells = monthGrid(anchor, model.household.week_start).map((day) => {
      const items = eventsOnDay(model.events, day).slice(0, 3).map((event) => `<span class="mini" style="--c:${safeColor(event.color)}">${escapeHtml(event.summary)}</span>`).join("");
      const extra = eventsOnDay(model.events, day).length;
      return `<button class="cell ${day.getMonth() === anchor.getMonth() ? "" : "off"} ${sameDay(day, model.now) ? "today" : ""}" data-act="day" data-date="${dateKey(day)}"><div class="num">${day.getDate()}</div>${items}${extra > 3 ? `<span class="muted">+${extra - 3}</span>` : ""}</button>`;
    }).join("");
    return `<div class="month">${headers}${cells}</div>`;
  }

  _agendaHtml(model) {
    const start = startOfDay(model.now);
    const blocks = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(start, index);
      const items = eventsOnDay(model.events, day);
      if (!items.length && index > 0) return "";
      return `<section class="agenda-day"><h4>${index === 0 ? "Today" : index === 1 ? "Tomorrow" : weekdayName(day)} · ${monthDay(day)}</h4>${items.map((event) => this._eventRow(event)).join("") || `<div class="muted">Nothing scheduled</div>`}</section>`;
    }).join("");
    return `<div class="agenda-days">${blocks}</div>`;
  }

  _choresHtml(model) {
    const cols = model.members.map((member) => {
      const chores = member.chores.map((chore) => `<button class="chore ${chore.done ? "done" : ""}" data-act="chore" data-person="${member.id}" data-slot="${chore.slot}"><span class="ico">${escapeHtml(chore.icon || "⭐")}</span><span><b>${escapeHtml(chore.name)}</b><small>${chore.cadence === "weekly" ? "Weekly" : "Daily"} · ${chore.stars}★${chore.streak >= 2 ? ` · <span class="flame">${chore.streak} streak</span>` : ""}</small></span><span class="mark">${chore.done ? "✓" : `+${chore.stars}`}</span></button>`).join("");
      return `<section class="person-col" style="--c:${member.color}"><div class="person-top"><div class="big-avatar">${escapeHtml(member.avatar)}</div><div><h3>${escapeHtml(member.name)}</h3><div class="stars">★ ${member.stars}</div>${member.bestStreak >= 2 ? `<div class="flame">${member.bestStreak} streak</div>` : ""}${member.allDailyDone ? `<div class="all-done">Today is done</div>` : ""}</div></div>${chores || `<div class="muted">No chores yet. Add names in household.json.</div>`}</section>`;
    }).join("");
    return `<div class="chores">${cols}</div>`;
  }

  _mealsHtml(model) {
    const start = startOfWeek(model.now, model.household.week_start);
    const headers = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(start, index);
      return `<div class="mh ${sameDay(day, model.now) ? "today" : ""}">${weekdayName(day, "short")}<b>${day.getDate()}</b></div>`;
    }).join("");
    const rows = MEALS.map((meal) => {
      const label = `<div class="ml">${capitalizeFirst(meal)}</div>`;
      const cells = Array.from({ length: 7 }, (_, index) => {
        const day = addDays(start, index);
        const key = dayKey(day);
        const value = model.meals[key]?.[meal] || "";
        return `<button class="meal ${sameDay(day, model.now) ? "today" : ""}" data-act="meal" data-day="${key}" data-meal="${meal}">${value ? escapeHtml(value) : "<em>Add</em>"}</button>`;
      }).join("");
      return label + cells;
    }).join("");
    return `<div class="meals"><div class="view-head"><div><div class="eyebrow">Repeats every week</div><h2 class="page-title">Meal plan</h2></div><button class="arrow" data-act="clear-meals">Clear week</button></div><div class="grid-meal"><div></div>${headers}${rows}</div></div>`;
  }

  _listsHtml(model) {
    return `<div class="lists">${this._listCard(model, "groceries", "Groceries", model.household.lists?.groceries)}${this._listCard(model, "todos", "To-dos", model.household.lists?.todos)}</div>`;
  }

  _listCard(model, key, title, entity) {
    if (model.listMissing[key]) {
      return `<section class="list-card"><h3>${title}</h3><p>Create <b>${escapeHtml(entity || "")}</b> in Home Assistant, then refresh. Groceries use the built-in shopping list. To-dos use a Local to-do list named Family Tasks.</p></section>`;
    }
    const items = model.lists[key] || [];
    const open = items.filter((item) => item.status !== "completed");
    const done = items.filter((item) => item.status === "completed");
    const rows = [...open, ...done].map((item) => `<div class="item ${item.status === "completed" ? "done" : ""}"><button class="item-main" data-act="toggle-item" data-list="${key}" data-uid="${escapeHtml(item.uid)}" data-summary="${escapeHtml(item.summary)}"><span class="box">${item.status === "completed" ? "✓" : ""}</span><span class="name">${escapeHtml(item.summary)}</span></button><button class="ghost" data-act="remove-item" data-list="${key}" data-uid="${escapeHtml(item.uid)}" data-summary="${escapeHtml(item.summary)}">Remove</button></div>`).join("");
    return `<section class="list-card"><div class="section-h"><h3>${title}</h3><span>${open.length} open</span></div><div class="items">${rows || `<div class="muted">Nothing here yet.</div>`}</div><div class="view-head"><button class="add-btn" data-act="add-item" data-list="${key}">Add</button>${done.length ? `<button class="ghost" data-act="clear-done" data-list="${key}">Clear done</button>` : ""}</div></section>`;
  }

  _rewardsHtml(model) {
    const selected = model.members.find((member) => member.id === this._ui.rewardPerson) || model.members[0];
    if (!selected) return "";
    const people = model.members.map((member) => `<button class="${member.id === selected.id ? "on" : ""}" data-act="reward-person" data-person="${member.id}">${escapeHtml(member.avatar)} ${escapeHtml(member.name)}</button>`).join("");
    const cards = (model.household.rewards || []).map((reward) => {
      const short = selected.stars < reward.cost;
      return `<button class="reward ${short ? "short" : ""}" data-act="reward" data-id="${escapeHtml(reward.id)}"><span class="emoji">${escapeHtml(reward.emoji || "🎁")}</span><b>${escapeHtml(reward.name)}</b><small>${escapeHtml(reward.detail || "")}</small><span class="cost">${short ? `${reward.cost - selected.stars} more ★` : `${reward.cost} ★`}</span></button>`;
    }).join("");
    const recent = selected.log.length ? selected.log.map((line) => `<div>${escapeHtml(line)}</div>`).join("") : `<div class="muted">No treats redeemed yet.</div>`;
    return `<div class="rewards"><div class="person-switch">${people}</div><div class="balance"><div class="big-avatar" style="--c:${selected.color}">${escapeHtml(selected.avatar)}</div><div><div class="eyebrow">${escapeHtml(selected.name)}'s stars</div><strong>★ ${selected.stars}</strong></div></div><div class="reward-grid">${cards}</div><div class="card" style="padding:14px 18px"><div class="eyebrow">Recent</div>${recent}</div></div>`;
  }

  _sheetHtml(model) {
    const sheet = this._ui.sheet;
    if (!sheet || !model) return "";
    if (sheet.type === "settings") return this._settingsHtml(model);
    if (sheet.type === "meal") return this._mealSheet(model, sheet);
    if (sheet.type === "item") return this._itemSheet(model, sheet);
    if (sheet.type === "event-form") return this._eventSheet(model, sheet);
    if (sheet.type === "reward") return this._rewardSheet(model, sheet);
    if (sheet.type === "day") return this._daySheet(model, sheet);
    if (sheet.type === "event") return this._eventDetail(model, sheet);
    return "";
  }

  _settingsHtml(model) {
    const settings = model.settings;
    const choice = (act, value, current, label) => `<button class="choice ${String(current) === String(value) ? "on" : ""}" data-act="${act}" data-value="${value}">${label}</button>`;
    return `<div class="sheet"><div class="sheet-top"><h2>Settings</h2><button class="arrow" data-act="close">Close</button></div>
      <p class="eyebrow">Screensaver</p><div class="choices">${[2, 5, 8, 15, 30].map((min) => choice("idle", min, settings.idle, `${min} min`)).join("")}</div>
      <p class="eyebrow">Sleep</p><div class="choices"><button class="choice ${settings.sleepOn ? "on" : ""}" data-act="sleep-on">${settings.sleepOn ? "On" : "Off"}</button></div>
      <p class="eyebrow">Dim at</p><div class="choices">${["20:30", "21:00", "21:30", "22:00", "22:30"].map((time) => choice("sleep-start", time, String(settings.sleepStart).slice(0, 5), time)).join("")}</div>
      <p class="eyebrow">Wake</p><div class="choices">${["06:00", "06:30", "07:00", "07:30"].map((time) => choice("sleep-end", time, String(settings.sleepEnd).slice(0, 5), time)).join("")}</div>
      <p class="eyebrow">Stay awake after a tap</p><div class="choices">${[5, 10, 20].map((min) => choice("wake", min, settings.wake, `${min} min`)).join("")}</div>
      <p class="eyebrow">Sounds</p><div class="choices"><button class="choice ${settings.sound ? "on" : ""}" data-act="sound">${settings.sound ? "Chimes on" : "Quiet"}</button></div>
      <div class="choices" style="margin-top:16px"><button class="primary" data-act="preview-saver">Preview screensaver</button><button class="choice" data-act="refresh-photos">Refresh photos</button><button class="choice" data-act="reload-household">Reload household</button></div>
      <p class="muted">Names, chores, and rewards live in www/skylight-wall/household.json.</p></div>`;
  }

  _mealSheet(model, sheet) {
    const presets = (model.household.meal_presets || []).map((meal) => `<button class="choice ${sheet.draft === meal ? "on" : ""}" data-act="draft" data-value="${escapeHtml(meal)}">${escapeHtml(meal)}</button>`).join("");
    return `<div class="sheet"><div class="sheet-top"><h2>${capitalizeFirst(sheet.meal)} · ${sheet.day.toUpperCase()}</h2><button class="arrow" data-act="close">Close</button></div><div class="draft">${escapeHtml(sheet.draft || "Tap a meal or type")}</div><div class="choices">${presets}</div>${this._keyboard(sheet)}<button class="primary" data-act="save-meal">Save meal</button></div>`;
  }

  _itemSheet(model, sheet) {
    const presets = (model.household.list_presets || []).map((item) => `<button class="choice" data-act="draft" data-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");
    return `<div class="sheet"><div class="sheet-top"><h2>${sheet.list === "groceries" ? "Add grocery" : "Add to-do"}</h2><button class="arrow" data-act="close">Close</button></div><div class="draft">${escapeHtml(sheet.draft || "Type an item")}</div><div class="choices">${presets}</div>${this._keyboard(sheet)}<button class="primary" data-act="save-item">Add</button></div>`;
  }

  _eventSheet(model, sheet) {
    const people = [...model.members, ...model.extras].map((item) => `<button class="choice ${sheet.person === item.id ? "on" : ""}" data-act="person" data-value="${item.id}">${escapeHtml(item.avatar || "")} ${escapeHtml(item.name)}</button>`).join("");
    const days = Array.from({ length: 10 }, (_, index) => {
      const day = addDays(startOfDay(model.now), index);
      const key = dateKey(day);
      const label = index === 0 ? "Today" : index === 1 ? "Tomorrow" : weekdayName(day, "short");
      return `<button class="choice ${sheet.date === key ? "on" : ""}" data-act="date" data-value="${key}">${label}<br>${day.getDate()}</button>`;
    }).join("");
    const hours = [8, 9, 10, 12, 15, 16, 17, 18, 19].map((hour) => {
      const label = formatTime(new Date(2026, 0, 1, hour, 0));
      return `<button class="choice ${Number(sheet.hour) === hour ? "on" : ""}" data-act="hour" data-value="${hour}">${label}</button>`;
    }).join("");
    const durations = [30, 45, 60, 90, 120].map((minutes) => `<button class="choice ${Number(sheet.duration) === minutes ? "on" : ""}" data-act="duration" data-value="${minutes}">${minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}</button>`).join("");
    const presets = (model.household.event_presets || []).map((title) => `<button class="choice ${sheet.draft === title ? "on" : ""}" data-act="draft" data-value="${escapeHtml(title)}">${escapeHtml(title)}</button>`).join("");
    return `<div class="sheet"><div class="sheet-top"><h2>Add event</h2><button class="arrow" data-act="close">Close</button></div><div class="split"><div><div class="draft">${escapeHtml(sheet.draft || "What's happening?")}</div><div class="choices">${presets}</div>${this._keyboard(sheet)}</div><div><p class="eyebrow">Who</p><div class="choices">${people}</div><p class="eyebrow">Day</p><div class="choices">${days}</div><p class="eyebrow">When</p><div class="choices"><button class="choice ${sheet.allDay ? "on" : ""}" data-act="all-day">${sheet.allDay ? "All day" : "Timed"}</button></div>${sheet.allDay ? "" : `<div class="choices">${hours}</div><div class="choices">${durations}</div>`}<button class="primary" data-act="save-event" ${sheet.draft ? "" : "disabled"}>Add to calendar</button></div></div></div>`;
  }

  _rewardSheet(model, sheet) {
    const member = model.members.find((item) => item.id === sheet.person);
    const reward = (model.household.rewards || []).find((item) => item.id === sheet.id);
    if (!member || !reward) return "";
    return `<div class="sheet" style="width:560px"><h2>${escapeHtml(reward.emoji || "")} ${escapeHtml(reward.name)}</h2><p>${escapeHtml(reward.detail || "")}</p><p><b>${escapeHtml(member.name)}</b> has ★ ${member.stars}. This costs ★ ${reward.cost}.</p><div class="choices"><button class="arrow" data-act="close">Not now</button><button class="primary" data-act="confirm-reward">Redeem</button></div></div>`;
  }

  _daySheet(model, sheet) {
    const day = parseDate(sheet.date);
    const items = eventsOnDay(model.events, day);
    return `<div class="sheet"><div class="sheet-top"><h2>${weekdayName(day)} · ${monthDay(day)}</h2><button class="arrow" data-act="close">Close</button></div>${items.map((event) => this._eventRow(event)).join("") || `<p class="muted">Nothing scheduled.</p>`}<button class="primary" data-act="add-event" data-date="${sheet.date}">Add on this day</button></div>`;
  }

  _eventDetail(model, sheet) {
    const event = model.events.find((item) => `${item.summary}|${item.start?.toISOString?.() || ""}` === sheet.id)
      || this._events.find((item) => `${item.summary}|${item.start?.toISOString?.() || ""}` === sheet.id);
    if (!event) return `<div class="sheet"><h2>Event</h2><button class="arrow" data-act="close">Close</button></div>`;
    return `<div class="sheet" style="width:640px"><div class="sheet-top"><h2>${escapeHtml(event.summary)}</h2><button class="arrow" data-act="close">Close</button></div><p>${event.allDay ? "All day" : `${formatTime(event.start)}${event.end ? ` – ${formatTime(event.end)}` : ""}`}</p><p>${escapeHtml(event.avatar || "")} ${escapeHtml(event.calendarName)}</p>${event.location ? `<p>${escapeHtml(event.location)}</p>` : ""}${event.description ? `<p>${escapeHtml(event.description)}</p>` : ""}<p class="muted">Change or delete this event on the phone. New events can be added here.</p></div>`;
  }

  _keyboard(sheet) {
    const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    const shift = sheet.shift || !sheet.draft;
    const key = (char) => {
      const shown = shift ? char.toUpperCase() : char;
      return `<button class="key" data-act="key" data-key="${shown}">${shown}</button>`;
    };
    return `<div class="keys" style="margin-top:12px">${rows.map((row) => [...row].map(key).join("")).join("<span style='flex-basis:100%;height:0'></span>")}<button class="key wide" data-act="key" data-key=" ">space</button><button class="key wide" data-act="key" data-key="back">delete</button></div>`;
  }

  _syncChrome(model) {
    const asleep = this._asleep();
    const sleep = this.shadowRoot.querySelector(".sleep");
    const saver = this.shadowRoot.querySelector(".saver");
    const dim = this.shadowRoot.querySelector(".dim");
    const back = this.shadowRoot.querySelector(".sheet-back");
    sleep.classList.toggle("show", asleep);
    if (asleep) {
      sleep.innerHTML = `<div><div class="clock-time" data-clock>${formatClock(this._now)}</div><div>${weekdayName(this._now)} · ${monthDay(this._now)}</div><p>Tap to wake</p></div>`;
    }
    const showSaver = !asleep && this._ui.saver && !this._ui.sheet;
    saver.classList.toggle("show", showSaver);
    if (showSaver) this._paintSaver(model);
    const settings = model?.settings || this._settings();
    const amount = asleep ? 0 : dimAmount(this._now, settings.sleepStart, settings.sleepOn);
    dim.style.opacity = String(amount * 0.62);
    back.classList.toggle("show", Boolean(this._ui.sheet));
    back.innerHTML = this._ui.sheet ? this._sheetHtml(model) : "";
  }

  _paintSaver(model) {
    const saver = this.shadowRoot.querySelector(".saver");
    const photo = this._photos.length ? this._photos[this._photo % this._photos.length] : "";
    const art = photo
      ? `url("${photo}")`
      : `linear-gradient(165deg, ${FALLBACK_ART[this._photo % FALLBACK_ART.length].join(",")})`;
    const scenery = photo ? "" : `<div class="sun"></div><div class="hill"></div>`;
    const next = model?.next;
    const line = next
      ? `<b>${escapeHtml(next.event.summary)}</b><div>${next.when === "allday" ? "All day" : countdownLabel(next.event.start, this._now)}</div>`
      : `<b>Nothing coming up</b>`;
    const weather = model?.weather?.temp != null ? `${weatherEmoji(model.weather.condition)} ${model.weather.temp}°` : "";
    saver.innerHTML = `<div class="slide show" style="background-image:${art}"></div>${scenery}<div class="saver-shade"></div><div class="saver-copy"><div><div class="clock-time" data-clock>${formatClock(this._now)}</div><div>${weekdayName(this._now)} · ${monthDay(this._now)}</div></div><div class="saver-next">${line}<div>${weather}</div></div></div>`;
  }

  _paintClocks() {
    const label = formatClock(this._now || new Date());
    this.shadowRoot.querySelectorAll("[data-clock]").forEach((node) => { node.textContent = label; });
    this.shadowRoot.querySelectorAll("[data-countdown]").forEach((node) => {
      const when = parseDate(node.dataset.countdown);
      if (when) node.textContent = countdownLabel(when, this._now);
    });
  }

  _checkIdle() {
    if (!this._ready || this.config.preview) return;
    if (this._ui.sheet) return;
    const asleep = inSleepWindow(this._now, this._settings().sleepStart, this._settings().sleepEnd, this._settings().sleepOn)
      && Date.now() > (this._ui.awakeUntil || 0);
    if (asleep) {
      if (!this._wasAsleep) { this._wasAsleep = true; this._sig = ""; this._paint(); }
      return;
    }
    if (this._wasAsleep) { this._wasAsleep = false; this._sig = ""; this._paint(); }
    const idleMs = (this._settings().idle || 5) * 60000;
    const shouldSave = Date.now() - this._lastInput > idleMs;
    if (shouldSave !== this._ui.saver) {
      this._ui.saver = shouldSave;
      if (shouldSave) this._advancePhoto();
      this._syncChrome(this._modelCache);
    } else if (shouldSave && this._now.getSeconds() % 12 === 0) {
      this._advancePhoto();
      this._paintSaver(this._modelCache);
    }
  }

  _advancePhoto() {
    const count = Math.max(this._photos.length, FALLBACK_ART.length);
    this._photo = (this._photo + 1) % count;
  }

  _act(data) {
    const act = data.act;
    if (act === "nav") { this._ui.view = data.view; this._ui.sheet = null; this._ui.saver = false; }
    else if (act === "cal") this._ui.cal = data.mode;
    else if (act === "shift") this._shift(Number(data.dir));
    else if (act === "settings") this._ui.sheet = { type: "settings" };
    else if (act === "close") this._ui.sheet = null;
    else if (act === "add-event") this._ui.sheet = { type: "event-form", draft: "", shift: true, person: "family", date: data.date || dateKey(this._now), hour: 16, duration: 60, allDay: false };
    else if (act === "meal") this._ui.sheet = { type: "meal", day: data.day, meal: data.meal, draft: this._modelCache?.meals?.[data.day]?.[data.meal] || "", shift: true };
    else if (act === "add-item") this._ui.sheet = { type: "item", list: data.list, draft: "", shift: true };
    else if (act === "draft") { this._ui.sheet.draft = data.value; this._ui.sheet.shift = false; }
    else if (act === "key") this._type(data.key);
    else if (act === "person") this._ui.sheet.person = data.value;
    else if (act === "date") this._ui.sheet.date = data.value;
    else if (act === "hour") this._ui.sheet.hour = Number(data.value);
    else if (act === "duration") this._ui.sheet.duration = Number(data.value);
    else if (act === "all-day") this._ui.sheet.allDay = !this._ui.sheet.allDay;
    else if (act === "save-event") return this._saveEvent();
    else if (act === "save-meal") return this._saveMeal();
    else if (act === "save-item") return this._saveItem();
    else if (act === "clear-meals") return this._clearMeals();
    else if (act === "chore") return this._toggleChore(data.person, Number(data.slot));
    else if (act === "filter") return this._toggleFilter(data.entity, data.script);
    else if (act === "event") this._ui.sheet = { type: "event", id: data.id };
    else if (act === "day") this._ui.sheet = { type: "day", date: data.date };
    else if (act === "reward-person") this._ui.rewardPerson = data.person;
    else if (act === "reward") this._ui.sheet = { type: "reward", id: data.id, person: this._ui.rewardPerson };
    else if (act === "confirm-reward") return this._redeem();
    else if (act === "toggle-item") return this._toggleItem(data.list, data.uid, data.summary);
    else if (act === "remove-item") return this._removeItem(data.list, data.uid, data.summary);
    else if (act === "clear-done") return this._clearDone(data.list);
    else if (act === "idle") this._setNumber("input_number.skylight_idle_minutes", data.value, "idle");
    else if (act === "wake") this._setNumber("input_number.skylight_wake_minutes", data.value, "wake");
    else if (act === "sleep-start") this._setTime("input_datetime.skylight_sleep_start", data.value, "sleepStart");
    else if (act === "sleep-end") this._setTime("input_datetime.skylight_sleep_end", data.value, "sleepEnd");
    else if (act === "sleep-on") this._toggleBool("input_boolean.skylight_sleep_enabled", "sleepOn");
    else if (act === "sound") this._toggleBool("input_boolean.skylight_sound", "sound");
    else if (act === "preview-saver") { this._ui.sheet = null; this._ui.saver = true; this._lastInput = 0; }
    else if (act === "refresh-photos") return this._refreshPhotos();
    else if (act === "reload-household") return this._loadHousehold();
    this._sig = "";
    this._paint();
  }

  _shift(dir) {
    if (this._ui.cal === "month") this._ui.monthOffset += dir;
    else this._ui.weekOffset += dir;
  }

  _type(key) {
    const sheet = this._ui.sheet;
    if (!sheet) return;
    if (key === "back") sheet.draft = (sheet.draft || "").slice(0, -1);
    else sheet.draft = `${sheet.draft || ""}${key === " " ? " " : key}`;
    sheet.shift = !sheet.draft;
    this._sig = "";
    this._paint();
  }

  _toast(text) {
    const toast = this.shadowRoot.querySelector(".toast");
    toast.textContent = text;
    toast.classList.add("show");
    window.clearTimeout(this._toastTimer);
    this._toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  }

  _celebrate(member, chore, finished) {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      this._toast(`${member.name} · ${chore.name}`);
      return;
    }
    this._confetti(member.color);
    if (this._settings().sound) this._chime();
    this._toast(finished ? `${member.avatar} ${member.name} finished today's chores` : `${member.avatar} ${chore.name}  +${chore.stars}★`);
  }

  _confetti(color) {
    const canvas = this.shadowRoot.querySelector(".confetti");
    const rect = this.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    const colors = [color, "#ffd166", "#fff7e8", "#f4a261", "#ffffff"];
    const parts = Array.from({ length: 110 }, () => ({
      x: canvas.width * (0.35 + Math.random() * 0.3),
      y: canvas.height * 0.32,
      vx: (Math.random() - 0.5) * 11 * ratio,
      vy: (-8 - Math.random() * 7) * ratio,
      g: 0.18 * ratio,
      s: (5 + Math.random() * 7) * ratio,
      c: colors[Math.floor(Math.random() * colors.length)],
      life: 80 + Math.random() * 20,
    }));
    const step = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const part of parts) {
        part.life -= 1;
        if (part.life <= 0) continue;
        alive = true;
        part.x += part.vx;
        part.y += part.vy;
        part.vy += part.g;
        ctx.globalAlpha = Math.max(part.life, 0) / 100;
        ctx.fillStyle = part.c;
        ctx.fillRect(part.x, part.y, part.s, part.s * 0.62);
      }
      if (alive) requestAnimationFrame(step);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    requestAnimationFrame(step);
  }

  _chime() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!this._audio) this._audio = new AudioCtx();
    const now = this._audio.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const osc = this._audio.createOscillator();
      const gain = this._audio.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02 + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + index * 0.07);
      osc.connect(gain).connect(this._audio.destination);
      osc.start(now + index * 0.07);
      osc.stop(now + 0.5 + index * 0.07);
    });
  }

  async _toggleChore(person, slot) {
    const model = this._modelCache;
    const member = model.members.find((item) => item.id === person);
    const chore = member?.chores.find((item) => Number(item.slot) === Number(slot));
    if (!chore) return;
    const undo = chore.done;
    const streak = undo ? Math.max(0, (Number(chore.stored) || 0) - 1) : streakAfterComplete(chore.last, chore.cadence, chore.stored, model.now);
    const delta = undo ? -Number(chore.stars || 0) : Number(chore.stars || 0);
    if (this.config.demo) {
      const key = `${person}:${slot}`;
      this._demo.done[key] = undo ? "2000-01-01" : dateKey(model.now);
      this._demo.streak[key] = streak;
      this._demo.stars[person] = Math.max(0, (this._demo.stars[person] || 0) + delta);
    } else {
      await this._call("script", "skylight_complete_chore", {
        person, slot, streak, stars_delta: delta, undo,
      });
    }
    if (!undo) {
      const after = this._model();
      const updated = after?.members.find((item) => item.id === person);
      this._celebrate(member, chore, Boolean(updated?.allDailyDone));
    }
    this._sig = "";
    this._paint();
  }

  async _toggleFilter(entity, script) {
    if (!entity) return;
    if (this.config.demo) {
      this._demo.filters[entity] = this._demo.filters[entity] === "^$" ? ".*" : "^$";
    } else if (script) {
      const service = script.split(".")[1];
      await this._call("script", service, {});
    }
    this._sig = "";
    this._paint();
  }

  async _saveMeal() {
    const sheet = this._ui.sheet;
    const value = capitalizeFirst((sheet.draft || "").trim());
    if (this.config.demo) this._demo.meals[sheet.day][sheet.meal] = value;
    else await this._call("script", "skylight_set_meal", { day: sheet.day, meal: sheet.meal, value });
    this._ui.sheet = null;
    this._toast(value ? `Saved ${value}` : "Cleared");
    this._sig = "";
    this._paint();
  }

  async _clearMeals() {
    if (this.config.demo) {
      for (const day of Object.keys(this._demo.meals)) {
        for (const meal of MEALS) this._demo.meals[day][meal] = "";
      }
    } else await this._call("script", "skylight_clear_meals", {});
    this._toast("Week cleared");
    this._sig = "";
    this._paint();
  }

  async _saveItem() {
    const sheet = this._ui.sheet;
    const summary = capitalizeFirst((sheet.draft || "").trim());
    if (!summary) return;
    const entity = this._household.lists?.[sheet.list];
    if (this.config.demo) {
      this._demo.lists[sheet.list].unshift({ uid: `${Date.now()}`, summary, status: "needs_action" });
    } else {
      await this._call("todo", "add_item", { item: summary }, { entity_id: entity });
      await this._loadLists();
    }
    this._ui.sheet = null;
    this._toast(`Added ${summary}`);
    this._sig = "";
    this._paint();
  }

  async _toggleItem(list, uid, summary) {
    const items = this.config.demo ? this._demo.lists[list] : this._lists[list];
    const item = (items || []).find((entry) => entry.uid === uid || entry.summary === summary);
    if (!item) return;
    const next = item.status === "completed" ? "needs_action" : "completed";
    if (this.config.demo) item.status = next;
    else {
      await this._call("todo", "update_item", { item: item.uid || summary, status: next }, { entity_id: this._household.lists[list] });
      await this._loadLists();
    }
    this._sig = "";
    this._paint();
  }

  async _removeItem(list, uid, summary) {
    if (this.config.demo) {
      this._demo.lists[list] = this._demo.lists[list].filter((item) => item.uid !== uid);
    } else {
      await this._call("todo", "remove_item", { item: uid || summary }, { entity_id: this._household.lists[list] });
      await this._loadLists();
    }
    this._sig = "";
    this._paint();
  }

  async _clearDone(list) {
    const items = (this.config.demo ? this._demo.lists[list] : this._lists[list] || []).filter((item) => item.status === "completed");
    if (this.config.demo) this._demo.lists[list] = this._demo.lists[list].filter((item) => item.status !== "completed");
    else {
      for (const item of items) {
        await this._call("todo", "remove_item", { item: item.uid || item.summary }, { entity_id: this._household.lists[list] });
      }
      await this._loadLists();
    }
    this._sig = "";
    this._paint();
  }

  async _saveEvent() {
    const sheet = this._ui.sheet;
    const summary = capitalizeFirst((sheet.draft || "").trim());
    if (!summary) return;
    const meta = householdCalendars(this._household).find((item) => item.id === sheet.person) || householdCalendars(this._household)[0];
    const [year, month, day] = sheet.date.split("-").map(Number);
    if (this.config.demo) {
      const start = sheet.allDay ? parseDate(sheet.date) : new Date(year, month - 1, day, Number(sheet.hour), 0, 0, 0);
      const end = sheet.allDay ? start : new Date(start.getTime() + Number(sheet.duration) * 60000);
      this._events.push(normalizeEvent({
        summary,
        start: sheet.allDay ? sheet.date : start.toISOString(),
        end: sheet.allDay ? dateKey(addDays(start, 1)) : end.toISOString(),
      }, meta));
    } else if (sheet.allDay) {
      const end = dateKey(addDays(new Date(year, month - 1, day), 1));
      await this._call("calendar", "create_event", {
        summary,
        start_date: sheet.date,
        end_date: end,
      }, { entity_id: meta.entity });
      await this._loadEvents(true);
    } else {
      const start = new Date(year, month - 1, day, Number(sheet.hour), 0, 0, 0);
      const end = new Date(start.getTime() + Number(sheet.duration) * 60000);
      await this._call("calendar", "create_event", {
        summary,
        start_date_time: start.toISOString(),
        end_date_time: end.toISOString(),
      }, { entity_id: meta.entity });
      await this._loadEvents(true);
    }
    this._ui.sheet = null;
    this._toast(`Added ${summary}`);
    this._sig = "";
    this._paint();
  }

  async _redeem() {
    const sheet = this._ui.sheet;
    const model = this._modelCache;
    const member = model.members.find((item) => item.id === sheet.person);
    const reward = (model.household.rewards || []).find((item) => item.id === sheet.id);
    if (!member || !reward || member.stars < reward.cost) {
      this._toast("Not enough stars yet");
      return;
    }
    if (this.config.demo) {
      this._demo.stars[member.id] -= reward.cost;
      this._demo.rewards[member.id] = appendRewardLog(this._demo.rewards[member.id], reward.name, model.now);
    } else {
      await this._call("script", "skylight_redeem_reward", { person: member.id, cost: reward.cost, reward: reward.name });
    }
    this._ui.sheet = null;
    this._toast(`${member.name} redeemed ${reward.name}`);
    this._confetti(member.color);
    this._sig = "";
    this._paint();
  }

  _setNumber(entity, value, demoKey) {
    if (this.config.demo) this._demo[demoKey] = Number(value);
    else this._call("input_number", "set_value", { value: Number(value) }, { entity_id: entity });
  }

  _setTime(entity, value, demoKey) {
    if (this.config.demo) this._demo[demoKey] = value;
    else this._call("input_datetime", "set_datetime", { time: `${value}:00` }, { entity_id: entity });
  }

  _toggleBool(entity, demoKey) {
    if (this.config.demo) this._demo[demoKey] = !this._demo[demoKey];
    else {
      const on = this._state(entity, "on") !== "off";
      this._call("input_boolean", on ? "turn_off" : "turn_on", {}, { entity_id: entity });
    }
  }

  async _call(domain, service, data, target) {
    if (!this._hass?.callService) throw new Error("Home Assistant is not connected");
    return this._hass.callService(domain, service, data || {}, target || {}, false);
  }

  async _loadEvents(force) {
    if (this.config.demo || !this._hass || !this._household) return;
    if (!force && this._eventsLoaded && Date.now() - this._eventsLoaded < 300000) return;
    const ids = householdCalendars(this._household).map((item) => item.entity).filter(Boolean);
    if (!ids.length) return;
    const start = addDays(this._now || new Date(), -14);
    const end = addDays(this._now || new Date(), 60);
    try {
      const response = await this._hass.callService("calendar", "get_events", {
        start_date_time: start.toISOString(),
        end_date_time: end.toISOString(),
      }, { entity_id: ids }, true);
      const payload = response?.response || response || {};
      const metas = new Map(householdCalendars(this._household).map((item) => [item.entity, item]));
      const events = [];
      for (const [entity, body] of Object.entries(payload)) {
        const meta = metas.get(entity);
        if (!meta) continue;
        for (const raw of body?.events || []) events.push(normalizeEvent(raw, meta));
      }
      this._events = events;
      this._eventsLoaded = Date.now();
      this._sig = "";
      this._paint();
    } catch (error) {
      console.warn("calendar.get_events", error);
    }
  }

  async _loadForecast() {
    if (this.config.demo || !this._hass) return;
    try {
      const response = await this._hass.callService("weather", "get_forecasts", { type: "daily" }, { entity_id: this.config.weather_entity }, true);
      const payload = response?.response || response || {};
      const body = payload[this.config.weather_entity] || Object.values(payload)[0];
      this._forecast = body?.forecast || [];
      this._sig = "";
      this._paint();
    } catch (error) {
      console.warn("weather.get_forecasts", error);
    }
  }

  async _loadLists() {
    if (this.config.demo || !this._hass || !this._household) return;
    for (const key of ["groceries", "todos"]) {
      const entity = this._household.lists?.[key];
      if (!entity || !this._hass.states?.[entity]) {
        this._listMissing[key] = true;
        this._lists[key] = [];
        continue;
      }
      this._listMissing[key] = false;
      try {
        const response = await this._hass.callService("todo", "get_items", { status: ["needs_action", "completed"] }, { entity_id: entity }, true);
        const payload = response?.response || response || {};
        const body = payload[entity] || Object.values(payload)[0] || {};
        this._lists[key] = body.items || [];
      } catch (error) {
        console.warn("todo.get_items", error);
      }
    }
    this._sig = "";
    this._paint();
  }

  async _loadPhotos() {
    if (!this._hass || this.config.demo) return;
    try {
      const browsed = await this._hass.callWS({
        type: "media_source/browse_media",
        media_content_id: this.config.photo_media,
      });
      const children = (browsed.children || []).filter((child) => /image|jpe?g|png|webp|gif/i.test(`${child.media_content_type || ""} ${child.title || ""}`));
      const urls = [];
      for (const child of children.slice(0, 40)) {
        const resolved = await this._hass.callWS({
          type: "media_source/resolve_media",
          media_content_id: child.media_content_id,
          expires: 43200,
        });
        if (resolved?.url) urls.push(resolved.url);
      }
      if (urls.length) {
        this._photos = urls;
        return;
      }
    } catch (error) {
      console.warn("media source", error);
    }
    try {
      const response = await fetch(this.config.photo_manifest, { cache: "no-cache" });
      if (!response.ok) return;
      const data = await response.json();
      const files = Array.isArray(data) ? data : data.photos || [];
      this._photos = files.map((file) => (String(file).startsWith("/") ? file : `/local/photos/${file}`));
    } catch (error) {
      console.warn("photo manifest", error);
    }
  }

  async _refreshPhotos() {
    if (!this.config.demo) {
      try { await this._call("shell_command", "skylight_photo_manifest", {}); } catch (error) { console.warn(error); }
      await this._loadPhotos();
    }
    this._toast(this._photos.length ? `${this._photos.length} photos` : "Using painted slides until photos are added");
    this._sig = "";
    this._paint();
  }

  _forecastFor(day) {
    return this._forecast.find((entry) => {
      const when = parseDate(entry.datetime || entry.datetime);
      return when && sameDay(when, day);
    });
  }
}

if (!customElements.get("skylight-wall-card")) {
  customElements.define("skylight-wall-card", SkylightWallCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "skylight-wall-card",
    name: "Skylight Wall",
    description: "Glanceable family wall for calendar, chores, meals, lists, and rewards",
  });
}
