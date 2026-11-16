
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Bot, BrainCircuit, CheckCircle2,
  Clock3, Database, Download, FileText, LockKeyhole,
  MessageSquare, Play, Send, ShieldCheck, Sparkles,
  TrendingUp, Wallet, XCircle, BellRing, Calculator,
  ClipboardList, RefreshCw, AlertTriangle,
} from "lucide-react";
import { useDemoStore } from "../../lib/demo-store";
import { usePayrollStore } from "../../lib/payroll-store";
import { useGrievanceStore } from "../../lib/grievance-store";
import { useTrainingStore } from "../../lib/training-store";

type Lang = "en" | "bn";
type Agent = "collection" | "report" | "alert" | "calculation";
type Status = "pending" | "approved" | "rejected";
type Topic = "bounce" | "grievance" | "verification" | "training" | "payment" | "security";

type Proposal = {
  id: string;
  agent: Agent;
  title: string;
  output: string;
  status: Status;
  reviewer: string;
  createdAt: string;
  reviewedAt?: string;
  source: string;
};

type Chat = {
  id: string;
  from: "user" | "assistant";
  text: string;
  source?: string;
};

const agentInfo = [
  {
    id: "collection" as Agent,
    title: "Data Collection Agent",
    bn: "ডেটা সংগ্রহ এজেন্ট",
    description: "Summarises approved demo data sources and prepares a verification review.",
    icon: Database,
    color: "#178268",
  },
  {
    id: "report" as Agent,
    title: "Report Generation Agent",
    bn: "রিপোর্ট তৈরির এজেন্ট",
    description: "Prepares an operational summary for human review and export.",
    icon: FileText,
    color: "#4778B9",
  },
  {
    id: "alert" as Agent,
    title: "Alert Agent",
    bn: "সতর্কতা এজেন্ট",
    description: "Creates a proposed notification about exceptions and pending actions.",
    icon: BellRing,
    color: "#C17C2D",
  },
  {
    id: "calculation" as Agent,
    title: "Calculation Agent",
    bn: "গণনা এজেন্ট",
    description: "Uses fixed arithmetic rules to produce a reproducible summary.",
    icon: Calculator,
    color: "#9B66C7",
  },
];

const prompts: {
  id: Topic;
  en: string;
  bn: string;
}[] = [
  {
    id: "bounce",
    en: "What is the payment bounce-back situation?",
    bn: "পেমেন্ট ব্যর্থতার অবস্থা কী?",
  },
  {
    id: "grievance",
    en: "How many programme grievances are open?",
    bn: "কতটি কর্মসূচির অভিযোগ চলমান?",
  },
  {
    id: "verification",
    en: "What is the identity verification backlog?",
    bn: "পরিচয় যাচাইয়ের অপেক্ষমাণ সংখ্যা কত?",
  },
  {
    id: "training",
    en: "Summarise training completion.",
    bn: "প্রশিক্ষণের অগ্রগতি দেখাও।",
  },
  {
    id: "payment",
    en: "Summarise the payment exceptions.",
    bn: "পেমেন্টের ব্যতিক্রমগুলো দেখাও।",
  },
  {
    id: "security",
    en: "Can AI release a payment automatically?",
    bn: "এআই কি নিজে থেকে পেমেন্ট দিতে পারে?",
  },
];

const card: React.CSSProperties = {
  background: "#fff",
  padding: 20,
  borderRadius: 17,
  border: "1px solid #E2EBE6",
  boxShadow: "0 5px 22px rgba(11,65,42,.035)",
};

const btn: React.CSSProperties = {
  background: "#fff",
  color: "#174938",
  border: "1px solid #D9E5DD",
  borderRadius: 9,
  padding: "10px 13px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
};

const primary: React.CSSProperties = {
  ...btn,
  background: "#006A4E",
  color: "#fff",
  borderColor: "#006A4E",
};

const small: React.CSSProperties = {
  color: "#72887B",
  fontSize: 11,
  lineHeight: 1.6,
};

const now = () => new Date().toISOString();

function exportText(filename: string, content: string) {
  const blob = new Blob(["\uFEFF", content], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AIConsole() {
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRole] = useState("executive");
  const [tab, setTab] = useState<"assistant" | "agents" | "reviews" | "audit">("assistant");
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<Chat[]>([
    {
      id: "welcome",
      from: "assistant",
      text: "Hello! I can explain simulated programme indicators from the connected demo modules. Choose a question below.",
      source: "MCBP-MIS demo data",
    },
  ]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [ready, setReady] = useState(false);
  const [feedback, setFeedback] = useState("");

  const applications = useDemoStore((s) => s.applications);
  const payroll = usePayrollStore((s) => s.payments);
  const grievances = useGrievanceStore((s) => s.cases);
  const participants = useTrainingStore((s) => s.participants);

  useEffect(() => {
    try {
      const roleValue = localStorage.getItem("mcbp-role");
      const langValue = localStorage.getItem("mcbp-lang");
      const stored = localStorage.getItem("mcbp-ai-proposals");

      if (roleValue) setRole(roleValue);
      if (langValue === "en" || langValue === "bn") setLang(langValue);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setProposals(parsed as Proposal[]);
      }
    } catch {
      // Demo may start with empty browser storage.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("mcbp-ai-proposals", JSON.stringify(proposals));
    }
  }, [proposals, ready]);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  const bounced = payroll.filter((p) => p.status === "bounced").length;
  const paid = payroll.filter((p) => ["paid", "repaid"].includes(p.status)).length;
  const pending = applications.filter((a) => a.status === "identity_pending").length;
  const openCases = grievances.filter(
    (g) => g.queue === "programme" && !["resolved", "closed"].includes(g.status)
  ).length;
  const certificates = participants.filter((p) => Boolean(p.certificateId)).length;

  const isNational = role === "executive" || role === "admin";
  const canReview = role === "executive" || role === "admin";
  const totals = [
    { value: String(pending), label: "Identity pending", icon: Clock3 },
    { value: String(bounced), label: "Bounced payments", icon: Wallet },
    { value: String(openCases), label: "Open grievances", icon: MessageSquare },
    { value: String(certificates), label: "Training certificates", icon: CheckCircle2 },
  ];

  function answer(topic: Topic) {
    const responses: Record<Topic, { en: string; bn: string; source: string }> = {
      bounce: {
        en: `${bounced} payment transaction(s) are marked bounced out of ${payroll.length} demo transactions. This is a count, not a national rate. A finance officer must investigate and approve any corrective action.`,
        bn: `${payroll.length}টি ডেমো লেনদেনের মধ্যে ${bounced}টি ব্যর্থ। এটি জাতীয় হার নয়। সংশোধনের জন্য অর্থ কর্মকর্তার পর্যালোচনা প্রয়োজন।`,
        source: "SS03 · Payroll Store",
      },
      grievance: {
        en: `${openCases} programme grievance(s) remain open in the simulated case register. The grievance officer owns case investigation and closure.`,
        bn: `ডেমো রেজিস্টারে ${openCases}টি কর্মসূচির অভিযোগ চলমান। তদন্ত ও নিষ্পত্তির দায়িত্ব অভিযোগ কর্মকর্তার।`,
        source: "SS05 · Grievance Store",
      },
      verification: {
        en: `${pending} application(s) have identity verification pending. Review the application workflow and any related BDRIS simulation signals.`,
        bn: `${pending}টি আবেদনে পরিচয় যাচাই বাকি। আবেদন প্রক্রিয়া ও BDRIS সিমুলেশন দেখতে হবে।`,
        source: "SS01 · Applications Store",
      },
      training: {
        en: `${certificates} certificate(s) have been generated in the training demo from ${participants.length} participant record(s).`,
        bn: `${participants.length}টি অংশগ্রহণকারীর রেকর্ড থেকে ${certificates}টি ডেমো সনদ তৈরি হয়েছে।`,
        source: "SS04 · Training Store",
      },
      payment: {
        en: `${paid} transaction(s) are paid/repaid and ${bounced} are bounced. This is an operational snapshot; the assistant cannot release, correct, or approve a payment.`,
        bn: `${paid}টি পরিশোধিত/পুনঃপরিশোধিত এবং ${bounced}টি ব্যর্থ। এআই পেমেন্ট অনুমোদন বা ছাড় করতে পারে না।`,
        source: "SS03 · Payroll Store",
      },
      security: {
        en: "No. The AI assistant and agents cannot approve eligibility, beneficiary selection, payroll, payments, or master-data changes. Human authorisation remains mandatory.",
        bn: "না। এআই যোগ্যতা, উপকারভোগী নির্বাচন, পেরোল, পেমেন্ট বা মূল তথ্য পরিবর্তন অনুমোদন করতে পারে না। মানব অনুমোদন বাধ্যতামূলক।",
        source: "SS09 · Governance Rules / PRD 1.2.11",
      },
    };

    const found = prompts.find((p) => p.id === topic);
    const response = responses[topic];

    setChat((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        from: "user",
        text: found ? t(found.en, found.bn) : topic,
      },
      {
        id: `a-${Date.now()}`,
        from: "assistant",
        text: t(response.en, response.bn),
        source: response.source,
      },
    ]);
  }

  function sendQuestion() {
    const text = question.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const matched = prompts.find(
      (p) =>
        lower === p.en.toLowerCase() ||
        text === p.bn ||
        lower.includes(p.id)
    );

    if (matched) {
      answer(matched.id);
    } else {
      setChat((prev) => [
        ...prev,
        { id: `uq-${Date.now()}`, from: "user", text },
        {
          id: `ua-${Date.now()}`,
          from: "assistant",
          text: t(
            "This demo cannot verify that question against an approved dataset. Choose one of the supported questions below. No external AI model was called.",
            "এই প্রশ্নের উত্তর অনুমোদিত ডেমো ডাটাসেট থেকে যাচাই করা যাচ্ছে না। নিচের প্রশ্নগুলোর একটি বেছে নিন। কোনো বাহ্যিক এআই ব্যবহার করা হয়নি।"
          ),
          source: "SS09 · Scope restriction",
        },
      ]);
    }

    setQuestion("");
  }

  function runAgent(agent: Agent) {
    if (!isNational) {
      setFeedback(t("This role cannot run national agents.", "এই রোলে জাতীয় এজেন্ট চালানো যাবে না।"));
      return;
    }

    const label = agentInfo.find((a) => a.id === agent)?.title ?? agent;

    const details: Record<Agent, string> = {
      collection: `Proposed verification review: ${pending} identity-pending application(s). Sources: SS01 application workflow. No personal identifiers included.`,
      report: `Draft operations report: ${applications.length} applications, ${paid} successful payment(s), ${openCases} open programme grievances, ${certificates} training certificates. Human verification required.`,
      alert: `Draft alert: ${bounced} bounced payment(s), ${pending} pending identity check(s), ${openCases} open grievance(s). Suggested notification only; nothing has been sent.`,
      calculation: `Deterministic arithmetic: ${paid} paid/repaid + ${bounced} bounced = ${paid + bounced} matching payment records. Other payment states: ${payroll.length - paid - bounced}. This calculation does not authorise any financial action.`,
    };

    const item: Proposal = {
      id: `AI-${Date.now()}`,
      agent,
      title: label,
      output: details[agent],
      status: "pending",
      reviewer: "",
      createdAt: now(),
      source: agent === "calculation"
        ? "SS03 · Deterministic rules"
        : "SS01 / SS03 / SS04 / SS05 · Demo stores",
    };

    setProposals((old) => [item, ...old]);
    setTab("reviews");
    setFeedback(t("Draft proposal prepared. Human review required.", "খসড়া প্রস্তুত। মানব পর্যালোচনা প্রয়োজন।"));
  }

  function review(id: string, next: "approved" | "rejected") {
    if (!canReview) {
      setFeedback(t("Reviewer permission required.", "পর্যালোচকের অনুমতি প্রয়োজন।"));
      return;
    }

    setProposals((old) =>
      old.map((p) =>
        p.id === id && p.status === "pending"
          ? {
              ...p,
              status: next,
              reviewer: role === "admin" ? "System Administrator" : "Programme Executive / PD",
              reviewedAt: now(),
            }
          : p
      )
    );

    setFeedback(
      next === "approved"
        ? t("Approved as a draft only. No payment or external action executed.", "শুধু খসড়া অনুমোদিত। কোনো পেমেন্ট বা বাহ্যিক কাজ করা হয়নি।")
        : t("Proposal rejected and retained in audit history.", "প্রস্তাব বাতিল হয়েছে এবং অডিটে সংরক্ষিত।")
    );
  }

  function downloadProposal(p: Proposal) {
    exportText(
      `${p.id}-review.txt`,
      [
        "MCBP-MIS · SIMULATED AGENT REVIEW",
        `ID: ${p.id}`,
        `Agent: ${p.title}`,
        `State: ${p.status}`,
        `Prepared: ${p.createdAt}`,
        `Reviewer: ${p.reviewer || "Pending"}`,
        `Source: ${p.source}`,
        "",
        p.output,
        "",
        "DEMO ONLY. No automated programme decision or transaction.",
      ].join("\n")
    );
  }

  return (
    <div className="ai-root">
      <style>{`
        .ai-root{min-height:100vh;background:#F4F7F5;color:#193C2D;
          font-family:Arial,Helvetica,sans-serif;padding:24px clamp(14px,3vw,46px)}
        .ai-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px}
        .ai-hero{border-radius:20px;background:linear-gradient(115deg,#043C30,#006A4E);
          color:#fff;padding:29px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:20px}
        .ai-grid{display:grid;grid-template-columns:1.45fr 1fr;gap:15px}
        .ai-agents{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .ai-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin-bottom:15px}
        .ai-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
        .ai-chat{display:grid;gap:10px;max-height:470px;overflow-y:auto;padding:8px}
        .ai-bubble{padding:14px 15px;border-radius:14px;max-width:87%;
          font-size:13px;line-height:1.65;white-space:pre-wrap}
        .ai-bot{background:#F0F6F2;justify-self:start}
        .ai-user{background:#006A4E;color:white;justify-self:end}
        .ai-prompt{border:1px solid #DEE9E2;border-radius:10px;background:#FAFCFB;
          padding:11px 12px;text-align:left;font-size:12px;cursor:pointer;color:#285745}
        .ai-prompt:hover{border-color:#006A4E}
        .ai-item{padding:15px 0;border-bottom:1px solid #E8EFEA}
        .ai-tag{font-size:10px;font-weight:800;padding:6px 9px;border-radius:30px;
          background:#E6F3EB;color:#006A4E}
        @media(max-width:840px){.ai-grid{grid-template-columns:1fr}
          .ai-stats{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:580px){.ai-agents{grid-template-columns:1fr}
          .ai-hero{padding:20px}.ai-root{padding:13px}}
      `}</style>

      <header className="ai-top">
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <div style={{
            background: "#006A4E", padding: 11,
            color: "white", borderRadius: 12,
          }}>
            <BrainCircuit size={23} />
          </div>
          <div>
            <b style={{ fontSize: 18 }}>MCBP-MIS</b>
            <div style={small}>{t("AI ASSISTANT & AGENT CONSOLE", "এআই সহকারী ও এজেন্ট কনসোল")}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" style={{ ...btn, textDecoration: "none" }}>
            <ArrowLeft size={14} /> {t("Main Dashboard", "মূল ড্যাশবোর্ড")}
          </Link>
          <button style={btn} onClick={() => {
            const next = lang === "en" ? "bn" : "en";
            setLang(next);
            localStorage.setItem("mcbp-lang", next);
          }}>
            {lang === "en" ? "বাংলা" : "EN"}
          </button>
        </div>
      </header>

      <section className="ai-hero">
        <div>
          <div style={{ color: "#B7E4D2", fontSize: 11, letterSpacing: 1.3 }}>
            INTELLIGENT ASSISTANCE · HUMAN CONTROL
          </div>
          <h1 style={{ fontSize: "clamp(25px,3vw,36px)", margin: "10px 0" }}>
            {t("AI-Powered Programme Operations", "এআই-ভিত্তিক কর্মসূচি পরিচালনা")}
          </h1>
          <p style={{ color: "#D7F1E4", fontSize: 13, lineHeight: 1.7, maxWidth: 670 }}>
            {t(
              "Ask questions, prepare reports and review suggested actions. Every sensitive decision remains with a human officer.",
              "প্রশ্ন করুন, রিপোর্ট তৈরি করুন ও প্রস্তাব পর্যালোচনা করুন। গুরুত্বপূর্ণ সিদ্ধান্ত কর্মকর্তাই নেবেন।"
            )}
          </p>
          <span style={{ fontSize: 11, color: "#C4EAD7" }}>
            <ShieldCheck size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />
            SIMULATED AI · NO LIVE MODEL · NO AUTONOMOUS PAYMENTS
          </span>
        </div>
        <Sparkles size={57} color="#B8E8D0" strokeWidth={1.2} />
      </section>

      <div className="ai-stats">
        {totals.map((item) => (
          <div style={card} key={item.label}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={small}>{item.label}</span>
              <item.icon size={17} color="#006A4E" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 850, marginTop: 13 }}>{item.value}</div>
            <div style={small}>Connected fictional records</div>
          </div>
        ))}
      </div>

      <div className="ai-tabs">
        {([
          ["assistant", "Assistant", "সহকারী"],
          ["agents", "Four Agents", "চার এজেন্ট"],
          ["reviews", `Review Queue (${proposals.filter((p) => p.status === "pending").length})`, "পর্যালোচনা"],
          ["audit", "Audit & Governance", "অডিট ও গভর্নেন্স"],
        ] as const).map(([value, en, bn]) => (
          <button key={value}
            style={tab === value ? primary : btn}
            onClick={() => setTab(value)}>
            {t(en, bn)}
          </button>
        ))}
      </div>

      {feedback && (
        <div style={{
          ...card, marginBottom: 14,
          background: "#EAF6EE", color: "#075B41",
          fontSize: 12,
        }}>
          {feedback}
          <button style={{ ...btn, float: "right", padding: "3px 8px" }}
            onClick={() => setFeedback("")}>×</button>
        </div>
      )}

      {tab === "assistant" && (
        <div className="ai-grid">
          <section style={card}>
            <h3 style={{ fontSize: 17, margin: "0 0 13px" }}>
              <Bot size={20} style={{ verticalAlign: "middle", marginRight: 7 }} />
              {t("Programme AI Assistant", "কর্মসূচির এআই সহকারী")}
            </h3>
            <div className="ai-chat">
              {chat.map((m) => (
                <div key={m.id} className={`ai-bubble ${m.from === "user" ? "ai-user" : "ai-bot"}`}>
                  {m.text}
                  {m.source && (
                    <div style={{
                      fontSize: 10, marginTop: 10,
                      color: "#618376",
                      borderTop: "1px solid #DBE8DF", paddingTop: 8,
                    }}>
                      <Database size={11} style={{ verticalAlign: "middle" }} />
                      {" "}Source: {m.source}
                      {" "}· Checked: {new Date().toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              sendQuestion();
            }} style={{ display: "flex", gap: 8, marginTop: 13 }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t("Ask about a programme indicator...", "কর্মসূচির তথ্য জানতে প্রশ্ন করুন...")}
                style={{
                  flex: 1, minWidth: 80, padding: 12,
                  borderRadius: 10, border: "1px solid #DCE8DF",
                  fontSize: 12,
                }}
              />
              <button type="submit" style={primary}><Send size={16} /></button>
            </form>
            <p style={small}>
              <LockKeyhole size={12} style={{ verticalAlign: "middle" }} />
              {" "}Only predefined verified demo scenarios are supported.
            </p>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 15, margin: "0 0 14px" }}>
              {t("Suggested questions", "প্রস্তাবিত প্রশ্ন")}
            </h3>
            <div style={{ display: "grid", gap: 9 }}>
              {prompts.map((p) => (
                <button key={p.id} className="ai-prompt"
                  onClick={() => answer(p.id)}>
                  <Sparkles size={13} style={{ marginRight: 8, verticalAlign: "middle" }} />
                  {t(p.en, p.bn)}
                </button>
              ))}
            </div>
            <div style={{
              marginTop: 18, background: "#F6FAF7",
              borderRadius: 12, padding: 15,
            }}>
              <b style={{ fontSize: 12 }}>Why human review matters</b>
              <p style={small}>
                Every assistant answer is advisory. The assistant
                does not control eligibility, enrolment, payroll,
                financial execution or master records.
              </p>
            </div>
          </section>
        </div>
      )}

      {tab === "agents" && (
        <div className="ai-agents">
          {agentInfo.map((agent) => (
            <section style={card} key={agent.id}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
              }}>
                <div style={{
                  background: `${agent.color}17`,
                  color: agent.color,
                  borderRadius: 12, padding: 13,
                }}>
                  <agent.icon size={25} />
                </div>
                <span className="ai-tag">HUMAN-IN-THE-LOOP</span>
              </div>
              <h3 style={{ fontSize: 17, margin: "19px 0 8px" }}>
                {lang === "bn" ? agent.bn : agent.title}
              </h3>
              <p style={{ ...small, minHeight: 47 }}>{agent.description}</p>
              <div style={{
                display: "flex", gap: 8,
                alignItems: "center", margin: "15px 0",
                color: "#718779", fontSize: 11,
              }}>
                <Database size={14} />
                Demo data
                <ArrowRight size={13} />
                Proposed result
                <ArrowRight size={13} />
                Human review
              </div>
              <button style={{ ...primary, width: "100%", justifyContent: "center" }}
                disabled={!isNational}
                onClick={() => runAgent(agent.id)}>
                <Play size={15} /> {t("Run simulated agent", "সিমুলেটেড এজেন্ট চালান")}
              </button>
            </section>
          ))}
        </div>
      )}

      {tab === "reviews" && (
        <section style={card}>
          <h3 style={{ fontSize: 17, margin: "0 0 8px" }}>
            <ClipboardList size={19} style={{ verticalAlign: "middle", marginRight: 7 }} />
            {t("Human Approval Queue", "মানব অনুমোদন তালিকা")}
          </h3>
          <p style={small}>Reviewing only creates an approved demo draft. No external action or payment is performed.</p>
          {!proposals.length && (
            <div style={{ textAlign: "center", padding: 45, color: "#809285" }}>
              <Clock3 size={32} />
              <p>No proposals yet. Run one of the four agents first.</p>
              <button style={primary} onClick={() => setTab("agents")}>
                Go to Agents <ArrowRight size={14} />
              </button>
            </div>
          )}

          {proposals.map((p) => (
            <div className="ai-item" key={p.id}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                flexWrap: "wrap", gap: 10,
              }}>
                <div>
                  <b style={{ fontSize: 14 }}>{p.title}</b>
                  <div style={small}>
                    {p.id} · {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="ai-tag" style={{
                  background: p.status === "approved" ? "#E3F3EA"
                    : p.status === "rejected" ? "#FCEBF0" : "#FFF1DC",
                  color: p.status === "approved" ? "#076344"
                    : p.status === "rejected" ? "#AF315E" : "#9B6718",
                }}>{p.status.toUpperCase()}</span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.8 }}>{p.output}</p>
              <div style={small}>Source: {p.source}</div>
              {p.reviewer && (
                <p style={small}>Reviewed by: {p.reviewer}</p>
              )}
              <div style={{
                display: "flex", gap: 8,
                flexWrap: "wrap", marginTop: 12,
              }}>
                {p.status === "pending" && (
                  <>
                    <button style={primary} disabled={!canReview}
                      onClick={() => review(p.id, "approved")}>
                      <CheckCircle2 size={14} /> Accept as draft
                    </button>
                    <button style={btn} disabled={!canReview}
                      onClick={() => review(p.id, "rejected")}>
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
                <button style={btn} onClick={() => downloadProposal(p)}>
                  <Download size={14} /> Export record
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "audit" && (
        <div className="ai-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 15px" }}>
              <ShieldCheck size={19} style={{ verticalAlign: "middle", marginRight: 7 }} />
              Agent execution & decision audit
            </h3>
            {!proposals.length && <p style={small}>No agent runs recorded yet.</p>}
            {proposals.map((p) => (
              <div className="ai-item" key={p.id}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  gap: 8, flexWrap: "wrap",
                }}>
                  <b style={{ fontSize: 12 }}>{p.title}</b>
                  <span className="ai-tag">{p.status}</span>
                </div>
                <div style={small}>Run: {p.id}</div>
                <div style={small}>Created: {p.createdAt}</div>
                <div style={small}>Source: {p.source}</div>
                <div style={small}>Reviewer: {p.reviewer || "Awaiting human review"}</div>
                {p.reviewedAt && <div style={small}>Decision: {p.reviewedAt}</div>}
              </div>
            ))}
            <button style={{ ...btn, marginTop: 13 }}
              onClick={() => exportText(
                "MCBP-AI-audit.txt",
                proposals.map((p) =>
                  `${p.id} | ${p.agent} | ${p.status} | ${p.reviewer || "PENDING"} | ${p.createdAt}`
                ).join("\n") || "No events"
              )}>
              <Download size={14} /> Export audit
            </button>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, margin: "0 0 15px" }}>
              <LockKeyhole size={19} style={{ verticalAlign: "middle", marginRight: 7 }} />
              AI Governance
            </h3>
            {[
              ["Model", "Deterministic demo simulator"],
              ["Data boundary", "Browser-local fictional data"],
              ["Actions requiring human approval", "All sensitive actions"],
              ["Autonomous payment", "Not permitted"],
              ["Master-data modification", "Not permitted"],
              ["Report source disclosure", "Enabled in supported answers"],
              ["Bangla evaluation accuracy", "92.1% illustrative target only"],
              ["Production hosting", "Not connected"],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
                gap: 15, borderBottom: "1px solid #EDF2EE",
                padding: "12px 0", fontSize: 12,
              }}>
                <span style={{ color: "#738A7D" }}>{label}</span>
                <b style={{ textAlign: "right" }}>{value}</b>
              </div>
            ))}
            <p style={{ ...small, marginTop: 15 }}>
              <AlertTriangle size={13} style={{ verticalAlign: "middle" }} />
              {" "}The production AI model, hosting, security and testing
              are future implementation commitments, not active demo capabilities.
            </p>
          </section>
        </div>
      )}

      <footer style={{ ...small, textAlign: "center", marginTop: 24 }}>
        <ShieldCheck size={12} style={{ verticalAlign: "middle" }} />
        {" "}MCBP-MIS SS09 · Fictional data · Deterministic responses ·
        Human review mandatory · No external AI requests
      </footer>
    </div>
  );
}
