import { Navigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  type Event,
  type EventPropGetter,
  type SlotInfo,
} from "react-big-calendar";
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop";
import {
  addMinutes,
  areIntervalsOverlapping,
  format,
  getDay,
  parse,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import AuthLayout from "../components/AuthLayout";
import AuthHeading from "../components/AuthHeading";
import { useAuth } from "../context/AuthContext";
import type { FreeTimeSlot, SerializedFreeTimeSlot } from "../types/schedule";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

type DragAndDropEvent = Parameters<
  NonNullable<withDragAndDropProps<FreeTimeSlot, Event>["onEventDrop"]>
>[0];

type ResizeEvent = Parameters<
  NonNullable<withDragAndDropProps<FreeTimeSlot, Event>["onEventResize"]>
>[0];

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse: (value, formatString) => parse(value, formatString, new Date()),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const STORAGE_KEY = "interlink.schedule.freeTimeSlots";
const SLOT_MINUTES = 30;
const SLOT_COLORS = [
  "#bae6fd",
  "#c7d2fe",
  "#fbcfe8",
  "#fde68a",
  "#bbf7d0",
  "#fecaca",
];

const DnDCalendar = withDragAndDrop<FreeTimeSlot>(Calendar);

const normalizeSlot = (start: Date, end: Date) => {
  if (start >= end) {
    return { start, end: addMinutes(start, SLOT_MINUTES) };
  }

  return { start, end };
};

const serializeSlots = (slots: FreeTimeSlot[]): SerializedFreeTimeSlot[] =>
  slots.map((slot) => ({
    ...slot,
    start: slot.start.toISOString(),
    end: slot.end.toISOString(),
  }));

const deserializeSlots = (
  slots: SerializedFreeTimeSlot[]
): FreeTimeSlot[] =>
  slots.map((slot) => ({
    ...slot,
    start: new Date(slot.start),
    end: new Date(slot.end),
  }));

const getNextColor = (index: number) =>
  SLOT_COLORS[index % SLOT_COLORS.length];

const createSlotId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `slot-${Math.random().toString(36).slice(2, 10)}`;
};

const SchedulePage = () => {
  const { user } = useAuth();
  const [freeTimeSlots, setFreeTimeSlots] = useState<FreeTimeSlot[]>(() => {
    if (typeof window === "undefined") return [];

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
      return deserializeSlots(JSON.parse(stored) as SerializedFreeTimeSlot[]);
    } catch (error) {
      console.warn("[SchedulePage] Failed to parse stored schedule", error);
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(serializeSlots(freeTimeSlots))
    );
  }, [freeTimeSlots]);

  const scheduleSummary = useMemo(
    () =>
      freeTimeSlots
        .slice()
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .map((slot) => ({
          id: slot.id,
          day: format(slot.start, "EEEE"),
          start: format(slot.start, "p"),
          end: format(slot.end, "p"),
          durationMinutes: Math.round(
            (slot.end.getTime() - slot.start.getTime()) / (1000 * 60)
          ),
        })),
    [freeTimeSlots]
  );

  const eventPropGetter = useCallback<
    EventPropGetter<FreeTimeSlot>
  >((event) => {
    return {
      style: {
        backgroundColor: event.color ?? "#bae6fd",
        border: "none",
        borderRadius: "14px",
        color: "#0f172a",
        display: "block",
        padding: "4px 8px",
      },
    };
  }, []);

  const handleSelectSlot = useCallback(
    ({ start, end, action }: SlotInfo) => {
      if (action !== "select") return;

      const { start: nextStart, end: nextEnd } = normalizeSlot(
        start as Date,
        end as Date
      );

      const overlaps = freeTimeSlots.some((slot) =>
        areIntervalsOverlapping(
          { start: slot.start, end: slot.end },
          { start: nextStart, end: nextEnd },
          { inclusive: false }
        )
      );

      if (overlaps) {
        window.alert(
          "This time overlaps with an existing free slot. Move or resize the original slot instead."
        );
        return;
      }

      setFreeTimeSlots((prev) => [
        ...prev,
        {
          id: createSlotId(),
          title: "Free Time",
          start: nextStart,
          end: nextEnd,
          color: getNextColor(prev.length),
        },
      ]);
    },
    [freeTimeSlots]
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: DragAndDropEvent) => {
      const { start: nextStart, end: nextEnd } = normalizeSlot(
        start as Date,
        end as Date
      );

      setFreeTimeSlots((prev) =>
        prev.map((slot) =>
          slot.id === event.id
            ? {
                ...slot,
                start: nextStart,
                end: nextEnd,
              }
            : slot
        )
      );
    },
    []
  );

  const handleEventResize = useCallback(
    ({ event, start, end }: ResizeEvent) => {
      const { start: nextStart, end: nextEnd } = normalizeSlot(
        start as Date,
        end as Date
      );

      setFreeTimeSlots((prev) =>
        prev.map((slot) =>
          slot.id === event.id
            ? {
                ...slot,
                start: nextStart,
                end: nextEnd,
              }
            : slot
        )
      );
    },
    []
  );

  const handleSelectEvent = useCallback((event: FreeTimeSlot) => {
    const shouldDelete = window.confirm(
      "Remove this free time slot from your schedule?"
    );
    if (!shouldDelete) return;

    setFreeTimeSlots((prev) => prev.filter((slot) => slot.id !== event.id));
  }, []);

  const handleClearSchedule = useCallback(() => {
    const shouldClear = window.confirm(
      "Clear all saved free time slots from your schedule?"
    );
    if (!shouldClear) return;
    setFreeTimeSlots([]);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthLayout>
      <div className="flex w-full flex-col gap-10 px-2 pb-16">
        <div className="relative flex w-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/95 px-6 py-10 shadow-[0_30px_90px_-40px_rgba(15,118,110,0.45)] sm:px-10 sm:py-12">
          <AuthHeading
            eyebrow="Availability"
            title="Weekly Free Time"
            description="Drag and drop to add free slots to your weekly calendar. Each slot is stored locally so you can revisit and adjust at any time."
          />

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 rounded-3xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-200/60">
              <DnDCalendar
                localizer={localizer}
                events={freeTimeSlots}
                view={Views.WEEK}
                defaultView={Views.WEEK}
                min={new Date(1970, 1, 1, 6, 0)}
                max={new Date(1970, 1, 1, 22, 0)}
                step={SLOT_MINUTES}
                timeslots={2}
                selectable
                resizable
                popup
                onSelectSlot={handleSelectSlot}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventPropGetter}
                messages={{
                  week: "Week",
                  work_week: "Work Week",
                  day: "Day",
                  month: "Month",
                  previous: "Back",
                  next: "Next",
                  today: "Today",
                }}
                components={{
                  toolbar: (props) => (
                    <div className="mb-3 flex flex-col gap-3 border-b border-sky-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => props.onNavigate("TODAY")}
                          className="rounded-full border border-sky-200 px-4 py-1 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => props.onNavigate("PREV")}
                          className="rounded-full border border-sky-200 px-3 py-1 text-sm text-sky-700 transition hover:bg-sky-50"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => props.onNavigate("NEXT")}
                          className="rounded-full border border-sky-200 px-3 py-1 text-sm text-sky-700 transition hover:bg-sky-50"
                        >
                          →
                        </button>
                      </div>
                      <div className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-400">
                        {format(props.date, "MMMM d, yyyy")}
                      </div>
                    </div>
                  ),
                }}
                style={{ height: "100%", minHeight: "540px" }}
              />
            </div>

            <div className="flex w-full max-w-sm flex-col gap-4 self-start rounded-3xl border border-sky-100 bg-slate-50/80 p-5 text-left text-sm text-slate-600 shadow-inner shadow-sky-200/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
                  Saved Slots
                </span>
                <button
                  type="button"
                  onClick={handleClearSchedule}
                  disabled={freeTimeSlots.length === 0}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  Clear all
                </button>
              </div>

              {scheduleSummary.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-sky-200 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                  Click and drag on the calendar to mark when you're free. Slots
                  will appear here and remain saved locally.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {scheduleSummary.map((slot) => (
                    <li
                      key={slot.id}
                      className="rounded-2xl border border-sky-200 bg-white/90 px-4 py-3 shadow-sm shadow-sky-200/30"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
                        <span>{slot.day}</span>
                        <span>{slot.durationMinutes} min</span>
                      </div>
                      <div className="mt-1 text-base font-medium text-slate-900">
                        {slot.start} – {slot.end}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="rounded-2xl border border-sky-100 bg-white/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
                  Data Structure
                </div>
                <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-900/90 p-3 font-mono text-xs leading-5 text-sky-100">
                  {JSON.stringify(serializeSlots(freeTimeSlots), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SchedulePage;

