
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PartnerId =
  | "EC" | "BDRIS" | "DGHS" | "DGFP"
  | "SPBMU" | "MFS" | "BANK" | "GRS" | "REGISTRY";

export type Scenario =
  | "success" | "timeout" | "unauthorized"
  | "rate_limit" | "unavailable";

export type QueueState =
  | "retry" | "dead_letter" | "fallback" | "resolved";

export interface Partner {
  id: PartnerId;
  name: string;
  purpose: string;
  method: "GET" | "POST";
  path: string;
  format: "JSON" | "XML";
  owner: string;
  auth: string;
  rate: number;
  status: "healthy" | "degraded" | "outage";
  latency: number;
  success: number;
  calls: number;
  version: string;
}

export interface HubMessage {
  id: string;
  partner: PartnerId;
  scenario: Scenario;
  outcome: string;
  time: string;
  latency: number;
  correlation: string;
  body: string;
}

export interface HubQueue {
  id: string;
  partner: PartnerId;
  tries: number;
  state: QueueState;
  applicationId?: string;
  reason: string;
  time: string;
}

export interface HubEvent {
  id: string;
  action: string;
  actor: string;
  description: string;
  time: string;
}

export interface BulkBatch {
  id: string;
  filename: string;
  rows: number;
  valid: number;
  errors: string[];
  status: "validated" | "submitted";
  created: string;
}

export interface Consumer {
  id: string;
  name: string;
  partner: PartnerId;
  scope: string;
  status: "sandbox" | "approved";
}

const partnersSeed: Partner[] = [
  {
    id: "EC",
    name: "Election Commission (NID)",
    purpose: "Identity verification",
    method: "POST",
    path: "/v1/identity/nid/verify",
    format: "JSON",
    owner: "EC / MoWCA",
    auth: "OAuth2 + mTLS (mock)",
    rate: 100,
    status: "healthy",
    latency: 185,
    success: 99.1,
    calls: 6234,
    version: "1.0",
  },
  {
    id: "BDRIS",
    name: "BDRIS (Birth Registration)",
    purpose: "Child BRN validation",
    method: "POST",
    path: "/v1/identity/brn/verify",
    format: "JSON",
    owner: "BDRIS / MoWCA",
    auth: "mTLS (mock)",
    rate: 80,
    status: "healthy",
    latency: 240,
    success: 98.7,
    calls: 4210,
    version: "1.0",
  },
  {
    id: "DGHS",
    name: "DGHS",
    purpose: "ANC/PNC clinical compliance",
    method: "GET",
    path: "/v1/health/anc-pnc",
    format: "JSON",
    owner: "DGHS",
    auth: "OAuth2 (mock)",
    rate: 60,
    status: "healthy",
    latency: 360,
    success: 97.8,
    calls: 2053,
    version: "1.0",
  },
  {
    id: "DGFP",
    name: "DGFP",
    purpose: "Family planning referrals",
    method: "POST",
    path: "/v1/health/referrals",
    format: "JSON",
    owner: "DGFP",
    auth: "OAuth2 (mock)",
    rate: 55,
    status: "degraded",
    latency: 640,
    success: 92.1,
    calls: 953,
    version: "1.0",
  },
  {
    id: "SPBMU",
    name: "iBAS++ / SPBMU",
    purpose: "Benefit batch settlement",
    method: "POST",
    path: "/v1/payroll/settlements",
    format: "XML",
    owner: "Finance Division",
    auth: "mTLS (mock)",
    rate: 50,
    status: "healthy",
    latency: 490,
    success: 98.2,
    calls: 1690,
    version: "1.0",
  },
  {
    id: "MFS",
    name: "MFS Providers",
    purpose: "Wallet payment confirmations",
    method: "POST",
    path: "/v1/payments/mfs/callback",
    format: "JSON",
    owner: "Payment partners",
    auth: "Signed token (mock)",
    rate: 150,
    status: "healthy",
    latency: 175,
    success: 99.2,
    calls: 9780,
    version: "1.0",
  },
  {
    id: "BANK",
    name: "Partner Banks",
    purpose: "Bank account reconciliation",
    method: "POST",
    path: "/v1/payments/bank/reconcile",
    format: "XML",
    owner: "Bank partners",
    auth: "mTLS (mock)",
    rate: 75,
    status: "healthy",
    latency: 285,
    success: 98.9,
    calls: 2300,
    version: "1.0",
  },
  {
    id: "GRS",
    name: "National GRS",
    purpose: "Grievance case exchange",
    method: "POST",
    path: "/v1/grs/cases/sync",
    format: "JSON",
    owner: "National GRS",
    auth: "OAuth2 (mock)",
    rate: 70,
    status: "healthy",
    latency: 310,
    success: 97.3,
    calls: 1120,
    version: "1.0",
  },
  {
    id: "REGISTRY",
    name: "Single Registry",
    purpose: "Duplicate and eligibility lookup",
    method: "GET",
    path: "/v1/registry/duplicate-check",
    format: "JSON",
    owner: "Social Registry",
    auth: "OAuth2 + mTLS (mock)",
    rate: 90,
    status: "healthy",
    latency: 255,
    success: 98.4,
    calls: 4009,
    version: "1.0",
  },
];

const time = () => new Date().toISOString();

const id = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const log = (
  action: string,
  actor: string,
  description: string
): HubEvent => ({
  id: id("EV"),
  action,
  actor,
  description,
  time: time(),
});

export type Result = {
  ok: boolean;
  message: string;
};

const result = (ok: boolean, message: string): Result => ({
  ok,
  message,
});

interface HubStore {
  partners: Partner[];
  messages: HubMessage[];
  queue: HubQueue[];
  events: HubEvent[];
  batches: BulkBatch[];
  consumers: Consumer[];
  lastSimulation: HubMessage | null;
  applicationSignals: Record<string, "identity_pending">;

  simulate: (
    partnerId: PartnerId,
    scenario: Scenario,
    actor: string,
    applicationId?: string
  ) => Result;

  retry: (queueId: string, actor: string) => Result;

  recover: (
    partnerId: PartnerId,
    actor: string
  ) => Result;

  registerConsumer: (
    name: string,
    partner: PartnerId,
    scope: string,
    actor: string
  ) => Result;

  submitBatch: (
    filename: string,
    text: string,
    actor: string
  ) => Result;

  approveBatch: (
    batchId: string,
    actor: string
  ) => Result;

  resetHub: () => void;
}

const defaultState = () => ({
  partners: partnersSeed.map((p) => ({ ...p })),
  messages: [] as HubMessage[],
  queue: [] as HubQueue[],
  events: [] as HubEvent[],
  batches: [] as BulkBatch[],
  consumers: [
    {
      id: "CON-MOWCA",
      name: "MCBP Officer Portal",
      partner: "EC" as PartnerId,
      scope: "nid.verify",
      status: "approved" as const,
    },
  ],
  lastSimulation: null as HubMessage | null,
  applicationSignals: {} as Record<string, "identity_pending">,
});

const canOperate = (actor: string) =>
  ["admin", "executive", "integration", "uwao"].includes(actor);

export const useDataHubStore = create<HubStore>()(
  persist(
    (set, get) => ({
      ...defaultState(),

      simulate: (partnerId, scenario, actor, applicationId) => {
        if (!canOperate(actor)) {
          return result(false, "Authorized operator required.");
        }

        const partner = get().partners.find(
          (p) => p.id === partnerId
        );

        if (!partner) {
          return result(false, "Unknown API.");
        }

        const effective: Scenario =
          partner.status === "outage" && scenario === "success"
            ? "unavailable"
            : scenario;

        const outcome: Record<Scenario, string> = {
          success: "200 OK",
          timeout: "504 GATEWAY_TIMEOUT",
          unauthorized: "401 UNAUTHORIZED",
          rate_limit: "429 RATE_LIMIT",
          unavailable: "503 PARTNER_UNAVAILABLE",
        };

        const status = outcome[effective];

        const msg: HubMessage = {
          id: id("MSG"),
          partner: partnerId,
          scenario: effective,
          outcome: status,
          time: time(),
          latency: effective === "timeout" ? 3000 : partner.latency,
          correlation: id("CORR"),
          body: JSON.stringify(
            effective === "success"
              ? {
                  status: "verified",
                  source: partnerId,
                  demo: true,
                }
              : {
                  error: status,
                  retryable: ["timeout", "unavailable"].includes(effective),
                  demo: true,
                },
            null,
            2
          ),
        };

        const retryable = ["timeout", "unavailable"].includes(
          effective
        );

        const queued: HubQueue | null = retryable
          ? {
              id: id("Q"),
              partner: partnerId,
              tries: 0,
              state: "retry",
              applicationId:
                partnerId === "BDRIS"
                  ? applicationId
                  : undefined,
              reason: status,
              time: time(),
            }
          : null;

        set((state) => ({
          messages: [msg, ...state.messages].slice(0, 120),
          lastSimulation: msg,
          queue: queued
            ? [queued, ...state.queue]
            : state.queue,
          partners: state.partners.map((p) =>
            p.id === partnerId
              ? {
                  ...p,
                  calls: p.calls + 1,
                  success:
                    effective === "success"
                      ? Math.min(99.9, p.success + 0.05)
                      : Math.max(0, p.success - 0.2),
                }
              : p
          ),
          events: [
            log("sandbox_test", actor, `${partnerId}: ${status}`),
            ...state.events,
          ].slice(0, 150),
          applicationSignals:
            retryable &&
            partnerId === "BDRIS" &&
            applicationId
              ? {
                  ...state.applicationSignals,
                  [applicationId]: "identity_pending",
                }
              : state.applicationSignals,
        }));

        return result(
          true,
          `Mock ${status}${queued ? "; added to retry queue" : ""}.`
        );
      },

      retry: (queueId, actor) => {
        if (!canOperate(actor)) {
          return result(false, "Operator role required.");
        }

        const item = get().queue.find(
          (q) => q.id === queueId
        );

        if (
          !item ||
          !["retry", "dead_letter", "fallback"].includes(item.state)
        ) {
          return result(false, "Queue item unavailable.");
        }

        const partner = get().partners.find(
          (p) => p.id === item.partner
        );

        const nextTries = item.tries + 1;
        const recovered = partner?.status === "healthy";

        const nextState: QueueState = recovered
          ? "resolved"
          : nextTries >= 3
            ? "dead_letter"
            : "retry";

        set((state) => ({
          queue: state.queue.map((q) =>
            q.id === queueId
              ? {
                  ...q,
                  tries: nextTries,
                  state: nextState,
                  time: time(),
                }
              : q
          ),
          events: [
            log(
              "retry",
              actor,
              `${item.partner} attempt ${nextTries} → ${nextState}`
            ),
            ...state.events,
          ],
        }));

        return result(
          true,
          `Attempt ${nextTries}/3: ${nextState}.`
        );
      },

      recover: (partnerId, actor) => {
        if (!canOperate(actor)) {
          return result(false, "Operator role required.");
        }

        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partnerId
              ? {
                  ...p,
                  status:
                    p.status === "outage"
                      ? "healthy"
                      : "outage",
                }
              : p
          ),
          events: [
            log(
              "partner_status",
              actor,
              `${partnerId} availability toggled`
            ),
            ...state.events,
          ],
        }));

        return result(
          true,
          "Mock partner availability updated."
        );
      },

      registerConsumer: (name, partner, scope, actor) => {
        if (!canOperate(actor)) {
          return result(false, "Operator role required.");
        }

        if (
          name.trim().length < 3 ||
          scope.trim().length < 3
        ) {
          return result(
            false,
            "Consumer name and authorized scope required."
          );
        }

        set((state) => ({
          consumers: [
            {
              id: id("CON"),
              name: name.trim(),
              partner,
              scope: scope.trim(),
              status: "sandbox",
            },
            ...state.consumers,
          ],
          events: [
            log(
              "consumer_registered",
              actor,
              `${name} → ${partner}`
            ),
            ...state.events,
          ],
        }));

        return result(
          true,
          "Consumer registered in sandbox."
        );
      },

      submitBatch: (filename, text, actor) => {
        if (!canOperate(actor)) {
          return result(false, "Operator role required.");
        }

        const lines = text.trim().split(/\r?\n/).filter(Boolean);

        if (lines.length < 2) {
          return result(
            false,
            "CSV must include header and at least one record."
          );
        }

        const headers = lines[0]
          .toLowerCase()
          .split(",")
          .map((x) => x.trim());

        const required = [
          "beneficiary_id",
          "action",
          "reference",
        ];

        if (required.some((x) => !headers.includes(x))) {
          return result(
            false,
            "CSV headers: beneficiary_id,action,reference."
          );
        }

        const errors: string[] = [];

        lines.slice(1).forEach((line, index) => {
          const columns = line.split(",");

          if (
            columns.length !== headers.length ||
            columns.some((x) => !x.trim())
          ) {
            errors.push(
              `Row ${index + 2}: incomplete or malformed`
            );
          }
        });

        const batch: BulkBatch = {
          id: id("BULK"),
          filename,
          rows: lines.length - 1,
          valid: lines.length - 1 - errors.length,
          errors,
          status: "validated",
          created: time(),
        };

        set((state) => ({
          batches: [batch, ...state.batches],
          events: [
            log(
              "bulk_validation",
              actor,
              `${filename}: ${batch.valid}/${batch.rows}`
            ),
            ...state.events,
          ],
        }));

        return result(
          true,
          `${batch.valid} valid rows; ${errors.length} errors.`
        );
      },

      approveBatch: (batchId, actor) => {
        if (actor !== "admin") {
          return result(
            false,
            "Admin checker required."
          );
        }

        const batch = get().batches.find(
          (item) => item.id === batchId
        );

        if (
          !batch ||
          batch.status !== "validated" ||
          batch.errors.length > 0
        ) {
          return result(
            false,
            "Only clean validated batches can be approved."
          );
        }

        set((state) => ({
          batches: state.batches.map((item) =>
            item.id === batchId
              ? { ...item, status: "submitted" }
              : item
          ),
          events: [
            log("bulk_approved", actor, batchId),
            ...state.events,
          ],
        }));

        return result(
          true,
          "Bulk file approved for simulated exchange."
        );
      },

      resetHub: () => set(defaultState()),
    }),
    {
      name: "mcbp-datahub-v1",
      version: 1,
    }
  )
);
