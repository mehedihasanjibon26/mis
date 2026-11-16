
"use client";

import { useState } from "react";
import {
  MessageSquareWarning, Search, Plus, ArrowLeft,
  Clock3, ShieldAlert, CheckCircle2, Download, Send,
} from "lucide-react";
import { useGrievanceStore, type QueueType, type GrievanceCategory,
  type Grievance, type NewGrievance } from "../lib/grievance-store";
import { usePayrollStore } from "../lib/payroll-store";

type Props = { lang: "en" | "bn"; roleId: string };

const categories: Record<GrievanceCategory, [string, string]> = {
  payment: ["Payment", "পেমেন্ট"],
  selection: ["Selection appeal", "নির্বাচন আপিল"],
  misconduct: ["Misconduct / fraud", "অনিয়ম / জালিয়াতি"],
  service: ["Service issue", "সেবা সমস্যা"],
  data_error: ["Data error", "তথ্যগত ভুল"],
  access: ["Access issue", "অ্যাক্সেস সমস্যা"],
  glitch: ["System glitch", "সিস্টেম সমস্যা"],
};

const types: Record<QueueType, GrievanceCategory[]> = {
  programme: ["payment", "selection", "misconduct", "service"],
  system: ["data_error", "access", "glitch"],
};

const emptyForm: NewGrievance = {
  queue: "programme",
  category: "payment",
  subtype: "Wallet / bounced payment",
  channel: "web",
  title: "",
  description: "",
  beneficiaryId: "",
  transactionId: "",
  union: "Kaunia Sadar",
  anonymous: false,
};

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #CBD5D0", borderRadius: 9,
  padding: "10px 12px", background: "#fff", font: "inherit",
};

function exportCSV(rows: string[][]) {
  const csv = rows.map((r) =>
    r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "mcbp-grievance-demo.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function GrievancesPanel({ lang, roleId }: Props) {
  const cases = useGrievanceStore((s) => s.cases);
  const history = useGrievanceStore((s) => s.history);
  const createCase = useGrievanceStore((s) => s.createCase);
  const takeAction = useGrievanceStore((s) => s.takeAction);
  const payments = usePayrollStore((s) => s.payments);

  const [queue, setQueue] = useState<QueueType>("programme");
  const [mode, setMode] = useState<"list" | "new" | "detail">("list");
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<NewGrievance>({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [note, setNote] = useState("");
  const [clockOffset, setClockOffset] = useState(0);
  const [clockNow] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const now = clockNow + clockOffset * 86400000;
  const officer = ["grm", "uwao", "executive", "admin"].includes(roleId);
  const canViewSystem = ["grm", "admin"].includes(roleId);
  const canViewConfidential = ["executive", "admin"].includes(roleId);

  const visible = cases.filter((c) => {
    if (c.queue !== queue) return false;
    if (queue === "system" && !canViewSystem) return false;
    if (c.category === "misconduct" && !canViewConfidential) return false;
    return true;
  });

  const filtered = visible.filter((c) =>
    (statusFilter === "all" || c.status === statusFilter) &&
    (categoryFilter === "all" || c.category === categoryFilter) &&
    `${c.id} ${c.title} ${c.beneficiaryId} ${c.union}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const selected = visible.find((c) => c.id === selectedId);
  const selectedEvents = history.filter((e) => e.caseId === selectedId)
    .slice().reverse();

  const overdue = (c: Grievance) =>
    !["closed", "resolved"].includes(c.status) &&
    new Date(c.dueAt).getTime() < now;

  const pending = visible.filter((c) => !["resolved", "closed"].includes(c.status));
  const overdueCount = pending.filter(overdue).length;
  const resolvedCount = visible.filter((c) =>
    ["resolved", "closed"].includes(c.status)).length;
  const chart = (queue === "programme"
    ? types.programme : types.system).map((category) => ({
      category, count: visible.filter((c) => c.category === category).length,
  }));
  const maxCount = Math.max(1, ...chart.map((x) => x.count));

  const linkedPayment = selected?.transactionId
    ? payments.find((p) => p.id === selected.transactionId)
    : undefined;
  const linkedRepaymentDone = !selected?.transactionId ||
    linkedPayment?.status === "repaid";

  function feedback(ok: boolean, text: string) {
    setError(ok ? "" : text);
    setMessage(ok ? text : "");
  }

  function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = createCase(form, roleId);
    feedback(result.ok, result.message);
    if (result.ok) {
      setMode("list");
      setForm({ ...emptyForm, queue, category: types[queue][0] });
    }
  }

  function action(type: Parameters<typeof takeAction>[1]) {
    if (!selected) return;
    const r = takeAction(
      selected.id, type, roleId, note,
      linkedRepaymentDone
    );
    feedback(r.ok, r.message);
    if (r.ok) setNote("");
  }

  const riskCount = cases.filter((c) => c.queue === "programme" &&
    c.category === "payment" && c.status !== "closed").length;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card">
        <div className="card-title" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2>
              <MessageSquareWarning size={18} style={{ verticalAlign: "middle", marginRight: 7 }} />
              {t("Grievance Redress Management", "অভিযোগ প্রতিকার ব্যবস্থাপনা")}
            </h2>
            <p className="sub">
              {t("Fictional complaints · SLA · independent programme/system queues",
                "কাল্পনিক অভিযোগ · সময়সীমা · পৃথক কর্মসূচি/সিস্টেম তালিকা")}
            </p>
          </div>
          <button className="btn primary" onClick={() => {
            setMode("new");
            setForm({ ...emptyForm, queue, category: types[queue][0] });
            setError("");
            setMessage("");
          }}>
            <Plus size={16} /> {t("New complaint", "নতুন অভিযোগ")}
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          <button className={`btn ${queue === "programme" ? "primary" : ""}`}
            onClick={() => { setQueue("programme"); setMode("list"); setCategoryFilter("all"); }}>
            {t("Programme GRS", "কর্মসূচি জিআরএস")}
          </button>
          {canViewSystem && (
            <button className={`btn ${queue === "system" ? "primary" : ""}`}
              onClick={() => { setQueue("system"); setMode("list"); setCategoryFilter("all"); }}>
              {t("System-use GRM", "সিস্টেম অভিযোগ")}
            </button>
          )}
          <button className="btn" onClick={() => setClockOffset((d) => d + 7)}>
            <Clock3 size={14} /> {t("Advance demo clock +7 days", "ডেমো সময় +৭ দিন")}
          </button>
          <span className="pill a">
            {t("Clock offset", "সময় পরিবর্তন")}: +{clockOffset}d
          </span>
        </div>
        {(error || message) && (
          <p role={error ? "alert" : "status"} style={{
            padding: 11, borderRadius: 9, fontSize: 12,
            background: error ? "#FBE7EF" : "#E4F1EC",
            color: error ? "#A3134B" : "#004B37",
          }}>{error || message}</p>
        )}
      </section>

      {mode !== "new" && (
        <>
          <div className="grid kpis">
            {[
              [t("Total cases", "মোট অভিযোগ"), visible.length, "green"],
              [t("Open cases", "চলমান অভিযোগ"), pending.length, "amber"],
              [t("Overdue", "সময়সীমা পার"), overdueCount, "magenta"],
              [t("Resolved", "নিষ্পত্তিকৃত"), resolvedCount, "blue"],
            ].map(([label, value, color]) => (
              <div className="card stat" key={String(label)}>
                <div className="stat-head">
                  <span>{label}</span>
                  <span className={`stat-icon ${color}`}><ShieldAlert size={18} /></span>
                </div>
                <strong>{value}</strong>
                <small className="muted">{t("Demo register", "ডেমো রেজিস্টার")}</small>
              </div>
            ))}
          </div>
          <div className="grid two">
            <section className="card">
              <div className="card-title">
                <h2>{t("Cases by category", "ধরন অনুযায়ী অভিযোগ")}</h2>
                <span className="pill a">{t("Fictional data", "কাল্পনিক তথ্য")}</span>
              </div>
              {chart.map((c, i) => (
                <div className="quota" key={c.category}>
                  <div>
                    <b>{categories[c.category][lang === "bn" ? 1 : 0]}</b>
                    <span>{c.count}</span>
                  </div>
                  <div className="bar">
                    <i className={i % 2 ? "m" : "g"}
                      style={{ width: `${c.count / maxCount * 100}%` }} />
                  </div>
                </div>
              ))}
            </section>
            <section className="card">
              <div className="card-title">
                <h2>{t("Operational insights", "কার্যক্রমের সূচক")}</h2>
              </div>
              <div className="indicator">
                <span>{t("Open payment complaints", "চলমান পেমেন্ট অভিযোগ")}</span>
                <b>{riskCount}</b>
              </div>
              <div className="indicator">
                <span>{t("Mock National GRS linked", "নমুনা জাতীয় জিআরএস সংযুক্ত")}</span>
                <b>{visible.filter((c) => c.nationalGrsId).length}</b>
              </div>
              <div className="indicator">
                <span>{t("SLA exceeded", "সময়সীমা অতিক্রান্ত")}</span>
                <b>{overdueCount}</b>
              </div>
              <p className="muted">
                {t("Quarterly improvement theme: payment failures and service access. Illustrative backlog insight.",
                  "ত্রৈমাসিক উন্নয়নের নমুনা: পেমেন্ট ব্যর্থতা ও সেবা প্রাপ্তি।")}
              </p>
            </section>
          </div>
        </>
      )}

      {mode === "list" && (
        <section className="card">
          <div className="card-title">
            <h2>{t("Case register", "অভিযোগ রেজিস্টার")}</h2>
            <button className="btn" onClick={() => exportCSV([
              ["Case ID", "Category", "Status", "Union", "Due date"],
              ...filtered.map((c) => [c.id, c.category, c.status, c.union, c.dueAt]),
            ])}>
              <Download size={15} /> CSV
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 13 }}>
            <input style={{ ...inputStyle, flex: 1, minWidth: 170 }}
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search case / beneficiary", "অভিযোগ / উপকারভোগী খুঁজুন")} />
            <select style={{ ...inputStyle, width: 160 }} value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{t("All statuses", "সব অবস্থা")}</option>
              {["open", "assigned", "investigating", "escalated", "resolved", "closed", "reopened"]
                .map((s) => <option key={s}>{s}</option>)}
            </select>
            <select style={{ ...inputStyle, width: 175 }} value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">{t("All categories", "সব ধরন")}</option>
              {types[queue].map((c) =>
                <option key={c} value={c}>{categories[c][lang === "bn" ? 1 : 0]}</option>
              )}
            </select>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr>
                <th>{t("Case", "অভিযোগ")}</th>
                <th>{t("Category", "ধরন")}</th>
                <th>{t("Status", "অবস্থা")}</th>
                <th>{t("SLA", "সময়সীমা")}</th>
                <th>{t("Action", "অ্যাকশন")}</th>
              </tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="mono">{c.id}</span>
                      <div className="muted">{c.anonymous ? t("Confidential report", "গোপন অভিযোগ") : c.title}</div>
                    </td>
                    <td>{categories[c.category][lang === "bn" ? 1 : 0]}</td>
                    <td><span className={`pill ${["closed", "resolved"].includes(c.status) ? "g" : "a"}`}>{c.status}</span></td>
                    <td>
                      <span className={`pill ${overdue(c) ? "m" : "g"}`}>
                        {overdue(c) ? t("Overdue", "সময় পার") : t("Within SLA", "সময়সীমার মধ্যে")}
                      </span>
                    </td>
                    <td><button className="link" onClick={() => {
                      setSelectedId(c.id); setMode("detail"); setNote("");
                      setError(""); setMessage("");
                    }}>{t("Open", "খুলুন")}</button></td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={5}>
                  {t("No cases match these filters.", "ফিল্টারে কোনো অভিযোগ পাওয়া যায়নি।")}
                </td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {mode === "new" && (
        <section className="card">
          <div className="card-title">
            <h2>{t("Register complaint", "অভিযোগ নিবন্ধন")}</h2>
            <button className="btn" onClick={() => setMode("list")}>
              <ArrowLeft size={15} /> {t("Back", "ফিরুন")}
            </button>
          </div>
          <form onSubmit={create}>
            <div className="grid" style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", margin: "15px 0",
            }}>
              <label>
                <span className="muted">{t("Category", "ধরন")}</span>
                <select style={inputStyle} value={form.category}
                  onChange={(e) => setForm({ ...form,
                    category: e.target.value as GrievanceCategory })}>
                  {types[queue].map((c) => <option value={c} key={c}>
                    {categories[c][lang === "bn" ? 1 : 0]}</option>)}
                </select>
              </label>
              <label>
                <span className="muted">{t("Subtype", "উপধরন")}</span>
                <input style={inputStyle} value={form.subtype}
                  onChange={(e) => setForm({ ...form, subtype: e.target.value })} />
              </label>
              <label>
                <span className="muted">{t("Intake channel", "অভিযোগের মাধ্যম")}</span>
                <select style={inputStyle} value={form.channel}
                  onChange={(e) => setForm({ ...form,
                    channel: e.target.value as NewGrievance["channel"] })}>
                  {["web", "mobile", "udc", "helpline", "national_grs"].map((x) =>
                    <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
              <label>
                <span className="muted">{t("Union", "ইউনিয়ন")}</span>
                <select style={inputStyle} value={form.union}
                  onChange={(e) => setForm({ ...form, union: e.target.value })}>
                  {["Kaunia Sadar", "Haragach", "Balarhat", "Begumganj"].map((u) =>
                    <option key={u}>{u}</option>)}
                </select>
              </label>
              <label>
                <span className="muted">{t("Beneficiary ID", "উপকারভোগী আইডি")}</span>
                <input style={inputStyle} value={form.beneficiaryId}
                  onChange={(e) => setForm({ ...form, beneficiaryId: e.target.value })} />
              </label>
              <label>
                <span className="muted">{t("Transaction ID (optional)", "লেনদেন আইডি")}</span>
                <input style={inputStyle} value={form.transactionId}
                  onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
              </label>
            </div>
            <label>
              <span className="muted">{t("Title", "শিরোনাম")}</span>
              <input style={inputStyle} required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label style={{ display: "block", marginTop: 13 }}>
              <span className="muted">{t("Complaint details", "অভিযোগের বিবরণ")}</span>
              <textarea style={{ ...inputStyle, minHeight: 96 }} required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            {form.category === "misconduct" && (
              <label style={{ display: "flex", gap: 9, margin: "13px 0", fontSize: 12 }}>
                <input type="checkbox" checked={form.anonymous}
                  onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} />
                {t("Submit as anonymous misconduct report", "নাম প্রকাশ না করে অভিযোগ")}
              </label>
            )}
            <button className="btn primary" type="submit" style={{ marginTop: 15 }}>
              <Send size={15} /> {t("Register & preview acknowledgement", "নিবন্ধন ও প্রাপ্তিস্বীকার")}
            </button>
          </form>
        </section>
      )}

      {mode === "detail" && selected && (
        <>
          <section className="card">
            <button className="btn" onClick={() => setMode("list")}>
              <ArrowLeft size={15} /> {t("Back to register", "তালিকায় ফিরুন")}
            </button>
            <div className="card-title" style={{ marginTop: 15 }}>
              <div>
                <h2>{selected.id}</h2>
                <p className="sub">{selected.anonymous ? t("Confidential misconduct case", "গোপন অভিযোগ") : selected.title}</p>
              </div>
              <span className="pill a">{selected.status}</span>
            </div>
            <div className="grid" style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", margin: "15px 0",
            }}>
              {[
                [t("Category", "ধরন"), categories[selected.category][lang === "bn" ? 1 : 0]],
                [t("Subtype", "উপধরন"), selected.subtype],
                [t("Channel", "মাধ্যম"), selected.channel],
                [t("Owner", "দায়িত্বপ্রাপ্ত"), selected.owner],
                [t("Union", "ইউনিয়ন"), selected.union],
                [t("Due date", "সময়সীমা"), selected.dueAt.slice(0, 10)],
                [t("Beneficiary ID", "উপকারভোগী আইডি"), selected.beneficiaryId || "—"],
                [t("National GRS", "জাতীয় জিআরএস"), selected.nationalGrsId || "Not linked"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="muted">{label}</div>
                  <strong style={{ fontSize: 12 }}>{value}</strong>
                </div>
              ))}
            </div>
            <p className="sub">{selected.description}</p>
            {selected.resolution && <p className="pill g">{selected.resolution}</p>}
            {linkedPayment && (
              <div className="advisory">
                <div className="ai-mark"><WalletIcon /></div>
                <div>
                  <b>{t("Linked payroll transaction", "সংযুক্ত পেরোল লেনদেন")}</b>
                  <p>{linkedPayment.id} · {linkedPayment.beneficiaryId} · {linkedPayment.status}</p>
                  <p>{t("Resolution requires completed re-payment.", "পুনঃপেমেন্ট সম্পন্ন না হলে নিষ্পত্তি সম্ভব নয়।")}</p>
                </div>
              </div>
            )}
          </section>
          <section className="card">
            <div className="card-title">
              <h2>{t("Case actions", "অভিযোগের কার্যক্রম")}</h2>
              <span className={`pill ${overdue(selected) ? "m" : "g"}`}>
                {overdue(selected) ? t("Overdue", "সময় পার") : t("SLA monitored", "সময়সীমা পর্যবেক্ষিত")}
              </span>
            </div>
            {officer && (
              <>
                <textarea style={{ ...inputStyle, minHeight: 70, margin: "12px 0" }}
                  value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder={t("Action note / evidence / resolution", "কার্যক্রম / প্রমাণ / নিষ্পত্তির বিবরণ")} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {([
                    ["assign", "Assign", "দায়িত্ব দিন"],
                    ["investigate", "Investigate", "তদন্ত"],
                    ["escalate", "Escalate", "উর্ধ্বতনে পাঠান"],
                    ["resolve", "Resolve", "নিষ্পত্তি"],
                    ["close", "Close", "বন্ধ করুন"],
                    ["reopen", "Reopen", "পুনরায় খুলুন"],
                    ["note", "Add note", "নোট যোগ করুন"],
                    ["sync_grs", "Mock National GRS sync", "জাতীয় জিআরএস সিমুলেশন"],
                  ] as const).map(([id, en, bn]) => (
                    <button key={id} className={`btn ${id === "resolve" ? "primary" : ""}`}
                      onClick={() => action(id)}>{t(en, bn)}</button>
                  ))}
                </div>
              </>
            )}
            <p className="muted" style={{ marginTop: 12 }}>
              {t("Notifications, national exchange and escalations are simulated. No messages are sent.",
                "নোটিফিকেশন, জাতীয় জিআরএস ও এস্কেলেশন সিমুলেটেড; কোনো বার্তা পাঠানো হয় না।")}
            </p>
          </section>
          <section className="card">
            <div className="card-title">
              <h2>{t("Case timeline", "অভিযোগের ইতিহাস")}</h2>
              <span className="pill g">{selectedEvents.length}</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead><tr>
                  <th>{t("Action", "অ্যাকশন")}</th>
                  <th>{t("Actor", "ব্যবহারকারী")}</th>
                  <th>{t("Note", "বিবরণ")}</th>
                  <th>{t("Time", "সময়")}</th>
                </tr></thead>
                <tbody>
                  {selectedEvents.map((e) => (
                    <tr key={e.id}>
                      <td>{e.action}</td>
                      <td>{e.actor}</td>
                      <td>{e.note}</td>
                      <td>{new Date(e.time).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB")}</td>
                    </tr>
                  ))}
                  {!selectedEvents.length && <tr><td colSpan={4}>
                    {t("Seeded case — no additional events.", "নমুনা অভিযোগ — অতিরিক্ত ঘটনা নেই।")}
                  </td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function WalletIcon() {
  return <CheckCircle2 size={20} />;
}
