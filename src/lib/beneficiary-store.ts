
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BeneficiaryStatus =
  | "active"
  | "suspended"
  | "graduated"
  | "exited"
  | "archived"
  | "erased";

export type ChangeAction =
  | "correction"
  | "transfer"
  | "suspend"
  | "reactivate"
  | "graduate"
  | "exit"
  | "archive"
  | "erase";

export interface Profile {
  id: string;
  applicationId: string;
  nameEn: string;
  nameBn: string;
  nidLast4: string;
  mobileLast3: string;
  district: string;
  upazila: string;
  union: string;
  child: string;
  household: string;
  started: string;
  monthsUsed: number;
  consent: boolean;
  status: BeneficiaryStatus;
  sample: boolean;
}

export interface ProfileChange {
  id: string;
  profileId: string;
  action: ChangeAction;
  before: string;
  after: string;
  reason: string;
  maker: string;
  checker?: string;
  state: "pending" | "approved" | "rejected";
  date: string;
  reviewedAt?: string;
}

export interface ProfileEvent {
  id: string;
  profileId: string;
  text: string;
  actor: string;
  date: string;
  before?: string;
  after?: string;
}

interface BeneficiaryState {
  changes: ProfileChange[];
  events: ProfileEvent[];
  overrides: Record<string, Partial<Profile>>;
  submitChange: (
    profile: Profile,
    action: ChangeAction,
    after: string,
    reason: string,
    actor: string
  ) => { ok: boolean; message: string };
  reviewChange: (
    requestId: string,
    approve: boolean,
    actor: string,
    otp: string
  ) => { ok: boolean; message: string };
  resetProfiles: () => void;
}

export const sampleProfiles: Profile[] = [
  {
    id: "BEN-2605-00113",
    applicationId: "APP-2605-00113",
    nameEn: "Ayesha Khatun",
    nameBn: "আয়েশা খাতুন",
    nidLast4: "3912",
    mobileLast3: "214",
    district: "Rangpur",
    upazila: "Kaunia",
    union: "Kaunia Sadar",
    child: "Sadia, 8 months",
    household: "4 members",
    started: "2026-05-01",
    monthsUsed: 7,
    consent: true,
    status: "active",
    sample: true,
  },
  {
    id: "BEN-2603-00138",
    applicationId: "APP-2603-00138",
    nameEn: "Rahima Begum",
    nameBn: "রহিমা বেগম",
    nidLast4: "5678",
    mobileLast3: "863",
    district: "Rangpur",
    upazila: "Kaunia",
    union: "Haragach",
    child: "Rafi, 1 year",
    household: "5 members",
    started: "2026-03-01",
    monthsUsed: 9,
    consent: true,
    status: "active",
    sample: true,
  },
  {
    id: "BEN-2508-00184",
    applicationId: "APP-2508-00184",
    nameEn: "Salma Akter",
    nameBn: "সালমা আক্তার",
    nidLast4: "9061",
    mobileLast3: "092",
    district: "Rangpur",
    upazila: "Kaunia",
    union: "Balarhat",
    child: "Nadia, 2 years",
    household: "3 members",
    started: "2025-08-01",
    monthsUsed: 16,
    consent: true,
    status: "suspended",
    sample: true,
  },
  {
    id: "BEN-2601-00201",
    applicationId: "APP-2601-00201",
    nameEn: "Farzana Yasmin",
    nameBn: "ফারজানা ইয়াসমিন",
    nidLast4: "1742",
    mobileLast3: "455",
    district: "Kurigram",
    upazila: "Ulipur",
    union: "Begumganj",
    child: "Rima, 10 months",
    household: "4 members",
    started: "2026-01-01",
    monthsUsed: 11,
    consent: true,
    status: "active",
    sample: true,
  },
];

const uniqueId = () =>
  `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const event = (
  profileId: string,
  text: string,
  actor: string,
  before?: string,
  after?: string
): ProfileEvent => ({
  id: uniqueId(),
  profileId,
  text,
  actor,
  date: new Date().toISOString(),
  before,
  after,
});

const allowedActions: Record<ChangeAction, BeneficiaryStatus[]> = {
  correction: ["active", "suspended"],
  transfer: ["active", "suspended"],
  suspend: ["active"],
  reactivate: ["suspended"],
  graduate: ["active"],
  exit: ["active", "suspended"],
  archive: ["graduated", "exited"],
  erase: ["archived"],
};

export const useBeneficiaryStore = create<BeneficiaryState>()(
  persist(
    (set, get) => ({
      changes: [],
      events: [],
      overrides: {},

      submitChange: (profile, action, after, reason, actor) => {
        if (actor !== "union_maker") {
          return { ok: false, message: "Union Maker role required." };
        }
        if (profile.status === "erased") {
          return { ok: false, message: "This record is erased." };
        }
        if (!allowedActions[action].includes(profile.status)) {
          return { ok: false, message: "Invalid lifecycle transition." };
        }
        if (!reason.trim()) {
          return { ok: false, message: "A reason is required." };
        }
        if (
          ["correction", "transfer"].includes(action) &&
          !after.trim()
        ) {
          return { ok: false, message: "Enter the proposed value." };
        }
        if (profile.upazila !== "Kaunia") {
          return { ok: false, message: "Outside assigned jurisdiction." };
        }
        if (
          get().changes.some(
            (item) =>
              item.profileId === profile.id && item.state === "pending"
          )
        ) {
          return { ok: false, message: "A request is already pending." };
        }

        const before =
          action === "correction"
            ? profile.nameEn
            : action === "transfer"
              ? profile.union
              : profile.status;

        const target =
          action === "correction" || action === "transfer"
            ? after.trim()
            : action === "reactivate"
              ? "active"
              : action === "suspend"
                ? "suspended"
                : action === "graduate"
                  ? "graduated"
                  : action === "exit"
                    ? "exited"
                    : action === "archive"
                      ? "archived"
                      : "erased";

        const request: ProfileChange = {
          id: uniqueId(),
          profileId: profile.id,
          action,
          before,
          after: target,
          reason: reason.trim(),
          maker: actor,
          state: "pending",
          date: new Date().toISOString(),
        };

        set((state) => ({
          changes: [...state.changes, request],
          events: [
            ...state.events,
            event(profile.id, `Request: ${action}`, actor, before, target),
          ],
        }));

        return { ok: true, message: "Change request sent for review." };
      },

      reviewChange: (requestId, approve, actor, otp) => {
        const request = get().changes.find((item) => item.id === requestId);
        if (!request || request.state !== "pending") {
          return { ok: false, message: "No pending request found." };
        }

        const requiredChecker =
          request.action === "archive" || request.action === "erase"
            ? "admin"
            : "uwao";

        if (actor !== requiredChecker || request.maker === actor) {
          return {
            ok: false,
            message: `Independent ${requiredChecker} checker required.`,
          };
        }
        if (otp !== "123456") {
          return { ok: false, message: "Demo OTP must be 123456." };
        }

        const patch: Partial<Profile> = {};
        if (approve) {
          if (request.action === "correction") {
            patch.nameEn = request.after;
          } else if (request.action === "transfer") {
            patch.union = request.after;
          } else {
            patch.status = request.after as BeneficiaryStatus;
          }
        }

        set((state) => ({
          changes: state.changes.map((item) =>
            item.id === requestId
              ? {
                  ...item,
                  state: approve ? "approved" : "rejected",
                  checker: actor,
                  reviewedAt: new Date().toISOString(),
                }
              : item
          ),
          overrides: approve
            ? {
                ...state.overrides,
                [request.profileId]: {
                  ...(state.overrides[request.profileId] ?? {}),
                  ...patch,
                },
              }
            : state.overrides,
          events: [
            ...state.events,
            event(
              request.profileId,
              `${request.action}: ${approve ? "approved" : "rejected"}`,
              actor,
              request.before,
              approve ? request.after : request.before
            ),
          ],
        }));

        return { ok: true, message: "Checker decision recorded." };
      },

      resetProfiles: () =>
        set({
          changes: [],
          events: [],
          overrides: {},
        }),
    }),
    {
      name: "mcbp-beneficiary-v1",
      version: 1,
    }
  )
);
