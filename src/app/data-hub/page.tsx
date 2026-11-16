
"use client";

import { useState } from "react";
import Link from "next/link";
import DataHubPanel from "../../components/DataHubPanel";

export default function DataHubPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [roleId, setRoleId] = useState("admin");

  const roles = [
    ["admin", "System Administrator"],
    ["integration", "Integration Operator"],
    ["executive", "Programme Executive"],
    ["uwao", "Upazila Women Affairs Officer"],
    ["field", "Field Verifier"],
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7f5",
        padding: "20px clamp(12px,3vw,48px)",
      }}
    >
      <nav
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 15,
        }}
      >
        <Link
          href="/"
          style={{
            color: "#006a4e",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← MCBP-MIS Dashboard
        </Link>

        <div style={{ flex: 1 }} />

        <button
          onClick={() =>
            setLang(lang === "en" ? "bn" : "en")
          }
          style={{
            padding: "9px 12px",
            border: "1px solid #ddd",
            background: "#fff",
            borderRadius: 8,
          }}
        >
          {lang === "en" ? "বাংলা" : "EN"}
        </button>

        <select
          aria-label="Demo integration role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          style={{
            padding: "9px 12px",
            border: "1px solid #ddd",
            background: "#fff",
            borderRadius: 8,
          }}
        >
          {roles.map(([id, label]) => (
            <option value={id} key={id}>
              {label}
            </option>
          ))}
        </select>
      </nav>

      <DataHubPanel lang={lang} roleId={roleId} />
    </div>
  );
}
