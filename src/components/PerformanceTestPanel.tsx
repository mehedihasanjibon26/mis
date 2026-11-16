
"use client";
import { ui, digits } from "../lib/ui-l10n";

import { useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2,
  Download, Gauge, Play, RotateCcw,
  ShieldCheck, Users, Zap,
} from "lucide-react";

type Tab = "overview" | "scenarios" | "thresholds" | "history";
type Result = "passed" | "failed" | "not-run";
type Scenario = {
  id: string;
  name: string;
  target: string;
  result: string;
  status: Result;
};
type Event = {
  id: string;
  at: string;
  actor: string;
  action: string;
};
type State = {
  scenarios: Scenario[];
  apiP95: number;
  pageP95: number;
  errorRate: number;
  throughput: number;
  audit: Event[];
};

const KEY = "mcbp-d22-performance-v1";

const baselineScenarios: Scenario[] = [
  {
    id: "LT-01",
    name: "Sustained load",
    target: "10,000 users for 60 minutes",
    result: "Pass · reference report",
    status: "passed",
  },
  {
    id: "LT-02",
    name: "Application deadline surge",
    target: "Peak submission traffic",
    result: "Pass · reference report",
    status: "passed",
  },
  {
    id: "LT-03",
    name: "Payroll concurrency",
    target: "1M records with 3,000 users",
    result: "Pass · reference report",
    status: "passed",
  },
  {
    id: "LT-04",
    name: "Large payroll reporting",
    target: "2.5M-record report",
    result: "Pass · reference report",
    status: "passed",
  },
  {
    id: "LT-05",
    name: "Endurance",
    target: "72-hour continuous workload",
    result: "Pass · reference report",
    status: "passed",
  },
  {
    id: "LT-06",
    name: "Stress to failure",
    target: "Progressive overload and recovery",
    result: "Pass · reference report",
    status: "passed",
  },
  {
    id: "LT-07",
    name: "Mobile sync storm",
    target: "Simultaneous field synchronisation",
    result: "Pass · reference report",
    status: "passed",
  },
  {
    id: "LT-08",
    name: "Database failover under load",
    target: "Service continuity during DB failover",
    result: "Pass · reference report",
    status: "passed",
  },
];

function initialState(): State {
  return {
    scenarios: baselineScenarios,
    apiP95: 742,
    pageP95: 2.4,
    errorRate: 0.04,
    throughput: 20640,
    audit: [],
  };
}

function restoreState(): State {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const item = JSON.parse(raw) as State;
      if (
        Array.isArray(item.scenarios) &&
        Array.isArray(item.audit) &&
        typeof item.apiP95 === "number" &&
        typeof item.errorRate === "number"
      ) return item;
    }
  } catch {
    // Fall back to the reference scenario.
  }
  return initialState();
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #dfeae2",
  borderRadius: 16,
  padding: 19,
};

const button: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #d6e5db",
  color: "#15523c",
  borderRadius: 9,
  padding: "10px 13px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const primary: React.CSSProperties = {
  ...button,
  background: "#006a4e",
  color: "#fff",
  borderColor: "#006a4e",
};

const muted: React.CSSProperties = {
  fontSize: 11,
  color: "#718579",
  lineHeight: 1.7,
};


function statusStyle(value: string): React.CSSProperties {
  const pass = value === "passed" || value === "Pass";
  return {
    background: pass ? "#e6f5eb" : "#fff0e4",
    color: pass ? "#08734e" : "#9a5530",
    borderRadius: 25,
    padding: "6px 9px",
    fontSize: 10,
    fontWeight: 800,
    display: "inline-block",
  };
}

function MetricBar({
  label, value, maximum, unit, lang,
}: {
  label: string;
  value: number;
  maximum: number;
  unit: string;
  lang: "en" | "bn";
}) {
  const pct = Math.min(100, value / maximum * 100);
  return (
    <div style={{ margin: "17px 0" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 12, gap: 8,
      }}>
        <span>{ui(lang, label)}</span>
        <b>{value.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")} {unit}</b>
      </div>
      <div style={{
        height: 9, borderRadius: 12,
        background: "#e6eee7", marginTop: 9, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: value <= maximum ? "#0b875c" : "#ce7748",
          borderRadius: 12,
        }}/>
      </div>
      <div style={muted}>Reference budget: {maximum.toLocaleString(lang === "bn" ? "bn-BD" : "en-US")} {unit}</div>
    </div>
  );
}

export default function PerformanceTestPanel({
  lang = "en", roleId = "admin",
}: {
  lang?: "en" | "bn";
  roleId?: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<State>(restoreState);
  const [selected, setSelected] = useState("LT-01");
  const [preset, setPreset] = useState<"pass" | "degraded">("pass");
  const [message, setMessage] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const comma = (n: number) => n.toLocaleString(lang === "bn" ? "bn-BD" : "en-US");
  const canRun = roleId === "admin";
  const selectedScenario = data.scenarios.find((s) => s.id === selected);
  const passed = data.scenarios.filter((s) => s.status === "passed").length;

  const meetsGates =
    data.apiP95 <= 2000 &&
    data.pageP95 <= 3 &&
    data.throughput >= 10000;

  function commit(changes: Partial<State>, action: string) {
    const next: State = {
      ...data, ...changes,
      audit: [{
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        actor: roleId,
        action,
      }, ...data.audit],
    };
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage(action);
  }

  function simulate() {
    if (!canRun || !selectedScenario) return;

    const degraded = preset === "degraded";
    const apiP95 = degraded ? 2350 : 742;
    const pageP95 = degraded ? 3.5 : 2.4;
    const errorRate = degraded ? 0.8 : 0.04;
    const throughput = degraded ? 9200 : 20640;

    commit({
      apiP95, pageP95, errorRate, throughput,
      scenarios: data.scenarios.map((s) =>
        s.id === selected ? {
          ...s,
          status: degraded ? "failed" as const : "passed" as const,
          result: degraded
            ? "Failed · simulated degraded run"
            : "Passed · simulated reference run",
        } : s
      ),
    }, `${selectedScenario.name}: ${degraded ? "degraded" : "reference"} simulation completed`);
  }

  function reset() {
    if (!canRun) return;
    const next = initialState();
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage("Reference load-test report restored.");
  }

  function printReport() {
    window.print();
  }

  return (
    <div className="perf22">
      <style>{`
        .perf22{font-family:Arial,Helvetica,sans-serif;color:#193e2d;min-width:0}
        .perf22-hero{border-radius:18px;padding:26px;
          background:linear-gradient(115deg,#053d31,#007556);color:#fff}
        .perf22-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:15px 0}
        .perf22-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
        .perf22-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:15px}
        .perf22-row{border-bottom:1px solid #e9f0ea;padding:12px 0;display:flex;
          justify-content:space-between;align-items:center;gap:10px;font-size:12px}
        .perf22-table{width:100%;border-collapse:collapse;font-size:12px}
        .perf22-table th,.perf22-table td{padding:12px 9px;border-bottom:1px solid #e8eee9;text-align:left}
        .perf22-table th{color:#718677;font-size:11px}
        .perf22-option{width:100%;padding:14px;border-radius:11px;border:1px solid #dce9df;
          background:#fff;text-align:left;cursor:pointer;margin-bottom:8px}
        .perf22-print{display:none}
        @media(max-width:950px){.perf22-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.perf22-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media print{
          body *{visibility:hidden!important}
          .perf22,.perf22 *{visibility:visible!important}
          .perf22{position:absolute;left:0;top:0;width:100%;color:#111;background:#fff}
          .perf22-tabs,.perf22-interactive{display:none!important}
          .perf22-print{display:block!important}
          .perf22-hero{background:#fff!important;color:#111!important;border:1px solid #aaa}
          .perf22-hero *{color:#111!important}
          .perf22-kpis{grid-template-columns:repeat(4,1fr)}
          .perf22-grid{grid-template-columns:1fr}
          .perf22 section{break-inside:avoid}
        }
      `}</style>

      <section className="perf22-hero">
        <div style={{
          fontSize: 11, color: "#bce8d4", letterSpacing: 1.4,
        }}>PLATFORM OPERATIONS · D22 · LT-014</div>
        <h2 style={{
          fontSize: "clamp(24px,3vw,34px)", margin: "10px 0",
        }}>
          {t("Load & Performance Test Report", "লোড ও পারফরম্যান্স টেস্ট রিপোর্ট")}
        </h2>
        <p style={{
          fontSize: 13, color: "#d3ede0", lineHeight: 1.7,
        }}>
          {t(
            "Explore load-test evidence, service thresholds, scenario outcomes and simulated performance regressions.",
            "লোড টেস্টের ফলাফল, পারফরম্যান্স সীমা এবং সিমুলেটেড সমস্যা পরীক্ষা করুন।"
          )}
        </p>
        <div style={{ color: "#bde8d3", fontSize: 10 }}>
          ILLUSTRATIVE TEST RESULTS · NOT ACTUAL PERFORMANCE EVIDENCE
        </div>
      </section>

      <div className="perf22-kpis">
        {([
          ["Virtual users", "10,000", Users, "RFP minimum 5,000"],
          ["API calls / min", comma(data.throughput), Zap, "Minimum 10,000"],
          ["API p95 latency", `${comma(data.apiP95)} ms`, Gauge, "Budget 2,000 ms"],
          ["Error rate", `${data.errorRate}%`, Activity, "Reference 0.04%"],
        ] as const).map(([label, value, Icon, detail]) => (
          <section key={label} style={card}>
            <div style={{
              display: "flex", justifyContent: "space-between",
            }}>
              <span style={muted}>{ui(lang, label)}</span>
              <Icon size={18} color="#007755"/>
            </div>
            <div style={{
              fontSize: 26, fontWeight: 850, margin: "12px 0 5px",
            }}>{digits(lang, value)}</div>
            <div style={muted}>{ui(lang, detail)}</div>
          </section>
        ))}
      </div>

      <div className="perf22-interactive">
        <div className="perf22-tabs">
          {([
            ["overview", "Performance Overview", "পারফরম্যান্স"],
            ["scenarios", "Test Scenarios", "টেস্ট সিনারিও"],
            ["thresholds", "Threshold Analysis", "সীমা যাচাই"],
            ["history", "History & Export", "ইতিহাস ও এক্সপোর্ট"],
          ] as const).map(([id, en, bn]) => (
            <button key={id} style={tab === id ? primary : button}
              onClick={() => setTab(id)}>{t(en, bn)}</button>
          ))}
        </div>
        {message && <div style={{
          ...card, background: "#eaf7ee", marginBottom: 14, fontSize: 12,
        }}>
          {message}
          <button style={{
            ...button, float: "right", padding: "3px 8px",
          }} onClick={() => setMessage("")}>×</button>
        </div>}
      </div>

      {tab === "overview" && <div className="perf22-grid">
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Performance Benchmarks")}</h3>
          <MetricBar lang={lang} label="API response p95" value={data.apiP95}
            maximum={2000} unit="ms"/>
          <MetricBar lang={lang} label="Page load p95" value={data.pageP95}
            maximum={3} unit="s"/>
          <div style={{
            background: meetsGates ? "#eaf7ef" : "#fff0e6",
            padding: 14, borderRadius: 12, marginTop: 20,
          }}>
            {meetsGates
              ? <CheckCircle2 size={18} color="#087850"/>
              : <AlertTriangle size={18} color="#ae6033"/>}
            <b style={{ fontSize: 12, marginLeft: 8 }}>
              {meetsGates ? "Reference performance gates met" : "Simulated threshold breach"}
            </b>
            <p style={{ ...muted, marginBottom: 0 }}>
              Threshold results are calculated from the currently displayed
              fictional metrics, not a live test execution.
            </p>
          </div>
        </section>
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Test Report Summary")}</h3>
          {[
            ["Report ID", "LT-014"],
            ["Virtual users", "10,000"],
            ["Page p95", `${data.pageP95} seconds`],
            ["API requests/min", comma(data.throughput)],
            ["Scenario outcomes", `${passed} / 8 passed`],
            ["Data source", "Illustrative / synthetic"],
          ].map(([label, value]) => (
            <div key={label} className="perf22-row">
              <span>{ui(lang, label)}</span><b>{digits(lang, value)}</b>
            </div>
          ))}
          <button style={{ ...primary, marginTop: 15 }}
            onClick={() => setTab("scenarios")}>
            Explore test scenarios
          </button>
        </section>
      </div>}

      {tab === "scenarios" && <div className="perf22-grid">
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Scenario Results")}</h3>
          <p style={muted}>
            All eight scenarios pass in the original reference report.
            Results may change in this browser's simulation.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {data.scenarios.map((s) => (
              <button key={s.id} className="perf22-option"
                onClick={() => setSelected(s.id)}
                style={{
                  borderColor: selected === s.id ? "#087c54" : "#dce9df",
                  background: selected === s.id ? "#eff8f2" : "#fff",
                }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", gap: 8,
                }}>
                  <b style={{ fontSize: 12 }}>{s.name}</b>
                  <span style={statusStyle(s.status)}>{s.status}</span>
                </div>
                <div style={{ ...muted, marginTop: 5 }}>{s.id} · {s.target}</div>
              </button>
            ))}
          </div>
        </section>
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Scenario Inspector")}</h3>
          {selectedScenario && <>
            <b>{selectedScenario.name}</b>
            {[
              ["ID", selectedScenario.id],
              ["Target", selectedScenario.target],
              ["Result", selectedScenario.result],
              ["Status", selectedScenario.status],
            ].map(([label, value]) => (
              <div key={label} className="perf22-row">
                <span>{ui(lang, label)}</span><b style={{ textAlign: "right" }}>{digits(lang, value)}</b>
              </div>
            ))}
            <div className="perf22-interactive">
              <label style={{ ...muted, display: "block", marginTop: 17 }}>
                Demo result scenario
                <select value={preset}
                  onChange={(e) => setPreset(e.target.value as "pass" | "degraded")}
                  style={{ ...button, width: "100%", display: "block", marginTop: 7 }}>
                  <option value="pass">{ui(lang, "Reference pass")}</option>
                  <option value="degraded">{ui(lang, "Simulated degradation")}</option>
                </select>
              </label>
              <button style={{ ...primary, marginTop: 14 }}
                disabled={!canRun} onClick={simulate}>
                <Play size={14} style={{ verticalAlign: "middle" }}/>
                {" "}Simulate scenario result
              </button>
              <p style={{ ...muted, marginTop: 12 }}>
                This does not generate traffic, benchmark a server,
                or execute JMeter or k6.
              </p>
            </div>
          </>}
        </section>
      </div>}

      {tab === "thresholds" && <div className="perf22-grid">
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Acceptance Thresholds")}</h3>
          {[
            ["Concurrent users", "≥ 5,000", "10,000", true],
            ["API calls per minute", "≥ 10,000", comma(data.throughput), data.throughput >= 10000],
            ["API p95", "≤ 2,000 ms", `${data.apiP95} ms`, data.apiP95 <= 2000],
            ["Page p95", "≤ 3 s", `${data.pageP95} s`, data.pageP95 <= 3],
          ].map(([name, target, actual, pass]) => (
            <div key={String(name)} className="perf22-row">
              <div>
                <b>{name as string}</b>
                <div style={muted}>Target: {target as string} · Result: {actual as string}</div>
              </div>
              <span style={statusStyle(pass ? "passed" : "failed")}>
                {pass ? "Pass" : "Fail"}
              </span>
            </div>
          ))}
        </section>
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Test Environment & Caveats")}</h3>
          {[
            "Data is illustrative; no live traffic is generated",
            "Reference load uses synthetic records",
            "Production tests required before Go-Live",
            "Final testing planned on BCC NDC hardware",
            "Actual measured evidence must replace reference figures",
          ].map((item) => (
            <div key={item} className="perf22-row">
              <ShieldCheck size={16} color="#087a52"/>
              <span style={{ flex: 1 }}>{item}</span>
            </div>
          ))}
        </section>
      </div>}

      {tab === "history" && <div className="perf22-grid">
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Simulation Audit Trail")}</h3>
          {!data.audit.length && <p style={muted}>
            No local scenario actions recorded yet.
          </p>}
          {data.audit.map((e) => (
            <div key={e.id} className="perf22-row">
              <div>
                <b>{e.action}</b>
                <div style={muted}>
                  {e.actor} · {new Date(e.at).toLocaleString()}
                </div>
              </div>
              <CheckCircle2 size={16} color="#087954"/>
            </div>
          ))}
        </section>
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Report & Demo Controls")}</h3>
          <p style={muted}>
            Print uses the browser's PDF destination.
            Select "Save as PDF" in the print dialogue.
          </p>
          <div className="perf22-interactive" style={{
            display: "flex", flexWrap: "wrap", gap: 9,
          }}>
            <button style={primary} onClick={printReport}>
              <Download size={14} style={{ verticalAlign: "middle" }}/>
              {" "}Print / Save PDF
            </button>
            <button style={button} disabled={!canRun} onClick={reset}>
              <RotateCcw size={14} style={{ verticalAlign: "middle" }}/>
              {" "}Reset demo
            </button>
          </div>
        </section>
      </div>}

      <div className="perf22-print" style={{ marginTop: 20 }}>
        <h3>MCBP-MIS · LT-014 Performance Report</h3>
        <p>
          Synthetic reference data only. Virtual users: 10,000.
          API requests/min: {comma(data.throughput)}.
          API p95: {data.apiP95} ms.
          Page p95: {data.pageP95} seconds.
          Error rate: {data.errorRate}%.
        </p>
        <table className="perf22-table">
          <thead>
            <tr><th>{ui(lang, "Scenario")}</th><th>{ui(lang, "Target")}</th><th>{ui(lang, "Result")}</th></tr>
          </thead>
          <tbody>
            {data.scenarios.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.target}</td><td>{s.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={muted}>
          Production load testing must be carried out on BCC NDC
          infrastructure using synthetic data before Go-Live.
        </p>
      </div>

      <footer style={{ ...muted, textAlign: "center", marginTop: 21 }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }}/>
        {" "}D22 · Demo-only load and performance evidence · No actual test executed
      </footer>
    </div>
  );
}
