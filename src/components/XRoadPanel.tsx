
"use client";
import { ui } from "../lib/ui-l10n";

import { useEffect, useState } from "react";
import {
  Activity, ArrowRight, CheckCircle2, Clock3, Database,
  Download, FileClock, Globe2, LockKeyhole, Network,
  Play, RefreshCw, RotateCcw, Server, ShieldCheck,
  Wifi, WifiOff, XCircle, AlertTriangle,
} from "lucide-react";

type Lang = "en" | "bn";
type Tab = "overview" | "partners" | "retry" | "logs";
type Partner = {
  id: string;
  name: string;
  service: string;
  mode: string;
  latency: number;
  status: "healthy" | "degraded" | "offline";
  calls: number;
};
type QueueItem = {
  id: string;
  partner: string;
  type: string;
  count: number;
  state: "pending" | "processing" | "recovered" | "failed";
  attempts: number;
};
type LogItem = {
  id: string;
  timestamp: string;
  partner: string;
  event: string;
  status: string;
  actor: string;
};

const seedPartners: Partner[] = [
  { id: "EC", name: "Election Commission", service: "NID verification", mode: "X-Road / mTLS", latency: 182, status: "healthy", calls: 34219 },
  { id: "BDRIS", name: "BDRIS", service: "Birth registration verification", mode: "X-Road / mTLS", latency: 674, status: "degraded", calls: 28440 },
  { id: "DGHS", name: "DGHS", service: "Health verification", mode: "Secure API", latency: 238, status: "healthy", calls: 18482 },
  { id: "DGFP", name: "DGFP", service: "Family planning records", mode: "Secure API", latency: 295, status: "healthy", calls: 14411 },
  { id: "SPBMU", name: "iBAS++ / SPBMU", service: "Payment reconciliation", mode: "Secure exchange", latency: 372, status: "healthy", calls: 24563 },
  { id: "MFS", name: "MFS Providers", service: "Payment response", mode: "Secure API", latency: 326, status: "healthy", calls: 37420 },
  { id: "GRS", name: "National GRS", service: "Complaint referral", mode: "Secure API", latency: 214, status: "healthy", calls: 11543 },
  { id: "REGISTRY", name: "Single Registry", service: "Eligibility cross-check", mode: "Secure exchange", latency: 282, status: "healthy", calls: 13362 },
];

const seedQueue: QueueItem[] = [
  { id: "RETRY-BRN-01", partner: "BDRIS", type: "BRN verification backlog", count: 1284, state: "pending", attempts: 0 },
  { id: "RETRY-NID-01", partner: "EC", type: "NID verification", count: 0, state: "recovered", attempts: 1 },
  { id: "DEAD-LETTER-01", partner: "BDRIS", type: "Messages older than 24h", count: 3, state: "failed", attempts: 3 },
];

const seedSubsystems = [
  { name: "MCBP Core", service: "Enrollment & beneficiary", consumers: "Portal, Mobile", calls: "54,280" },
  { name: "Identity Exchange", service: "NID / BRN", consumers: "MCBP, Registry", calls: "62,659" },
  { name: "Finance Exchange", service: "Payment & reconciliation", consumers: "Finance, SPBMU", calls: "38,744" },
  { name: "Referral Exchange", service: "Health & GRS", consumers: "DGHS, DGFP, GRS", calls: "26,757" },
];

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #E2EBE5",
  padding: 19, borderRadius: 16,
  boxShadow: "0 5px 20px rgba(7,57,38,.035)",
};

const btn: React.CSSProperties = {
  border: "1px solid #D8E5DC", background: "white",
  color: "#13513A", borderRadius: 9,
  padding: "10px 12px", fontSize: 12, fontWeight: 700,
  cursor: "pointer", display: "inline-flex",
  alignItems: "center", gap: 7,
};

const primary: React.CSSProperties = {
  ...btn, background: "#006A4E", borderColor: "#006A4E",
  color: "white",
};

const muted: React.CSSProperties = {
  color: "#718778", fontSize: 11, lineHeight: 1.7,
};

const initialLog: LogItem[] = [
  {
    id: "MSG-DEMO-0001", timestamp: "2026-11-16T07:00:00.000Z",
    partner: "BDRIS", event: "BRN retry queue snapshot",
    status: "PENDING", actor: "Demo seed",
  },
  {
    id: "MSG-DEMO-0002", timestamp: "2026-11-16T06:58:00.000Z",
    partner: "EC", event: "NID message exchange (illustrative)",
    status: "SIGNED / OK", actor: "Demo seed",
  },
];

function csvDownload(rows: string[][]) {
  const lines = rows.map((row) =>
    row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  );
  const blob = new Blob(
    ["\uFEFF", lines.join("\r\n")],
    { type: "text/csv;charset=utf-8" }
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "MCBP-XRoad-Demo-Log.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function XRoadPanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: Lang;
  roleId?: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [partners, setPartners] = useState(seedPartners);
  const [queue, setQueue] = useState(seedQueue);
  const [logs, setLogs] = useState(initialLog);
  const [selectedPartner, setSelectedPartner] = useState("BDRIS");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const canOperate = roleId === "admin";
  const selected = partners.find((p) => p.id === selectedPartner);
  const backlog = queue.find((item) => item.id === "RETRY-BRN-01");
  const pendingCount = queue
    .filter((q) => q.state === "pending" || q.state === "processing")
    .reduce((total, q) => total + q.count, 0);
  const healthyCount = partners.filter((p) => p.status === "healthy").length;

  useEffect(() => {
    try {
      const savedPartners = localStorage.getItem("mcbp-xroad-partners");
      const savedQueue = localStorage.getItem("mcbp-xroad-queue");
      const savedLogs = localStorage.getItem("mcbp-xroad-logs");

      if (savedPartners) {
        const data: unknown = JSON.parse(savedPartners);
        if (Array.isArray(data)) setPartners(data as Partner[]);
      }
      if (savedQueue) {
        const data: unknown = JSON.parse(savedQueue);
        if (Array.isArray(data)) setQueue(data as QueueItem[]);
      }
      if (savedLogs) {
        const data: unknown = JSON.parse(savedLogs);
        if (Array.isArray(data)) setLogs(data as LogItem[]);
      }
    } catch {
      // Use seeded fictional exchange status.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("mcbp-xroad-partners", JSON.stringify(partners));
    localStorage.setItem("mcbp-xroad-queue", JSON.stringify(queue));
    localStorage.setItem("mcbp-xroad-logs", JSON.stringify(logs));
  }, [partners, queue, logs, ready]);

  function addLog(partner: string, event: string, status: string) {
    const item: LogItem = {
      id: `MSG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      partner, event, status, actor: roleId,
    };
    setLogs((current) => [item, ...current]);
  }

  function failPartner() {
    if (!canOperate) {
      setNotice("System Administrator role required.");
      return;
    }
    setPartners((all) => all.map((p) =>
      p.id === selectedPartner ? { ...p, status: "offline" } : p
    ));
    addLog(selectedPartner, "Simulated partner outage", "OFFLINE");
    setNotice(`${selected?.name ?? selectedPartner}: simulated outage activated.`);
  }

  function restorePartner() {
    if (!canOperate) {
      setNotice("System Administrator role required.");
      return;
    }
    setPartners((all) => all.map((p) =>
      p.id === selectedPartner ? {
        ...p,
        status: "healthy",
        latency: p.id === "BDRIS" ? 312 : p.latency,
      } : p
    ));
    addLog(selectedPartner, "Connectivity restored (simulation)", "HEALTHY");
    setNotice("Demo connectivity restored. No real partner was contacted.");
  }

  function replayQueue(id: string) {
    if (!canOperate) {
      setNotice("Only the Administrator can replay the demo queue.");
      return;
    }

    const target = queue.find((q) => q.id === id);
    if (!target || target.count === 0) {
      setNotice("No pending records for this queue.");
      return;
    }

    const partner = partners.find((p) => p.id === target.partner);

    if (partner?.status === "offline") {
      setQueue((all) => all.map((q) =>
        q.id === id ? {
          ...q,
          state: "failed",
          attempts: q.attempts + 1,
        } : q
      ));
      addLog(target.partner, `Retry refused for ${target.count} demo messages`, "FAILED");
      setNotice("Partner offline. Retry failed; messages retained.");
      return;
    }

    // Deterministic batch replay: at most 500 simulated records per click.
    const recovered = Math.min(500, target.count);
    const remaining = target.count - recovered;

    setQueue((all) => all.map((q) =>
      q.id === id ? {
        ...q, count: remaining,
        state: remaining === 0 ? "recovered" : "pending",
        attempts: q.attempts + 1,
      } : q
    ));

    addLog(
      target.partner,
      `Replay accepted ${recovered} simulated message(s), ${remaining} remaining`,
      "SIGNED / RETRIED"
    );

    setNotice(
      `Simulated retry: ${recovered} processed; ${remaining} remain.`
    );
  }

  function resetScenario() {
    if (!canOperate) {
      setNotice("Administrator role required.");
      return;
    }
    setPartners(seedPartners);
    setQueue(seedQueue);
    addLog("System", "Demo exchange scenario reset", "RESET");
    setNotice("Fictional partner and queue baseline restored.");
  }

  const statusStyle = (status: string): React.CSSProperties => ({
    color: status === "healthy" || status === "recovered"
      ? "#08764F" : status === "offline" || status === "failed"
        ? "#B44C36" : "#94631D",
    background: status === "healthy" || status === "recovered"
      ? "#E6F5EB" : status === "offline" || status === "failed"
        ? "#FFF0EB" : "#FFF3E0",
  });

  return (
    <div className="xr-root">
      <style>{`
        .xr-root{font-family:Arial,Helvetica,sans-serif;color:#193c2d}
        .xr-hero{border-radius:19px;background:linear-gradient(110deg,#073c31,#007459);
          color:white;padding:27px;margin-bottom:15px}
        .xr-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
          gap:12px;margin-bottom:15px}
        .xr-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:15px}
        .xr-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
        .xr-table{border-collapse:collapse;width:100%;font-size:12px}
        .xr-table th{font-size:11px;color:#708677;text-align:left}
        .xr-table th,.xr-table td{padding:12px 9px;border-bottom:1px solid #E9F0EA}
        .xr-pill{display:inline-flex;padding:6px 9px;border-radius:30px;
          font-size:10px;font-weight:800;white-space:nowrap}
        .xr-node{border-radius:12px;padding:15px;border:1px solid #DCEAE1;
          background:#F7FAF8;min-width:130px;text-align:center;flex:1}
        .xr-flow{display:flex;gap:8px;align-items:center;margin:20px 0;flex-wrap:wrap}
        .xr-event{padding:14px 0;border-bottom:1px solid #ECF2ED}
        @media(max-width:950px){.xr-grid{grid-template-columns:1fr}}
        @media(max-width:670px){.xr-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="xr-hero">
        <div style={{ color: "#BAE7D4", fontSize: 11, letterSpacing: 1.3 }}>
          PLATFORM OPERATIONS · D11
        </div>
        <h2 style={{ margin: "10px 0", fontSize: "clamp(24px,3vw,34px)" }}>
          {t("X-Road Secure Data Exchange", "এক্স-রোড নিরাপদ ডেটা বিনিময়")}
        </h2>
        <p style={{
          fontSize: 13, lineHeight: 1.7,
          color: "#D4EDE2", maxWidth: 750,
        }}>
          {t(
            "Explore secured partner connectivity, exchange subsystems, message signatures and resilient retry workflows.",
            "নিরাপদ পার্টনার সংযোগ, বার্তার স্বাক্ষর এবং পুনরায় পাঠানোর প্রক্রিয়া দেখুন।"
          )}
        </p>
        <div style={{ fontSize: 10, color: "#C8ECDA" }}>
          SIMULATED EXCHANGE · NO REAL X-ROAD SERVERS · NO SIGNED MESSAGES TRANSMITTED
        </div>
      </section>

      <div className="xr-metrics">
        {([
          ["Security servers", "2 / 2", Server, "Healthy · illustrative"],
          ["Signed messages", "182,440", ShieldCheck, "Today · illustrative"],
          ["Registered subsystems", "4", Network, "Configured · reference"],
          ["BRN retry backlog", pendingCount.toLocaleString(), Clock3, "Dynamic demo queue"],
        ] as const).map(([name, value, Icon, detail]) => (
          <div style={card} key={name}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={muted}>{name}</span>
              <Icon size={18} color="#006A4E" />
            </div>
            <div style={{
              fontSize: 26, fontWeight: 850,
              margin: "12px 0 5px",
            }}>
              {value}
            </div>
            <div style={muted}>{detail}</div>
          </div>
        ))}
      </div>

      <div className="xr-tabs">
        {([
          ["overview", "Exchange Overview", "এক্সচেঞ্জ ওভারভিউ"],
          ["partners", "Partner Connectivity", "পার্টনার সংযোগ"],
          ["retry", "Retry & Fallback", "রিট্রাই ও ফলব্যাক"],
          ["logs", "Signed Message Logs", "মেসেজ লগ"],
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
          background: "#E9F6ED", color: "#086347",
          fontSize: 12,
        }}>
          {notice}
          <button style={{ ...btn, float: "right", padding: "3px 8px" }}
            onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {tab === "overview" && (
        <div className="xr-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 8px" }}>
              <Globe2 size={19} style={{ verticalAlign: "middle" }} />
              {" "}X-Road Exchange Architecture
            </h3>
            <p style={muted}>
              A schematic illustration of authenticated, signed,
              partner-to-platform messages. No live connectivity.
            </p>
            <div className="xr-flow">
              <div className="xr-node">
                <Database size={22} color="#007B57" />
                <div style={{ fontSize: 12, fontWeight: 800, marginTop: 8 }}>
                  MCBP-MIS
                </div>
                <div style={muted}>{ui(lang, "Client subsystem")}</div>
              </div>
              <ArrowRight size={18} color="#7B9A87" />
              <div className="xr-node" style={{
                background: "#E8F6ED",
                borderColor: "#C4E4D2",
              }}>
                <ShieldCheck size={22} color="#007B57" />
                <div style={{ fontSize: 12, fontWeight: 800, marginTop: 8 }}>
                  Security Servers
                </div>
                <div style={muted}>{ui(lang, "Signed exchange · demo")}</div>
              </div>
              <ArrowRight size={18} color="#7B9A87" />
              <div className="xr-node">
                <Network size={22} color="#007B57" />
                <div style={{ fontSize: 12, fontWeight: 800, marginTop: 8 }}>
                  Government Partners
                </div>
                <div style={muted}>{ui(lang, "Approved services")}</div>
              </div>
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap",
              gap: 9, marginTop: 13,
            }}>
              <span className="xr-pill" style={statusStyle("healthy")}>
                2/2 servers healthy (reference)
              </span>
              <span className="xr-pill" style={statusStyle("healthy")}>
                Zero signature failures (reference)
              </span>
              <span className="xr-pill" style={statusStyle("pending")}>
                Certificate renewal in 142 days (reference)
              </span>
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Exchange Subsystems
            </h3>
            {seedSubsystems.map((s) => (
              <div key={s.name} style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12, padding: "12px 0",
                borderBottom: "1px solid #EAF0EB",
              }}>
                <div>
                  <b style={{ fontSize: 12 }}>{s.name}</b>
                  <div style={muted}>
                    {s.service} · {s.consumers}
                  </div>
                </div>
                <b style={{ fontSize: 12 }}>{s.calls}</b>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "partners" && (
        <div className="xr-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Partner Connectivity Register
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="xr-table">
                <thead>
                  <tr>
                    <th>{ui(lang, "Partner")}</th>
                    <th>{ui(lang, "Mode")}</th>
                    <th>{ui(lang, "Latency")}</th>
                    <th>{ui(lang, "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedPartner(p.id)}
                      style={{
                        cursor: "pointer",
                        background: selectedPartner === p.id ? "#F1F8F3" : undefined,
                      }}>
                      <td>
                        <b>{p.name}</b>
                        <div style={muted}>{p.service}</div>
                      </td>
                      <td>{p.mode}</td>
                      <td>{p.latency} ms</td>
                      <td>
                        <span className="xr-pill" style={statusStyle(p.status)}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Selected Partner
            </h3>
            {selected && (
              <>
                <div style={{ fontSize: 23, fontWeight: 800 }}>
                  {selected.name}
                </div>
                <p style={muted}>{selected.service}</p>
                {[
                  ["Mode", selected.mode],
                  ["Latency", `${selected.latency} ms`],
                  ["Demo calls", selected.calls.toLocaleString()],
                  ["State", selected.status],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12, fontSize: 12,
                    padding: "11px 0",
                    borderBottom: "1px solid #EAF0EB",
                  }}>
                    <span style={{ color: "#728779" }}>{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
                <div style={{
                  display: "flex", flexWrap: "wrap",
                  gap: 8, marginTop: 16,
                }}>
                  <button style={btn} disabled={!canOperate}
                    onClick={failPartner}>
                    <WifiOff size={14} />
                    Simulate outage
                  </button>
                  <button style={primary} disabled={!canOperate}
                    onClick={restorePartner}>
                    <Wifi size={14} />
                    Restore connection
                  </button>
                </div>
                <p style={{ ...muted, marginTop: 13 }}>
                  Status changes are local and do not contact partner systems.
                </p>
              </>
            )}
          </section>
        </div>
      )}

      {tab === "retry" && (
        <div className="xr-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 8px" }}>
              <RefreshCw size={18} style={{ verticalAlign: "middle" }} />
              {" "}Retry & Fallback Queues
            </h3>
            <p style={muted}>
              Each click retries up to 500 fictional records.
              Offline partners prevent successful replay.
            </p>
            {queue.map((q) => (
              <div key={q.id} style={{
                border: "1px solid #E4ECE6",
                borderRadius: 12,
                padding: 15, marginTop: 10,
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10, flexWrap: "wrap",
                }}>
                  <div>
                    <b style={{ fontSize: 13 }}>{q.type}</b>
                    <div style={muted}>
                      {q.id} · {q.partner} · {q.attempts} attempts
                    </div>
                  </div>
                  <span className="xr-pill" style={statusStyle(q.state)}>
                    {q.state}
                  </span>
                </div>
                <div style={{
                  display: "flex", alignItems: "end",
                  justifyContent: "space-between",
                  gap: 12, marginTop: 12,
                }}>
                  <div>
                    <div style={muted}>{ui(lang, "Outstanding demo records")}</div>
                    <div style={{ fontSize: 26, fontWeight: 850 }}>
                      {q.count.toLocaleString()}
                    </div>
                  </div>
                  <button style={primary}
                    disabled={!canOperate || q.count === 0}
                    onClick={() => replayQueue(q.id)}>
                    <Play size={13} />
                    Retry batch
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Recovery Playbook
            </h3>
            {[
              ["1", "Detect", "Partner timeout or failed delivery detected"],
              ["2", "Retain", "Message held in local retry queue"],
              ["3", "Replay", "Authenticated retry attempted"],
              ["4", "Audit", "Outcome recorded with timestamp"],
            ].map(([number, title, detail]) => (
              <div key={number} style={{
                display: "flex", gap: 12,
                borderBottom: "1px solid #EAF0EB",
                padding: "12px 0",
              }}>
                <span style={{
                  background: "#E4F3E9", color: "#006A4E",
                  fontWeight: 800, borderRadius: 10,
                  padding: 11, height: 18,
                }}>
                  {number}
                </span>
                <div>
                  <b style={{ fontSize: 12 }}>{title}</b>
                  <div style={muted}>{detail}</div>
                </div>
              </div>
            ))}

            <button style={{ ...btn, marginTop: 17 }}
              disabled={!canOperate}
              onClick={resetScenario}>
              <RotateCcw size={14} />
              Reset demo scenario
            </button>
          </section>
        </div>
      )}

      {tab === "logs" && (
        <section style={card}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10, flexWrap: "wrap",
          }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>
              <FileClock size={19} style={{ verticalAlign: "middle" }} />
              {" "}Message & Security Audit
            </h3>
            <button style={btn} onClick={() => csvDownload([
              ["Timestamp", "Partner", "Event", "Status", "Actor"],
              ...logs.map((l) => [
                l.timestamp, l.partner, l.event, l.status, l.actor,
              ]),
            ])}>
              <Download size={14} /> Export CSV
            </button>
          </div>
          <p style={muted}>
            These are simulated log entries, not cryptographically
            signed X-Road envelopes or production audit records.
          </p>
          {logs.map((l) => (
            <div className="xr-event" key={l.id}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10, flexWrap: "wrap",
              }}>
                <b style={{ fontSize: 12 }}>{l.event}</b>
                <span className="xr-pill" style={
                  statusStyle(l.status.includes("FAILED") ? "failed" : "healthy")
                }>
                  {l.status}
                </span>
              </div>
              <div style={muted}>
                {l.partner} · {l.actor} · {new Date(l.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </section>
      )}

      <footer style={{ ...muted, marginTop: 22, textAlign: "center" }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
        {" "}MCBP-MIS D11 · Browser-local data exchange simulator · Not a live X-Road deployment
      </footer>
    </div>
  );
}
