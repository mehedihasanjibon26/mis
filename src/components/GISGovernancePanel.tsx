
"use client";
import { ui, digits } from "../lib/ui-l10n";

import { useState } from "react";
import {
  Activity, CheckCircle2, Download, Globe2,
  Layers3, LockKeyhole, MapPinned, RotateCcw,
  ShieldCheck, XCircle,
} from "lucide-react";

type Lang = "en" | "bn";
type Tab = "overview" | "catalogue" | "approval" | "audit";
type State = "production" | "candidate" | "rejected";
type Layer = {
  id: string;
  name: string;
  type: string;
  owner: string;
  version: string;
  level: string;
  tier: string;
  status: State;
};
type Request = {
  id: string;
  layerId: string;
  maker: string;
  checker: string;
  state: "draft" | "submitted" | "approved" | "rejected";
  geometryValid: boolean;
  totalsMatch: boolean;
  note: string;
};
type Event = {
  id: string;
  at: string;
  actor: string;
  description: string;
};

const KEY = "mcbp-d19-gis-v1";

const seedLayers: Layer[] = [
  { id: "GIS-01", name: "Administrative boundaries", type: "Polygon", owner: "GIS Cell", version: "2.4", level: "Union", tier: "Tier-2", status: "production" },
  { id: "GIS-02", name: "Beneficiary coverage", type: "Choropleth", owner: "M&E", version: "1.8", level: "Division", tier: "Tier-2", status: "production" },
  { id: "GIS-03", name: "Application density", type: "Heatmap", owner: "Operations", version: "1.5", level: "Upazila", tier: "Tier-2", status: "production" },
  { id: "GIS-04", name: "Payment bounce-back", type: "Choropleth", owner: "Finance", version: "1.3", level: "District", tier: "Tier-2", status: "production" },
  { id: "GIS-05", name: "Grievance density", type: "Heatmap", owner: "GRM Cell", version: "1.2", level: "Upazila", tier: "Tier-2", status: "production" },
  { id: "GIS-06", name: "Health facilities", type: "Point", owner: "Health Partners", version: "1.6", level: "Union", tier: "Public", status: "production" },
  { id: "GIS-07", name: "Field verification points", type: "Point", owner: "Field Operations", version: "1.4", level: "Union", tier: "Restricted", status: "production" },
  { id: "GIS-08", name: "Under-served areas", type: "Polygon", owner: "M&E", version: "1.1-candidate", level: "Union", tier: "Tier-2", status: "candidate" },
];

const seedRequest: Request = {
  id: "PROMO-D19-01",
  layerId: "GIS-08",
  maker: "",
  checker: "",
  state: "draft",
  geometryValid: true,
  totalsMatch: true,
  note: "Candidate layer for underserved area analysis",
};

type Saved = { layers: Layer[]; request: Request; events: Event[] };
const fresh = (): Saved => ({
  layers: seedLayers,
  request: seedRequest,
  events: [],
});

function loadSaved(): Saved {
  if (typeof window === "undefined") return fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Saved;
      if (
        Array.isArray(parsed.layers) &&
        parsed.request &&
        Array.isArray(parsed.events)
      ) return parsed;
    }
  } catch {
    // Fictional catalogue fallback.
  }
  return fresh();
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #dfeae3",
  borderRadius: 16,
  padding: 19,
};
const btn: React.CSSProperties = {
  border: "1px solid #d6e5db",
  color: "#14533b",
  background: "#fff",
  borderRadius: 9,
  padding: "10px 13px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};
const primary: React.CSSProperties = {
  ...btn,
  background: "#006a4e",
  color: "#fff",
  borderColor: "#006a4e",
};
const muted: React.CSSProperties = {
  color: "#728777",
  fontSize: 11,
  lineHeight: 1.7,
};

function exportEvents(events: Event[]) {
  const rows = [
    ["Timestamp", "Actor", "Action"],
    ...events.map((e) => [e.at, e.actor, e.description]),
  ];
  const csv = rows.map((row) =>
    row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(new Blob(
    ["\uFEFF", csv], { type: "text/csv;charset=utf-8" }
  ));
  const link = document.createElement("a");
  link.href = url;
  link.download = "MCBP-D19-GIS-Audit.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function GISGovernancePanel({
  lang = "en",
  roleId = "admin",
}: {
  lang?: Lang;
  roleId?: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Saved>(loadSaved);
  const [message, setMessage] = useState("");

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;
  const isMaker = roleId === "admin";
  const isChecker = roleId === "executive";
  const request = data.request;
  const candidate = data.layers.find((x) => x.id === request.layerId);
  const published = data.layers.filter((x) => x.status === "production");

  function save(
    updated: Saved,
    action: string
  ) {
    const next: Saved = {
      ...updated,
      events: [{
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        actor: roleId,
        description: action,
      }, ...data.events],
    };
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage(action);
  }

  function submit() {
    if (!isMaker || request.state !== "draft") return;
    if (!request.geometryValid || !request.totalsMatch) {
      setMessage("Geometry and aggregate reconciliation checks must both pass.");
      return;
    }
    save({
      ...data,
      request: { ...request, state: "submitted", maker: roleId },
    }, "GIS promotion request submitted for independent review.");
  }

  function decide(approve: boolean) {
    if (!isChecker || request.state !== "submitted") return;
    if (
      !request.geometryValid ||
      !request.totalsMatch ||
      request.maker === roleId
    ) {
      setMessage("Independent checker and passing validations required.");
      return;
    }
    const nextState = approve ? "production" : "rejected";
    save({
      ...data,
      request: {
        ...request,
        state: approve ? "approved" : "rejected",
        checker: roleId,
      },
      layers: data.layers.map((layer) =>
        layer.id === request.layerId
          ? { ...layer, status: nextState }
          : layer
      ),
    }, approve
      ? "Candidate approved for fictional production catalogue."
      : "Candidate promotion rejected in demo."
    );
  }

  function reset() {
    if (!isMaker) return;
    const next = fresh();
    setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setMessage("GIS governance demo reset.");
  }

  return (
    <div className="d19">
      <style>{`
        .d19{font-family:Arial,Helvetica,sans-serif;color:#193e2d;min-width:0}
        .d19-hero{background:linear-gradient(112deg,#063c32,#007154);
          border-radius:18px;padding:26px;color:#fff}
        .d19-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
          gap:12px;margin:15px 0}
        .d19-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
        .d19-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:15px}
        .d19-table{border-collapse:collapse;width:100%;font-size:12px}
        .d19-table td,.d19-table th{padding:12px 9px;border-bottom:1px solid #e7f0e9;text-align:left}
        .d19-table th{color:#718678;font-size:11px}
        .d19-row{display:flex;align-items:center;justify-content:space-between;
          gap:12px;border-bottom:1px solid #e8f0ea;padding:13px 0;font-size:12px}
        .d19-pill{display:inline-block;padding:6px 10px;border-radius:20px;
          background:#e6f5eb;color:#08754e;font-size:10px;font-weight:800}
        .d19-block{border-radius:12px;background:#f0f8f3;border:1px solid #d8e9dd;
          padding:16px;text-align:center}
        @media(max-width:960px){.d19-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.d19-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <section className="d19-hero">
        <div style={{ fontSize: 11, color: "#bee8d6", letterSpacing: 1.3 }}>
          PLATFORM OPERATIONS · D19
        </div>
        <h2 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "11px 0" }}>
          {t("GIS Layers & Spatial Governance", "জিআইএস লেয়ার ও স্থানিক গভর্নেন্স")}
        </h2>
        <p style={{ fontSize: 13, color: "#d3eee0", lineHeight: 1.7 }}>
          {t(
            "Manage spatial layer catalogues, validate geography and reconcile programme totals before governed promotion.",
            "স্থানিক লেয়ার, জ্যামিতিক যাচাই এবং তথ্যের সামঞ্জস্য পরীক্ষার মাধ্যমে প্রকাশ নিয়ন্ত্রণ করুন।"
          )}
        </p>
        <div style={{ fontSize: 10, color: "#bde7d5" }}>
          DEMO / SIMULATED GIS DATA · NOT A LIVE SPATIAL SERVER
        </div>
      </section>

      <div className="d19-stats">
        {([
          ["Production layers", String(14 + published.length - 7), Layers3, "14 reference baseline"],
          ["Tile response p95", "0.9s", Activity, "Budget 2 seconds"],
          ["Spatial exports", "42", Download, "Reference today"],
          ["Reconciliation", "0", ShieldCheck, "Reference difference"],
        ] as const).map(([label, value, Icon, detail]) => (
          <div style={card} key={label}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={muted}>{ui(lang, label)}</span>
              <Icon size={18} color="#007653" />
            </div>
            <div style={{ fontSize: 25, fontWeight: 850, margin: "12px 0 4px" }}>
              {value}
            </div>
            <div style={muted}>{ui(lang, detail)}</div>
          </div>
        ))}
      </div>

      <div className="d19-tabs">
        {([
          ["overview", "Coverage & Preview", "কভারেজ ও প্রিভিউ"],
          ["catalogue", "Layer Catalogue", "লেয়ার ক্যাটালগ"],
          ["approval", "Promotion Request", "অনুমোদনের অনুরোধ"],
          ["audit", "Audit & Controls", "অডিট ও নিয়ন্ত্রণ"],
        ] as const).map(([key, en, bn]) => (
          <button key={key} style={tab === key ? primary : btn}
            onClick={() => setTab(key)}>{t(en, bn)}</button>
        ))}
      </div>

      {message && (
        <div style={{ ...card, background: "#eaf6ee", marginBottom: 14, fontSize: 12 }}>
          {message}
          <button style={{ ...btn, float: "right", padding: "3px 8px" }}
            onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {tab === "overview" && (
        <div className="d19-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, marginTop: 0 }}>
              <MapPinned size={18} style={{ verticalAlign: "middle" }} />
              {" "}Spatial Coverage Preview
            </h3>
            <p style={muted}>
              Governance preview schematic only; open the existing GIS module
              for the detailed coverage visualisation.
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 9, marginTop: 18,
            }}>
              {[
                "Administrative boundaries",
                "Beneficiary density",
                "Application coverage",
                "Health facilities",
                "Grievance density",
                "Under-served areas",
              ].map((layer) => (
                <div className="d19-block" key={layer}>
                  <Globe2 size={22} color="#07845c" />
                  <div style={{
                    fontSize: 11, fontWeight: 700, marginTop: 10,
                  }}>{layer}</div>
                </div>
              ))}
            </div>
            <div style={{
              ...muted, background: "#f1f7f3",
              borderRadius: 10, padding: 13, marginTop: 18,
            }}>
              Division coverage percentages should reconcile to the existing
              GIS/dashboard seed. No independent percentage values are
              invented in this governance screen.
            </div>
          </section>
          <section style={card}>
            <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Spatial Governance Rules")}</h3>
            {[
              ["Geometry validation", "Required"],
              ["Aggregate reconciliation", "Difference must be zero"],
              ["Data tier enforcement", "Per-layer access control"],
              ["Lowest geographic level", "Governed by layer"],
              ["Continuous tracking", "Off / Not authorised"],
              ["Production promotion", "Independent checker"],
            ].map(([name, value]) => (
              <div className="d19-row" key={name}>
                <span>{ui(lang, name)}</span><b style={{ textAlign: "right" }}>{digits(lang, value)}</b>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "catalogue" && (
        <section style={card}>
          <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "GIS Layer Catalogue")}</h3>
          <p style={muted}>
            Eight illustrative entries from the larger 14-layer reference
            production catalogue.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="d19-table">
              <thead>
                <tr>
                  <th>{ui(lang, "Layer")}</th><th>{ui(lang, "Type")}</th><th>{ui(lang, "Owner")}</th>
                  <th>{ui(lang, "Version")}</th><th>{ui(lang, "Lowest level")}</th>
                  <th>{ui(lang, "Tier")}</th><th>{ui(lang, "Status")}</th>
                </tr>
              </thead>
              <tbody>
                {data.layers.map((layer) => (
                  <tr key={layer.id}>
                    <td><b>{layer.name}</b><div style={muted}>{layer.id}</div></td>
                    <td>{layer.type}</td>
                    <td>{layer.owner}</td>
                    <td>{layer.version}</td>
                    <td>{layer.level}</td>
                    <td>{layer.tier}</td>
                    <td><span className="d19-pill">{layer.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "approval" && (
        <div className="d19-grid">
          <section style={card}>
            <h3 style={{ fontSize: 16, marginTop: 0 }}>
              Candidate Layer Promotion
            </h3>
            <b style={{ fontSize: 15 }}>{candidate?.name}</b>
            <p style={muted}>
              {request.id} · {candidate?.version} · {request.state}
            </p>

            <div className="d19-row">
              <span>{ui(lang, "Geometry is valid")}</span>
              <input type="checkbox"
                checked={request.geometryValid}
                disabled={!isMaker || request.state !== "draft"}
                onChange={(e) => setData((old) => ({
                  ...old,
                  request: { ...old.request, geometryValid: e.target.checked },
                }))}
              />
            </div>
            <div className="d19-row">
              <span>{ui(lang, "Aggregation totals match (difference 0)")}</span>
              <input type="checkbox"
                checked={request.totalsMatch}
                disabled={!isMaker || request.state !== "draft"}
                onChange={(e) => setData((old) => ({
                  ...old,
                  request: { ...old.request, totalsMatch: e.target.checked },
                }))}
              />
            </div>

            <label style={{ ...muted, display: "block", marginTop: 17 }}>
              Promotion notes
              <textarea style={{
                display: "block", width: "100%", boxSizing: "border-box",
                border: "1px solid #d4e5d9", padding: 12,
                borderRadius: 9, minHeight: 90, marginTop: 7,
              }}
                value={request.note}
                disabled={!isMaker || request.state !== "draft"}
                onChange={(e) => setData((old) => ({
                  ...old,
                  request: { ...old.request, note: e.target.value },
                }))}
              />
            </label>

            <button style={{ ...primary, marginTop: 15 }}
              disabled={!isMaker || request.state !== "draft"}
              onClick={submit}>
              Submit for checker approval
            </button>
          </section>

          <section style={card}>
            <h3 style={{ fontSize: 16, marginTop: 0 }}>
              Independent Review
            </h3>
            {[
              ["Maker", request.maker || "Not submitted"],
              ["Checker", request.checker || "Pending"],
              ["Workflow status", request.state],
              ["Geometry", request.geometryValid ? "Pass (demo)" : "Fail"],
              ["Totals reconciliation", request.totalsMatch ? "Pass (demo)" : "Fail"],
              ["Production baseline", "14 layers"],
            ].map(([name, value]) => (
              <div key={name} className="d19-row">
                <span>{ui(lang, name)}</span><b>{digits(lang, value)}</b>
              </div>
            ))}

            <div style={{
              display: "flex", gap: 8,
              marginTop: 18, flexWrap: "wrap",
            }}>
              <button style={primary}
                disabled={!isChecker || request.state !== "submitted"}
                onClick={() => decide(true)}>
                <CheckCircle2 size={14} style={{ verticalAlign: "middle" }} />
                {" "}Approve to production
              </button>
              <button style={btn}
                disabled={!isChecker || request.state !== "submitted"}
                onClick={() => decide(false)}>
                <XCircle size={14} style={{ verticalAlign: "middle" }} />
                {" "}Reject
              </button>
            </div>
            <p style={{ ...muted, marginTop: 13 }}>
              Approval changes only the browser-local layer catalogue,
              not the existing GIS map or any GIS server.
            </p>
          </section>
        </div>
      )}

      {tab === "audit" && (
        <div className="d19-grid">
          <section style={card}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              gap: 10, flexWrap: "wrap",
            }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>{ui(lang, "Spatial Change Audit")}</h3>
              <button style={btn} onClick={() => exportEvents(data.events)}>
                <Download size={14} style={{ verticalAlign: "middle" }} />
                {" "}Export CSV
              </button>
            </div>
            {!data.events.length && (
              <p style={muted}>{ui(lang, "Submit a layer to generate demo audit events.")}</p>
            )}
            {data.events.map((event) => (
              <div className="d19-row" key={event.id}>
                <div>
                  <b>{event.description}</b>
                  <div style={muted}>
                    {event.actor} · {new Date(event.at).toLocaleString()}
                  </div>
                </div>
                <ShieldCheck size={16} color="#078153" />
              </div>
            ))}
          </section>
          <section style={card}>
            <h3 style={{ fontSize: 16, marginTop: 0 }}>{ui(lang, "Access & Safety")}</h3>
            {[
              "No continuous location tracking",
              "No individual beneficiary location exposure",
              "Aggregate datasets only in governance previews",
              "Checker required for layer promotion",
              "No production geoserver connection",
            ].map((item) => (
              <div className="d19-row" key={item}>
                <LockKeyhole size={15} color="#087553" />
                <span style={{ flex: 1 }}>{item}</span>
              </div>
            ))}
            <button style={{ ...btn, marginTop: 17 }}
              disabled={!isMaker} onClick={reset}>
              <RotateCcw size={14} style={{ verticalAlign: "middle" }} />
              {" "}Reset demo
            </button>
          </section>
        </div>
      )}

      <footer style={{ ...muted, textAlign: "center", marginTop: 21 }}>
        <ShieldCheck size={13} style={{ verticalAlign: "middle" }} />
        {" "}D19 · Fictional layer management and promotion workflow
      </footer>
    </div>
  );
}
