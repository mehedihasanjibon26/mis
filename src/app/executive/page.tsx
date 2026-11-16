
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowLeft, ArrowUpRight, Baby, CalendarDays,
  CheckCircle2, ChevronDown, Download, GraduationCap,
  MapPinned, MessageSquareWarning, RefreshCw, ShieldCheck,
  TrendingUp, Users, Wallet,
} from "lucide-react";
import { useDemoStore } from "../../lib/demo-store";
import { useBeneficiaryStore, sampleProfiles } from "../../lib/beneficiary-store";
import { usePayrollStore } from "../../lib/payroll-store";
import { useGrievanceStore } from "../../lib/grievance-store";
import { useTrainingStore } from "../../lib/training-store";

type Language = "en" | "bn";
type Period = "month" | "quarter" | "year";
type Topic = "applications" | "payments" | "grievances" | "training";

const green = "#006A4E";
const pink = "#C72D70";

const money = (value: number) =>
  new Intl.NumberFormat("en-BD").format(value);

function csvDownload(filename: string, rows: string[][]) {
  const data = rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")
    )
    .join("\r\n");

  const blob = new Blob(["\uFEFF", data], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const visualTrend = [45, 56, 53, 66, 60, 71, 74, 83, 78, 89, 86, 96];

export default function ExecutiveDashboardPage() {
  const [lang, setLang] = useState<Language>("en");
  const [period, setPeriod] = useState<Period>("month");
  const [area, setArea] = useState("all");
  const [topic, setTopic] = useState<Topic>("applications");
  const [showBaseline, setShowBaseline] = useState(true);

  const applications = useDemoStore((s) => s.applications);
  const overrides = useBeneficiaryStore((s) => s.overrides);
  const payments = usePayrollStore((s) => s.payments);
  const grievances = useGrievanceStore((s) => s.cases);
  const sessions = useTrainingStore((s) => s.sessions);
  const participants = useTrainingStore((s) => s.participants);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  const beneficiaries = useMemo(() => {
    const map = new Map<
      string,
      { id: string; union: string; status: string; name: string }
    >();

    sampleProfiles.forEach((p) => {
      const change = overrides[p.id];
      map.set(p.id, {
        id: p.id,
        union: change?.union ?? p.union,
        status: change?.status ?? p.status,
        name: change?.nameEn ?? p.nameEn,
      });
    });

    applications
      .filter((a) => a.status === "enrolled" && a.beneficiaryId)
      .forEach((a) => {
        const id = a.beneficiaryId!;
        const change = overrides[id];
        map.set(id, {
          id,
          union: change?.union ?? a.union,
          status: change?.status ?? "active",
          name: change?.nameEn ?? a.nameEn,
        });
      });

    return [...map.values()];
  }, [applications, overrides]);

  const unions = [
    ...new Set([
      ...beneficiaries.map((p) => p.union),
      ...applications.map((a) => a.union),
      ...sessions.map((s) => s.union),
    ].filter(Boolean)),
  ].sort();

  const filteredBeneficiaries = beneficiaries.filter(
    (p) => area === "all" || p.union === area
  );

  const ids = new Set(filteredBeneficiaries.map((p) => p.id));

  const filteredApps = applications.filter(
    (a) => area === "all" || a.union === area
  );

  const filteredPayments = payments.filter(
    (p) => ids.has(p.beneficiaryId)
  );

  const filteredGrievances = grievances.filter((g) => {
    if (g.queue !== "programme" || g.anonymous) return false;
    return area === "all" || (
      Boolean(g.beneficiaryId) && ids.has(g.beneficiaryId)
    );
  });

  const filteredSessions = sessions.filter(
    (s) => area === "all" || s.union === area
  );

  const sessionIds = new Set(filteredSessions.map((s) => s.id));

  const filteredTraining = participants.filter(
    (p) => sessionIds.has(p.sessionId)
  );

  const paid = filteredPayments.filter(
    (p) => p.status === "paid" || p.status === "repaid"
  );

  const bounced = filteredPayments.filter(
    (p) => p.status === "bounced"
  );

  const openGrievances = filteredGrievances.filter(
    (g) => !["resolved", "closed"].includes(g.status)
  );

  const completedTraining = filteredTraining.filter(
    (p) => Boolean(p.certificateId)
  );

  const totalPaid = paid.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const active = filteredBeneficiaries.filter(
    (p) => p.status === "active"
  ).length;

  const stats = [
    {
      title: t("Beneficiaries", "উপকারভোগী"),
      number: filteredBeneficiaries.length,
      detail: t(`${active} active profiles`, `${active} সক্রিয় প্রোফাইল`),
      icon: Users,
      color: green,
    },
    {
      title: t("Applications", "আবেদন"),
      number: filteredApps.length,
      detail: t(
        `${filteredApps.filter((a) => a.status === "enrolled").length} enrolled`,
        `${filteredApps.filter((a) => a.status === "enrolled").length} নিবন্ধিত`
      ),
      icon: Baby,
      color: "#4479B6",
    },
    {
      title: t("Successful Payments", "সফল পেমেন্ট"),
      number: paid.length,
      detail: `৳${money(totalPaid)} · ${bounced.length} bounced`,
      icon: Wallet,
      color: "#00866D",
    },
    {
      title: t("Open Grievances", "চলমান অভিযোগ"),
      number: openGrievances.length,
      detail: t("Programme grievance cases", "কর্মসূচির অভিযোগ"),
      icon: MessageSquareWarning,
      color: pink,
    },
    {
      title: t("Training Certificates", "প্রশিক্ষণ সনদ"),
      number: completedTraining.length,
      detail: `${filteredSessions.length} ${t("sessions", "সেশন")}`,
      icon: GraduationCap,
      color: "#9463C1",
    },
  ];

  const buckets = {
    applications: [
      ["Draft", filteredApps.filter((a) => a.status === "draft").length],
      ["Submitted", filteredApps.filter((a) => a.status === "submitted").length],
      ["Verification", filteredApps.filter((a) => a.status.includes("pending")).length],
      ["Approved", filteredApps.filter((a) => a.status === "approved").length],
      ["Enrolled", filteredApps.filter((a) => a.status === "enrolled").length],
    ],
    payments: [
      ["Paid", paid.length],
      ["Bounced", bounced.length],
      ["Pending", filteredPayments.filter((p) => p.status === "pending").length],
      ["Correction", filteredPayments.filter((p) => p.status === "correction_pending").length],
    ],
    grievances: [
      ["Open", filteredGrievances.filter((g) => g.status === "open").length],
      ["Investigating", filteredGrievances.filter((g) => g.status === "investigating").length],
      ["Escalated", filteredGrievances.filter((g) => g.status === "escalated").length],
      ["Resolved", filteredGrievances.filter((g) => ["resolved", "closed"].includes(g.status)).length],
    ],
    training: [
      ["Enrolled", filteredTraining.length],
      ["Attended", filteredTraining.filter((p) => p.attended).length],
      ["Certificates", completedTraining.length],
      ["Offline queue", filteredTraining.filter((p) => p.offlinePending).length],
    ],
  } satisfies Record<Topic, [string, number][]>;

  const chart = buckets[topic];
  const max = Math.max(1, ...chart.map((entry) => entry[1]));

  function exportReport() {
    csvDownload("MCBP-MIS-executive-demo-report.csv", [
      ["MCBP-MIS Executive Dashboard", "Fictional demonstration"],
      ["Geographic filter", area],
      ["Time selection", period],
      ["Metric", "Value"],
      ...stats.map((s) => [s.title, String(s.number)]),
      ["Paid value (BDT)", String(totalPaid)],
      ["Report view", topic],
      ...chart.map(([name, value]) => [name, String(value)]),
    ]);
  }

  return (
    <div className="executive-root">
      <style>{`
        .executive-root{min-height:100vh;background:#F4F7F5;color:#193C2D;
          font-family:Arial,Helvetica,sans-serif;padding:24px clamp(16px,3.2vw,52px)}
        .ex-top{display:flex;justify-content:space-between;align-items:center;
          flex-wrap:wrap;gap:14px;margin-bottom:26px}
        .ex-logo{display:flex;align-items:center;gap:12px}
        .ex-logo-icon{width:43px;height:43px;display:grid;place-items:center;
          background:#006A4E;color:white;border-radius:14px}
        .ex-small{font-size:11px;color:#809187;font-weight:600;letter-spacing:.03em}
        .ex-control{padding:11px 13px;border:1px solid #DAE6DF;
          border-radius:10px;background:white;color:#244638;font:inherit;
          font-size:12px;cursor:pointer}
        .ex-card{background:white;border:1px solid #E2EBE6;border-radius:18px;
          padding:20px;box-shadow:0 7px 25px rgba(20,72,47,.035)}
        .ex-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:13px}
        .ex-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:14px}
        .ex-metrics{font-size:29px;font-weight:800;letter-spacing:-.04em;margin:15px 0 5px}
        .ex-title{font-size:15px;font-weight:750;margin:0 0 16px}
        .ex-track{height:11px;background:#EAF0EC;border-radius:8px;overflow:hidden}
        .ex-fill{height:100%;background:#006A4E;border-radius:8px}
        .ex-pill{background:#E6F3EC;color:#006A4E;padding:7px 10px;
          border-radius:50px;font-size:10px;font-weight:800}
        .ex-hero{border-radius:20px;padding:30px;color:white;
          background:linear-gradient(125deg,#043E2F 0%,#006A4E 68%,#118867 100%);
          display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:18px}
        .ex-btn{padding:11px 16px;border-radius:10px;border:1px solid #d7e7dd;
          background:white;color:#174C37;font-weight:700;cursor:pointer;font-size:12px;
          display:inline-flex;align-items:center;gap:8px;text-decoration:none}
        .ex-chart{height:188px;display:flex;align-items:flex-end;gap:9px;margin:16px 0}
        .ex-chart-col{flex:1;display:flex;flex-direction:column;justify-content:end;
          align-items:center;height:100%;gap:5px}
        .ex-bar{width:100%;max-width:49px;border-radius:7px 7px 3px 3px;min-height:4px}
        .ex-rows{display:grid;gap:17px}
        .ex-row{display:flex;justify-content:space-between;gap:10px;font-size:12px;margin-bottom:7px}
        .ex-foot{margin-top:24px;font-size:11px;color:#799084;text-align:center}
        @media(max-width:1100px){.ex-kpis{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:700px){.ex-kpis{grid-template-columns:repeat(2,1fr)}
          .ex-grid{grid-template-columns:1fr}.ex-hero{padding:22px;flex-wrap:wrap}}
        @media print{.ex-top button,.ex-top a,.ex-btn{display:none!important}
          .executive-root{background:white}}
      `}</style>

      <header className="ex-top">
        <div className="ex-logo">
          <div className="ex-logo-icon"><Activity size={23} /></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 850 }}>MCBP-MIS</div>
            <div className="ex-small">
              {t("EXECUTIVE INTELLIGENCE", "নির্বাহী তথ্য বিশ্লেষণ")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/" className="ex-btn"><ArrowLeft size={14} /> Dashboard</Link>
          <button className="ex-control" onClick={() => setLang(lang === "en" ? "bn" : "en")}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
          <button className="ex-btn" onClick={exportReport}>
            <Download size={15} /> {t("Export report", "রিপোর্ট এক্সপোর্ট")}
          </button>
        </div>
      </header>

      <section className="ex-hero">
        <div>
          <div style={{ color: "#B7E4D1", fontSize: 11, fontWeight: 800, letterSpacing: ".13em" }}>
            MOTHER & CHILD BENEFIT PROGRAMME
          </div>
          <h1 style={{ fontSize: "clamp(25px,3vw,39px)", lineHeight: 1.15, margin: "12px 0" }}>
            {t("Programme Intelligence", "কর্মসূচির সামগ্রিক চিত্র")}
          </h1>
          <p style={{ color: "#D1EDE0", fontSize: 13, maxWidth: 620, lineHeight: 1.7 }}>
            {t(
              "One connected view of enrolment, benefit delivery, grievances and training outcomes.",
              "নিবন্ধন, ভাতা প্রদান, অভিযোগ ও প্রশিক্ষণের সমন্বিত তথ্য।"
            )}
          </p>
          <span style={{ fontSize: 11, color: "#C0E9D7" }}>
            <ShieldCheck size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Fictional demonstration · No live government data
          </span>
        </div>
        <div style={{ textAlign: "center", minWidth: 130 }}>
          <TrendingUp size={55} strokeWidth={1.2} color="#C4EAD9" />
          <div style={{ fontSize: 11, color: "#C4EAD9", marginTop: 8 }}>
            {t("Connected insights", "সমন্বিত তথ্য")}
          </div>
        </div>
      </section>

      <div className="ex-card" style={{
        display: "flex", flexWrap: "wrap", gap: 13,
        alignItems: "center", marginBottom: 15,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginRight: "auto" }}>
          <MapPinned size={18} color={green} />
          <b style={{ fontSize: 13 }}>{t("Explore programme data", "কর্মসূচির তথ্য দেখুন")}</b>
        </div>
        <label className="ex-small">
          {t("AREA", "এলাকা")}
          <div style={{ marginTop: 5 }}>
            <select className="ex-control" value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="all">{t("All demo areas", "সব ডেমো এলাকা")}</option>
              {unions.map((union) => <option key={union} value={union}>{union}</option>)}
            </select>
          </div>
        </label>
        <label className="ex-small">
          {t("PERIOD", "সময়কাল")}
          <div style={{ marginTop: 5 }}>
            <select className="ex-control" value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}>
              <option value="month">{t("Monthly", "মাসিক")}</option>
              <option value="quarter">{t("Quarterly", "ত্রৈমাসিক")}</option>
              <option value="year">{t("Annual", "বার্ষিক")}</option>
            </select>
          </div>
        </label>
        <span className="ex-pill">
          <RefreshCw size={12} style={{ verticalAlign: "middle" }} /> DEMO DATA
        </span>
      </div>

      <div className="ex-kpis">
        {stats.map((item) => (
          <div className="ex-card" key={item.title}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#687F72" }}>{item.title}</span>
              <item.icon size={19} color={item.color} />
            </div>
            <div className="ex-metrics">{money(item.number)}</div>
            <div style={{ fontSize: 10, color: "#789083" }}>{item.detail}</div>
          </div>
        ))}
      </div>

      {showBaseline && (
        <section className="ex-card" style={{ marginTop: 15, borderLeft: `4px solid ${green}` }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 10,
          }}>
            <div>
              <div className="ex-small">NATIONAL REFERENCE SNAPSHOT · SEPARATE FROM INTERACTIVE DEMO</div>
              <h3 style={{ margin: "7px 0 5px", fontSize: 16 }}>
                {t("Programme baseline reference", "কর্মসূচির বেসলাইন")}
              </h3>
              <div style={{ fontSize: 12, color: "#7A8E82" }}>
                {t(
                  "Reference figures are not recalculated from the small fictional demo population.",
                  "বেসলাইন সংখ্যা ছোট ডেমো ডাটাসেট থেকে হিসাব করা নয়।"
                )}
              </div>
            </div>
            <button className="ex-btn" onClick={() => setShowBaseline(false)}>Hide <ChevronDown size={14} /></button>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginTop: 17 }}>
            <div>
              <div className="ex-small">ELIGIBLE BASELINE</div>
              <strong style={{ fontSize: 24 }}>1,895,010</strong>
            </div>
            <div>
              <div className="ex-small">PROCESSED BASELINE</div>
              <strong style={{ fontSize: 24 }}>1,777,870</strong>
            </div>
          </div>
        </section>
      )}
      {!showBaseline && <button className="ex-btn" style={{ marginTop: 15 }}
        onClick={() => setShowBaseline(true)}>Show national reference baseline</button>}

      <div className="ex-grid" style={{ marginTop: 15 }}>
        <section className="ex-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <h3 className="ex-title">
              {t("Operational performance", "কার্যক্রমের অগ্রগতি")}
            </h3>
            <select className="ex-control" value={topic}
              onChange={(e) => setTopic(e.target.value as Topic)}>
              <option value="applications">Applications</option>
              <option value="payments">Payments</option>
              <option value="grievances">Grievances</option>
              <option value="training">Training</option>
            </select>
          </div>
          <div className="ex-chart">
            {chart.map(([name, count], index) => (
              <div className="ex-chart-col" key={name} title={`${name}: ${count}`}>
                <b style={{ fontSize: 12 }}>{count}</b>
                <div className="ex-bar" style={{
                  height: `${Math.max(5, count / max * 83)}%`,
                  background: index % 3 === 1 ? pink : green,
                }} />
                <span style={{ fontSize: 10, textAlign: "center", color: "#667D70" }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div className="ex-small">
            {t("Values reflect the selected fictional demonstration records.", "নির্বাচিত কাল্পনিক রেকর্ডের তথ্য দেখানো হচ্ছে।")}
          </div>
        </section>

        <section className="ex-card">
          <h3 className="ex-title">{t("Delivery health", "সেবা প্রদানের অবস্থা")}</h3>
          <div className="ex-rows">
            {[
              ["Payment success", paid.length, filteredPayments.length],
              ["Grievance resolution", filteredGrievances.length - openGrievances.length, filteredGrievances.length],
              ["Training attendance", filteredTraining.filter((p) => p.attended).length, filteredTraining.length],
              ["Active beneficiaries", active, filteredBeneficiaries.length],
            ].map(([name, value, total]) => {
              const percent = Number(total) ? Number(value) / Number(total) * 100 : 0;
              return (
                <div key={String(name)}>
                  <div className="ex-row">
                    <b>{name}</b>
                    <span>{Math.round(percent)}%</span>
                  </div>
                  <div className="ex-track">
                    <div className="ex-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="ex-small" style={{ marginTop: 17 }}>
            <CheckCircle2 size={13} style={{ verticalAlign: "middle" }} />
            {" "}{t("Cross-module demo indicators", "সমন্বিত ডেমো সূচক")}
          </p>
        </section>
      </div>

      <div className="ex-grid" style={{ marginTop: 15 }}>
        <section className="ex-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h3 className="ex-title">{t("Coverage by union", "ইউনিয়নভিত্তিক কভারেজ")}</h3>
            <MapPinned size={18} color={green} />
          </div>
          <div className="ex-rows">
            {unions.filter((union) => area === "all" || union === area)
              .map((union) => {
                const count = beneficiaries.filter((p) => p.union === union).length;
                const maximum = Math.max(
                  1, ...unions.map((u) => beneficiaries.filter((p) => p.union === u).length)
                );
                return (
                  <div key={union}>
                    <div className="ex-row">
                      <b>{union}</b>
                      <span>{count < 10 ? t("Small group · suppressed", "ক্ষুদ্র গ্রুপ · গোপন") : money(count)}</span>
                    </div>
                    <div className="ex-track">
                      <div className="ex-fill" style={{
                        width: `${count / maximum * 100}%`,
                        background: "#469B81",
                      }} />
                    </div>
                  </div>
                );
              })}
          </div>
          <p className="ex-small" style={{ marginTop: 16 }}>
            {t("Counts below 10 are suppressed for demonstration privacy.", "১০-এর নিচের সংখ্যা গোপন রাখা হয়েছে।")}
          </p>
        </section>

        <section className="ex-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h3 className="ex-title">{t("Illustrative activity trend", "নমুনা কার্যক্রমের প্রবণতা")}</h3>
            <CalendarDays size={18} color={green} />
          </div>
          <div className="ex-chart" style={{ height: 150 }}>
            {visualTrend.map((value, i) => (
              <div key={i} className="ex-chart-col">
                <div className="ex-bar" style={{
                  height: `${value}%`,
                  background: i === visualTrend.length - 1 ? pink : "#73BA9E",
                }} />
                <span style={{ fontSize: 9, color: "#84978C" }}>{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="ex-small">
            {t(
              "Illustrative 12-point visual trend, not measured historical activity.",
              "১২টি নমুনা পয়েন্ট; প্রকৃত ঐতিহাসিক তথ্য নয়।"
            )}
          </p>
        </section>
      </div>

      <footer className="ex-foot">
        MCBP-MIS · Executive Intelligence Demonstration ·
        Fictional records · No live integrations · Human decisions required
        <div style={{ marginTop: 8 }}>
          <Link href="/" style={{ color: green, textDecoration: "none", fontWeight: 700 }}>
            {t("Return to main workspace", "মূল ড্যাশবোর্ডে ফিরুন")} <ArrowUpRight size={12} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
