import type { AvailabilityResponse, MeetingType, Slot } from "@calendar/api-client";

export const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;
export const WINDOW_DAYS = 14;

export interface TimeInterval {
  start: string;
  end: string;
}

function overlaps(start: number, end: number, interval: TimeInterval): boolean {
  return start < Date.parse(interval.end) && end > Date.parse(interval.start);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function buildAvailability(
  meetingType: MeetingType,
  bookings: readonly TimeInterval[],
  now: Date = new Date(),
): AvailabilityResponse {
  const moscowNow = new Date(now.getTime() + MOSCOW_OFFSET_MS);
  const baseYear = moscowNow.getUTCFullYear();
  const baseMonth = moscowNow.getUTCMonth();
  const baseDate = moscowNow.getUTCDate();
  const durationMs = meetingType.durationMinutes * 60_000;
  const days: AvailabilityResponse["days"] = [];

  for (let offset = 1; offset <= WINDOW_DAYS; offset += 1) {
    const day = new Date(Date.UTC(baseYear, baseMonth, baseDate + offset));
    const year = day.getUTCFullYear();
    const month = day.getUTCMonth();
    const date = day.getUTCDate();
    const dayStart = Date.UTC(year, month, date, WORK_START_HOUR) - MOSCOW_OFFSET_MS;
    const dayEnd = Date.UTC(year, month, date, WORK_END_HOUR) - MOSCOW_OFFSET_MS;
    const slots: Slot[] = [];

    for (let start = dayStart; start + durationMs <= dayEnd; start += durationMs) {
      const end = start + durationMs;
      slots.push({
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        available: !bookings.some((booking) => overlaps(start, end, booking)),
      });
    }

    days.push({
      date: `${year}-${pad(month + 1)}-${pad(date)}`,
      freeSlotsCount: slots.filter((slot) => slot.available).length,
      slots,
    });
  }

  return { days };
}

export function findSlot(
  meetingType: MeetingType,
  bookings: readonly TimeInterval[],
  start: string,
  now: Date = new Date(),
): Slot | undefined {
  const requestedStart = Date.parse(start);
  if (Number.isNaN(requestedStart)) {
    return undefined;
  }

  return buildAvailability(meetingType, bookings, now)
    .days.flatMap((day) => day.slots)
    .find((slot) => Date.parse(slot.start) === requestedStart);
}
