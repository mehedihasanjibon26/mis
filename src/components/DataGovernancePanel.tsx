
"use client";
import { ui } from "../lib/ui-l10n";

import { useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Database,
  Download, FileCheck2, Fingerprint, LockKeyhole,
  RotateCcw, ShieldCheck,
} from "lucide-react";

type Tab = "overview" | "quality" | "privacy" | "audit";
type RequestStatus = "pending" | "approved" | "rejected";
type Request = {
  id: string;
  subject: string;
  reason: string;
  status: RequestStatus;
  maker: string;
  checker: string;
};
type Audit = {
  id: string;
  time: string;
  action: string;
  actor: string;
};

const baseRequests: Request[] = [
  { id: "ER-001", subject: "Record subject 0001", reason: "Retention review", status: "pending", maker: "Data Steward", checker: "" },
  { id: "ER-002", subject: "Record subject 0002", reason: "Privacy request", status: "pending", maker: "Data Steward", checker: "" },
  { id: "ER-003", subject: "Record subject 0003", reason: "Retention review", status: "approved", maker: "Data Steward", checker: "Data Controller" },
  { id: "ER-004", subject: "Record subject 0004", reason: "Privacy request", status: "approved", maker: "Data Steward", checker: "Data Controller" },
  { id: "ER-005", subject: "Record subject 0005", reason: "Retention review", status: "rejected", maker: "Data Steward", checker: "Data Controller" },
  { id: "ER-006", subject: "Record subject 0006", reason: "Privacy request", status: "approved", maker: "Data Steward", checker: "Data Controller" },
];

const batches = [
  ["AGG-2401", "Division summary", "1,895,010", "64", "1,004", "Reconciled"],
  ["AGG-2402", "District summary", "1,895,010", "512", "1,218", "Reconciled"],
  ["AGG-2403", "Upazila summary", "1,895,010", "5,864", "1,190", "Reconciled"],
];

const rules = [
  ["Bangla / English name mismatch", 143, "Identity Data Steward"],
  ["Missing BRN or exception reason", 87, "Registration Steward"],
  ["Inactive payment wallets", 214, "Finance Data Steward"],
];

const dimensions = [
  ["Completeness", 98.2],
  ["Validity", 97.5],
  ["Uniqueness", 99.9],
  ["Consistency", 94.1],
  ["Timeliness", 93.6],
  ["Accuracy", 97.4],
] as const;

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e0eae3",
  borderRadius: 16,
  padding: 19,
};

const button: React.CSSProperties = {
  border: "1px solid #d5e5da",
  background: "#fff",
  color: "#14543b",
  borderRadius: 9,
  padding: "10px 13px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const primary: React.CSSProperties = {
  ...button,
  color: "#fff",
  background: "#006a4e",
  borderColor: "#006a4e",
};

const muted: React.CSSProperties = {
  fontSize: 11,
  color: "#708678",
  lineHeight: 1.7,
};

function readSaved<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function exportAudit(items: Audit[]) {
  const rows = [
    ["Time", "Actor", "Action"],
    ...items.map((x) => [x.time, x.actor, x.action]),
  ];
  const csv = rows.map((r) =>
    r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");

  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "MCBP-D16-Audit.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function DataGovernancePanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: "en" | "bn";
  roleId?: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [requests, setRequests] = useState<Request[]>(() =>
    readSaved("mcbp-d16-requests", baseRequests)
  );
  const [audit, setAudit] = useState<Audit[]>(() =>
    readSaved("mcbp-d16-audit", [])
  );
  const [selected, setSelected] = useState("ER-001");
  const [message, setMessage] = useState("");
  const [masked, setMasked] = useState(true);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const canReview = roleId === "admin";
  const chosen = requests.find((r) => r.id === selected);
  const waiting = requests.filter((r) => r.status === "pending").length;

  function record(action: string) {
    const event: Audit = {
      id: crypto.randomUUID(),
      time: new Date().toISOString(),
      action,
      actor: roleId,
    };
    setAudit((old) => {
      const next = [event, ...old];
      localStorage.setItem("mcbp-d16-audit", JSON.stringify(next));
      return next;
    });
  }

  function decide(status: "approved" | "rejected") {
    if (!canReview || !chosen || chosen.status !== "pending") {
      setMessage("A pending request and an authorised reviewer are required.");
      return;
    }
    const updated = requests.map((r) =>
      r.id === chosen.id ? { ...r, status, checker: roleId } : r
    );
    setRequests(updated);
    localStorage.setItem("mcbp-d16-requests", JSON.stringify(updated));
    record(`${chosen.id} ${status} — simulated decision`);
    setMessage(`${chosen.id} marked ${status}. No personal data was erased.`);
  }

  function reset() {
    if (!canReview) return;
    setRequests(baseRequests);
    setAudit([]);
    setSelected("ER-001");
    setMasked(true);
    localStorage.removeItem("mcbp-d16-requests");
    localStorage.removeItem("mcbp-d16-audit");
    setMessage("Fictional governance register reset.");
  }

  return (
    <div className="d16-root">
      <style>{`
        .d16-root{color:#183f2e;font-family:Arial,Helvetica,sans-serif;min-width:0}
        .d16-hero{padding:26px;border-radius:18px;background:linear-gradient(110deg,#063e31,#007354);color:white;margin-bottom:15px}
        .d16-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:15px}
        .d16-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:15px}
        .d16-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
        .d16-row{display:flex;justify-content:space-between;align-items:center;gap:9px;padding:12px 0;border-bottom:1px solid #e8f0ea;font-size:12px}
        .d16-table{width:100%;border-collapse:collapse;font-size:12px}
        .d16-table th{text-align:left;color:#718678;font-size:11px}
        .d16-table th,.d16-table td{padding:12px 8px;border-bottom:1px solid #eaf1eb;text-align:left}
        .d16-meter{height:8px;background:#e5ede7;border-radius:10px;margin-top:8px;overflow:hidden}
        .d16-meter span{display:block;height:100%;background:#07845b;border-radius:10px}
        .d16-pill{border-radius:40px;padding:6px 9px;background:#e6f5ed;color:#08714b;font-weight:800;font-size:10px}
        @media(max-width:950px){.d16-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.d16-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="d16-hero">
        <div style={{fontSize:11,color:"#bde6d2",letterSpacing:1.3}}>
          PLATFORM OPERATIONS · D16
        </div>
        <h2 style={{fontSize:"clamp(24px,3vw,33px)",margin:"10px 0"}}>
          {t("Data Governance & Privacy", "ডেটা গভর্নেন্স ও গোপনীয়তা")}
        </h2>
        <p style={{fontSize:13,lineHeight:1.7,color:"#d5eddf"}}>
          {t(
            "Track data quality, reconcile aggregates, protect sensitive information and govern privacy requests.",
            "ডেটা কোয়ালিটি, সামঞ্জস্য যাচাই, সংবেদনশীল তথ্য সুরক্ষা ও প্রাইভেসি অনুরোধ পরিচালনা করুন।"
          )}
        </p>
        <div style={{fontSize:10,color:"#bde6d2"}}>
          DEMO / SIMULATED DATA · NO LIVE PERSONAL RECORDS OR ERASURE OPERATIONS
        </div>
      </section>

      <div className="d16-stats">
        {([
          ["Data quality", "96.8%", Activity, "+0.4% reference"],
          ["Aggregate batches", "24 / 24", Database, "Reconciled reference"],
          ["Cells suppressed", "3,412", LockKeyhole, "418,000 published cells"],
          ["Erasure requests", String(requests.length), ShieldCheck, `${waiting} awaiting review`],
        ] as const).map(([name,value,Icon,sub]) => (
          <section key={name} style={card}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={muted}>{name}</span>
              <Icon size={18} color="#007653"/>
            </div>
            <div style={{fontSize:26,fontWeight:850,margin:"12px 0 5px"}}>
              {value}
            </div>
            <div style={muted}>{sub}</div>
          </section>
        ))}
      </div>

      <div className="d16-tabs">
        {([
          ["overview","Governance Overview","গভর্নেন্স"],
          ["quality","Data Quality","ডেটা কোয়ালিটি"],
          ["privacy","Privacy Requests","প্রাইভেসি অনুরোধ"],
          ["audit","Access & Audit","অ্যাক্সেস ও অডিট"],
        ] as const).map(([id,en,bn]) => (
          <button key={id} style={tab===id?primary:button}
            onClick={()=>setTab(id)}>{t(en,bn)}</button>
        ))}
      </div>

      {message && <div style={{...card,background:"#e9f6ef",marginBottom:14,fontSize:12}}>
        {message}
        <button style={{...button,float:"right",padding:"2px 8px"}}
          onClick={()=>setMessage("")}>×</button>
      </div>}

      {tab==="overview" && <div className="d16-grid">
        <section style={card}>
          <h3>{ui(lang, "Data Quality Dimensions")}</h3>
          {dimensions.map(([name,value]) => (
            <div key={name} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span>{name}</span><b>{value}%</b>
              </div>
              <div className="d16-meter">
                <span style={{width:`${value}%`}}/>
              </div>
            </div>
          ))}
        </section>
        <section style={card}>
          <h3>{ui(lang, "Privacy Governance")}</h3>
          {[
            ["Tier-1 to Tier-2 variance","0 · reference"],
            ["Suppressed cells","3,412 · reference"],
            ["Approved aggregates","24 / 24 · reference"],
            ["Personal data access","Role and purpose governed"],
            ["Sharing agreements","Controlled register (demo)"],
            ["Privacy requests",`${waiting} pending`],
          ].map(([label,value])=>(
            <div key={label} className="d16-row">
              <span>{label}</span><b style={{textAlign:"right"}}>{value}</b>
            </div>
          ))}
        </section>
      </div>}

      {tab==="quality" && <div className="d16-grid">
        <section style={card}>
          <h3>{ui(lang, "Aggregation Reconciliation")}</h3>
          <p style={muted}>{ui(lang, "Illustrative Tier-1 to Tier-2 dataset processing.")}</p>
          <div style={{overflowX:"auto"}}>
            <table className="d16-table">
              <thead><tr><th>{ui(lang, "Batch")}</th><th>{ui(lang, "Dataset")}</th><th>{ui(lang, "Rows in")}</th><th>{ui(lang, "Cells out")}</th><th>{ui(lang, "Suppressed")}</th><th>{ui(lang, "Status")}</th></tr></thead>
              <tbody>
                {batches.map((row)=>(
                  <tr key={row[0]}>
                    {row.map((value,i)=><td key={i}>{value}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={muted}>
            Example partitions only. Summary baseline: 24/24 batches reconciled;
            3,412 cells suppressed.
          </p>
        </section>
        <section style={card}>
          <h3>{ui(lang, "Data Validation Exceptions")}</h3>
          {rules.map(([name,count,owner])=>(
            <div key={name} className="d16-row">
              <div>
                <b>{name}</b>
                <div style={muted}>{owner}</div>
              </div>
              <span className="d16-pill">{count} records</span>
            </div>
          ))}
          <div style={{background:"#fff4e7",padding:13,borderRadius:10,marginTop:15,fontSize:12}}>
            <AlertTriangle size={15} style={{verticalAlign:"middle"}}/>
            {" "}Exceptions require responsible steward review before correction.
          </div>
        </section>
      </div>}

      {tab==="privacy" && <div className="d16-grid">
        <section style={card}>
          <h3>{ui(lang, "Erasure & Retention Request Queue")}</h3>
          <p style={muted}>
            Mock decisions only. Approval never deletes underlying data.
          </p>
          {requests.map((r)=>(
            <button key={r.id}
              onClick={()=>setSelected(r.id)}
              style={{
                ...button,width:"100%",textAlign:"left",marginBottom:8,
                background:selected===r.id?"#edf8f1":"#fff",
                borderColor:selected===r.id?"#007653":"#d5e5da",
              }}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                <b>{r.id} · {r.subject}</b>
                <span className="d16-pill">{r.status}</span>
              </div>
              <div style={{...muted,marginTop:6}}>{r.reason}</div>
            </button>
          ))}
        </section>
        <section style={card}>
          <h3>{ui(lang, "Privacy Review Workspace")}</h3>
          {chosen && <>
            <div className="d16-row"><span>{ui(lang, "Request")}</span><b>{chosen.id}</b></div>
            <div className="d16-row"><span>{ui(lang, "Maker")}</span><b>{chosen.maker}</b></div>
            <div className="d16-row"><span>{ui(lang, "Checker")}</span><b>{chosen.checker||"Pending"}</b></div>
            <div className="d16-row"><span>{ui(lang, "Status")}</span><b>{chosen.status}</b></div>
            <div style={{display:"flex",gap:8,marginTop:17,flexWrap:"wrap"}}>
              <button style={primary} onClick={()=>decide("approved")}
                disabled={!canReview||chosen.status!=="pending"}>
                <CheckCircle2 size={14} style={{verticalAlign:"middle"}}/>
                {" "}Approve
              </button>
              <button style={button} onClick={()=>decide("rejected")}
                disabled={!canReview||chosen.status!=="pending"}>
                Reject
              </button>
            </div>
            <p style={{...muted,marginTop:16}}>
              A separate steward originated the fictional request.
              This review changes the demo register only.
            </p>
          </>}
        </section>
      </div>}

      {tab==="audit" && <div className="d16-grid">
        <section style={card}>
          <h3>{ui(lang, "Tiered Access & Privacy")}</h3>
          {[
            ["Tier-1","Sensitive identified records"],
            ["Tier-2","Aggregate, disclosure-controlled data"],
            ["Unmasking","Role-based, logged and reviewed"],
            ["Data sharing","Approved agreements and purpose"],
            ["Audit","Illustrative browser-local entries"],
          ].map(([key,value])=>(
            <div className="d16-row" key={key}>
              <span>{key}</span><b>{value}</b>
            </div>
          ))}
          <button style={{...button,marginTop:14}}
            onClick={()=>setMasked((m)=>!m)}>
            <Fingerprint size={14} style={{verticalAlign:"middle"}}/>
            {" "}{masked?"Show fictional sample":"Mask fictional sample"}
          </button>
          <p style={{fontSize:13,marginTop:13}}>
            Sample reference: {masked?"BEN-******":"BEN-DEMO-0001"}
          </p>
          <p style={muted}>
            Revealing this fictional value does not grant access to real data.
          </p>
        </section>
        <section style={card}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <h3>{ui(lang, "Governance Audit")}</h3>
            <button style={button} onClick={()=>exportAudit(audit)}>
              <Download size={14} style={{verticalAlign:"middle"}}/>
              {" "}Export CSV
            </button>
          </div>
          {!audit.length&&<p style={muted}>{ui(lang, "Approve or reject a privacy request to create an audit entry.")}</p>}
          {audit.map((item)=>(
            <div className="d16-row" key={item.id}>
              <div>
                <b>{item.action}</b>
                <div style={muted}>
                  {item.actor} · {new Date(item.time).toLocaleString()}
                </div>
              </div>
              <FileCheck2 size={17} color="#078454"/>
            </div>
          ))}
          <button style={{...button,marginTop:15}}
            disabled={!canReview} onClick={reset}>
            <RotateCcw size={14} style={{verticalAlign:"middle"}}/>
            {" "}Reset demo
          </button>
        </section>
      </div>}

      <footer style={{...muted,textAlign:"center",marginTop:22}}>
        <ShieldCheck size={13} style={{verticalAlign:"middle"}}/>
        {" "}D16 · Simulated data governance · No live personal information processed
      </footer>
    </div>
  );
}
