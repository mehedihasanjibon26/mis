
"use client";
import { ui } from "../lib/ui-l10n";

import { useState, type ReactNode } from "react";
import {
  Activity, Database, FileUp, Network, RefreshCw,
  Search, WifiOff, Download, AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  useDataHubStore,
  type PartnerId,
  type Scenario,
  type Partner,
} from "../lib/datahub-store";
import { useDemoStore } from "../lib/demo-store";

type Tab =
  | "monitor" | "catalogue" | "sandbox"
  | "queues" | "xroad" | "bulk" | "audit";

type Props = {
  lang: "en" | "bn";
  roleId: string;
};

const tabs: Tab[] = [
  "monitor", "catalogue", "sandbox",
  "queues", "xroad", "bulk", "audit",
];

const labels: Record<Tab, [string, string]> = {
  monitor: ["Integration monitor", "ইন্টিগ্রেশন মনিটর"],
  catalogue: ["API catalogue", "এপিআই ক্যাটালগ"],
  sandbox: ["API sandbox", "এপিআই স্যান্ডবক্স"],
  queues: ["Retry & DLQ", "রিট্রাই ও ডিএলকিউ"],
  xroad: ["X-Road / Consumers", "এক্স-রোড / কনজিউমার"],
  bulk: ["Bulk exchange", "বাল্ক এক্সচেঞ্জ"],
  audit: ["Logs & evidence", "লগ ও প্রমাণ"],
};

const scenarios: Scenario[] = [
  "success", "timeout", "unauthorized",
  "rate_limit", "unavailable",
];

const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #ccd9d2",
  borderRadius: 9,
  background: "#fff",
  color: "#163b30",
  maxWidth: "100%",
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #dce8e1",
  borderRadius: 14,
  padding: 19,
  boxShadow: "0 3px 12px rgba(10,60,40,.04)",
};

const button: React.CSSProperties = {
  ...input,
  cursor: "pointer",
  fontWeight: 650,
  fontSize: 12,
};

const primary: React.CSSProperties = {
  ...button,
  background: "#006a4e",
  color: "#fff",
  borderColor: "#006a4e",
};

const th: React.CSSProperties = {
  padding: 10,
  fontSize: 11,
  textAlign: "left",
  borderBottom: "1px solid #e3ece8",
  color: "#53665d",
};

const td: React.CSSProperties = {
  padding: 10,
  fontSize: 12,
  borderBottom: "1px solid #f0f4f2",
  verticalAlign: "top",
};

const sampleCsv =
  "beneficiary_id,action,reference\n" +
  "BEN-2605-00113,verify,SAMPLE-01\n" +
  "BEN-2603-00138,verify,SAMPLE-02";

function statusColor(value: string) {
  if (
    ["healthy", "resolved", "200 OK", "submitted"].includes(value)
  ) return "#087b52";

  if (
    ["outage", "dead_letter", "503 PARTNER_UNAVAILABLE"].includes(value)
  ) return "#be275a";

  return "#a77213";
}

function download(name: string, content: string) {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\r\n");
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th style={th} key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((value, cellIndex) => (
                <td key={cellIndex} style={td}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return (
    <span
      style={{
        color: statusColor(value),
        background: "#f3f7f5",
        borderRadius: 50,
        padding: "5px 9px",
        fontWeight: 700,
        fontSize: 11,
      }}
    >
      {value}
    </span>
  );
}

export default function DataHubPanel({ lang, roleId }: Props) {
  const partners = useDataHubStore((s) => s.partners);
  const messages = useDataHubStore((s) => s.messages);
  const queue = useDataHubStore((s) => s.queue);
  const events = useDataHubStore((s) => s.events);
  const batches = useDataHubStore((s) => s.batches);
  const consumers = useDataHubStore((s) => s.consumers);
  const lastSimulation = useDataHubStore((s) => s.lastSimulation);
  const signals = useDataHubStore((s) => s.applicationSignals);

  const simulate = useDataHubStore((s) => s.simulate);
  const retry = useDataHubStore((s) => s.retry);
  const recover = useDataHubStore((s) => s.recover);
  const registerConsumer = useDataHubStore((s) => s.registerConsumer);
  const submitBatch = useDataHubStore((s) => s.submitBatch);
  const approveBatch = useDataHubStore((s) => s.approveBatch);

  const applications = useDemoStore((s) => s.applications);

  const [tab, setTab] = useState<Tab>("monitor");
  const [partnerId, setPartnerId] = useState<PartnerId>("BDRIS");
  const [scenario, setScenario] = useState<Scenario>("success");
  const [applicationId, setApplicationId] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [consumerName, setConsumerName] = useState("New pilot consumer");
  const [scope, setScope] = useState("identity.verify");
  const [fileName, setFileName] = useState("sample-exchange.csv");
  const [csv, setCsv] = useState(sampleCsv);
  const [details, setDetails] = useState<PartnerId | null>(null);

  const t = (en: string, bn: string) =>
    lang === "bn" ? bn : en;

  const authorized = [
    "admin", "integration", "executive", "uwao",
  ].includes(roleId);

  const selected =
    partners.find((p) => p.id === partnerId) ?? partners[0];

  const healthy = partners.filter(
    (p) => p.status === "healthy"
  ).length;

  const failed = partners.filter(
    (p) => p.status === "outage"
  ).length;

  const pending = queue.filter(
    (q) => q.state !== "resolved"
  ).length;

  const totalCalls = partners.reduce(
    (sum, p) => sum + p.calls,
    0
  );

  const shown = partners.filter((p) =>
    `${p.name} ${p.purpose} ${p.id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function notice(result: { ok: boolean; message: string }) {
    setError(!result.ok);
    setMessage(result.message);
  }

  function enter(next: Tab) {
    setTab(next);
    setDetails(null);
    setMessage("");
  }

  function run() {
    const result = simulate(
      partnerId,
      scenario,
      roleId,
      applicationId || undefined
    );

    notice(result);

    if (
      result.ok &&
      partnerId === "BDRIS" &&
      ["timeout", "unavailable"].includes(scenario) &&
      applicationId
    ) {
      useDemoStore.setState((state) => ({
        applications: state.applications.map((application) =>
          application.id === applicationId &&
          ["submitted", "identity_pending"].includes(
            application.status
          )
            ? {
                ...application,
                status: "identity_pending" as const,
                updatedAt: new Date().toISOString(),
              }
            : application
        ),
      }));
    }
  }

  const summary = [
    ["Connected adapters", partners.length, Database],
    ["Healthy partners", healthy, CheckCircle2],
    ["Partner outages", failed, AlertTriangle],
    ["Open retry items", pending, RefreshCw],
    ["Reference API calls", totalCalls, Activity],
  ] as const;

  return (
    <div style={{ display: "grid", gap: 15, color: "#173d31" }}>
      <section
        style={{
          ...card,
          background: "linear-gradient(120deg,#064735,#006a4e)",
          color: "#fff",
          padding: 25,
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <Network size={28} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, margin: 0 }}>
              {t(
                "Secure Data Hub / API Bank",
                "সিকিউর ডেটা হাব / এপিআই ব্যাংক"
              )}
            </h2>
            <p style={{
              margin: "6px 0 0",
              color: "#e0f3e9",
              fontSize: 12,
            }}>
              {t(
                "Partner adapters · API lifecycle · retry orchestration · X-Road patterns",
                "পার্টনার এডাপ্টার · এপিআই লাইফসাইকেল · রিট্রাই · এক্স-রোড"
              )}
            </p>
          </div>
          <span style={{
            border: "1px solid #79baa2",
            borderRadius: 20,
            padding: "7px 11px",
            fontSize: 11,
          }}>
            SIMULATION ONLY · NO LIVE INTEGRATIONS
          </span>
        </div>
      </section>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 12,
      }}>
        {summary.map(([label, value, Icon]) => (
          <div style={card} key={label}>
            <Icon size={18} color="#006a4e" />
            <div style={{
              fontSize: 11,
              color: "#71847a",
              margin: "9px 0 3px",
            }}>
              {label}
            </div>
            <strong style={{ fontSize: 25 }}>
              {value.toLocaleString()}
            </strong>
            <div style={{ fontSize: 10, color: "#82968b" }}>
              Fictional / locally simulated
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {tabs.map((item) => (
          <button
            key={item}
            style={tab === item ? primary : button}
            onClick={() => enter(item)}
          >
            {t(...labels[item])}
          </button>
        ))}
      </div>

      {message && (
        <div
          role={error ? "alert" : "status"}
          style={{
            ...card,
            background: error ? "#fff0f4" : "#e8f5ee",
            color: error ? "#a0204b" : "#075d41",
          }}
        >
          {message}
        </div>
      )}

      {tab === "monitor" && (
        <div style={{ display: "grid", gap: 15 }}>
          <section style={card}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 9,
            }}>
              <h3>{t(
                "Partner availability & latency",
                "পার্টনারের অবস্থা ও লেটেন্সি"
              )}</h3>
              <Badge value={`${healthy}/${partners.length} healthy`} />
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {partners.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(145px,1.4fr) minmax(65px,1fr) 65px 75px",
                    gap: 9,
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <div>
                    <b>{p.name}</b>
                    <div style={{ color: "#73877b", fontSize: 10 }}>
                      {p.purpose}
                    </div>
                  </div>
                  <div style={{
                    background: "#e5ede8",
                    height: 9,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${Math.max(6, 100 - p.latency / 10)}%`,
                      height: "100%",
                      background:
                        p.status === "outage"
                          ? "#c02059"
                          : "#067858",
                    }} />
                  </div>
                  <div>{p.latency} ms</div>
                  <Badge value={p.status} />
                </div>
              ))}
            </div>
          </section>

          <section style={card}>
            <h3>{t(
              "Gateway traffic and exceptions",
              "গেটওয়ে ট্রাফিক ও ব্যতিক্রম"
            )}</h3>
            <div style={{
              display: "flex",
              gap: 10,
              alignItems: "end",
              height: 135,
              marginTop: 15,
            }}>
              {[36, 54, 48, 67, 71, 63, 85, 77, 93, 69, 81, 74]
                .map((height, index) => (
                  <div
                    key={index}
                    title={`T${index + 1} · illustrative`}
                    style={{
                      flex: 1,
                      background:
                        index % 3 === 0
                          ? "#bf2265"
                          : "#0b8262",
                      height: `${height}%`,
                      borderRadius: "5px 5px 0 0",
                    }}
                  />
                ))}
            </div>
            <p style={{ fontSize: 11, color: "#82968b" }}>
              Illustrative historical traffic. Live demo events:
              {" "}{messages.length}.
            </p>
          </section>
        </div>
      )}

      {tab === "catalogue" && (
        <section style={card}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}>
            <h3>{t("API Bank catalogue", "এপিআই ব্যাংক ক্যাটালগ")}</h3>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{
                position: "absolute",
                top: 12,
                left: 10,
              }} />
              <input
                style={{ ...input, paddingLeft: 31 }}
                placeholder="Search APIs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <DataTable
            headers={[
              "Partner / API",
              "Protocol",
              "Lifecycle",
              "Security",
              "Details",
            ]}
            rows={shown.map((p) => [
              <>
                <b>{p.name}</b>
                <div>{p.purpose}</div>
              </>,
              `${p.method} · ${p.format}`,
              <Badge value="Published (demo)" />,
              p.auth,
              <button
                style={button}
                onClick={() =>
                  setDetails(details === p.id ? null : p.id)
                }
              >
                {t("Inspect", "বিস্তারিত")}
              </button>,
            ])}
          />

          {details && (() => {
            const p = partners.find(
              (item) => item.id === details
            ) as Partner;

            const contract = {
              openapi: "3.0.3",
              info: { title: p.name, version: p.version },
              paths: {
                [p.path]: {
                  [p.method.toLowerCase()]: {
                    summary: p.purpose,
                    responses: {
                      "200": {
                        description: "Mock success",
                      },
                    },
                  },
                },
              },
            };

            return (
              <div style={{
                ...card,
                marginTop: 15,
                background: "#f6faf7",
              }}>
                <h4>{p.name} · {p.path}</h4>
                <p style={{ fontSize: 12 }}>
                  Owner: {p.owner} · Version: {p.version}
                  {" "}· Limit: {p.rate} req/min
                </p>
                <p style={{ fontSize: 12 }}>
                  {p.method} · {p.format} · {p.auth}
                </p>
                <pre style={{
                  overflowX: "auto",
                  background: "#102f26",
                  color: "#daf8e9",
                  padding: 14,
                  borderRadius: 9,
                  fontSize: 11,
                }}>
                  {JSON.stringify(contract, null, 2)}
                </pre>
                <button
                  style={primary}
                  onClick={() => {
                    setPartnerId(p.id);
                    enter("sandbox");
                  }}
                >
                  {t("Test in sandbox", "স্যান্ডবক্সে পরীক্ষা")}
                </button>
              </div>
            );
          })()}
        </section>
      )}

      {tab === "sandbox" && (
        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,1fr))",
          gap: 15,
        }}>
          <section style={card}>
            <h3>{t(
              "Sandbox request builder",
              "স্যান্ডবক্স রিকোয়েস্ট"
            )}</h3>
            <p style={{ fontSize: 11, color: "#667d70" }}>
              No live connections · fictional identifiers only
            </p>

            <label style={{
              display: "grid",
              gap: 5,
              fontSize: 12,
            }}>
              API Partner
              <select
                style={input}
                value={partnerId}
                onChange={(e) =>
                  setPartnerId(e.target.value as PartnerId)
                }
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{
              display: "grid",
              gap: 5,
              fontSize: 12,
              marginTop: 12,
            }}>
              Test scenario
              <select
                style={input}
                value={scenario}
                onChange={(e) =>
                  setScenario(e.target.value as Scenario)
                }
              >
                {scenarios.map((item) => (
                  <option value={item} key={item}>
                    {item.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            {partnerId === "BDRIS" && (
              <label style={{
                display: "grid",
                gap: 5,
                fontSize: 12,
                marginTop: 12,
              }}>
                Affected application (optional)
                <select
                  style={input}
                  value={applicationId}
                  onChange={(e) =>
                    setApplicationId(e.target.value)
                  }
                >
                  <option value="">{ui(lang, "No application linked")}</option>
                  {applications
                    .filter((a) =>
                      ["submitted", "identity_pending"].includes(
                        a.status
                      )
                    )
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} · {a.nameEn}
                      </option>
                    ))}
                </select>
              </label>
            )}

            <pre style={{
              fontSize: 11,
              whiteSpace: "pre-wrap",
              background: "#f4f7f5",
              padding: 13,
              borderRadius: 8,
            }}>
              {`Mock ${selected.method} ${selected.path}
Authorization: simulated OAuth2/mTLS
Content-Type: ${
  selected.format === "JSON"
    ? "application/json"
    : "application/xml"
}`}
            </pre>

            <button
              style={{
                ...primary,
                opacity: authorized ? 1 : 0.5,
              }}
              disabled={!authorized}
              onClick={run}
            >
              Run mock request
            </button>
          </section>

          <section style={card}>
            <h3>{ui(lang, "Response & correlation")}</h3>
            {lastSimulation ? (
              <>
                <div style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}>
                  <Badge value={lastSimulation.outcome} />
                  <span>{lastSimulation.latency} ms</span>
                </div>
                <p style={{ fontSize: 11 }}>
                  Correlation ID: {lastSimulation.correlation}
                </p>
                <pre style={{
                  background: "#102f26",
                  color: "#d3f7e6",
                  padding: 14,
                  borderRadius: 10,
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                }}>
                  {lastSimulation.body}
                </pre>
              </>
            ) : (
              <p style={{ fontSize: 12, color: "#73877b" }}>
                Choose a scenario and run a fictional request.
              </p>
            )}

            {Object.keys(signals).length > 0 && (
              <div style={{
                background: "#fff2f6",
                padding: 11,
                borderRadius: 9,
                fontSize: 11,
              }}>
                <b>{ui(lang, "Identity verification pending signals")}</b>
                {Object.keys(signals).map((application) => (
                  <div key={application}>
                    {application}: {signals[application]}
                  </div>
                ))}
                <p>
                  BDRIS timeout/outage creates a simulated
                  application verification pending state.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "queues" && (
        <section style={card}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 9,
          }}>
            <h3>{t(
              "Retry, dead-letter & fallback queue",
              "রিট্রাই, ডেড-লেটার ও ফলব্যাক"
            )}</h3>
            <Badge value={`${pending} open`} />
          </div>
          <p style={{ fontSize: 11, color: "#708578" }}>
            Retry attempts 1/2/3. Recover partner and replay.
            Three failed attempts move the item to DLQ.
          </p>

          <DataTable
            headers={[
              "Queue / partner",
              "Attempts",
              "State",
              "Application",
              "Actions",
            ]}
            rows={queue.map((q) => [
              <>
                <b>{q.id}</b>
                <div>{q.partner} · {q.reason}</div>
              </>,
              `${q.tries}/3`,
              <Badge value={q.state} />,
              q.applicationId || "—",
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}>
                <button
                  style={button}
                  disabled={
                    !authorized || q.state === "resolved"
                  }
                  onClick={() =>
                    notice(retry(q.id, roleId))
                  }
                >
                  <RefreshCw size={13} /> Replay
                </button>
                <button
                  style={button}
                  disabled={!authorized}
                  onClick={() =>
                    notice(recover(q.partner, roleId))
                  }
                >
                  <WifiOff size={13} /> Toggle partner
                </button>
              </div>,
            ])}
          />
          {!queue.length && (
            <p style={{ fontSize: 12 }}>
              No queue items yet. Simulate a BDRIS timeout.
            </p>
          )}
        </section>
      )}

      {tab === "xroad" && (
        <div style={{ display: "grid", gap: 15 }}>
          <section style={card}>
            <h3>{ui(lang, "X-Road compatible exchange (visual only)")}</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: 12,
            }}>
              {[
                "MCBP / MoWCA subsystem",
                "Mock security server",
                "Partner member/service",
                "Response + audit",
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    padding: 17,
                    background:
                      index % 2
                        ? "#eaf5ef"
                        : "#f3f7f5",
                    borderRadius: 11,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {index + 1}. {item}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11 }}>
              No real security server, certificates or
              exchange connections are active.
            </p>
          </section>

          <section style={card}>
            <h3>{t(
              "Consumer onboarding",
              "কনজিউমার অনবোর্ডিং"
            )}</h3>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 9,
              marginBottom: 13,
            }}>
              <input
                style={input}
                value={consumerName}
                onChange={(e) =>
                  setConsumerName(e.target.value)
                }
                placeholder="Consumer name"
              />
              <input
                style={input}
                value={scope}
                onChange={(e) =>
                  setScope(e.target.value)
                }
                placeholder="Purpose-bound scope"
              />
              <button
                style={primary}
                disabled={!authorized}
                onClick={() =>
                  notice(
                    registerConsumer(
                      consumerName,
                      partnerId,
                      scope,
                      roleId
                    )
                  )
                }
              >
                Register sandbox consumer
              </button>
            </div>

            <DataTable
              headers={[
                "Consumer",
                "Member / service",
                "Scope",
                "Onboarding",
              ]}
              rows={consumers.map((c) => [
                c.name,
                c.partner,
                c.scope,
                <Badge value={c.status} />,
              ])}
            />
          </section>
        </div>
      )}

      {tab === "bulk" && (
        <section style={card}>
          <h3>
            <FileUp size={19} /> {t(
              "Governed bulk exchange",
              "নিয়ন্ত্রিত বাল্ক এক্সচেঞ্জ"
            )}
          </h3>
          <p style={{ fontSize: 11 }}>
            Mock CSV template · validation · admin approval
            · no database writes or external transfer
          </p>

          <div style={{
            display: "flex",
            gap: 9,
            flexWrap: "wrap",
            alignItems: "center",
          }}>
            <button
              style={button}
              onClick={() =>
                download("mcbp-bulk-template-v1.csv", sampleCsv)
              }
            >
              <Download size={14} /> Download CSV template
            </button>
            <label style={{ fontSize: 12 }}>
              CSV file{" "}
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileName(file.name);
                    setCsv(await file.text());
                  }
                }}
              />
            </label>
          </div>

          <textarea
            style={{
              ...input,
              width: "100%",
              minHeight: 125,
              marginTop: 12,
              fontFamily: "monospace",
              fontSize: 12,
            }}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />

          <div style={{ marginTop: 12 }}>
            <button
              style={primary}
              disabled={!authorized}
              onClick={() =>
                notice(submitBatch(fileName, csv, roleId))
              }
            >
              Validate batch
            </button>
          </div>

          <DataTable
            headers={[
              "Batch",
              "Validation",
              "Errors",
              "State",
              "Approval",
            ]}
            rows={batches.map((batch) => [
              batch.filename,
              `${batch.valid}/${batch.rows} valid`,
              batch.errors.length
                ? batch.errors.join("; ")
                : "None",
              <Badge value={batch.status} />,
              <button
                style={button}
                disabled={
                  roleId !== "admin" ||
                  batch.status !== "validated"
                }
                onClick={() =>
                  notice(approveBatch(batch.id, roleId))
                }
              >
                Admin approve
              </button>,
            ])}
          />
        </section>
      )}

      {tab === "audit" && (
        <div style={{ display: "grid", gap: 15 }}>
          <section style={card}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}>
              <h3>{t(
                "Message & activity log",
                "মেসেজ ও কার্যক্রম লগ"
              )}</h3>
              <button
                style={button}
                onClick={() =>
                  download(
                    "data-hub-audit.csv",
                    formatCsv([
                      [
                        "time", "action", "actor",
                        "description",
                      ],
                      ...events.map((e) => [
                        e.time,
                        e.action,
                        e.actor,
                        e.description,
                      ]),
                    ])
                  )
                }
              >
                <Download size={15} /> Export CSV
              </button>
            </div>

            <DataTable
              headers={[
                "Timestamp",
                "Action",
                "Actor",
                "Description",
              ]}
              rows={events.map((e) => [
                new Date(e.time).toLocaleString(),
                e.action,
                e.actor,
                e.description,
              ])}
            />

            {!events.length && (
              <p style={{ fontSize: 12 }}>
                No new events. Run a sandbox request.
              </p>
            )}
          </section>

          <section style={card}>
            <h3>{t(
              "Joint test / owner register (mock)",
              "যৌথ পরীক্ষা ও মালিক রেজিস্টার"
            )}</h3>

            <DataTable
              headers={[
                "Partner",
                "Service owner",
                "Test cycles",
                "Evidence status",
              ]}
              rows={partners.map((p) => [
                p.id,
                p.owner,
                "Cycle 1 / 2 pending",
                <Badge value="Not signed" />,
              ])}
            />

            <p style={{ fontSize: 11 }}>
              No signed integration approvals,
              production MoUs or real certifications.
            </p>
          </section>
        </div>
      )}

      <div style={{
        fontSize: 11,
        color: "#819488",
        padding: 6,
      }}>
        MCBP-MIS SS06 · Fictional API operations.
        No live government data, financial transfers,
        or X-Road security server.
      </div>
    </div>
  );
}
