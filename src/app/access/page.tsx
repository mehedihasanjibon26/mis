
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Download, Fingerprint, KeyRound,
  LockKeyhole, Plus, Search, ShieldAlert, ShieldCheck,
  UserRound, Users, XCircle, Activity, RefreshCw,
  MapPin, FileClock, Eye, Smartphone,
} from "lucide-react";

type Status = "active" | "suspended" | "locked" | "expired";
type Tab = "users" | "permissions" | "security" | "audit";
type Role = "admin" | "executive" | "uwao" | "union_maker" |
  "field" | "trainer" | "finance" | "finance_checker" | "grm";

type DemoUser = {
  id: string;
  name: string;
  role: Role;
  area: string;
  status: Status;
  device: string;
  expires: string;
};

type Event = {
  id: string;
  time: string;
  actor: string;
  action: string;
  detail: string;
};

const roleNames: Record<Role, string> = {
  admin: "System Administrator",
  executive: "Programme Executive / PD",
  uwao: "Upazila Women Affairs Officer",
  union_maker: "Union Application Maker",
  field: "Field Verifier",
  trainer: "Community Trainer",
  finance: "Finance Maker",
  finance_checker: "Finance Checker",
  grm: "Grievance Officer",
};

const roles = Object.keys(roleNames) as Role[];

const initialUsers: DemoUser[] = [
  {
    id: "USR-1001", name: "N. Sultana", role: "uwao",
    area: "Kaunia", status: "active",
    device: "OFFICE-KAUNIA-01", expires: "2027-12-31",
  },
  {
    id: "USR-1002", name: "Union Maker A", role: "union_maker",
    area: "Kaunia Sadar", status: "active",
    device: "UDC-004", expires: "2027-12-31",
  },
  {
    id: "USR-1003", name: "Field Officer B", role: "field",
    area: "Haragach", status: "active",
    device: "FIELD-2026-08", expires: "2027-12-31",
  },
  {
    id: "USR-1004", name: "Finance Maker C", role: "finance",
    area: "National", status: "active",
    device: "FIN-OFFICE-02", expires: "2027-12-31",
  },
  {
    id: "USR-1005", name: "Finance Checker D", role: "finance_checker",
    area: "National", status: "active",
    device: "FIN-OFFICE-03", expires: "2027-12-31",
  },
  {
    id: "USR-1006", name: "Programme Executive E", role: "executive",
    area: "National", status: "active",
    device: "HQ-EXEC-01", expires: "2027-12-31",
  },
  {
    id: "USR-1007", name: "Admin F", role: "admin",
    area: "National", status: "active",
    device: "HQ-ADMIN-01", expires: "2027-12-31",
  },
  {
    id: "USR-1008", name: "Former Contractor G", role: "field",
    area: "Balarhat", status: "expired",
    device: "FIELD-OLD-01", expires: "2026-10-31",
  },
];

const permissions: {
  label: string;
  allowed: Role[];
}[] = [
  {
    label: "Create applications",
    allowed: ["union_maker", "uwao", "admin"],
  },
  {
    label: "Field verification",
    allowed: ["field", "uwao", "admin"],
  },
  {
    label: "Review eligibility",
    allowed: ["uwao", "admin"],
  },
  {
    label: "Prepare payroll",
    allowed: ["finance"],
  },
  {
    label: "Check payroll",
    allowed: ["finance_checker"],
  },
  {
    label: "Manage training",
    allowed: ["trainer", "uwao", "admin"],
  },
  {
    label: "Handle grievances",
    allowed: ["grm", "uwao"],
  },
  {
    label: "View national reports",
    allowed: ["executive", "admin"],
  },
  {
    label: "Manage user accounts",
    allowed: ["admin"],
  },
];

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E0E9E3",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 5px 20px rgba(8,65,41,.035)",
};

const btn: React.CSSProperties = {
  border: "1px solid #DBE6DF",
  borderRadius: 9,
  padding: "10px 12px",
  background: "#fff",
  color: "#14503B",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};

const primary: React.CSSProperties = {
  ...btn,
  background: "#006A4E",
  color: "#fff",
  borderColor: "#006A4E",
};

const input: React.CSSProperties = {
  ...btn,
  fontWeight: 400,
  cursor: "text",
  minWidth: 0,
};

const time = () => new Date().toISOString();

function exportCsv(rows: string[][]) {
  const csv = rows.map((r) =>
    r.map((x) => `"${x.replaceAll('"', '""')}"`).join(",")
  ).join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "MCBP-access-audit-demo.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AccessPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [actor, setActor] = useState<Role>("admin");
  const [users, setUsers] = useState<DemoUser[]>(initialUsers);
  const [events, setEvents] = useState<Event[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("USR-1002");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>("field");
  const [newArea, setNewArea] = useState("Kaunia");
  const [newDevice, setNewDevice] = useState("DEMO-DEVICE-01");
  const [newExpiry, setNewExpiry] = useState("2027-12-31");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [securityCount, setSecurityCount] = useState(2);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("mcbp-lang");
      const savedRole = localStorage.getItem("mcbp-role");
      const savedUsers = localStorage.getItem("mcbp-access-users");
      const savedEvents = localStorage.getItem("mcbp-access-events");

      if (savedLang === "bn") setLang("bn");
      if (savedRole && roles.includes(savedRole as Role)) {
        setActor(savedRole as Role);
      }
      if (savedUsers) {
        const data: unknown = JSON.parse(savedUsers);
        if (Array.isArray(data)) setUsers(data as DemoUser[]);
      }
      if (savedEvents) {
        const data: unknown = JSON.parse(savedEvents);
        if (Array.isArray(data)) setEvents(data as Event[]);
      }
    } catch {
      // Initialize fictional records on empty storage.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("mcbp-access-users", JSON.stringify(users));
    localStorage.setItem("mcbp-access-events", JSON.stringify(events));
  }, [users, events, loaded]);

  const administrator = actor === "admin";

  function audit(action: string, detail: string) {
    setEvents((items) => [
      {
        id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: time(),
        actor: roleNames[actor],
        action,
        detail,
      },
      ...items,
    ]);
  }

  function permitted() {
    if (!administrator) {
      setMessage("Access denied: System Administrator role required.");
      return false;
    }
    if (otp !== "123456") {
      setMessage("Demo MFA required: enter 123456 in the confirmation field.");
      return false;
    }
    return true;
  }

  function createUser() {
    if (!permitted()) return;
    if (newName.trim().length < 3) {
      setMessage("Enter a user name of at least three characters.");
      return;
    }
    if (newArea.trim().length < 2) {
      setMessage("Enter a geographic jurisdiction.");
      return;
    }

    const item: DemoUser = {
      id: `USR-${Date.now().toString().slice(-7)}`,
      name: newName.trim(),
      role: newRole,
      area: newArea.trim(),
      device: newDevice.trim() || "Unassigned",
      expires: newExpiry,
      status: "active",
    };

    setUsers((items) => [item, ...items]);
    audit("CREATE_USER", `${item.id}: ${item.name} · ${item.area}`);
    setNewName("");
    setMessage("Demo user created with selected role and jurisdiction.");
  }

  function updateAccount(status: Status) {
    if (!permitted()) return;

    const user = users.find((item) => item.id === selected);
    if (!user) return;

    if (user.role === "admin" && user.id === "USR-1007") {
      setMessage("Demo safeguard: primary administrator cannot be disabled.");
      return;
    }

    setUsers((items) => items.map((u) =>
      u.id === selected ? { ...u, status } : u
    ));

    audit("ACCOUNT_STATUS", `${selected}: ${user.status} → ${status}`);
    setMessage(`${user.name}: account is now ${status}.`);
  }

  function updateAssignment() {
    if (!permitted()) return;
    const user = users.find((u) => u.id === selected);
    if (!user) return;

    if (user.id === "USR-1007") {
      setMessage("Demo safeguard: primary admin assignment is fixed.");
      return;
    }

    if (newArea.trim().length < 2) {
      setMessage("Enter a jurisdiction.");
      return;
    }

    setUsers((items) => items.map((u) =>
      u.id === selected
        ? {
            ...u,
            role: newRole,
            area: newArea.trim(),
            device: newDevice.trim() || "Unassigned",
            expires: newExpiry,
          }
        : u
    ));

    audit(
      "UPDATE_ASSIGNMENT",
      `${selected}: ${newRole} · ${newArea} · ${newDevice}`
    );
    setMessage("User role, jurisdiction and device updated (demo).");
  }

  function selectUser(user: DemoUser) {
    setSelected(user.id);
    setNewRole(user.role);
    setNewArea(user.area);
    setNewDevice(user.device);
    setNewExpiry(user.expires);
  }

  function simulateSecurity() {
    setSecurityCount((n) => n + 1);
    audit(
      "SECURITY_ALERT",
      "Simulated unusual login / bulk download signal"
    );
    setMessage("New security alert added to the fictional audit log.");
  }

  const chosen = users.find((u) => u.id === selected);
  const filtered = users.filter((u) =>
    `${u.name} ${u.id} ${u.area} ${u.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const active = users.filter((u) => u.status === "active").length;
  const suspended = users.filter((u) => u.status !== "active").length;
  const privileged = users.filter((u) =>
    ["admin", "executive", "finance_checker", "uwao"]
      .includes(u.role)
  ).length;

  return (
    <div className="access-page">
      <style>{`
        .access-page{min-height:100vh;background:#F4F7F5;color:#173B2D;
          font-family:Arial,Helvetica,sans-serif;padding:24px clamp(14px,3vw,48px)}
        .access-top{display:flex;align-items:center;justify-content:space-between;
          gap:12px;flex-wrap:wrap;margin-bottom:20px}
        .access-hero{background:linear-gradient(110deg,#043D30,#006A4E);
          color:white;padding:27px;border-radius:20px;margin-bottom:16px}
        .access-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
          gap:12px;margin-bottom:16px}
        .access-grid{display:grid;grid-template-columns:1.55fr 1fr;gap:15px}
        .access-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0}
        .access-table{width:100%;border-collapse:collapse;font-size:12px}
        .access-table th{text-align:left;font-size:11px;color:#708779;
          padding:12px 9px;border-bottom:1px solid #E7EFE9}
        .access-table td{padding:12px 9px;border-bottom:1px solid #EDF3EE}
        .access-table tr{cursor:pointer}
        .access-table tbody tr:hover{background:#F3F9F5}
        .access-label{color:#71877A;font-size:11px;line-height:1.5}
        .access-field{display:grid;gap:6px;font-size:11px;color:#687E72}
        .access-pill{padding:5px 9px;border-radius:30px;
          background:#EAF4EE;color:#08704D;font-size:10px;font-weight:800}
        .access-actions{display:flex;flex-wrap:wrap;gap:7px}
        .access-number{font-size:28px;font-weight:850;margin-top:12px}
        @media(max-width:930px){.access-grid{grid-template-columns:1fr}}
        @media(max-width:680px){.access-stats{grid-template-columns:repeat(2,1fr)}
          .access-page{padding:12px}}
      `}</style>

      <header className="access-top">
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            padding: 11, borderRadius: 12,
            background: "#006A4E", color: "white",
          }}>
            <ShieldCheck size={23} />
          </div>
          <div>
            <b style={{ fontSize: 18 }}>MCBP-MIS</b>
            <div className="access-label">
              {t("IDENTITY & ACCESS MANAGEMENT", "পরিচয় ও প্রবেশাধিকার ব্যবস্থাপনা")}
            </div>
          </div>
        </div>
        <div className="access-actions">
          <Link href="/" style={{ ...btn, textDecoration: "none" }}>
            <ArrowLeft size={14} style={{ verticalAlign: "middle" }} />
            {" "}Main System
          </Link>
          <button style={btn} onClick={() => {
            const next = lang === "en" ? "bn" : "en";
            setLang(next);
            localStorage.setItem("mcbp-lang", next);
          }}>
            {lang === "en" ? "বাংলা" : "EN"}
          </button>
        </div>
      </header>

      <section className="access-hero">
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 15,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#B9E8D3" }}>
              SECURE · ROLE-BASED · GEOGRAPHICALLY SCOPED
            </div>
            <h1 style={{
              fontSize: "clamp(25px,3vw,36px)",
              margin: "10px 0",
            }}>
              {t("Users & Access Control", "ব্যবহারকারী ও প্রবেশাধিকার")}
            </h1>
            <p style={{
              fontSize: 13, color: "#D2EEDF",
              maxWidth: 650, lineHeight: 1.7,
            }}>
              {t(
                "Manage fictional officers, inspect permissions and simulate controlled account operations with an auditable history.",
                "নমুনা কর্মকর্তা, অনুমতি ও অ্যাকাউন্ট ব্যবস্থাপনার কার্যক্রম দেখুন।"
              )}
            </p>
          </div>
          <Fingerprint size={53} color="#B5E2CE" />
        </div>
        <div style={{ fontSize: 10, color: "#C1EAD7" }}>
          FRONTEND SIMULATION · NO REAL SSO · DEMO MFA ONLY
        </div>
      </section>

      <div className="access-stats">
        {[
          ["Total users", users.length, Users],
          ["Active accounts", active, CheckCircle2],
          ["Restricted accounts", suspended, LockKeyhole],
          ["Privileged roles", privileged, ShieldCheck],
        ].map(([label, value, Icon]) => {
          const Symbol = Icon as typeof Users;
          return (
            <section key={String(label)} style={card}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                color: "#006A4E",
              }}>
                <span className="access-label">{label as string}</span>
                <Symbol size={18} />
              </div>
              <div className="access-number">{value as number}</div>
              <div className="access-label">Fictional demo records</div>
            </section>
          );
        })}
      </div>

      <div className="access-tabs">
        {([
          ["users", "User Directory", "ব্যবহারকারী"],
          ["permissions", "Role Matrix", "রোল ম্যাট্রিক্স"],
          ["security", "Security Centre", "নিরাপত্তা"],
          ["audit", "Audit Log", "অডিট লগ"],
        ] as const).map(([id, en, bn]) => (
          <button
            key={id}
            style={tab === id ? primary : btn}
            onClick={() => setTab(id)}
          >
            {t(en, bn)}
          </button>
        ))}
      </div>

      {message && (
        <div style={{
          ...card, marginBottom: 14,
          background: "#ECF6EE", color: "#085C42",
          fontSize: 12,
        }}>
          {message}
          <button style={{ ...btn, float: "right", padding: "3px 8px" }}
            onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}

      <section style={{
        ...card,
        marginBottom: 14,
        display: "flex", gap: 12,
        alignItems: "center", flexWrap: "wrap",
      }}>
        <span className="access-label">
          {t("Acting demo role", "বর্তমান ডেমো রোল")}
        </span>
        <select style={input} value={actor} onChange={(e) => {
          const next = e.target.value as Role;
          setActor(next);
          localStorage.setItem("mcbp-role", next);
          setOtp("");
        }}>
          {roles.map((r) => (
            <option key={r} value={r}>{roleNames[r]}</option>
          ))}
        </select>
        <span className="access-pill">
          {administrator ? "ADMIN OPERATOR" : "READ-ONLY / RESTRICTED"}
        </span>
      </section>

      {tab === "users" && (
        <div className="access-grid">
          <section style={card}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", gap: 10, flexWrap: "wrap",
            }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>
                <UserRound size={18} style={{ verticalAlign: "middle" }} />
                {" "}{t("Officer Directory", "কর্মকর্তাদের তালিকা")}
              </h3>
              <label style={{
                display: "flex", alignItems: "center",
                gap: 7, fontSize: 12,
              }}>
                <Search size={15} color="#698071" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={input}
                  placeholder="Search users..."
                />
              </label>
            </div>
            <div style={{ overflowX: "auto", marginTop: 15 }}>
              <table className="access-table">
                <thead>
                  <tr>
                    <th>Name / ID</th>
                    <th>Role</th>
                    <th>Jurisdiction</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id}
                      onClick={() => selectUser(user)}
                      style={{
                        background:
                          selected === user.id ? "#EFF8F2" : undefined,
                      }}>
                      <td>
                        <b>{user.name}</b>
                        <div className="access-label">{user.id}</div>
                      </td>
                      <td>{roleNames[user.role]}</td>
                      <td>{user.area}</td>
                      <td>
                        <span className="access-pill" style={
                          user.status !== "active"
                            ? {
                                color: "#A16C19",
                                background: "#FFF0DF",
                              }
                            : undefined
                        }>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <section style={card}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>
                {t("Selected user", "নির্বাচিত ব্যবহারকারী")}
              </h3>
              {chosen ? (
                <>
                  <b>{chosen.name}</b>
                  <p className="access-label">
                    {chosen.id} · {roleNames[chosen.role]}
                  </p>
                  <div style={{
                    display: "flex", flexWrap: "wrap",
                    gap: 7, marginBottom: 13,
                  }}>
                    <span className="access-pill">
                      <MapPin size={11} /> {chosen.area}
                    </span>
                    <span className="access-pill">
                      <Smartphone size={11} /> {chosen.device}
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <label className="access-field">
                      Role
                      <select style={input}
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as Role)}>
                        {roles.map((r) => (
                          <option key={r} value={r}>{roleNames[r]}</option>
                        ))}
                      </select>
                    </label>
                    <label className="access-field">
                      Geographic jurisdiction
                      <input style={input}
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                      />
                    </label>
                    <label className="access-field">
                      Bound device
                      <input style={input}
                        value={newDevice}
                        onChange={(e) => setNewDevice(e.target.value)}
                      />
                    </label>
                    <label className="access-field">
                      Account expiry
                      <input type="date" style={input}
                        value={newExpiry}
                        onChange={(e) => setNewExpiry(e.target.value)}
                      />
                    </label>
                    <label className="access-field">
                      Demo MFA confirmation
                      <input style={input}
                        value={otp}
                        maxLength={6}
                        placeholder="Enter 123456"
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </label>
                    <button style={primary}
                      onClick={updateAssignment}>
                      Save role / area / device
                    </button>
                  </div>

                  <div className="access-actions" style={{ marginTop: 14 }}>
                    {(["suspended", "locked", "expired", "active"] as Status[])
                      .map((s) => (
                        <button key={s} style={btn}
                          onClick={() => updateAccount(s)}>
                          {s === "active" ? "Reactivate" : s}
                        </button>
                      ))}
                  </div>
                </>
              ) : (
                <p className="access-label">Select an officer.</p>
              )}
            </section>

            <section style={card}>
              <h3 style={{ margin: "0 0 13px", fontSize: 16 }}>
                <Plus size={18} style={{ verticalAlign: "middle" }} />
                {" "}{t("Create demo user", "নতুন ডেমো ব্যবহারকারী")}
              </h3>
              <div style={{ display: "grid", gap: 10 }}>
                <input
                  style={input}
                  value={newName}
                  placeholder="New officer name"
                  onChange={(e) => setNewName(e.target.value)}
                />
                <p className="access-label">
                  Uses the selected role, area, device and expiry above.
                  Demo MFA code: <b>123456</b>
                </p>
                <button style={primary} onClick={createUser}>
                  <Plus size={14} style={{ verticalAlign: "middle" }} />
                  {" "}Create account
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === "permissions" && (
        <section style={card}>
          <h3 style={{ marginTop: 0 }}>
            <ShieldCheck size={19} style={{ verticalAlign: "middle" }} />
            {" "}Role Permission Matrix
          </h3>
          <p className="access-label">
            Indicative demo permissions. Actual production privileges
            require approved SRS policy and server-side enforcement.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="access-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  {roles.map((r) => (
                    <th key={r}>{r.replaceAll("_", " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((row) => (
                  <tr key={row.label}>
                    <td><b>{row.label}</b></td>
                    {roles.map((r) => (
                      <td key={r}>
                        {row.allowed.includes(r)
                          ? <CheckCircle2 size={18} color="#087B54" />
                          : <XCircle size={15} color="#C3CFC6" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{
            marginTop: 18,
            borderRadius: 12,
            padding: 15,
            background: "#F0F7F2",
            fontSize: 12,
          }}>
            <b>Separation of duties:</b> Finance Maker prepares
            a payroll batch; Finance Checker reviews it.
            No single role should perform both actions.
          </div>
        </section>
      )}

      {tab === "security" && (
        <div className="access-grid">
          <section style={card}>
            <h3 style={{ marginTop: 0 }}>
              <ShieldAlert size={19} style={{ verticalAlign: "middle" }} />
              {" "}Security Events
            </h3>
            <p className="access-label">
              Security dashboard indicators are fictional examples,
              not real threat detections.
            </p>
            {[
              ["Repeated failed sign-ins", "USR-1008", "Review required"],
              ["Large data export attempt", "USR-1004", "Flagged"],
              ...Array.from(
                { length: Math.max(0, securityCount - 2) },
                (_, i) => [
                  "Simulated unusual activity",
                  `DEMO-${i + 1}`,
                  "Flagged",
                ]
              ),
            ].map(([title, reference, state], index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "15px 0",
                borderBottom: "1px solid #EDF2EE",
              }}>
                <div>
                  <b style={{ fontSize: 12 }}>{title}</b>
                  <div className="access-label">{reference}</div>
                </div>
                <span className="access-pill" style={{
                  background: "#FFF0E2",
                  color: "#95631C",
                }}>
                  {state}
                </span>
              </div>
            ))}
            <button style={{ ...primary, marginTop: 15 }}
              disabled={!administrator}
              onClick={simulateSecurity}>
              Generate sample security event
            </button>
          </section>

          <section style={card}>
            <h3 style={{ marginTop: 0 }}>
              <KeyRound size={19} style={{ verticalAlign: "middle" }} />
              {" "}Security Policy Preview
            </h3>
            {[
              ["Privileged MFA", "Required (production design)"],
              ["Demo confirmation", "123456 · visual only"],
              ["Password rules", "Configurable policy"],
              ["Account lifecycle", "Create / lock / expire / suspend"],
              ["CAPTCHA", "Illustrative sign-in rule"],
              ["Geographic access", "Role + area binding"],
              ["Audit", "Browser-local event list"],
              ["SSO platform", "Keycloak proposed · not connected"],
            ].map(([name, value]) => (
              <div key={name} style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 15,
                fontSize: 12,
                padding: "11px 0",
                borderBottom: "1px solid #EDF2EE",
              }}>
                <span style={{ color: "#71887A" }}>{name}</span>
                <b style={{ textAlign: "right" }}>{value}</b>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "audit" && (
        <section style={card}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <h3 style={{ margin: 0 }}>
              <FileClock size={19} style={{ verticalAlign: "middle" }} />
              {" "}Access Management Audit
            </h3>
            <button style={btn} onClick={() => exportCsv([
              ["Time", "Actor", "Action", "Detail"],
              ...events.map((e) => [
                e.time, e.actor, e.action, e.detail,
              ]),
            ])}>
              <Download size={14} style={{ verticalAlign: "middle" }} />
              {" "}Export CSV
            </button>
          </div>

          {!events.length && (
            <p className="access-label" style={{ marginTop: 18 }}>
              No new account events yet. Modify a demo account
              or generate a sample security event.
            </p>
          )}

          {events.map((e) => (
            <div key={e.id} style={{
              padding: "15px 0",
              borderBottom: "1px solid #EDF3EE",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                gap: 10, flexWrap: "wrap",
              }}>
                <b style={{ fontSize: 12 }}>{e.action}</b>
                <span className="access-label">
                  {new Date(e.time).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: 12 }}>{e.detail}</p>
              <div className="access-label">Actor: {e.actor}</div>
            </div>
          ))}
        </section>
      )}

      <footer style={{
        marginTop: 24,
        textAlign: "center",
        color: "#819486",
        fontSize: 11,
      }}>
        <LockKeyhole size={12} style={{ verticalAlign: "middle" }} />
        {" "}MCBP-MIS SS11 · Fictional data · Browser-local persistence ·
        Demo role switching is not real authentication or server-side RBAC.
      </footer>
    </div>
  );
}
