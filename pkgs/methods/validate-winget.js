const fs = require("fs");
const https = require("https");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const packagesPath = path.join(repoRoot, "pkgs", "packages-info.json");

const apiBase = "https://api.winget.run/v2";

const args = process.argv.slice(2);
const writeIndex = args.indexOf("--write");
const outPath = writeIndex >= 0 ? args[writeIndex + 1] : null;
const limitIndex = args.indexOf("--limit");
const resultLimit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : 5;
const delayIndex = args.indexOf("--delay-ms");
const delayMs = delayIndex >= 0 ? Number(args[delayIndex + 1]) : 100;

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "toolbox-installer/validate-winget"
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (err) {
            json = null;
          }
          resolve({ statusCode: res.statusCode, json, text: data });
        });
      }
    );

    req.on("error", reject);
  });
}

function readPackages() {
  const raw = fs.readFileSync(packagesPath, "utf8");
  return JSON.parse(raw);
}

function getDisplayName(pkgKey, pkgData) {
  return pkgData?.name || pkgKey;
}

async function validateWingetId(id) {
  const parts = String(id).split(".");
  const publisher = parts.shift();
  const packageName = parts.join(".");

  if (!publisher || !packageName) {
    return { ok: false, data: null, reason: "invalid_id" };
  }

  const url = `${apiBase}/packages/${encodeURIComponent(publisher)}/${encodeURIComponent(packageName)}`;
  const res = await requestJson(url);
  if (res.statusCode === 200) {
    return { ok: true, data: res.json?.Package || res.json };
  }
  if (res.statusCode === 404) {
    return { ok: false, data: null };
  }
  throw new Error(`Error consultando winget.run (${res.statusCode}) para ${id}`);
}

function normalizeSearchResults(json) {
  if (!json) {
    return [];
  }

  const data = Array.isArray(json)
    ? json
    : Array.isArray(json.Packages)
      ? json.Packages
      : [];

  return data.map((item) => ({
    packageIdentifier: item.Id || item.id || null,
    packageName: item.Latest?.Name || item.Name || item.name || null,
    publisher: item.Latest?.Publisher || item.Publisher || item.publisher || null
  }));
}

async function searchWinget(query) {
  const url = `${apiBase}/packages?query=${encodeURIComponent(query)}`;
  const res = await requestJson(url);
  if (res.statusCode !== 200) {
    throw new Error(`Error en busqueda winget.run (${res.statusCode}) para ${query}`);
  }
  return normalizeSearchResults(res.json);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const data = readPackages();
  const packages = data?.packages || {};

  const report = {
    checkedAt: new Date().toISOString(),
    valid: [],
    invalid: [],
    missing: []
  };

  for (const [pkgKey, pkgData] of Object.entries(packages)) {
    const pm = pkgData?.package_manager || {};
    const wingetId = pm?.windows_winget ?? null;

    if (wingetId && typeof wingetId === "string") {
      const result = await validateWingetId(wingetId);
      if (result.ok) {
        report.valid.push({ pkgKey, wingetId });
      } else {
        report.invalid.push({ pkgKey, wingetId });
      }
    } else {
      const query = getDisplayName(pkgKey, pkgData);
      const results = await searchWinget(query);
      report.missing.push({
        pkgKey,
        query,
        results: results.slice(0, Math.max(0, resultLimit))
      });
    }

    if (delayMs > 0) {
      await wait(delayMs);
    }
  }

  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});