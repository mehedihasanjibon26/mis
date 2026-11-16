
"use client";
import { ui } from "../lib/ui-l10n";

import { useEffect, useState } from "react";

import {
  Activity, Clock3, Download, Gauge, Network,
  Play, Plus, Search, ShieldCheck,
} from "lucide-react";

type Lang = "en" | "bn";
type Route = {
  id: string;
  path: string;
  upstream: string;
  method: "GET" | "POST";
  auth: string;
  limit: number;
  latency: number;
  success: string;
  status: "active" | "draft" | "disabled";
};
type Trial = {
  id: string;
  route: string;
  result: number;
  message: string;
  actor: string;
  at: string;
};

const baseline: Route[] = [
  { id: "GW-01", path: "/v1/enrollment/applications", upstream: "application-svc", method: "POST", auth: "OAuth2", limit: 600, latency: 381, success: "99.98%", status: "active" },
  { id: "GW-02", path: "/v1/identity/nid/verify", upstream: "ec-adapter", method: "POST", auth: "mTLS", limit: 300, latency: 428, success: "99.96%", status: "active" },
  { id: "GW-03", path: "/v1/identity/brn/verify", upstream: "bdris-adapter", method: "POST", auth: "mTLS", limit: 250, latency: 534, success: "99.91%", status: "active" },
  { id: "GW-04", path: "/v1/payroll/batches", upstream: "payroll-svc", method: "GET", auth: "OAuth2", limit: 180, latency: 402, success: "99.99%", status: "active" },
  { id: "GW-05", path: "/v1/registry/beneficiaries", upstream: "registry-adapter", method: "GET", auth: "mTLS", limit: 500, latency: 317, success: "99.97%", status: "active" },
  { id: "GW-06", path: "/v1/grievances/cases", upstream: "grievance-svc", method: "POST", auth: "OAuth2", limit: 400, latency: 309, success: "99.95%", status: "active" },
];

const consumers = [
  { name: "Web Portal", used: 72, quota: "6,000 req/min" },
  { name: "Mobile Application", used: 54, quota: "4,000 req/min" },
  { name: "Single Registry", used: 87, quota: "2,000 req/min" },
  { name: "DGHS Sync", used: 36, quota: "1,000 req/min" },
];

const traffic = [43, 51, 47, 62, 55, 72, 65, 79, 71, 88, 76, 83, 69, 94, 81, 73, 85, 76, 91, 82, 74, 86, 79, 90];

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #e1ebe6",
  borderRadius: 16, padding: 19,
  boxShadow: "0 4px 18px rgba(12,63,42,.035)",
};
const btn: React.CSSProperties = {
  border: "1px solid #d8e6dc", borderRadius: 9,
  padding: "10px 13px", background: "#fff",
  color: "#13543b", fontSize: 12, fontWeight: 700,
  cursor: "pointer",
};
const primary: React.CSSProperties = {
  ...btn, background: "#006a4e", color: "#fff",
  borderColor: "#006a4e",
};
const input: React.CSSProperties = {
  ...btn, fontWeight: 400, width: "100%",
  boxSizing: "border-box",
};
const muted: React.CSSProperties = {
  color: "#728579", fontSize: 11, lineHeight: 1.7,
};

export default function GatewayPanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: Lang;
  roleId?: string;
}) {
  const [tab, setTab] = useState<"overview" | "catalogue" | "sandbox" | "audit">("overview");
  const [routes, setRoutes] = useState<Route[]>(baseline);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("GW-01");
  const [newPath, setNewPath] = useState("");
  const [newUpstream, setNewUpstream] = useState("");
  const [newMethod, setNewMethod] = useState<"GET" | "POST">("GET");
  const [testPayload, setTestPayload] = useState('{"demo":true}');
  const [notice, setNotice] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const canManage = roleId === "admin";
  const chosen = routes.find((route) => route.id === selected) ?? routes[0];

  useEffect(() => {
    try {
      const savedRoutes = localStorage.getItem("mcbp-gateway-routes");
      const savedTrials = localStorage.getItem("mcbp-gateway-trials");
      if (savedRoutes) {
        const parsed: unknown = JSON.parse(savedRoutes);
        if (Array.isArray(parsed)) setRoutes(parsed as Route[]);
      }
      if (savedTrials) {
        const parsed: unknown = JSON.parse(savedTrials);
        if (Array.isArray(parsed)) setTrials(parsed as Trial[]);
      }
    } catch {
      // Fresh demo starts with illustrative routes.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("mcbp-gateway-routes", JSON.stringify(routes));
    localStorage.setItem("mcbp-gateway-trials", JSON.stringify(trials));
  }, [routes, trials, ready]);

  function log(route: string, result: number, message: string) {
    const item: Trial = {
      id: `LOG-${Date.now()}`,
      route, result, message,
      actor: roleId,
      at: new Date().toISOString(),
    };
    setTrials((old) => [item, ...old]);
  }

  function registerRoute() {
    if (!canManage) {
      setNotice("Administrator role required.");
      return;
    }
    if (!newPath.startsWith("/v1/") || !newUpstream.trim()) {
      setNotice("Provide a /v1/... path and upstream service.");
      return;
    }
    if (routes.some((r) => r.path === newPath.trim())) {
      setNotice("Route already exists.");
      return;
    }
    const route: Route = {
      id: `GW-${Date.now()}`,
      path: newPath.trim(),
      upstream: newUpstream.trim(),
      method: newMethod,
      auth: "OAuth2",
      limit: 100,
      latency: 0,
      success: "Not tested",
      status: "draft",
    };
    setRoutes((old) => [...old, route]);
    setSelected(route.id);
    log(route.path, 201, "Draft API registered locally (not published)");
    setNewPath("");
    setNewUpstream("");
    setNotice("Draft route registered in demo catalogue.");
  }

  function changeStatus(status: "active" | "disabled") {
    if (!canManage) {
      setNotice("Administrator role required.");
      return;
    }
    if (!chosen || chosen.id.startsWith("GW-0")) {
      setNotice("Reference routes are read-only in this demo.");
      return;
    }
    setRoutes((old) => old.map((r) =>
      r.id === chosen.id ? { ...r, status } : r
    ));
    log(chosen.path, 200, `Local route state: ${status}`);
    setNotice(`Route ${status} in demo only.`);
  }

  function tryRequest() {
    if (!chosen) return;
    if (chosen.method === "POST") {
      try {
        JSON.parse(testPayload);
      } catch {
        setNotice("Enter valid JSON for a mock POST request.");
        return;
      }
    }
    const result = chosen.status === "active" ? 200 : 403;
    const message = result === 200
      ? "Simulated response. No network request executed."
      : "Route is not active. Request blocked in simulation.";
    log(chosen.path, result, message);
    setNotice(`${result} · ${message}`);
    setTab("sandbox");
  }

  function exportAudit() {
    const lines = [
      "Timestamp,Actor,Route,Status,Event",
      ...trials.map((row) =>
        [row.at, row.actor, row.route, String(row.result), row.message]
          .map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
      ),
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", lines.join("\r\n")], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "MCBP-Gateway-Demo-Audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="gw-root">
      <style>{`
        .gw-root{font-family:Arial,Helvetica,sans-serif;color:#193d2e}
        .gw-hero{padding:25px;border-radius:18px;background:linear-gradient(110deg,#043e31,#007153);
          color:#fff;margin-bottom:15px}
        .gw-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:15px}
        .gw-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:15px}
        .gw-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
        .gw-table{border-collapse:collapse;width:100%;font-size:12px}
        .gw-table th{text-align:left;font-size:11px;color:#72877a}
        .gw-table th,.gw-table td{padding:12px 8px;border-bottom:1px solid #e8f0e9}
        .gw-link{border:0;background:transparent;color:#006a4e;font-weight:800;cursor:pointer;text-align:left}
        .gw-pill{display:inline-block;background:#e7f5ec;color:#06704d;
          border-radius:30px;padding:6px 9px;font-size:10px;font-weight:800}
        .gw-meter{height:8px;background:#e7eee9;border-radius:8px;overflow:hidden;margin-top:9px}
        .gw-meter>div{height:100%;background:#07805c;border-radius:8px}
        .gw-traffic{display:flex;align-items:end;gap:4px;height:145px;padding-top:14px}
        .gw-traffic>div{flex:1;background:linear-gradient(180deg,#0c9a70,#c9e8d7);
          border-radius:4px 4px 0 0;min-width:3px}
        @media(max-width:950px){.gw-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.gw-kpis{grid-template-columns:repeat(2,1fr)}}
      `}</style>

      <section className="gw-hero">
        <div style={{ fontSize: 11, letterSpacing: 1.4, color: "#bce7d3" }}>
          PLATFORM OPERATIONS · D10
        </div>
        <h2 style={{ fontSize: "clamp(24px,3vw,33px)", margin: "10px 0" }}>
          {t("Enterprise API Gateway", "এন্টারপ্রাইজ এপিআই গেটওয়ে")}
        </h2>
        <p style={{ fontSize: 13, color: "#d2ecdf", lineHeight: 1.7, maxWidth: 700 }}>
          {t(
            "Explore API traffic, consumer quotas, route controls and simulated requests in one operational console.",
            "এপিআই ট্রাফিক, ব্যবহারকারীর কোটা, রুট এবং পরীক্ষামূলক রিকোয়েস্ট এক জায়গায় দেখুন।"
          )}
        </p>
        <div style={{ fontSize: 10, color: "#bde6d3" }}>
          REFERENCE METRICS · SIMULATED DATA · NO LIVE GATEWAY CONNECTION
        </div>
      </section>

      <div className="gw-kpis">
        {([
          ["Requests / minute", "11,482", Activity, "Peak 18,940"],
          ["p95 latency", "412 ms", Clock3, "Budget 1,000 ms"],
          ["Error rate", "0.03%", ShieldCheck, "Illustrative baseline"],
          ["Published APIs", "46", Network, "9 partner · 37 internal"],
        ] as const).map(([label, value, Icon, sub]) => (
          <section key={label} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#006a4e" }}>
              <span style={muted}>{label}</span><Icon size={18} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 850, margin: "13px 0 5px" }}>{value}</div>
            <div style={muted}>{sub}</div>
          </section>
        ))}
      </div>

      <div className="gw-tabs">
        {([
          ["overview", "Overview", "ওভারভিউ"],
          ["catalogue", "Route Catalogue", "রুট ক্যাটালগ"],
          ["sandbox", "Try API", "এপিআই পরীক্ষা"],
          ["audit", "Audit & Requests", "অডিট ও রিকোয়েস্ট"],
        ] as const).map(([key, en, bn]) => (
          <button key={key} style={tab === key ? primary : btn} onClick={() => setTab(key)}>
            {t(en, bn)}
          </button>
        ))}
      </div>

      {notice && (
        <div style={{ ...card, background: "#eaf6ee", marginBottom: 14, fontSize: 12, color: "#075b40" }}>
          {notice}
          <button style={{ float: "right", ...btn, padding: "2px 8px" }}
            onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {tab === "overview" && (
        <div className="gw-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 4px" }}>
              <Gauge size={18} style={{ verticalAlign: "middle" }} /> Gateway Traffic
            </h3>
            <p style={muted}>{ui(lang, "Illustrative requests-per-minute shape, not live monitoring.")}</p>
            <div className="gw-traffic">
              {traffic.map((v, i) => <div key={i} style={{ height: `${v}%` }} title={`Sample ${i + 1}: ${v}`} />)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", ...muted }}>
              <span>{ui(lang, "Earlier")}</span><span>{ui(lang, "Last minute")}</span>
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="gw-pill">10,000 req/min minimum (RFP)</span>
              <span className="gw-pill">20,000 req/min reference test</span>
              <span className="gw-pill" style={{ background: "#fff1e0", color: "#9a6818" }}>
                214 throttled calls · 2 over quota
              </span>
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 14px" }}>{ui(lang, "Consumer Quota Usage")}</h3>
            {consumers.map((consumer) => (
              <div key={consumer.name} style={{ padding: "11px 0", borderBottom: "1px solid #edf2ee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <b>{consumer.name}</b><span>{consumer.used}%</span>
                </div>
                <div className="gw-meter">
                  <div style={{ width: `${consumer.used}%` }} />
                </div>
                <div style={{ ...muted, marginTop: 5 }}>{consumer.quota}</div>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "catalogue" && (
        <div className="gw-grid">
          <section style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>{ui(lang, "API Route Catalogue")}</h3>
              <label style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Search size={15} color="#708577" />
                <input style={{ ...input, maxWidth: 240 }}
                  placeholder="Search routes" value={query}
                  onChange={(e) => setQuery(e.target.value)} />
              </label>
            </div>
            <div style={{ overflowX: "auto", marginTop: 13 }}>
              <table className="gw-table">
                <thead>
                  <tr>
                    <th>{ui(lang, "Route / Upstream")}</th><th>{ui(lang, "Auth")}</th><th>{ui(lang, "Limit")}</th>
                    <th>p95</th><th>{ui(lang, "Success")}</th><th>{ui(lang, "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.filter((r) =>
                    `${r.path} ${r.upstream}`.toLowerCase().includes(query.toLowerCase())
                  ).map((r) => (
                    <tr key={r.id}>
                      <td>
                        <button className="gw-link" onClick={() => {
                          setSelected(r.id); setTab("sandbox");
                        }}>{r.method} {r.path}</button>
                        <div style={muted}>{r.upstream}</div>
                      </td>
                      <td>{r.auth}</td><td>{r.limit}/min</td>
                      <td>{r.latency ? `${r.latency}ms` : "—"}</td>
                      <td>{r.success}</td>
                      <td><span className="gw-pill">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 6px" }}>{ui(lang, "Register Draft API")}</h3>
            <p style={muted}>{ui(lang, "Local catalogue registration only. No gateway configuration changes.")}</p>
            <div style={{ display: "grid", gap: 11, marginTop: 14 }}>
              <label style={muted}>Route path
                <input style={input} placeholder="/v1/sample/lookup" value={newPath}
                  onChange={(e) => setNewPath(e.target.value)} />
              </label>
              <label style={muted}>Upstream service
                <input style={input} placeholder="sample-service" value={newUpstream}
                  onChange={(e) => setNewUpstream(e.target.value)} />
              </label>
              <label style={muted}>Method
                <select style={input} value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value as "GET" | "POST")}>
                  <option>GET</option><option>POST</option>
                </select>
              </label>
              <button style={primary} disabled={!canManage} onClick={registerRoute}>
                <Plus size={14} style={{ verticalAlign: "middle" }} /> Register API
              </button>
              <p style={muted}>{ui(lang, "Administrator-only demo action.")}</p>
            </div>
          </section>
        </div>
      )}

      {tab === "sandbox" && (
        <div className="gw-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "API Request Simulator")}</h3>
            <label style={muted}>Select route
              <select style={input} value={chosen?.id ?? ""} onChange={(e) => setSelected(e.target.value)}>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.method} {r.path}</option>
                ))}
              </select>
            </label>
            <div style={{ padding: 13, background: "#f3f8f5", borderRadius: 11, margin: "14px 0" }}>
              <div style={muted}>Request method · upstream · auth · quota</div>
              <b style={{ fontSize: 12 }}>
                {chosen?.method} · {chosen?.upstream} · {chosen?.auth} · {chosen?.limit}/min
              </b>
            </div>
            {chosen?.method === "POST" && (
              <label style={muted}>Mock JSON payload
                <textarea style={{ ...input, minHeight: 110, fontFamily: "monospace" }}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)} />
              </label>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <button style={primary} onClick={tryRequest}>
                <Play size={14} style={{ verticalAlign: "middle" }} /> Try request
              </button>
              {chosen?.id && !chosen.id.startsWith("GW-0") && (
                <button style={btn} disabled={!canManage} onClick={() =>
                  changeStatus(chosen.status === "active" ? "disabled" : "active")
                }>
                  {chosen.status === "active" ? "Disable demo route" : "Activate demo route"}
                </button>
              )}
            </div>
            <p style={{ ...muted, marginTop: 14 }}>
              No external endpoint is contacted, no personal data is transmitted,
              and no production API configuration is modified.
            </p>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "Latest Response")}</h3>
            {trials.length ? (
              <div style={{ background: "#f3f8f4", padding: 16, borderRadius: 11 }}>
                <span className="gw-pill">
                  {trials[0].result === 200 ? "200 OK" : `${trials[0].result} DEMO`}
                </span>
                <pre style={{
                  marginTop: 15, overflowX: "auto",
                  fontSize: 11, lineHeight: 1.8, color: "#1b5f44",
                }}>{JSON.stringify({
                  status: trials[0].result,
                  request: trials[0].route,
                  source: "MCBP-MIS local simulator",
                  message: trials[0].message,
                  timestamp: trials[0].at,
                }, null, 2)}</pre>
              </div>
            ) : <p style={muted}>{ui(lang, "Select a route and click Try request.")}</p>}
          </section>
        </div>
      )}

      {tab === "audit" && (
        <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>{ui(lang, "Gateway Event Audit")}</h3>
            <button style={btn} onClick={exportAudit}>
              <Download size={14} style={{ verticalAlign: "middle" }} /> Export CSV
            </button>
          </div>
          <p style={muted}>{ui(lang, "Browser-local simulated events only.")}</p>
          {!trials.length && <p style={muted}>{ui(lang, "No requests tested yet.")}</p>}
          {trials.map((trial) => (
            <div key={trial.id} style={{ padding: "13px 0", borderBottom: "1px solid #eaf0ec", fontSize: 12 }}>
              <b>{trial.route}</b>
              <span className="gw-pill" style={{ float: "right" }}>{trial.result}</span>
              <div style={{ ...muted, marginTop: 5 }}>{trial.message}</div>
              <div style={muted}>{trial.actor} · {new Date(trial.at).toLocaleString((lang === "bn") ? "bn-BD" : "en-GB")}</div>
            </div>
          ))}
        </section>
      )}

      <footer style={{ ...muted, marginTop: 21, textAlign: "center" }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
        {" "}D10 · All metrics and gateway transactions are illustrative, not live operational evidence.
      </footer>
    </div>
  );
}
