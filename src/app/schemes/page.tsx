
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Boxes, CheckCircle2, ChevronDown,
  ClipboardCheck, Code2, Database, Download, FileSpreadsheet,
  GitBranch, Layers3, LockKeyhole, Plus, RotateCcw,
  Save, ShieldCheck, Trash2, Upload, Workflow, XCircle,
} from "lucide-react";

type Tab = "builder" | "workflow" | "bulk" | "registry";
type FieldType = "text" | "number" | "date" | "select" | "checklist" | "calculated";
type State = "draft" | "submitted" | "approved" | "published";
type Item = {
  id: string;
  en: string;
  bn: string;
  type: FieldType;
  required: boolean;
  options: string;
};
type Config = {
  version: number;
  status: State;
  maker: string;
  checker: string;
  environment: string;
  fields: Item[];
  history: string[];
};
type Batch = {
  id: string;
  rows: string[][];
  errors: string[];
  accepted: number;
  state: "validated" | "submitted" | "approved" | "committed";
  maker: string;
  checker: string;
  committedAt?: string;
};

const seedFields: Item[] = [
  { id: "beneficiary_id", en: "Beneficiary ID", bn: "উপকারভোগী আইডি", type: "text", required: true, options: "" },
  { id: "visit_date", en: "Verification Date", bn: "যাচাইয়ের তারিখ", type: "date", required: true, options: "" },
  { id: "household_status", en: "Household Condition", bn: "পরিবারের অবস্থা", type: "select", required: true, options: "Verified,Needs review" },
];

const initial: Config = {
  version: 1, status: "published", maker: "System Seed",
  checker: "System Seed", environment: "Demo production",
  fields: seedFields, history: ["v1: Published fictional field verification form"],
};

const initialFlow = [
  "Draft application", "Identity verification", "Field verification",
  "Officer review", "Approval decision",
];

const inputStyle: React.CSSProperties = {
  border: "1px solid #dce8e0", borderRadius: 9, padding: "11px 12px",
  color: "#174532", background: "#fff", fontSize: 12, width: "100%",
  boxSizing: "border-box",
};
const btn: React.CSSProperties = {
  border: "1px solid #d5e5da", background: "#fff", color: "#14533c",
  borderRadius: 9, padding: "10px 13px", fontWeight: 750,
  fontSize: 12, cursor: "pointer", display: "inline-flex",
  gap: 7, alignItems: "center", justifyContent: "center",
};
const primary: React.CSSProperties = {
  ...btn, background: "#006a4e", color: "#fff", borderColor: "#006a4e",
};
const card: React.CSSProperties = {
  background: "white", border: "1px solid #e1ebe5",
  borderRadius: 17, padding: 20,
  boxShadow: "0 6px 23px rgba(6,59,38,.035)",
};
const small: React.CSSProperties = { color: "#748b7d", fontSize: 11, lineHeight: 1.6 };

function download(filename: string, content: string) {
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const csvQuote = (value: string) => `"${value.replaceAll('"', '""')}"`;

function validateCsv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const rows = lines.slice(1).map((line) => line.split(",").map((v) => v.trim()));
  const errors: string[] = [];
  const header = (lines[0] || "").replace(/^\uFEFF/, "").toLowerCase().replace(/\s/g, "");
  const seen = new Set<string>();

  if (header !== "beneficiary_id,union,action") {
    errors.push("Header must be beneficiary_id,union,action");
  }
  rows.forEach((row, i) => {
    if (row.length !== 3 || row.some((v) => !v)) {
      errors.push(`Row ${i + 2}: missing or invalid columns`);
    }
    if (row[0] && seen.has(row[0])) errors.push(`Row ${i + 2}: duplicate beneficiary ID`);
    if (row[0]) seen.add(row[0]);
    if (row[1] && !["Kaunia Sadar", "Haragach", "Balarhat"].includes(row[1])) {
      errors.push(`Row ${i + 2}: unknown demo union`);
    }
    if (row[2] && !["verify", "review"].includes(row[2])) {
      errors.push(`Row ${i + 2}: action must be verify or review`);
    }
  });
  if (!rows.length) errors.push("No data rows");
  // This simple demo accepts only entirely clean batches.
  return { rows, errors, accepted: errors.length ? 0 : rows.length };
}

export default function ModuleBuilderPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [role, setRole] = useState("admin");
  const [tab, setTab] = useState<Tab>("builder");
  const [config, setConfig] = useState<Config>(initial);
  const [published, setPublished] = useState<Config>(initial);
  const [workflow, setWorkflow] = useState(initialFlow);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [formName, setFormName] = useState("Field Verification Checklist");
  const [en, setEn] = useState("");
  const [bn, setBn] = useState("");
  const [kind, setKind] = useState<FieldType>("checklist");
  const [opts, setOpts] = useState("Yes,No");
  const [required, setRequired] = useState(true);
  const [csv, setCsv] = useState(
    "beneficiary_id,union,action\nBEN-2605-00113,Kaunia Sadar,verify\nBEN-2603-00138,Haragach,review"
  );
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>>({});

  const t = (a: string, b: string) => lang === "bn" ? b : a;
  const isMaker = role === "admin" || role === "uwao";
  const isChecker = role === "executive" || role === "admin";
  const label = (f: Item) => t(f.en, f.bn);

  useEffect(() => {
    try {
      const language = localStorage.getItem("mcbp-lang");
      const actor = localStorage.getItem("mcbp-role");
      const saved = localStorage.getItem("mcbp-ss13-config");
      const live = localStorage.getItem("mcbp-ss13-published");
      const imported = localStorage.getItem("mcbp-ss13-batch");
      const flow = localStorage.getItem("mcbp-ss13-workflow");
      if (language === "bn") setLang("bn");
      if (actor) setRole(actor);
      if (saved) setConfig(JSON.parse(saved) as Config);
      if (live) setPublished(JSON.parse(live) as Config);
      if (imported) setBatch(JSON.parse(imported) as Batch);
      if (flow) setWorkflow(JSON.parse(flow) as string[]);
    } catch {
      // Browser-local fictional demo starts with seeded configuration.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("mcbp-ss13-config", JSON.stringify(config));
    localStorage.setItem("mcbp-ss13-published", JSON.stringify(published));
    localStorage.setItem("mcbp-ss13-batch", JSON.stringify(batch));
    localStorage.setItem("mcbp-ss13-workflow", JSON.stringify(workflow));
  }, [config, published, batch, workflow, ready]);

  function draft(): boolean {
    if (!isMaker) { setToast("Select a Maker role first."); return false; }
    if (config.status === "submitted" || config.status === "approved") {
      setToast("Current version is awaiting review/publishing."); return false;
    }
    if (config.status === "published") {
      setConfig((s) => ({
        ...s, version: s.version + 1, status: "draft",
        maker: role, checker: "",
        history: [`v${s.version + 1}: Draft started by ${role}`, ...s.history],
      }));
    }
    return true;
  }

  function addField() {
    if (!en.trim() || !bn.trim()) {
      setToast("English and Bangla field labels are required."); return;
    }
    if (!draft()) return;
    const newField: Item = {
      id: `field_${Date.now()}`, en: en.trim(), bn: bn.trim(),
      type: kind, required, options: opts,
    };
    setConfig((s) => ({ ...s, fields: [...s.fields, newField] }));
    setEn(""); setBn("");
    setToast("New checklist field added to draft.");
  }

  function changeField(id: string, patch: Partial<Item>) {
    if (!isMaker || config.status !== "draft") return;
    setConfig((s) => ({
      ...s, fields: s.fields.map((f) => f.id === id ? { ...f, ...patch } : f),
    }));
  }

  function removeField(id: string) {
    if (config.status !== "draft" || !isMaker) return;
    setConfig((s) => ({ ...s, fields: s.fields.filter((f) => f.id !== id) }));
  }

  function submitConfig() {
    if (!isMaker || config.status !== "draft") return;
    if (config.fields.some((f) => !f.en.trim() || !f.bn.trim())) {
      setToast("All fields require English and Bangla labels."); return;
    }
    if (new Set(config.fields.map((f) => f.en.toLowerCase())).size !== config.fields.length) {
      setToast("Duplicate field labels are not allowed."); return;
    }
    setConfig((s) => ({
      ...s, status: "submitted", maker: role,
      history: [`v${s.version}: Submitted by ${role}`, ...s.history],
    }));
    setToast("Configuration submitted for independent review.");
  }

  function approveConfig() {
    if (!isChecker || config.status !== "submitted") return;
    if (config.maker === role) {
      setToast("Maker cannot approve their own version. Switch role."); return;
    }
    setConfig((s) => ({
      ...s, status: "approved", checker: role,
      history: [`v${s.version}: Approved by ${role}`, ...s.history],
    }));
    setToast("Checker approval recorded. Ready for demo promotion.");
  }

  function publishConfig() {
    if (!isChecker || config.status !== "approved" || config.checker !== role) return;
    const next: Config = {
      ...config, status: "published",
      history: [`v${config.version}: Promoted to Demo production`, ...config.history],
    };
    setConfig(next); setPublished(next);
    setToast("New version published. Preview reflects live demo configuration.");
  }

  function rollback() {
    if (!isChecker || config.status !== "published") return;
    const restored: Config = {
      ...initial, version: config.version + 1, checker: role,
      history: [`Rollback to original form by ${role}`, ...config.history],
    };
    setConfig(restored); setPublished(restored);
    setToast("Rollback completed in demo. Original checklist restored.");
  }

  function validateBatch() {
    if (!isMaker) { setToast("Maker role required."); return; }
    const result = validateCsv(csv);
    setBatch({
      id: `BULK-${Date.now()}`, ...result,
      state: "validated", maker: role, checker: "",
    });
    setTab("bulk");
    setToast(`${result.accepted} valid rows. ${result.errors.length} validation errors.`);
  }

  function submitBatch() {
    if (!isMaker || batch?.state !== "validated" || batch.errors.length) return;
    setBatch({ ...batch, state: "submitted", maker: role });
    setToast("Batch submitted to checker.");
  }

  function approveBatch() {
    if (!isChecker || !batch || batch.state !== "submitted") return;
    if (batch.maker === role) {
      setToast("Independent checker required."); return;
    }
    setBatch({ ...batch, checker: role, state: "approved" });
    setToast("Batch approved. No records committed yet.");
  }

  function commitBatch() {
    if (!isChecker || !batch || batch.state !== "approved") return;
    setBatch({ ...batch, state: "committed", committedAt: new Date().toISOString() });
    setToast("Simulated commit recorded in the SS13 register.");
  }

  function reverseBatch() {
    if (!isChecker || !batch || batch.state !== "committed") return;
    const age = Date.now() - new Date(batch.committedAt || "").getTime();
    if (age > 7 * 86400000) { setToast("Seven-day demo reversal window expired."); return; }
    setBatch(null);
    setToast("Simulated batch reversed. Existing beneficiary records unchanged.");
  }

  return (
    <div className="ss13">
      <style>{`
        .ss13{min-height:100vh;background:#f4f7f5;color:#183d2e;
          font-family:Arial,Helvetica,sans-serif;padding:24px clamp(12px,3vw,46px)}
        .s13-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px}
        .s13-hero{background:linear-gradient(120deg,#043e30,#007253);
          border-radius:19px;color:white;padding:27px;margin-bottom:15px}
        .s13-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:15px}
        .s13-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}
        .s13-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,1fr);gap:15px}
        .s13-line{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:11px 0;border-bottom:1px solid #e8f0eb}
        .s13-form{display:grid;gap:10px}
        .s13-caption{font-size:11px;color:#728779;line-height:1.7}
        .s13-tag{background:#e8f5ec;color:#076745;border-radius:40px;padding:6px 10px;font-size:10px;font-weight:800}
        .s13-steps{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:16px}
        .s13-node{border:1px solid #cde3d6;background:#f2faf5;border-radius:12px;
          padding:14px 17px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:9px}
        .s13-table{width:100%;border-collapse:collapse;font-size:12px}
        .s13-table td,.s13-table th{padding:11px 9px;border-bottom:1px solid #eaf0eb;text-align:left}
        @media(max-width:920px){.s13-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.s13-kpis{grid-template-columns:repeat(2,1fr)}.ss13{padding:12px}}
      `}</style>
      <header className="s13-top">
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ background: "#006a4e", padding: 11, borderRadius: 12, color: "#fff" }}>
            <Boxes size={23} />
          </span>
          <div>
            <b style={{ fontSize: 18 }}>MCBP-MIS</b>
            <div style={small}>DYNAMIC CONFIGURATION & GOVERNED EXCHANGE</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" style={{ ...btn, textDecoration: "none" }}>
            <ArrowLeft size={14} /> Main System
          </Link>
          <button style={btn} onClick={() => {
            const next = lang === "en" ? "bn" : "en";
            setLang(next); localStorage.setItem("mcbp-lang", next);
          }}>{lang === "en" ? "বাংলা" : "EN"}</button>
        </div>
      </header>
      <section className="s13-hero">
        <div style={{ fontSize: 11, color: "#bee6d3", letterSpacing: 1 }}>
          CONFIGURE · REVIEW · RELEASE · REVERSE
        </div>
        <h1 style={{ fontSize: "clamp(25px,3vw,36px)", margin: "11px 0" }}>
          {t("Module Builder & Bulk Exchange", "মডিউল বিল্ডার ও বাল্ক এক্সচেঞ্জ")}
        </h1>
        <p style={{ color: "#d1eddd", fontSize: 13, lineHeight: 1.7, maxWidth: 720 }}>
          {t(
            "Build bilingual verification forms, review rules and control versioned changes without writing code.",
            "কোড ছাড়াই দ্বিভাষিক ফর্ম তৈরি, নিয়ম যাচাই এবং পরিবর্তন অনুমোদন করুন।"
          )}
        </p>
        <span style={{ fontSize: 10, color: "#c6ead7" }}>
          DEMO CONFIGURATION ONLY · NO LIVE DATA IMPORT OR PRODUCTION RELEASE
        </span>
      </section>

      <div className="s13-kpis">
        {([
          ["Active form version", `v${published.version}`, Layers3],
          ["Form fields", published.fields.length, ClipboardCheck],
          ["Change status", config.status.toUpperCase(), ShieldCheck],
          ["Bulk records", batch?.state === "committed" ? batch.accepted : 0, Database],
        ] as const).map(([name, value, Icon]) => (
          <section style={card} key={name}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={small}>{name}</span><Icon size={18} color="#006a4e" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 850, margin: "13px 0 5px" }}>{value}</div>
            <div style={small}>Fictional configuration register</div>
          </section>
        ))}
      </div>

      <section style={{
        ...card, display: "flex", alignItems: "center",
        flexWrap: "wrap", gap: 10, marginBottom: 15,
      }}>
        <span style={small}>Acting demo role</span>
        <select style={{ ...inputStyle, width: "auto" }} value={role}
          onChange={(e) => {
            setRole(e.target.value);
            localStorage.setItem("mcbp-role", e.target.value);
          }}>
          <option value="admin">System Administrator</option>
          <option value="uwao">UWAO · Form Maker</option>
          <option value="executive">Programme Executive · Checker</option>
          <option value="field">Field Officer · Read only</option>
        </select>
        <span className="s13-tag">{isMaker ? "MAKER AVAILABLE" : isChecker ? "CHECKER AVAILABLE" : "VIEW ONLY"}</span>
        <span style={small}>Environment: Demo production</span>
      </section>

      <div className="s13-tabs">
        {([
          ["builder", "Form Builder", "ফর্ম বিল্ডার"],
          ["workflow", "Workflow & Rules", "ওয়ার্কফ্লো ও নিয়ম"],
          ["bulk", "Bulk CSV Exchange", "বাল্ক সিএসভি"],
          ["registry", "Versions & Governance", "ভার্সন ও গভর্নেন্স"],
        ] as const).map(([id, a, b]) => (
          <button key={id} style={tab === id ? primary : btn} onClick={() => setTab(id)}>
            {t(a, b)}
          </button>
        ))}
      </div>

      {toast && <div style={{
        ...card, marginBottom: 14, background: "#edf8ef", color: "#065b3e",
        fontSize: 12, display: "flex", justifyContent: "space-between", gap: 12,
      }}>
        <span>{toast}</span>
        <button style={{ ...btn, padding: "2px 8px" }} onClick={() => setToast("")}>×</button>
      </div>}

      {tab === "builder" && (
        <div className="s13-grid">
          <section style={card}>
            <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>
              <Code2 size={18} style={{ verticalAlign: "middle" }} /> Bilingual Form Designer
            </h3>
            <p style={small}>{formName} · Draft v{config.version} · {config.status}</p>
            <div className="s13-form">
              <label className="s13-caption">Form name
                <input style={inputStyle} value={formName}
                  onChange={(e) => setFormName(e.target.value)} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label className="s13-caption">English field label
                  <input style={inputStyle} value={en} onChange={(e) => setEn(e.target.value)}
                    placeholder="Household visit confirmed" />
                </label>
                <label className="s13-caption">Bangla field label
                  <input style={inputStyle} value={bn} onChange={(e) => setBn(e.target.value)}
                    placeholder="পরিবার পরিদর্শন নিশ্চিত" />
                </label>
              </div>
              <label className="s13-caption">Input type
                <select style={inputStyle} value={kind} onChange={(e) => setKind(e.target.value as FieldType)}>
                  {(["text", "number", "date", "select", "checklist", "calculated"] as FieldType[])
                    .map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              {(kind === "select" || kind === "checklist") && (
                <label className="s13-caption">Options (comma separated)
                  <input style={inputStyle} value={opts} onChange={(e) => setOpts(e.target.value)} />
                </label>
              )}
              <label style={{ fontSize: 12 }}>
                <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
                {" "}Required field
              </label>
              <button style={primary} disabled={!isMaker || ["submitted", "approved"].includes(config.status)}
                onClick={addField}>
                <Plus size={15} /> Add field to draft
              </button>
            </div>

            <h4 style={{ marginTop: 24 }}>Configuration fields ({config.fields.length})</h4>
            {config.fields.map((f) => (
              <div className="s13-line" key={f.id}>
                <div>
                  <b style={{ fontSize: 12 }}>{label(f)}</b>
                  <div style={small}>{f.type} · {f.required ? "required" : "optional"}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={btn}
                    disabled={!isMaker || config.status !== "draft"}
                    onClick={() => changeField(f.id, { required: !f.required })}>
                    {f.required ? "Optional" : "Require"}
                  </button>
                  <button style={btn}
                    disabled={!isMaker || config.status !== "draft"}
                    onClick={() => removeField(f.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
              <button style={primary} disabled={!isMaker || config.status !== "draft"}
                onClick={submitConfig}><Save size={14} /> Submit for review</button>
              <button style={btn} disabled={!isChecker || config.status !== "submitted"}
                onClick={approveConfig}><CheckCircle2 size={14} /> Checker approve</button>
              <button style={btn} disabled={!isChecker || config.status !== "approved"}
                onClick={publishConfig}>Publish to demo <ArrowRight size={14} /></button>
            </div>
          </section>

          <section style={card}>
            <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>
              <ClipboardCheck size={18} style={{ verticalAlign: "middle" }} />
              {" "}{t("Form Preview", "ফর্ম প্রিভিউ")}
            </h3>
            <p style={small}>Published version v{published.version} · Field verification</p>
            <div className="s13-form" style={{ marginTop: 17 }}>
              {published.fields.map((f) => (
                <label key={f.id} className="s13-caption">
                  {label(f)} {f.required ? "*" : ""}
                  {f.type === "select" || f.type === "checklist" ? (
                    <select style={inputStyle} value={preview[f.id] ?? ""}
                      onChange={(e) => setPreview((s) => ({ ...s, [f.id]: e.target.value }))}>
                      <option value="">Select...</option>
                      {f.options.split(",").map((opt) =>
                        <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input style={inputStyle}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      readOnly={f.type === "calculated"}
                      value={preview[f.id] ?? ""}
                      onChange={(e) => setPreview((s) => ({ ...s, [f.id]: e.target.value }))}
                      placeholder={f.type === "calculated" ? "Calculated (demo)" : "Enter fictional value"}
                    />
                  )}
                </label>
              ))}
              <div style={{ ...small, background: "#f0f8f3", padding: 12, borderRadius: 9 }}>
                <LockKeyhole size={13} style={{ verticalAlign: "middle" }} />
                {" "}Preview only. No beneficiary data is modified.
              </div>
            </div>
          </section>
        </div>
      )}

      {tab === "workflow" && (
        <div className="s13-grid">
          <section style={card}>
            <h3>Approval Workflow Visualisation</h3>
            <p style={small}>Illustrative stage-wise workflow with editable sequence.</p>
            <div className="s13-steps">
              {workflow.map((step, i) => (
                <div key={`${i}-${step}`} className="s13-node">
                  <span style={{
                    background: "#006a4e", color: "#fff", borderRadius: 40,
                    width: 21, height: 21, display: "grid", placeItems: "center",
                  }}>{i + 1}</span>
                  {step}
                  {i < workflow.length - 1 && <ArrowRight size={13} />}
                </div>
              ))}
            </div>
            <button style={btn} disabled={!isMaker || config.status !== "draft"}
              onClick={() => setWorkflow((s) => [...s, `Officer review ${s.length}`])}>
              <Plus size={14} /> Add review stage
            </button>
            <p style={small}>Actual BPMN engine execution is not part of this demo.</p>
          </section>
          <section style={card}>
            <h3>Configuration Registry</h3>
            {["Forms & fields", "Workflow definitions", "Decision/rule tables",
              "KPIs & reporting", "GIS layers", "API mappings", "Bulk templates"]
              .map((item) => (
                <div key={item} className="s13-line">
                  <span style={{ fontSize: 12 }}>{item}</span>
                  <span className="s13-tag">Governed (demo)</span>
                </div>
              ))}
          </section>
        </div>
      )}

      {tab === "bulk" && (
        <div className="s13-grid">
          <section style={card}>
            <h3><FileSpreadsheet size={19} style={{ verticalAlign: "middle" }} /> Governed Bulk Exchange</h3>
            <p style={small}>CSV demo: beneficiary_id,union,action. Allowed unions: Kaunia Sadar, Haragach, Balarhat.</p>
            <button style={btn} onClick={() =>
              download("mcbp-bulk-template.csv",
                "beneficiary_id,union,action\nBEN-2605-00113,Kaunia Sadar,verify\nBEN-2603-00138,Haragach,review")
            }><Download size={14} /> Download template</button>
            <label style={{ ...small, display: "block", margin: "14px 0" }}>
              Upload CSV
              <input type="file" accept=".csv,text/csv" style={{ display: "block", marginTop: 7 }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setCsv(await file.text());
                }} />
            </label>
            <textarea value={csv} onChange={(e) => setCsv(e.target.value)}
              style={{ ...inputStyle, minHeight: 135, fontFamily: "monospace" }} />
            <div style={{ marginTop: 12 }}>
              <button style={primary} disabled={!isMaker}
                onClick={validateBatch}><Upload size={14} /> Validate CSV</button>
            </div>
            {batch && (
              <>
                <div className="s13-line"><span>Batch ID</span><b>{batch.id}</b></div>
                <div className="s13-line"><span>Rows</span><b>{batch.rows.length}</b></div>
                <div className="s13-line"><span>Accepted</span><b>{batch.accepted}</b></div>
                <div className="s13-line"><span>State</span><b>{batch.state}</b></div>
                {batch.errors.length > 0 && (
                  <div style={{ marginTop: 13, background: "#fff3e5", padding: 12, borderRadius: 9 }}>
                    <b style={{ fontSize: 12 }}>Validation exceptions</b>
                    {batch.errors.map((error, i) => (
                      <div key={i} style={{ ...small, color: "#9b5e13", marginTop: 5 }}>{error}</div>
                    ))}
                    <button style={{ ...btn, marginTop: 11 }}
                      onClick={() => download("bulk-errors.csv",
                        ["Error", ...batch.errors.map(csvQuote)].join("\n"))}>
                      <Download size={14} /> Error report
                    </button>
                  </div>
                )}
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 15 }}>
                  <button style={primary} disabled={!isMaker || batch.state !== "validated" || batch.errors.length > 0}
                    onClick={submitBatch}>Maker submit</button>
                  <button style={btn} disabled={!isChecker || batch.state !== "submitted"}
                    onClick={approveBatch}>Checker approve</button>
                  <button style={btn} disabled={!isChecker || batch.state !== "approved"}
                    onClick={commitBatch}>Demo commit</button>
                  <button style={btn} disabled={!isChecker || batch.state !== "committed"}
                    onClick={reverseBatch}><RotateCcw size={14} /> Reverse commit</button>
                </div>
              </>
            )}
          </section>
          <section style={card}>
            <h3>Reconciliation Preview</h3>
            <p style={small}>Only approved, error-free fictional batches may reach simulated commit.</p>
            {batch ? (
              <div style={{ overflowX: "auto" }}>
                <table className="s13-table">
                  <thead><tr><th>Beneficiary</th><th>Union</th><th>Action</th></tr></thead>
                  <tbody>{batch.rows.map((row, i) => (
                    <tr key={i}>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <p style={small}>Validate a batch to inspect mapped rows.</p>}
            <p style={{ ...small, marginTop: 14 }}>
              A simulated commit updates this SS13 register only.
              Real beneficiary, payroll and application stores are untouched.
            </p>
          </section>
        </div>
      )}

      {tab === "registry" && (
        <div className="s13-grid">
          <section style={card}>
            <h3><GitBranch size={19} style={{ verticalAlign: "middle" }} /> Version & Release History</h3>
            <div className="s13-line"><span>Published version</span><b>v{published.version}</b></div>
            <div className="s13-line"><span>Working version</span><b>v{config.version}</b></div>
            <div className="s13-line"><span>State</span><b>{config.status}</b></div>
            <div className="s13-line"><span>Maker</span><b>{config.maker}</b></div>
            <div className="s13-line"><span>Checker</span><b>{config.checker || "Pending"}</b></div>
            <button style={{ ...btn, marginTop: 15 }}
              disabled={!isChecker || config.status !== "published"}
              onClick={rollback}><RotateCcw size={14} /> Roll back to seed form</button>
            <h4>Audit timeline</h4>
            {config.history.map((event, i) => (
              <div key={i} className="s13-line" style={{ fontSize: 12 }}>
                <span>{event}</span>
              </div>
            ))}
          </section>
          <section style={card}>
            <h3>Change Governance</h3>
            {[
              ["Maker–checker", "Independent role needed"],
              ["Form validation", "EN/BN labels and duplicates"],
              ["Version approval", "Before promotion"],
              ["Promotion", "Demo production"],
              ["Rollback", "Restores seed form"],
              ["Bulk exchange", "Clean CSV + checker + commit"],
              ["Reverse window", "Seven-day demo clock"],
            ].map(([name, info]) => (
              <div className="s13-line" key={name}>
                <span style={{ fontSize: 12 }}>{name}</span><b style={small}>{info}</b>
              </div>
            ))}
            <p style={{ ...small, marginTop: 16 }}>
              Production validation, inherited security, environment promotion
              and seven-day rollback mechanisms are illustrated, not deployed.
            </p>
          </section>
        </div>
      )}

      <footer style={{ ...small, textAlign: "center", marginTop: 25 }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
        {" "}MCBP-MIS SS13 · Browser-local governance demonstration · Fictional data
      </footer>
    </div>
  );
}
