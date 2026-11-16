
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "identity_pending"
  | "identity_verified"
  | "eligibility_passed"
  | "eligibility_failed"
  | "field_pending"
  | "field_completed"
  | "selection_prepared"
  | "approval_pending"
  | "approved"
  | "rejected"
  | "returned"
  | "enrolled";

export type WorkflowAction =
  | "verify_identity"
  | "pass_eligibility"
  | "assign_field"
  | "complete_field"
  | "prepare_selection"
  | "request_approval"
  | "approve"
  | "reject"
  | "return"
  | "enroll";

export interface Application {
  id: string;
  nameEn: string;
  nameBn: string;
  nid: string;
  mobile: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  consent: boolean;
  submittedBy: string;
  makerId?: string;
  checkerId?: string;
  beneficiaryId?: string;
}

export interface DemoEvent {
  id: string;
  applicationId: string;
  action: string;
  actorId: string;
  timestamp: string;
}

export interface NewApplication {
  nameEn: string;
  nameBn: string;
  nid: string;
  mobile: string;
  union: string;
  consent: boolean;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

interface DemoStore {
  applications: Application[];
  events: DemoEvent[];
  createApplication: (
    data: NewApplication,
    actorId: string
  ) => string;
  submitApplication: (
    id: string,
    actorId: string
  ) => boolean;
  runWorkflow: (
    id: string,
    action: WorkflowAction,
    actorId: string,
    otp?: string
  ) => ActionResult;
  resetDemo: () => void;
}

const seedApplications: Application[] = [
  {
    id: "APP-2611-00447",
    nameEn: "Moriom Begum",
    nameBn: "মরিয়ম বেগম",
    nid: "1990****4471",
    mobile: "017*****044",
    division: "Rangpur",
    district: "Rangpur",
    upazila: "Kaunia",
    union: "Kaunia Sadar",
    status: "field_pending",
    createdAt: "2026-11-13T09:00:00",
    updatedAt: "2026-11-14T10:30:00",
    consent: true,
    submittedBy: "demo-beneficiary",
  },
  {
    id: "APP-2611-00431",
    nameEn: "Shahana Akter",
    nameBn: "শাহানা আক্তার",
    nid: "1988****0431",
    mobile: "018*****431",
    division: "Rangpur",
    district: "Rangpur",
    upazila: "Kaunia",
    union: "Haragach",
    status: "field_completed",
    createdAt: "2026-11-11T10:00:00",
    updatedAt: "2026-11-14T11:00:00",
    consent: true,
    submittedBy: "demo-udc",
  },
];

const initialApplications = () =>
  seedApplications.map((item) => ({ ...item }));

function makeEvent(
  applicationId: string,
  action: string,
  actorId: string
): DemoEvent {
  return {
    id: `EVT-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    applicationId,
    action,
    actorId,
    timestamp: new Date().toISOString(),
  };
}

type Rule = {
  from: ApplicationStatus[];
  to: ApplicationStatus;
  roles: string[];
};

const workflowRules: Record<WorkflowAction, Rule> = {
  verify_identity: {
    from: ["submitted", "identity_pending", "returned"],
    to: "identity_verified",
    roles: ["union_maker", "uwao"],
  },
  pass_eligibility: {
    from: ["identity_verified"],
    to: "eligibility_passed",
    roles: ["union_maker", "uwao"],
  },
  assign_field: {
    from: ["eligibility_passed"],
    to: "field_pending",
    roles: ["union_maker", "uwao"],
  },
  complete_field: {
    from: ["field_pending"],
    to: "field_completed",
    roles: ["field"],
  },
  prepare_selection: {
    from: ["field_completed"],
    to: "selection_prepared",
    roles: ["union_maker"],
  },
  request_approval: {
    from: ["selection_prepared"],
    to: "approval_pending",
    roles: ["union_maker"],
  },
  approve: {
    from: ["approval_pending"],
    to: "approved",
    roles: ["uwao"],
  },
  reject: {
    from: ["approval_pending"],
    to: "rejected",
    roles: ["uwao"],
  },
  return: {
    from: ["approval_pending"],
    to: "returned",
    roles: ["uwao"],
  },
  enroll: {
    from: ["approved"],
    to: "enrolled",
    roles: ["uwao"],
  },
};

const failure = (message: string): ActionResult => ({
  ok: false,
  message,
});

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      applications: initialApplications(),
      events: [],

      createApplication: (data, actorId) => {
        const numbers = get()
          .applications.map((item) =>
            Number(item.id.split("-").pop())
          )
          .filter(Number.isFinite);

        const next = Math.max(447, ...numbers) + 1;

        const id = `APP-2611-${String(next).padStart(
          5,
          "0"
        )}`;

        const now = new Date().toISOString();

        const application: Application = {
          id,
          nameEn: data.nameEn.trim(),
          nameBn: data.nameBn.trim(),
          nid: data.nid.trim(),
          mobile: data.mobile.trim(),
          division: "Rangpur",
          district: "Rangpur",
          upazila: "Kaunia",
          union: data.union,
          status: "draft",
          createdAt: now,
          updatedAt: now,
          consent: data.consent,
          submittedBy: actorId,
        };

        set((state) => ({
          applications: [
            ...state.applications,
            application,
          ],
          events: [
            ...state.events,
            makeEvent(id, "application_created", actorId),
          ],
        }));

        return id;
      },

      submitApplication: (id, actorId) => {
        const application = get().applications.find(
          (item) => item.id === id
        );

        if (
          !application ||
          application.status !== "draft" ||
          !application.consent ||
          !application.nameEn.trim() ||
          !application.nid.trim() ||
          !application.mobile.trim()
        ) {
          return false;
        }

        set((state) => ({
          applications: state.applications.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "submitted",
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
          events: [
            ...state.events,
            makeEvent(id, "application_submitted", actorId),
          ],
        }));

        return true;
      },

      runWorkflow: (id, action, actorId, otp) => {
        const application = get().applications.find(
          (item) => item.id === id
        );

        if (!application) {
          return failure("Application not found.");
        }

        const rule = workflowRules[action];

        if (!rule.roles.includes(actorId)) {
          return failure(
            "This demo role cannot perform this action."
          );
        }

        if (!rule.from.includes(application.status)) {
          return failure(
            `Invalid transition: ${application.status} → ${rule.to}.`
          );
        }

        if (!application.consent) {
          return failure(
            "Applicant consent is required."
          );
        }

        const checkerActions: WorkflowAction[] = [
          "approve",
          "reject",
          "return",
        ];

        if (checkerActions.includes(action)) {
          if (!application.makerId) {
            return failure(
              "A maker must prepare and submit the case first."
            );
          }

          if (application.makerId === actorId) {
            return failure(
              "Maker and checker must be different actors."
            );
          }

          // Fictional OTP only. No real SMS is sent.
          if (otp !== "123456") {
            return failure(
              "Invalid demo OTP. Use 123456."
            );
          }
        }

        const now = new Date().toISOString();

        set((state) => ({
          applications: state.applications.map((item) => {
            if (item.id !== id) return item;

            const updated: Application = {
              ...item,
              status: rule.to,
              updatedAt: now,
            };

            if (action === "prepare_selection") {
              updated.makerId = actorId;
              updated.checkerId = undefined;
            }

            if (checkerActions.includes(action)) {
              updated.checkerId = actorId;
            }

            if (action === "enroll") {
              updated.beneficiaryId =
                item.beneficiaryId ??
                `BEN-${item.id.split("-").pop()}`;
            }

            return updated;
          }),
          events: [
            ...state.events,
            makeEvent(id, action, actorId),
          ],
        }));

        return {
          ok: true,
          message: `${action.replaceAll(
            "_",
            " "
          )} completed successfully.`,
        };
      },

      resetDemo: () =>
        set({
          applications: initialApplications(),
          events: [],
        }),
    }),
    {
      name: "mcbp-demo-data-v1",
      version: 1,
    }
  )
);
