
"use client";

import { useState } from "react";
import {
  ArrowLeft, Search, UserRound, Wallet, HeartPulse,
  GraduationCap, MessageSquareWarning, History,
  ShieldCheck, FilePenLine, CheckCircle2,
} from "lucide-react";
import { useDemoStore } from "../lib/demo-store";
import {
  useBeneficiaryStore, sampleProfiles,
  type Profile, type ChangeAction,
} from "../lib/beneficiary-store";
import { usePayrollStore } from "../lib/payroll-store";
import { useTrainingStore } from "../lib/training-store";

type Lang = "en" | "bn";
type Tab = "overview" | "payments" | "health" | "training" | "grievances" | "audit";
type Props = { lang: Lang; roleId: string };

const tabs: { id: Tab; en: string; bn: string }[] = [
  { id: "overview", en: "Overview", bn: "সারসংক্ষেপ" },
  { id: "payments", en: "Payments", bn: "পেমেন্ট" },
  { id: "health", en: "Health", bn: "স্বাস্থ্য" },
  { id: "training", en: "Training", bn: "প্রশিক্ষণ" },
  { id: "grievances", en: "Grievances", bn: "অভিযোগ" },
  { id: "audit", en: "Audit history", bn: "অডিট ইতিহাস" },
];

const changeTypes: { id: ChangeAction; en: string; bn: string }[] = [
  { id: "correction", en: "Correct name", bn: "নাম সংশোধন" },
  { id: "transfer", en: "Transfer union", bn: "ইউনিয়ন পরিবর্তন" },
  { id: "suspend", en: "Suspend", bn: "স্থগিত" },
  { id: "reactivate", en: "Reactivate", bn: "পুনরায় সক্রিয়" },
  { id: "graduate", en: "Graduate", bn: "সমাপ্ত ঘোষণা" },
  { id: "exit", en: "Exit programme", bn: "কর্মসূচি থেকে প্রস্থান" },
  { id: "archive", en: "Archive", bn: "আর্কাইভ" },
  { id: "erase", en: "Simulated erasure", bn: "তথ্য মুছে ফেলার সিমুলেশন" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #CBD5D0",
  borderRadius: 9,
  font: "inherit",
  background: "#fff",
};

export default function BeneficiariesPanel({ lang, roleId }: Props) {
  const applications = useDemoStore((s) => s.applications);
  const applicationEvents = useDemoStore((s) => s.events);
  const overrides = useBeneficiaryStore((s) => s.overrides);
  const changes = useBeneficiaryStore((s) => s.changes);
  const events = useBeneficiaryStore((s) => s.events);
  const submitChange = useBeneficiaryStore((s) => s.submitChange);
  const reviewChange = useBeneficiaryStore((s) => s.reviewChange);
  const payments = usePayrollStore((s) => s.payments);
  const payrollLogs = usePayrollStore((s) => s.logs);
  const trainingSessions = useTrainingStore((s) => s.sessions);
  const trainingParticipants = useTrainingStore((s) => s.participants);

  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [action, setAction] = useState<ChangeAction>("correction");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  const enrolled: Profile[] = applications
    .filter((a) => a.status === "enrolled" && a.beneficiaryId)
    .map((a) => ({
      id: a.beneficiaryId!,
      applicationId: a.id,
      nameEn: a.nameEn,
      nameBn: a.nameBn,
      nidLast4: a.nid.slice(-4),
      mobileLast3: a.mobile.slice(-3),
      district: a.district,
      upazila: a.upazila,
      union: a.union,
      child: "Not recorded",
      household: "Not recorded",
      started: a.updatedAt,
      monthsUsed: 0,
      consent: a.consent,
      status: "active",
      sample: false,
    }));

  const merged = new Map<string, Profile>();
  [...sampleProfiles, ...enrolled].forEach((p) => {
    merged.set(p.id, { ...p, ...(overrides[p.id] ?? {}) });
  });

  const allProfiles = [...merged.values()];
  const national = ["executive", "admin", "finance", "finance_checker"].includes(roleId);
  const profiles = allProfiles.filter((p) => national || p.upazila === "Kaunia");
  const filtered = profiles.filter((p) =>
    `${p.id} ${p.nameEn} ${p.nameBn} ${p.applicationId}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  const profile = profiles.find((p) => p.id === selectedId);
  const profilePayments = payments.filter((p) => p.beneficiaryId === selectedId);
  const profileEvents = events.filter((e) => e.profileId === selectedId);
  const linkedEvents = applicationEvents.filter(
    (e) => e.applicationId === profile?.applicationId
  );
  const linkedPayrollLogs = payrollLogs.filter((log) =>
    profilePayments.some((p) => p.id === log.paymentId)
  );
  const profileTraining = trainingParticipants
    .filter((participant) => participant.beneficiaryId === selectedId)
    .map((participant) => ({
      participant,
      session: trainingSessions.find((session) => session.id === participant.sessionId),
    }));
  const pending = changes.filter(
    (r) => r.profileId === selectedId && r.state === "pending"
  );

  const restricted = roleId === "field";
  const financeOnly = ["finance", "finance_checker"].includes(roleId);
  const maker = roleId === "union_maker" && profile?.upazila === "Kaunia";
  const canReview = ["uwao", "admin"].includes(roleId);

  const permittedTabs = tabs.filter((item) =>
    restricted
      ? ["overview", "health", "training"].includes(item.id)
      : financeOnly
        ? ["overview", "payments"].includes(item.id)
        : true
  );

  function notify(ok: boolean, text: string) {
    setFailed(!ok);
    setMessage(text);
  }

  function submit() {
    if (!profile) return;
    const r = submitChange(profile, action, value, reason, roleId);
    notify(r.ok, r.message);
    if (r.ok) {
      setValue("");
      setReason("");
    }
  }

  function review(id: string, approve: boolean) {
    const r = reviewChange(id, approve, roleId, otp);
    notify(r.ok, r.message);
    if (r.ok) setOtp("");
  }

  function openProfile(id: string) {
    setSelectedId(id);
    setTab("overview");
    setMessage("");
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "9px 12px",
    border: "1px solid #D5DED9",
    borderRadius: 9,
    background: active ? "#006A4E" : "#fff",
    color: active ? "#fff" : "#26352E",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card">
        <div className="card-title" style={{ flexWrap: "wrap" }}>
          <div>
            <h2><UserRound size={18} style={{ verticalAlign: "middle", marginRight: 7 }} />
              {t("Beneficiary Registry", "উপকারভোগী রেজিস্ট্রি")}
            </h2>
            <p className="sub">
              {t("Connected 360° profile · programme lifecycle · fictional data",
                "সংযুক্ত ৩৬০° প্রোফাইল · কর্মসূচির জীবনচক্র · কাল্পনিক তথ্য")}
            </p>
          </div>
          <span className="pill g">
            {enrolled.length} {t("workflow enrollments", "ওয়ার্কফ্লো নিবন্ধন")}
          </span>
        </div>
      </section>

      {!profile ? (
        <>
          <div className="grid kpis">
            {[
              [t("Visible profiles", "দৃশ্যমান প্রোফাইল"), profiles.length, "green"],
              [t("Active", "সক্রিয়"), profiles.filter((p) => p.status === "active").length, "green"],
              [t("Suspended", "স্থগিত"), profiles.filter((p) => p.status === "suspended").length, "amber"],
              [t("Pending reviews", "রিভিউ অপেক্ষমাণ"), changes.filter((c) => c.state === "pending").length, "magenta"],
            ].map(([label, count, color], i) => (
              <div className="card stat" key={i}>
                <div className="stat-head">
                  <span>{label}</span>
                  <span className={`stat-icon ${color}`}><ShieldCheck size={18} /></span>
                </div>
                <strong>{count}</strong>
                <small className="muted">{t("Demo records", "ডেমো রেকর্ড")}</small>
              </div>
            ))}
          </div>
          <section className="card">
            <div className="card-title">
              <h2>{t("Registry & search", "রেজিস্ট্রি ও অনুসন্ধান")}</h2>
              <Search size={18} color="#006A4E" />
            </div>
            <input
              style={{ ...inputStyle, marginBottom: 14 }}
              placeholder={t("Search beneficiary ID or name", "আইডি বা নাম খুঁজুন")}
              aria-label="Search beneficiary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>{t("Beneficiary", "উপকারভোগী")}</th>
                    <th>{t("Name", "নাম")}</th>
                    <th>{t("Union", "ইউনিয়ন")}</th>
                    <th>{t("Status", "অবস্থা")}</th>
                    <th>{t("Action", "অ্যাকশন")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="mono">{p.id}</td>
                      <td>{p.status === "erased" ? "Erased record" : lang === "bn" ? p.nameBn || p.nameEn : p.nameEn}
                        {p.sample && <span className="muted"> · sample</span>}
                      </td>
                      <td>{p.union}</td>
                      <td><span className="pill g">{p.status}</span></td>
                      <td><button className="link" onClick={() => openProfile(p.id)}>
                        {t("Open", "খুলুন")}
                      </button></td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr><td colSpan={5}>{t("No records found.", "কোনো রেকর্ড পাওয়া যায়নি।")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <section className="card">
            <div className="card-title">
              <h2>{t("Illustrative coverage trend", "নমুনা কভারেজ প্রবণতা")}</h2>
              <span className="pill a">{t("Sample data", "নমুনা তথ্য")}</span>
            </div>
            <div className="chart">
              {[46, 59, 55, 67, 72, 64, 81, 89].map((h, i) => (
                <div className="bar-col" key={i}>
                  <span style={{ height: `${h}%` }} />
                  <span style={{ height: `${h - 18}%` }} />
                  <label>W{i + 1}</label>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="card">
            <button className="btn" onClick={() => setSelectedId("")}>
              <ArrowLeft size={15} /> {t("Back to registry", "রেজিস্ট্রিতে ফিরুন")}
            </button>
            <div className="card-title" style={{ marginTop: 15 }}>
              <div>
                <h2>{profile.status === "erased" ? "Erased record" : lang === "bn" ? profile.nameBn || profile.nameEn : profile.nameEn}</h2>
                <p className="sub">{profile.id} · {profile.union}</p>
              </div>
              <span className="pill g">{profile.status}</span>
            </div>
            <div className="grid" style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
              marginTop: 16,
            }}>
              {[
                [t("Application", "আবেদন"), profile.applicationId],
                [t("NID", "এনআইডি"), restricted ? "••••" : `••••${profile.nidLast4}`],
                [t("Mobile", "মোবাইল"), `••••${profile.mobileLast3}`],
                [t("District", "জেলা"), profile.district],
                [t("Upazila", "উপজেলা"), profile.upazila],
                [t("Union", "ইউনিয়ন"), profile.union],
                [t("Household", "পরিবার"), restricted ? "Restricted" : profile.household],
                [t("Child", "শিশু"), restricted ? "Restricted" : profile.child],
                [t("Consent", "সম্মতি"), profile.consent ? "Confirmed" : "Pending"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="muted">{label}</div>
                  <strong style={{ fontSize: 12 }}>
                    {profile.status === "erased" ? "—" : value}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-title">
              <h2>{t("36-month programme lifecycle", "৩৬ মাসের জীবনচক্র")}</h2>
              <span className="pill g">{profile.monthsUsed} / 36</span>
            </div>
            <div className="bar" style={{ height: 12 }}>
              <i className="g" style={{ width: `${Math.min(100, profile.monthsUsed / 36 * 100)}%` }} />
            </div>
            <div className="grid" style={{
              gridTemplateColumns: "repeat(12,minmax(0,1fr))",
              gap: 4, marginTop: 13,
            }}>
              {Array.from({ length: 36 }, (_, i) => (
                <div key={i} title={`Month ${i + 1}`} style={{
                  height: 18,
                  borderRadius: 4,
                  background: i < profile.monthsUsed ? "#006A4E" : "#E5ECE8",
                }} />
              ))}
            </div>
            <p className="muted" style={{ marginTop: 10 }}>
              {t("Start date", "শুরুর তারিখ")}: {profile.started.slice(0, 10)}
            </p>
          </section>

          <section className="card">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 17 }}>
              {permittedTabs.map((item) => (
                <button
                  key={item.id}
                  style={tabStyle(tab === item.id)}
                  onClick={() => setTab(item.id)}
                >{t(item.en, item.bn)}</button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="grid" style={{
                gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
              }}>
                {[
                  [UserRound, t("Profile", "প্রোফাইল"), profile.status],
                  [Wallet, t("Payment records", "পেমেন্ট রেকর্ড"), String(profilePayments.length)],
                  [HeartPulse, t("Health", "স্বাস্থ্য"), "ANC / PNC"],
                  [GraduationCap, t("Training", "প্রশিক্ষণ"), "Not linked"],
                  [MessageSquareWarning, t("Grievances", "অভিযোগ"), "Not linked"],
                ].map(([Icon, label, value], i) => {
                  const Glyph = Icon as typeof UserRound;
                  return (
                    <div className="card" key={i}>
                      <Glyph size={19} color="#006A4E" />
                      <p className="muted">{label as string}</p>
                      <strong style={{ fontSize: 13 }}>{value as string}</strong>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "payments" && (
              <>
                <h2><Wallet size={17} /> {t("Linked payment history", "সংযুক্ত পেমেন্ট ইতিহাস")}</h2>
                <p className="sub">{t(
                  "Fictional transactions linked to this beneficiary ID, including settlement and repayments.",
                  "এই উপকারভোগী আইডির সঙ্গে সংযুক্ত কাল্পনিক লেনদেন ও পুনঃপেমেন্ট।"
                )}</p>
                <div style={{ overflowX: "auto", marginTop: 14 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>{t("Transaction", "লেনদেন")}</th>
                        <th>{t("Amount", "পরিমাণ")}</th>
                        <th>{t("Status", "অবস্থা")}</th>
                        <th>{t("Reference", "রেফারেন্স")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profilePayments.map((p) => (
                        <tr key={p.id}>
                          <td className="mono">{p.id}</td>
                          <td>৳{p.amount}</td>
                          <td><span className={`pill ${
                            ["paid", "repaid"].includes(p.status)
                              ? "g" : p.status === "bounced" ? "m" : "a"
                          }`}>{p.status}</span></td>
                          <td className="mono">{p.reference}</td>
                        </tr>
                      ))}
                      {!profilePayments.length && (
                        <tr><td colSpan={4}>
                          {t("No payroll transactions linked yet.", "এখনো কোনো পেরোল লেনদেন যুক্ত নেই।")}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "health" && (
              <>
                <h2><HeartPulse size={17} /> {t("Health monitoring", "স্বাস্থ্য পর্যবেক্ষণ")}</h2>
                <p className="sub">{t(
                  "Illustrative ANC/PNC indicators; no DGHS connection.",
                  "নমুনা এএনসি/পিএনসি সূচক; ডিএইচজিএস সংযুক্ত নয়।"
                )}</p>
                {[
                  [t("ANC visits", "এএনসি ভিজিট"), "3 / 4"],
                  [t("PNC follow-ups", "পিএনসি ফলোআপ"), "1 / 2"],
                ].map(([label, value]) => (
                  <div className="indicator" key={label}><span>{label}</span><b>{value}</b></div>
                ))}
              </>
            )}

            {tab === "training" && (
              <>
                <h2><GraduationCap size={17} /> {t("Training", "?????????")}</h2>
                <p className="sub">{t(
                  "Attendance, assessments, and certificates linked by Beneficiary ID.",
                  "????????? ???? ????? ??????? ????????, ????????? ? ????"
                )}</p>
                <div style={{ overflowX: "auto", marginTop: 12 }}>
                  <table>
                    <thead><tr>
                      <th>{t("Session", "????")}</th>
                      <th>{t("Date / venue", "????? / ?????")}</th>
                      <th>{t("Attendance", "????????")}</th>
                      <th>{t("Assessment", "?????????")}</th>
                      <th>{t("Certificate", "???")}</th>
                    </tr></thead>
                    <tbody>
                      {profileTraining.map(({ participant, session }) => (
                        <tr key={participant.id}>
                          <td><b>{session?.title ?? participant.sessionId}</b><div className="mono">{participant.beneficiaryId}</div></td>
                          <td>{session?.date ?? "?"}<div className="muted">{session?.venue ?? "?"}</div></td>
                          <td><span className={`pill ${participant.attended ? "g" : "a"}`}>
                            {participant.offlinePending ? t("Offline queued", "?????? ?????????") : participant.attended ? t("Present", "???????") : t("Pending", "?????????")}
                          </span></td>
                          <td>{participant.postScore === null ? "?" : `${participant.preScore} ? ${participant.postScore} (${participant.feedback ?? "?"}/5)`}</td>
                          <td>{participant.certificateId || "?"}</td>
                        </tr>
                      ))}
                      {!profileTraining.length && <tr><td colSpan={5}>
                        {t("No training records linked to this Beneficiary ID yet.", "?? ????????? ????? ????? ???? ???? ????????? ?????? ????? ????")}
                      </td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "grievances" && (
              <>
                <h2><MessageSquareWarning size={17} /> {t("Grievances", "অভিযোগ")}</h2>
                <p className="sub">{t(
                  "Beneficiary-linked grievances and referrals will appear after Grievance module integration.",
                  "অভিযোগ মডিউল যুক্ত হলে সংশ্লিষ্ট অভিযোগ ও রেফারেল এখানে আসবে।"
                )}</p>
              </>
            )}

            {tab === "audit" && (
              <>
                <h2><History size={17} /> {t("Combined activity history", "সমন্বিত কার্যক্রমের ইতিহাস")}</h2>
                <div style={{ overflowX: "auto", marginTop: 12 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>{t("Action", "অ্যাকশন")}</th>
                        <th>{t("Actor", "ব্যবহারকারী")}</th>
                        <th>{t("Time", "সময়")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ...profileEvents.map((e) => ({
                          id: e.id, action: e.text, actor: e.actor, date: e.date,
                        })),
                        ...linkedEvents.map((e) => ({
                          id: e.id, action: e.action, actor: e.actorId, date: e.timestamp,
                        })),
                        ...linkedPayrollLogs.map((e) => ({
                          id: e.id, action: e.action, actor: e.actor, date: e.time,
                        })),
                      ].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
                        <tr key={e.id}>
                          <td>{e.action.replaceAll("_", " ")}</td>
                          <td>{restricted ? "••••" : e.actor}</td>
                          <td>{new Date(e.date).toLocaleString((typeof lang !== "undefined" && lang === "bn") ? "bn-BD" : "en-GB")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          {!restricted && !financeOnly && (
            <section className="card">
              <div className="card-title">
                <h2><FilePenLine size={17} /> {t("Lifecycle changes & approvals", "জীবনচক্র পরিবর্তন ও অনুমোদন")}</h2>
                <span className="pill a">{t("Maker / Checker", "মেকার / চেকার")}</span>
              </div>
              {message && (
                <p role={failed ? "alert" : "status"} style={{
                  background: failed ? "#FBE7EF" : "#E4F1EC",
                  color: failed ? "#A3134B" : "#004B37",
                  padding: 11, borderRadius: 8, fontSize: 12,
                }}>{message}</p>
              )}
              {maker && profile.status !== "erased" && (
                <div className="grid" style={{
                  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
                  margin: "15px 0",
                }}>
                  <label>
                    <span className="muted">{t("Change type", "পরিবর্তনের ধরন")}</span>
                    <select
                      style={inputStyle}
                      value={action}
                      onChange={(e) => setAction(e.target.value as ChangeAction)}
                    >
                      {changeTypes.map((item) => (
                        <option key={item.id} value={item.id}>{t(item.en, item.bn)}</option>
                      ))}
                    </select>
                  </label>
                  {["correction", "transfer"].includes(action) && (
                    <label>
                      <span className="muted">{t("New value", "নতুন তথ্য")}</span>
                      <input style={inputStyle} value={value} onChange={(e) => setValue(e.target.value)} />
                    </label>
                  )}
                  <label>
                    <span className="muted">{t("Reason", "কারণ")}</span>
                    <input style={inputStyle} value={reason} onChange={(e) => setReason(e.target.value)} />
                  </label>
                  <div style={{ display: "flex", alignItems: "end" }}>
                    <button className="btn primary" onClick={submit}>
                      {t("Submit change", "পরিবর্তন পাঠান")}
                    </button>
                  </div>
                </div>
              )}

              {pending.map((request) => (
                <div className="card" key={request.id} style={{ marginTop: 12 }}>
                  <div className="card-title">
                    <b style={{ fontSize: 13 }}>{request.action.toUpperCase()}</b>
                    <span className="pill a">{t("Pending", "অপেক্ষমাণ")}</span>
                  </div>
                  <p className="sub">{request.before} → {request.after}</p>
                  <p className="muted">
                    {t("Reason", "কারণ")}: {request.reason} · Maker: {request.maker}
                  </p>
                  {canReview && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <input
                        style={{ ...inputStyle, width: 150 }}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="OTP: 123456"
                        maxLength={6}
                      />
                      <button className="btn primary" onClick={() => review(request.id, true)}>
                        <CheckCircle2 size={15} /> {t("Approve", "অনুমোদন")}
                      </button>
                      <button className="btn" onClick={() => review(request.id, false)}>
                        {t("Reject", "বাতিল")}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!pending.length && (
                <p className="muted">
                  {t("No pending changes.", "কোনো পরিবর্তন অপেক্ষমাণ নেই।")}
                </p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
