
"use client";
import { digits } from "../lib/ui-l10n";

import { useState } from "react";
import { formatNumber, formatMoney } from "../lib/number-l10n";
import {
  Wallet, CheckCircle2, AlertTriangle, RotateCcw,
  Download, Search, ShieldCheck, FileText,
} from "lucide-react";
import { useDemoStore } from "../lib/demo-store";
import { useBeneficiaryStore, sampleProfiles } from "../lib/beneficiary-store";
import {
  usePayrollStore,
  type PayrollPerson,
  type Payment,
} from "../lib/payroll-store";

type Lang = "en" | "bn";
type Props = { lang: Lang; roleId: string };

const currency = (amount: number, lang: Lang) => formatMoney(amount, lang);

function downloadCsv(name: string, rows: string[][]) {
  const content = rows
    .map((row) =>
      row.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")
    )
    .join("\r\n");
  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PayrollPanel({ lang, roleId }: Props) {
  const cycles = usePayrollStore((s) => s.cycles);
  const payments = usePayrollStore((s) => s.payments);
  const logs = usePayrollStore((s) => s.logs);
  const createCycle = usePayrollStore((s) => s.createCycle);
  const actOnCycle = usePayrollStore((s) => s.actOnCycle);
  const recordSettlement = usePayrollStore((s) => s.recordSettlement);
  const requestCorrection = usePayrollStore((s) => s.requestCorrection);
  const reviewCorrection = usePayrollStore((s) => s.reviewCorrection);
  const repay = usePayrollStore((s) => s.repay);

  const applications = useDemoStore((s) => s.applications);
  const overrides = useBeneficiaryStore((s) => s.overrides);

  const [cycleId, setCycleId] = useState("PAY-2026-10-DEMO");
  const [month, setMonth] = useState("2026-11");
  const [search, setSearch] = useState("");
  const [correctionId, setCorrectionId] = useState("");
  const [note, setNote] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<"cycles" | "payments" | "reconciliation" | "audit">("cycles");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const maker = roleId === "finance";
  const checker = roleId === "finance_checker";

  const actual: PayrollPerson[] = applications
    .filter((a) => a.status === "enrolled" && a.beneficiaryId)
    .map((a) => ({
      id: a.beneficiaryId!,
      name: a.nameEn,
      division: a.division,
      union: a.union,
      active: overrides[a.beneficiaryId!]?.status
        ? overrides[a.beneficiaryId!].status === "active"
        : true,
      consent: a.consent,
      monthsUsed: 0,
      nidValid: /^\d{4}$/.test(a.nid.slice(-4)),
    }));

  const sample: PayrollPerson[] = sampleProfiles.map((p) => {
    const update = overrides[p.id] ?? {};
    return {
      id: p.id,
      name: update.nameEn ?? p.nameEn,
      division: p.district === "Kurigram" ? "Rangpur" : "Rangpur",
      union: update.union ?? p.union,
      active: (update.status ?? p.status) === "active",
      consent: p.consent,
      monthsUsed: p.monthsUsed,
      nidValid: /^\d{4}$/.test(p.nidLast4),
    };
  });

  const people = [...sample, ...actual];

  const cycle = cycles.find((c) => c.id === cycleId) ?? cycles[0];
  const cyclePayments = payments.filter((p) => p.cycleId === cycle.id);
  const filteredPayments = cyclePayments.filter((p) =>
    `${p.id} ${p.beneficiaryId} ${p.name} ${p.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const cycleLogs = logs.filter((l) => l.cycleId === cycle.id);

  const paid = cyclePayments.filter((p) =>
    ["paid", "repaid"].includes(p.status)
  );
  const bounced = cyclePayments.filter((p) => p.status === "bounced");
  const outstanding = cyclePayments.filter((p) =>
    ["pending", "correction_pending", "repayment_approved"].includes(p.status)
  );
  const total = cyclePayments.reduce((sum, p) => sum + p.amount, 0);
  const settled = paid.reduce((sum, p) => sum + p.amount, 0);
  const percent = cyclePayments.length
    ? Math.round((paid.length / cyclePayments.length) * 100)
    : 0;

  function notify(ok: boolean, messageText: string) {
    setFailed(!ok);
    setMessage(messageText);
  }

  function onCycleAction(action: "submit" | "approve" | "process" | "reconcile") {
    const r = actOnCycle(cycle.id, action, roleId, otp);
    notify(r.ok, r.message);
    if (r.ok) setOtp("");
  }

  function onCorrection(p: Payment) {
    const r = requestCorrection(p.id, note, roleId);
    notify(r.ok, r.message);
    if (r.ok) {
      setNote("");
      setCorrectionId("");
    }
  }

  function exportPayments() {
    downloadCsv(`payroll-${cycle.month}.csv`, [
      ["Transaction ID", "Beneficiary ID", "Name", "Amount BDT", "Status", "Reference", "Reason"],
      ...cyclePayments.map((p) => [
        p.id, p.beneficiaryId, p.name, String(p.amount),
        p.status, p.reference, p.reason ?? "",
      ]),
    ]);
  }

  function exportAudit() {
    downloadCsv(`payroll-audit-${cycle.month}.csv`, [
      ["Cycle", "Transaction", "Action", "Actor", "Timestamp"],
      ...cycleLogs.map((l) => [
        l.cycleId, l.paymentId ?? "", l.action, l.actor, l.time,
      ]),
    ]);
  }

  const button: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  };
  const input: React.CSSProperties = {
    border: "1px solid #CBD5D0",
    borderRadius: 9,
    background: "#fff",
    padding: "9px 11px",
    minHeight: 38,
    maxWidth: "100%",
    font: "inherit",
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <section className="card">
        <div className="card-title" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2><Wallet size={17} style={{ verticalAlign: "middle", marginRight: 8 }} />
              {t("Benefit Payroll & Reconciliation", "ভাতা পেরোল ও সমন্বয়")}
            </h2>
            <p className="sub">
              {t("Mock SPBMU / iBAS++ / MFS flow · no actual payments",
                "SPBMU / iBAS++ / MFS সিমুলেশন · প্রকৃত অর্থ লেনদেন নয়")}
            </p>
          </div>
          <span className="pill a">
            {t("Baseline scenario + workflow transactions", "বেসলাইন ও ডেমো লেনদেন")}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 15 }}>
          <select style={input} value={cycle.id} onChange={(e) => {
            setCycleId(e.target.value);
            setMessage("");
          }}>
            {cycles.map((c) => (
              <option value={c.id} key={c.id}>{c.month} · {c.status}</option>
            ))}
          </select>
          {maker && (
            <>
              <input
                type="month"
                style={input}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                aria-label="Payroll month"
              />
              <button className="btn primary" onClick={() => {
                const r = createCycle(month, people, roleId);
                notify(r.ok, r.message);
                if (r.ok) setCycleId(`PAY-${month}-DEMO`);
              }}>
                {t("Generate payroll", "পেরোল তৈরি করুন")}
              </button>
            </>
          )}
          <button className="btn" style={button} onClick={exportPayments}>
            <Download size={15} /> CSV
          </button>
        </div>
        {message && (
          <p role={failed ? "alert" : "status"} style={{
            background: failed ? "#FBE7EF" : "#E4F1EC",
            color: failed ? "#A3134B" : "#004B37",
            padding: 12, borderRadius: 9, fontSize: 12,
          }}>
            {message}
          </p>
        )}
      </section>

      <div className="grid kpis">
        {[
          [t("Cycle amount", "মোট পেরোল"), currency(total, lang), Wallet, "green"],
          [t("Paid / repaid", "পরিশোধিত"), currency(settled, lang), CheckCircle2, "green"],
          [t("Bounced", "ব্যর্থ পেমেন্ট"), formatNumber(bounced.length, lang), AlertTriangle, "magenta"],
          [t("Outstanding", "অমীমাংসিত"), formatNumber(outstanding.length, lang), RotateCcw, "amber"],
        ].map(([label, value, Icon, color], i) => {
          const Glyph = Icon as typeof Wallet;
          return (
            <div className="card stat" key={i}>
              <div className="stat-head">
                <span>{label as string}</span>
                <span className={`stat-icon ${color}`}>
                  <Glyph size={19} />
                </span>
              </div>
              <strong>{value as string}</strong>
              <small className="muted">{t("Selected cycle", "নির্বাচিত চক্র")}</small>
            </div>
          );
        })}
      </div>

      <div className="grid two">
        <section className="card">
          <div className="card-title">
            <h2>{t("Payment settlement progress", "পেমেন্ট অগ্রগতি")}</h2>
            <span className="pill g">{percent}%</span>
          </div>
          <div className="bar" style={{ height: 13, marginTop: 18 }}>
            <i className="g" style={{ width: `${percent}%` }} />
          </div>
          <div className="indicator">
            <span>{t("Paid", "পরিশোধিত")}</span><b>{paid.length}</b>
          </div>
          <div className="indicator">
            <span>{t("Bounced", "ব্যর্থ")}</span><b>{bounced.length}</b>
          </div>
          <div className="indicator">
            <span>{t("Pending / correction", "বাকি / সংশোধন")}</span>
            <b>{outstanding.length}</b>
          </div>
        </section>
        <section className="card">
          <div className="card-title">
            <h2>{t("Cycle status & controls", "চক্রের অবস্থা ও নিয়ন্ত্রণ")}</h2>
            <span className="pill a">{cycle.status}</span>
          </div>
          <p className="sub">
            {t("Rule V1 · BDT 850 / eligible month · maximum 36 months",
              "নিয়ম V1 · প্রতি যোগ্য মাসে ৮৫০ টাকা · সর্বোচ্চ ৩৬ মাস")}
          </p>
          <p className="muted" style={{ marginTop: 10 }}>
            {t("Maker", "মেকার")}: {cycle.maker} · {t("Checker", "চেকার")}: {cycle.checker ?? "—"}
          </p>
          {checker && cycle.status === "submitted" && (
            <input
              style={{ ...input, margin: "12px 0", display: "block" }}
              placeholder="Demo OTP 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 15 }}>
            {maker && cycle.status === "draft" && (
              <button className="btn primary" onClick={() => onCycleAction("submit")}>
                {t("Submit to checker", "চেকারের কাছে পাঠান")}
              </button>
            )}
            {checker && cycle.status === "submitted" && (
              <button className="btn primary" onClick={() => onCycleAction("approve")}>
                <ShieldCheck size={15} /> {t("Approve cycle", "চক্র অনুমোদন")}
              </button>
            )}
            {maker && cycle.status === "approved" && (
              <button className="btn primary" onClick={() => onCycleAction("process")}>
                {t("Simulate payment batch", "পেমেন্ট ব্যাচ সিমুলেশন")}
              </button>
            )}
            {maker && cycle.status === "processed" && (
              <button className="btn" onClick={() => onCycleAction("reconcile")}>
                {t("Close reconciliation", "সমন্বয় সম্পন্ন করুন")}
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="card">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
          {([
            ["cycles", "Cycle", "চক্র"],
            ["payments", "Transactions", "লেনদেন"],
            ["reconciliation", "Reconciliation", "সমন্বয়"],
            ["audit", "Audit", "অডিট"],
          ] as const).map(([id, en, bn]) => (
            <button
              key={id}
              className={`btn ${view === id ? "primary" : ""}`}
              onClick={() => setView(id)}
            >{t(en, bn)}</button>
          ))}
        </div>

        {view === "cycles" && (
          <>
            <h2>{t("Payroll cycles", "পেরোল চক্র")}</h2>
            <div style={{ overflowX: "auto", marginTop: 13 }}>
              <table>
                <thead>
                  <tr>
                    <th>{t("Cycle", "চক্র")}</th>
                    <th>{t("Month", "মাস")}</th>
                    <th>{t("Records", "রেকর্ড")}</th>
                    <th>{t("Status", "অবস্থা")}</th>
                    <th>{t("Action", "অ্যাকশন")}</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((c) => (
                    <tr key={c.id}>
                      <td className="mono">{c.id}</td>
                      <td>{c.month}</td>
                      <td>{payments.filter((p) => p.cycleId === c.id).length}</td>
                      <td><span className="pill a">{c.status}</span></td>
                      <td><button className="link" onClick={() => {
                        setCycleId(c.id);
                        setView("payments");
                      }}>{t("Open", "খুলুন")}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {(view === "payments" || view === "reconciliation") && (
          <>
            <div className="card-title">
              <h2>{t("Transaction & exception register", "লেনদেন ও ব্যতিক্রম তালিকা")}</h2>
              <FileText size={17} color="#006A4E" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
              <Search size={17} color="#5B6660" />
              <input
                style={{ ...input, flex: 1, width: "100%" }}
                placeholder={t("Search transaction or beneficiary", "লেনদেন বা উপকারভোগী খুঁজুন")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>{t("Transaction", "লেনদেন")}</th>
                    <th>{t("Beneficiary", "উপকারভোগী")}</th>
                    <th>{t("Amount", "পরিমাণ")}</th>
                    <th>{t("Status", "অবস্থা")}</th>
                    <th>{t("Action", "অ্যাকশন")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="mono">{p.id}</span>
                        <div className="muted">{p.reference}</div>
                      </td>
                      <td>{p.name}<div className="muted">{p.beneficiaryId}</div></td>
                      <td>{currency(p.amount, lang)}</td>
                      <td>
                        <span className={`pill ${
                          ["paid", "repaid"].includes(p.status)
                            ? "g" : p.status === "bounced" ? "m" : "a"
                        }`}>{p.status}</span>
                        {p.reason && <div className="muted">{p.reason}</div>}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {maker &&
                            p.status === "pending" &&
                            cycle.status === "processed" && (
                              <>
                                <button className="link" onClick={() => {
                                  const r = recordSettlement(cycle.id, p.id, "paid", roleId);
                                  notify(r.ok, r.message);
                                }}>{t("Mark paid", "পরিশোধিত")}</button>
                                <button className="link" onClick={() => {
                                  const r = recordSettlement(cycle.id, p.id, "bounced", roleId);
                                  notify(r.ok, r.message);
                                }}>{t("Simulate bounce", "ব্যর্থ দেখান")}</button>
                              </>
                            )}
                          {maker && p.status === "bounced" && (
                            <button className="link" onClick={() => setCorrectionId(p.id)}>
                              {t("Correct", "সংশোধন")}
                            </button>
                          )}
                          {checker && p.status === "correction_pending" && (
                            <button className="link" onClick={() => {
                              const r = reviewCorrection(p.id, roleId, otp);
                              notify(r.ok, r.message);
                              if (r.ok) setOtp("");
                            }}>{t("Approve re-pay", "পুনঃপেমেন্ট অনুমোদন")}</button>
                          )}
                          {maker && p.status === "repayment_approved" && (
                            <button className="link" onClick={() => {
                              const r = repay(p.id, roleId);
                              notify(r.ok, r.message);
                            }}>{t("Re-pay", "পুনঃপরিশোধ")}</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {correctionId && maker && (
              <div className="card" style={{ marginTop: 13 }}>
                <h2>{t("Correction request", "সংশোধনের অনুরোধ")}</h2>
                <p className="muted">{correctionId}</p>
                <input
                  style={{ ...input, width: "100%", margin: "12px 0" }}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("Enter fictional corrected wallet / reason", "কাল্পনিক সংশোধিত ওয়ালেট / কারণ")}
                />
                <button className="btn primary" onClick={() => {
                  const p = payments.find((item) => item.id === correctionId);
                  if (p) onCorrection(p);
                }}>{t("Send for checker approval", "চেকারের অনুমোদনে পাঠান")}</button>
                <button className="btn" style={{ marginLeft: 7 }} onClick={() => setCorrectionId("")}>
                  {t("Cancel", "বাতিল")}
                </button>
              </div>
            )}
            {checker && cyclePayments.some((p) => p.status === "correction_pending") && (
              <label style={{ display: "block", marginTop: 13, fontSize: 12 }}>
                {t("Checker OTP", "চেকার ওটিপি")}{" "}
                <input
                  style={input}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              </label>
            )}
          </>
        )}

        {view === "audit" && (
          <>
            <div className="card-title">
              <h2>{t("Payroll audit events", "পেরোল অডিট ঘটনা")}</h2>
              <button className="btn" onClick={exportAudit}>
                <Download size={15} /> {t("Export audit CSV", "অডিট CSV")}
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr><th>{t("Action", "অ্যাকশন")}</th><th>{t("Actor", "ব্যবহারকারী")}</th><th>{t("Transaction", "লেনদেন")}</th><th>{t("Time", "সময়")}</th></tr>
                </thead>
                <tbody>
                  {cycleLogs.map((l) => (
                    <tr key={l.id}>
                      <td>{l.action.replaceAll("_", " ")}</td>
                      <td>{l.actor}</td>
                      <td className="mono">{l.paymentId ?? "—"}</td>
                      <td>{new Date(l.time).toLocaleString((lang === "bn") ? "bn-BD" : "en-GB")}</td>
                    </tr>
                  ))}
                  {!cycleLogs.length && (
                    <tr><td colSpan={4}>{t("No new workflow events.", "নতুন কোনো ঘটনা নেই।")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="card">
        <div className="card-title">
          <h2>{t("Original D17 baseline scenario", "D17 মূল বেসলাইন দৃশ্য")}</h2>
          <span className="pill a">{t("Static reference", "স্থির রেফারেন্স")}</span>
        </div>
        <div className="grid" style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        }}>
          <div className="stat">
            <span className="muted">{t("Eligible beneficiaries", "যোগ্য উপকারভোগী")}</span>
            <strong>{digits(lang, "1,895,010")}</strong>
          </div>
          <div className="stat">
            <span className="muted">{t("Processed records", "প্রক্রিয়াকৃত রেকর্ড")}</span>
            <strong>{digits(lang, "1,777,870")}</strong>
          </div>
          <div className="stat">
            <span className="muted">{t("Default monthly benefit", "নমুনা মাসিক ভাতা")}</span>
            <strong>৳850</strong>
          </div>
        </div>
        <p className="sub">
          {t(
            "National D17 baseline is a static reference snapshot; transaction tables above are separate fictional workflow data.",
            "জাতীয় D17 বেসলাইন স্থির রেফারেন্স; উপরের লেনদেনগুলো আলাদা কাল্পনিক ওয়ার্কফ্লো তথ্য।"
          )}
        </p>
      </section>
    </div>
  );
}
