
"use client";
import { ui, digits } from "../lib/ui-l10n";

import { useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock3,
  Download, RotateCcw, Rocket,
  ShieldCheck,
} from "lucide-react";

type Tab = "overview" | "evidence" | "deployment" | "config" | "audit";
type Phase = "awaiting-approval" | "approved" | "canary" |
  "production" | "rolled-back";
type PromotionStatus = "draft" | "submitted" | "approved" | "rejected";
type Promotion = {
  id: string; item: string; from: string; to: string;
  status: PromotionStatus; maker: string; checker: string;
};
type Audit = { id: string; at: string; actor: string; action: string };
type State = {
  phase: Phase;
  approvalActor: string;
  errorRate: number;
  p95: number;
  canaryChecked: boolean;
  promotions: Promotion[];
  audit: Audit[];
};

const KEY = "mcbp-d21-releases-v1";

const seedPromotions: Promotion[] = [
  { id: "CFG-001", item: "Field verification checklist",
    from: "Staging", to: "Production",
    status: "draft", maker: "", checker: "" },
  { id: "CFG-002", item: "Eligibility rule configuration",
    from: "Staging", to: "Production",
    status: "draft", maker: "", checker: "" },
  { id: "CFG-003", item: "Sample scheme configuration",
    from: "Testing", to: "Training",
    status: "draft", maker: "", checker: "" },
];

const environments = [
  ["Development", "1.8.0-rc2", "Synthetic", "Testing"],
  ["Testing", "1.8.0-rc2", "Synthetic", "Staging"],
  ["Staging", "1.8.0-rc2", "Synthetic", "Approval"],
  ["Training", "1.7.3", "Training", "Scheduled review"],
  ["Production", "1.7.3", "Restricted", "Change approval"],
  ["DR", "1.7.3", "Replicated", "Standby"],
] as const;

const evidence = [
  ["Requirements traceability", "148 / 148", "Pass"],
  ["Regression suite", "2,410 passed · 0 failed", "Pass"],
  ["Performance regression", "Within 4% of baseline", "Pass"],
  ["Security scanning", "0 critical · 0 high", "Pass"],
  ["Database migrations", "Backward compatible", "Pass"],
  ["Rollback rehearsal", "4m 10s", "Pass"],
  ["Payment calendar", "Clear", "Pass"],
  ["MoWCA change approval", "Pending signature", "Pending"],
] as const;

function seed(): State {
  return {
    phase: "awaiting-approval",
    approvalActor: "",
    errorRate: 0.04,
    p95: 0.742,
    canaryChecked: false,
    promotions: seedPromotions,
    audit: [],
  };
}

function load(): State {
  if (typeof window === "undefined") return seed();
  try {
    const value = window.localStorage.getItem(KEY);
    if (value) {
      const parsed = JSON.parse(value) as State;
      if (
        typeof parsed.phase === "string" &&
        Array.isArray(parsed.promotions) &&
        Array.isArray(parsed.audit)
      ) return parsed;
    }
  } catch {
    // Fictional baseline.
  }
  return seed();
}

const card: React.CSSProperties = {
  background: "#fff", padding: 19, borderRadius: 16,
  border: "1px solid #deebe3",
};
const button: React.CSSProperties = {
  borderRadius: 9, border: "1px solid #d5e4d9",
  background: "#fff", color: "#14523b",
  padding: "10px 13px", fontSize: 12,
  fontWeight: 700, cursor: "pointer",
};
const primary: React.CSSProperties = {
  ...button, background: "#006a4e",
  borderColor: "#006a4e", color: "#fff",
};
const muted: React.CSSProperties = {
  fontSize: 11, lineHeight: 1.7, color: "#728678",
};
const format = (value: string) =>
  value.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

function exportCSV(events: Audit[]) {
  const rows = [
    ["Time", "Actor", "Action"],
    ...events.map((e) => [e.at, e.actor, e.action]),
  ];
  const csv = rows.map((r) =>
    r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(new Blob(
    ["\uFEFF", csv], { type: "text/csv;charset=utf-8" }
  ));
  const a = document.createElement("a");
  a.href = url;
  a.download = "MCBP-D21-Release-Audit.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReleaseManagementPanel({
  lang = "en", roleId = "admin",
}: {
  lang?: "en" | "bn";
  roleId?: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<State>(load);
  const [selectedConfig, setSelectedConfig] = useState("CFG-001");
  const [message, setMessage] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const maker = roleId === "admin";
  const checker = roleId === "executive";
  const selected = data.promotions.find((p) => p.id === selectedConfig);
  const healthy = data.errorRate <= 0.5 && data.p95 <= 1.5;
  const pendingConfig = data.promotions.filter(
    (p) => p.status === "submitted"
  ).length;

  function save(changes: Partial<State>, action: string) {
    const next: State = {
      ...data, ...changes,
      audit: [{
        id: crypto.randomUUID(), at: new Date().toISOString(),
        actor: roleId, action,
      }, ...data.audit],
    };
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage(action);
  }

  function approveRelease() {
    if (!checker || data.phase !== "awaiting-approval") return;
    save({
      phase: "approved", approvalActor: roleId,
    }, "MoWCA change approval simulated by executive reviewer");
  }

  function beginCanary() {
    if (!maker || data.phase !== "approved" || !data.approvalActor) return;
    save({
      phase: "canary", canaryChecked: false,
    }, "10% canary started — simulated 15-minute observation window");
  }

  function assessCanary() {
    if (!maker || data.phase !== "canary") return;
    if (!healthy) {
      save({
        phase: "rolled-back", canaryChecked: true,
      }, "Automatic rollback simulated: health threshold breached");
    } else {
      save({
        canaryChecked: true,
      }, "Canary health gates passed — 15-minute period simulated");
    }
  }

  function fullRollout() {
    if (
      !maker || data.phase !== "canary" ||
      !data.canaryChecked || !healthy
    ) return;
    save({
      phase: "production",
    }, "Full production rollout completed in demo only");
  }

  function rollback() {
    if (!maker || !["canary", "production"].includes(data.phase)) return;
    save({
      phase: "rolled-back",
    }, "Manual rollback to 1.7.3 simulated");
  }

  function submitConfig() {
    if (!maker || !selected || selected.status !== "draft") return;
    save({
      promotions: data.promotions.map((p) =>
        p.id === selected.id
          ? { ...p, status: "submitted", maker: roleId } : p
      ),
    }, `${selected.item}: promotion submitted`);
  }

  function reviewConfig(approved: boolean) {
    if (
      !checker || !selected || selected.status !== "submitted" ||
      selected.maker === roleId
    ) return;
    save({
      promotions: data.promotions.map((p) =>
        p.id === selected.id ? {
          ...p,
          status: approved ? "approved" : "rejected",
          checker: roleId,
        } : p
      ),
    }, `${selected.item}: ${approved ? "approved" : "rejected"} (demo)`);
  }

  function reset() {
    if (!maker) return;
    const next = seed();
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage("Reference release scenario reset.");
  }

  return (
    <div className="rel21">
      <style>{`
        .rel21{font-family:Arial,Helvetica,sans-serif;color:#183e2d;min-width:0}
        .rel21-hero{border-radius:18px;padding:26px;
          background:linear-gradient(110deg,#063d30,#007354);color:white}
        .rel21-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:15px 0}
        .rel21-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}
        .rel21-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:15px}
        .rel21-table{width:100%;border-collapse:collapse;font-size:12px}
        .rel21-table th,.rel21-table td{border-bottom:1px solid #e8eee9;padding:12px 9px;text-align:left}
        .rel21-table th{font-size:11px;color:#738778}
        .rel21-row{display:flex;align-items:center;justify-content:space-between;gap:12px;
          padding:13px 0;border-bottom:1px solid #e7efe9;font-size:12px}
        .rel21-pill{padding:6px 9px;background:#e5f5ec;color:#08734e;
          border-radius:25px;font-size:10px;font-weight:800;white-space:nowrap}
        .rel21-option{width:100%;text-align:left;padding:13px;border:1px solid #dbe9df;
          border-radius:11px;background:white;cursor:pointer;margin-bottom:8px}
        @media(max-width:960px){.rel21-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.rel21-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="rel21-hero">
        <div style={{fontSize:11,color:"#bce8d2",letterSpacing:1.3}}>
          PLATFORM OPERATIONS · D21
        </div>
        <h2 style={{fontSize:"clamp(24px,3vw,34px)",margin:"11px 0"}}>
          {t("Environments & Release Management", "এনভায়রনমেন্ট ও রিলিজ ম্যানেজমেন্ট")}
        </h2>
        <p style={{fontSize:13,lineHeight:1.7,color:"#d4ebe0"}}>
          {t(
            "Review release evidence, approve changes, rehearse canary deployments and control configuration promotions.",
            "রিলিজ যাচাই, পরিবর্তন অনুমোদন, ক্যানারি ডেপ্লয়মেন্ট ও কনফিগারেশন প্রমোশন দেখুন।"
          )}
        </p>
        <div style={{fontSize:10,color:"#bce8d2"}}>
          DEMO / SIMULATED DATA · NO REAL DEPLOYMENT OR ENVIRONMENT CHANGE
        </div>
      </section>

      <div className="rel21-stats">
        {([
          ["Requirements traced", "148 / 148", CheckCircle2, "Reference evidence"],
          ["Regression tests", "2,410", Activity, "0 failed · reference"],
          ["Security findings", "0", ShieldCheck, "Critical + high"],
          ["Rollback rehearsal", "4m 10s", Clock3, "Reference result"],
        ] as const).map(([label,value,Icon,sub])=>(
          <div style={card} key={label}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={muted}>{ui(lang, label)}</span><Icon size={18} color="#007755"/>
            </div>
            <div style={{fontSize:26,fontWeight:850,margin:"12px 0 5px"}}>{digits(lang, value)}</div>
            <div style={muted}>{ui(lang, sub)}</div>
          </div>
        ))}
      </div>

      <div className="rel21-tabs">
        {([
          ["overview","Environments","এনভায়রনমেন্ট"],
          ["evidence","Release Evidence","রিলিজ যাচাই"],
          ["deployment","Deployment Control","ডেপ্লয়মেন্ট কন্ট্রোল"],
          ["config","Configuration Promotions","কনফিগারেশন প্রমোশন"],
          ["audit","Audit","অডিট"],
        ] as const).map(([id,en,bn])=>(
          <button key={id} style={tab===id?primary:button}
            onClick={()=>setTab(id)}>{t(en,bn)}</button>
        ))}
      </div>

      {message && <div style={{...card,background:"#eaf7ef",fontSize:12,marginBottom:14}}>
        {message}
        <button style={{...button,float:"right",padding:"3px 8px"}}
          onClick={()=>setMessage("")}>×</button>
      </div>}

      {tab==="overview" && <div className="rel21-grid">
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Environment Registry")}</h3>
          <p style={muted}>
            Example release versions and data classifications are fictional;
            healthy/no-drift status follows the reference scenario.
          </p>
          <div style={{overflowX:"auto"}}>
            <table className="rel21-table">
              <thead><tr><th>{ui(lang, "Environment")}</th><th>{ui(lang, "Release")}</th><th>{ui(lang, "Data")}</th><th>{ui(lang, "Health")}</th><th>{ui(lang, "Drift")}</th><th>{ui(lang, "Next")}</th></tr></thead>
              <tbody>
                {environments.map(([name,version,kind,next])=>(
                  <tr key={name}>
                    <td><b>{ui(lang, name)}</b></td><td>{name==="Production"&&data.phase==="production"?"1.8.0-rc2":version}</td>
                    <td>{kind}</td><td><span className="rel21-pill">{ui(lang, "Healthy")}</span></td>
                    <td>{ui(lang, "None")}</td><td>{next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Release Summary")}</h3>
          {[
            ["Candidate release","1.8.0-rc2"],
            ["Current reference production","1.7.3"],
            ["Release status",format(data.phase)],
            ["Change approval",data.approvalActor?"Approved (demo)":"Pending signature"],
            ["Deployment window","Sun 22 Nov 2026 · 22:00–23:00"],
            ["Pending config promotions",String(pendingConfig)],
          ].map(([name,value])=>(
            <div key={name} className="rel21-row">
              <span>{ui(lang, name)}</span><b style={{textAlign:"right"}}>{digits(lang, value)}</b>
            </div>
          ))}
        </section>
      </div>}

      {tab==="evidence" && <div className="rel21-grid">
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Release Evidence Gate")}</h3>
          {evidence.map(([name,value,status])=>(
            <div key={name} className="rel21-row">
              <div><b>{ui(lang, name)}</b><div style={muted}>{digits(lang, value)}</div></div>
              <span className="rel21-pill" style={
                status==="Pending"?{background:"#fff3dc",color:"#926418"}:{}
              }>{status==="Pending"&&data.approvalActor?"Approved (demo)":status}</span>
            </div>
          ))}
        </section>
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Change Approval")}</h3>
          <p style={muted}>
            Master PRD records MoWCA change approval as pending signature.
            Programme Executive may simulate that approval.
          </p>
          <div className="rel21-row">
            <span>{ui(lang, "Approval state")}</span>
            <b>{data.approvalActor?"Approved (demo)":"Pending"}</b>
          </div>
          <button style={{...primary,marginTop:15}}
            disabled={!checker||data.phase!=="awaiting-approval"}
            onClick={approveRelease}>
            <CheckCircle2 size={14} style={{verticalAlign:"middle"}}/>
            {" "}Simulate change approval
          </button>
          <p style={{...muted,marginTop:12}}>
            Approving here does not provide an authentic MoWCA signature
            or release authorisation.
          </p>
        </section>
      </div>}

      {tab==="deployment" && <div className="rel21-grid">
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>
            <Rocket size={18} style={{verticalAlign:"middle"}}/>
            {" "}Canary Deployment Simulator
          </h3>
          <div className="rel21-row">
            <span>{ui(lang, "Release stage")}</span>
            <span className="rel21-pill">{format(data.phase)}</span>
          </div>
          <div className="rel21-row">
            <span>{ui(lang, "Window")}</span><b>{ui(lang, "22 Nov 2026 · 22:00–23:00")}</b>
          </div>
          <div className="rel21-row">
            <span>{ui(lang, "Canary traffic")}</span><b>{ui(lang, "10% for 15 minutes")}</b>
          </div>
          <div className="rel21-row">
            <span>{ui(lang, "Rollback if error rate")}</span><b>{ui(lang, "Greater than 0.5%")}</b>
          </div>
          <div className="rel21-row">
            <span>{ui(lang, "Rollback if API p95")}</span><b>{ui(lang, "Greater than 1.5 seconds")}</b>
          </div>

          <label style={{...muted,display:"block",marginTop:15}}>
            Simulated error rate (%)
            <input type="number" min="0" max="100" step="0.01"
              value={data.errorRate}
              disabled={!maker||data.phase!=="canary"||data.canaryChecked}
              onChange={(e)=>setData((old)=>({
                ...old,errorRate:Number(e.target.value),
              }))}
              style={{...button,width:"100%",boxSizing:"border-box",display:"block",marginTop:6}}
            />
          </label>
          <label style={{...muted,display:"block",marginTop:12}}>
            Simulated API p95 (seconds)
            <input type="number" min="0" step="0.01"
              value={data.p95}
              disabled={!maker||data.phase!=="canary"||data.canaryChecked}
              onChange={(e)=>setData((old)=>({
                ...old,p95:Number(e.target.value),
              }))}
              style={{...button,width:"100%",boxSizing:"border-box",display:"block",marginTop:6}}
            />
          </label>

          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
            <button style={primary}
              disabled={!maker||data.phase!=="approved"}
              onClick={beginCanary}>{ui(lang, "Start 10% canary")}</button>
            <button style={button}
              disabled={!maker||data.phase!=="canary"||data.canaryChecked}
              onClick={assessCanary}>{ui(lang, "Check health gates")}</button>
            <button style={primary}
              disabled={!maker||data.phase!=="canary"||!data.canaryChecked||!healthy}
              onClick={fullRollout}>{ui(lang, "Complete full rollout")}</button>
            <button style={button}
              disabled={!maker||!["canary","production"].includes(data.phase)}
              onClick={rollback}>{ui(lang, "Simulate rollback")}</button>
          </div>
        </section>
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Deployment Decision")}</h3>
          <div style={{
            borderRadius:13,padding:17,
            background:healthy?"#eef8f2":"#fff0e8",
            color:healthy?"#086d4a":"#ae562d",
          }}>
            {healthy?<CheckCircle2 size={21}/>:<AlertTriangle size={21}/>}
            <h3 style={{margin:"9px 0 4px",fontSize:16}}>
              {healthy?"Within safety thresholds":"Rollback threshold exceeded"}
            </h3>
            <p style={{fontSize:12,lineHeight:1.7}}>
              Error: {data.errorRate}% / 0.5% limit
              {" · "}API p95: {data.p95}s / 1.5s limit.
            </p>
          </div>
          {[
            ["Canary evaluation",data.canaryChecked?"Completed":"Pending"],
            ["Release approval",data.approvalActor?"Recorded (demo)":"Pending"],
            ["Rollback rehearsal","4m 10s · reference"],
            ["On-call responsibilities","Named operational roles required"],
          ].map(([name,value])=>(
            <div className="rel21-row" key={name}>
              <span>{ui(lang, name)}</span><b>{digits(lang, value)}</b>
            </div>
          ))}
          <p style={{...muted,marginTop:15}}>
            All steps are instant demo transitions; no real 15-minute wait,
            health monitoring, deployment or DNS switch occurs.
          </p>
        </section>
      </div>}

      {tab==="config" && <div className="rel21-grid">
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Business Configuration Queue")}</h3>
          {data.promotions.map((p)=>(
            <button key={p.id} className="rel21-option"
              style={{
                background:selectedConfig===p.id?"#eef8f2":"#fff",
                borderColor:selectedConfig===p.id?"#07885a":"#dbe9df",
              }}
              onClick={()=>setSelectedConfig(p.id)}>
              <b style={{fontSize:12}}>{p.item}</b>
              <div style={{...muted,marginTop:5}}>
                {p.id} · {p.from} → {p.to} · {p.status}
              </div>
            </button>
          ))}
        </section>
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Promotion Approval")}</h3>
          {selected && <>
            <b style={{fontSize:14}}>{selected.item}</b>
            {[
              ["From",selected.from],
              ["To",selected.to],
              ["State",format(selected.status)],
              ["Maker",selected.maker||"Not submitted"],
              ["Checker",selected.checker||"Pending"],
            ].map(([name,value])=>(
              <div key={name} className="rel21-row">
                <span>{ui(lang, name)}</span><b>{digits(lang, value)}</b>
              </div>
            ))}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:17}}>
              <button style={primary}
                disabled={!maker||selected.status!=="draft"}
                onClick={submitConfig}>{ui(lang, "Submit")}</button>
              <button style={primary}
                disabled={!checker||selected.status!=="submitted"}
                onClick={()=>reviewConfig(true)}>{ui(lang, "Approve")}</button>
              <button style={button}
                disabled={!checker||selected.status!=="submitted"}
                onClick={()=>reviewConfig(false)}>{ui(lang, "Reject")}</button>
            </div>
            <p style={{...muted,marginTop:12}}>
              Config promotions affect only this local register; they
              do not modify the underlying scheme or field checklist.
            </p>
          </>}
        </section>
      </div>}

      {tab==="audit" && <div className="rel21-grid">
        <section style={card}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
            <h3 style={{fontSize:16,margin:0}}>{ui(lang, "Release Action Audit")}</h3>
            <button style={button} onClick={()=>exportCSV(data.audit)}>
              <Download size={14} style={{verticalAlign:"middle"}}/> Export CSV
            </button>
          </div>
          {!data.audit.length&&<p style={muted}>{ui(lang, "No demo release actions recorded yet.")}</p>}
          {data.audit.map((e)=>(
            <div key={e.id} className="rel21-row">
              <div><b>{e.action}</b>
                <div style={muted}>{e.actor} · {new Date(e.at).toLocaleString((lang === "bn") ? "bn-BD" : "en-GB")}</div>
              </div>
              <ShieldCheck size={16} color="#087b54"/>
            </div>
          ))}
        </section>
        <section style={card}>
          <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Demo Management")}</h3>
          <p style={muted}>
            Release approvals, traffic metrics, promotion decisions and
            activity history are browser-local fictional data.
          </p>
          <button style={button} disabled={!maker} onClick={reset}>
            <RotateCcw size={14} style={{verticalAlign:"middle"}}/>
            {" "}Reset release scenario
          </button>
        </section>
      </div>}

      <footer style={{...muted,textAlign:"center",marginTop:21}}>
        <ShieldCheck size={13} style={{verticalAlign:"middle"}}/>
        {" "}D21 · Simulated release, environment and deployment management
      </footer>
    </div>
  );
}
