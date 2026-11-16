
"use client";
import { ui, digits } from "../lib/ui-l10n";

import { useState } from "react";
import {
  Bot, CheckCircle2, Download,
  FileText, LockKeyhole, RotateCcw,
  ShieldCheck, Sparkles, XCircle,
} from "lucide-react";

type Decision = "pending" | "approved" | "rejected";
type Run = {
  id: string;
  agent: string;
  output: string;
  source: string;
  owner: string;
  age: string;
  decision: Decision;
  reviewer?: string;
  note?: string;
};
type Audit = {
  id: string;
  time: string;
  actor: string;
  action: string;
  run: string;
};
type Tab = "overview" | "reviews" | "models" | "guardrails" | "audit";

const initialRuns: Run[] = [
  {
    id: "AL-5521",
    agent: "Alerting Agent",
    output: "Tier-2 payment bounce-back rate above 1%; propose alert and draft SMS",
    source: "Tier-2 payments aggregate",
    owner: "Programme Operations",
    age: "12 min",
    decision: "pending",
  },
  {
    id: "RP-4210",
    agent: "Report Generation Agent",
    output: "Draft monthly coverage and payment exception report",
    source: "Approved aggregate reporting dataset",
    owner: "Monitoring & Evaluation",
    age: "24 min",
    decision: "pending",
  },
  {
    id: "DC-3308",
    agent: "Data Collection Agent",
    output: "Flag missing verification fields for manual follow-up",
    source: "Field verification checklist metadata",
    owner: "Data Steward",
    age: "38 min",
    decision: "pending",
  },
  {
    id: "CA-2204",
    agent: "Calculation Agent",
    output: "Simulated calculation discrepancy requires finance review",
    source: "Fictional benefit-rule test results",
    owner: "Finance Reviewer",
    age: "52 min",
    decision: "pending",
  },
];

const models = [
  ["Multilingual LLM", "Bangla/English assistance", "v1.8", "Active"],
  ["Embedding model", "Semantic retrieval", "v1.4", "Active"],
  ["Re-ranker", "Evidence relevance", "v1.2", "Active"],
  ["Small fallback LLM", "Fallback responses", "v1.1", "Standby"],
  ["Candidate model", "Evaluation only", "vNext", "Candidate"],
];

const guardrails = [
  ["PII redacted", 37, "Sensitive text removed before display"],
  ["Out-of-scope refused", 58, "Unsupported tasks refused"],
  ["Prompt injection blocked", 4, "Illustrative operational event count"],
  ["Not-found answers", 126, "Insufficient evidence returned"],
];

const card: React.CSSProperties = {
  padding: 20, borderRadius: 16, background: "#fff",
  border: "1px solid #dfe9e2",
};
const button: React.CSSProperties = {
  padding: "10px 13px", borderRadius: 9,
  border: "1px solid #d4e5d9", background: "#fff",
  color: "#155039", fontSize: 12, fontWeight: 700,
  cursor: "pointer",
};
const primary: React.CSSProperties = {
  ...button, background: "#006a4e",
  color: "#fff", borderColor: "#006a4e",
};
const muted: React.CSSProperties = {
  fontSize: 11, color: "#718577", lineHeight: 1.7,
};
const KEY = "mcbp-d18-governance-v1";

function readState(): { runs: Run[]; audit: Audit[] } {
  if (typeof window === "undefined") {
    return { runs: initialRuns, audit: [] };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as { runs: Run[]; audit: Audit[] };
      if (Array.isArray(data.runs) && Array.isArray(data.audit)) return data;
    }
  } catch {
    // Use fictional reference state.
  }
  return { runs: initialRuns, audit: [] };
}

function exportCSV(rows: string[][]) {
  const csv = rows.map((row) =>
    row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "MCBP-D18-AI-Governance.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function AIGovernancePanel({
  lang = "en", roleId = "admin",
}: {
  lang?: "en" | "bn"; roleId?: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [store, setStore] = useState(readState);
  const [selected, setSelected] = useState("AL-5521");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const reviewer = roleId === "executive";
  const current = store.runs.find((x) => x.id === selected);
  const pending = store.runs.filter((x) => x.decision === "pending").length;

  function save(next: typeof store) {
    setStore(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }

  function decide(decision: "approved" | "rejected") {
    if (!reviewer || !current || current.decision !== "pending") {
      setMessage("An independent Programme Executive reviewer is required.");
      return;
    }
    if (!note.trim()) {
      setMessage("Add a review note before making a decision.");
      return;
    }
    const next = {
      runs: store.runs.map((r) =>
        r.id === current.id
          ? { ...r, decision, reviewer: roleId, note: note.trim() }
          : r
      ),
      audit: [{
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        actor: roleId,
        action: `${decision} AI proposal: ${note.trim()}`,
        run: current.id,
      }, ...store.audit],
    };
    save(next);
    setNote("");
    setMessage(
      `Proposal ${decision} in the demo review queue. No real action executed.`
    );
  }

  function reset() {
    if (roleId !== "admin") return;
    save({ runs: initialRuns, audit: [] });
    setSelected("AL-5521");
    setNote("");
    setMessage("Fictional AI governance scenario reset.");
  }

  return (
    <div className="aig18">
      <style>{`
        .aig18{font-family:Arial,Helvetica,sans-serif;color:#193e2f;min-width:0}
        .aig18-hero{padding:26px;border-radius:18px;background:linear-gradient(115deg,#063e31,#007454);color:white}
        .aig18-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:15px 0}
        .aig18-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
        .aig18-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:15px}
        .aig18-row{padding:13px 0;border-bottom:1px solid #e9f0ea;display:flex;justify-content:space-between;gap:12px;align-items:center;font-size:12px}
        .aig18-item{width:100%;text-align:left;background:white;border:1px solid #dce9df;border-radius:11px;padding:14px;cursor:pointer}
        .aig18-pill{padding:6px 9px;border-radius:25px;background:#e6f5eb;color:#08724b;font-size:10px;font-weight:800}
        .aig18-table{border-collapse:collapse;width:100%;font-size:12px}
        .aig18-table th,.aig18-table td{padding:12px 8px;border-bottom:1px solid #e9f0ea;text-align:left}
        .aig18-table th{font-size:11px;color:#758779}
        @media(max-width:950px){.aig18-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.aig18-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="aig18-hero">
        <div style={{ fontSize: 11, color: "#bee6d3", letterSpacing: 1.4 }}>
          PLATFORM OPERATIONS · D18
        </div>
        <h2 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "10px 0" }}>
          {t("AI Governance & Model Registry", "এআই গভর্নেন্স ও মডেল রেজিস্ট্রি")}
        </h2>
        <p style={{ fontSize: 13, color: "#d8eee2", lineHeight: 1.7 }}>
          {t(
            "Supervise AI agent proposals, evaluate model quality, inspect guardrails and require human decisions.",
            "এআই প্রস্তাব পর্যালোচনা, মডেল যাচাই, গার্ডরেইল ও মানুষের অনুমোদন দেখুন।"
          )}
        </p>
        <div style={{ fontSize: 10, color: "#bce6d3" }}>
          DEMO / SIMULATED AI GOVERNANCE · NO REAL MODEL EXECUTION
        </div>
      </section>

      <div className="aig18-kpis">
        {([
          ["Bangla accuracy", "92.1%", Sparkles, "Gate ≥ 90%"],
          ["Sourced answers", "100%", FileText, "Reference result"],
          ["Injection tests blocked", "98.6%", ShieldCheck, "214 / 217 tests"],
          ["Human review queue", String(pending), Bot, "Decision-required runs"],
        ] as const).map(([name, value, Icon, detail]) => (
          <div key={name} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={muted}>{ui(lang, String(name))}</span><Icon size={18} color="#007653"/>
            </div>
            <div style={{ fontSize: 25, fontWeight: 850, margin: "12px 0 5px" }}>{digits(lang, value)}</div>
            <div style={muted}>{ui(lang, String(detail))}</div>
          </div>
        ))}
      </div>

      <div className="aig18-tabs">
        {([
          ["overview", "Overview", "ওভারভিউ"],
          ["reviews", "AI Decision Queue", "এআই সিদ্ধান্তের তালিকা"],
          ["models", "Model Registry", "মডেল রেজিস্ট্রি"],
          ["guardrails", "Guardrail Events", "গার্ডরেইল ইভেন্ট"],
          ["audit", "Audit Trail", "অডিট ট্রেইল"],
        ] as const).map(([key, en, bn]) => (
          <button key={key} style={tab === key ? primary : button} onClick={() => setTab(key)}>
            {t(en, bn)}
          </button>
        ))}
      </div>

      {message && <div style={{ ...card, marginBottom: 15, background: "#eaf6ec", fontSize: 12 }}>
        {message}
        <button onClick={() => setMessage("")} style={{ ...button, float: "right", padding: "3px 8px" }}>×</button>
      </div>}

      {tab === "overview" && <div className="aig18-grid">
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "AI Safety & Quality")}</h3>
          {[
            ["Bangla answer accuracy", "92.1% · target ≥ 90%"],
            ["Answers with supporting source", "100% · reference"],
            ["Scope violations", "0 of 4,120 queries"],
            ["Prompt-injection test blocking", "214 of 217 · 98.6%"],
            ["GPU utilisation", "46% · 2 × 32 GB"],
            ["Human review pending", `${pending} proposals`],
          ].map(([label, value]) => (
            <div className="aig18-row" key={label}>
              <span>{ui(lang, label)}</span><b style={{ textAlign: "right" }}>{digits(lang, value)}</b>
            </div>
          ))}
          <button style={{ ...primary, marginTop: 15 }} onClick={() => setTab("reviews")}>
            Open decision queue
          </button>
        </section>
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "AI Decision Boundary")}</h3>
          {[
            ["1", "AI agent prepares a proposal"],
            ["2", "Evidence and model output are recorded"],
            ["3", "Human reviewer inspects context"],
            ["4", "Reviewer approves or rejects proposal"],
            ["5", "Decision is captured in demo audit"],
          ].map(([number, text]) => (
            <div key={number} className="aig18-row">
              <span className="aig18-pill">{number}</span><b style={{ flex: 1 }}>{text}</b>
            </div>
          ))}
          <p style={muted}>
            Approval means accepting a proposed output for review purposes.
            It does not authorise payments, database updates or message delivery.
          </p>
        </section>
      </div>}

      {tab === "reviews" && <div className="aig18-grid">
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Agent Runs Awaiting Human Review")}</h3>
          <div style={{ display: "grid", gap: 9 }}>
            {store.runs.map((run) => (
              <button key={run.id}
                className="aig18-item"
                style={{
                  background: selected === run.id ? "#f0f8f3" : "#fff",
                  borderColor: selected === run.id ? "#008458" : "#dce9df",
                }}
                onClick={() => { setSelected(run.id); setNote(""); }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b style={{ fontSize: 12 }}>{run.agent}</b>
                  <span className="aig18-pill">{run.decision}</span>
                </div>
                <div style={{ ...muted, marginTop: 6 }}>{run.id} · {run.owner} · {run.age}</div>
                <p style={{ fontSize: 12, marginBottom: 0 }}>{run.output}</p>
              </button>
            ))}
          </div>
        </section>
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Human Review Workspace")}</h3>
          {current && <>
            <b style={{ fontSize: 15 }}>{current.agent}</b>
            <p style={{ fontSize: 12 }}>{current.output}</p>
            {[
              ["Run", current.id],
              ["Source evidence", current.source],
              ["Assigned to", current.owner],
              ["Decision", current.decision],
              ["Reviewer", current.reviewer || "Pending"],
            ].map(([label, value]) => (
              <div className="aig18-row" key={label}>
                <span>{ui(lang, label)}</span><b style={{ textAlign: "right" }}>{digits(lang, value)}</b>
              </div>
            ))}
            <label style={{ ...muted, display: "block", marginTop: 15 }}>
              Review note (mandatory)
              <textarea
                style={{
                  display: "block", width: "100%", boxSizing: "border-box",
                  minHeight: 85, borderRadius: 9, padding: 11,
                  border: "1px solid #d3e5da", marginTop: 7,
                }}
                value={note} onChange={(e) => setNote(e.target.value)}
                disabled={!reviewer || current.decision !== "pending"}
                placeholder="Document evidence, concerns or reason for decision"
              />
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 13, flexWrap: "wrap" }}>
              <button style={primary}
                disabled={!reviewer || current.decision !== "pending"}
                onClick={() => decide("approved")}>
                <CheckCircle2 size={14} style={{ verticalAlign: "middle" }} /> Approve proposal
              </button>
              <button style={button}
                disabled={!reviewer || current.decision !== "pending"}
                onClick={() => decide("rejected")}>
                <XCircle size={14} style={{ verticalAlign: "middle" }} /> Reject
              </button>
            </div>
            <p style={{ ...muted, marginTop: 14 }}>
              Switch Main Dashboard role to Programme Executive to review.
              No AI proposal is executed automatically.
            </p>
          </>}
        </section>
      </div>}

      {tab === "models" && <section style={card}>
        <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Governed Model Registry")}</h3>
        <p style={muted}>{ui(lang, "Illustrative model roles and versions; no model download or deployment.")}</p>
        <div style={{ overflowX: "auto" }}>
          <table className="aig18-table">
            <thead><tr><th>{ui(lang, "Model")}</th><th>{ui(lang, "Role")}</th><th>{ui(lang, "Version")}</th><th>{ui(lang, "Status")}</th></tr></thead>
            <tbody>
              {models.map(([name, role, version, status]) => (
                <tr key={name}>
                  <td><b>{ui(lang, String(name))}</b></td>
                  <td>{role}</td><td>{version}</td>
                  <td><span className="aig18-pill">{status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>}

      {tab === "guardrails" && <div className="aig18-grid">
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Guardrail Event Register")}</h3>
          {guardrails.map(([name, value, detail]) => (
            <div className="aig18-row" key={String(name)}>
              <div><b>{ui(lang, String(name))}</b><div style={muted}>{ui(lang, String(detail))}</div></div>
              <span className="aig18-pill">{digits(lang, value)}</span>
            </div>
          ))}
        </section>
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Safety Restrictions")}</h3>
          {[
            "No autonomous payroll approval",
            "No unsupervised beneficiary changes",
            "No unsupported answers without evidence",
            "No raw sensitive data in public reports",
            "Human review required before operational action",
          ].map((name) => (
            <div className="aig18-row" key={name}>
              <ShieldCheck size={16} color="#087a51"/>
              <span style={{ flex: 1 }}>{ui(lang, String(name))}</span>
            </div>
          ))}
          <div style={{ ...muted, padding: 13, marginTop: 15, background: "#f3f8f4", borderRadius: 10 }}>
            Guardrail counts are reference observations. No runtime
            prompt filtering is performed by this frontend panel.
          </div>
        </section>
      </div>}

      {tab === "audit" && <div className="aig18-grid">
        <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: 16, margin: 0 }}>{ui(lang, "Human Decision Audit")}</h3>
            <button style={button} onClick={() => exportCSV([
              ["Time", "Actor", "Run", "Action"],
              ...store.audit.map((a) => [a.time, a.actor, a.run, a.action]),
            ])}><Download size={14} style={{ verticalAlign: "middle" }} /> {ui(lang, "Export CSV")}</button>
          </div>
          {!store.audit.length && <p style={muted}>{ui(lang, "No interactive review decisions yet.")}</p>}
          {store.audit.map((a) => (
            <div key={a.id} className="aig18-row">
              <div>
                <b>{a.action}</b>
                <div style={muted}>{a.run} · {a.actor} · {new Date(a.time).toLocaleString((lang === "bn") ? "bn-BD" : "en-GB")}</div>
              </div>
              <CheckCircle2 size={16} color="#087a51"/>
            </div>
          ))}
        </section>
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Governance Controls")}</h3>
          <p style={muted}>
            Human decisions are stored in this browser only. No real
            AI agent, model, payment service or operational API is contacted.
          </p>
          <button style={button} disabled={roleId !== "admin"} onClick={reset}>
            <RotateCcw size={14} style={{ verticalAlign: "middle" }} /> Reset demo decisions
          </button>
        </section>
      </div>}

      <footer style={{ ...muted, textAlign: "center", marginTop: 20 }}>
        <LockKeyhole size={13} style={{ verticalAlign: "middle" }} />
        {" "}D18 · Fictional AI governance, human oversight and audit demonstration
      </footer>
    </div>
  );
}
