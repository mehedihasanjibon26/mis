
"use client";
import { ui, digits } from "../lib/ui-l10n";

import { useState } from "react";
import {
  BarChart3, CheckCircle2, ChevronDown, ChevronUp,
  Download, FileBarChart, Mail, Plus, RotateCcw,
  ShieldCheck, Trash2,
} from "lucide-react";

type Widget = { id: string; metric: string };
type Decision = "draft" | "submitted" | "approved" | "rejected";
type Log = { id: string; time: string; actor: string; action: string };
type Config = {
  name: string;
  division: string;
  period: string;
  programme: string;
  widgets: Widget[];
  state: Decision;
  maker: string;
  checker: string;
  logs: Log[];
};

const KEY = "mcbp-self-service-v1";
const metrics = [
  "Applications",
  "Approved beneficiaries",
  "Payment completions",
  "Pending verification",
  "Open grievances",
  "Training completions",
];

const rows = [
  { division: "Rangpur", applications: 1850, approved: 1420, paid: 1230, pending: 190, grievances: 44, trained: 310 },
  { division: "Dhaka", applications: 2520, approved: 1940, paid: 1700, pending: 260, grievances: 62, trained: 490 },
  { division: "Chattogram", applications: 1920, approved: 1490, paid: 1270, pending: 215, grievances: 39, trained: 350 },
  { division: "Khulna", applications: 1250, approved: 940, paid: 830, pending: 120, grievances: 25, trained: 220 },
  { division: "Rajshahi", applications: 1450, approved: 1110, paid: 990, pending: 145, grievances: 30, trained: 280 },
  { division: "Barishal", applications: 790, approved: 610, paid: 520, pending: 81, grievances: 14, trained: 140 },
  { division: "Sylhet", applications: 890, approved: 680, paid: 590, pending: 95, grievances: 18, trained: 150 },
  { division: "Mymensingh", applications: 1020, approved: 780, paid: 700, pending: 109, grievances: 21, trained: 180 },
];

const field: Record<string, keyof (typeof rows)[number]> = {
  "Applications": "applications",
  "Approved beneficiaries": "approved",
  "Payment completions": "paid",
  "Pending verification": "pending",
  "Open grievances": "grievances",
  "Training completions": "trained",
};

function fresh(): Config {
  return {
    name: "My Programme Overview",
    division: "All divisions",
    period: "Current cycle",
    programme: "MCBP",
    widgets: [
      { id: "w1", metric: "Applications" },
      { id: "w2", metric: "Approved beneficiaries" },
      { id: "w3", metric: "Payment completions" },
    ],
    state: "draft",
    maker: "",
    checker: "",
    logs: [],
  };
}

function load(): Config {
  if (typeof window === "undefined") return fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const value = JSON.parse(raw) as Config;
      if (Array.isArray(value.widgets) && Array.isArray(value.logs)) {
        return value;
      }
    }
  } catch {
    // Use demo defaults.
  }
  return fresh();
}

const panel: React.CSSProperties = {
  background: "#fff",
  padding: 18,
  border: "1px solid #dfe9e2",
  borderRadius: 15,
};
const control: React.CSSProperties = {
  border: "1px solid #d6e4da",
  borderRadius: 9,
  background: "#fff",
  color: "#17533b",
  padding: "10px 12px",
  fontSize: 12,
};
const button: React.CSSProperties = {
  ...control,
  cursor: "pointer",
  fontWeight: 700,
};
const action: React.CSSProperties = {
  ...button,
  background: "#006a4e",
  color: "#fff",
  borderColor: "#006a4e",
};
const small: React.CSSProperties = {
  color: "#75877a",
  fontSize: 11,
  lineHeight: 1.7,
};

function csvDownload(filename: string, lines: string[][]) {
  const csv = lines.map((line) =>
    line.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(new Blob(
    ["\uFEFF", csv], { type: "text/csv;charset=utf-8" }
  ));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SelfServiceMISPanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: "en" | "bn";
  roleId?: string;
}) {
  const [data, setData] = useState<Config>(load);
  const [tab, setTab] = useState<"builder" | "reports" | "campaigns" | "audit">("builder");
  const [newMetric, setNewMetric] = useState(metrics[3]);
  const [campaign, setCampaign] = useState({
    audience: "Approved beneficiaries",
    channel: "SMS",
    template: "Approved Bangla notification template",
    state: "draft" as Decision,
    maker: "",
    checker: "",
  });
  const [message, setMessage] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const isMaker = roleId === "admin";
  const isChecker = roleId === "executive";
  const canEdit = isMaker && data.state === "draft";
  const selectedRows = data.division === "All divisions"
    ? rows
    : rows.filter((r) => r.division === data.division);

  function persist(next: Config, label: string) {
    const result: Config = {
      ...next,
      logs: [{
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        actor: roleId,
        action: label,
      }, ...data.logs],
    };
    setData(result);
    localStorage.setItem(KEY, JSON.stringify(result));
    setMessage(label);
  }

  function edit(patch: Partial<Config>) {
    if (!canEdit) return;
    const next = { ...data, ...patch };
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function addWidget() {
    if (!canEdit) return;
    if (data.widgets.some((w) => w.metric === newMetric)) {
      setMessage("This metric is already on the dashboard.");
      return;
    }
    persist({
      ...data,
      widgets: [...data.widgets, {
        id: crypto.randomUUID(), metric: newMetric,
      }],
    }, `Added dashboard metric: ${newMetric}`);
  }

  function moveWidget(index: number, change: number) {
    if (!canEdit) return;
    const target = index + change;
    if (target < 0 || target >= data.widgets.length) return;
    const widgets = [...data.widgets];
    [widgets[index], widgets[target]] = [widgets[target], widgets[index]];
    persist({ ...data, widgets }, "Dashboard layout reordered");
  }

  function submit() {
    if (!isMaker || data.state !== "draft" || !data.widgets.length) return;
    persist({
      ...data, maker: roleId, state: "submitted",
    }, "Dashboard submitted for publishing review");
  }

  function review(approve: boolean) {
    if (!isChecker || data.state !== "submitted" || data.maker === roleId) return;
    persist({
      ...data,
      checker: roleId,
      state: approve ? "approved" : "rejected",
    }, approve ? "Dashboard approved for demo publication"
      : "Dashboard publication rejected");
  }

  function reset() {
    if (!isMaker) return;
    const next = fresh();
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage("Demo dashboard reset");
  }

  function metricValue(metric: string) {
    const key = field[metric];
    if (!key) return 0;
    return selectedRows.reduce(
      (sum, row) => sum + Number(row[key]), 0
    );
  }

  return (
    <div className="ssmis">
      <style>{`
        .ssmis{font-family:Arial,Helvetica,sans-serif;color:#183f2d;min-width:0}
        .ssmis-hero{background:linear-gradient(110deg,#063f31,#007858);
          border-radius:18px;padding:25px;color:white}
        .ssmis-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:17px 0}
        .ssmis-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:15px}
        .ssmis-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
        .ssmis-line{display:flex;align-items:center;justify-content:space-between;
          gap:10px;border-bottom:1px solid #e9f0eb;padding:12px 0;font-size:12px}
        .ssmis-pill{display:inline-block;border-radius:22px;padding:6px 10px;
          font-size:10px;font-weight:800;background:#e5f5eb;color:#08734e}
        .ssmis-table{width:100%;border-collapse:collapse;font-size:12px}
        .ssmis-table th,.ssmis-table td{padding:11px 8px;
          border-bottom:1px solid #e8f0e9;text-align:left}
        .ssmis-table th{font-size:11px;color:#738678}
        @media(max-width:950px){.ssmis-grid{grid-template-columns:1fr}}
        @media(max-width:640px){.ssmis-cards{grid-template-columns:1fr}}
      `}</style>

      <section className="ssmis-hero">
        <div style={{fontSize:11,letterSpacing:1.2,color:"#bce8d5"}}>
          SUBSYSTEM 7 · REPORTING & INTELLIGENCE
        </div>
        <h2 style={{fontSize:"clamp(24px,3vw,34px)",margin:"10px 0"}}>
          {t("Self-Service MIS", "সেলফ-সার্ভিস এমআইএস")}
        </h2>
        <p style={{fontSize:13,color:"#dbf0e4",lineHeight:1.7}}>
          {t(
            "Build governed dashboards, explore aggregated reports and prepare approved communications.",
            "ড্যাশবোর্ড তৈরি, রিপোর্ট বিশ্লেষণ এবং অনুমোদিত বার্তা প্রস্তুত করুন।"
          )}
        </p>
        <div style={{fontSize:10,color:"#bde9d5"}}>
          SYNTHETIC DATA · BROWSER-LOCAL DEMO · NO LIVE BI OR SMS GATEWAY
        </div>
      </section>

      <div className="ssmis-tabs">
        {([
          ["builder","Dashboard Builder","ড্যাশবোর্ড বিল্ডার"],
          ["reports","Report Library","রিপোর্ট লাইব্রেরি"],
          ["campaigns","Campaign Hub","ক্যাম্পেইন হাব"],
          ["audit","Governance & Audit","গভর্নেন্স ও অডিট"],
        ] as const).map(([key,en,bn]) => (
          <button key={key}
            style={tab===key?action:button}
            onClick={()=>setTab(key)}>{t(en,bn)}</button>
        ))}
      </div>

      {message && (
        <div style={{...panel,background:"#eff8f2",marginBottom:14,fontSize:12}}>
          {message}
          <button onClick={()=>setMessage("")}
            style={{...button,float:"right",padding:"3px 8px"}}>×</button>
        </div>
      )}

      {tab==="builder" && (
        <div className="ssmis-grid">
          <section style={panel}>
            <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "No-code Dashboard Builder")}</h3>
            <label style={small}>{ui(lang, "Dashboard title")}</label>
            <input value={data.name}
              disabled={!canEdit}
              onChange={(e)=>edit({name:e.target.value})}
              style={{...control,width:"100%",boxSizing:"border-box",margin:"7px 0 14px"}}
            />
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <select value={newMetric} disabled={!canEdit}
                onChange={(e)=>setNewMetric(e.target.value)}
                style={{...control,flex:1,minWidth:140}}>
                {metrics.map((m)=><option key={m}>{m}</option>)}
              </select>
              <button onClick={addWidget} disabled={!canEdit} style={action}>
                <Plus size={14} style={{verticalAlign:"middle"}}/> Add widget
              </button>
            </div>

            <div style={{marginTop:15}}>
              {data.widgets.map((w,i)=>(
                <div className="ssmis-line" key={w.id}>
                  <div>
                    <b>{w.metric}</b>
                    <div style={small}>{ui(lang, "KPI widget · aggregate data")}</div>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    <button style={{...button,padding:7}}
                      disabled={!canEdit||i===0}
                      onClick={()=>moveWidget(i,-1)} aria-label="Move up">
                      <ChevronUp size={14}/>
                    </button>
                    <button style={{...button,padding:7}}
                      disabled={!canEdit||i===data.widgets.length-1}
                      onClick={()=>moveWidget(i,1)} aria-label="Move down">
                      <ChevronDown size={14}/>
                    </button>
                    <button style={{...button,padding:7}}
                      disabled={!canEdit}
                      onClick={()=>persist({
                        ...data,
                        widgets:data.widgets.filter((x)=>x.id!==w.id),
                      },`Removed widget: ${w.metric}`)}
                      aria-label="Remove widget"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ssmis-line">
              <span>{ui(lang, "Publication status")}</span>
              <span className="ssmis-pill">{data.state}</span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:15}}>
              <button style={action} disabled={!canEdit||!data.widgets.length}
                onClick={submit}>{ui(lang, "Submit for approval")}</button>
              <button style={action}
                disabled={!isChecker||data.state!=="submitted"}
                onClick={()=>review(true)}>{ui(lang, "Approve & publish")}</button>
              <button style={button}
                disabled={!isChecker||data.state!=="submitted"}
                onClick={()=>review(false)}>{ui(lang, "Reject")}</button>
            </div>
          </section>

          <section style={panel}>
            <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Live Demo Preview")}</h3>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <select value={data.division}
                disabled={!canEdit}
                onChange={(e)=>edit({division:e.target.value})}
                style={control}>
                <option value="All divisions">{ui(lang, "All divisions")}</option>
                {rows.map((r)=><option key={r.division}>{r.division}</option>)}
              </select>
              <select value={data.period} disabled={!canEdit}
                onChange={(e)=>edit({period:e.target.value})}
                style={control}>
                <option value="Current cycle">{ui(lang, "Current cycle")}</option>
                <option value="Previous cycle">{ui(lang, "Previous cycle")}</option>
                <option value="Year to date">{ui(lang, "Year to date")}</option>
              </select>
              <select value={data.programme} disabled={!canEdit}
                onChange={(e)=>edit({programme:e.target.value})}
                style={control}>
                <option>MCBP</option>
              </select>
            </div>
            <p style={small}>
              Fictional aggregate data. Time filter is a demonstration
              control; the sample dataset has no historical time series.
            </p>
            <div className="ssmis-cards" style={{marginTop:14}}>
              {data.widgets.map((w)=>(
                <div key={w.id} style={{
                  ...panel,background:"#f0f8f3",
                }}>
                  <BarChart3 size={18} color="#087a54"/>
                  <div style={{fontSize:24,fontWeight:850,marginTop:10}}>
                    {metricValue(w.metric).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}
                  </div>
                  <div style={small}>{w.metric}</div>
                </div>
              ))}
            </div>
            <p style={{...small,marginTop:13}}>
              Small-cell suppression applies to record-level report exports.
              No personal identifiers appear in this preview.
            </p>
          </section>
        </div>
      )}

      {tab==="reports" && (
        <section style={panel}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
            <div>
              <h3 style={{fontSize:16,margin:"0 0 6px"}}>
                Aggregated Report Library
              </h3>
              <div style={small}>
                Division drill-down preview · synthetic records
              </div>
            </div>
            <button style={action} onClick={()=>csvDownload(
              "MCBP-Self-Service-Report.csv",
              [
                ["Division","Applications","Approved","Payments","Pending","Grievances","Training"],
                ...selectedRows.map((r)=>[
                  r.division,String(r.applications),String(r.approved),
                  String(r.paid),String(r.pending),String(r.grievances),
                  String(r.trained),
                ]),
              ]
            )}>
              <Download size={14} style={{verticalAlign:"middle"}}/>
              {" "}Export CSV
            </button>
          </div>
          <div style={{overflowX:"auto",marginTop:15}}>
            <table className="ssmis-table">
              <thead><tr>
                <th>{ui(lang, "Division")}</th><th>{ui(lang, "Applications")}</th><th>{ui(lang, "Approved")}</th>
                <th>{ui(lang, "Payments")}</th><th>{ui(lang, "Pending")}</th><th>{ui(lang, "Grievances")}</th><th>{ui(lang, "Training")}</th>
              </tr></thead>
              <tbody>
                {selectedRows.map((r)=>(
                  <tr key={r.division}>
                    <td><b>{r.division}</b></td>
                    <td>{digits(lang, r.applications)}</td><td>{digits(lang, r.approved)}</td>
                    <td>{digits(lang, r.paid)}</td><td>{digits(lang, r.pending)}</td>
                    <td>{digits(lang, r.grievances)}</td><td>{digits(lang, r.trained)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{...small,marginTop:15}}>
            Standard and ad hoc reports, scheduling, PDF/Excel,
            formulas and union-level drill-down require further
            integration. This screen implements aggregate CSV preview.
          </p>
        </section>
      )}

      {tab==="campaigns" && (
        <div className="ssmis-grid">
          <section style={panel}>
            <h3 style={{fontSize:16,marginTop:0}}>
              <Mail size={18} style={{verticalAlign:"middle"}}/>
              {" "}Campaign Preparation
            </h3>
            <p style={small}>
              Approved templates and audiences only. No SMS or e-mail
              will actually be delivered.
            </p>
            {([
              ["Audience","audience",["Approved beneficiaries","Pending verification officers"]],
              ["Channel","channel",["SMS","Email"]],
              ["Template","template",["Approved Bangla notification template","Approved English notification template"]],
            ] as const).map(([label,key,values])=>(
              <label key={key} style={{...small,display:"block",marginTop:14}}>
                {label}
                <select style={{
                  ...control,display:"block",width:"100%",marginTop:6,
                }} value={campaign[key]}
                  disabled={!isMaker||campaign.state!=="draft"}
                  onChange={(e)=>setCampaign((old)=>({
                    ...old,[key]:e.target.value,
                  }))}>
                  {values.map((v)=><option key={v}>{v}</option>)}
                </select>
              </label>
            ))}
            <button style={{...action,marginTop:18}}
              disabled={!isMaker||campaign.state!=="draft"}
              onClick={()=>{
                setCampaign((c)=>({
                  ...c,state:"submitted",maker:roleId,
                }));
                setMessage("Campaign submitted for approval (demo)");
              }}>
              Submit campaign
            </button>
          </section>
          <section style={panel}>
            <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Campaign Governance")}</h3>
            {[
              ["Audience",campaign.audience],
              ["Delivery channel",campaign.channel],
              ["Approval state",campaign.state],
              ["Delivery report","Not sent · demo only"],
            ].map(([a,b])=>(
              <div className="ssmis-line" key={a}>
                <span>{a}</span><b style={{textAlign:"right"}}>{b}</b>
              </div>
            ))}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16}}>
              <button style={action}
                disabled={!isChecker||campaign.state!=="submitted"}
                onClick={()=>{
                  setCampaign((c)=>({
                    ...c,state:"approved",checker:roleId,
                  }));
                  setMessage("Campaign approved; no messages sent");
                }}>{ui(lang, "Approve")}</button>
              <button style={button}
                disabled={!isChecker||campaign.state!=="submitted"}
                onClick={()=>{
                  setCampaign((c)=>({
                    ...c,state:"rejected",checker:roleId,
                  }));
                  setMessage("Campaign rejected");
                }}>{ui(lang, "Reject")}</button>
            </div>
          </section>
        </div>
      )}

      {tab==="audit" && (
        <div className="ssmis-grid">
          <section style={panel}>
            <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Dashboard Audit Trail")}</h3>
            {!data.logs.length&&<p style={small}>{ui(lang, "No actions recorded yet.")}</p>}
            {data.logs.map((log)=>(
              <div className="ssmis-line" key={log.id}>
                <div>
                  <b>{log.action}</b>
                  <div style={small}>
                    {log.actor} · {new Date(log.time).toLocaleString()}
                  </div>
                </div>
                <CheckCircle2 size={16} color="#087d56"/>
              </div>
            ))}
          </section>
          <section style={panel}>
            <h3 style={{fontSize:16,marginTop:0}}>{ui(lang, "Governance Controls")}</h3>
            {[
              "Tier-2 aggregate data only (simulated)",
              "Small-cell suppression required for detailed reports",
              "Dashboard publishing needs checker approval",
              "No production warehouse or ETL connection",
              "Campaign delivery disabled",
            ].map((name)=>(
              <div className="ssmis-line" key={name}>
                <ShieldCheck size={15} color="#078354"/>
                <span style={{flex:1}}>{name}</span>
              </div>
            ))}
            <button style={{...button,marginTop:17}}
              disabled={!isMaker} onClick={reset}>
              <RotateCcw size={14} style={{verticalAlign:"middle"}}/>
              {" "}Reset dashboard demo
            </button>
          </section>
        </div>
      )}

      <footer style={{...small,textAlign:"center",marginTop:20}}>
        <FileBarChart size={13} style={{verticalAlign:"middle"}}/>
        {" "}Subsystem 7 · Browser-only MIS dashboard prototype
      </footer>
    </div>
  );
}
