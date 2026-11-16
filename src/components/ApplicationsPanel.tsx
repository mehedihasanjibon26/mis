
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FilePlus2,
  FileText,
  History,
  LockKeyhole,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  useDemoStore,
  type Application,
  type ApplicationStatus,
  type WorkflowAction,
} from "../lib/demo-store";

type Lang = "en" | "bn";
type Props = { lang: Lang; roleId: string };

const T = (lang: Lang, en: string, bn: string) =>
  lang === "bn" ? bn : en;

const initialForm = {
  nameEn: "",
  nameBn: "",
  nid: "",
  mobile: "",
  union: "Kaunia Sadar",
  consent: false,
};

const labels: Record<ApplicationStatus, [string, string]> = {
  draft: ["Draft", "খসড়া"],
  submitted: ["Submitted", "জমা হয়েছে"],
  identity_pending: ["Identity pending", "পরিচয় যাচাই বাকি"],
  identity_verified: ["Identity verified", "পরিচয় যাচাইকৃত"],
  eligibility_passed: ["Eligible", "যোগ্য"],
  eligibility_failed: ["Ineligible", "অযোগ্য"],
  field_pending: ["Field visit pending", "মাঠ যাচাই বাকি"],
  field_completed: ["Field verified", "মাঠ যাচাই সম্পন্ন"],
  selection_prepared: ["Selection prepared", "নির্বাচন প্রস্তুত"],
  approval_pending: ["Awaiting approval", "অনুমোদনের অপেক্ষায়"],
  approved: ["Approved", "অনুমোদিত"],
  rejected: ["Rejected", "প্রত্যাখ্যাত"],
  returned: ["Returned", "সংশোধনের জন্য ফেরত"],
  enrolled: ["Enrolled", "নিবন্ধিত"],
};

const actions: Record<
  WorkflowAction,
  { en: string; bn: string; roles: string[] }
> = {
  verify_identity: {
    en: "Verify identity",
    bn: "পরিচয় যাচাই করুন",
    roles: ["uwao", "union_maker"],
  },
  pass_eligibility: {
    en: "Confirm eligibility",
    bn: "যোগ্যতা নিশ্চিত করুন",
    roles: ["uwao", "union_maker"],
  },
  assign_field: {
    en: "Assign field verification",
    bn: "মাঠ যাচাই নির্ধারণ করুন",
    roles: ["uwao", "union_maker"],
  },
  complete_field: {
    en: "Complete field verification",
    bn: "মাঠ যাচাই সম্পন্ন করুন",
    roles: ["field"],
  },
  prepare_selection: {
    en: "Prepare selection",
    bn: "নির্বাচন প্রস্তুত করুন",
    roles: ["union_maker"],
  },
  request_approval: {
    en: "Send for approval",
    bn: "অনুমোদনের জন্য পাঠান",
    roles: ["union_maker"],
  },
  approve: {
    en: "Approve application",
    bn: "আবেদন অনুমোদন করুন",
    roles: ["uwao"],
  },
  reject: {
    en: "Reject application",
    bn: "আবেদন প্রত্যাখ্যান করুন",
    roles: ["uwao"],
  },
  return: {
    en: "Return for correction",
    bn: "সংশোধনের জন্য ফেরত দিন",
    roles: ["uwao"],
  },
  enroll: {
    en: "Enroll beneficiary",
    bn: "উপকারভোগী নিবন্ধন করুন",
    roles: ["uwao"],
  },
};

function availableActions(status: ApplicationStatus): WorkflowAction[] {
  switch (status) {
    case "submitted":
    case "identity_pending":
    case "returned":
      return ["verify_identity"];
    case "identity_verified":
      return ["pass_eligibility"];
    case "eligibility_passed":
      return ["assign_field"];
    case "field_pending":
      return ["complete_field"];
    case "field_completed":
      return ["prepare_selection"];
    case "selection_prepared":
      return ["request_approval"];
    case "approval_pending":
      return ["approve", "reject", "return"];
    case "approved":
      return ["enroll"];
    default:
      return [];
  }
}

function StatusPill({
  status,
  lang,
}: {
  status: ApplicationStatus;
  lang: Lang;
}) {
  const good: ApplicationStatus[] = [
    "identity_verified",
    "eligibility_passed",
    "field_completed",
    "approved",
    "enrolled",
  ];
  const bad: ApplicationStatus[] = [
    "rejected",
    "eligibility_failed",
  ];

  return (
    <span
      className={`pill ${
        good.includes(status) ? "g" : bad.includes(status) ? "m" : "a"
      }`}
    >
      {labels[status][lang === "bn" ? 1 : 0]}
    </span>
  );
}

export default function ApplicationsPanel({ lang, roleId }: Props) {
  const applications = useDemoStore((s) => s.applications);
  const events = useDemoStore((s) => s.events);
  const createApplication = useDemoStore((s) => s.createApplication);
  const submitApplication = useDemoStore((s) => s.submitApplication);
  const runWorkflow = useDemoStore((s) => s.runWorkflow);

  const [mode, setMode] = useState<"list" | "new" | "detail">("list");
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const tr = (en: string, bn: string) => T(lang, en, bn);
  const selected = applications.find((a) => a.id === selectedId);
  const permittedIntake = ["uwao", "union_maker"].includes(roleId);
  const filtered = applications.filter((a) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      a.id.toLowerCase().includes(q) ||
      a.nameEn.toLowerCase().includes(q) ||
      a.nameBn.includes(q) ||
      a.mobile.includes(q)
    );
  });

  const fieldStyle: React.CSSProperties = {
    display: "grid",
    gap: 7,
    fontSize: 12,
    fontWeight: 600,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 40,
    border: "1px solid #CBD5D0",
    borderRadius: 9,
    padding: "9px 11px",
    font: "inherit",
    background: "#fff",
  };

  function open(item: Application) {
    setSelectedId(item.id);
    setMode("detail");
    setError("");
    setFeedback("");
    setOtp("");
  }

  function saveDraft(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFeedback("");

    if (!permittedIntake) {
      setError(tr("This role cannot register applications.", "এই ভূমিকায় আবেদন তৈরি করা যাবে না।"));
      return;
    }

    if (
      !form.nameEn.trim() ||
      !/^\d{10}$|^\d{13}$|^\d{17}$/.test(form.nid) ||
      !/^01\d{9}$/.test(form.mobile) ||
      !form.consent
    ) {
      setError(
        tr(
          "Provide a name, a 10/13/17-digit fictional NID, an 11-digit mobile number and consent.",
          "নাম, ১০/১৩/১৭ সংখ্যার কাল্পনিক এনআইডি, ১১ সংখ্যার মোবাইল ও সম্মতি দিন।"
        )
      );
      return;
    }

    const id = createApplication(form, roleId);
    setSelectedId(id);
    setForm(initialForm);
    setMode("detail");
    setFeedback(tr("Draft saved successfully.", "খসড়া সংরক্ষিত হয়েছে।"));
  }

  function submit() {
    if (!selected || !permittedIntake) return;
    const ok = submitApplication(selected.id, roleId);
    if (ok) {
      setError("");
      setFeedback(tr("Application submitted.", "আবেদন জমা হয়েছে।"));
    } else {
      setError(tr("Submission failed.", "আবেদন জমা দেওয়া যায়নি।"));
    }
  }

  function execute(action: WorkflowAction) {
    if (!selected) return;

    const result = runWorkflow(selected.id, action, roleId, otp);
    setError("");
    setFeedback("");

    if (result.ok) {
      setFeedback(
        tr(
          `${actions[action].en} completed. Status updated across the demo.`,
          `${actions[action].bn} সম্পন্ন হয়েছে। ডেমোর তথ্য আপডেট হয়েছে।`
        )
      );
      setOtp("");
    } else {
      setError(result.message);
    }
  }

  const timeline = selected
    ? events.filter((event) => event.applicationId === selected.id).slice().reverse()
    : [];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card">
        <div className="card-title" style={{ gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2>{tr("Application management", "আবেদন ব্যবস্থাপনা")}</h2>
            <p className="sub">
              {tr(
                "Fictional records · role-based workflow · persistent demo",
                "কাল্পনিক তথ্য · ভূমিকা অনুযায়ী কার্যক্রম · সংরক্ষিত ডেমো"
              )}
            </p>
          </div>
          {mode !== "list" ? (
            <button className="btn" onClick={() => {
              setMode("list");
              setError("");
              setFeedback("");
            }}>
              <ArrowLeft size={15} />
              {tr("Back to list", "তালিকায় ফিরুন")}
            </button>
          ) : permittedIntake ? (
            <button className="btn primary" onClick={() => {
              setForm(initialForm);
              setMode("new");
              setError("");
              setFeedback("");
            }}>
              <FilePlus2 size={16} />
              {tr("New application", "নতুন আবেদন")}
            </button>
          ) : null}
        </div>
        {(error || feedback) && (
          <div
            role={error ? "alert" : "status"}
            style={{
              marginTop: 12,
              padding: "11px 13px",
              borderRadius: 9,
              fontSize: 12,
              background: error ? "#FBE7EF" : "#E4F1EC",
              color: error ? "#A3134B" : "#004B37",
            }}
          >
            {error || feedback}
          </div>
        )}
      </section>

      {mode === "list" && (
        <section className="card">
          <div className="card-title">
            <h2>{tr("Application register", "আবেদন রেজিস্টার")}</h2>
            <span className="pill g">{applications.length} {tr("records", "রেকর্ড")}</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #CBD5D0",
            borderRadius: 9,
            padding: "0 12px",
            marginBottom: 14,
          }}>
            <Search size={17} color="#5B6660" />
            <input
              aria-label={tr("Search applications", "আবেদন অনুসন্ধান")}
              placeholder={tr("Search by ID, name or mobile", "আইডি, নাম বা মোবাইল দিয়ে খুঁজুন")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 0",
                border: 0,
                outline: "none",
                background: "transparent",
              }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>{tr("Application", "আবেদন")}</th>
                  <th>{tr("Applicant", "আবেদনকারী")}</th>
                  <th>{tr("Union", "ইউনিয়ন")}</th>
                  <th>{tr("Status", "অবস্থা")}</th>
                  <th>{tr("Action", "অ্যাকশন")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="mono">{item.id}</td>
                    <td>{lang === "bn" ? item.nameBn || item.nameEn : item.nameEn}</td>
                    <td>{item.union}</td>
                    <td><StatusPill status={item.status} lang={lang} /></td>
                    <td>
                      <button className="link" onClick={() => open(item)}>
                        {tr("Open", "খুলুন")} <ChevronRight size={13} style={{ verticalAlign: "middle" }} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      {tr("No matching applications.", "কোনো আবেদন পাওয়া যায়নি।")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {mode === "new" && (
        <section className="card">
          <div className="card-title">
            <h2>{tr("Register an application", "নতুন আবেদন নিবন্ধন")}</h2>
            <FileText size={18} color="#006A4E" />
          </div>
          <form onSubmit={saveDraft}>
            <div className="grid" style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              margin: "18px 0",
            }}>
              <label style={fieldStyle}>
                {tr("Applicant name (English) *", "নাম (ইংরেজি) *")}
                <input
                  style={inputStyle}
                  required
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                />
              </label>
              <label style={fieldStyle}>
                {tr("Applicant name (Bangla)", "নাম (বাংলা)")}
                <input
                  style={inputStyle}
                  value={form.nameBn}
                  onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                />
              </label>
              <label style={fieldStyle}>
                {tr("Fictional NID *", "কাল্পনিক এনআইডি *")}
                <input
                  style={inputStyle}
                  required
                  inputMode="numeric"
                  maxLength={17}
                  value={form.nid}
                  onChange={(e) => setForm({ ...form, nid: e.target.value })}
                />
              </label>
              <label style={fieldStyle}>
                {tr("Fictional mobile *", "কাল্পনিক মোবাইল *")}
                <input
                  style={inputStyle}
                  required
                  maxLength={11}
                  inputMode="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </label>
              <label style={fieldStyle}>
                {tr("Union", "ইউনিয়ন")}
                <select
                  style={inputStyle}
                  value={form.union}
                  onChange={(e) => setForm({ ...form, union: e.target.value })}
                >
                  {["Kaunia Sadar", "Haragach", "Balarhat"].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </label>
            </div>

            <label style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 12,
              marginBottom: 17,
            }}>
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              />
              {tr(
                "Applicant consent confirmed for this fictional demo record.",
                "কাল্পনিক ডেমো রেকর্ডের জন্য আবেদনকারীর সম্মতি নিশ্চিত।"
              )}
            </label>

            <button className="btn primary" type="submit">
              <CheckCircle2 size={15} />
              {tr("Save draft", "খসড়া সংরক্ষণ")}
            </button>
          </form>
        </section>
      )}

      {mode === "detail" && selected && (
        <>
          <section className="card">
            <div className="card-title" style={{ gap: 10, flexWrap: "wrap" }}>
              <div>
                <h2>{selected.id}</h2>
                <p className="sub">
                  {lang === "bn"
                    ? selected.nameBn || selected.nameEn
                    : selected.nameEn}
                </p>
              </div>
              <StatusPill status={selected.status} lang={lang} />
            </div>

            <div className="grid" style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              margin: "18px 0",
            }}>
              {[
                [tr("Applicant", "আবেদনকারী"), selected.nameEn],
                [tr("NID (masked)", "এনআইডি (আংশিক)"), "••••" + selected.nid.slice(-4)],
                [tr("Mobile (masked)", "মোবাইল (আংশিক)"), "••••" + selected.mobile.slice(-3)],
                [tr("District", "জেলা"), selected.district],
                [tr("Upazila", "উপজেলা"), selected.upazila],
                [tr("Union", "ইউনিয়ন"), selected.union],
                [tr("Maker", "মেকার"), selected.makerId || "—"],
                [tr("Checker", "চেকার"), selected.checkerId || "—"],
                [tr("Beneficiary ID", "উপকারভোগী আইডি"), selected.beneficiaryId || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="muted">{label}</div>
                  <strong style={{ display: "block", marginTop: 6, fontSize: 12 }}>
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-title">
              <h2>
                <ClipboardCheck size={17} style={{ verticalAlign: "middle", marginRight: 7 }} />
                {tr("Workflow actions", "ওয়ার্কফ্লো অ্যাকশন")}
              </h2>
              <span className="muted">{tr("Current role", "বর্তমান ভূমিকা")}: {roleId}</span>
            </div>

            {selected.status === "draft" && permittedIntake && (
              <button className="btn primary" onClick={submit}>
                <Send size={15} />
                {tr("Submit application", "আবেদন জমা দিন")}
              </button>
            )}

            {selected.status === "enrolled" && (
              <div style={{ color: "#006A4E", display: "flex", gap: 9, alignItems: "center", fontSize: 13 }}>
                <CheckCircle2 size={20} />
                {tr("Beneficiary enrollment completed.", "উপকারভোগী নিবন্ধন সম্পন্ন হয়েছে।")}
              </div>
            )}

            {["rejected", "eligibility_failed"].includes(selected.status) && (
              <p className="sub">
                {tr("This application has no further available demo actions.", "এই আবেদনের পরবর্তী ডেমো অ্যাকশন নেই।")}
              </p>
            )}

            {availableActions(selected.status).length > 0 && (
              <>
                <p className="sub" style={{ marginBottom: 13 }}>
                  {tr(
                    "Available actions depend on the selected role and current case status.",
                    "অ্যাকশন বর্তমান ভূমিকা ও আবেদনের অবস্থার ওপর নির্ভর করে।"
                  )}
                </p>

                {selected.status === "approval_pending" && roleId === "uwao" && (
                  <label style={{ ...fieldStyle, maxWidth: 260, marginBottom: 14 }}>
                    <span><LockKeyhole size={13} style={{ verticalAlign: "middle" }} /> {tr("Demo checker OTP", "ডেমো চেকার ওটিপি")}</span>
                    <input
                      style={inputStyle}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="123456"
                    />
                    <span className="muted">
                      {tr("Simulation only. OTP: 123456", "শুধু সিমুলেশন। ওটিপি: 123456")}
                    </span>
                  </label>
                )}

                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {availableActions(selected.status).map((action) => {
                    const allowed = actions[action].roles.includes(roleId);
                    return (
                      <button
                        type="button"
                        key={action}
                        className={`btn ${
                          allowed && !["reject", "return"].includes(action)
                            ? "primary"
                            : ""
                        }`}
                        disabled={!allowed}
                        title={!allowed ? tr("Switch to the required demo role", "প্রয়োজনীয় ডেমো ভূমিকায় যান") : undefined}
                        style={!allowed ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                        onClick={() => execute(action)}
                      >
                        {allowed ? <ShieldCheck size={15} /> : <LockKeyhole size={15} />}
                        {tr(actions[action].en, actions[action].bn)}
                      </button>
                    );
                  })}
                </div>

                {availableActions(selected.status).every(
                  (action) => !actions[action].roles.includes(roleId)
                ) && (
                  <p className="sub" style={{ marginTop: 12 }}>
                    {tr(
                      `Switch demo role to: ${[
                        ...new Set(availableActions(selected.status).flatMap((a) => actions[a].roles)),
                      ].join(" / ")}`,
                      "এই ধাপের জন্য প্রয়োজনীয় ভূমিকা নির্বাচন করুন।"
                    )}
                  </p>
                )}
              </>
            )}
          </section>

          <section className="card">
            <div className="card-title">
              <h2><History size={17} style={{ verticalAlign: "middle", marginRight: 7 }} />
                {tr("Case activity history", "আবেদনের কার্যক্রমের ইতিহাস")}
              </h2>
              <span className="pill g">{timeline.length}</span>
            </div>
            {timeline.length ? (
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>{tr("Action", "অ্যাকশন")}</th>
                      <th>{tr("Actor", "ব্যবহারকারী")}</th>
                      <th>{tr("Time", "সময়")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map((event) => (
                      <tr key={event.id}>
                        <td>{event.action.replaceAll("_", " ")}</td>
                        <td>{event.actorId}</td>
                        <td>{new Date(event.timestamp).toLocaleString(
                          lang === "bn" ? "bn-BD" : "en-GB"
                        )}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="sub">{tr("No recorded activity yet.", "এখনো কোনো কার্যক্রমের রেকর্ড নেই।")}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
