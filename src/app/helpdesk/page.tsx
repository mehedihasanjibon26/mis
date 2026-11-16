
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowLeft, BellRing, BookOpen, CheckCircle2,
  ChevronRight, ClipboardList, Clock3, Download,
  Headphones, HeartPulse, MessageSquare, PhoneCall,
  Plus, Search, ShieldCheck, Ticket, UserRound,
  XCircle,
} from "lucide-react";

type Tab = "desk" | "tickets" | "referrals" | "knowledge";
type Severity = "normal" | "high" | "critical";
type State = "open" | "assigned" | "in_progress" | "resolved" | "closed";
type RefState = "sent" | "accepted" | "service_delivered" | "closed";

type Caller = {
  id: string;
  name: string;
  phone: string;
  area: string;
  status: string;
};

type Case = {
  id: string;
  callerId: string;
  subject: string;
  category: string;
  severity: Severity;
  status: State;
  channel: string;
  owner: string;
  note: string;
  created: string;
  history: string[];
};

type Referral = {
  id: string;
  caseId: string;
  service: string;
  provider: string;
  status: RefState;
  outcome: string;
};

const callers: Caller[] = [
  {
    id: "BEN-2605-00113", name: "Ayesha Begum",
    phone: "01XXXXXXXX1", area: "Kaunia Sadar",
    status: "Active beneficiary",
  },
  {
    id: "BEN-2603-00138", name: "Rahima Khatun",
    phone: "01XXXXXXXX2", area: "Haragach",
    status: "Payment follow-up",
  },
  {
    id: "BEN-2508-00184", name: "Salma Akter",
    phone: "01XXXXXXXX3", area: "Balarhat",
    status: "Active beneficiary",
  },
];

const initialCases: Case[] = [
  {
    id: "HD-2611-0001",
    callerId: callers[1].id,
    subject: "Wallet payment not received",
    category: "Payment support",
    severity: "high",
    status: "in_progress",
    channel: "Helpline · mock IVR",
    owner: "Finance Helpdesk",
    note: "Check bounced wallet and advise next steps.",
    created: "2026-11-16T04:00:00.000Z",
    history: ["Mock inbound call", "Ticket created", "Assigned to Finance Helpdesk"],
  },
  {
    id: "HD-2611-0002",
    callerId: callers[0].id,
    subject: "Maternal health referral request",
    category: "Health & nutrition",
    severity: "normal",
    status: "open",
    channel: "UDC assisted",
    owner: "Support Desk",
    note: "Refer beneficiary to local health facility.",
    created: "2026-11-16T05:00:00.000Z",
    history: ["UDC contact", "Ticket created"],
  },
];

const initialReferrals: Referral[] = [
  {
    id: "REF-2611-001",
    caseId: "HD-2611-0002",
    service: "Maternal health consultation",
    provider: "Kaunia Upazila Health Complex (demo)",
    status: "sent",
    outcome: "",
  },
];

const knowledge = [
  {
    category: "Payment support",
    title: "Payment not received",
    answer: "Confirm the beneficiary and payment reference. Check the finance queue and raise a follow-up ticket. Never promise a transfer before finance confirmation.",
  },
  {
    category: "Health & nutrition",
    title: "Maternal health referral",
    answer: "Log the health concern, select the requested service, create a referral and record provider acceptance and service outcome.",
  },
  {
    category: "Registration",
    title: "Application status enquiry",
    answer: "Verify the caller's reference and consult the application workflow. Pending identity verification should be referred to the responsible officer.",
  },
  {
    category: "System support",
    title: "Officer unable to access MIS",
    answer: "Record the device and role details in a helpdesk ticket. Escalate privileged access problems to the administrator.",
  },
];

const box: React.CSSProperties = {
  background: "#fff",
  padding: 20,
  border: "1px solid #dce8e0",
  borderRadius: 17,
  boxShadow: "0 6px 24px rgba(17,60,38,.035)",
};

const button: React.CSSProperties = {
  border: "1px solid #d9e6dd",
  background: "#fff",
  color: "#16533c",
  borderRadius: 9,
  padding: "10px 13px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};

const primary: React.CSSProperties = {
  ...button,
  background: "#006a4e",
  color: "#fff",
  borderColor: "#006a4e",
};

const field: React.CSSProperties = {
  ...button,
  textAlign: "left",
  fontWeight: 400,
  width: "100%",
  boxSizing: "border-box",
};

const muted: React.CSSProperties = {
  color: "#788a7e",
  fontSize: 11,
  lineHeight: 1.6,
};

function csvDownload(rows: string[][]) {
  const content = rows.map((row) =>
    row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");

  const url = URL.createObjectURL(
    new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "MCBP-Helpdesk-Demo.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function slaFor(severity: Severity) {
  if (severity === "critical") {
    return "15 min acknowledgement · 4 h workaround · 8 h target";
  }
  return severity === "high"
    ? "Priority support · escalation required"
    : "Standard support queue";
}

export default function HelpdeskPage() {
  const [tab, setTab] = useState<Tab>("desk");
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [role, setRole] = useState("admin");
  const [callId, setCallId] = useState(callers[1].id);
  const [ringing, setRinging] = useState(false);
  const [activeCall, setActiveCall] = useState(false);
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [selectedCase, setSelectedCase] = useState("HD-2611-0001");
  const [subject, setSubject] = useState("Payment status enquiry");
  const [category, setCategory] = useState("Payment support");
  const [severity, setSeverity] = useState<Severity>("normal");
  const [description, setDescription] = useState("");
  const [service, setService] = useState("Maternal health consultation");
  const [provider, setProvider] = useState("Kaunia Upazila Health Complex (demo)");
  const [feedback, setFeedback] = useState("");
  const [kbSearch, setKbSearch] = useState("");
  const [ready, setReady] = useState(false);

  const t = (en: string, bn: string) => language === "bn" ? bn : en;

  useEffect(() => {
    try {
      const lang = localStorage.getItem("mcbp-lang");
      const savedRole = localStorage.getItem("mcbp-role");
      const savedCases = localStorage.getItem("mcbp-helpdesk-cases");
      const savedReferrals = localStorage.getItem("mcbp-helpdesk-referrals");
      if (lang === "bn") setLanguage("bn");
      if (savedRole) setRole(savedRole);
      if (savedCases) {
        const data: unknown = JSON.parse(savedCases);
        if (Array.isArray(data)) setCases(data as Case[]);
      }
      if (savedReferrals) {
        const data: unknown = JSON.parse(savedReferrals);
        if (Array.isArray(data)) setReferrals(data as Referral[]);
      }
    } catch {
      // Use fictional starter data.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("mcbp-helpdesk-cases", JSON.stringify(cases));
    localStorage.setItem("mcbp-helpdesk-referrals", JSON.stringify(referrals));
  }, [cases, referrals, ready]);

  const caller = callers.find((c) => c.id === callId) ?? callers[0];
  const currentCase = cases.find((c) => c.id === selectedCase);
  const writable = ["admin", "uwao", "grm", "executive"].includes(role);

  const openCount = cases.filter(
    (c) => !["resolved", "closed"].includes(c.status)
  ).length;

  const pendingReferrals = referrals.filter(
    (r) => r.status !== "closed"
  ).length;

  function incomingCall(id: string) {
    setCallId(id);
    setRinging(true);
    setActiveCall(false);
    setFeedback("");
    setTab("desk");
  }

  function createTicket() {
    if (!writable) {
      setFeedback("This demo role cannot create support tickets.");
      return;
    }
    if (!subject.trim()) {
      setFeedback("Enter a ticket subject.");
      return;
    }

    const item: Case = {
      id: `HD-${Date.now()}`,
      callerId: callId,
      subject: subject.trim(),
      category,
      severity,
      status: "open",
      channel: activeCall ? "Mock helpline / IVR" : "Web / assisted",
      owner: "Support Desk",
      note: description.trim(),
      created: new Date().toISOString(),
      history: [
        activeCall ? "Caller matched through mock CTI" : "Manual intake",
        "Ticket created and logged",
        "Notification preview generated (not sent)",
      ],
    };

    setCases((all) => [item, ...all]);
    setSelectedCase(item.id);
    setActiveCall(false);
    setRinging(false);
    setDescription("");
    setTab("tickets");
    setFeedback(`Ticket ${item.id} created. SMS notification preview only.`);
  }

  function updateCase(next: State) {
    if (!writable || !currentCase) {
      setFeedback("This role cannot update the selected ticket.");
      return;
    }

    setCases((all) => all.map((c) =>
      c.id === selectedCase
        ? {
            ...c,
            status: next,
            owner: next === "assigned" ? "Specialist Helpdesk" : c.owner,
            history: [
              ...c.history,
              `${new Date().toLocaleString()}: ${next} by ${role}`,
            ],
          }
        : c
    ));
    setFeedback(`Ticket moved to ${next}.`);
  }

  function createReferral() {
    if (!writable || !currentCase) {
      setFeedback("Select a ticket and a permitted demo role.");
      return;
    }

    const item: Referral = {
      id: `REF-${Date.now()}`,
      caseId: selectedCase,
      service,
      provider,
      status: "sent",
      outcome: "",
    };

    setReferrals((all) => [item, ...all]);
    setTab("referrals");
    setFeedback("Referral hand-off prepared (simulated, not sent).");
  }

  function advanceReferral(id: string) {
    if (!writable) {
      setFeedback("Insufficient demo permission.");
      return;
    }

    setReferrals((all) => all.map((r) => {
      if (r.id !== id) return r;

      const next: RefState =
        r.status === "sent" ? "accepted" :
        r.status === "accepted" ? "service_delivered" :
        "closed";

      return {
        ...r,
        status: next,
        outcome: next === "closed"
          ? "Service follow-up recorded. Fictional outcome."
          : r.outcome,
      };
    }));

    setFeedback("Referral status updated in demo register.");
  }

  const linkedReferrals = referrals.filter(
    (r) => r.caseId === selectedCase
  );

  const suggested = knowledge.find((k) => k.category === category);

  return (
    <div className="hd-root">
      <style>{`
        .hd-root{min-height:100vh;background:#f4f7f5;color:#1a4030;
          padding:24px clamp(13px,3vw,46px);font-family:Arial,Helvetica,sans-serif}
        .hd-top{display:flex;align-items:center;justify-content:space-between;
          flex-wrap:wrap;gap:12px;margin-bottom:20px}
        .hd-hero{background:linear-gradient(115deg,#073f31,#006a4e);
          color:white;border-radius:20px;padding:27px;margin-bottom:16px}
        .hd-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .hd-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:15px}
        .hd-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
        .hd-title{font-size:16px;font-weight:800;margin:0 0 14px}
        .hd-list{display:grid;gap:9px}
        .hd-ticket{display:flex;align-items:center;justify-content:space-between;
          gap:11px;text-align:left;padding:14px;border:1px solid #e1ebe5;
          background:#fff;border-radius:11px;cursor:pointer;width:100%}
        .hd-ticket:hover{border-color:#006a4e;background:#f7fbf8}
        .hd-pill{border-radius:25px;background:#e8f4ed;color:#08734e;
          padding:6px 10px;font-size:10px;font-weight:800}
        .hd-split{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .hd-step{border-left:2px solid #2c9b72;padding:5px 0 10px 14px;
          font-size:12px;color:#506a5c}
        @media(max-width:920px){.hd-grid{grid-template-columns:1fr}
          .hd-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:580px){.hd-split{grid-template-columns:1fr}
          .hd-root{padding:12px}}
      `}</style>

      <header className="hd-top">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: "#006a4e", borderRadius: 12,
            color: "white", padding: 11,
          }}>
            <Headphones size={24} />
          </span>
          <div>
            <b style={{ fontSize: 18 }}>MCBP-MIS</b>
            <div style={muted}>HELPDESK · HELPLINE · REFERRALS</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" style={{ ...button, textDecoration: "none" }}>
            <ArrowLeft size={14} style={{ verticalAlign: "middle" }} />
            {" "}{t("Main System", "মূল সিস্টেম")}
          </Link>
          <button style={button} onClick={() => {
            const next = language === "en" ? "bn" : "en";
            setLanguage(next);
            localStorage.setItem("mcbp-lang", next);
          }}>
            {language === "en" ? "বাংলা" : "EN"}
          </button>
        </div>
      </header>

      <section className="hd-hero">
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 15,
        }}>
          <div>
            <div style={{ color: "#c3e8d5", fontSize: 11, letterSpacing: 1.5 }}>
              CONNECTED CITIZEN SUPPORT
            </div>
            <h1 style={{
              fontSize: "clamp(25px,3vw,36px)",
              margin: "10px 0",
            }}>
              {t("Helpline & Service Desk", "হেল্পলাইন ও সেবা কেন্দ্র")}
            </h1>
            <p style={{
              fontSize: 13, color: "#d4ede0",
              lineHeight: 1.7, maxWidth: 700,
            }}>
              {t(
                "A connected journey from a beneficiary call to service resolution and referral outcome.",
                "উপকারভোগীর কল থেকে টিকিট, সেবা ও রেফারেল নিষ্পত্তির সমন্বিত প্রক্রিয়া।"
              )}
            </p>
          </div>
          <PhoneCall size={49} color="#b9e6d0" />
        </div>
        <div style={{ fontSize: 10, color: "#b8e5d1" }}>
          DEMO ONLY · NO REAL CALLS, SMS OR REFERRAL TRANSFERS
        </div>
      </section>

      <div className="hd-kpis">
        {[
          ["Total tickets", cases.length, Ticket],
          ["Open tickets", openCount, Clock3],
          ["Active referrals", pendingReferrals, HeartPulse],
          ["Closed tickets", cases.filter((c) => c.status === "closed").length, CheckCircle2],
        ].map(([label, value, Icon]) => {
          const Symbol = Icon as typeof Ticket;
          return (
            <section style={box} key={String(label)}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={muted}>{label as string}</span>
                <Symbol size={18} color="#007956" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 850, margin: "13px 0 4px" }}>
                {value as number}
              </div>
              <div style={muted}>Fictional support register</div>
            </section>
          );
        })}
      </div>

      <div className="hd-tabs">
        {([
          ["desk", "Live Agent Desk", "এজেন্ট ডেস্ক"],
          ["tickets", "Ticket Register", "টিকিট রেজিস্টার"],
          ["referrals", "Referral Tracking", "রেফারেল ট্র্যাকিং"],
          ["knowledge", "Knowledge Base", "জ্ঞানভান্ডার"],
        ] as const).map(([id, en, bn]) => (
          <button
            key={id}
            style={tab === id ? primary : button}
            onClick={() => setTab(id)}
          >
            {t(en, bn)}
          </button>
        ))}
      </div>

      {feedback && (
        <div style={{
          ...box, marginBottom: 14,
          background: "#eaf6ee",
          color: "#075d42", fontSize: 12,
        }}>
          {feedback}
          <button style={{
            ...button, float: "right", padding: "3px 8px",
          }} onClick={() => setFeedback("")}>×</button>
        </div>
      )}

      <section style={{
        ...box, marginBottom: 14,
        display: "flex", alignItems: "center",
        flexWrap: "wrap", gap: 10,
      }}>
        <span style={muted}>{t("Demo operator role", "ডেমো অপারেটর")}</span>
        <select style={{ ...field, width: "auto" }}
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            localStorage.setItem("mcbp-role", e.target.value);
          }}>
          <option value="admin">System Administrator</option>
          <option value="uwao">UWAO</option>
          <option value="grm">Grievance Officer</option>
          <option value="executive">Programme Executive</option>
          <option value="field">Field Verifier · view only</option>
        </select>
        <span className="hd-pill">
          {writable ? "SUPPORT ACTIONS ENABLED" : "VIEW ONLY"}
        </span>
      </section>

      {tab === "desk" && (
        <div className="hd-grid">
          <section style={box}>
            <h2 className="hd-title">
              <PhoneCall size={18} style={{ verticalAlign: "middle" }} />
              {" "}{t("Inbound Call Simulation", "ইনবাউন্ড কল সিমুলেশন")}
            </h2>
            <label style={{ ...muted, display: "block" }}>
              {t("Choose fictional caller", "নমুনা কলার নির্বাচন")}
              <select style={{ ...field, marginTop: 6 }}
                value={callId}
                onChange={(e) => setCallId(e.target.value)}>
                {callers.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name} · {c.phone}
                  </option>
                ))}
              </select>
            </label>

            <button style={{ ...primary, marginTop: 12 }}
              onClick={() => incomingCall(callId)}>
              <PhoneCall size={14} style={{ verticalAlign: "middle" }} />
              {" "}Simulate incoming call
            </button>

            {(ringing || activeCall) && (
              <div style={{
                marginTop: 17,
                background: "#edf8f0",
                border: "1px solid #c8ead6",
                borderRadius: 14, padding: 17,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <span className="hd-pill">
                    {ringing ? "● INCOMING CALL" : "● CONNECTED"}
                  </span>
                  <BellRing size={17} color="#007c52" />
                </div>
                <h3 style={{ marginBottom: 6 }}>{caller.name}</h3>
                <div style={muted}>
                  {caller.id} · {caller.phone} · {caller.area}
                </div>
                <div style={{ marginTop: 11, fontSize: 12 }}>
                  <ShieldCheck size={14} style={{ verticalAlign: "middle" }} />
                  {" "}Caller matched to fictional beneficiary record
                </div>
                {ringing && (
                  <button style={{ ...primary, marginTop: 13 }}
                    onClick={() => {
                      setRinging(false);
                      setActiveCall(true);
                      setFeedback("Mock call answered; CRM profile opened.");
                    }}>
                    Answer call
                  </button>
                )}
                {activeCall && (
                  <button style={{ ...button, marginTop: 13 }}
                    onClick={() => {
                      setActiveCall(false);
                      setFeedback("Mock call ended.");
                    }}>
                    End call
                  </button>
                )}
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <h3 className="hd-title">
                <UserRound size={18} style={{ verticalAlign: "middle" }} />
                {" "}Matched Beneficiary
              </h3>
              <div className="hd-split">
                {[
                  ["Beneficiary", caller.name],
                  ["ID", caller.id],
                  ["Jurisdiction", caller.area],
                  ["Profile status", caller.status],
                ].map(([key, value]) => (
                  <div key={key} style={{
                    background: "#f5f9f6",
                    borderRadius: 10, padding: 12,
                  }}>
                    <div style={muted}>{key}</div>
                    <b style={{ fontSize: 12 }}>{value}</b>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={box}>
            <h2 className="hd-title">
              <Plus size={18} style={{ verticalAlign: "middle" }} />
              {" "}Create Support Ticket
            </h2>

            <div style={{ display: "grid", gap: 11 }}>
              <label style={muted}>
                Subject
                <input style={field} value={subject}
                  onChange={(e) => setSubject(e.target.value)} />
              </label>

              <label style={muted}>
                Category
                <select style={field} value={category}
                  onChange={(e) => setCategory(e.target.value)}>
                  {[
                    "Payment support", "Health & nutrition",
                    "Registration", "System support",
                    "Grievance follow-up",
                  ].map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>

              <label style={muted}>
                Severity
                <select style={field} value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>

              <label style={muted}>
                Agent notes
                <textarea style={{ ...field, minHeight: 94 }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conversation summary, requested action..." />
              </label>

              <div style={{
                background: "#f7f3e8",
                borderRadius: 10,
                padding: 12, fontSize: 11,
              }}>
                <Clock3 size={13} style={{ verticalAlign: "middle" }} />
                {" "}SLA: {slaFor(severity)}
              </div>

              {suggested && (
                <div style={{
                  background: "#eff7f2",
                  borderRadius: 10,
                  padding: 12,
                }}>
                  <b style={{ fontSize: 12 }}>
                    <BookOpen size={13} style={{ verticalAlign: "middle" }} />
                    {" "}Suggested knowledge article
                  </b>
                  <p style={{ ...muted, marginBottom: 0 }}>
                    {suggested.answer}
                  </p>
                </div>
              )}

              <button style={primary} disabled={!writable}
                onClick={createTicket}>
                Create ticket & notification preview
              </button>
            </div>
          </section>
        </div>
      )}

      {tab === "tickets" && (
        <div className="hd-grid">
          <section style={box}>
            <h2 className="hd-title">
              <ClipboardList size={18} style={{ verticalAlign: "middle" }} />
              {" "}Support Ticket Queue
            </h2>
            <div className="hd-list">
              {cases.map((c) => (
                <button key={c.id} className="hd-ticket"
                  onClick={() => setSelectedCase(c.id)}
                  style={{
                    borderColor: selectedCase === c.id ? "#006a4e" : undefined,
                    background: selectedCase === c.id ? "#f0f8f3" : undefined,
                  }}>
                  <div>
                    <b style={{ fontSize: 13 }}>{c.subject}</b>
                    <div style={muted}>
                      {c.id} · {c.category} · {c.owner}
                    </div>
                    <div style={muted}>
                      {new Date(c.created).toLocaleString()}
                    </div>
                  </div>
                  <span className="hd-pill">{c.status}</span>
                </button>
              ))}
            </div>
          </section>

          <section style={box}>
            {currentCase ? (
              <>
                <h2 className="hd-title">Ticket Detail & SLA</h2>
                <h3 style={{ fontSize: 16 }}>{currentCase.subject}</h3>
                <p style={muted}>
                  {currentCase.id} · {currentCase.callerId}
                </p>

                {[
                  ["Status", currentCase.status],
                  ["Owner", currentCase.owner],
                  ["Channel", currentCase.channel],
                  ["Severity", currentCase.severity],
                  ["SLA target", slaFor(currentCase.severity)],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 10, fontSize: 12,
                    borderBottom: "1px solid #edf2ee",
                    padding: "11px 0",
                  }}>
                    <span style={{ color: "#708479" }}>{label}</span>
                    <b>{value}</b>
                  </div>
                ))}

                <div style={{
                  display: "flex", gap: 8,
                  flexWrap: "wrap", margin: "16px 0",
                }}>
                  {([
                    ["assigned", "Assign"],
                    ["in_progress", "Investigate"],
                    ["resolved", "Resolve"],
                    ["closed", "Close"],
                  ] as const).map(([state, label]) => (
                    <button key={state}
                      style={state === "resolved" ? primary : button}
                      disabled={!writable || currentCase.status === "closed"}
                      onClick={() => updateCase(state)}>
                      {label}
                    </button>
                  ))}
                </div>

                <h3 className="hd-title">Referral Hand-off</h3>
                <label style={muted}>
                  Service
                  <select style={field} value={service}
                    onChange={(e) => setService(e.target.value)}>
                    <option>Maternal health consultation</option>
                    <option>Nutrition counselling</option>
                    <option>Family planning support</option>
                  </select>
                </label>

                <label style={{ ...muted, display: "block", marginTop: 9 }}>
                  Destination provider
                  <input style={field} value={provider}
                    onChange={(e) => setProvider(e.target.value)} />
                </label>

                <button style={{ ...primary, marginTop: 12 }}
                  disabled={!writable || !provider.trim()}
                  onClick={createReferral}>
                  <HeartPulse size={13} style={{ verticalAlign: "middle" }} />
                  {" "}Create referral
                </button>

                <p style={muted}>
                  Related referrals: {linkedReferrals.length}
                </p>

                <h3 className="hd-title">Activity Timeline</h3>
                {currentCase.history.map((step, i) => (
                  <div key={i} className="hd-step">{step}</div>
                ))}
              </>
            ) : (
              <p>Select a ticket to inspect.</p>
            )}
          </section>
        </div>
      )}

      {tab === "referrals" && (
        <section style={box}>
          <h2 className="hd-title">
            <HeartPulse size={18} style={{ verticalAlign: "middle" }} />
            {" "}Referral Tracking & Outcomes
          </h2>
          <p style={muted}>
            Provider acceptance, service record and follow-up are
            visual simulations. No referral is transmitted externally.
          </p>
          <div className="hd-list">
            {referrals.map((r) => (
              <div key={r.id} style={{
                border: "1px solid #e3ece6",
                borderRadius: 13,
                padding: 17,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  flexWrap: "wrap", gap: 10,
                }}>
                  <div>
                    <b>{r.service}</b>
                    <div style={muted}>
                      {r.id} · Ticket {r.caseId}
                    </div>
                    <div style={muted}>{r.provider}</div>
                  </div>
                  <span className="hd-pill">{r.status}</span>
                </div>

                <div style={{
                  display: "flex", gap: 7,
                  alignItems: "center", flexWrap: "wrap",
                  fontSize: 11, color: "#6b8072",
                  marginTop: 14,
                }}>
                  <span>Sent</span><ChevronRight size={13} />
                  <span>Accepted</span><ChevronRight size={13} />
                  <span>Service delivered</span><ChevronRight size={13} />
                  <span>Closed</span>
                </div>

                {r.outcome && <p style={muted}>{r.outcome}</p>}

                <button style={{ ...primary, marginTop: 13 }}
                  disabled={!writable || r.status === "closed"}
                  onClick={() => advanceReferral(r.id)}>
                  {r.status === "sent" ? "Provider accept" :
                    r.status === "accepted" ? "Record service delivered" :
                    r.status === "service_delivered" ? "Close referral" :
                    "Completed"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "knowledge" && (
        <section style={box}>
          <h2 className="hd-title">
            <BookOpen size={18} style={{ verticalAlign: "middle" }} />
            {" "}Helpdesk Knowledge Base
          </h2>
          <label style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 17,
          }}>
            <Search size={16} />
            <input style={field} placeholder="Search articles"
              value={kbSearch}
              onChange={(e) => setKbSearch(e.target.value)} />
          </label>

          <div className="hd-list">
            {knowledge.filter((k) =>
              `${k.category} ${k.title} ${k.answer}`
                .toLowerCase().includes(kbSearch.toLowerCase())
            ).map((k) => (
              <article key={k.title} style={{
                background: "#f7faf7",
                borderRadius: 12,
                padding: 17,
              }}>
                <div style={{ ...muted, color: "#007d56" }}>{k.category}</div>
                <h3 style={{ fontSize: 14 }}>{k.title}</h3>
                <p style={{ fontSize: 12, lineHeight: 1.75 }}>{k.answer}</p>
                <button style={button} onClick={() => {
                  setCategory(k.category);
                  setSubject(k.title);
                  setTab("desk");
                }}>
                  Use in new ticket
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer style={{
        display: "flex", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginTop: 23,
        ...muted,
      }}>
        <span>
          <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
          {" "}SS12 · Fictional caller records · Browser-local tickets
        </span>
        <button style={button} onClick={() => csvDownload([
          ["Ticket ID", "Subject", "Category", "Severity", "Status", "Owner"],
          ...cases.map((c) => [
            c.id, c.subject, c.category,
            c.severity, c.status, c.owner,
          ]),
        ])}>
          <Download size={13} style={{ verticalAlign: "middle" }} />
          {" "}Export CSV
        </button>
      </footer>
    </div>
  );
}
