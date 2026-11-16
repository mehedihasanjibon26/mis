
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Bell, Camera, Check, CheckCircle2,
  ChevronRight, ClipboardList, CloudOff, CloudUpload,
  Fingerprint, GraduationCap, HeartHandshake, MapPin,
  Menu, MessageSquareWarning, RefreshCw, ShieldCheck,
  Smartphone, UserRound, Wifi, WifiOff, XCircle,
} from "lucide-react";

type Language = "en" | "bn";
type View = "home" | "visit" | "sync" | "supervisor" | "services";
type RecordType = "verification" | "attendance" | "grievance";
type RecordStatus = "queued" | "synced" | "conflict" | "review" | "resolved";

type OfflineRecord = {
  id: string;
  type: RecordType;
  beneficiary: string;
  notes: string;
  status: RecordStatus;
  created: string;
  location: string;
  photo: boolean;
  resolution?: string;
};

const people = [
  { id: "BEN-2605-00113", name: "Ayesha Begum", area: "Kaunia Sadar" },
  { id: "BEN-2603-00138", name: "Rahima Khatun", area: "Haragach" },
  { id: "BEN-2508-00184", name: "Salma Akter", area: "Balarhat" },
];

const starter: OfflineRecord[] = [
  {
    id: "OFF-DEMO-001",
    type: "verification",
    beneficiary: "BEN-2605-00113",
    notes: "Address and household visit completed.",
    status: "synced",
    created: "2026-11-13T09:30:00.000Z",
    location: "Kaunia · fictional point",
    photo: false,
  },
];

const timestamp = () => new Date().toISOString();
const newId = () => `OFF-${Date.now()}`;

const typeLabels: Record<RecordType, [string, string]> = {
  verification: ["Field verification", "মাঠ যাচাই"],
  attendance: ["Training attendance", "প্রশিক্ষণে উপস্থিতি"],
  grievance: ["Grievance intake", "অভিযোগ গ্রহণ"],
};

function statusTone(status: RecordStatus) {
  if (status === "synced" || status === "resolved") return "good";
  if (status === "conflict" || status === "review") return "warn";
  return "pending";
}

export default function MobileOperationsPage() {
  const [lang, setLang] = useState<Language>("en");
  const [role, setRole] = useState("field");
  const [view, setView] = useState<View>("home");
  const [online, setOnline] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [records, setRecords] = useState<OfflineRecord[]>(starter);
  const [loaded, setLoaded] = useState(false);
  const [person, setPerson] = useState(people[0].id);
  const [recordType, setRecordType] = useState<RecordType>("verification");
  const [notes, setNotes] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [notification, setNotification] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("mcbp-lang");
      const savedRole = localStorage.getItem("mcbp-role");
      const savedRecords = localStorage.getItem("mcbp-mobile-demo");

      if (savedLanguage === "bn") setLang("bn");
      if (savedRole) setRole(savedRole);

      if (savedRecords) {
        const parsed: unknown = JSON.parse(savedRecords);
        if (Array.isArray(parsed)) {
          setRecords(parsed as OfflineRecord[]);
        }
      }
    } catch {
      // A fresh fictional demo is available without stored browser data.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("mcbp-mobile-demo", JSON.stringify(records));
    }
  }, [records, loaded]);

  function inform(en: string, bn: string) {
    setNotification(t(en, bn));
  }

  function saveRecord() {
    if (!notes.trim()) {
      inform("Add a short visit note first.", "প্রথমে সংক্ষিপ্ত নোট লিখুন।");
      return;
    }

    const item: OfflineRecord = {
      id: newId(),
      type: recordType,
      beneficiary: person,
      notes: notes.trim(),
      status: "queued",
      created: timestamp(),
      location: locationCaptured
        ? "Kaunia, Rangpur · demo coordinate only"
        : "Location not captured",
      photo: hasPhoto,
    };

    setRecords((current) => [item, ...current]);
    setNotes("");
    setHasPhoto(false);
    setLocationCaptured(false);
    setView("sync");
    inform("Saved locally in offline queue.", "অফলাইন কিউতে তথ্য সংরক্ষিত হয়েছে।");
  }

  function syncRecords() {
    if (!online) {
      inform("Switch to Online before syncing.", "সিঙ্কের আগে অনলাইন করুন।");
      return;
    }

    setRecords((items) =>
      items.map((item) => {
        if (item.status !== "queued") return item;

        // Deterministic, fictional conflict for the demo.
        if (
          item.beneficiary === "BEN-2603-00138" &&
          item.type === "verification"
        ) {
          return { ...item, status: "conflict" as const };
        }

        return { ...item, status: "synced" as const };
      })
    );

    inform(
      "Queue processed. Review any simulated conflicts.",
      "কিউ সিঙ্ক হয়েছে। কোনো সংঘর্ষ থাকলে পর্যালোচনা করুন।"
    );
  }

  function resolveConflict(
    id: string,
    choice: "office" | "review"
  ) {
    setRecords((items) =>
      items.map((item) =>
        item.id === id && item.status === "conflict"
          ? {
              ...item,
              status: choice === "office" ? "resolved" : "review",
              resolution:
                choice === "office"
                  ? "Kept office record; offline change not applied."
                  : "Sent fictional change for supervisor review.",
            }
          : item
      )
    );

    inform(
      choice === "office"
        ? "Office value retained."
        : "Submitted for supervisor review.",
      choice === "office"
        ? "অফিসের তথ্য রাখা হয়েছে।"
        : "সুপারভাইজার পর্যালোচনার জন্য পাঠানো হয়েছে।"
    );
  }

  function supervisorDecision(id: string, approved: boolean) {
    setRecords((items) =>
      items.map((item) =>
        item.id === id && item.status === "review"
          ? {
              ...item,
              status: "resolved",
              resolution: approved
                ? "Supervisor approved demo review; no real profile changed."
                : "Supervisor rejected demo review; office record retained.",
            }
          : item
      )
    );
    inform(
      approved ? "Review approved." : "Review rejected.",
      approved ? "রিভিউ অনুমোদিত।" : "রিভিউ বাতিল।"
    );
  }

  const queued = records.filter((r) => r.status === "queued");
  const conflicts = records.filter((r) => r.status === "conflict");
  const reviews = records.filter((r) => r.status === "review");
  const completed = records.filter(
    (r) => r.status === "synced" || r.status === "resolved"
  );

  const buttons: Array<{
    view: View;
    icon: typeof Smartphone;
    en: string;
    bn: string;
  }> = [
    { view: "home", icon: Smartphone, en: "Home", bn: "হোম" },
    { view: "visit", icon: ClipboardList, en: "Field Work", bn: "মাঠ কাজ" },
    { view: "sync", icon: CloudUpload, en: "Sync", bn: "সিঙ্ক" },
    { view: "supervisor", icon: ShieldCheck, en: "Review", bn: "রিভিউ" },
    { view: "services", icon: UserRound, en: "Services", bn: "সেবা" },
  ];

  return (
    <div className="mobile-demo">
      <style>{`
        .mobile-demo{min-height:100vh;background:#eff4f1;color:#193c30;
          font-family:Arial,Helvetica,sans-serif;padding:24px}
        .mobile-top{max-width:1190px;margin:0 auto 24px;display:flex;
          justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
        .mobile-link,.mobile-btn{display:inline-flex;align-items:center;justify-content:center;
          gap:7px;border:1px solid #d8e5de;background:white;color:#17533d;
          border-radius:10px;padding:11px 14px;font-size:12px;
          font-weight:700;text-decoration:none;cursor:pointer}
        .mobile-btn.primary{background:#006a4e;color:white;border-color:#006a4e}
        .mobile-btn:disabled{cursor:not-allowed;opacity:.5}
        .mobile-layout{max-width:1190px;margin:0 auto;display:grid;
          grid-template-columns:minmax(320px,430px) 1fr;gap:27px;align-items:start}
        .phone-shell{padding:11px;background:#152c23;border-radius:36px;
          box-shadow:0 25px 55px rgba(5,33,21,.19);max-width:430px}
        .phone-screen{border-radius:27px;background:#f7faf8;overflow:hidden;
          min-height:690px;position:relative;display:flex;flex-direction:column}
        .phone-bar{height:26px;background:#064733;color:#c5e8d7;
          display:flex;align-items:center;justify-content:center;font-size:10px}
        .phone-head{background:#006a4e;color:white;padding:17px 20px 22px}
        .phone-body{flex:1;padding:17px;display:flex;flex-direction:column;gap:12px}
        .phone-card{border:1px solid #e0eae4;background:white;
          border-radius:14px;padding:15px}
        .phone-label{font-size:11px;color:#688073;line-height:1.5}
        .phone-title{font-size:16px;font-weight:800;margin:0 0 8px}
        .phone-input{display:block;width:100%;box-sizing:border-box;
          border:1px solid #d9e6de;border-radius:10px;background:white;
          font:inherit;color:#184735;padding:11px;font-size:12px}
        .phone-nav{display:grid;grid-template-columns:repeat(5,1fr);
          border-top:1px solid #e2ebe5;background:white}
        .phone-nav button{border:0;background:transparent;color:#718578;
          font-size:9px;padding:12px 2px;cursor:pointer;display:grid;
          place-items:center;gap:5px}
        .phone-nav button.active{color:#006a4e;font-weight:800;background:#eaf5ee}
        .mobile-info{background:white;border:1px solid #e0eae4;
          border-radius:19px;padding:22px;margin-bottom:15px}
        .mobile-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        .mobile-number{font-size:29px;font-weight:850;margin:10px 0 4px}
        .mobile-status{display:inline-flex;border-radius:20px;padding:5px 9px;
          font-size:10px;font-weight:800;background:#edf1fa;color:#47638f}
        .mobile-status.good{background:#e3f4e9;color:#08754c}
        .mobile-status.warn{background:#fff0de;color:#986314}
        .mobile-queue-row{border-top:1px solid #e9f0eb;padding:13px 0}
        .mobile-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
        @media(max-width:800px){.mobile-layout{grid-template-columns:1fr}
          .phone-shell{margin:0 auto;width:100%;box-sizing:border-box}
          .mobile-demo{padding:13px}.phone-screen{min-height:620px}}
      `}</style>

      <header className="mobile-top">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: "#006a4e", color: "white",
            borderRadius: 13, padding: 12,
          }}>
            <HeartHandshake size={24} />
          </span>
          <div>
            <div style={{ fontSize: 19, fontWeight: 850 }}>MCBP-MIS</div>
            <div style={{ fontSize: 11, color: "#72877b" }}>
              {t("MOBILE & FIELD OPERATIONS", "মোবাইল ও মাঠ কার্যক্রম")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link href="/" className="mobile-link">
            <ArrowLeft size={15} /> {t("Main System", "মূল সিস্টেম")}
          </Link>
          <button className="mobile-btn" onClick={() => {
            const next = lang === "en" ? "bn" : "en";
            setLang(next);
            localStorage.setItem("mcbp-lang", next);
          }}>
            {lang === "en" ? "বাংলা" : "EN"}
          </button>
          <button className="mobile-btn" onClick={() => {
            setOnline((current) => !current);
          }}>
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}
            {online ? t("Online", "অনলাইন") : t("Offline", "অফলাইন")}
          </button>
        </div>
      </header>

      <div className="mobile-layout">
        <div className="phone-shell">
          <div className="phone-screen">
            <div className="phone-bar">MCBP · DEMO DEVICE · 10:24</div>

            <div className="phone-head">
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 11, opacity: .85 }}>
                  {t("FIELD OPERATIONS", "মাঠ কার্যক্রম")}
                </span>
                <span style={{
                  borderRadius: 20,
                  padding: "5px 9px",
                  background: online ? "#248e70" : "#b17c25",
                  fontSize: 10,
                  fontWeight: 800,
                }}>
                  {online ? "● ONLINE" : "● OFFLINE"}
                </span>
              </div>
              <h2 style={{ fontSize: 23, margin: "15px 0 5px" }}>
                {t(
                  "Hello, Field Officer",
                  "স্বাগতম, মাঠ কর্মকর্তা"
                )}
              </h2>
              <div style={{ fontSize: 12, opacity: .85 }}>
                <MapPin size={12} style={{ verticalAlign: "middle" }} />
                {" "}Kaunia · Rangpur
              </div>
            </div>

            {!unlocked ? (
              <div className="phone-body" style={{
                justifyContent: "center", textAlign: "center",
                alignItems: "center",
              }}>
                <span style={{
                  width: 70, height: 70, borderRadius: 24,
                  display: "grid", placeItems: "center",
                  background: "#e6f4ec", color: "#006a4e",
                }}>
                  <Fingerprint size={37} />
                </span>
                <h3>{t("Unlock Demo Device", "ডেমো ডিভাইস খুলুন")}</h3>
                <p className="phone-label">
                  {t(
                    "Enter any four digits to simulate PIN access.",
                    "পিন অ্যাক্সেস দেখতে যেকোনো চারটি সংখ্যা দিন।"
                  )}
                </p>
                <input
                  className="phone-input"
                  style={{ maxWidth: 190, textAlign: "center" }}
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, ""))
                  }
                />
                <button
                  className="mobile-btn primary"
                  disabled={pin.length !== 4}
                  onClick={() => setUnlocked(true)}
                >
                  <Check size={15} /> {t("Unlock", "প্রবেশ")}
                </button>
                <p className="phone-label">
                  PIN is a visual simulation, not real authentication.
                </p>
              </div>
            ) : (
              <>
                <div className="phone-body">
                  {notification && (
                    <div style={{
                      background: "#e4f4eb", color: "#076747",
                      padding: 11, borderRadius: 10,
                      fontSize: 11, lineHeight: 1.5,
                    }}>
                      {notification}
                    </div>
                  )}

                  {view === "home" && (
                    <>
                      <h3 className="phone-title">
                        {t("Today's workspace", "আজকের কার্যক্রম")}
                      </h3>
                      <div className="mobile-kpis">
                        {[
                          [t("Completed", "সম্পন্ন"), completed.length],
                          [t("Offline queue", "অফলাইন কিউ"), queued.length],
                          [t("Conflicts", "সংঘর্ষ"), conflicts.length],
                          [t("For review", "রিভিউ বাকি"), reviews.length],
                        ].map(([label, value]) => (
                          <div className="phone-card" key={String(label)}>
                            <div className="phone-label">{label}</div>
                            <div className="mobile-number">{value}</div>
                          </div>
                        ))}
                      </div>
                      <button
                        className="mobile-btn primary"
                        onClick={() => setView("visit")}
                      >
                        <ClipboardList size={17} />
                        {t("Start new field visit", "নতুন মাঠ পরিদর্শন")}
                        <ChevronRight size={14} />
                      </button>
                      <div className="phone-card">
                        <b style={{ fontSize: 13 }}>
                          {t("Assigned households", "নির্ধারিত পরিবার")}
                        </b>
                        {people.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setPerson(p.id);
                              setView("visit");
                            }}
                            style={{
                              border: 0,
                              borderTop: "1px solid #eaf0eb",
                              padding: "12px 0",
                              background: "transparent",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <span>
                              <b style={{ fontSize: 12 }}>{p.name}</b>
                              <div className="phone-label">{p.area}</div>
                            </span>
                            <ChevronRight size={15} color="#58816e" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {view === "visit" && (
                    <>
                      <h3 className="phone-title">
                        {t("Offline data capture", "অফলাইন তথ্য সংগ্রহ")}
                      </h3>
                      <p className="phone-label">
                        {t(
                          "Capture a field verification, attendance record or grievance without a network.",
                          "ইন্টারনেট ছাড়াই মাঠ যাচাই, উপস্থিতি বা অভিযোগ সংরক্ষণ করুন।"
                        )}
                      </p>

                      <label className="phone-label">
                        {t("Beneficiary", "উপকারভোগী")}
                        <select
                          className="phone-input"
                          value={person}
                          onChange={(e) => setPerson(e.target.value)}
                        >
                          {people.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} · {p.id}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="phone-label">
                        {t("Record type", "রেকর্ডের ধরন")}
                        <select
                          className="phone-input"
                          value={recordType}
                          onChange={(e) =>
                            setRecordType(e.target.value as RecordType)
                          }
                        >
                          {(
                            Object.keys(typeLabels) as RecordType[]
                          ).map((item) => (
                            <option key={item} value={item}>
                              {t(...typeLabels[item])}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="phone-label">
                        {t("Visit note", "পরিদর্শন নোট")}
                        <textarea
                          className="phone-input"
                          rows={4}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t(
                            "Enter observations...",
                            "পর্যবেক্ষণ লিখুন..."
                          )}
                        />
                      </label>

                      <div style={{
                        display: "flex", flexWrap: "wrap", gap: 7,
                      }}>
                        <button
                          className="mobile-btn"
                          onClick={() => setHasPhoto((v) => !v)}
                        >
                          <Camera size={14} />
                          {hasPhoto ? "✓ " : ""}
                          {t("Mock photo", "নমুনা ছবি")}
                        </button>
                        <button
                          className="mobile-btn"
                          onClick={() => setLocationCaptured((v) => !v)}
                        >
                          <MapPin size={14} />
                          {locationCaptured ? "✓ " : ""}
                          {t("Mock GPS", "নমুনা জিপিএস")}
                        </button>
                      </div>

                      <button className="mobile-btn primary" onClick={saveRecord}>
                        <CloudOff size={16} />
                        {t("Save to offline queue", "অফলাইন কিউতে সংরক্ষণ")}
                      </button>
                    </>
                  )}

                  {view === "sync" && (
                    <>
                      <h3 className="phone-title">
                        {t("Offline Sync Centre", "অফলাইন সিঙ্ক সেন্টার")}
                      </h3>
                      <div className="phone-card">
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center",
                        }}>
                          <div>
                            <b>{queued.length} {t("pending uploads", "অপেক্ষমাণ আপলোড")}</b>
                            <div className="phone-label">
                              {online ? "Network available" : "Waiting for network"}
                            </div>
                          </div>
                          {online
                            ? <Wifi color="#058663" />
                            : <WifiOff color="#b37b26" />}
                        </div>
                      </div>

                      <button
                        className="mobile-btn primary"
                        disabled={!online || queued.length === 0}
                        onClick={syncRecords}
                      >
                        <RefreshCw size={15} />
                        {t("Sync queued records", "রেকর্ড সিঙ্ক করুন")}
                      </button>

                      {records.map((item) => (
                        <div className="phone-card" key={item.id}>
                          <div style={{
                            display: "flex", justifyContent: "space-between",
                            gap: 8,
                          }}>
                            <b style={{ fontSize: 12 }}>
                              {t(...typeLabels[item.type])}
                            </b>
                            <span className={`mobile-status ${statusTone(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="phone-label" style={{ marginTop: 6 }}>
                            {item.beneficiary}
                          </div>
                          <p style={{ fontSize: 11, lineHeight: 1.6 }}>
                            {item.notes}
                          </p>

                          {item.status === "conflict" && (
                            <div style={{
                              background: "#fff4e7",
                              padding: 11,
                              borderRadius: 9,
                            }}>
                              <b style={{ fontSize: 11 }}>
                                {t("Office / device conflict", "অফিস ও ডিভাইসের তথ্য ভিন্ন")}
                              </b>
                              <div className="mobile-actions">
                                <button
                                  className="mobile-btn"
                                  onClick={() =>
                                    resolveConflict(item.id, "office")
                                  }
                                >
                                  {t("Keep office", "অফিসের তথ্য")}
                                </button>
                                <button
                                  className="mobile-btn primary"
                                  onClick={() =>
                                    resolveConflict(item.id, "review")
                                  }
                                >
                                  {t("Send for review", "রিভিউতে পাঠান")}
                                </button>
                              </div>
                            </div>
                          )}
                          {item.resolution && (
                            <div className="phone-label">
                              {item.resolution}
                            </div>
                          )}
                        </div>
                      ))}

                      {records.length === 0 && (
                        <p className="phone-label">
                          No local records yet.
                        </p>
                      )}
                    </>
                  )}

                  {view === "supervisor" && (
                    <>
                      <h3 className="phone-title">
                        {t("Supervisor Review", "সুপারভাইজার রিভিউ")}
                      </h3>
                      <p className="phone-label">
                        {t(
                          "Resolve a submitted device conflict. Demo only.",
                          "ডিভাইসের তথ্যের সংঘর্ষ পর্যালোচনা করুন।"
                        )}
                      </p>
                      {!["admin", "executive"].includes(role) && (
                        <div className="phone-card" style={{
                          background: "#fff4e8",
                        }}>
                          <ShieldCheck size={16} />
                          <p className="phone-label">
                            {t(
                              "Switch to the Supervisor demo role in the panel on the right.",
                              "ডান পাশ থেকে সুপারভাইজার ডেমো রোল নির্বাচন করুন।"
                            )}
                          </p>
                        </div>
                      )}

                      {reviews.map((item) => (
                        <div className="phone-card" key={item.id}>
                          <b style={{ fontSize: 12 }}>
                            {item.beneficiary}
                          </b>
                          <p style={{ fontSize: 11 }}>
                            {item.notes}
                          </p>
                          <div className="mobile-actions">
                            <button
                              className="mobile-btn primary"
                              disabled={!["admin", "executive"].includes(role)}
                              onClick={() =>
                                supervisorDecision(item.id, true)
                              }
                            >
                              <Check size={14} />
                              {t("Approve", "অনুমোদন")}
                            </button>
                            <button
                              className="mobile-btn"
                              disabled={!["admin", "executive"].includes(role)}
                              onClick={() =>
                                supervisorDecision(item.id, false)
                              }
                            >
                              <XCircle size={14} />
                              {t("Reject", "বাতিল")}
                            </button>
                          </div>
                        </div>
                      ))}

                      {!reviews.length && (
                        <div className="phone-card" style={{ textAlign: "center" }}>
                          <CheckCircle2 color="#058663" size={27} />
                          <p className="phone-label">
                            {t("No review items pending.", "কোনো রিভিউ বাকি নেই।")}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {view === "services" && (
                    <>
                      <h3 className="phone-title">
                        {t("Mobile Service Menu", "মোবাইল সেবা")}
                      </h3>
                      {[
                        {
                          icon: ClipboardList,
                          name: t("Assisted registration", "সহায়তাপ্রাপ্ত নিবন্ধন"),
                          description: t("Offline form demonstration", "অফলাইন ফর্ম ডেমো"),
                          type: "verification" as RecordType,
                        },
                        {
                          icon: GraduationCap,
                          name: t("Training attendance", "প্রশিক্ষণে উপস্থিতি"),
                          description: t("Capture attendance locally", "উপস্থিতি সংরক্ষণ"),
                          type: "attendance" as RecordType,
                        },
                        {
                          icon: MessageSquareWarning,
                          name: t("Grievance intake", "অভিযোগ গ্রহণ"),
                          description: t("Record a fictional complaint", "নমুনা অভিযোগ"),
                          type: "grievance" as RecordType,
                        },
                      ].map((service) => (
                        <button
                          className="phone-card"
                          key={service.name}
                          style={{
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                          onClick={() => {
                            setRecordType(service.type);
                            setView("visit");
                          }}
                        >
                          <service.icon size={23} color="#006a4e" />
                          <span>
                            <b style={{ fontSize: 12 }}>{service.name}</b>
                            <div className="phone-label">
                              {service.description}
                            </div>
                          </span>
                          <ChevronRight size={15} />
                        </button>
                      ))}
                    </>
                  )}
                </div>

                <nav className="phone-nav">
                  {buttons.map(({ view: target, icon: Icon, en, bn }) => (
                    <button
                      key={target}
                      className={target === view ? "active" : ""}
                      onClick={() => {
                        setView(target);
                        setNotification("");
                      }}
                    >
                      <Icon size={17} />
                      {t(en, bn)}
                    </button>
                  ))}
                </nav>
              </>
            )}
          </div>
        </div>

        <aside>
          <section className="mobile-info">
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#46836a" }}>
                  CLIENT DEMONSTRATION
                </div>
                <h1 style={{
                  fontSize: "clamp(23px,2.7vw,33px)",
                  margin: "9px 0",
                  lineHeight: 1.2,
                }}>
                  {t(
                    "Offline-first field operations",
                    "অফলাইন-ভিত্তিক মাঠ কার্যক্রম"
                  )}
                </h1>
              </div>
              <Smartphone size={44} color="#006a4e" />
            </div>
            <p style={{
              color: "#687c70", fontSize: 13,
              lineHeight: 1.8,
            }}>
              {t(
                "Show how a field officer can capture data without internet, upload it later, and request supervisor resolution if office and device records differ.",
                "মাঠ কর্মকর্তা কীভাবে ইন্টারনেট ছাড়াই তথ্য নেবেন, পরে সিঙ্ক করবেন এবং তথ্যের সংঘর্ষ হলে সুপারভাইজারের অনুমোদন নেবেন তা দেখুন।"
              )}
            </p>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8,
            }}>
              <span className="mobile-status good">
                <ShieldCheck size={12} /> Demo permissions
              </span>
              <span className="mobile-status">Local queue</span>
              <span className="mobile-status">EN / BN</span>
            </div>
          </section>

          <section className="mobile-info">
            <h3 style={{ margin: "0 0 15px", fontSize: 16 }}>
              {t("Demo controls", "ডেমো কন্ট্রোল")}
            </h3>
            <label style={{
              fontSize: 12, display: "block",
              marginBottom: 10,
            }}>
              {t("Current role", "বর্তমান রোল")}
              <select
                className="phone-input"
                style={{ marginTop: 7 }}
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  localStorage.setItem("mcbp-role", e.target.value);
                }}
              >
                <option value="field">Field Verifier</option>
                <option value="uwao">UWAO</option>
                <option value="executive">Supervisor / Programme Executive</option>
                <option value="admin">System Administrator</option>
              </select>
            </label>
            <button
              className={online ? "mobile-btn" : "mobile-btn primary"}
              onClick={() => setOnline((v) => !v)}
            >
              {online ? <Wifi size={15} /> : <WifiOff size={15} />}
              {online ? "Switch to Offline" : "Switch to Online"}
            </button>
            <div style={{
              borderTop: "1px solid #e9f0ec",
              marginTop: 18, paddingTop: 15,
              display: "grid", gap: 13,
            }}>
              {[
                ["Queued locally", queued.length],
                ["Synced / resolved", completed.length],
                ["Sync conflicts", conflicts.length],
                ["Supervisor review", reviews.length],
              ].map(([label, value]) => (
                <div key={String(label)} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}>
                  <span style={{ color: "#708577" }}>{label}</span>
                  <b>{value}</b>
                </div>
              ))}
            </div>
          </section>

          <section className="mobile-info">
            <h3 style={{ fontSize: 16, margin: "0 0 12px" }}>
              {t("Recommended demo journey", "প্রস্তাবিত ডেমো ফ্লো")}
            </h3>
            {[
              "Unlock mock device with any 4-digit PIN",
              "Remain Offline and create a field verification for Rahima",
              "Switch Online and Sync the queued record",
              "Choose Send for review at the conflict",
              "Switch to Supervisor and approve or reject",
            ].map((step, index) => (
              <div key={step} style={{
                display: "flex", gap: 12, alignItems: "start",
                padding: "10px 0",
                borderBottom: "1px solid #eef2ef",
              }}>
                <span style={{
                  background: "#e6f3ec", color: "#006a4e",
                  borderRadius: 9, padding: 8,
                  fontSize: 12, fontWeight: 800,
                }}>
                  {index + 1}
                </span>
                <span style={{
                  color: "#536f60", fontSize: 12,
                  lineHeight: 1.6,
                }}>
                  {step}
                </span>
              </div>
            ))}
          </section>

          <div style={{ fontSize: 11, color: "#7b8e83", lineHeight: 1.8 }}>
            <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
            {" "}This is a browser-based mobile UI simulation, not a native
            Android/iOS application. No real GPS, photo capture,
            biometric authentication, backend sync or government
            system update occurs.
          </div>
        </aside>
      </div>
    </div>
  );
}
