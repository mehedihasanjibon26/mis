
"use client";
import { ui } from "../lib/ui-l10n";

import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2,
  Clock3, Download, GitBranch,
  LockKeyhole, Play, RotateCcw, ShieldCheck,
} from "lucide-react";

type Lang = "en" | "bn";
type Gate = "pass" | "fail";
type PipelineStatus = "running" | "failed" | "passed" | "approved" | "deployed";
type Run = {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  startedBy: string;
  status: PipelineStatus;
  checks: { name: string; result: Gate; detail: string }[];
  checker?: string;
  log: string[];
};

const initialRuns: Run[] = [
  {
    id: "PIPE-001",
    name: "MCBP Core API",
    version: "1.8.0-rc2",
    createdAt: "2026-11-16T04:30:00.000Z",
    startedBy: "Demo CI runner",
    status: "passed",
    checks: [
      { name: "Unit tests", result: "pass", detail: "1,842 passed · reference result" },
      { name: "Coverage gate", result: "pass", detail: "86% coverage · threshold 80%" },
      { name: "Security scan", result: "pass", detail: "No blocking sample findings" },
      { name: "Build validation", result: "pass", detail: "Build completed (reference)" },
      { name: "Regression tests", result: "pass", detail: "Sample regression suite passed" },
    ],
    log: [
      "Reference pipeline completed",
      "Quality gates passed",
      "Awaiting independent release approval",
    ],
  },
];

const steps = [
  "Source checkout",
  "Compile & lint",
  "Unit tests",
  "Security scan",
  "Coverage & regression",
  "Approval gate",
  "Deployment",
];

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #dfeae3",
  borderRadius: 17,
  padding: 19,
  boxShadow: "0 5px 20px rgba(12,61,40,.035)",
};

const btn: React.CSSProperties = {
  background: "#fff",
  color: "#14533c",
  border: "1px solid #d6e5da",
  borderRadius: 9,
  padding: "10px 13px",
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
};

const primary: React.CSSProperties = {
  ...btn,
  background: "#006a4e",
  color: "#fff",
  borderColor: "#006a4e",
};

const muted: React.CSSProperties = {
  color: "#728577",
  fontSize: 11,
  lineHeight: 1.7,
};

function statusColor(status: string): React.CSSProperties {
  if (["pass", "passed", "approved", "deployed"].includes(status)) {
    return { background: "#e5f5eb", color: "#08754f" };
  }
  if (["fail", "failed"].includes(status)) {
    return { background: "#fee8e8", color: "#af3434" };
  }
  return { background: "#fff0d9", color: "#96621b" };
}

function downloadRuns(runs: Run[]) {
  const rows = [
    ["ID", "Pipeline", "Version", "Status", "Started by", "Checker"],
    ...runs.map((r) => [
      r.id, r.name, r.version, r.status,
      r.startedBy, r.checker || "",
    ]),
  ];
  const csv = rows.map((row) =>
    row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(new Blob(
    ["\uFEFF", csv], { type: "text/csv;charset=utf-8" }
  ));
  const a = document.createElement("a");
  a.href = url;
  a.download = "MCBP-CICD-Demo.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function CICDPanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: Lang;
  roleId?: string;
}) {
  const [tab, setTab] = useState<"pipelines" | "gates" | "releases" | "audit">("pipelines");
  const [runs, setRuns] = useState<Run[]>(initialRuns);
  const [selected, setSelected] = useState("PIPE-001");
  const [scenario, setScenario] = useState<"pass" | "fail">("pass");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const canRun = roleId === "admin";
  const canApprove = roleId === "executive";
  const current = runs.find((r) => r.id === selected);
  const failed = runs.filter((r) => r.status === "failed").length;
  const passed = runs.filter((r) =>
    ["passed", "approved", "deployed"].includes(r.status)
  ).length;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mcbp-cicd-runs");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const restored = parsed as Run[];
          setRuns(restored);
          if (restored.length) setSelected(restored[0].id);
        }
      }
    } catch {
      // Use fictional baseline.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("mcbp-cicd-runs", JSON.stringify(runs));
  }, [ready, runs]);

  function startRun() {
    if (!canRun) {
      setNotice("System Administrator role required to run a pipeline.");
      return;
    }

    const fail = scenario === "fail";
    const checks: Run["checks"] = [
      { name: "Build & lint", result: "pass", detail: "Simulated compilation successful" },
      { name: "Unit tests", result: "pass", detail: "1,842 fictional checks passed" },
      {
        name: "Coverage threshold",
        result: fail ? "fail" : "pass",
        detail: fail
          ? "74% coverage · required 80% · BLOCKED"
          : "86% coverage · required 80%",
      },
      {
        name: "Security scan",
        result: fail ? "fail" : "pass",
        detail: fail
          ? "1 blocking sample vulnerability"
          : "No blocking sample findings",
      },
      { name: "Regression suite", result: "pass", detail: "Demo regression checks passed" },
    ];

    const id = `PIPE-${Date.now()}`;
    const item: Run = {
      id,
      name: "MCBP Core API",
      version: "1.8.0-rc2",
      createdAt: new Date().toISOString(),
      startedBy: "System Administrator",
      status: fail ? "failed" : "passed",
      checks,
      log: [
        "Simulated pipeline triggered",
        "Build and test stages completed",
        fail
          ? "Quality gate FAILED — deployment prevented"
          : "All demo gates passed — awaiting independent checker",
      ],
    };

    setRuns((items) => [item, ...items]);
    setSelected(id);
    setTab("gates");
    setNotice(fail
      ? "Quality gate failed. Deployment blocked."
      : "Pipeline passed. Independent release approval required.");
  }

  function approveRun() {
    if (!canApprove || !current || current.status !== "passed") {
      setNotice("Programme Executive checker must approve a passed run.");
      return;
    }

    setRuns((items) => items.map((r) =>
      r.id === selected
        ? {
            ...r,
            status: "approved",
            checker: "Programme Executive / PD",
            log: [...r.log, "Independent approval recorded"],
          }
        : r
    ));
    setNotice("Release approved for simulated deployment.");
  }

  function deployRun() {
    if (!canRun || !current || current.status !== "approved") {
      setNotice("Only an independently approved run can be deployed.");
      return;
    }
    if (current.checks.some((c) => c.result === "fail")) {
      setNotice("Deployment blocked by failing quality gate.");
      return;
    }

    setRuns((items) => items.map((r) =>
      r.id === selected
        ? {
            ...r,
            status: "deployed",
            log: [...r.log, "Simulated staging deployment completed"],
          }
        : r
    ));
    setNotice("Fictional release promoted to demo staging. No server was deployed.");
  }

  function reset() {
    if (!canRun) return;
    setRuns(initialRuns);
    setSelected("PIPE-001");
    setNotice("CI/CD demo scenario reset.");
  }

  return (
    <div className="cicd-root">
      <style>{`
        .cicd-root{font-family:Arial,Helvetica,sans-serif;color:#1a3e2f}
        .cicd-hero{padding:26px;border-radius:19px;
          background:linear-gradient(115deg,#043b30,#007455);
          color:#fff;margin-bottom:15px}
        .cicd-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
          gap:12px;margin-bottom:15px}
        .cicd-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
        .cicd-grid{display:grid;grid-template-columns:1.15fr 1fr;gap:15px}
        .cicd-tag{display:inline-block;border-radius:30px;
          padding:6px 9px;font-size:10px;font-weight:800;text-transform:uppercase}
        .cicd-line{border-bottom:1px solid #eaf0eb;
          padding:13px 0;display:flex;gap:10px;
          align-items:center;justify-content:space-between}
        .cicd-item{border:1px solid #e1ebe4;background:white;
          padding:14px;border-radius:11px;text-align:left;
          cursor:pointer;width:100%}
        .cicd-item:hover{border-color:#006a4e}
        .cicd-flow{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
        .cicd-step{background:#f0f7f2;border:1px solid #d5e8da;
          border-radius:10px;padding:12px;font-size:11px;
          font-weight:700;color:#16573c}
        @media(max-width:950px){.cicd-grid{grid-template-columns:1fr}}
        @media(max-width:670px){.cicd-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="cicd-hero">
        <div style={{ fontSize: 11, color: "#bce6d3", letterSpacing: 1.3 }}>
          PLATFORM OPERATIONS · D13
        </div>
        <h2 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "11px 0" }}>
          {t("CI/CD Pipelines & Quality Gates", "সিআই/সিডি পাইপলাইন ও কোয়ালিটি গেট")}
        </h2>
        <p style={{ fontSize: 13, color: "#d2ece0", lineHeight: 1.7 }}>
          {t(
            "Visualise controlled releases, automated testing, security scans and independent deployment approval.",
            "অটোমেটেড টেস্ট, সিকিউরিটি স্ক্যান এবং অনুমোদনসহ রিলিজ প্রক্রিয়া দেখুন।"
          )}
        </p>
        <div style={{ color: "#bee8d6", fontSize: 10 }}>
          DEMO PIPELINES · NO REAL BUILD OR DEPLOYMENT EXECUTED
        </div>
      </section>

      <div className="cicd-stats">
        {([
          ["Pipeline definitions", "38", GitBranch, "Reference catalogue"],
          ["Latest release", "1.8.0-rc2", Activity, "Illustrative version"],
          ["Unit tests passed", "1,842", CheckCircle2, "Reference baseline"],
          ["Code coverage", "86%", ShieldCheck, "Reference baseline"],
        ] as const).map(([label, value, Icon, detail]) => (
          <section key={label} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={muted}>{label}</span>
              <Icon size={18} color="#006a4e" />
            </div>
            <div style={{ fontSize: 25, fontWeight: 850, margin: "13px 0 5px" }}>
              {value}
            </div>
            <div style={muted}>{detail}</div>
          </section>
        ))}
      </div>

      <div className="cicd-tabs">
        {([
          ["pipelines", "Pipeline Console", "পাইপলাইন কনসোল"],
          ["gates", "Quality Gates", "কোয়ালিটি গেট"],
          ["releases", "Release Approval", "রিলিজ অনুমোদন"],
          ["audit", "Execution Audit", "অডিট"],
        ] as const).map(([key, en, bn]) => (
          <button key={key}
            style={tab === key ? primary : btn}
            onClick={() => setTab(key)}>
            {t(en, bn)}
          </button>
        ))}
      </div>

      {notice && (
        <div style={{
          ...card, background: "#eaf6ee",
          color: "#086043", fontSize: 12, marginBottom: 14,
        }}>
          {notice}
          <button style={{ ...btn, float: "right", padding: "2px 8px" }}
            onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {tab === "pipelines" && (
        <div className="cicd-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Pipeline Execution Console
            </h3>
            <p style={muted}>
              Select a successful or failing simulated run.
              A failed gate blocks promotion.
            </p>

            <label style={{
              ...muted, display: "block", marginBottom: 12,
            }}>
              Pipeline scenario
              <select style={{
                ...btn, display: "block", marginTop: 7,
                width: "100%",
              }} value={scenario}
                onChange={(e) => setScenario(e.target.value as "pass" | "fail")}>
                <option value="pass">{ui(lang, "Successful pipeline · all gates pass")}</option>
                <option value="fail">{ui(lang, "Failure pipeline · coverage/security blocked")}</option>
              </select>
            </label>

            <button style={primary} disabled={!canRun} onClick={startRun}>
              <Play size={14} style={{ verticalAlign: "middle" }} />
              {" "}Run simulated pipeline
            </button>

            <div className="cicd-flow">
              {steps.map((name, i) => (
                <span className="cicd-step" key={name}>
                  {i + 1}. {name}
                </span>
              ))}
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 13px" }}>
              Recent Pipeline Runs
            </h3>
            <p style={muted}>
              {passed} passing/approved/deployed · {failed} failed runs
            </p>
            <div style={{ display: "grid", gap: 9 }}>
              {runs.slice(0, 8).map((run) => (
                <button
                  key={run.id}
                  className="cicd-item"
                  onClick={() => {
                    setSelected(run.id);
                    setTab("gates");
                  }}
                  style={{
                    background: selected === run.id ? "#f0f8f3" : undefined,
                  }}
                >
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    gap: 8,
                  }}>
                    <b style={{ fontSize: 12 }}>{run.name}</b>
                    <span className="cicd-tag" style={statusColor(run.status)}>
                      {run.status}
                    </span>
                  </div>
                  <div style={muted}>
                    {run.id} · {run.version} · {new Date(run.createdAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "gates" && (
        <div className="cicd-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 5px" }}>
              Quality Gate Verification
            </h3>
            <p style={muted}>
              {current?.id ?? "No run selected"} · {current?.version}
            </p>

            {current?.checks.map((check) => (
              <div className="cicd-line" key={check.name}>
                <div>
                  <b style={{ fontSize: 12 }}>{check.name}</b>
                  <div style={muted}>{check.detail}</div>
                </div>
                <span className="cicd-tag" style={statusColor(check.result)}>
                  {check.result}
                </span>
              </div>
            ))}

            <div style={{
              marginTop: 15, borderRadius: 11,
              padding: 15,
              background: current?.status === "failed" ? "#fff0ed" : "#edf8f1",
              fontSize: 12,
            }}>
              {current?.status === "failed" ? (
                <>
                  <AlertTriangle size={16} color="#ab4935" style={{ verticalAlign: "middle" }} />
                  {" "}**BLOCKED:** Failing security or coverage gates prevent deployment.
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} color="#087b53" style={{ verticalAlign: "middle" }} />
                  {" "}All sample checks passed. Independent approval is still required.
                </>
              )}
            </div>

            <button style={{ ...primary, marginTop: 15 }}
              onClick={() => setTab("releases")}>
              Review release →
            </button>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Quality Policy
            </h3>
            {[
              ["Unit test gate", "All tests pass"],
              ["Coverage minimum", "80%"],
              ["Security scan", "Zero blocking findings"],
              ["Build validation", "Required"],
              ["Regression checks", "Required"],
              ["Human release approval", "Independent checker"],
              ["Environment", "Demo staging only"],
            ].map(([name, value]) => (
              <div key={name} className="cicd-line" style={{ fontSize: 12 }}>
                <span>{name}</span><b>{value}</b>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "releases" && (
        <div className="cicd-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 15px" }}>
              Controlled Release Workflow
            </h3>
            <div style={{
              display: "grid", gap: 12,
            }}>
              {[
                ["1", "Build & test", "System Administrator", current?.status !== "failed"],
                ["2", "Quality gate", "Automated demo checks", current?.status !== "failed"],
                ["3", "Human approval", "Programme Executive / PD", !!current && ["approved", "deployed"].includes(current.status)],
                ["4", "Staging promotion", "System Administrator", current?.status === "deployed"],
              ].map(([number, label, owner, complete]) => (
                <div key={String(number)} style={{
                  padding: 13, border: "1px solid #e4ece6",
                  borderRadius: 11, display: "flex",
                  gap: 12, alignItems: "center",
                }}>
                  <span style={{
                    background: "#e6f3eb", color: "#006a4e",
                    padding: 10, borderRadius: 9, fontWeight: 800,
                  }}>{number as string}</span>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 12 }}>{label as string}</b>
                    <div style={muted}>{owner as string}</div>
                  </div>
                  {complete
                    ? <CheckCircle2 size={18} color="#08754f" />
                    : <Clock3 size={18} color="#b58a42" />}
                </div>
              ))}
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              Selected Release
            </h3>
            <div style={{ fontSize: 19, fontWeight: 800 }}>
              {current?.version}
            </div>
            <p style={muted}>
              {current?.id} · {current?.status}
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={primary}
                disabled={!canApprove || current?.status !== "passed"}
                onClick={approveRun}>
                <ShieldCheck size={14} style={{ verticalAlign: "middle" }} />
                {" "}Checker approve
              </button>
              <button style={btn}
                disabled={!canRun || current?.status !== "approved"}
                onClick={deployRun}>
                Promote to demo staging
              </button>
            </div>

            <p style={{ ...muted, marginTop: 16 }}>
              Role separation: Administrator runs the pipeline;
              Programme Executive approves; Administrator
              then simulates promotion. Failed runs can never
              be approved or deployed.
            </p>
            {current?.checker && (
              <span className="cicd-tag" style={statusColor("approved")}>
                Approved by {current.checker}
              </span>
            )}
          </section>
        </div>
      )}

      {tab === "audit" && (
        <div className="cicd-grid">
          <section style={card}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              gap: 10, flexWrap: "wrap",
            }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>
                Pipeline Execution Audit
              </h3>
              <button style={btn} onClick={() => downloadRuns(runs)}>
                <Download size={14} style={{ verticalAlign: "middle" }} />
                {" "}Export CSV
              </button>
            </div>

            {current?.log.map((event, i) => (
              <div className="cicd-line" key={`${i}-${event}`}>
                <div>
                  <b style={{ fontSize: 12 }}>Step {i + 1}</b>
                  <div style={muted}>{event}</div>
                </div>
                <CheckCircle2 size={16} color="#087a52" />
              </div>
            ))}
          </section>
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 10px" }}>
              Demo Controls
            </h3>
            <p style={muted}>
              Runs are persisted in this browser. No real CI runner,
              Git repository, security scanner or deployment system
              is connected.
            </p>
            <button style={btn} disabled={!canRun} onClick={reset}>
              <RotateCcw size={14} style={{ verticalAlign: "middle" }} />
              {" "}Reset fictional pipelines
            </button>
          </section>
        </div>
      )}

      <footer style={{ ...muted, textAlign: "center", marginTop: 22 }}>
        <LockKeyhole size={13} style={{ verticalAlign: "middle" }} />
        {" "}D13 · Quality gates, test counts and release activity are simulated.
      </footer>
    </div>
  );
}
