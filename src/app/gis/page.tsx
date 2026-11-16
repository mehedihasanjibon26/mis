
"use client";
import { ui } from "../../lib/ui-l10n";

import { useEffect, useState } from "react";
import Link from "next/link";
import BangladeshLiveMap from "../../components/BangladeshLiveMap";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight,
  Download, Filter, Layers3, MapPin, MapPinned,
  Search, ShieldCheck, Users, Wallet, AlertTriangle,
  Activity, ZoomIn, ZoomOut, RotateCcw, Crosshair,
} from "lucide-react";
import { useDemoStore } from "../../lib/demo-store";
import { usePayrollStore } from "../../lib/payroll-store";
import { useGrievanceStore } from "../../lib/grievance-store";
import { useTrainingStore } from "../../lib/training-store";

type Lang = "en" | "bn";
type Layer = "coverage" | "applications" | "payments" |
  "grievances" | "facilities" | "underserved" | "field";

type Region = {
  id: string;
  en: string;
  bn: string;
  coverage: number;
  x: number;
  y: number;
  shape: string;
};

const regions: Region[] = [
  {
    id: "Rangpur", en: "Rangpur", bn: "রংপুর",
    coverage: 82, x: 113, y: 94,
    shape: "65,55 117,34 159,52 180,90 154,128 97,131 58,100",
  },
  {
    id: "Rajshahi", en: "Rajshahi", bn: "রাজশাহী",
    coverage: 79, x: 101, y: 177,
    shape: "58,139 154,137 177,173 163,219 93,229 48,185",
  },
  {
    id: "Mymensingh", en: "Mymensingh", bn: "ময়মনসিংহ",
    coverage: 74, x: 220, y: 130,
    shape: "183,73 248,69 269,107 251,160 193,171 167,127",
  },
  {
    id: "Sylhet", en: "Sylhet", bn: "সিলেট",
    coverage: 61, x: 323, y: 127,
    shape: "271,92 322,70 358,107 367,150 328,177 267,160",
  },
  {
    id: "Dhaka", en: "Dhaka", bn: "ঢাকা",
    coverage: 88, x: 214, y: 219,
    shape: "178,178 253,169 285,219 266,274 215,286 166,236",
  },
  {
    id: "Khulna", en: "Khulna", bn: "খুলনা",
    coverage: 77, x: 117, y: 290,
    shape: "93,238 162,226 204,280 175,355 119,369 78,315",
  },
  {
    id: "Barishal", en: "Barishal", bn: "বরিশাল",
    coverage: 71, x: 245, y: 320,
    shape: "216,289 273,283 290,334 263,381 209,354 182,331",
  },
  {
    id: "Chattogram", en: "Chattogram", bn: "চট্টগ্রাম",
    coverage: 84, x: 340, y: 290,
    shape: "290,180 365,160 372,229 394,278 380,348 354,419 321,389 298,323 277,272",
  },
];

const layerLabels: Record<Layer, [string, string]> = {
  coverage: ["Coverage index", "কভারেজ সূচক"],
  applications: ["Applications", "আবেদন"],
  payments: ["Payments", "পেমেন্ট"],
  grievances: ["Grievance hotspots", "অভিযোগ হটস্পট"],
  facilities: ["Health facilities", "স্বাস্থ্যকেন্দ্র"],
  underserved: ["Under-served areas", "সুবিধাবঞ্চিত এলাকা"],
  field: ["Field visit points", "মাঠ পরিদর্শন"],
};

const divisions = regions.map((r) => r.id);

const unions = ["Kaunia Sadar", "Haragach", "Balarhat"];

function layerColor(region: Region, layer: Layer) {
  if (layer === "underserved") {
    return region.coverage < 75 ? "#E8A25D" : "#A3CEC0";
  }
  if (layer === "grievances") {
    return region.id === "Rangpur" ? "#D97AA1" : "#DCC1CF";
  }
  if (layer === "facilities") return "#78B5C5";
  if (layer === "field") return "#9A91CD";
  if (layer === "applications") return "#74B5A1";
  if (layer === "payments") return "#73A7C5";

  if (region.coverage >= 85) return "#167F61";
  if (region.coverage >= 80) return "#349E7F";
  if (region.coverage >= 75) return "#68B89B";
  if (region.coverage >= 70) return "#A8D2C2";
  return "#D7E8DE";
}

function downloadCsv(rows: string[][]) {
  const csv = rows.map((row) =>
    row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "MCBP-GIS-demo-report.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function GisPage() {
  const [lang, setLang] = useState<Lang>("en");
  // MCBP_SHELL_LANGUAGE_SYNC_V1
  useEffect(() => {
    const saved = window.localStorage.getItem("mcbp-lang");
    if (saved === "en" || saved === "bn") {
      setLang(saved);
    }
  }, []);

  const [role, setRole] = useState("executive");
  const [layer, setLayer] = useState<Layer>("coverage");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [union, setUnion] = useState("");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [showPins, setShowPins] = useState(true);
  const [selectionMode, setSelectionMode] = useState<"none" | "radius" | "polygon">("none");
  const [selectedPin, setSelectedPin] = useState("");
  const [draftLayer, setDraftLayer] = useState(false);
  const [promotedLayer, setPromotedLayer] = useState(false);

  const applications = useDemoStore((s) => s.applications);
  const payments = usePayrollStore((s) => s.payments);
  const grievances = useGrievanceStore((s) => s.cases);
  const sessions = useTrainingStore((s) => s.sessions);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  const isNational = ["executive", "admin"].includes(role);

  const selected = regions.find((r) => r.id === division);
  const currentCoverage = selected?.coverage ?? 77;

  const demoApps = applications.filter((a) =>
    !union || a.union === union
  );

  const demoGrievances = grievances.filter((g) =>
    g.queue === "programme" && !g.anonymous
  );

  const selectedUnionSessions = sessions.filter((s) =>
    !union || s.union === union
  );

  const filteredRegions = regions.filter((r) =>
    r.en.toLowerCase().includes(query.toLowerCase()) ||
    r.bn.includes(query)
  );

  function chooseDivision(id: string) {
    setDivision(id);
    setDistrict("");
    setUpazila("");
    setUnion("");
    setSelectedPin("");
  }

  function resetSelection() {
    setDivision("");
    setDistrict("");
    setUpazila("");
    setUnion("");
    setQuery("");
    setZoom(1);
    setSelectedPin("");
    setSelectionMode("none");
  }

  function selectRangpurDemo() {
    setDivision("Rangpur");
    setDistrict("Rangpur");
    setUpazila("Kaunia");
    setUnion("");
  }

  const box: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E0EAE4",
    borderRadius: 17,
    padding: 20,
    boxShadow: "0 7px 24px rgba(11,70,47,.035)",
  };

  const control: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #D8E6DD",
    borderRadius: 9,
    color: "#244B3A",
    padding: "10px 12px",
    fontSize: 12,
    cursor: "pointer",
  };

  const action: React.CSSProperties = {
    ...control,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  };

  const primary: React.CSSProperties = {
    ...action,
    background: "#006A4E",
    color: "white",
    borderColor: "#006A4E",
  };

  const muted: React.CSSProperties = {
    color: "#758C7E",
    fontSize: 11,
  };

  return (
    <div className="gis-root">
      <style>{`
        .gis-root{min-height:100vh;background:#F4F7F5;color:#213F31;
          font-family:Arial,Helvetica,sans-serif;padding:24px clamp(14px,3vw,48px)}
        .gis-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:13px;margin-bottom:18px}
        .gis-hero{background:linear-gradient(115deg,#063F31,#006A4E);
          border-radius:19px;color:#fff;padding:28px;margin-bottom:16px}
        .gis-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}
        .gis-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(290px,1fr);gap:15px}
        .gis-card-title{font-size:15px;font-weight:800;margin:0 0 13px}
        .gis-map{background:radial-gradient(circle at center,#E6F2EB 0%,#F3F9F4 70%);
          border:1px solid #E4EFE7;border-radius:15px;overflow:hidden}
        .gis-region{cursor:pointer;stroke:#fff;stroke-width:3;stroke-linejoin:round;transition:opacity .15s,filter .15s}
        .gis-region:hover{filter:brightness(1.09);stroke:#094B3C;stroke-width:4}
        .gis-list-btn{border:1px solid #E0EAE4;background:#fff;border-radius:11px;
          padding:12px;text-align:left;width:100%;cursor:pointer}
        .gis-list-btn:hover{border-color:#006A4E}
        .gis-indicator{display:flex;align-items:center;justify-content:space-between;
          gap:10px;padding:12px 0;border-bottom:1px solid #EDF2EE;font-size:12px}
        .gis-tag{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;
          background:#E7F3EC;color:#075F47;border-radius:30px;font-size:10px;font-weight:800}
        .gis-bottom{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:15px}
        @media(max-width:930px){.gis-grid{grid-template-columns:1fr}
          .gis-kpis{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:620px){.gis-bottom{grid-template-columns:1fr}
          .gis-root{padding:12px}.gis-hero{padding:20px}}
        @media print{.gis-top button,.gis-top select,.gis-root a{display:none!important}}
      `}</style>

      <header className="gis-top">
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            background: "#006A4E", color: "white",
            borderRadius: 12, padding: 11,
          }}>
            <MapPinned size={22} />
          </div>
          <div>
            <b style={{ fontSize: 18 }}>MCBP-MIS</b>
            <div style={muted}>{t("GIS INTELLIGENCE", "জিআইএস ইন্টেলিজেন্স")}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" style={{ ...action, textDecoration: "none" }}>
            <ArrowLeft size={14} /> {t("Main dashboard", "মূল ড্যাশবোর্ড")}
          </Link>
          <select style={control} value={role} onChange={(e) => {
            setRole(e.target.value);
            if (!["executive", "admin"].includes(e.target.value)) {
              selectRangpurDemo();
            }
          }}>
            <option value="executive">{ui(lang, "Programme Executive / PD")}</option>
            <option value="admin">{ui(lang, "System Administrator")}</option>
            <option value="uwao">UWAO — Kaunia</option>
          </select>
          <button style={action} onClick={() =>
            setLang(lang === "en" ? "bn" : "en")
          }>
            {lang === "en" ? "বাংলা" : "EN"}
          </button>
          <button style={primary} onClick={() => downloadCsv([
            ["Division", "Coverage index", "Layer", "Source"],
            ...regions.map((r) => [
              r.en, String(r.coverage), layer, "PRD demo reference",
            ]),
          ])}>
            <Download size={14} /> CSV
          </button>
        </div>
      </header>

      <section className="gis-hero">
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <span style={{ fontSize: 11, color: "#BFE7D5", letterSpacing: 1.5 }}>
              GEOSPATIAL PROGRAMME INTELLIGENCE
            </span>
            <h1 style={{ fontSize: "clamp(25px,3vw,35px)", margin: "11px 0" }}>
              {t("Where impact meets location", "অবস্থানভিত্তিক কর্মসূচির চিত্র")}
            </h1>
            <p style={{ color: "#CBEADA", fontSize: 13, maxWidth: 650, lineHeight: 1.65 }}>
              {t(
                "Explore coverage, identify under-served regions and examine programme indicators with interactive map layers.",
                "ম্যাপ লেয়ারে কভারেজ, সুবিধাবঞ্চিত অঞ্চল এবং কর্মসূচির সূচক দেখুন।"
              )}
            </p>
          </div>
          <div className="gis-tag" style={{ background: "#D7F2E6" }}>
            <ShieldCheck size={13} /> FICTIONAL DATA · SCHEMATIC MAP
          </div>
        </div>
      </section>

      <div className="gis-kpis">
        {[
          [t("Divisions", "বিভাগ"), "8", MapPinned],
          [t("Selected coverage", "নির্বাচিত কভারেজ"), `${currentCoverage}%`, Activity],
          [t("Demo applications", "ডেমো আবেদন"), String(demoApps.length), Users],
          [t("Training sessions", "প্রশিক্ষণ সেশন"), String(selectedUnionSessions.length), CheckCircle2],
        ].map(([name, number, Icon], i) => {
          const Glyph = Icon as typeof Users;
          return (
            <div style={box} key={i}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={muted}>{name as string}</span>
                <Glyph size={19} color="#006A4E" />
              </div>
              <div style={{
                fontSize: 28, fontWeight: 850,
                margin: "14px 0 4px",
              }}>
                {number as string}
              </div>
              <div style={muted}>{t("Illustrative GIS dashboard", "নমুনা জিআইএস ড্যাশবোর্ড")}</div>
            </div>
          );
        })}
      </div>

      <div className="gis-grid">
        <section style={box}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 12, flexWrap: "wrap",
          }}>
            <div>
              <h2 className="gis-card-title">
                <Layers3 size={17} style={{ verticalAlign: "middle", marginRight: 7 }} />
                {t("Programme coverage map", "কর্মসূচির কভারেজ ম্যাপ")}
              </h2>
              <div style={muted}>{t("Bangladesh divisions · interactive geographic boundaries", "বাংলাদেশের বিভাগসমূহ · ইন্টারঅ্যাকটিভ ভৌগোলিক সীমানা")}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={action} title="Zoom in"
                onClick={() => setZoom((z) => Math.min(1.5, z + .15))}>
                <ZoomIn size={16} />
              </button>
              <button style={action} title="Zoom out"
                onClick={() => setZoom((z) => Math.max(.8, z - .15))}>
                <ZoomOut size={16} />
              </button>
              <button style={action} title="Reset selection" onClick={resetSelection}>
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <div style={{
            display: "flex", gap: 9, flexWrap: "wrap",
            alignItems: "center", margin: "16px 0",
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, flex: 1 }}>
              <Search size={16} color="#708A7B" />
              <input
                style={{ ...control, width: "100%", minWidth: 150 }}
                placeholder={t("Search division...", "বিভাগ খুঁজুন...")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select style={control} value={layer}
              onChange={(e) => setLayer(e.target.value as Layer)}>
              {(Object.keys(layerLabels) as Layer[]).map((id) => (
                <option key={id} value={id}>
                  {t(...layerLabels[id])}
                </option>
              ))}
            </select>
          </div>

          {/* MCBP_LIVE_GIS_MAP_V1 */}
          <div className="gis-map">
            <BangladeshLiveMap lang={lang} layer={layer} query={query} selected={division} zoom={zoom} allowAllDivisions={isNational} showPins={showPins} selectionMode={selectionMode} onPinSelect={setSelectedPin} onSelect={(id) => { if (isNational || id === "Rangpur") chooseDivision(id); }} />
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between",
            flexWrap: "wrap", gap: 10, marginTop: 13,
          }}>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {[
                ["#167F61", "85–100"],
                ["#68B89B", "75–84"],
                ["#A8D2C2", "70–74"],
                ["#D7E8DE", "<70"],
              ].map(([color, label]) => (
                <span key={label} style={{ ...muted, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{
                    width: 11, height: 11, borderRadius: 3,
                    background: color,
                  }} />
                  {label}
                </span>
              ))}
            </div>
            <span style={muted}>
              {t("Click a region to drill down", "বিস্তারিত দেখতে বিভাগ বাছুন")}
            </span>
          </div>

          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginTop: 15,
          }}>
            <button style={selectionMode === "radius" ? primary : action}
              onClick={() => setSelectionMode(
                selectionMode === "radius" ? "none" : "radius"
              )}>
              <Crosshair size={14} /> {t("Radius demo", "রেডিয়াস ডেমো")}
            </button>
            <button style={selectionMode === "polygon" ? primary : action}
              onClick={() => setSelectionMode(
                selectionMode === "polygon" ? "none" : "polygon"
              )}>
              <Filter size={14} /> {t("Polygon demo", "পলিগন ডেমো")}
            </button>
            <button style={action} onClick={() => setShowPins(!showPins)}>
              <MapPin size={14} />
              {showPins ? t("Hide pins", "পিন লুকান") : t("Show pins", "পিন দেখান")}
            </button>
          </div>

          {selectedPin && (
            <p style={{ ...muted, marginTop: 12 }}>
              <MapPin size={12} style={{ verticalAlign: "middle" }} />
              {" "}{selectedPin} · Mock point, no real GPS tracking
            </p>
          )}
        </section>

        <div style={{ display: "grid", gap: 15, alignContent: "start" }}>
          <section style={box}>
            <h2 className="gis-card-title">
              {t("Geographic drill-down", "অঞ্চলভিত্তিক বিশ্লেষণ")}
            </h2>
            <div style={{
              display: "flex", alignItems: "center",
              gap: 6, flexWrap: "wrap", ...muted, marginBottom: 14,
            }}>
              <button style={action} onClick={resetSelection}>{ui(lang, "Bangladesh")}</button>
              {division && <><ChevronRight size={13} /> {division}</>}
              {district && <><ChevronRight size={13} /> {district}</>}
              {upazila && <><ChevronRight size={13} /> {upazila}</>}
              {union && <><ChevronRight size={13} /> {union}</>}
            </div>

            <label style={{ ...muted, display: "block" }}>
              {t("Division", "বিভাগ")}
              <select style={{ ...control, width: "100%", marginTop: 6 }}
                value={division}
                onChange={(e) => chooseDivision(e.target.value)}>
                <option value="">{t("All divisions", "সব বিভাগ")}</option>
                {divisions.filter((id) =>
                  isNational || id === "Rangpur"
                ).map((id) => <option key={id}>{id}</option>)}
              </select>
            </label>

            {division === "Rangpur" && (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <label style={muted}>
                  {t("District", "জেলা")}
                  <select style={{ ...control, width: "100%", marginTop: 6 }}
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setUpazila("");
                      setUnion("");
                    }}>
                    <option value="">{t("Select district", "জেলা নির্বাচন")}</option>
                    <option value="Rangpur">Rangpur</option>
                  </select>
                </label>

                {district && (
                  <label style={muted}>
                    {t("Upazila", "উপজেলা")}
                    <select style={{ ...control, width: "100%", marginTop: 6 }}
                      value={upazila}
                      onChange={(e) => {
                        setUpazila(e.target.value);
                        setUnion("");
                      }}>
                      <option value="">{t("Select upazila", "উপজেলা নির্বাচন")}</option>
                      <option value="Kaunia">Kaunia</option>
                    </select>
                  </label>
                )}

                {upazila && (
                  <label style={muted}>
                    {t("Union", "ইউনিয়ন")}
                    <select style={{ ...control, width: "100%", marginTop: 6 }}
                      value={union}
                      onChange={(e) => setUnion(e.target.value)}>
                      <option value="">{t("All demo unions", "সব ডেমো ইউনিয়ন")}</option>
                      {unions.map((id) => <option key={id}>{id}</option>)}
                    </select>
                  </label>
                )}
              </div>
            )}

            {!division && (
              <button style={{ ...primary, marginTop: 15, width: "100%", justifyContent: "center" }}
                onClick={selectRangpurDemo}>
                {t("Explore Rangpur demo", "রংপুর ডেমো দেখুন")}
                <ArrowRight size={14} />
              </button>
            )}
          </section>

          <section style={box}>
            <h2 className="gis-card-title">
              {t("Selected area intelligence", "নির্বাচিত এলাকার তথ্য")}
            </h2>
            <div className="gis-indicator">
              <span>{t("Area", "এলাকা")}</span>
              <b>{union || upazila || district || division || "Bangladesh"}</b>
            </div>
            <div className="gis-indicator">
              <span>{t("Coverage index", "কভারেজ সূচক")}</span>
              <strong style={{ color: "#006A4E" }}>{currentCoverage}%</strong>
            </div>
            <div className="gis-indicator">
              <span>{t("Selected map layer", "ম্যাপ লেয়ার")}</span>
              <b>{t(...layerLabels[layer])}</b>
            </div>
            <div className="gis-indicator">
              <span>{t("Coverage assessment", "কভারেজ বিশ্লেষণ")}</span>
              <span className="gis-tag" style={
                currentCoverage < 75
                  ? { background: "#FFF0DF", color: "#9E661A" }
                  : {}
              }>
                {currentCoverage < 75
                  ? t("Needs attention", "বিশেষ নজর প্রয়োজন")
                  : t("Within demo range", "ডেমো অনুযায়ী স্বাভাবিক")}
              </span>
            </div>
            {division && division !== "Rangpur" && (
              <p style={muted}>
                Detailed district and union demo records are available
                for the Rangpur → Kaunia scenario only.
              </p>
            )}
          </section>

          <section style={{ ...box, background: "#F9FCFA" }}>
            <h2 className="gis-card-title">
              {t("Regional comparison", "আঞ্চলিক তুলনা")}
            </h2>
            <div style={{ display: "grid", gap: 9 }}>
              {regions.map((r) => (
                <button className="gis-list-btn" key={r.id}
                  onClick={() => chooseDivision(r.id)}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 8,
                    fontSize: 12, marginBottom: 7,
                  }}>
                    <b>{lang === "bn" ? r.bn : r.en}</b>
                    <strong>{r.coverage}%</strong>
                  </div>
                  <div style={{ background: "#E7EEE9", borderRadius: 8, height: 7 }}>
                    <div style={{
                      background: layerColor(r, "coverage"),
                      width: `${r.coverage}%`,
                      height: "100%", borderRadius: 8,
                    }} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="gis-bottom">
        <section style={box}>
          <h2 className="gis-card-title">
            <Wallet size={17} style={{ verticalAlign: "middle", marginRight: 7 }} />
            {t("Connected demo indicators", "সংযুক্ত ডেমো সূচক")}
          </h2>
          <p style={muted}>
            {t(
              "Detailed transactional counts are available for the fictional Kaunia scenario.",
              "কাল্পনিক কাউনিয়া ডেমোর লেনদেনসংক্রান্ত তথ্য।"
            )}
          </p>
          {[
            [t("Demo applications", "আবেদন"), demoApps.length],
            [t("Demo payment transactions", "পেমেন্ট লেনদেন"), payments.length],
            [t("Programme grievances", "কর্মসূচির অভিযোগ"), demoGrievances.length],
            [t("Training sessions", "প্রশিক্ষণ সেশন"), selectedUnionSessions.length],
          ].map(([label, count]) => (
            <div className="gis-indicator" key={String(label)}>
              <span>{label}</span>
              <b>{(division && division !== "Rangpur") ? "—" :
                Number(count) < 10 ? "Suppressed (<10)" : count}</b>
            </div>
          ))}
          <p style={{ ...muted, marginTop: 12 }}>
            <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
            {" "}Counts below 10 suppressed. No personal locations displayed.
          </p>
        </section>

        <section style={box}>
          <h2 className="gis-card-title">
            <Layers3 size={17} style={{ verticalAlign: "middle", marginRight: 7 }} />
            {t("Layer catalogue & governance", "লেয়ার ক্যাটালগ ও গভর্নেন্স")}
          </h2>
          <div className="gis-indicator">
            <span>{t("Active layer", "সক্রিয় লেয়ার")}</span>
            <b>{t(...layerLabels[layer])}</b>
          </div>
          <div className="gis-indicator">
            <span>{t("Version", "ভার্সন")}</span><b>Demo v1.0</b>
          </div>
          <div className="gis-indicator">
            <span>{t("Reconciliation", "রিকনসিলিয়েশন")}</span>
            <span className="gis-tag">Demo reference · no live reconciliation</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 15 }}>
            <button style={action} disabled={role !== "executive" || draftLayer}
              onClick={() => setDraftLayer(true)}>
              {t("Propose layer update", "লেয়ার আপডেট প্রস্তাব")}
            </button>
            <button style={primary} disabled={role !== "admin" || !draftLayer || promotedLayer}
              onClick={() => setPromotedLayer(true)}>
              {t("Checker approve", "অনুমোদন")}
            </button>
          </div>
          <p style={{ ...muted, marginTop: 12 }}>
            {promotedLayer ? "Mock promotion approved by admin."
              : draftLayer ? "Awaiting independent admin approval."
              : "No pending layer change."}
          </p>
          <p style={muted}>
            No real GeoServer publication, approved survey boundaries,
            GPS tracking, or production geographic data.
          </p>
        </section>
      </div>

      <footer style={{
        padding: "22px 5px", textAlign: "center",
        color: "#7C9185", fontSize: 11,
      }}>
        <AlertTriangle size={13} style={{ verticalAlign: "middle" }} />
        {" "}MCBP-MIS SS08 · Interactive conceptual GIS demonstration ·
        Synthetic geometry and reference indexes only
      </footer>
    </div>
  );
}
