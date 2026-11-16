
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "bounced"
  | "correction_pending"
  | "repayment_approved"
  | "repaid";

export type CycleStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "processing"
  | "processed"
  | "reconciled";

export interface PayrollPerson {
  id: string;
  name: string;
  division: string;
  union: string;
  active: boolean;
  consent: boolean;
  monthsUsed: number;
  nidValid: boolean;
}

export interface PayrollCycle {
  id: string;
  month: string;
  amount: number;
  status: CycleStatus;
  maker: string;
  checker?: string;
  createdAt: string;
  source: "seed" | "workflow";
  ruleVersion: string;
}

export interface Payment {
  id: string;
  cycleId: string;
  beneficiaryId: string;
  name: string;
  division: string;
  union: string;
  amount: number;
  status: PaymentStatus;
  reference: string;
  reason?: string;
  correction?: string;
  correctionMaker?: string;
  correctionChecker?: string;
  updatedAt: string;
}

export interface PayrollLog {
  id: string;
  cycleId: string;
  paymentId?: string;
  action: string;
  actor: string;
  time: string;
}

interface Result {
  ok: boolean;
  message: string;
}

interface PayrollState {
  cycles: PayrollCycle[];
  payments: Payment[];
  logs: PayrollLog[];
  monthlyAmount: number;
  maxMonths: number;
  createCycle: (
    month: string,
    people: PayrollPerson[],
    actor: string
  ) => Result;
  actOnCycle: (
    id: string,
    action: "submit" | "approve" | "process" | "reconcile",
    actor: string,
    otp?: string
  ) => Result;
  recordSettlement: (
    cycleId: string,
    paymentId: string,
    status: "paid" | "bounced",
    actor: string
  ) => Result;
  requestCorrection: (
    paymentId: string,
    details: string,
    actor: string
  ) => Result;
  reviewCorrection: (
    paymentId: string,
    actor: string,
    otp: string
  ) => Result;
  repay: (paymentId: string, actor: string) => Result;
  resetPayroll: () => void;
}

const moment = () => new Date().toISOString();
const result = (ok: boolean, message: string): Result => ({ ok, message });

const makeLog = (
  cycleId: string,
  action: string,
  actor: string,
  paymentId?: string
): PayrollLog => ({
  id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  cycleId,
  paymentId,
  action,
  actor,
  time: moment(),
});

const seededCycle: PayrollCycle = {
  id: "PAY-2026-10-DEMO",
  month: "2026-10",
  amount: 850,
  status: "processed",
  maker: "finance",
  checker: "finance_checker",
  createdAt: "2026-10-15T09:00:00.000Z",
  source: "seed",
  ruleVersion: "BENEFIT-RULE-V1",
};

const seededPayments: Payment[] = [
  {
    id: "TX-DEMO-001",
    cycleId: seededCycle.id,
    beneficiaryId: "BEN-2605-00113",
    name: "Ayesha Khatun",
    division: "Rangpur",
    union: "Kaunia Sadar",
    amount: 850,
    status: "paid",
    reference: "MFS-DEMO-001",
    updatedAt: "2026-10-18T08:00:00.000Z",
  },
  {
    id: "TX-DEMO-002",
    cycleId: seededCycle.id,
    beneficiaryId: "BEN-2603-00138",
    name: "Rahima Begum",
    division: "Rangpur",
    union: "Haragach",
    amount: 850,
    status: "bounced",
    reference: "MFS-DEMO-002",
    reason: "Mock wallet validation failure",
    updatedAt: "2026-10-18T08:10:00.000Z",
  },
  {
    id: "TX-DEMO-003",
    cycleId: seededCycle.id,
    beneficiaryId: "BEN-2601-00201",
    name: "Farzana Yasmin",
    division: "Rangpur",
    union: "Begumganj",
    amount: 850,
    status: "pending",
    reference: "MFS-DEMO-003",
    updatedAt: "2026-10-18T08:15:00.000Z",
  },
];

const initialCycles = () => [{ ...seededCycle }];
const initialPayments = () => seededPayments.map((p) => ({ ...p }));

export const usePayrollStore = create<PayrollState>()(
  persist(
    (set, get) => ({
      cycles: initialCycles(),
      payments: initialPayments(),
      logs: [],
      monthlyAmount: 850,
      maxMonths: 36,

      createCycle: (month, people, actor) => {
        if (actor !== "finance") {
          return result(false, "Finance Maker role required.");
        }
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
          return result(false, "Select a valid payroll month.");
        }
        if (get().cycles.some((cycle) => cycle.month === month)) {
          return result(false, "A payroll cycle already exists for this month.");
        }

        const amount = get().monthlyAmount;
        const eligible = people.filter(
          (person) =>
            person.active &&
            person.consent &&
            person.nidValid &&
            person.monthsUsed < get().maxMonths
        );

        if (!eligible.length) {
          return result(false, "No eligible beneficiaries for this cycle.");
        }

        const id = `PAY-${month}-DEMO`;
        const cycle: PayrollCycle = {
          id,
          month,
          amount,
          status: "draft",
          maker: actor,
          createdAt: moment(),
          source: "workflow",
          ruleVersion: "BENEFIT-RULE-V1",
        };

        const payments: Payment[] = eligible.map((person, index) => ({
          id: `${id}-TX-${String(index + 1).padStart(4, "0")}`,
          cycleId: id,
          beneficiaryId: person.id,
          name: person.name,
          division: person.division,
          union: person.union,
          amount,
          status: "pending",
          reference: `SIM-${month.replace("-", "")}-${index + 1}`,
          updatedAt: moment(),
        }));

        set((state) => ({
          cycles: [...state.cycles, cycle],
          payments: [...state.payments, ...payments],
          logs: [...state.logs, makeLog(id, "cycle_created", actor)],
        }));

        return result(true, `Cycle created for ${eligible.length} eligible beneficiaries.`);
      },

      actOnCycle: (id, action, actor, otp) => {
        const cycle = get().cycles.find((c) => c.id === id);
        if (!cycle) return result(false, "Cycle not found.");

        const transitions: Record<
          "submit" | "approve" | "process" | "reconcile",
          [CycleStatus, CycleStatus, string]
        > = {
          submit: ["draft", "submitted", "finance"],
          approve: ["submitted", "approved", "finance_checker"],
          process: ["approved", "processed", "finance"],
          reconcile: ["processed", "reconciled", "finance"],
        };

        const [before, after, requiredRole] = transitions[action];

        if (actor !== requiredRole) {
          return result(false, `Required role: ${requiredRole}.`);
        }
        if (cycle.status !== before) {
          return result(false, `Cycle must be ${before} first.`);
        }
        if (action === "approve") {
          if (actor === cycle.maker) {
            return result(false, "Maker cannot approve own payroll.");
          }
          if (otp !== "123456") {
            return result(false, "Enter demo OTP 123456.");
          }
        }

        if (action === "reconcile") {
          const unresolved = get().payments.some(
            (p) =>
              p.cycleId === id &&
              ["pending", "correction_pending", "repayment_approved"].includes(p.status)
          );
          if (unresolved) {
            return result(false, "Resolve pending transactions before closing reconciliation.");
          }
        }

        set((state) => ({
          cycles: state.cycles.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: after,
                  checker: action === "approve" ? actor : c.checker,
                }
              : c
          ),
          logs: [...state.logs, makeLog(id, action, actor)],
        }));

        return result(true, `${action} completed.`);
      },

      recordSettlement: (cycleId, paymentId, status, actor) => {
        const cycle = get().cycles.find((c) => c.id === cycleId);
        const payment = get().payments.find((p) => p.id === paymentId);

        if (actor !== "finance" || !cycle || !payment) {
          return result(false, "Invalid actor, cycle or payment.");
        }
        if (!["processed", "reconciled"].includes(cycle.status)) {
          return result(false, "Approve and process the cycle first.");
        }
        if (payment.cycleId !== cycleId || payment.status !== "pending") {
          return result(false, "Only pending transactions can receive settlement.");
        }

        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status,
                  reason: status === "bounced" ? "Simulated settlement rejection" : undefined,
                  updatedAt: moment(),
                }
              : p
          ),
          logs: [
            ...state.logs,
            makeLog(cycleId, `settlement_${status}`, actor, paymentId),
          ],
        }));

        return result(true, "Mock settlement recorded.");
      },

      requestCorrection: (paymentId, details, actor) => {
        const payment = get().payments.find((p) => p.id === paymentId);
        if (actor !== "finance" || !payment) {
          return result(false, "Finance Maker and a valid payment required.");
        }
        if (payment.status !== "bounced") {
          return result(false, "Only bounced payments can be corrected.");
        }
        if (details.trim().length < 5) {
          return result(false, "Enter a correction note of at least five characters.");
        }

        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status: "correction_pending",
                  correction: details.trim(),
                  correctionMaker: actor,
                  updatedAt: moment(),
                }
              : p
          ),
          logs: [
            ...state.logs,
            makeLog(payment.cycleId, "correction_requested", actor, paymentId),
          ],
        }));
        return result(true, "Correction submitted for independent approval.");
      },

      reviewCorrection: (paymentId, actor, otp) => {
        const payment = get().payments.find((p) => p.id === paymentId);
        if (!payment || payment.status !== "correction_pending") {
          return result(false, "No pending correction.");
        }
        if (actor !== "finance_checker" || actor === payment.correctionMaker) {
          return result(false, "Independent Finance Checker required.");
        }
        if (otp !== "123456") return result(false, "Enter demo OTP 123456.");

        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status: "repayment_approved",
                  correctionChecker: actor,
                  updatedAt: moment(),
                }
              : p
          ),
          logs: [
            ...state.logs,
            makeLog(payment.cycleId, "correction_approved", actor, paymentId),
          ],
        }));
        return result(true, "Repayment approved.");
      },

      repay: (paymentId, actor) => {
        const payment = get().payments.find((p) => p.id === paymentId);
        if (actor !== "finance" || !payment) {
          return result(false, "Finance Maker required.");
        }
        if (
          payment.status !== "repayment_approved" ||
          !payment.correctionChecker ||
          payment.correctionChecker === actor
        ) {
          return result(false, "Independent correction approval required.");
        }

        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status: "repaid",
                  reference: `${p.reference}-REPAY`,
                  updatedAt: moment(),
                }
              : p
          ),
          logs: [
            ...state.logs,
            makeLog(payment.cycleId, "repaid", actor, paymentId),
          ],
        }));
        return result(true, "Simulated repayment successful.");
      },

      resetPayroll: () =>
        set({
          cycles: initialCycles(),
          payments: initialPayments(),
          logs: [],
          monthlyAmount: 850,
          maxMonths: 36,
        }),
    }),
    { name: "mcbp-payroll-v1", version: 1 }
  )
);
