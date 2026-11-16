
"use client";
import { ui, digits } from "../lib/ui-l10n";

import { useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock3,
  Download, Pause, Play, RotateCcw, ShieldCheck,
  Square, Users, Wallet, Zap,
} from "lucide-react";

type Phase = "running" | "paused" | "review" | "approved" | "aborted";
type Tab = "overview" | "partitions" | "validation" | "audit";
type Entry = { id: string; time: string; actor: string; action: string };
type Batch = {
  phase: Phase;
  processed: number;
  maker: string;
  checker: string;
  rejected: boolean;
  logs: Entry[];
};

const TOTAL = 1895010;
const BASE = 1777870;
const KEY = "mcbp-d17-payroll";

const divisions = [
  { name: "Dhaka", count: 459120, status: "Done" },
  { name: "Chattogram", count: 388400, status: "Done" },
  { name: "Rajshahi", count: 254330, status: "Done" },
  { name: "Khulna", count: 209870, status: "Done" },
  { name: "Rangpur", count: 198410, status: "Running" },
  { name: "Barishal", count: 103960, status: "Running" },
  { name: "Mymensingh", count: 102300, status: "Running" },
  { name: "Sylhet", count: 61480, status: "Running" },
];

const validations = [
  { name: "Duplicate NID across schemes", count: 112, severity: "Review", rule: "Cross-scheme duplicate detection" },
  { name: "Account / wallet failed pre-validation", count: 6430, severity: "Review", rule: "Financial account format/status" },
  { name: "Cycle count above 36", count: 0, severity: "Passed", rule: "Maximum benefit-cycle rule" },
  { name: "Amount outside rule range", count: 0, severity: "Passed", rule: "Approved programme amount" },
];

function initial(): Batch {
  return {
    phase: "running",
    processed: BASE,
    maker: "",
    checker: "",
    rejected: false,
    logs: [],
  };
}
function stored(): Batch {
  if (typeof window === "undefined") return initial();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const value = JSON.parse(raw) as Batch;
      if (value && Array.isArray(value.logs) && typeof value.processed === "number") {
        return value;
      }
    }
  } catch {
    // Use fictional reference baseline.
  }
  return initial();
}

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #dfeae3",
  borderRadius: 16, padding: 19,
};
const btn: React.CSSProperties = {
  border: "1px solid #d8e5dc", background: "#fff",
  color: "#17523d", padding: "10px 13px",
  borderRadius: 9, fontWeight: 700, fontSize: 12,
  cursor: "pointer",
};
const primary: React.CSSProperties = {
  ...btn, background: "#006a4e", borderColor: "#006a4e", color: "#fff",
};
const muted: React.CSSProperties = {
  color: "#74877a", fontSize: 11, lineHeight: 1.7,
};

function download(batch: Batch) {
  const rows = [
    ["Time", "Actor", "Action"],
    ...batch.logs.map((x) => [x.time, x.actor, x.action]),
  ];
  const csv = rows.map((row) =>
    row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "MCBP-D17-Payroll-Audit.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function PayrollMonitorPanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: "en" | "bn";
  roleId?: string;
}) {
  const [batch, setBatch] = useState<Batch>(stored);
  const [tab, setTab] = useState<Tab>("overview");
  const [message, setMessage] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const count = (n: number) => n.toLocaleString(lang === "bn" ? "bn-BD" : "en-US");
  const maker = roleId === "admin";
  const checker = roleId === "executive";
  const pct = (batch.processed / TOTAL) * 100;
  const remaining = TOTAL - batch.processed;

  function update(
    changes: Partial<Batch>,
    action: string
  ) {
    const item: Entry = {
      id: `PAY-${crypto.randomUUID()}`,
      time: new Date().toISOString(),
      actor: roleId,
      action,
    };
    const next = {
      ...batch,
      ...changes,
      logs: [item, ...batch.logs],
    };
    setBatch(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage(action);
  }

  function tick() {
    if (!maker || batch.phase !== "running") return;
    const next = Math.min(TOTAL, batch.processed + 25000);
    update(
      { processed: next, phase: next === TOTAL ? "paused" : "running" },
      `Simulated processing advanced to ${count(next)} records`
    );
  }

  function submit() {
    if (!maker || batch.phase !== "paused" || batch.processed !== TOTAL) {
      setMessage("Complete processing and pause the batch before maker submission.");
      return;
    }
    update(
      { phase: "review", maker: roleId, checker: "", rejected: false },
      "Payroll batch submitted for independent review"
    );
  }

  function approve() {
    if (!checker || batch.phase !== "review" || batch.maker === roleId) {
      setMessage("Independent executive checker approval required.");
      return;
    }
    update(
      { phase: "approved", checker: roleId },
      "Fictional payroll cycle approved — no payments sent"
    );
  }

  function abort() {
    if (!maker || !["running", "paused", "review"].includes(batch.phase)) return;
    update(
      { phase: "aborted", processed: BASE, checker: "" },
      "Simulated abort and rollback to reference checkpoint"
    );
  }

  function reset() {
    if (!maker) return;
    const next = initial();
    setBatch(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage("Fictional November payroll scenario restored.");
  }

  return (
    <div className="pay17">
      <style>{`
        .pay17{font-family:Arial,Helvetica,sans-serif;color:#183f2e;min-width:0}
        .pay17-hero{padding:26px;background:linear-gradient(112deg,#053e32,#007653);
          border-radius:18px;color:#fff;margin-bottom:15px}
        .pay17-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:15px}
        .pay17-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:15px}
        .pay17-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
        .pay17-table{width:100%;border-collapse:collapse;font-size:12px}
        .pay17-table th{text-align:left;color:#718677;font-size:11px}
        .pay17-table td,.pay17-table th{padding:12px 8px;border-bottom:1px solid #e8eee9}
        .pay17-progress{height:12px;background:#e1ede5;border-radius:15px;overflow:hidden;margin:14px 0 8px}
        .pay17-progress>div{height:100%;background:linear-gradient(90deg,#20aa72,#007652);transition:width .25s}
        .pay17-pill{padding:6px 9px;border-radius:30px;font-weight:800;font-size:10px;background:#e5f5eb;color:#08704d}
        .pay17-row{padding:12px 0;display:flex;justify-content:space-between;align-items:center;gap:12px;
          border-bottom:1px solid #eaf0eb;font-size:12px}
        @media(max-width:980px){.pay17-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.pay17-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="pay17-hero">
        <div style={{ fontSize: 11, color: "#b9e6d1", letterSpacing: 1.4 }}>
          PLATFORM OPERATIONS · D17
        </div>
        <h2 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "11px 0" }}>
          {t("Payroll Batch Monitor", "পে-রোল ব্যাচ মনিটর")}
        </h2>
        <p style={{ fontSize: 13, color: "#d3ebdf", lineHeight: 1.7 }}>
          {t(
            "Observe high-volume payroll processing, review validation exceptions and demonstrate controlled maker–checker decisions.",
            "বৃহৎ পে-রোল প্রসেসিং, ভ্যালিডেশন সমস্যা এবং মেকার-চেকার অনুমোদন দেখুন।"
          )}
        </p>
        <div style={{ fontSize: 10, color: "#b9e6d1" }}>
          NOVEMBER 2026 REFERENCE SCENARIO · NO REAL PAYMENTS
        </div>
      </section>

      <div className="pay17-kpis">
        {([
          ["Eligible", count(TOTAL), Users, "November 2026"],
          ["Processed", `${pct.toFixed(1)}%`, CheckCircle2, `${count(batch.processed)} records`],
          ["Throughput", "574/s", Zap, "32 reference workers"],
          ["Online p95", "428ms", Activity, "412ms reference baseline"],
        ] as const).map(([name, value, Icon, detail]) => (
          <section style={card} key={name}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={muted}>{ui(lang, name)}</span>
              <Icon size={18} color="#007653" />
            </div>
            <div style={{ fontSize: 26, fontWeight: 850, margin: "12px 0 5px" }}>
              {value}
            </div>
            <div style={muted}>{ui(lang, detail)}</div>
          </section>
        ))}
      </div>

      <div className="pay17-tabs">
        {([
          ["overview", "Batch Control", "ব্যাচ কন্ট্রোল"],
          ["partitions", "Division Partitions", "বিভাগ অনুযায়ী"],
          ["validation", "Validation & Exceptions", "যাচাই ও সমস্যা"],
          ["audit", "Approval & Audit", "অনুমোদন ও অডিট"],
        ] as const).map(([key, en, bn]) => (
          <button key={key} style={tab === key ? primary : btn}
            onClick={() => setTab(key)}>{t(en, bn)}</button>
        ))}
      </div>

      {message && (
        <div style={{ ...card, background: "#e8f6ee", marginBottom: 14, fontSize: 12 }}>
          {message}
          <button style={{ ...btn, float: "right", padding: "2px 8px" }}
            onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {tab === "overview" && (
        <div className="pay17-grid">
          <section style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 17, margin: "0 0 4px" }}>{ui(lang, "November 2026 Payroll Cycle")}</h3>
                <div style={muted}>Cycle: PAY-2026-11 · Reference batch</div>
              </div>
              <span className="pay17-pill">{batch.phase.toUpperCase()}</span>
            </div>

            <div style={{ fontSize: 33, fontWeight: 850, marginTop: 22 }}>
              {pct.toFixed(1)}%
            </div>
            <div className="pay17-progress">
              <div style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", ...muted }}>
              <span>{count(batch.processed)} processed</span>
              <span>{count(remaining)} remaining</span>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 10, marginTop: 20,
            }}>
              {[
                ["Elapsed reference", "51m 38s"],
                ["Estimated total", "55 minutes"],
                ["Active workers", "32 · reference"],
                ["Processing state", batch.phase],
              ].map(([name, value]) => (
                <div key={name} style={{ padding: 13, background: "#f2f8f4", borderRadius: 10 }}>
                  <div style={muted}>{ui(lang, name)}</div>
                  <b style={{ fontSize: 13 }}>{digits(lang, value)}</b>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 19 }}>
              <button style={primary} disabled={!maker || batch.phase !== "running"}
                onClick={tick}>
                <Play size={14} style={{ verticalAlign: "middle" }} /> Process next batch
              </button>
              <button style={btn} disabled={!maker || batch.phase !== "running"}
                onClick={() => update({ phase: "paused" }, "Payroll processing paused")}>
                <Pause size={14} style={{ verticalAlign: "middle" }} /> Pause
              </button>
              <button style={btn} disabled={!maker || batch.phase !== "paused" || batch.processed === TOTAL}
                onClick={() => update({ phase: "running" }, "Processing resumed")}>
                Resume
              </button>
              <button style={btn}
                disabled={!maker || !["running", "paused", "review"].includes(batch.phase)}
                onClick={abort}>
                <Square size={14} style={{ verticalAlign: "middle" }} /> Abort & rollback
              </button>
            </div>
            <p style={{ ...muted, marginTop: 16 }}>
              Each Process action advances 25,000 fictional records.
              No payment instructions or real payroll files are created.
            </p>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 13px" }}>
              <Wallet size={18} style={{ verticalAlign: "middle" }} />
              {" "}Control & Approval
            </h3>
            {[
              ["Maker", batch.maker || "System Administrator"],
              ["Checker", batch.checker || "Programme Executive"],
              ["Cycle state", batch.phase],
              ["Validation exceptions", "6,542 · review flags"],
              ["Disbursement", "Simulation only"],
            ].map(([label, value]) => (
              <div className="pay17-row" key={label}>
                <span>{ui(lang, label)}</span><b>{digits(lang, value)}</b>
              </div>
            ))}

            <button style={{ ...primary, marginTop: 17 }}
              disabled={!maker || batch.phase !== "paused" || batch.processed !== TOTAL}
              onClick={submit}>
              Submit for checker review
            </button>
            <button style={{ ...btn, marginTop: 9, marginLeft: 8 }}
              disabled={!checker || batch.phase !== "review"}
              onClick={approve}>
              <ShieldCheck size={14} style={{ verticalAlign: "middle" }} />
              {" "}Checker approve
            </button>
            <p style={{ ...muted, marginTop: 13 }}>
              Administrator prepares the batch; Programme Executive approves
              it independently. Approval never triggers a real payment.
            </p>
          </section>
        </div>
      )}

      {tab === "partitions" && (
        <section style={card}>
          <h3 style={{ fontSize: 16, margin: "0 0 6px" }}>{ui(lang, "Division-wise Processing Partitions")}</h3>
          <p style={muted}>
            Original division figures and statuses are preserved as reference
            observations; simulated batch progress is tracked separately.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="pay17-table">
              <thead>
                <tr><th>{ui(lang, "Division")}</th><th>{ui(lang, "Reference records")}</th><th>{ui(lang, "Reference state")}</th><th>{ui(lang, "Operations")}</th></tr>
              </thead>
              <tbody>
                {divisions.map((d) => (
                  <tr key={d.name}>
                    <td><b>{d.name}</b></td>
                    <td>{count(d.count)}</td>
                    <td><span className="pay17-pill">{d.status}</span></td>
                    <td>{ui(lang, "Division monitoring · simulated")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "validation" && (
        <div className="pay17-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 13px" }}>
              <AlertTriangle size={18} style={{ verticalAlign: "middle" }} />
              {" "}Pre-disbursement Validation
            </h3>
            {validations.map((v) => (
              <div className="pay17-row" key={v.name}>
                <div>
                  <b>{v.name}</b>
                  <div style={muted}>{v.rule}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b>{count(v.count)}</b>
                  <div style={muted}>{v.severity}</div>
                </div>
              </div>
            ))}
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "Exception Handling")}</h3>
            <div style={{
              padding: 16, background: "#fff4e8",
              color: "#866018", borderRadius: 12,
            }}>
              <b style={{ fontSize: 13 }}>6,542 flagged records</b>
              <p style={{ fontSize: 12, lineHeight: 1.7 }}>
                Duplicate identity and account/wallet exceptions require
                investigation. They are not automatically marked eligible
                or cleared by this demonstration.
              </p>
            </div>
            <p style={{ ...muted, marginTop: 15 }}>
              Reference checks showing zero out-of-range amounts and
              zero benefit-cycle breaches are independent validations.
              Counts do not represent actual beneficiary exceptions.
            </p>
          </section>
        </div>
      )}

      {tab === "audit" && (
        <div className="pay17-grid">
          <section style={card}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", gap: 8, flexWrap: "wrap",
            }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>{ui(lang, "Batch Activity & Decisions")}</h3>
              <button style={btn} onClick={() => download(batch)}>
                <Download size={14} style={{ verticalAlign: "middle" }} />
                {" "}Export CSV
              </button>
            </div>
            {!batch.logs.length && <p style={muted}>{ui(lang, "No interactive actions recorded yet.")}</p>}
            {batch.logs.map((event) => (
              <div className="pay17-row" key={event.id}>
                <div>
                  <b>{event.action}</b>
                  <div style={muted}>
                    {event.actor} · {new Date(event.time).toLocaleString()}
                  </div>
                </div>
                <CheckCircle2 size={17} color="#078356" />
              </div>
            ))}
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>{ui(lang, "Demo Reset")}</h3>
            <p style={muted}>
              Restore reference cycle counts and processing state.
              Reset affects only this browser's D17 demonstration.
            </p>
            <button style={btn} disabled={!maker} onClick={reset}>
              <RotateCcw size={14} style={{ verticalAlign: "middle" }} />
              {" "}Reset fictional payroll
            </button>
            <div style={{ ...muted, padding: 14, background: "#f0f7f2", marginTop: 16, borderRadius: 10 }}>
              Logs are browser-local and do not constitute a secure,
              tamper-resistant government audit trail.
            </div>
          </section>
        </div>
      )}

      <footer style={{ ...muted, textAlign: "center", marginTop: 22 }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
        {" "}D17 · Reference payroll data and simulated processing only
      </footer>
    </div>
  );
}
