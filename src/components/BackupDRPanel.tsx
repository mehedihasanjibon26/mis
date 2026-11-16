
"use client";
import { ui } from "../lib/ui-l10n";

import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock3,
  Database, Download, HardDrive, LockKeyhole, Play,
  RotateCcw, Server, ShieldCheck,
} from "lucide-react";

type Role = string;
type Lang = "en" | "bn";
type JobStatus = "success" | "failed";
type Job = {
  id: string;
  name: string;
  schedule: string;
  size: string;
  encrypted: boolean;
  status: JobStatus;
  lastRun: string;
};
type Drill = {
  id: string;
  kind: "restore" | "failover";
  status: "passed" | "blocked";
  duration: string;
  actor: string;
  time: string;
  detail: string;
};
type Event = { id: string; time: string; action: string; actor: string };

const seedJobs: Job[] = [
  { id: "BK-01", name: "PostgreSQL full", schedule: "Weekly", size: "118 GB", encrypted: true, status: "success", lastRun: "Reference snapshot" },
  { id: "BK-02", name: "PostgreSQL incremental", schedule: "Daily", size: "4.1 GB", encrypted: true, status: "success", lastRun: "Reference snapshot" },
  { id: "BK-03", name: "WAL archive", schedule: "Continuous", size: "Rolling", encrypted: true, status: "success", lastRun: "Reference snapshot" },
  { id: "BK-04", name: "Object storage replication", schedule: "Continuous", size: "Mirrored", encrypted: true, status: "success", lastRun: "Reference snapshot" },
  { id: "BK-05", name: "Git repository mirror", schedule: "Daily", size: "Repository", encrypted: true, status: "success", lastRun: "Reference snapshot" },
  { id: "BK-06", name: "ClickHouse snapshot", schedule: "Daily", size: "Snapshot", encrypted: true, status: "success", lastRun: "Reference snapshot" },
];

const seedDrills: Drill[] = [
  { id: "DR-REFERENCE-01", kind: "restore", status: "passed", duration: "52 min", actor: "Reference scenario", time: "2026-11-16T06:00:00Z", detail: "Illustrative database restore test" },
  { id: "DR-REFERENCE-02", kind: "failover", status: "passed", duration: "3 h 12 m", actor: "Reference scenario", time: "2026-11-16T05:00:00Z", detail: "Illustrative DR drill · RTO target 4 h" },
];

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #dde9e0",
  borderRadius: 16, padding: 19,
  boxShadow: "0 5px 20px rgba(10,60,40,.035)",
};
const button: React.CSSProperties = {
  background: "#fff", border: "1px solid #d6e5da", color: "#12513a",
  padding: "10px 13px", borderRadius: 9,
  fontSize: 12, fontWeight: 700, cursor: "pointer",
};
const primary: React.CSSProperties = {
  ...button, background: "#006a4e", borderColor: "#006a4e", color: "#fff",
};
const muted: React.CSSProperties = {
  fontSize: 11, color: "#728677", lineHeight: 1.7,
};
function pill(state: string): React.CSSProperties {
  return {
    borderRadius: 30, padding: "6px 10px", fontSize: 10, fontWeight: 800,
    background: ["passed", "success"].includes(state) ? "#e5f5eb" : "#ffede6",
    color: ["passed", "success"].includes(state) ? "#06754f" : "#a04932",
  };
}
function exportCSV(events: Event[]) {
  const rows = [
    ["Time", "Actor", "Action"],
    ...events.map((event) => [event.time, event.actor, event.action]),
  ];
  const csv = rows.map((row) =>
    row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "MCBP-Backup-DR-Demo-Audit.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function BackupDRPanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: Lang;
  roleId?: Role;
}) {
  const [tab, setTab] = useState<"overview" | "jobs" | "recovery" | "audit">("overview");
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [drills, setDrills] = useState<Drill[]>(seedDrills);
  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState("BK-01");
  const [scenario, setScenario] = useState<"healthy" | "failure">("healthy");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const canOperate = roleId === "admin";
  const selectedJob = jobs.find((j) => j.id === selected);
  const failedJobs = jobs.filter((j) => j.status === "failed").length;

  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem("mcbp-dr-jobs");
      const storedDrills = localStorage.getItem("mcbp-dr-drills");
      const storedEvents = localStorage.getItem("mcbp-dr-events");
      if (storedJobs) {
        const parsed: unknown = JSON.parse(storedJobs);
        if (Array.isArray(parsed)) setJobs(parsed as Job[]);
      }
      if (storedDrills) {
        const parsed: unknown = JSON.parse(storedDrills);
        if (Array.isArray(parsed)) setDrills(parsed as Drill[]);
      }
      if (storedEvents) {
        const parsed: unknown = JSON.parse(storedEvents);
        if (Array.isArray(parsed)) setEvents(parsed as Event[]);
      }
    } catch {
      // Fall back to fictional seed data.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("mcbp-dr-jobs", JSON.stringify(jobs));
    localStorage.setItem("mcbp-dr-drills", JSON.stringify(drills));
    localStorage.setItem("mcbp-dr-events", JSON.stringify(events));
  }, [jobs, drills, events, ready]);

  function audit(action: string) {
    setEvents((old) => [{
      id: `EV-${Date.now()}-${old.length}`,
      time: new Date().toISOString(), actor: roleId, action,
    }, ...old]);
  }

  function simulateBackup() {
    if (!canOperate || !selectedJob) {
      setNotice("Administrator role required.");
      return;
    }
    const failed = scenario === "failure";
    setJobs((old) => old.map((j) =>
      j.id === selected ? {
        ...j,
        status: failed ? "failed" : "success",
        lastRun: new Date().toLocaleString(),
      } : j
    ));
    audit(`${selectedJob.name}: simulated ${failed ? "failure" : "success"}`);
    setNotice(
      failed
        ? "Backup failure simulated. Investigation required."
        : "Backup completed in demo only; no real backup was created."
    );
  }

  function restoreJob() {
    if (!canOperate || !selectedJob) return;
    setJobs((old) => old.map((j) =>
      j.id === selected
        ? { ...j, status: "success", lastRun: new Date().toLocaleString() }
        : j
    ));
    audit(`Backup recovery simulated: ${selectedJob.name}`);
    setNotice("Fictional backup status restored.");
  }

  function runDrill(kind: "restore" | "failover") {
    if (!canOperate) {
      setNotice("Administrator role required.");
      return;
    }
    const blocked = jobs.some((j) => j.status === "failed");
    const item: Drill = {
      id: `DR-${Date.now()}`,
      kind,
      status: blocked ? "blocked" : "passed",
      duration: blocked ? "Not executed" : kind === "restore" ? "52 min" : "3 h 12 m",
      actor: roleId,
      time: new Date().toISOString(),
      detail: blocked
        ? "Simulation blocked: unresolved backup failure"
        : kind === "restore"
          ? "Fictional point-in-time restore and validation passed"
          : "Fictional primary-to-DR failover and DNS switch passed",
    };
    setDrills((old) => [item, ...old]);
    audit(`${kind} drill ${item.status}`);
    setNotice(
      blocked
        ? "DR drill blocked until backup failure is recovered."
        : `${kind} drill passed in simulation. No infrastructure changes made.`
    );
  }

  function reset() {
    if (!canOperate) return;
    setJobs(seedJobs);
    setDrills(seedDrills);
    setEvents([]);
    setNotice("Original fictional scenario restored.");
  }

  return (
    <div className="dr15">
      <style>{`
        .dr15{font-family:Arial,Helvetica,sans-serif;color:#193f2e;min-width:0}
        .dr15-hero{border-radius:19px;background:linear-gradient(110deg,#073e32,#007554);
          color:#fff;padding:26px;margin-bottom:15px}
        .dr15-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:15px}
        .dr15-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
        .dr15-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:15px}
        .dr15-table{border-collapse:collapse;width:100%;font-size:12px}
        .dr15-table th{text-align:left;color:#7a8e7e;font-size:11px}
        .dr15-table td,.dr15-table th{padding:12px 9px;border-bottom:1px solid #e6eee8}
        .dr15-row{padding:12px 0;border-bottom:1px solid #e7eee9;display:flex;
          justify-content:space-between;align-items:center;gap:10px;font-size:12px}
        .dr15-node{background:#edf7f1;border:1px solid #cde5d5;border-radius:11px;
          padding:14px;font-size:11px;font-weight:800;text-align:center;flex:1}
        @media(max-width:950px){.dr15-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.dr15-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="dr15-hero">
        <div style={{ color: "#bde7d3", fontSize: 11, letterSpacing: 1.4 }}>
          PLATFORM OPERATIONS · D15
        </div>
        <h2 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "11px 0" }}>
          {t("Backup & Disaster Recovery", "ব্যাকআপ ও দুর্যোগ পুনরুদ্ধার")}
        </h2>
        <p style={{ color: "#d1ecdd", fontSize: 13, lineHeight: 1.7 }}>
          {t(
            "Track backup health, retention and replication; rehearse recovery and disaster failover without touching infrastructure.",
            "ব্যাকআপ, রিপ্লিকেশন, রিটেনশন এবং দুর্যোগকালীন পুনরুদ্ধারের ডেমো দেখুন।"
          )}
        </p>
        <div style={{ color: "#bce7d3", fontSize: 10 }}>
          SIMULATED BACKUP SYSTEM · NO ACTUAL RESTORE, REPLICATION OR DNS FAILOVER
        </div>
      </section>

      <div className="dr15-kpis">
        {([
          ["Last full backup", "118 GB", Database, "Reference · success"],
          ["Incremental backup", "4.1 GB", HardDrive, "Reference · success"],
          ["Replication lag", "8 s", Activity, "RPO target 15 min"],
          ["DR drill RTO", "3 h 12 m", Clock3, "Target 4 hours"],
        ] as const).map(([name, value, Icon, detail]) => (
          <section key={name} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={muted}>{name}</span>
              <Icon size={18} color="#007755" />
            </div>
            <div style={{ fontSize: 25, fontWeight: 850, margin: "13px 0 5px" }}>
              {value}
            </div>
            <div style={muted}>{detail}</div>
          </section>
        ))}
      </div>

      <div className="dr15-tabs">
        {([
          ["overview", "DR Readiness", "ডিআর প্রস্তুতি"],
          ["jobs", "Backup Jobs", "ব্যাকআপ জব"],
          ["recovery", "Restore & Failover", "পুনরুদ্ধার ও ফেইলওভার"],
          ["audit", "Retention & Audit", "রিটেনশন ও অডিট"],
        ] as const).map(([key, en, bn]) => (
          <button key={key} style={tab === key ? primary : button}
            onClick={() => setTab(key)}>{t(en, bn)}</button>
        ))}
      </div>

      {notice && (
        <div style={{
          ...card, background: "#eaf7ed",
          fontSize: 12, color: "#076141", marginBottom: 14,
        }}>
          {notice}
          <button style={{ ...button, float: "right", padding: "3px 8px" }}
            onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {tab === "overview" && (
        <div className="dr15-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 10px" }}>
              <Server size={18} style={{ verticalAlign: "middle" }} />
              {" "}Disaster Recovery Architecture
            </h3>
            <p style={muted}>{ui(lang, "Reference architecture with fictional operating status.")}</p>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center", margin: "20px 0" }}>
              <div className="dr15-node">{ui(lang, "Primary Region")}<div style={muted}>{ui(lang, "Active workloads")}</div></div>
              <ArrowRight size={19} color="#62937a" />
              <div className="dr15-node">{ui(lang, "WAL + Replication")}<div style={muted}>8s lag · reference</div></div>
              <ArrowRight size={19} color="#62937a" />
              <div className="dr15-node">{ui(lang, "DR Region")}<div style={muted}>{ui(lang, "Warm standby")}</div></div>
            </div>
            {[
              ["Standby applying WAL", "Yes · reference"],
              ["Production version", "1.7.3"],
              ["DR version", "1.7.3"],
              ["DNS failover test", "Passed · reference"],
              ["Runbook", "v1.4 · approved"],
              ["Backup health", failedJobs ? `${failedJobs} failed demo job(s)` : "All demo jobs successful"],
            ].map(([key, value]) => (
              <div key={key} className="dr15-row">
                <span>{key}</span><b>{value}</b>
              </div>
            ))}
          </section>
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              <ShieldCheck size={18} style={{ verticalAlign: "middle" }} />
              {" "}Recovery Objectives
            </h3>
            {[
              ["Recovery Point Objective", "15 minutes"],
              ["Observed replication lag", "8 seconds · reference"],
              ["Recovery Time Objective", "4 hours"],
              ["Last reference DR drill", "3h 12m"],
              ["Restore test", "52 min · passed"],
            ].map(([key, value]) => (
              <div className="dr15-row" key={key}>
                <span>{key}</span><b>{value}</b>
              </div>
            ))}
            <div style={{ padding: 14, background: "#eff7f1", borderRadius: 10, marginTop: 18 }}>
              <b style={{ fontSize: 12 }}>{ui(lang, "Recovery decision")}</b>
              <p style={{ ...muted, marginBottom: 0 }}>
                Backup → verify integrity → restore services → validate
                data consistency → cut over DNS → confirm recovery.
                This panel demonstrates the process only.
              </p>
            </div>
          </section>
        </div>
      )}

      {tab === "jobs" && (
        <div className="dr15-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "Backup Schedule & Job History")}</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="dr15-table">
                <thead>
                  <tr>
                    <th>{ui(lang, "Job")}</th><th>{ui(lang, "Schedule")}</th><th>{ui(lang, "Size")}</th><th>{ui(lang, "Encrypted")}</th><th>{ui(lang, "Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id}
                      onClick={() => setSelected(j.id)}
                      style={{
                        cursor: "pointer",
                        background: selected === j.id ? "#eef8f1" : undefined,
                      }}>
                      <td><b>{j.name}</b><div style={muted}>{j.lastRun}</div></td>
                      <td>{j.schedule}</td>
                      <td>{j.size}</td>
                      <td>{j.encrypted ? "Yes" : "No"}</td>
                      <td><span style={pill(j.status)}>{j.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "Backup Job Simulator")}</h3>
            <b>{selectedJob?.name}</b>
            <p style={muted}>{selectedJob?.id} · {selectedJob?.schedule} · encrypted storage</p>
            <label style={{ ...muted, display: "block", margin: "16px 0" }}>
              Demo run outcome
              <select style={{
                ...button, display: "block",
                width: "100%", marginTop: 7,
              }} value={scenario}
                onChange={(e) => setScenario(e.target.value as "healthy" | "failure")}>
                <option value="healthy">{ui(lang, "Success scenario")}</option>
                <option value="failure">{ui(lang, "Failure scenario")}</option>
              </select>
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={primary} disabled={!canOperate} onClick={simulateBackup}>
                <Play size={13} style={{ verticalAlign: "middle" }} /> Simulate backup
              </button>
              <button style={button} disabled={!canOperate || selectedJob?.status !== "failed"}
                onClick={restoreJob}>{ui(lang, "Recover job")}</button>
            </div>
            <p style={{ ...muted, marginTop: 16 }}>
              No backup file, database snapshot or encryption operation is created.
            </p>
          </section>
        </div>
      )}

      {tab === "recovery" && (
        <div className="dr15-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "Restore & Failover Drill")}</h3>
            <p style={muted}>
              Fictional recovery test. Unresolved backup failures
              block a simulated recovery drill.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, margin: "15px 0" }}>
              <button style={primary} disabled={!canOperate}
                onClick={() => runDrill("restore")}>
                <Database size={14} style={{ verticalAlign: "middle" }} /> Run restore test
              </button>
              <button style={button} disabled={!canOperate}
                onClick={() => runDrill("failover")}>
                <Server size={14} style={{ verticalAlign: "middle" }} /> Run failover drill
              </button>
            </div>
            {failedJobs > 0 && (
              <div style={{
                borderRadius: 10, padding: 13,
                background: "#fff1e7", fontSize: 12,
                color: "#965f29", marginBottom: 12,
              }}>
                <AlertTriangle size={14} style={{ verticalAlign: "middle" }} />
                {" "}Resolve {failedJobs} simulated backup failure(s) before recovery test.
              </div>
            )}
            {drills.map((d) => (
              <div key={d.id} className="dr15-row">
                <div>
                  <b style={{ fontSize: 12, textTransform: "capitalize" }}>{d.kind} · {d.duration}</b>
                  <div style={muted}>{d.detail}</div>
                  <div style={muted}>{d.actor} · {new Date(d.time).toLocaleString((lang === "bn") ? "bn-BD" : "en-GB")}</div>
                </div>
                <span style={pill(d.status)}>{d.status}</span>
              </div>
            ))}
          </section>
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "Recovery Workflow")}</h3>
            {[
              ["1", "Declare disaster", "Incident escalation and activation"],
              ["2", "Validate standby", "WAL, replicated objects and version parity"],
              ["3", "Restore services", "Verify database and application health"],
              ["4", "Traffic failover", "DNS/load-balancing cutover simulation"],
              ["5", "Business validation", "Confirm functionality and reconciliation"],
            ].map(([number, title, detail]) => (
              <div key={number} className="dr15-row">
                <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                  <span style={{
                    background: "#e3f4e9", color: "#08784f",
                    borderRadius: 8, padding: 11, fontWeight: 800,
                  }}>{number}</span>
                  <div><b>{title}</b><div style={muted}>{detail}</div></div>
                </div>
                <CheckCircle2 size={16} color="#4b9b73" />
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "audit" && (
        <div className="dr15-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              <LockKeyhole size={18} style={{ verticalAlign: "middle" }} />
              {" "}Retention & Data Protection
            </h3>
            {[
              ["WAL archive", "14 days"],
              ["Daily incrementals", "30 days"],
              ["Weekly full backups", "4 weeks"],
              ["Monthly full backups", "12 months"],
              ["Backup encryption", "Enabled · reference"],
              ["Runbook", "v1.4 approved · reference"],
            ].map(([label, value]) => (
              <div key={label} className="dr15-row"><span>{label}</span><b>{value}</b></div>
            ))}
            <p style={{ ...muted, marginTop: 16 }}>
              Retention policies are illustrated, not enforced by this browser demo.
            </p>
          </section>

          <section style={card}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              flexWrap: "wrap", gap: 8,
            }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>{ui(lang, "Demo Audit Log")}</h3>
              <button style={button} onClick={() => exportCSV(events)}>
                <Download size={13} style={{ verticalAlign: "middle" }} /> Export CSV
              </button>
            </div>
            {!events.length && <p style={muted}>{ui(lang, "Run a backup or recovery drill to record an event.")}</p>}
            {events.map((e) => (
              <div className="dr15-row" key={e.id}>
                <div><b>{e.action}</b><div style={muted}>{e.actor} · {new Date(e.time).toLocaleString((lang === "bn") ? "bn-BD" : "en-GB")}</div></div>
                <ShieldCheck size={16} color="#087b54" />
              </div>
            ))}
            <button style={{ ...button, marginTop: 16 }}
              disabled={!canOperate} onClick={reset}>
              <RotateCcw size={13} style={{ verticalAlign: "middle" }} />
              {" "}Reset demo
            </button>
          </section>
        </div>
      )}

      <footer style={{ ...muted, marginTop: 22, textAlign: "center" }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
        {" "}D15 · Browser-local backup and disaster recovery simulation · No live infrastructure affected
      </footer>
    </div>
  );
}
