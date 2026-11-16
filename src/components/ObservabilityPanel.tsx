
"use client";
import { ui } from "../lib/ui-l10n";

import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, BellRing, CheckCircle2,
  Clock3, Download, Gauge, HeartPulse,
  RefreshCw, Server, ShieldCheck,
} from "lucide-react";

type Lang = "en" | "bn";
type Tab = "overview" | "services" | "checks" | "incidents";
type State = "healthy" | "warning" | "critical";
type Service = {
  name: string;
  replicas: string;
  cpu: number;
  memory: number;
  latency: number;
  status: State;
};
type Incident = {
  id: string;
  title: string;
  service: string;
  severity: "warning" | "critical";
  status: "open" | "investigating" | "resolved";
  created: string;
  history: string[];
};

const initialServices: Service[] = [
  { name: "application-svc", replicas: "4/4", cpu: 41, memory: 56, latency: 312, status: "healthy" },
  { name: "profile-svc", replicas: "3/3", cpu: 38, memory: 49, latency: 281, status: "healthy" },
  { name: "payroll-svc", replicas: "4/4", cpu: 52, memory: 64, latency: 412, status: "healthy" },
  { name: "bdris-adapter", replicas: "2/2", cpu: 68, memory: 71, latency: 891, status: "warning" },
  { name: "notification-svc", replicas: "2/2", cpu: 29, memory: 42, latency: 208, status: "healthy" },
  { name: "fieldsync-svc", replicas: "3/3", cpu: 46, memory: 58, latency: 355, status: "healthy" },
];

const baseIncidents: Incident[] = [
  {
    id: "INC-DEMO-001",
    title: "Elevated BDRIS response latency",
    service: "bdris-adapter",
    severity: "warning",
    status: "open",
    created: "2026-11-16T06:10:00.000Z",
    history: ["Synthetic BRN verification latency warning", "Queued for operations review"],
  },
  {
    id: "INC-DEMO-002",
    title: "Intermittent notification retry",
    service: "notification-svc",
    severity: "warning",
    status: "open",
    created: "2026-11-16T05:45:00.000Z",
    history: ["Illustrative warning created"],
  },
];

const checks = [
  { name: "Login journey", result: "PASS", timing: "1.4 s", service: "profile-svc" },
  { name: "Submit application", result: "PASS", timing: "2.2 s", service: "application-svc" },
  { name: "BDRIS verification", result: "WARNING", timing: "Elevated latency", service: "bdris-adapter" },
  { name: "Backup completion", result: "PASS", timing: "Last demo run success", service: "backup" },
  { name: "Certificate expiry", result: "PASS", timing: "No reference expiry alert", service: "gateway" },
];

const samples = [42, 46, 38, 53, 49, 60, 52, 57, 45, 69, 53, 63, 55, 71, 59, 66, 62, 77, 64, 72, 61, 70, 65, 74];

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e0ebe3",
  borderRadius: 17,
  padding: 19,
  boxShadow: "0 4px 20px rgba(12,61,38,.035)",
};

const btn: React.CSSProperties = {
  border: "1px solid #d8e5dd",
  background: "#fff",
  color: "#15523d",
  padding: "10px 13px",
  borderRadius: 9,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const primary: React.CSSProperties = {
  ...btn, background: "#006a4e",
  color: "#fff", borderColor: "#006a4e",
};

const muted: React.CSSProperties = {
  fontSize: 11,
  color: "#718578",
  lineHeight: 1.7,
};

function tone(s: string): React.CSSProperties {
  if (s === "healthy" || s === "resolved" || s === "PASS") {
    return { background: "#e4f5eb", color: "#08714d" };
  }
  if (s === "critical") {
    return { background: "#fde8e8", color: "#b24040" };
  }
  return { background: "#fff0db", color: "#a16b19" };
}

function exportCSV(incidents: Incident[]) {
  const rows = [
    ["ID", "Title", "Service", "Severity", "Status", "Created"],
    ...incidents.map((i) => [
      i.id, i.title, i.service, i.severity, i.status, i.created,
    ]),
  ];
  const csv = rows.map((r) =>
    r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "MCBP-Observability-Incidents.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ObservabilityPanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: Lang;
  roleId?: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [services, setServices] = useState<Service[]>(initialServices);
  const [incidents, setIncidents] = useState<Incident[]>(baseIncidents);
  const [selected, setSelected] = useState("bdris-adapter");
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const canOperate = roleId === "admin";
  const current = services.find((s) => s.name === selected);
  const openAlerts = incidents.filter((i) => i.status !== "resolved").length;
  const healthyServices = services.filter((s) => s.status === "healthy").length;

  useEffect(() => {
    try {
      const savedServices = localStorage.getItem("mcbp-observe-services");
      const savedIncidents = localStorage.getItem("mcbp-observe-incidents");

      if (savedServices) {
        const parsed: unknown = JSON.parse(savedServices);
        if (Array.isArray(parsed)) setServices(parsed as Service[]);
      }
      if (savedIncidents) {
        const parsed: unknown = JSON.parse(savedIncidents);
        if (Array.isArray(parsed)) setIncidents(parsed as Incident[]);
      }
    } catch {
      // Fictional baseline remains available.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("mcbp-observe-services", JSON.stringify(services));
    localStorage.setItem("mcbp-observe-incidents", JSON.stringify(incidents));
  }, [services, incidents, loaded]);

  function simulateIncident() {
    if (!canOperate) {
      setNotice("Administrator role required for incident simulation.");
      return;
    }

    const target = services.find((s) => s.name === selected);
    if (!target) return;

    const item: Incident = {
      id: `INC-${Date.now()}`,
      title: `Simulated outage · ${target.name}`,
      service: target.name,
      severity: "critical",
      status: "open",
      created: new Date().toISOString(),
      history: ["Mock critical incident generated", "Operations alert created"],
    };

    setIncidents((old) => [item, ...old]);
    setServices((old) => old.map((s) =>
      s.name === selected
        ? { ...s, status: "critical", replicas: "1/3", latency: 1650 }
        : s
    ));
    setTab("incidents");
    setNotice("Demo outage raised. No actual service has been affected.");
  }

  function investigate(id: string) {
    if (!canOperate) return;

    setIncidents((all) => all.map((i) =>
      i.id === id && i.status === "open"
        ? {
            ...i,
            status: "investigating",
            history: [
              ...i.history,
              `Investigation started by ${roleId} · ${new Date().toLocaleString()}`,
            ],
          }
        : i
    ));
    setNotice("Incident assigned for fictional investigation.");
  }

  function resolve(id: string) {
    if (!canOperate) return;

    const incident = incidents.find((i) => i.id === id);
    if (!incident || incident.status === "resolved") return;

    setIncidents((all) => all.map((i) =>
      i.id === id
        ? {
            ...i,
            status: "resolved",
            history: [
              ...i.history,
              `Resolved in demo by ${roleId} · ${new Date().toLocaleString()}`,
            ],
          }
        : i
    ));

    const otherUnresolved = incidents.some(
      (i) =>
        i.id !== id &&
        i.service === incident.service &&
        i.status !== "resolved"
    );

    if (!otherUnresolved) {
      setServices((all) => all.map((s) =>
        s.name === incident.service
          ? {
              ...s,
              status: "healthy",
              latency: 310,
              replicas: s.name === "bdris-adapter" ? "2/2" : "3/3",
            }
          : s
      ));
    }
    setNotice("Demo incident resolved and recorded in history.");
  }

  function resetScenario() {
    if (!canOperate) return;
    setServices(initialServices);
    setIncidents(baseIncidents);
    setNotice("Fictional monitoring scenario restored.");
  }

  return (
    <div className="obs-root">
      <style>{`
        .obs-root{font-family:Arial,Helvetica,sans-serif;color:#1a3e30}
        .obs-hero{padding:26px;border-radius:19px;
          background:linear-gradient(115deg,#043e30,#007558);
          color:#fff;margin-bottom:15px}
        .obs-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
          gap:12px;margin-bottom:15px}
        .obs-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:15px}
        .obs-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
        .obs-pill{display:inline-flex;padding:6px 9px;border-radius:30px;
          font-size:10px;font-weight:800;text-transform:uppercase}
        .obs-table{width:100%;border-collapse:collapse;font-size:12px}
        .obs-table th{text-align:left;color:#708477;font-size:11px}
        .obs-table th,.obs-table td{border-bottom:1px solid #eaf0eb;padding:12px 9px}
        .obs-bars{display:flex;align-items:end;gap:5px;height:150px;margin:15px 0}
        .obs-bars span{flex:1;background:linear-gradient(180deg,#0a946a,#d5eee0);
          border-radius:5px 5px 0 0;min-width:3px}
        .obs-meter{height:8px;border-radius:10px;background:#e8efea;
          margin-top:7px;overflow:hidden}
        .obs-meter i{display:block;height:100%;background:#06855c;border-radius:10px}
        .obs-incident{padding:16px 0;border-bottom:1px solid #eaf0eb}
        @media(max-width:940px){.obs-grid{grid-template-columns:1fr}}
        @media(max-width:670px){.obs-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="obs-hero">
        <div style={{ fontSize: 11, color: "#bee8d6", letterSpacing: 1.3 }}>
          PLATFORM OPERATIONS · D12
        </div>
        <h2 style={{
          fontSize: "clamp(24px,3vw,34px)",
          margin: "11px 0",
        }}>
          {t("Platform Health & Observability", "প্ল্যাটফর্ম স্বাস্থ্য ও পর্যবেক্ষণ")}
        </h2>
        <p style={{
          fontSize: 13, color: "#d2ede0",
          lineHeight: 1.7, maxWidth: 760,
        }}>
          {t(
            "Monitor illustrative service health, performance indicators, synthetic checks and incident response workflows.",
            "সার্ভিসের অবস্থা, পারফরম্যান্স, পরীক্ষা ও ইনসিডেন্ট রেসপন্সের ডেমো দেখুন।"
          )}
        </p>
        <div style={{ fontSize: 10, color: "#c3e9d7" }}>
          SIMULATED MONITORING · NOT CONNECTED TO PRODUCTION SERVERS
        </div>
      </section>

      <div className="obs-metrics">
        {([
          ["Availability · 30 days", "99.96%", Activity, "Target 99.9%"],
          ["API latency p95", "412 ms", Clock3, "Budget 1,000 ms"],
          ["Active sessions", "7,812", Gauge, "Reference load 10,000"],
          ["Open incidents", String(openAlerts), BellRing, "Dynamic demo count"],
        ] as const).map(([label, value, Icon, detail]) => (
          <section style={card} key={label}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={muted}>{label}</span>
              <Icon size={18} color="#006a4e" />
            </div>
            <div style={{
              fontSize: 26, fontWeight: 850,
              margin: "12px 0 5px",
            }}>
              {value}
            </div>
            <div style={muted}>{detail}</div>
          </section>
        ))}
      </div>

      <div className="obs-tabs">
        {([
          ["overview", "Live Overview", "ওভারভিউ"],
          ["services", "Service Health", "সার্ভিসের অবস্থা"],
          ["checks", "Synthetic Checks", "স্বয়ংক্রিয় পরীক্ষা"],
          ["incidents", "Incident Centre", "ইনসিডেন্ট সেন্টার"],
        ] as const).map(([key, en, bn]) => (
          <button
            key={key}
            style={tab === key ? primary : btn}
            onClick={() => setTab(key)}
          >
            {t(en, bn)}
          </button>
        ))}
      </div>

      {notice && (
        <div style={{
          ...card, marginBottom: 14,
          background: "#e9f6ee",
          color: "#086044", fontSize: 12,
        }}>
          {notice}
          <button style={{ ...btn, float: "right", padding: "3px 8px" }}
            onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {tab === "overview" && (
        <div className="obs-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 8px" }}>
              <Activity size={18} style={{ verticalAlign: "middle" }} />
              {" "}API Latency & Requests
            </h3>
            <p style={muted}>
              Illustrative latency/throughput shape; static sample values.
            </p>
            <div className="obs-bars">
              {samples.map((v, i) => (
                <span
                  key={i}
                  style={{ height: `${v}%` }}
                  title={`Demo point ${i + 1}: ${v}`}
                />
              ))}
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              ...muted,
            }}>
              <span>{ui(lang, "Earlier reference period")}</span>
              <span>{ui(lang, "Latest sample")}</span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 9, marginTop: 20,
            }}>
              {[
                ["Page load p75", "2.3s"],
                ["Open alerts", String(openAlerts)],
                ["Healthy services", `${healthyServices}/${services.length}`],
              ].map(([name, value]) => (
                <div key={name} style={{
                  background: "#f3f8f4",
                  borderRadius: 10, padding: 12,
                }}>
                  <div style={muted}>{name}</div>
                  <b style={{ fontSize: 17 }}>{value}</b>
                </div>
              ))}
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              <HeartPulse size={18} style={{ verticalAlign: "middle" }} />
              {" "}Operations Summary
            </h3>
            {services.map((s) => (
              <div key={s.name} style={{
                padding: "11px 0",
                borderBottom: "1px solid #eaf0eb",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}>
                <div>
                  <b style={{ fontSize: 12 }}>{s.name}</b>
                  <div style={muted}>
                    {s.replicas} replicas · {s.latency} ms p95
                  </div>
                </div>
                <span className="obs-pill" style={tone(s.status)}>
                  {s.status}
                </span>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "services" && (
        <div className="obs-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 13px" }}>
              <Server size={18} style={{ verticalAlign: "middle" }} />
              {" "}Microservice Health
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="obs-table">
                <thead>
                  <tr>
                    <th>{ui(lang, "Service")}</th><th>{ui(lang, "Replicas")}</th>
                    <th>CPU</th><th>{ui(lang, "Memory")}</th>
                    <th>p95</th><th>{ui(lang, "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr
                      key={s.name}
                      onClick={() => setSelected(s.name)}
                      style={{
                        cursor: "pointer",
                        background: selected === s.name ? "#f1f8f3" : undefined,
                      }}
                    >
                      <td><b>{s.name}</b></td>
                      <td>{s.replicas}</td>
                      <td>{s.cpu}%</td>
                      <td>{s.memory}%</td>
                      <td>{s.latency} ms</td>
                      <td>
                        <span className="obs-pill" style={tone(s.status)}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 14px" }}>
              Selected Service
            </h3>
            {current && (
              <>
                <b style={{ fontSize: 18 }}>{current.name}</b>
                <p style={muted}>{ui(lang, "Fictional monitoring sample")}</p>

                {[
                  ["CPU utilization", current.cpu],
                  ["Memory utilization", current.memory],
                ].map(([name, value]) => (
                  <div key={String(name)} style={{ marginTop: 17 }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}>
                      <span>{name}</span><b>{value}%</b>
                    </div>
                    <div className="obs-meter">
                      <i style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}

                <div style={{ margin: "18px 0", ...muted }}>
                  Replicas: {current.replicas} · p95: {current.latency} ms
                </div>
                <button
                  style={primary}
                  disabled={!canOperate}
                  onClick={simulateIncident}
                >
                  <AlertTriangle size={14} style={{ verticalAlign: "middle" }} />
                  {" "}Simulate incident
                </button>
                <p style={{ ...muted, marginTop: 12 }}>
                  No actual server is restarted or modified.
                </p>
              </>
            )}
          </section>
        </div>
      )}

      {tab === "checks" && (
        <section style={card}>
          <h3 style={{ fontSize: 16, margin: "0 0 6px" }}>
            <CheckCircle2 size={18} style={{ verticalAlign: "middle" }} />
            {" "}Synthetic User Journey Checks
          </h3>
          <p style={muted}>
            These are reference scenarios, not live browser or network probes.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table className="obs-table">
              <thead>
                <tr>
                  <th>{ui(lang, "Scenario")}</th>
                  <th>{ui(lang, "Service")}</th>
                  <th>{ui(lang, "Result")}</th>
                  <th>{ui(lang, "Reference timing")}</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => (
                  <tr key={check.name}>
                    <td><b>{check.name}</b></td>
                    <td>{check.service}</td>
                    <td>
                      <span className="obs-pill" style={tone(check.result)}>
                        {check.result}
                      </span>
                    </td>
                    <td>{check.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            marginTop: 18, padding: 16,
            background: "#f0f7f2",
            borderRadius: 12,
          }}>
            <b style={{ fontSize: 12 }}>{ui(lang, "Monitoring reference targets")}</b>
            <p style={muted}>
              Availability 99.9% · API p95 under 1 second ·
              page load within 3 seconds · 10,000 concurrent-user
              reference target. These values are not being actively measured here.
            </p>
          </div>
        </section>
      )}

      {tab === "incidents" && (
        <div className="obs-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 13px" }}>
              <BellRing size={19} style={{ verticalAlign: "middle" }} />
              {" "}Incident Response Queue
            </h3>
            {incidents.map((i) => (
              <div className="obs-incident" key={i.id}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10, flexWrap: "wrap",
                }}>
                  <div>
                    <b style={{ fontSize: 13 }}>{i.title}</b>
                    <div style={muted}>
                      {i.id} · {i.service}
                    </div>
                    <div style={muted}>
                      {new Date(i.created).toLocaleString()}
                    </div>
                  </div>
                  <span className="obs-pill" style={tone(
                    i.status === "resolved" ? "resolved" : i.severity
                  )}>
                    {i.status}
                  </span>
                </div>

                <div style={{
                  display: "flex", gap: 8,
                  marginTop: 12, flexWrap: "wrap",
                }}>
                  <button style={btn}
                    disabled={!canOperate || i.status !== "open"}
                    onClick={() => investigate(i.id)}>
                    Investigate
                  </button>
                  <button style={primary}
                    disabled={!canOperate || i.status === "resolved"}
                    onClick={() => resolve(i.id)}>
                    <CheckCircle2 size={14} style={{ verticalAlign: "middle" }} />
                    {" "}Resolve
                  </button>
                </div>

                <div style={{ marginTop: 12 }}>
                  {i.history.map((event, index) => (
                    <div key={index} style={{
                      ...muted, padding: "6px 0",
                      borderLeft: "2px solid #54a17c",
                      paddingLeft: 11,
                    }}>
                      {event}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              <ShieldCheck size={18} style={{ verticalAlign: "middle" }} />
              {" "}Response Controls
            </h3>
            <p style={muted}>
              The operations officer identifies a problem, investigates
              it, records a resolution and verifies simulated recovery.
            </p>
            {[
              ["01", "Detection", "Synthetic alert created"],
              ["02", "Investigation", "Operator accepts investigation"],
              ["03", "Resolution", "Incident closed with history"],
              ["04", "Recovery", "Health state recalculated"],
            ].map(([number, name, detail]) => (
              <div key={number} style={{
                padding: "13px 0",
                borderBottom: "1px solid #eaf0eb",
                display: "flex", gap: 12,
              }}>
                <span style={{
                  background: "#e6f3ec",
                  padding: 10, borderRadius: 9,
                  fontWeight: 800, color: "#006a4e",
                  fontSize: 12,
                }}>
                  {number}
                </span>
                <div>
                  <b style={{ fontSize: 12 }}>{name}</b>
                  <div style={muted}>{detail}</div>
                </div>
              </div>
            ))}

            <div style={{
              display: "flex", flexWrap: "wrap",
              gap: 8, marginTop: 18,
            }}>
              <button style={btn} disabled={!canOperate}
                onClick={resetScenario}>
                <RefreshCw size={14} style={{ verticalAlign: "middle" }} />
                {" "}Reset scenario
              </button>
              <button style={btn}
                onClick={() => exportCSV(incidents)}>
                <Download size={14} style={{ verticalAlign: "middle" }} />
                {" "}Export incidents
              </button>
            </div>
          </section>
        </div>
      )}

      <footer style={{ ...muted, marginTop: 22, textAlign: "center" }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
        {" "}MCBP-MIS D12 · Simulated operational telemetry · No actual monitoring integration
      </footer>
    </div>
  );
}
