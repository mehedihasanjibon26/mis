
"use client";

import { useState } from "react";
import {
  CalendarDays, Users, GraduationCap, ClipboardCheck,
  BookOpen, Download, Printer, WifiOff, RefreshCw,
  Plus, Search, CheckCircle2, MessageSquare,
} from "lucide-react";
import { useTrainingStore, type Topic, type TrainingPerson }
  from "../lib/training-store";
import { useDemoStore } from "../lib/demo-store";
import { useBeneficiaryStore, sampleProfiles } from "../lib/beneficiary-store";

type Props = { lang: "en" | "bn"; roleId: string };
type View = "schedule" | "attendance" | "content" | "reports";
type ContentKind = "Flipbook" | "Video" | "Guide";

const topics: Record<Topic, [string, string]> = {
  nutrition: ["Maternal nutrition", "মাতৃ পুষ্টি"],
  anc_pnc: ["ANC / PNC awareness", "এএনসি / পিএনসি সচেতনতা"],
  child_development: ["Early childhood development", "শিশুর প্রাথমিক বিকাশ"],
  hygiene: ["Family hygiene", "পারিবারিক স্বাস্থ্যবিধি"],
};

const materials: { name: string; kind: ContentKind; topic: Topic }[] = [
  { name: "Balanced Diet for Mothers", kind: "Flipbook", topic: "nutrition" },
  { name: "Four ANC Visits Explained", kind: "Video", topic: "anc_pnc" },
  { name: "Early Learning at Home", kind: "Guide", topic: "child_development" },
  { name: "Safe Water & Hygiene", kind: "Guide", topic: "hygiene" },
];

const field: React.CSSProperties = {
  width: "100%",
  border: "1px solid #CBD5D0",
  borderRadius: 8,
  padding: "10px 11px",
  background: "#fff",
  font: "inherit",
};

function exportCsv(name: string, rows: string[][]) {
  const csv = rows.map((r) =>
    r.map((x) => `"${x.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function TrainingPanel({ lang, roleId }: Props) {
  const sessions = useTrainingStore((s) => s.sessions);
  const participants = useTrainingStore((s) => s.participants);
  const logs = useTrainingStore((s) => s.logs);
  const createSession = useTrainingStore((s) => s.createSession);
  const enroll = useTrainingStore((s) => s.enroll);
  const invite = useTrainingStore((s) => s.invite);
  const attendance = useTrainingStore((s) => s.attendance);
  const syncOffline = useTrainingStore((s) => s.syncOffline);
  const assess = useTrainingStore((s) => s.assess);
  const completeSession = useTrainingStore((s) => s.completeSession);

  const applications = useDemoStore((s) => s.applications);
  const overrides = useBeneficiaryStore((s) => s.overrides);
  const [view, setView] = useState<View>("schedule");
  const [sessionId, setSessionId] = useState("TRN-2611-001");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [scanId, setScanId] = useState("");
  const [offline, setOffline] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [pre, setPre] = useState(35);
  const [post, setPost] = useState(80);
  const [feedback, setFeedback] = useState(5);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "Maternal Health Awareness",
    topic: "anc_pnc" as Topic,
    date: "2026-11-23",
    union: "Kaunia Sadar",
    venue: "Community Clinic",
    trainer: "Demo Training Facilitator",
    capacity: 25,
  });

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const canManage = ["trainer", "field", "uwao"].includes(roleId);
  const canSchedule = ["trainer", "uwao"].includes(roleId);

  const enrolled: TrainingPerson[] = applications
    .filter((a) => a.status === "enrolled" && a.beneficiaryId)
    .map((a) => ({
      id: a.beneficiaryId!,
      name: a.nameEn,
      union: overrides[a.beneficiaryId!]?.union ?? a.union,
      active: (overrides[a.beneficiaryId!]?.status ?? "active") === "active",
    }));

  const sample: TrainingPerson[] = sampleProfiles.map((p) => ({
    id: p.id,
    name: overrides[p.id]?.nameEn ?? p.nameEn,
    union: overrides[p.id]?.union ?? p.union,
    active: (overrides[p.id]?.status ?? p.status) === "active",
  }));
  const people = [...sample, ...enrolled];

  const selected = sessions.find((s) => s.id === sessionId) ?? sessions[0];
  const members = participants.filter((p) => p.sessionId === selected.id);
  const matching = members.filter((p) =>
    `${p.name} ${p.beneficiaryId}`.toLowerCase().includes(search.toLowerCase())
  );
  const pending = participants.filter((p) => p.offlinePending).length;
  const attended = participants.filter((p) => p.attended).length;
  const certificates = participants.filter((p) => Boolean(p.certificateId)).length;
  const member = members.find((p) => p.id === selectedParticipant);

  function notify(ok: boolean, text: string) {
    setError(ok ? "" : text);
    setMessage(ok ? text : "");
  }

  function create() {
    const r = createSession(form, roleId);
    notify(r.ok, r.message);
    if (r.ok) setShowCreate(false);
  }

  function record(id: string) {
    const r = attendance(selected.id, id, offline, roleId);
    notify(r.ok, r.message);
    if (r.ok) setScanId("");
  }

  function saveAssessment() {
    if (!member) return;
    const r = assess(member.id, pre, post, feedback, roleId);
    notify(r.ok, r.message);
    if (r.ok) setSelectedParticipant("");
  }

  function printCertificate(id: string) {
    const p = participants.find((x) => x.id === id);
    const s = sessions.find((x) => x.id === p?.sessionId);
    if (!p || !s || !p.certificateId) return;
    const popup = window.open("", "_blank", "width=850,height=650");
    if (!popup) return;
    const safe = (x: string) =>
      x.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    popup.document.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"/>
      <title>Demo Training Certificate</title>
      <style>body{font-family:serif;text-align:center;padding:65px;border:12px solid #006A4E}
      h1{color:#006A4E;font-size:36px}h2{font-size:26px}.sub{color:#777}
      @media print{button{display:none}}</style></head><body>
      <p class="sub">MCBP-MIS · Fictional Demonstration</p>
      <h1>প্রশিক্ষণ সমাপ্তির সনদ</h1>
      <p>এই মর্মে প্রত্যয়ন করা যাচ্ছে যে</p>
      <h2>${safe(p.name)}</h2>
      <p>উপকারভোগী আইডি: ${safe(p.beneficiaryId)}</p>
      <p>সফলভাবে প্রশিক্ষণ সম্পন্ন করেছেন:</p>
      <h2>${safe(s.title)}</h2>
      <p>তারিখ: ${safe(s.date)} · স্থান: ${safe(s.venue)}</p>
      <p>Certificate: ${safe(p.certificateId)}</p>
      <p class="sub">DEMO ONLY · Not an official certificate</p>
      <button onclick="window.print()">Print / Save as PDF</button>
      </body></html>`);
    popup.document.close();
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card">
        <div className="card-title" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2>
              <GraduationCap size={19} style={{ verticalAlign: "middle", marginRight: 8 }} />
              {t("Training & Capacity Building", "প্রশিক্ষণ ও সক্ষমতা উন্নয়ন")}
            </h2>
            <p className="sub">{t(
              "Sessions, enrollment, attendance, assessments & certificates · fictional demo",
              "সেশন, নিবন্ধন, উপস্থিতি, মূল্যায়ন ও সনদ · কাল্পনিক ডেমো"
            )}</p>
          </div>
          {canSchedule && <button className="btn primary" onClick={() => {
            setShowCreate((v) => !v);
            setView("schedule");
          }}><Plus size={15} /> {t("New session", "নতুন সেশন")}</button>}
        </div>
      </section>

      <div className="grid kpis">
        {[
          [t("Sessions", "মোট সেশন"), sessions.length, CalendarDays, "green"],
          [t("Participants", "অংশগ্রহণকারী"), participants.length, Users, "blue"],
          [t("Attended", "উপস্থিত"), attended, ClipboardCheck, "green"],
          [t("Certificates", "সনদ"), certificates, GraduationCap, "magenta"],
        ].map(([label, count, Icon, color], i) => {
          const Glyph = Icon as typeof Users;
          return <div className="card stat" key={i}>
            <div className="stat-head"><span>{label as string}</span>
              <span className={`stat-icon ${color}`}><Glyph size={18} /></span></div>
            <strong>{String(count)}</strong>
            <small className="muted">{t("Persisted fictional records", "সংরক্ষিত কাল্পনিক রেকর্ড")}</small>
          </div>;
        })}
      </div>

      <section className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
          {([
            ["schedule", "Schedule", "সময়সূচি"],
            ["attendance", "Attendance & assessment", "উপস্থিতি ও মূল্যায়ন"],
            ["content", "Content library", "কনটেন্ট লাইব্রেরি"],
            ["reports", "Reports", "রিপোর্ট"],
          ] as const).map(([id, en, bn]) => (
            <button key={id} className={`btn ${view === id ? "primary" : ""}`}
              onClick={() => setView(id)}>{t(en, bn)}</button>
          ))}
        </div>
        {(message || error) && (
          <p role={error ? "alert" : "status"} style={{
            padding: 12, borderRadius: 8,
            background: error ? "#FBE7EF" : "#E4F1EC",
            color: error ? "#A3134B" : "#004B37", fontSize: 12,
          }}>{error || message}</p>
        )}

        {view === "schedule" && <>
          {showCreate && <div className="card" style={{ marginBottom: 15 }}>
            <h2>{t("Create training session", "প্রশিক্ষণ সেশন তৈরি")}</h2>
            <div className="grid" style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
              margin: "14px 0",
            }}>
              <label>{t("Title", "শিরোনাম")}
                <input style={field} value={form.title} onChange={(e) =>
                  setForm({ ...form, title: e.target.value })} /></label>
              <label>{t("Topic", "বিষয়")}
                <select style={field} value={form.topic} onChange={(e) =>
                  setForm({ ...form, topic: e.target.value as Topic })}>
                  {(Object.keys(topics) as Topic[]).map((topic) =>
                    <option key={topic} value={topic}>{topics[topic][lang === "bn" ? 1 : 0]}</option>)}
                </select></label>
              <label>{t("Date", "তারিখ")}
                <input style={field} type="date" value={form.date} onChange={(e) =>
                  setForm({ ...form, date: e.target.value })} /></label>
              <label>{t("Union", "ইউনিয়ন")}
                <select style={field} value={form.union} onChange={(e) =>
                  setForm({ ...form, union: e.target.value })}>
                  {["Kaunia Sadar", "Haragach", "Balarhat", "Begumganj"].map((u) =>
                    <option key={u}>{u}</option>)}
                </select></label>
              <label>{t("Venue", "স্থান")}
                <input style={field} value={form.venue} onChange={(e) =>
                  setForm({ ...form, venue: e.target.value })} /></label>
              <label>{t("Trainer", "প্রশিক্ষক")}
                <input style={field} value={form.trainer} onChange={(e) =>
                  setForm({ ...form, trainer: e.target.value })} /></label>
              <label>{t("Capacity", "ধারণক্ষমতা")}
                <input style={field} type="number" value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></label>
            </div>
            <button className="btn primary" onClick={create}>
              {t("Save session", "সেশন সংরক্ষণ")}
            </button>
          </div>}
          <div className="card-title">
            <h2>{t("Union training calendar", "ইউনিয়ন প্রশিক্ষণ ক্যালেন্ডার")}</h2>
            <span className="pill a">{t("Illustrative", "নমুনা")}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table><thead><tr>
              <th>{t("Date", "তারিখ")}</th><th>{t("Session", "সেশন")}</th>
              <th>{t("Location", "অবস্থান")}</th><th>{t("Enrolled", "নিবন্ধিত")}</th>
              <th>{t("Status", "অবস্থা")}</th><th>{t("Action", "অ্যাকশন")}</th>
            </tr></thead><tbody>
              {sessions.map((s) => <tr key={s.id}>
                <td>{s.date}</td>
                <td><b>{s.title}</b><div className="muted">{s.id}</div></td>
                <td>{s.union}<div className="muted">{s.venue}</div></td>
                <td>{participants.filter((p) => p.sessionId === s.id).length}/{s.capacity}</td>
                <td><span className="pill g">{s.status}</span></td>
                <td><button className="link" onClick={() => {
                  setSessionId(s.id); setView("attendance");
                }}>{t("Manage", "পরিচালনা")}</button></td>
              </tr>)}
            </tbody></table>
          </div>
        </>}

        {view === "attendance" && <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 15 }}>
            <select style={{ ...field, maxWidth: 400 }} value={selected.id}
              onChange={(e) => setSessionId(e.target.value)}>
              {sessions.map((s) => <option key={s.id} value={s.id}>
                {s.date} · {s.title}</option>)}
            </select>
            {canManage && <>
              <button className="btn" onClick={() =>
                { const r = enroll(selected.id, people, roleId); notify(r.ok, r.message); }}>
                <Users size={15} /> {t("Enroll eligible union", "যোগ্য উপকারভোগী যুক্ত")}
              </button>
              <button className="btn" onClick={() =>
                { const r = invite(selected.id, roleId); notify(r.ok, r.message); }}>
                <MessageSquare size={15} /> {t("SMS preview", "এসএমএস নমুনা")}
              </button>
              <button className="btn" onClick={() =>
                { const r = completeSession(selected.id, roleId); notify(r.ok, r.message); }}>
                {t("Complete session", "সেশন সম্পন্ন")}
              </button>
            </>}
          </div>
          <div className="grid two">
            <div className="card">
              <div className="card-title">
                <h2>{t("QR / Beneficiary ID attendance", "কিউআর / আইডি উপস্থিতি")}</h2>
                <span className="pill a">{t("Scanner simulation", "স্ক্যানার সিমুলেশন")}</span>
              </div>
              <input style={field} placeholder="BEN-2605-00113"
                value={scanId} onChange={(e) => setScanId(e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <input type="checkbox" checked={offline}
                  onChange={(e) => setOffline(e.target.checked)} />
                <WifiOff size={15} /> {t("Offline capture", "অফলাইন উপস্থিতি")}
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 13, flexWrap: "wrap" }}>
                <button className="btn primary" disabled={!canManage}
                  onClick={() => record(scanId)}>
                  <CheckCircle2 size={15} /> {t("Mark attendance", "উপস্থিতি দিন")}
                </button>
                <button className="btn" disabled={!canManage}
                  onClick={() => {
                    const r = syncOffline(roleId);
                    notify(r.ok, r.message);
                  }}>
                  <RefreshCw size={15} /> {t("Sync", "সিঙ্ক")} ({pending})
                </button>
              </div>
            </div>
            <div className="card">
              <h2>{t("Session summary", "সেশনের সারসংক্ষেপ")}</h2>
              {[
                [t("Participants", "অংশগ্রহণকারী"), members.length],
                [t("Attended", "উপস্থিত"), members.filter((p) => p.attended).length],
                [t("Offline pending", "অফলাইন অপেক্ষমাণ"), members.filter((p) => p.offlinePending).length],
                [t("Certificates", "সনদ"), members.filter((p) => p.certificateId).length],
              ].map(([name, value]) => <div className="indicator" key={String(name)}>
                <span>{name}</span><b>{value}</b></div>)}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="card-title">
              <h2>{t("Participant register", "অংশগ্রহণকারী তালিকা")}</h2>
              <Search size={17} />
            </div>
            <input style={{ ...field, marginBottom: 12 }} value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search participant", "অংশগ্রহণকারী খুঁজুন")} />
            <div style={{ overflowX: "auto" }}>
              <table><thead><tr>
                <th>{t("Beneficiary", "উপকারভোগী")}</th>
                <th>{t("Attendance", "উপস্থিতি")}</th>
                <th>{t("Assessment", "মূল্যায়ন")}</th>
                <th>{t("Certificate", "সনদ")}</th>
                <th>{t("Action", "অ্যাকশন")}</th>
              </tr></thead><tbody>
                {matching.map((p) => <tr key={p.id}>
                  <td>{p.name}<div className="mono">{p.beneficiaryId}</div></td>
                  <td><span className={`pill ${p.attended ? "g" : "a"}`}>
                    {p.offlinePending ? "Offline queued" : p.attended ? "Present" : "Pending"}
                  </span></td>
                  <td>{p.postScore === null ? "—" : `${p.preScore} → ${p.postScore}`}</td>
                  <td>{p.certificateId ? <button className="link"
                    onClick={() => printCertificate(p.id)}>
                    <Printer size={13} /> {t("Print", "প্রিন্ট")}
                  </button> : "—"}</td>
                  <td>{canManage && <button className="link"
                    onClick={() => {
                      setSelectedParticipant(p.id);
                      setPre(p.preScore ?? 35);
                      setPost(p.postScore ?? 80);
                      setFeedback(p.feedback ?? 5);
                    }}>
                    {t("Assess", "মূল্যায়ন")}
                  </button>}</td>
                </tr>)}
              </tbody></table>
            </div>
          </div>

          {member && <div className="card" style={{ marginTop: 14 }}>
            <h2>{t("Assessment & feedback", "মূল্যায়ন ও মতামত")} · {member.name}</h2>
            <p className="sub">{t(
              "Completion rule: synced attendance and post-test score at least 60%.",
              "সনদের শর্ত: সিঙ্ক হওয়া উপস্থিতি এবং পোস্ট-টেস্টে অন্তত ৬০%।"
            )}</p>
            <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 9, marginTop: 12 }}>
              <label>{t("Pre-test", "প্রি-টেস্ট")}
                <input style={field} type="number" min={0} max={100}
                  value={pre} onChange={(e) => setPre(Number(e.target.value))} /></label>
              <label>{t("Post-test", "পোস্ট-টেস্ট")}
                <input style={field} type="number" min={0} max={100}
                  value={post} onChange={(e) => setPost(Number(e.target.value))} /></label>
              <label>{t("Feedback 1–5", "মতামত ১–৫")}
                <input style={field} type="number" min={1} max={5}
                  value={feedback} onChange={(e) => setFeedback(Number(e.target.value))} /></label>
            </div>
            <button className="btn primary" style={{ marginTop: 12 }}
              onClick={saveAssessment}>{t("Save assessment", "মূল্যায়ন সংরক্ষণ")}</button>
          </div>}
        </>}

        {view === "content" && <>
          <div className="card-title">
            <h2><BookOpen size={17} /> {t("Learning content library", "শিক্ষা কনটেন্ট লাইব্রেরি")}</h2>
            <span className="pill a">{t("Offline indicator demo", "অফলাইন নমুনা")}</span>
          </div>
          <div className="grid" style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
            marginTop: 12,
          }}>
            {materials.map((m) => <div className="card" key={m.name}>
              <BookOpen color="#006A4E" size={22} />
              <h3 style={{ fontSize: 14, marginTop: 12 }}>{m.name}</h3>
              <p className="muted">{m.kind} · {topics[m.topic][lang === "bn" ? 1 : 0]}</p>
              <button className="btn" onClick={() => {
                setDownloaded((d) => [...new Set([...d, m.name])]);
                notify(true, "Simulated offline download marked. No file transferred.");
              }}>
                <Download size={14} />
                {downloaded.includes(m.name) ? t("Available offline (demo)", "অফলাইন উপলব্ধ") : t("Save offline", "অফলাইনে রাখুন")}
              </button>
            </div>)}
          </div>
        </>}

        {view === "reports" && <>
          <div className="card-title">
            <h2>{t("Training coverage & outcomes", "প্রশিক্ষণ কভারেজ ও ফলাফল")}</h2>
            <button className="btn" onClick={() => exportCsv("mcbp-training-report.csv", [
              ["Session", "Beneficiary", "Present", "Pre", "Post", "Feedback", "Certificate"],
              ...participants.map((p) => [
                p.sessionId, p.beneficiaryId, String(p.attended),
                String(p.preScore ?? ""), String(p.postScore ?? ""),
                String(p.feedback ?? ""), p.certificateId,
              ]),
            ])}><Download size={15} /> CSV</button>
          </div>
          {Object.entries(topics).map(([key, title]) => {
            const ids = sessions.filter((s) => s.topic === key).map((s) => s.id);
            const count = participants.filter((p) =>
              ids.includes(p.sessionId) && p.attended).length;
            const max = Math.max(1, attended);
            return <div className="quota" key={key}>
              <div><b>{title[lang === "bn" ? 1 : 0]}</b><span>{count}</span></div>
              <div className="bar"><i className="g" style={{ width: `${count / max * 100}%` }} /></div>
            </div>;
          })}
          <div style={{ overflowX: "auto", marginTop: 18 }}>
            <table><thead><tr>
              <th>{t("Event", "ঘটনা")}</th><th>{t("Session", "সেশন")}</th>
              <th>{t("Actor", "ব্যবহারকারী")}</th><th>{t("Time", "সময়")}</th>
            </tr></thead><tbody>
              {logs.slice().reverse().map((log) => <tr key={log.id}>
                <td>{log.action.replaceAll("_", " ")}</td>
                <td>{log.sessionId}</td><td>{log.actor}</td>
                <td>{new Date(log.date).toLocaleString()}</td>
              </tr>)}
              {!logs.length && <tr><td colSpan={4}>
                {t("No new activities. Seed sessions are available.", "নতুন কার্যক্রম নেই। নমুনা সেশন রয়েছে।")}
              </td></tr>}
            </tbody></table>
          </div>
        </>}
      </section>
    </div>
  );
}
