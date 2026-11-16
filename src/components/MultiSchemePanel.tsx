
"use client";
import { ui } from "../lib/ui-l10n";

import { useEffect, useState } from "react";
import {
  Check, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCheck, CopyPlus, Download, FileCheck2,
  Layers3, LockKeyhole, RotateCcw,
  ShieldCheck,
} from "lucide-react";

type Lang = "en" | "bn";
type Stage = "draft" | "submitted" | "approved" | "published" | "inactive";
type Scheme = {
  id: string;
  nameEn: string;
  nameBn: string;
  target: string;
  eligibility: string;
  quota: number;
  amount: number;
  frequency: "monthly" | "quarterly" | "once";
  duration: number;
  forms: string[];
  chain: string;
  channel: string;
  permissions: string[];
  reporting: string;
  stage: Stage;
  maker: string;
  checker: string;
  history: string[];
};

const core: Scheme = {
  id: "MCBP",
  nameEn: "Mother and Child Benefit Programme",
  nameBn: "মা ও শিশু ভাতা কর্মসূচি",
  target: "Pregnant women and mothers",
  eligibility: "Approved programme eligibility rules",
  quota: 0,
  amount: 0,
  frequency: "monthly",
  duration: 0,
  forms: ["Registration", "Verification", "Beneficiary profile"],
  chain: "Maker → Checker → Approver",
  channel: "Approved financial partner",
  permissions: ["Application", "Verification", "Payroll"],
  reporting: "Programme monitoring",
  stage: "published",
  maker: "Programme Configuration",
  checker: "Approved",
  history: ["Core scheme preserved as read-only demo reference"],
};

function blankScheme(): Scheme {
  return {
    id: `SCH-${Date.now()}`,
    nameEn: "",
    nameBn: "",
    target: "Vulnerable households",
    eligibility: "Verified identity and approved eligibility checklist",
    quota: 1000,
    amount: 1500,
    frequency: "monthly",
    duration: 12,
    forms: ["Registration", "Verification", "Beneficiary profile"],
    chain: "Maker → Checker → Programme Approval",
    channel: "MFS / Bank (simulation)",
    permissions: ["Application", "Verification", "Payroll"],
    reporting: "Scheme KPI dashboard",
    stage: "draft",
    maker: "",
    checker: "",
    history: [],
  };
}

const steps = [
  ["Scheme identity", "স্কিম পরিচিতি"],
  ["Target group", "লক্ষ্য জনগোষ্ঠী"],
  ["Eligibility", "যোগ্যতার শর্ত"],
  ["Quota & benefits", "কোটা ও ভাতা"],
  ["Forms & workflow", "ফর্ম ও ওয়ার্কফ্লো"],
  ["Payment channels", "পেমেন্ট চ্যানেল"],
  ["Access & reports", "অ্যাক্সেস ও রিপোর্ট"],
  ["Simulate & review", "সিমুলেশন ও অনুমোদন"],
] as const;

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #e1ebe5",
  borderRadius: 18, padding: 21,
  boxShadow: "0 6px 25px rgba(10,61,39,.035)",
};
const button: React.CSSProperties = {
  border: "1px solid #d8e6dc", background: "#fff",
  color: "#14513b", padding: "10px 13px",
  borderRadius: 9, cursor: "pointer",
  fontWeight: 700, fontSize: 12,
};
const primary: React.CSSProperties = {
  ...button, background: "#006a4e",
  borderColor: "#006a4e", color: "#fff",
};
const field: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  border: "1px solid #d8e6dc", background: "#fff",
  borderRadius: 9, padding: "11px 12px",
  fontSize: 12, color: "#174632",
};
const muted: React.CSSProperties = {
  fontSize: 11, color: "#748679", lineHeight: 1.7,
};

const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency", currency: "BDT",
    maximumFractionDigits: 0,
  }).format(n);

function csvExport(items: Scheme[]) {
  const header = "ID,Scheme,Status,Quota,Amount,Frequency,Duration";
  const lines = items.map((s) =>
    [
      s.id, s.nameEn, s.stage, s.quota,
      s.amount, s.frequency, s.duration,
    ].map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")
  );
  const blob = new Blob(
    ["\uFEFF", [header, ...lines].join("\r\n")],
    { type: "text/csv;charset=utf-8" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "MCBP-Scheme-Catalogue.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function MultiSchemePanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: Lang;
  roleId?: string;
}) {
  const [schemes, setSchemes] = useState<Scheme[]>([core]);
  const [selected, setSelected] = useState("MCBP");
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [cohort, setCohort] = useState(250);
  const [activeScheme, setActiveScheme] = useState("MCBP");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const scheme = schemes.find((s) => s.id === selected) ?? core;

  const maker = roleId === "admin" || roleId === "uwao";
  const checker = roleId === "executive";
  const editable = scheme.id !== "MCBP" && scheme.stage === "draft" && maker;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mcbp-scheme-catalogue");
      const active = localStorage.getItem("mcbp-active-scheme");
      if (stored) {
        const data: unknown = JSON.parse(stored);
        if (Array.isArray(data)) {
          const custom = (data as Scheme[]).filter(
            (s) => s.id !== "MCBP"
          );
          setSchemes([core, ...custom]);
        }
      }
      if (active) setActiveScheme(active);
    } catch {
      // Start with the protected MCBP scheme.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("mcbp-scheme-catalogue", JSON.stringify(schemes));
  }, [schemes, loaded]);

  function patch(changes: Partial<Scheme>) {
    if (!editable) return;
    setSchemes((all) => all.map((s) =>
      s.id === selected ? { ...s, ...changes } : s
    ));
  }

  function create() {
    if (!maker) {
      setNotice("Select System Administrator or UWAO to create a scheme.");
      return;
    }
    const next = blankScheme();
    next.maker = roleId;
    next.history = [`Draft created by ${roleId}`];
    setSchemes((all) => [...all, next]);
    setSelected(next.id);
    setStep(0);
    setNotice("New independent scheme draft created.");
  }

  function submit() {
    if (!editable) return;
    if (!scheme.nameEn.trim() || !scheme.nameBn.trim()) {
      setNotice("Both English and Bangla scheme names are required.");
      setStep(0);
      return;
    }
    if (!scheme.target.trim() || !scheme.eligibility.trim()) {
      setNotice("Target group and eligibility are required.");
      return;
    }
    if (scheme.quota < 1 || scheme.amount <= 0 || scheme.duration < 1) {
      setNotice("Quota, amount and duration must be positive.");
      setStep(3);
      return;
    }
    if (!scheme.forms.length || !scheme.permissions.length) {
      setNotice("Select at least one form and permission.");
      return;
    }
    setSchemes((all) => all.map((s) =>
      s.id === selected
        ? {
            ...s, stage: "submitted",
            maker: roleId,
            history: [`Submitted by ${roleId}`, ...s.history],
          }
        : s
    ));
    setNotice("Submitted. An independent checker must review this scheme.");
  }

  function changeStatus(next: Stage) {
    if (scheme.id === "MCBP") return;
    if (!checker) {
      setNotice("Programme Executive checker role required.");
      return;
    }
    if (
      (next === "approved" && scheme.stage !== "submitted") ||
      (next === "published" && scheme.stage !== "approved") ||
      (next === "inactive" && scheme.stage !== "published")
    ) {
      setNotice("Action is not available in the current state.");
      return;
    }
    if (scheme.maker === roleId) {
      setNotice("Maker and checker must be different officers.");
      return;
    }
    const history = `${next.toUpperCase()} by ${roleId}`;
    setSchemes((all) => all.map((s) =>
      s.id === selected
        ? {
            ...s, stage: next, checker: roleId,
            history: [history, ...s.history],
          }
        : s
    ));
    if (next === "inactive" && activeScheme === selected) {
      setActiveScheme("MCBP");
      localStorage.setItem("mcbp-active-scheme", "MCBP");
    }
    setNotice(`Scheme ${next} in fictional catalogue.`);
  }

  function restoreDraft() {
    if (scheme.id === "MCBP" || !checker) return;
    if (!["submitted", "approved", "published", "inactive"].includes(scheme.stage)) return;
    setSchemes((all) => all.map((s) =>
      s.id === selected
        ? {
            ...s, stage: "draft", checker: "",
            maker: "admin",
            history: ["Rolled back to draft for correction", ...s.history],
          }
        : s
    ));
    if (activeScheme === selected) {
      setActiveScheme("MCBP");
      localStorage.setItem("mcbp-active-scheme", "MCBP");
    }
    setNotice("Scheme returned to a draft; MCBP data is unchanged.");
  }

  function selectLive(id: string) {
    const target = schemes.find((s) => s.id === id);
    if (!target || target.stage !== "published") return;
    setActiveScheme(id);
    localStorage.setItem("mcbp-active-scheme", id);
    setNotice(`Active catalogue context: ${target.nameEn}. No financial data changed.`);
  }

  const annualMultiplier =
    scheme.frequency === "monthly" ? 12 :
    scheme.frequency === "quarterly" ? 4 : 1;
  const totalCycles =
    scheme.frequency === "monthly" ? scheme.duration :
    scheme.frequency === "quarterly" ? Math.ceil(scheme.duration / 3) : 1;
  const sampleCount = Math.min(cohort, Math.max(scheme.quota, 0));
  const projectedTotal = sampleCount * scheme.amount * totalCycles;
  const fullCost = scheme.quota * scheme.amount * totalCycles;

  const active = schemes.filter((s) => s.stage === "published").length;
  const pending = schemes.filter((s) => s.stage === "submitted").length;

  return (
    <div className="ms14">
      <style>{`
        .ms14{color:#1b4031;font-family:Arial,Helvetica,sans-serif}
        .ms14-hero{padding:27px;border-radius:18px;color:#fff;
          background:linear-gradient(112deg,#043c30,#007254);margin-bottom:16px}
        .ms14-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:15px}
        .ms14-grid{display:grid;grid-template-columns:minmax(250px,.8fr) minmax(0,1.5fr);gap:15px}
        .ms14-item{border:1px solid #e3ece6;border-radius:11px;background:white;
          padding:13px;text-align:left;cursor:pointer;width:100%;display:grid;gap:6px}
        .ms14-item.selected{border-color:#006a4e;background:#f0f9f3}
        .ms14-stepper{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:16px 0}
        .ms14-step{border:1px solid #dde8df;border-radius:10px;padding:9px;
          background:#fff;color:#587266;cursor:pointer;font-size:11px;text-align:left}
        .ms14-step.current{background:#e9f6ee;color:#006a4e;border-color:#66aa89;font-weight:800}
        .ms14-fields{display:grid;gap:12px;margin-top:15px}
        .ms14-label{font-size:11px;color:#6a8072;display:grid;gap:6px}
        .ms14-row{display:flex;align-items:center;justify-content:space-between;gap:12px;
          padding:11px 0;border-bottom:1px solid #edf2ee;font-size:12px}
        .ms14-pill{border-radius:20px;padding:5px 9px;font-size:10px;font-weight:800;
          background:#e8f5ed;color:#08734d}
        @media(max-width:960px){.ms14-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.ms14-kpis{grid-template-columns:repeat(2,1fr)}
          .ms14-stepper{grid-template-columns:repeat(2,1fr)}}
      `}</style>

      <section className="ms14-hero">
        <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#b9e6d1" }}>
          SUBSYSTEM 14 · MULTI-SCHEME EXTENSIBILITY
        </div>
        <h2 style={{ fontSize: "clamp(23px,3vw,33px)", margin: "11px 0" }}>
          {t("Build a New Social Protection Scheme", "নতুন সামাজিক সুরক্ষা স্কিম তৈরি")}
        </h2>
        <p style={{ fontSize: 13, color: "#d3ecdf", lineHeight: 1.7, maxWidth: 750 }}>
          {t(
            "Configure programmes with an eight-step wizard, simulate beneficiary costs and launch only after independent approval.",
            "আট ধাপে নতুন স্কিম, উপকারভোগীর ব্যয় সিমুলেশন এবং স্বাধীন অনুমোদনের পর প্রকাশ করুন।"
          )}
        </p>
        <div style={{ fontSize: 10, color: "#b9e6d1" }}>
          FICTIONAL DATA · NO LIVE SCHEME OR PAYMENT CREATED
        </div>
      </section>

      <div className="ms14-kpis">
        {[
          ["Catalogue schemes", schemes.length, Layers3],
          ["Published schemes", active, CheckCircle2],
          ["Awaiting checker", pending, ClipboardCheck],
          ["Shared modules", 6, ShieldCheck],
        ].map(([text, value, Icon]) => {
          const Symbol = Icon as typeof Layers3;
          return (
            <section key={String(text)} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={muted}>{text as string}</span>
                <Symbol size={18} color="#007452" />
              </div>
              <div style={{ fontSize: 27, fontWeight: 850, margin: "12px 0 4px" }}>
                {value as number}
              </div>
              <div style={muted}>{ui(lang, "Scheme configuration demo")}</div>
            </section>
          );
        })}
      </div>

      {notice && (
        <section style={{
          ...card, marginBottom: 14, background: "#edf8f0",
          color: "#096644", display: "flex", justifyContent: "space-between",
          gap: 10, fontSize: 12,
        }}>
          {notice}
          <button style={{ ...button, padding: "2px 8px" }}
            onClick={() => setNotice("")}>×</button>
        </section>
      )}

      <div className="ms14-grid">
        <aside style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <section style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <h3 style={{ fontSize: 15, margin: 0 }}>{ui(lang, "Scheme Catalogue")}</h3>
              <button style={primary} onClick={create} disabled={!maker}>
                <CopyPlus size={14} style={{ verticalAlign: "middle" }} />
                {" "}New
              </button>
            </div>
            <p style={muted}>{ui(lang, "MCBP core is protected. New schemes remain independent.")}</p>
            <div style={{ display: "grid", gap: 8 }}>
              {schemes.map((s) => (
                <button
                  className={`ms14-item ${selected === s.id ? "selected" : ""}`}
                  key={s.id}
                  onClick={() => { setSelected(s.id); setStep(0); }}
                >
                  <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                    <b style={{ fontSize: 12 }}>
                      {t(s.nameEn || "Untitled scheme", s.nameBn || "নামহীন স্কিম")}
                    </b>
                    <span className="ms14-pill">{s.stage}</span>
                  </div>
                  <span style={muted}>{s.id} · {s.target}</span>
                </button>
              ))}
            </div>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 14, margin: "0 0 13px" }}>
              Active Scheme Context
            </h3>
            <select
              style={field}
              value={activeScheme}
              onChange={(e) => selectLive(e.target.value)}
            >
              {schemes.filter((s) => s.stage === "published").map((s) => (
                <option key={s.id} value={s.id}>{s.nameEn}</option>
              ))}
            </select>
            <p style={muted}>
              Published schemes become selectable in this catalogue.
              Existing MCBP records and payment calculations remain unchanged.
            </p>
            <button style={button} onClick={() => csvExport(schemes)}>
              <Download size={14} style={{ verticalAlign: "middle" }} />
              {" "}Export catalogue
            </button>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 14, margin: "0 0 11px" }}>{ui(lang, "Shared Core Services")}</h3>
            {[
              "Identity verification", "Beneficiary profiles",
              "Payment orchestration", "Grievance handling",
              "Secure data exchange", "Security and audit",
            ].map((item) => (
              <div className="ms14-row" key={item}>
                <span>{item}</span>
                <Check size={15} color="#0a855b" />
              </div>
            ))}
            <p style={muted}>
              Shared-service reuse is shown as a configuration blueprint;
              no production integrations are activated.
            </p>
          </section>
        </aside>

        <div style={{ display: "grid", gap: 15, alignContent: "start" }}>
          <section style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 17, margin: "0 0 4px" }}>
                  Eight-Step Scheme Wizard
                </h3>
                <div style={muted}>
                  {scheme.id} · {scheme.stage} ·
                  {" "}{roleId === "executive" ? "Checker role" : roleId === "admin" || roleId === "uwao" ? "Maker role" : "View only"}
                </div>
              </div>
              <span className="ms14-pill">
                {step + 1} / {steps.length}
              </span>
            </div>

            <div className="ms14-stepper">
              {steps.map(([en, bn], i) => (
                <button
                  className={`ms14-step ${step === i ? "current" : ""}`}
                  key={en}
                  onClick={() => setStep(i)}
                >
                  <b style={{ marginRight: 5 }}>{i + 1}.</b>
                  {t(en, bn)}
                </button>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #e8f0e9", paddingTop: 16 }}>
              <h3 style={{ fontSize: 17, margin: "0 0 4px" }}>
                {t(steps[step][0], steps[step][1])}
              </h3>
              <p style={muted}>
                {scheme.id === "MCBP"
                  ? "Core programme is read-only. Create a new scheme to edit."
                  : editable
                    ? "Configure this step and continue. Changes save automatically."
                    : "Read-only review of the current configuration."}
              </p>

              <div className="ms14-fields">
                {step === 0 && (
                  <>
                    <label className="ms14-label">
                      Scheme name (English)
                      <input style={field} disabled={!editable} value={scheme.nameEn}
                        onChange={(e) => patch({ nameEn: e.target.value })}
                        placeholder="Example: New Family Support Scheme" />
                    </label>
                    <label className="ms14-label">
                      স্কিমের নাম (বাংলা)
                      <input style={field} disabled={!editable} value={scheme.nameBn}
                        onChange={(e) => patch({ nameBn: e.target.value })}
                        placeholder="নতুন পরিবার সহায়তা স্কিম" />
                    </label>
                    <div style={muted}>Separate scheme ID: {scheme.id}</div>
                  </>
                )}

                {step === 1 && (
                  <label className="ms14-label">
                    Target population
                    <select style={field} disabled={!editable} value={scheme.target}
                      onChange={(e) => patch({ target: e.target.value })}>
                      <option value="Vulnerable households">{ui(lang, "Vulnerable households")}</option>
                      <option value="Pregnant women and mothers">{ui(lang, "Pregnant women and mothers")}</option>
                      <option value="Adolescent girls">{ui(lang, "Adolescent girls")}</option>
                      <option value="Low-income families">{ui(lang, "Low-income families")}</option>
                      <option value="Persons requiring social assistance">{ui(lang, "Persons requiring social assistance")}</option>
                    </select>
                  </label>
                )}

                {step === 2 && (
                  <label className="ms14-label">
                    Eligibility rule description
                    <textarea style={{ ...field, minHeight: 120 }}
                      disabled={!editable}
                      value={scheme.eligibility}
                      onChange={(e) => patch({ eligibility: e.target.value })}
                    />
                    <span style={muted}>
                      Example: Age, household verification and approved inclusion rules.
                      These rules are descriptive, not automatically executed.
                    </span>
                  </label>
                )}

                {step === 3 && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <label className="ms14-label">
                        Beneficiary quota
                        <input type="number" min={1} style={field}
                          disabled={!editable} value={scheme.quota}
                          onChange={(e) => patch({ quota: Number(e.target.value) })} />
                      </label>
                      <label className="ms14-label">
                        Benefit amount (BDT)
                        <input type="number" min={1} style={field}
                          disabled={!editable} value={scheme.amount}
                          onChange={(e) => patch({ amount: Number(e.target.value) })} />
                      </label>
                    </div>
                    <label className="ms14-label">
                      Payment frequency
                      <select style={field} disabled={!editable}
                        value={scheme.frequency}
                        onChange={(e) => patch({ frequency: e.target.value as Scheme["frequency"] })}>
                        <option value="monthly">{ui(lang, "Monthly")}</option>
                        <option value="quarterly">{ui(lang, "Quarterly")}</option>
                        <option value="once">{ui(lang, "One-time")}</option>
                      </select>
                    </label>
                    <label className="ms14-label">
                      Duration (months)
                      <input type="number" min={1} style={field} disabled={!editable}
                        value={scheme.duration}
                        onChange={(e) => patch({ duration: Number(e.target.value) })} />
                    </label>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div style={muted}>{ui(lang, "Enable reusable forms")}</div>
                    {[
                      "Registration", "Verification", "Beneficiary profile",
                      "Training", "Grievance intake",
                    ].map((name) => (
                      <label key={name} style={{ fontSize: 12, display: "flex", gap: 10, alignItems: "center" }}>
                        <input type="checkbox" disabled={!editable}
                          checked={scheme.forms.includes(name)}
                          onChange={(e) => patch({
                            forms: e.target.checked
                              ? [...scheme.forms, name]
                              : scheme.forms.filter((x) => x !== name),
                          })} />
                        {name}
                      </label>
                    ))}
                    <label className="ms14-label">
                      Approval chain
                      <input style={field} disabled={!editable}
                        value={scheme.chain}
                        onChange={(e) => patch({ chain: e.target.value })} />
                    </label>
                  </>
                )}

                {step === 5 && (
                  <>
                    <label className="ms14-label">
                      Payment routing option (mock)
                      <select style={field} disabled={!editable}
                        value={scheme.channel}
                        onChange={(e) => patch({ channel: e.target.value })}>
                        <option value="MFS / Bank (simulation)">{ui(lang, "MFS / Bank (simulation)")}</option>
                        <option value="Approved MFS provider (simulation)">{ui(lang, "Approved MFS provider (simulation)")}</option>
                        <option value="Approved bank account (simulation)">{ui(lang, "Approved bank account (simulation)")}</option>
                        <option value="Manual disbursement coordination (simulation)">{ui(lang, "Manual disbursement coordination (simulation)")}</option>
                        <option value="Approved financial partner">{ui(lang, "Approved financial partner")}</option>
                      </select>
                    </label>
                    <div style={{
                      background: "#f0f7f2", padding: 14,
                      borderRadius: 10, ...muted,
                    }}>
                      <LockKeyhole size={14} style={{ verticalAlign: "middle" }} />
                      {" "}This configuration cannot initiate or approve real payments.
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
                    <div style={muted}>{ui(lang, "Scheme roles and permissions")}</div>
                    {[
                      "Application", "Verification", "Payroll",
                      "Training", "Grievance", "Reporting",
                    ].map((name) => (
                      <label key={name} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                        <input type="checkbox" disabled={!editable}
                          checked={scheme.permissions.includes(name)}
                          onChange={(e) => patch({
                            permissions: e.target.checked
                              ? [...scheme.permissions, name]
                              : scheme.permissions.filter((x) => x !== name),
                          })} />
                        {name}
                      </label>
                    ))}
                    <label className="ms14-label">
                      Reporting configuration
                      <input style={field} disabled={!editable}
                        value={scheme.reporting}
                        onChange={(e) => patch({ reporting: e.target.value })} />
                    </label>
                  </>
                )}

                {step === 7 && (
                  <>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                      gap: 10,
                    }}>
                      {[
                        ["Full quota", String(scheme.quota)],
                        ["Payment cycles", String(totalCycles)],
                        ["Full scheme cost", formatMoney(fullCost)],
                        ["Frequency", scheme.frequency],
                      ].map(([name, value]) => (
                        <div key={name} style={{
                          padding: 13, borderRadius: 10,
                          background: "#f4f8f5",
                        }}>
                          <div style={muted}>{name}</div>
                          <b style={{ fontSize: 16 }}>{value}</b>
                        </div>
                      ))}
                    </div>
                    <label className="ms14-label">
                      Sample test cohort (fictional persons)
                      <input type="number" min={0} max={Math.max(0, scheme.quota)}
                        style={field} value={cohort}
                        onChange={(e) => setCohort(Math.max(0, Number(e.target.value)))} />
                    </label>
                    <div style={{
                      background: "#e9f6ed", color: "#075d41",
                      borderRadius: 12, padding: 17,
                    }}>
                      <div style={{ fontSize: 11 }}>{ui(lang, "Deterministic projected sample cost")}</div>
                      <div style={{ fontSize: 27, fontWeight: 850, margin: "7px 0" }}>
                        {formatMoney(projectedTotal)}
                      </div>
                      <div style={{ fontSize: 11 }}>
                        {sampleCount} beneficiaries × {formatMoney(scheme.amount)} × {totalCycles} payments
                      </div>
                    </div>
                    <p style={muted}>
                      This is an arithmetic simulation, not an eligibility decision
                      or government financial commitment. Annualised periods:
                      {` ${annualMultiplier}`} payments per 12 months.
                    </p>

                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 8,
                    }}>
                      {scheme.stage === "draft" && (
                        <button style={primary} disabled={!editable} onClick={submit}>
                          <ClipboardCheck size={14} style={{ verticalAlign: "middle" }} />
                          {" "}Maker submit
                        </button>
                      )}
                      {scheme.stage === "submitted" && (
                        <button style={primary} disabled={!checker}
                          onClick={() => changeStatus("approved")}>
                          <ShieldCheck size={14} style={{ verticalAlign: "middle" }} />
                          {" "}Checker approve
                        </button>
                      )}
                      {scheme.stage === "approved" && (
                        <button style={primary} disabled={!checker}
                          onClick={() => changeStatus("published")}>
                          <CheckCircle2 size={14} style={{ verticalAlign: "middle" }} />
                          {" "}Publish scheme
                        </button>
                      )}
                      {scheme.stage === "published" && scheme.id !== "MCBP" && (
                        <button style={button} disabled={!checker}
                          onClick={() => changeStatus("inactive")}>
                          Deactivate
                        </button>
                      )}
                      {scheme.id !== "MCBP" && scheme.stage !== "draft" && (
                        <button style={button} disabled={!checker}
                          onClick={restoreDraft}>
                          <RotateCcw size={14} style={{ verticalAlign: "middle" }} />
                          {" "}Rollback to draft
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              gap: 10, marginTop: 23,
            }}>
              <button style={button} disabled={step === 0}
                onClick={() => setStep((x) => Math.max(0, x - 1))}>
                <ChevronLeft size={14} style={{ verticalAlign: "middle" }} />
                {" "}Previous
              </button>
              {step < 7 ? (
                <button style={primary}
                  onClick={() => setStep((x) => Math.min(7, x + 1))}>
                  Next step <ChevronRight size={14} style={{ verticalAlign: "middle" }} />
                </button>
              ) : (
                <span style={muted}>{ui(lang, "End of 8-step configuration")}</span>
              )}
            </div>
          </section>

          <section style={card}>
            <h3 style={{ marginTop: 0, fontSize: 15 }}>
              <FileCheck2 size={18} style={{ verticalAlign: "middle" }} />
              {" "}Approval & Audit History
            </h3>
            {scheme.history.map((event, i) => (
              <div className="ms14-row" key={`${i}-${event}`}>
                <span>{event}</span>
                <CheckCircle2 size={15} color="#058c61" />
              </div>
            ))}
            <p style={{ ...muted, marginTop: 13 }}>
              No actual government services or beneficiary records are
              modified by scheme creation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
