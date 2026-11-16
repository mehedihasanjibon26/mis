
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QueueType = "programme" | "system";
export type GrievanceStatus =
  | "open" | "assigned" | "investigating"
  | "escalated" | "resolved" | "closed" | "reopened";
export type GrievanceCategory =
  | "payment" | "selection" | "misconduct" | "service"
  | "data_error" | "access" | "glitch";
export type IntakeChannel = "web" | "mobile" | "udc" | "helpline" | "national_grs";

export interface Grievance {
  id: string;
  queue: QueueType;
  category: GrievanceCategory;
  subtype: string;
  channel: IntakeChannel;
  title: string;
  description: string;
  beneficiaryId: string;
  transactionId: string;
  union: string;
  anonymous: boolean;
  status: GrievanceStatus;
  owner: string;
  dueAt: string;
  createdAt: string;
  resolution: string;
  nationalGrsId?: string;
}

export interface GrievanceEvent {
  id: string;
  caseId: string;
  action: string;
  actor: string;
  note: string;
  time: string;
}

export interface NewGrievance {
  queue: QueueType;
  category: GrievanceCategory;
  subtype: string;
  channel: IntakeChannel;
  title: string;
  description: string;
  beneficiaryId: string;
  transactionId: string;
  union: string;
  anonymous: boolean;
}

type Result = { ok: boolean; message: string };

interface GrievanceState {
  cases: Grievance[];
  history: GrievanceEvent[];
  createCase: (data: NewGrievance, actor: string) => Result;
  takeAction: (
    id: string,
    action: "assign" | "investigate" | "escalate" | "resolve" | "close" | "reopen" | "note" | "sync_grs",
    actor: string,
    note: string,
    repaymentComplete?: boolean
  ) => Result;
  resetGrievances: () => void;
}

const timestamp = () => new Date().toISOString();
const response = (ok: boolean, message: string): Result => ({ ok, message });

function event(caseId: string, action: string, actor: string, note = ""): GrievanceEvent {
  return {
    id: `GE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    caseId, action, actor, note, time: timestamp(),
  };
}

const samples: Grievance[] = [
  {
    id: "GRS-2611-0872",
    queue: "programme",
    category: "payment",
    subtype: "Wallet / bounced payment",
    channel: "helpline",
    title: "Benefit payment returned by wallet",
    description: "Rahima Begum's fictional October payment was rejected by the payment provider.",
    beneficiaryId: "BEN-2603-00138",
    transactionId: "TX-DEMO-002",
    union: "Haragach",
    anonymous: false,
    status: "investigating",
    owner: "grm",
    dueAt: "2026-11-20T17:00:00.000Z",
    createdAt: "2026-11-12T09:00:00.000Z",
    resolution: "",
  },
  {
    id: "GRS-2611-0873",
    queue: "programme",
    category: "selection",
    subtype: "Appeal against selection",
    channel: "udc",
    title: "Eligibility decision appeal",
    description: "Applicant requests review of fictional selection result.",
    beneficiaryId: "",
    transactionId: "",
    union: "Kaunia Sadar",
    anonymous: false,
    status: "assigned",
    owner: "grm",
    dueAt: "2026-11-25T17:00:00.000Z",
    createdAt: "2026-11-13T09:30:00.000Z",
    resolution: "",
  },
  {
    id: "GRS-2611-0874",
    queue: "programme",
    category: "misconduct",
    subtype: "Misconduct report",
    channel: "web",
    title: "Confidential misconduct report",
    description: "Fictional confidential allegation submitted for independent review.",
    beneficiaryId: "",
    transactionId: "",
    union: "Balarhat",
    anonymous: true,
    status: "escalated",
    owner: "executive",
    dueAt: "2026-11-14T17:00:00.000Z",
    createdAt: "2026-11-10T08:00:00.000Z",
    resolution: "",
  },
  {
    id: "GRS-2611-0875",
    queue: "programme",
    category: "service",
    subtype: "Service availability",
    channel: "mobile",
    title: "Service centre appointment delay",
    description: "Fictional beneficiary reports delayed service.",
    beneficiaryId: "BEN-2605-00113",
    transactionId: "",
    union: "Kaunia Sadar",
    anonymous: false,
    status: "resolved",
    owner: "grm",
    dueAt: "2026-11-22T17:00:00.000Z",
    createdAt: "2026-11-11T08:00:00.000Z",
    resolution: "Demonstration appointment rescheduled.",
  },
  {
    id: "SGRM-2611-0012",
    queue: "system",
    category: "data_error",
    subtype: "Incorrect profile data",
    channel: "helpline",
    title: "MIS record correction request",
    description: "Fictional system-use ticket: incorrect data displayed.",
    beneficiaryId: "",
    transactionId: "",
    union: "Kaunia Sadar",
    anonymous: false,
    status: "open",
    owner: "helpdesk",
    dueAt: "2026-11-21T17:00:00.000Z",
    createdAt: "2026-11-15T08:00:00.000Z",
    resolution: "",
  },
];

const initialCases = () => samples.map((g) => ({ ...g }));

const categoryQueue = (category: GrievanceCategory): QueueType =>
  ["data_error", "access", "glitch"].includes(category) ? "system" : "programme";

const isOfficer = (actor: string) =>
  ["grm", "uwao", "executive", "admin"].includes(actor);

export const useGrievanceStore = create<GrievanceState>()(
  persist(
    (set, get) => ({
      cases: initialCases(),
      history: [],

      createCase: (data, actor) => {
        if (!data.title.trim() || data.description.trim().length < 10) {
          return response(false, "Title and description (10+ characters) required.");
        }
        if (!data.union.trim()) return response(false, "Union is required.");
        if (categoryQueue(data.category) !== data.queue) {
          return response(false, "Category does not match the selected queue.");
        }
        if (data.anonymous && data.category !== "misconduct") {
          return response(false, "Anonymous intake is reserved for misconduct reports.");
        }
        if (data.category === "payment" && !data.beneficiaryId.trim()) {
          return response(false, "A beneficiary ID is required for a payment complaint.");
        }
        const count = get().cases.filter((c) => c.queue === data.queue).length;
        const prefix = data.queue === "system" ? "SGRM" : "GRS";
        const serial = String(900 + count).padStart(4, "0");
        const id = `${prefix}-2611-${serial}`;
        const now = timestamp();
        const due = new Date(Date.now() + (data.queue === "system" ? 3 : 7) * 86400000).toISOString();
        const owner = data.queue === "system" ? "helpdesk"
          : data.category === "misconduct" ? "executive" : "grm";

        const record: Grievance = {
          ...data, id, owner, status: "open",
          createdAt: now, dueAt: due, resolution: "",
          beneficiaryId: data.anonymous ? "" : data.beneficiaryId.trim(),
          transactionId: data.anonymous ? "" : data.transactionId.trim(),
        };
        set((s) => ({
          cases: [record, ...s.cases],
          history: [...s.history, event(id, "created", actor, `Simulated acknowledgement: ${id}`)],
        }));
        return response(true, `Case ${id} registered. SMS acknowledgement preview generated.`);
      },

      takeAction: (id, action, actor, note, repaymentComplete = false) => {
        const g = get().cases.find((c) => c.id === id);
        if (!g) return response(false, "Case not found.");
        if (!isOfficer(actor)) return response(false, "Grievance officer role required.");
        if (g.queue === "system" && !["admin", "grm"].includes(actor)) {
          return response(false, "System-use GRM access denied.");
        }
        if (g.category === "misconduct" && !["executive", "admin"].includes(actor)) {
          return response(false, "Confidential misconduct case requires supervisory role.");
        }
        if (actor === "uwao" && g.union === "Begumganj") {
          return response(false, "Outside assigned jurisdiction.");
        }

        const active = ["open", "assigned", "investigating", "escalated", "reopened"];
        if (action === "reopen") {
          if (!["resolved", "closed"].includes(g.status)) {
            return response(false, "Only resolved or closed cases can reopen.");
          }
        } else if (action === "close") {
          if (g.status !== "resolved") return response(false, "Resolve the case before closing.");
        } else if (action !== "note" && action !== "sync_grs" && !active.includes(g.status)) {
          return response(false, "Case is not in an actionable state.");
        }

        if (["resolve", "reopen", "note", "escalate"].includes(action) &&
            note.trim().length < 5) {
          return response(false, "Add an evidence / action note (at least 5 characters).");
        }
        if (action === "resolve" && g.transactionId && !repaymentComplete) {
          return response(false, "Linked payment is not repaid. Complete payroll correction first.");
        }
        if (action === "sync_grs" && g.queue !== "programme") {
          return response(false, "System-use GRM does not sync with programme National GRS.");
        }

        const nextStatus: Partial<Record<typeof action, GrievanceStatus>> = {
          assign: "assigned",
          investigate: "investigating",
          escalate: "escalated",
          resolve: "resolved",
          close: "closed",
          reopen: "reopened",
        };

        set((s) => ({
          cases: s.cases.map((c) => c.id !== id ? c : {
            ...c,
            status: nextStatus[action] ?? c.status,
            owner: action === "escalate" ? "executive" :
              action === "assign" ? (c.queue === "system" ? "helpdesk" : "grm") : c.owner,
            resolution: action === "resolve" ? note.trim()
              : action === "reopen" ? "" : c.resolution,
            nationalGrsId: action === "sync_grs"
              ? c.nationalGrsId ?? `NGRS-MOCK-${c.id.split("-").pop()}`
              : c.nationalGrsId,
          }),
          history: [...s.history, event(id, action, actor, note.trim() || "Demo status update")],
        }));
        return response(true, `Case ${id}: ${action} recorded. Notification preview updated.`);
      },

      resetGrievances: () => set({ cases: initialCases(), history: [] }),
    }),
    { name: "mcbp-grievances-v1", version: 1 }
  )
);
