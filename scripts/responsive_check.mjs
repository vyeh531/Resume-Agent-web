import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import net from "node:net";
import { join, resolve } from "node:path";

const root = resolve(".");
const outDir = join(root, "outputs", "responsive-check");
mkdirSync(outDir, { recursive: true });

const pages = [
  { name: "home", path: "/" },
  { name: "login", path: "/login" },
  { name: "result", path: "/result" },
  { name: "payment", path: "/payment" },
  { name: "report", path: "/report" },
];

const viewports = [
  { name: "iphone", width: 390, height: 844, scale: 3, mobile: true },
  { name: "tablet", width: 768, height: 1024, scale: 2, mobile: true },
  { name: "desktop", width: 1440, height: 1000, scale: 1, mobile: false },
];

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

function request(url, options = {}) {
  return new Promise((resolveRequest, reject) => {
    const req = http.request(url, options, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => resolveRequest({ statusCode: res.statusCode, data }));
    });
    req.on("error", reject);
    req.end();
  });
}

async function waitForHttp(url, timeoutMs = 30000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await request(url);
      if (res.statusCode && res.statusCode < 500) return;
    } catch (error) {
      lastError = error;
    }
    await wait(500);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

function startNext() {
  const child = spawn(
    "C:\\Program Files\\nodejs\\node.exe",
    ["node_modules\\next\\dist\\bin\\next", "dev", "--port", "3000"],
    {
      cwd: root,
      env: { ...process.env, PATH: process.env.Path || process.env.PATH },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    }
  );
  child.stdout.on("data", (data) => process.stdout.write(data));
  child.stderr.on("data", (data) => process.stderr.write(data));
  return child;
}

function startChrome(port) {
  const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (!existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}`);
  const profile = join(outDir, `chrome-profile-${port}`);
  rmSync(profile, { recursive: true, force: true });
  mkdirSync(profile, { recursive: true });
  return spawn(
    chrome,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"], windowsHide: true }
  );
}

class CdpSocket {
  constructor(wsUrl) {
    this.wsUrl = new URL(wsUrl);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.fragments = [];
  }

  async connect() {
    this.socket = net.createConnection(Number(this.wsUrl.port), this.wsUrl.hostname);
    await new Promise((resolveConnect, reject) => {
      this.socket.once("connect", resolveConnect);
      this.socket.once("error", reject);
    });

    const key = randomBytes(16).toString("base64");
    const requestText = [
      `GET ${this.wsUrl.pathname}${this.wsUrl.search} HTTP/1.1`,
      `Host: ${this.wsUrl.host}`,
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Key: ${key}`,
      "Sec-WebSocket-Version: 13",
      "",
      "",
    ].join("\r\n");
    this.socket.write(requestText);

    await new Promise((resolveHandshake, reject) => {
      let handshake = Buffer.alloc(0);
      const onData = (chunk) => {
        handshake = Buffer.concat([handshake, chunk]);
        const marker = handshake.indexOf("\r\n\r\n");
        if (marker === -1) return;
        this.socket.off("data", onData);
        const header = handshake.slice(0, marker).toString("utf8");
        if (!header.includes("101")) {
          reject(new Error(`WebSocket handshake failed: ${header}`));
          return;
        }
        const rest = handshake.slice(marker + 4);
        if (rest.length) this._onData(rest);
        this.socket.on("data", (data) => this._onData(data));
        resolveHandshake();
      };
      this.socket.on("data", onData);
      this.socket.once("error", reject);
    });
  }

  _onData(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      let offset = 2;
      let length = second & 0x7f;
      if (length === 126) {
        if (this.buffer.length < 4) return;
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) return;
        length = Number(this.buffer.readBigUInt64BE(2));
        offset = 10;
      }
      const masked = (second & 0x80) !== 0;
      const maskLength = masked ? 4 : 0;
      if (this.buffer.length < offset + maskLength + length) return;
      const mask = masked ? this.buffer.slice(offset, offset + 4) : null;
      offset += maskLength;
      let payload = this.buffer.slice(offset, offset + length);
      this.buffer = this.buffer.slice(offset + length);
      if (mask) {
        payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
      }
      const fin = (first & 0x80) !== 0;
      const opcode = first & 0x0f;
      if (opcode === 8) return;
      if (opcode === 1 && !fin) {
        this.fragments = [payload];
        continue;
      }
      if (opcode === 0) {
        this.fragments.push(payload);
        if (!fin) continue;
        payload = Buffer.concat(this.fragments);
        this.fragments = [];
      } else if (opcode !== 1) {
        continue;
      }
      const message = JSON.parse(payload.toString("utf8"));
      if (message.id && this.pending.has(message.id)) {
        const { resolve: resolvePending, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolvePending(message.result);
      } else {
        this.events.push(message);
      }
    }
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const payload = Buffer.from(JSON.stringify({ id, method, params }));
    let header;
    if (payload.length < 126) {
      header = Buffer.alloc(2);
      header[1] = payload.length | 0x80;
    } else if (payload.length < 65536) {
      header = Buffer.alloc(4);
      header[1] = 126 | 0x80;
      header.writeUInt16BE(payload.length, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 127 | 0x80;
      header.writeBigUInt64BE(BigInt(payload.length), 2);
    }
    header[0] = 0x81;
    const mask = randomBytes(4);
    const masked = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    this.socket.write(Buffer.concat([header, mask, masked]));
    return new Promise((resolvePending, reject) => {
      this.pending.set(id, { resolve: resolvePending, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, 15000);
    });
  }

  async waitFor(method, timeoutMs = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const index = this.events.findIndex((event) => event.method === method);
      if (index >= 0) return this.events.splice(index, 1)[0];
      await wait(100);
    }
    throw new Error(`Timed out waiting for ${method}`);
  }

  close() {
    this.socket?.destroy();
  }
}

async function newPage(port, url) {
  const res = await request(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
  });
  return JSON.parse(res.data);
}

async function testOne(port, page, viewport) {
  const url = `http://127.0.0.1:3000${page.path}`;
  const target = await newPage(port, "about:blank");
  const cdp = new CdpSocket(target.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.scale,
    mobile: viewport.mobile,
  });
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/" });
  await cdp.waitFor("Page.loadEventFired");
  await wait(500);
  await cdp.send("Runtime.evaluate", {
    awaitPromise: true,
    expression: `(() => {
      const mock = window.MOCK || {};
      const state = {
        resumeName: mock?.student?.fileName || "resume_v3.pdf",
        jobTitle: mock?.job?.title || "Product Manager",
        isPaid: true,
        atsResult: mock,
        premiumMentors: mock.mentors || [],
        reportPageMentorGroups: null,
        premiumAdviceItems: [],
        premiumKeywordBreakdown: mock.skillGap || [],
        missingKeywordChecklist: mock.skillGap || [],
        companyInsiderTips: [],
        mentorLogoPool: null
      };
      localStorage.setItem("resumeFixMVP", JSON.stringify(state));
      return true;
    })()`,
    returnByValue: true,
  });
  await cdp.send("Page.navigate", { url });
  await cdp.waitFor("Page.loadEventFired");
  await wait(1200);
  const expression = `(() => {
    const doc = document.documentElement;
    const body = document.body;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scrollWidth = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0);
    const scrollHeight = Math.max(doc.scrollHeight, body ? body.scrollHeight : 0);
    const offenders = [];
    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      if (rect.left < -1 || rect.right > vw + 1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: String(el.className || "").slice(0, 120),
          text: String(el.innerText || el.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim().slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        });
      }
    }
    return {
      title: document.title,
      url: location.href,
      viewport: { width: vw, height: vh },
      scrollWidth,
      scrollHeight,
      overflowX: scrollWidth - doc.clientWidth,
      offenders: offenders.slice(0, 12)
    };
  })()`;
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const screenshot = join(outDir, `${viewport.name}-${page.name}.png`);
  writeFileSync(screenshot, Buffer.from(shot.data, "base64"));
  cdp.close();
  return {
    page: page.name,
    path: page.path,
    viewport: viewport.name,
    screenshot,
    ...result.result.value,
  };
}

const next = startNext();
let chrome;
let chromeError = "";
try {
  await waitForHttp("http://127.0.0.1:3000", 45000);
  const cdpPort = 9400 + Math.floor(Math.random() * 400);
  chrome = startChrome(cdpPort);
  chrome.stderr?.on("data", (data) => {
    chromeError += data.toString();
  });
  await waitForHttp(`http://127.0.0.1:${cdpPort}/json/version`, 15000);
  const results = [];
  for (const viewport of viewports) {
    for (const page of pages) {
      results.push(await testOne(cdpPort, page, viewport));
      process.stdout.write(`checked ${viewport.name} ${page.path}\n`);
    }
  }
  const reportPath = join(outDir, "report.json");
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
  const summary = results.map((item) => ({
    page: item.page,
    viewport: item.viewport,
    overflowX: item.overflowX,
    offenders: item.offenders.length,
    screenshot: item.screenshot,
  }));
  process.stdout.write(JSON.stringify({ reportPath, summary }, null, 2));
} finally {
  if (chrome?.exitCode !== null && chrome?.exitCode !== undefined) {
    process.stderr.write(`Chrome exited early with code ${chrome.exitCode}\n`);
    if (chromeError) process.stderr.write(chromeError);
  }
  chrome?.kill();
  next.kill();
}
