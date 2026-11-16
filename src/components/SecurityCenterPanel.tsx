
"use client";
import { ui } from "../lib/ui-l10n";

import { useEffect, useState } from "react";
import {
  BellRing, CheckCircle2,
  Download, Fingerprint, KeyRound, LockKeyhole,
  RotateCcw, Search, ShieldAlert, ShieldCheck,
  Siren, UserRound,
} from "lucide-react";

type Lang = "en" | "bn";
type Tab = "overview" | "alerts" | "access" | "audit";
type Severity = "low" | "medium" | "high" | "critical";
type Status = "open" | "investigating" | "contained" | "closed";

type Alert = {
  id: string;
  rule: string;
  source: string;
  severity: Severity;
  status: Status;
  time: string;
  history: string[];
};

type Event = {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
};

const seededAlerts: Alert[] = [
  { id: "SEC-001", rule: "Unusual bulk data download", source: "Beneficiary Registry", severity: "high", status: "open", time: "2026-11-16T05:20:00Z", history: ["SIEM rule triggered (demo)"] },
  { id: "SEC-002", rule: "Excessive applications from one IP", source: "Application Service", severity: "medium", status: "open", time: "2026-11-16T05:10:00Z", history: ["Submission velocity anomaly detected"] },
  { id: "SEC-003", rule: "Rapid multi-user logins", source: "Identity Service", severity: "medium", status: "open", time: "2026-11-16T04:45:00Z", history: ["Sign-in anomaly detected"] },
  { id: "SEC-004", rule: "Excessive NID unmasking", source: "Profile Service", severity: "medium", status: "open", time: "2026-11-16T04:12:00Z", history: ["Sensitive data access threshold exceeded"] },
  { id: "SEC-005", rule: "Blocked SQL injection attempt", source: "API Gateway", severity: "low", status: "open", time: "2026-11-16T03:50:00Z", history: ["Web application firewall rule triggered"] },
  { id: "SEC-006", rule: "Dormant privileged account", source: "User Directory", severity: "low", status: "open", time: "2026-11-16T03:15:00Z", history: ["Privileged access review required"] },
  { id: "SEC-007", rule: "Unusual device registration", source: "Mobile Field Operations", severity: "low", status: "open", time: "2026-11-16T02:55:00Z", history: ["Device binding needs review"] },
];

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #dfe9e3",
  borderRadius: 16, padding: 19,
  boxShadow: "0 6px 22px rgba(9,57,38,.035)",
};

const button: React.CSSProperties = {
  background: "#fff", border: "1px solid #d7e6dc",
  color: "#16513a", borderRadius: 9,
  padding: "10px 13px", cursor: "pointer",
  fontSize: 12, fontWeight: 700,
};

const primary: React.CSSProperties = {
  ...button, background: "#006a4e",
  color: "#fff", borderColor: "#006a4e",
};

const muted: React.CSSProperties = {
  color: "#718779", fontSize: 11, lineHeight: 1.7,
};

function badge(status: string): React.CSSProperties {
  if (["closed", "contained", "low"].includes(status)) {
    return { background: "#e6f5ea", color: "#08764f" };
  }
  if (["high", "critical"].includes(status)) {
    return { background: "#ffebea", color: "#b1413a" };
  }
  return { background: "#fff2df", color: "#96651b" };
}

function exportCsv(rows: string[][]) {
  const csv = rows.map((row) =>
    row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "MCBP-Security-Demo-Audit.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SecurityCenterPanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: Lang;
  roleId?: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [alerts, setAlerts] = useState<Alert[]>(seededAlerts);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedId, setSelectedId] = useState("SEC-001");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const canInvestigate = roleId === "admin";
  const selected = alerts.find((a) => a.id === selectedId);
  const openCount = alerts.filter((a) => a.status !== "closed").length;

  useEffect(() => {
    try {
      const a = localStorage.getItem("mcbp-security-alerts");
      const e = localStorage.getItem("mcbp-security-events");
      const r = localStorage.getItem("mcbp-security-access-review");
      if (a) {
        const parsed: unknown = JSON.parse(a);
        if (Array.isArray(parsed)) setAlerts(parsed as Alert[]);
      }
      if (e) {
        const parsed: unknown = JSON.parse(e);
        if (Array.isArray(parsed)) setEvents(parsed as Event[]);
      }
      if (r === "complete") setReviewComplete(true);
    } catch {
      // Fictional seed records remain available.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("mcbp-security-alerts", JSON.stringify(alerts));
    localStorage.setItem("mcbp-security-events", JSON.stringify(events));
    localStorage.setItem(
      "mcbp-security-access-review",
      reviewComplete ? "complete" : "pending"
    );
  }, [alerts, events, reviewComplete, ready]);

  function record(action: string, target: string) {
    setEvents((old) => [{
      id: `EVT-${Date.now()}-${old.length}`,
      time: new Date().toISOString(),
      actor: roleId,
      action,
      target,
    }, ...old]);
  }

  function changeStatus(next: Status) {
    if (!canInvestigate || !selected) {
      setNotice("Administrator demo role required.");
      return;
    }

    const allowed: Record<Status, Status[]> = {
      open: ["investigating"],
      investigating: ["contained"],
      contained: ["closed"],
      closed: [],
    };
    if (!allowed[selected.status].includes(next)) {
      setNotice("Follow the investigation → containment → closure sequence.");
      return;
    }

    setAlerts((old) => old.map((a) => (
      a.id === selected.id ? {
        ...a,
        status: next,
        history: [
          ...a.history,
          `${new Date().toLocaleString()}: ${next} by ${roleId}`,
        ],
      } : a
    )));
    record(`Alert ${next}`, selected.id);
    setNotice(`${selected.id}: ${next} recorded in demo audit.`);
  }

  function createIncident() {
    if (!canInvestigate) {
      setNotice("Administrator demo role required.");
      return;
    }
    const id = `SEC-${Date.now()}`;
    setAlerts((old) => [{
      id, rule: "Tabletop incident: suspicious privileged activity",
      source: "Identity Service", severity: "high",
      status: "open", time: new Date().toISOString(),
      history: ["Fictional tabletop security drill initiated"],
    }, ...old]);
    setSelectedId(id);
    setTab("alerts");
    record("Tabletop drill started", id);
    setNotice("Simulated incident created. No real account was affected.");
  }

  function completeAccessReview() {
    if (!canInvestigate) {
      setNotice("Administrator demo role required.");
      return;
    }
    setReviewComplete(true);
    record("Privileged access review completed", "412 reference accounts");
    setNotice("Fictional access review marked complete.");
  }

  function reset() {
    if (!canInvestigate) return;
    setAlerts(seededAlerts);
    setEvents([]);
    setSelectedId("SEC-001");
    setReviewComplete(false);
    setNotice("Reference demo scenario restored.");
  }

  return (
    <div className="sec14">
      <style>{`
        .sec14{font-family:Arial,Helvetica,sans-serif;color:#183e2e;min-width:0}
        .sec14-hero{background:linear-gradient(110deg,#063e32,#006e53);
          color:white;border-radius:18px;padding:26px;margin-bottom:15px}
        .sec14-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:15px}
        .sec14-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
        .sec14-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:15px}
        .sec14-pill{padding:6px 9px;border-radius:30px;font-size:10px;font-weight:800;text-transform:uppercase}
        .sec14-entry{padding:13px;border:1px solid #e1ebe4;border-radius:11px;
          width:100%;background:white;cursor:pointer;text-align:left}
        .sec14-entry:hover{border-color:#4a9c75}
        .sec14-row{border-bottom:1px solid #e8f0ea;padding:12px 0;display:flex;
          justify-content:space-between;gap:11px;align-items:center}
        .sec14-bar{height:8px;border-radius:8px;background:#e8efe9;overflow:hidden;margin-top:8px}
        .sec14-bar>div{height:100%;background:#06845c;border-radius:8px}
        @media(max-width:950px){.sec14-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.sec14-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="sec14-hero">
        <div style={{ fontSize: 11, letterSpacing: 1.3, color: "#b8e7d1" }}>
          PLATFORM OPERATIONS · D14
        </div>
        <h2 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "10px 0" }}>
          {t("Security Centre & SIEM", "নিরাপত্তা কেন্দ্র ও এসআইইএম")}
        </h2>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#d3ebde", maxWidth: 730 }}>
          {t(
            "Investigate suspicious activity, track privileged access, review patch posture and demonstrate incident response.",
            "সন্দেহজনক কার্যক্রম, বিশেষ অনুমতি, সিকিউরিটি অ্যালার্ট এবং ইনসিডেন্ট ব্যবস্থাপনা দেখুন।"
          )}
        </p>
        <div style={{ fontSize: 10, color: "#b8e7d1" }}>
          SIMULATED DATA · NO LIVE SIEM, SECURITY SCANS OR ACCOUNT CHANGES
        </div>
      </section>

      <div className="sec14-kpis">
        {[
          ["Open alerts", String(openCount), BellRing, "Seeded baseline: 7"],
          ["Failed logins / 24h", "318", LockKeyhole, "4 accounts locked · reference"],
          ["Privileged MFA", "100%", Fingerprint, "412 of 412 · reference"],
          ["Patch compliance", "98%", ShieldCheck, "2 nodes due · reference"],
        ].map(([name, value, Icon, detail]) => {
          const Symbol = Icon as typeof BellRing;
          return (
            <section key={String(name)} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={muted}>{name as string}</span>
                <Symbol size={18} color="#007653" />
              </div>
              <div style={{ fontWeight: 850, fontSize: 27, margin: "12px 0 5px" }}>
                {value as string}
              </div>
              <div style={muted}>{detail as string}</div>
            </section>
          );
        })}
      </div>

      <div className="sec14-tabs">
        {([
          ["overview", "Security Overview", "নিরাপত্তা ওভারভিউ"],
          ["alerts", "SIEM Investigations", "অ্যালার্ট তদন্ত"],
          ["access", "Access & Vault", "অ্যাক্সেস ও ভল্ট"],
          ["audit", "Audit & Drills", "অডিট ও মহড়া"],
        ] as const).map(([id, en, bn]) => (
          <button key={id} style={tab === id ? primary : button} onClick={() => setTab(id)}>
            {t(en, bn)}
          </button>
        ))}
      </div>

      {notice && <div style={{
        ...card, background: "#eaf6ed", fontSize: 12,
        color: "#075f42", marginBottom: 14,
      }}>
        {notice}
        <button style={{ ...button, float: "right", padding: "2px 8px" }}
          onClick={() => setNotice("")}>×</button>
      </div>}

      {tab === "overview" && (
        <div className="sec14-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              <ShieldAlert size={18} style={{ verticalAlign: "middle" }} />
              {" "}Security Posture
            </h3>
            {[
              ["Privileged MFA coverage", 100],
              ["Infrastructure patch compliance", 98],
              ["Reference audit-chain integrity", 100],
              ["Privileged access review", reviewComplete ? 100 : 72],
            ].map(([name, amount]) => (
              <div key={String(name)} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>{name}</span><b>{amount}%</b>
                </div>
                <div className="sec14-bar">
                  <div style={{ width: `${amount}%` }} />
                </div>
              </div>
            ))}
            <div style={{ background: "#f1f8f3", borderRadius: 11, padding: 13 }}>
              <b style={{ fontSize: 12 }}>{ui(lang, "Audit-chain status: Verified (reference)")}</b>
              <p style={{ ...muted, marginBottom: 0 }}>
                The demo logs are browser-local and are not actually immutable
                or cryptographically verified.
              </p>
            </div>
          </section>
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "Security Control Summary")}</h3>
            {[
              ["Critical alerts", "0 · baseline"],
              ["High-severity alerts", "1 · baseline"],
              ["Locked accounts", "4 · baseline"],
              ["Dormant accounts", "Access review required"],
              ["Vault / keys", "Rotation review available"],
              ["Vulnerability management", "Patch compliance 98%"],
            ].map(([key, value]) => (
              <div className="sec14-row" key={key}>
                <span style={{ fontSize: 12 }}>{key}</span>
                <b style={{ fontSize: 11, textAlign: "right" }}>{value}</b>
              </div>
            ))}
            <button style={{ ...primary, marginTop: 16 }} disabled={!canInvestigate}
              onClick={createIncident}>
              <Siren size={14} style={{ verticalAlign: "middle" }} />
              {" "}Launch tabletop incident
            </button>
          </section>
        </div>
      )}

      {tab === "alerts" && (
        <div className="sec14-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              SIEM Alert Queue
            </h3>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Search size={16} color="#779085" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rule / source"
                style={{ ...button, width: "100%", textAlign: "left", fontWeight: 400 }}
              />
            </label>
            <div style={{ display: "grid", gap: 8 }}>
              {alerts.filter((a) =>
                `${a.rule} ${a.source}`.toLowerCase().includes(search.toLowerCase())
              ).map((a) => (
                <button key={a.id} className="sec14-entry"
                  onClick={() => setSelectedId(a.id)}
                  style={{
                    borderColor: selectedId === a.id ? "#008359" : undefined,
                    background: selectedId === a.id ? "#f0f8f3" : undefined,
                  }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                    <b style={{ fontSize: 12 }}>{a.rule}</b>
                    <span className="sec14-pill" style={badge(a.severity)}>{a.severity}</span>
                  </div>
                  <div style={muted}>{a.id} · {a.source} · {a.status}</div>
                  <div style={muted}>{new Date(a.time).toLocaleString((lang === "bn") ? "bn-BD" : "en-GB")}</div>
                </button>
              ))}
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Investigation Workspace
            </h3>
            {selected ? (
              <>
                <b style={{ fontSize: 17 }}>{selected.rule}</b>
                <p style={muted}>{selected.id} · {selected.source}</p>
                <div className="sec14-row">
                  <span>{ui(lang, "Severity")}</span>
                  <span className="sec14-pill" style={badge(selected.severity)}>
                    {selected.severity}
                  </span>
                </div>
                <div className="sec14-row">
                  <span>{ui(lang, "Status")}</span>
                  <span className="sec14-pill" style={badge(selected.status)}>
                    {selected.status}
                  </span>
                </div>
                <div style={{ marginTop: 15, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button style={primary}
                    disabled={!canInvestigate || selected.status !== "open"}
                    onClick={() => changeStatus("investigating")}>
                    Investigate
                  </button>
                  <button style={button}
                    disabled={!canInvestigate || selected.status !== "investigating"}
                    onClick={() => changeStatus("contained")}>
                    Contain
                  </button>
                  <button style={button}
                    disabled={!canInvestigate || selected.status !== "contained"}
                    onClick={() => changeStatus("closed")}>
                    Close incident
                  </button>
                </div>
                <h4 style={{ fontSize: 13, marginTop: 22 }}>{ui(lang, "Investigation Timeline")}</h4>
                {selected.history.map((event, i) => (
                  <div key={i} style={{
                    ...muted, padding: "9px 0 9px 12px",
                    borderLeft: "2px solid #65b08a",
                  }}>{event}</div>
                ))}
              </>
            ) : <p style={muted}>{ui(lang, "Select an alert.")}</p>}
          </section>
        </div>
      )}

      {tab === "access" && (
        <div className="sec14-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              <UserRound size={18} style={{ verticalAlign: "middle" }} />
              {" "}Privileged Access Review
            </h3>
            {[
              ["Privileged accounts", "412"],
              ["MFA coverage", "412 / 412"],
              ["Accounts locked", "4"],
              ["Access review", reviewComplete ? "Complete (demo)" : "Pending"],
              ["Dormant-user checks", "Review recommended"],
              ["NID unmasking", "Monitor privileged events"],
            ].map(([name, value]) => (
              <div className="sec14-row" key={name}>
                <span>{name}</span><b style={{ fontSize: 12 }}>{value}</b>
              </div>
            ))}
            <button style={{ ...primary, marginTop: 16 }}
              disabled={!canInvestigate || reviewComplete}
              onClick={completeAccessReview}>
              <CheckCircle2 size={14} style={{ verticalAlign: "middle" }} />
              {" "}Complete access review
            </button>
            <p style={{ ...muted, marginTop: 11 }}>
              This action records a demo review, not a live user account update.
            </p>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              <KeyRound size={18} style={{ verticalAlign: "middle" }} />
              {" "}Secrets & Vulnerability Overview
            </h3>
            {[
              ["Managed secrets", "Illustrative vault"],
              ["Encryption keys", "Review key age"],
              ["Credential rotation", "Policy-based schedule (demo)"],
              ["Infrastructure patching", "98% reference compliance"],
              ["Nodes requiring patch", "2 · reference"],
              ["Vulnerability reporting", "Scanners not connected"],
            ].map(([name, value]) => (
              <div className="sec14-row" key={name}>
                <span>{name}</span>
                <b style={{ fontSize: 11, textAlign: "right" }}>{value}</b>
              </div>
            ))}
            <div style={{
              ...muted, marginTop: 16, padding: 13,
              background: "#f4f8f5", borderRadius: 10,
            }}>
              No secrets, passwords, encryption keys or real vulnerabilities
              are exposed by this demonstration.
            </div>
          </section>
        </div>
      )}

      {tab === "audit" && (
        <div className="sec14-grid">
          <section style={card}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 9,
            }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>{ui(lang, "Security Activity Audit")}</h3>
              <button style={button} onClick={() => exportCsv([
                ["Timestamp", "Actor", "Action", "Target"],
                ...events.map((e) => [e.time, e.actor, e.action, e.target]),
              ])}>
                <Download size={14} style={{ verticalAlign: "middle" }} />
                {" "}Export CSV
              </button>
            </div>
            <p style={muted}>{ui(lang, "Browser-local investigation events only.")}</p>
            {!events.length && <p style={muted}>{ui(lang, "No interactive events recorded yet.")}</p>}
            {events.map((e) => (
              <div key={e.id} className="sec14-row">
                <div>
                  <b style={{ fontSize: 12 }}>{e.action}</b>
                  <div style={muted}>
                    {e.target} · {e.actor} · {new Date(e.time).toLocaleString()}
                  </div>
                </div>
                <CheckCircle2 size={15} color="#087b54" />
              </div>
            ))}
          </section>
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Tabletop Drill Controls
            </h3>
            <p style={muted}>
              Run a simulated security event, investigate, contain,
              close and inspect the local event history.
            </p>
            <button style={primary} disabled={!canInvestigate}
              onClick={createIncident}>
              <Siren size={14} style={{ verticalAlign: "middle" }} />
              {" "}Simulate incident
            </button>
            <button style={{ ...button, marginLeft: 8 }}
              disabled={!canInvestigate}
              onClick={reset}>
              <RotateCcw size={14} style={{ verticalAlign: "middle" }} />
              {" "}Reset demo
            </button>
            <div style={{ ...muted, padding: 13, marginTop: 18, background: "#f4f8f5", borderRadius: 10 }}>
              Security posture metrics and audit-chain verification are
              illustrative. This client demo is not an operational SIEM.
            </div>
          </section>
        </div>
      )}

      <footer style={{ ...muted, textAlign: "center", marginTop: 22 }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
        {" "}MCBP-MIS D14 · Fictional alerts and local security workflows
      </footer>
    </div>
  );
}
