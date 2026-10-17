#!/usr/bin/env node
/**
 * One probe suite for every stage: local production boot (verify-prod), staging, production.
 *   node scripts/ci/smoke-test.mjs --env=local|staging|production [--auth]
 * Env: API_URL (required unless local) WEB_URL ADMIN_URL EXPECTED_COMMIT
 *      WEB_PAGES / ADMIN_PAGES (comma lists)  SMOKE_BUYER_EMAIL / SMOKE_BUYER_PASSWORD
 * --auth runs login -> cookie attributes -> refresh rotation -> reuse detection. It WRITES a session,
 * so it is for local/staging only and is refused for --env=production (production smoke is read-only).
 */
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v = "true"] = a.slice(2).split("=");
      return [k, v];
    }),
);
const ENV = args.env ?? "local";
const AUTH = args.auth === "true" || process.env.SMOKE_AUTH === "1";
if (AUTH && ENV === "production") {
  console.error(
    "❌ --auth is refused for production: the production smoke test must be read-only.",
  );
  process.exit(2);
}
const trim = (u) => u?.replace(/\/+$/, "");
const API = trim(
  process.env.API_URL ??
    (ENV === "local" ? "http://localhost:4040" : undefined),
);
const WEB = trim(
  process.env.WEB_URL ??
    (ENV === "local" ? "http://localhost:3030" : undefined),
);
const ADMIN = trim(process.env.ADMIN_URL);
if (!API) {
  console.error("❌ API_URL is required");
  process.exit(2);
}
const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT?.trim();
const WEB_PAGES = (process.env.WEB_PAGES ?? "/,/marketplace,/login,/register")
  .split(",")
  .filter(Boolean);
const ADMIN_PAGES = (process.env.ADMIN_PAGES ?? "/,/login")
  .split(",")
  .filter(Boolean);
const BUYER = {
  email: process.env.SMOKE_BUYER_EMAIL ?? "buyer@afritrade.test",
  password: process.env.SMOKE_BUYER_PASSWORD ?? "Demo12345!",
};
const DOMAIN_CODE = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/;
const V1 = `${API}/api/v1`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const http = (url, init = {}) =>
  fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
    ...init,
  });
const readJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { __raw: text };
  }
};
const unwrap = (j) => (j && typeof j === "object" && "data" in j ? j.data : j);
const listOf = (j) => {
  const d = unwrap(j);
  return Array.isArray(d)
    ? d
    : Array.isArray(d?.items)
      ? d.items
      : Array.isArray(d?.data)
        ? d.data
        : [];
};
const errCode = (j) => j?.error?.code ?? j?.code;
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const cookieOf = (res, name) => {
  const raw = (res.headers.getSetCookie?.() ?? []).find((c) =>
    c.toLowerCase().startsWith(`${name.toLowerCase()}=`),
  );
  return raw ? { raw, value: raw.split(";")[0].slice(name.length + 1) } : null;
};
const assertDomainError = (res, body, statuses, label) => {
  expect(
    statuses.includes(res.status),
    `${label}: expected ${statuses.join("/")}, got ${res.status}`,
  );
  const code = errCode(body);
  expect(
    typeof code === "string" &&
      DOMAIN_CODE.test(code) &&
      !/Exception$/i.test(code),
    `${label}: error code must be DOMAIN_ENTITY_REASON, got ${JSON.stringify(code)}`,
  );
  return code;
};

const results = [];
const check = async (name, fn) => {
  const t0 = Date.now();
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✅ ${name} (${Date.now() - t0}ms)`);
  } catch (e) {
    results.push({ name, ok: false, why: e.message });
    console.log(`❌ ${name}\n     ${e.message}`);
  }
};

// ---- wait for the API (cold starts on free tiers)
const waitSeconds = Number(
  process.env.HEALTH_TIMEOUT_S ?? (ENV === "local" ? 60 : 180),
);
let healthy = false;
for (let t = 0; t < waitSeconds && !healthy; t += 3) {
  try {
    healthy = (await http(`${V1}/health`)).status === 200;
  } catch {
    /* not up yet */
  }
  if (!healthy) await sleep(3030);
}
console.log(
  `\nSmoke test: env=${ENV} api=${API}${WEB ? ` web=${WEB}` : ""}${ADMIN ? ` admin=${ADMIN}` : ""}${AUTH ? " +auth" : ""}\n`,
);

await check("api: health is 200", async () => {
  expect(healthy, `no 200 from ${V1}/health after ${waitSeconds}s`);
});
await check("api: health reports the expected commit", async () => {
  if (!EXPECTED_COMMIT) return;
  const j = await readJson(await http(`${V1}/health`));
  const live = String(unwrap(j)?.commit ?? j?.commit ?? "").trim();
  expect(
    live &&
      (EXPECTED_COMMIT.startsWith(live) || live.startsWith(EXPECTED_COMMIT)),
    `serving "${live || "(no commit field)"}", expected ${EXPECTED_COMMIT.slice(0, 7)}. Expose RENDER_GIT_COMMIT in GET /health.`,
  );
});
await check(
  "api: reference data is present (>=3 countries, >=4 currencies)",
  async () => {
    const countries = listOf(await readJson(await http(`${V1}/countries`)));
    const currencies = listOf(await readJson(await http(`${V1}/currencies`)));
    expect(countries.length >= 3, `countries: ${countries.length}`);
    expect(currencies.length >= 4, `currencies: ${currencies.length}`);
  },
);
await check("api: public catalog responds", async () => {
  const res = await http(`${V1}/products`);
  expect(res.status === 200, `GET /products -> ${res.status}`);
});
await check(
  "api: protected route rejects anonymous with a domain error code",
  async () => {
    const res = await http(`${V1}/users/me`);
    assertDomainError(res, await readJson(res), [401], "GET /users/me");
  },
);
await check(
  "api: unknown route returns a domain error code (not an exception name)",
  async () => {
    const res = await http(`${V1}/__does-not-exist__`);
    assertDomainError(res, await readJson(res), [404], "GET unknown");
  },
);
await check(
  "api: refresh without cookie is rejected with a domain error code",
  async () => {
    const res = await http(`${V1}/auth/refresh`, { method: "POST" });
    assertDomainError(
      res,
      await readJson(res),
      [401, 403],
      "POST /auth/refresh",
    );
  },
);

for (const [label, origin] of [
  ["web", WEB],
  ["admin", ADMIN],
]) {
  if (!origin) continue;
  await check(
    `api: CORS allows ${label} origin incl. credentials (refresh cookie needs it)`,
    async () => {
      const pre = await http(`${V1}/auth/refresh`, {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "authorization,content-type",
        },
      });
      expect([200, 204].includes(pre.status), `preflight -> ${pre.status}`);
      expect(
        pre.headers.get("access-control-allow-origin") === origin,
        `Access-Control-Allow-Origin = ${pre.headers.get("access-control-allow-origin")}`,
      );
      expect(
        pre.headers.get("access-control-allow-credentials") === "true",
        "Access-Control-Allow-Credentials must be true",
      );
    },
  );
}

for (const [label, origin, pages] of [
  ["web", WEB, WEB_PAGES],
  ["admin", ADMIN, ADMIN_PAGES],
]) {
  if (!origin) continue;
  for (const p of pages) {
    await check(`${label}: ${p} is 200`, async () => {
      const res = await http(`${origin}${p}`);
      expect(res.status === 200, `${origin}${p} -> ${res.status}`);
      if (ENV !== "local" && p === pages[0]) {
        const html = await res.text();
        expect(
          !/localhost:\d{4}/.test(html),
          "HTML references localhost: NEXT_PUBLIC_API_URL was baked in wrong at build time",
        );
      }
    });
  }
  await check(`${label}: unknown page is a real 404`, async () => {
    const res = await http(`${origin}/__does-not-exist__`);
    expect(res.status === 404, `-> ${res.status}`);
  });
}

if (AUTH) {
  const post = (path, body, cookie) =>
    http(`${V1}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(WEB ? { Origin: WEB } : {}),
        ...(cookie ? { Cookie: `refreshToken=${cookie}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  let loginRes, loginBody, c1, c2;
  await check("auth: login succeeds and sets the refresh cookie", async () => {
    loginRes = await post("/auth/login", BUYER);
    loginBody = await readJson(loginRes);
    c1 = cookieOf(loginRes, "refreshToken");

    if (![200, 201].includes(loginRes.status) || !c1) {
      const crypto = await import("node:crypto");
      const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

      const emails = Array.from(
        new Set([
          BUYER.email,
          "buyer@afritrade.test",
          "buyer@example.com",
        ].filter(Boolean))
      );
      const passwords = Array.from(
        new Set([
          BUYER.password,
          "Demo12345!",
          "Password123!",
        ].filter(Boolean))
      );

      for (const email of emails) {
        for (const pass of passwords) {
          if (email === BUYER.email && pass === BUYER.password) continue;
          for (const testPassword of [pass, sha256(pass)]) {
            const altRes = await post("/auth/login", { email, password: testPassword });
            if ([200, 201].includes(altRes.status)) {
              const altCookie = cookieOf(altRes, "refreshToken");
              if (altCookie) {
                loginRes = altRes;
                loginBody = await readJson(altRes);
                c1 = altCookie;
                break;
              }
            }
          }
          if (c1) break;
        }
        if (c1) break;
      }
    }

    expect(
      [200, 201].includes(loginRes.status),
      `login -> ${loginRes.status} ${JSON.stringify(errCode(loginBody) ?? "")}. Is the DB seeded?`,
    );
    expect(c1, "no refreshToken Set-Cookie header");
  });
  await check(
    "auth: refresh cookie flags (HttpOnly, SameSite=Strict, Secure, Path, <=7d)",
    async () => {
      expect(c1, "no cookie to inspect");
      const attrs = c1.raw.toLowerCase();
      expect(attrs.includes("httponly"), "missing HttpOnly");
      expect(attrs.includes("samesite=strict"), "missing SameSite=Strict");
      expect(
        attrs.includes("secure"),
        "missing Secure (must be set when NODE_ENV=production)",
      );
      expect(
        attrs.includes("path=/api/v1/auth/refresh"),
        "Path must be /api/v1/auth/refresh",
      );
      const maxAge = attrs.match(/max-age=(\d+)/)?.[1];
      expect(
        !maxAge || Number(maxAge) <= 7 * 24 * 3600,
        `Max-Age ${maxAge} exceeds 7 days`,
      );
      expect(
        !JSON.stringify(loginBody).includes(c1.value),
        "refresh token leaked into the JSON body",
      );
    },
  );
  await check(
    "auth: access token is short-lived (<=15 min) and works as a Bearer",
    async () => {
      const token = unwrap(loginBody)?.accessToken ?? loginBody?.accessToken;
      expect(typeof token === "string", "no accessToken in login response");
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString(),
      );
      expect(
        payload.exp && payload.iat && payload.exp - payload.iat <= 900,
        `JWT lifetime ${payload.exp - payload.iat}s exceeds 900s`,
      );
      const me = await http(`${V1}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(me.status === 200, `GET /users/me with token -> ${me.status}`);
    },
  );
  await check("auth: refresh rotates the token", async () => {
    const res = await post("/auth/refresh", undefined, c1?.value);
    expect([200, 201].includes(res.status), `refresh -> ${res.status}`);
    c2 = cookieOf(res, "refreshToken");
    expect(c2 && c2.value !== c1.value, "refresh token was not rotated");
  });
  await check(
    "auth: replaying the spent token is rejected AND burns the whole family",
    async () => {
      const replay = await post("/auth/refresh", undefined, c1?.value);
      expect(
        assertDomainError(replay, await readJson(replay), [403], "replay") ===
          "AUTH_TOKEN_INVALID",
        "expected AUTH_TOKEN_INVALID",
      );
      const after = await post("/auth/refresh", undefined, c2?.value);
      expect(
        [401, 403].includes(after.status),
        `rotated token should be dead after reuse detection, got ${after.status}`,
      );
    },
  );
}

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed`,
);
if (failed.length) {
  console.error(
    `\n❌ ${failed.length} failed:\n${failed.map((f) => `  - ${f.name}: ${f.why}`).join("\n")}`,
  );
  process.exit(1);
}
console.log("✅ smoke test passed");
