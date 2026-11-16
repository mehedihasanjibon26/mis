
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Topic = "nutrition" | "anc_pnc" | "child_development" | "hygiene";
export type TrainingStatus = "scheduled" | "completed" | "cancelled";

export interface TrainingSession {
  id: string;
  title: string;
  topic: Topic;
  date: string;
  union: string;
  venue: string;
  trainer: string;
  capacity: number;
  status: TrainingStatus;
  createdAt: string;
}

export interface Participation {
  id: string;
  sessionId: string;
  beneficiaryId: string;
  name: string;
  invited: boolean;
  attended: boolean;
  offlinePending: boolean;
  preScore: number | null;
  postScore: number | null;
  feedback: number | null;
  certificateId: string;
  updatedAt: string;
}

export interface TrainingLog {
  id: string;
  sessionId: string;
  beneficiaryId?: string;
  action: string;
  actor: string;
  date: string;
}

export type TrainingPerson = {
  id: string;
  name: string;
  union: string;
  active: boolean;
};

type Result = { ok: boolean; message: string };

interface TrainingState {
  sessions: TrainingSession[];
  participants: Participation[];
  logs: TrainingLog[];
  createSession: (
    data: Omit<TrainingSession, "id" | "status" | "createdAt">,
    actor: string
  ) => Result;
  enroll: (
    sessionId: string,
    people: TrainingPerson[],
    actor: string
  ) => Result;
  invite: (sessionId: string, actor: string) => Result;
  attendance: (
    sessionId: string,
    beneficiaryId: string,
    offline: boolean,
    actor: string
  ) => Result;
  syncOffline: (actor: string) => Result;
  assess: (
    participantId: string,
    pre: number,
    post: number,
    feedback: number,
    actor: string
  ) => Result;
  completeSession: (sessionId: string, actor: string) => Result;
  resetTraining: () => void;
}

const now = () => new Date().toISOString();
const outcome = (ok: boolean, message: string): Result => ({ ok, message });
const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const permitted = (role: string) =>
  ["trainer", "field", "uwao"].includes(role);

const seededSessions: TrainingSession[] = [
  {
    id: "TRN-2611-001",
    title: "Maternal Nutrition & Balanced Diet",
    topic: "nutrition",
    date: "2026-11-19",
    union: "Kaunia Sadar",
    venue: "Union Health Centre",
    trainer: "Demo Community Trainer",
    capacity: 30,
    status: "scheduled",
    createdAt: "2026-11-10T08:00:00Z",
  },
  {
    id: "TRN-2611-002",
    title: "ANC and PNC Awareness",
    topic: "anc_pnc",
    date: "2026-11-20",
    union: "Haragach",
    venue: "Community Clinic",
    trainer: "Demo Midwife",
    capacity: 25,
    status: "scheduled",
    createdAt: "2026-11-11T08:00:00Z",
  },
  {
    id: "TRN-2611-003",
    title: "Early Childhood Development",
    topic: "child_development",
    date: "2026-11-12",
    union: "Balarhat",
    venue: "Union Parishad Hall",
    trainer: "Demo Training Facilitator",
    capacity: 20,
    status: "completed",
    createdAt: "2026-11-03T08:00:00Z",
  },
];

const seededParticipants: Participation[] = [
  {
    id: "ATT-DEMO-001",
    sessionId: "TRN-2611-001",
    beneficiaryId: "BEN-2605-00113",
    name: "Ayesha Khatun",
    invited: true,
    attended: false,
    offlinePending: false,
    preScore: null,
    postScore: null,
    feedback: null,
    certificateId: "",
    updatedAt: "2026-11-10T09:00:00Z",
  },
  {
    id: "ATT-DEMO-002",
    sessionId: "TRN-2611-002",
    beneficiaryId: "BEN-2603-00138",
    name: "Rahima Begum",
    invited: true,
    attended: false,
    offlinePending: false,
    preScore: null,
    postScore: null,
    feedback: null,
    certificateId: "",
    updatedAt: "2026-11-11T09:00:00Z",
  },
];

const originalSessions = () => seededSessions.map((s) => ({ ...s }));
const originalParticipants = () => seededParticipants.map((p) => ({ ...p }));

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      sessions: originalSessions(),
      participants: originalParticipants(),
      logs: [],

      createSession: (data, actor) => {
        if (!["trainer", "uwao"].includes(actor))
          return outcome(false, "Trainer or UWAO role required.");
        if (!data.title.trim() || !data.date || !data.venue.trim() ||
            !data.union || !data.trainer.trim())
          return outcome(false, "Complete all required session details.");
        if (!Number.isInteger(data.capacity) || data.capacity < 1 ||
            data.capacity > 500)
          return outcome(false, "Capacity must be between 1 and 500.");
        if (actor === "trainer" && data.union === "Begumganj")
          return outcome(false, "Outside assigned demonstration area.");
        const id = makeId("TRN");
        set((s) => ({
          sessions: [{
            ...data, id, status: "scheduled", createdAt: now(),
          }, ...s.sessions],
          logs: [...s.logs, {
            id: makeId("TL"), sessionId: id,
            action: "session_created", actor, date: now(),
          }],
        }));
        return outcome(true, `Session ${id} created.`);
      },

      enroll: (sessionId, people, actor) => {
        if (!permitted(actor))
          return outcome(false, "Training staff role required.");
        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session || session.status !== "scheduled")
          return outcome(false, "Choose a scheduled session.");

        const existing = get().participants.filter(
          (p) => p.sessionId === sessionId
        );
        const eligible = people.filter(
          (person) =>
            person.active &&
            person.union === session.union &&
            !existing.some((p) => p.beneficiaryId === person.id)
        );

        const spaces = Math.max(0, session.capacity - existing.length);
        const selected = eligible.slice(0, spaces);
        if (!selected.length)
          return outcome(false, "No new eligible participants or session full.");

        const entries: Participation[] = selected.map((person) => ({
          id: makeId("ATT"),
          sessionId,
          beneficiaryId: person.id,
          name: person.name,
          invited: false,
          attended: false,
          offlinePending: false,
          preScore: null,
          postScore: null,
          feedback: null,
          certificateId: "",
          updatedAt: now(),
        }));

        set((s) => ({
          participants: [...s.participants, ...entries],
          logs: [...s.logs, {
            id: makeId("TL"), sessionId,
            action: `enrolled_${selected.length}`, actor, date: now(),
          }],
        }));
        return outcome(true, `${selected.length} participant(s) enrolled.`);
      },

      invite: (sessionId, actor) => {
        if (!permitted(actor))
          return outcome(false, "Training staff role required.");
        const matches = get().participants.filter(
          (p) => p.sessionId === sessionId && !p.invited
        );
        if (!matches.length)
          return outcome(false, "No uninvited participants.");
        set((s) => ({
          participants: s.participants.map((p) =>
            p.sessionId === sessionId ? { ...p, invited: true } : p
          ),
          logs: [...s.logs, {
            id: makeId("TL"), sessionId,
            action: `sms_preview_${matches.length}`, actor, date: now(),
          }],
        }));
        return outcome(true,
          `${matches.length} fictional SMS invitation(s) prepared. No SMS sent.`);
      },

      attendance: (sessionId, beneficiaryId, offline, actor) => {
        if (!permitted(actor))
          return outcome(false, "Trainer/field role required.");
        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session || session.status !== "scheduled")
          return outcome(false, "Attendance permitted for scheduled sessions.");
        const record = get().participants.find(
          (p) =>
            p.sessionId === sessionId &&
            p.beneficiaryId === beneficiaryId.trim()
        );
        if (!record)
          return outcome(false, "ID not enrolled in this session.");
        if (record.attended || record.offlinePending)
          return outcome(false, "Duplicate attendance blocked.");
        set((s) => ({
          participants: s.participants.map((p) =>
            p.id === record.id ? {
              ...p,
              attended: !offline,
              offlinePending: offline,
              updatedAt: now(),
            } : p
          ),
          logs: [...s.logs, {
            id: makeId("TL"), sessionId,
            beneficiaryId: record.beneficiaryId,
            action: offline ? "attendance_queued_offline" : "attendance_recorded",
            actor, date: now(),
          }],
        }));
        return outcome(true, offline
          ? "Attendance stored in simulated offline queue."
          : "Attendance recorded.");
      },

      syncOffline: (actor) => {
        if (!permitted(actor))
          return outcome(false, "Training staff role required.");
        const queued = get().participants.filter((p) => p.offlinePending);
        if (!queued.length) return outcome(false, "Offline queue empty.");
        set((s) => ({
          participants: s.participants.map((p) => p.offlinePending
            ? { ...p, attended: true, offlinePending: false, updatedAt: now() }
            : p),
          logs: [...s.logs, ...queued.map((p) => ({
            id: makeId("TL"),
            sessionId: p.sessionId,
            beneficiaryId: p.beneficiaryId,
            action: "offline_attendance_synced",
            actor, date: now(),
          }))],
        }));
        return outcome(true, `${queued.length} offline attendance(s) synced.`);
      },

      assess: (participantId, pre, post, feedback, actor) => {
        if (!permitted(actor))
          return outcome(false, "Training staff role required.");
        const record = get().participants.find((p) => p.id === participantId);
        if (!record || !record.attended || record.offlinePending)
          return outcome(false, "Synced attendance is required first.");
        if (![pre, post].every((n) => Number.isFinite(n) && n >= 0 && n <= 100) ||
            !Number.isInteger(feedback) || feedback < 1 || feedback > 5)
          return outcome(false, "Scores 0–100; feedback 1–5.");
        const session = get().sessions.find((s) => s.id === record.sessionId);
        if (!session) return outcome(false, "Session missing.");
        const certificateId = post >= 60
          ? `CERT-${session.id}-${record.beneficiaryId}`
          : "";
        set((s) => ({
          participants: s.participants.map((p) =>
            p.id === participantId ? {
              ...p, preScore: pre, postScore: post,
              feedback, certificateId, updatedAt: now(),
            } : p
          ),
          logs: [...s.logs, {
            id: makeId("TL"), sessionId: record.sessionId,
            beneficiaryId: record.beneficiaryId,
            action: certificateId ? "assessment_pass_certificate" : "assessment_recorded",
            actor, date: now(),
          }],
        }));
        return outcome(true, certificateId
          ? "Assessment passed. Printable certificate generated."
          : "Assessment saved. Post-test below 60; no certificate.");
      },

      completeSession: (sessionId, actor) => {
        if (!["trainer", "uwao"].includes(actor))
          return outcome(false, "Trainer/UWAO required.");
        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session || session.status !== "scheduled")
          return outcome(false, "Session not scheduled.");
        if (get().participants.some((p) =>
          p.sessionId === sessionId && p.offlinePending))
          return outcome(false, "Sync offline attendance first.");
        set((s) => ({
          sessions: s.sessions.map((item) =>
            item.id === sessionId ? { ...item, status: "completed" } : item
          ),
          logs: [...s.logs, {
            id: makeId("TL"), sessionId,
            action: "session_completed", actor, date: now(),
          }],
        }));
        return outcome(true, "Session completed and reports updated.");
      },

      resetTraining: () => set({
        sessions: originalSessions(),
        participants: originalParticipants(),
        logs: [],
      }),
    }),
    { name: "mcbp-training-v1", version: 1 }
  )
);
