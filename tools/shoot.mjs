import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const port = 9222;
const base = process.argv[2] || "http://127.0.0.1:8765/preview/index.html";
const shots = [
  ["home", "01-home.png"],
  ["calendar", "02-calendar.png"],
  ["chores", "03-chores.png"],
  ["meals", "04-meals.png"],
  ["lists", "05-lists.png"],
  ["rewards", "06-rewards.png"],
  ["saver", "07-screensaver.png"],
  ["sleep", "08-sleep.png"],
  ["settings", "09-settings.png"],
];

function startChrome() {
  return spawn("google-chrome", [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    "--window-size=1920,1080",
    "--force-device-scale-factor=1",
    "about:blank",
  ], { stdio: "ignore" });
}

async function waitForChrome() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return response.json();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error("Chrome did not start");
}

const chrome = startChrome();
const version = await waitForChrome();
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});

let nextId = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  } else if (message.method) {
    events.push(message);
  }
});

function send(method, params = {}, sessionId) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Emulation.setDeviceMetricsOverride", {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  mobile: false,
}, sessionId);

async function open(view) {
  events.length = 0;
  await send("Page.navigate", { url: `${base}?view=${view}` }, sessionId);
  const started = Date.now();
  while (Date.now() - started < 8000) {
    if (events.some((event) => event.method === "Page.loadEventFired")) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  const readyStarted = Date.now();
  while (Date.now() - readyStarted < 8000) {
    const result = await send("Runtime.evaluate", {
      expression: "document.querySelector('skylight-wall-card')?.dataset.ready || ''",
      returnByValue: true,
    }, sessionId);
    if (result.result?.value === "1") return;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  const err = await send("Runtime.evaluate", {
    expression: "document.querySelector('skylight-wall-card')?.shadowRoot?.textContent?.slice(0, 500) || document.body.innerText.slice(0, 500)",
    returnByValue: true,
  }, sessionId);
  throw new Error(`View ${view} did not render: ${err.result?.value}`);
}

async function shot(name) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  const path = `/workspace/assets/mockups/${name}`;
  writeFileSync(path, Buffer.from(data, "base64"));
  console.log("wrote", path);
}

for (const [view, file] of shots) {
  await open(view);
  await shot(file);
}

await open("chores");
const click = await send("Runtime.evaluate", {
  expression: `(() => {
    const root = document.querySelector('skylight-wall-card').shadowRoot;
    const before = root.querySelector('.stars')?.textContent;
    const chore = root.querySelector('[data-act="chore"][data-person="p4"][data-slot="2"]');
    chore.click();
    const afterStars = root.querySelectorAll('.person-col')[3].querySelector('.stars').textContent;
    const done = root.querySelector('[data-person="p4"][data-slot="2"]').classList.contains('done');
    const toast = root.querySelector('.toast').classList.contains('show');
    return JSON.stringify({ before, afterStars, done, toast, label: chore.innerText });
  })()`,
  returnByValue: true,
}, sessionId);
console.log("chore", click.result?.value);
await new Promise((resolve) => setTimeout(resolve, 280));
await shot("03b-chore-done.png");

await open("meals");
const meal = await send("Runtime.evaluate", {
  expression: `(() => {
    const root = document.querySelector('skylight-wall-card').shadowRoot;
    root.querySelector('[data-act="meal"][data-day="sun"][data-meal="dinner"]').click();
    const preset = [...root.querySelectorAll('[data-act="draft"]')].find((node) => node.dataset.value === 'Pizza');
    preset.click();
    root.querySelector('[data-act="save-meal"]').click();
    const cell = root.querySelector('[data-day="sun"][data-meal="dinner"]').textContent;
    return cell;
  })()`,
  returnByValue: true,
}, sessionId);
console.log("meal", meal.result?.value);

await open("lists");
const list = await send("Runtime.evaluate", {
  expression: `(() => {
    const root = document.querySelector('skylight-wall-card').shadowRoot;
    const row = [...root.querySelectorAll('[data-act="toggle-item"]')].find((node) => node.dataset.summary === 'Milk');
    row.click();
    const fresh = [...root.querySelectorAll('[data-act="toggle-item"]')].find((node) => node.dataset.summary === 'Milk');
    return fresh.closest('.item').classList.contains('done');
  })()`,
  returnByValue: true,
}, sessionId);
console.log("list", list.result?.value);

await open("home");
const font = await send("Runtime.evaluate", {
  expression: `(() => {
    const root = document.querySelector('skylight-wall-card').shadowRoot;
    const clock = root.querySelector('.clock-time');
    const family = root.querySelector('.family');
    return JSON.stringify({
      clock: getComputedStyle(clock).fontFamily,
      clockSize: getComputedStyle(clock).fontSize,
      family: family.textContent,
      next: root.querySelector('.next-title')?.textContent,
      dinner: root.querySelector('.dinner-name')?.textContent,
    });
  })()`,
  returnByValue: true,
}, sessionId);
console.log("font", font.result?.value);

ws.close();
chrome.kill();
