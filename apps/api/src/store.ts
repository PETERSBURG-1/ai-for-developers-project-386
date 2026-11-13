import { randomUUID } from "node:crypto";

import type {
  AvailabilityResponse,
  Booking,
  CreateBookingRequest,
  CreateMeetingTypeRequest,
  MeetingType,
  UpdateMeetingTypeRequest,
} from "@calendar/api-client";

import { AppError } from "./errors";
import { buildAvailability, findSlot, type TimeInterval } from "./slots";

export type StoredBooking = Omit<Booking, "meetingType">;

export class Store {
  private readonly meetingTypes = new Map<string, MeetingType>();
  private readonly bookings: StoredBooking[] = [];
  private bookingQueue: Promise<void> = Promise.resolve();

  constructor(private readonly clock: () => Date = () => new Date()) {}

  listMeetingTypes(): MeetingType[] {
    return [...this.meetingTypes.values()].sort((left, right) =>
      left.title.localeCompare(right.title, "ru"),
    );
  }

  getMeetingType(id: string): MeetingType {
    const meetingType = this.meetingTypes.get(id);
    if (!meetingType) {
      throw new AppError(404, "meeting_type_not_found", `Тип встречи «${id}» не найден`);
    }

    return meetingType;
  }

  createMeetingType(input: CreateMeetingTypeRequest): MeetingType {
    this.assertDuration(input.durationMinutes);

    if (this.meetingTypes.has(input.id)) {
      throw new AppError(409, "meeting_type_exists", `Тип встречи «${input.id}» уже существует`);
    }

    const meetingType: MeetingType = { ...input };
    this.meetingTypes.set(meetingType.id, meetingType);
    return meetingType;
  }

  updateMeetingType(id: string, input: UpdateMeetingTypeRequest): MeetingType {
    this.assertDuration(input.durationMinutes);
    const current = this.getMeetingType(id);
    const meetingType: MeetingType = { ...current, ...input };
    this.meetingTypes.set(id, meetingType);
    return meetingType;
  }

  deleteMeetingType(id: string): void {
    this.getMeetingType(id);

    if (this.bookings.some((booking) => booking.meetingTypeId === id)) {
      throw new AppError(
        409,
        "meeting_type_has_bookings",
        "Нельзя удалить тип встречи, у которого есть записи",
      );
    }

    this.meetingTypes.delete(id);
  }

  getAvailability(id: string, now: Date = this.clock()): AvailabilityResponse {
    return buildAvailability(this.getMeetingType(id), this.bookings, now);
  }

  createBooking(input: CreateBookingRequest): Promise<Booking> {
    const operation = this.bookingQueue.then(() => this.createBookingNow(input));
    this.bookingQueue = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  listBookings(upcomingOnly = false, now: Date = this.clock()): Booking[] {
    const nowMs = now.getTime();

    return this.bookings
      .filter((booking) => !upcomingOnly || Date.parse(booking.start) >= nowMs)
      .sort((left, right) => Date.parse(left.start) - Date.parse(right.start))
      .map((booking) => ({
        ...booking,
        meetingType: this.getMeetingType(booking.meetingTypeId),
      }));
  }

  private assertDuration(durationMinutes: number): void {
    if (durationMinutes % 5 !== 0) {
      throw new AppError(400, "validation_error", "Длительность должна быть кратна 5 минутам", [
        "durationMinutes: должно быть кратно 5",
      ]);
    }
  }

  private createBookingNow(input: CreateBookingRequest): Booking {
    const meetingType = this.getMeetingType(input.meetingTypeId);
    const now = this.clock();
    const slot = findSlot(meetingType, this.bookings, input.start, now);

    if (!slot) {
      throw new AppError(400, "slot_not_available", "Выбранное время недоступно");
    }

    if (!slot.available) {
      throw new AppError(409, "slot_taken", "Этот слот уже занят");
    }

    const startMs = Date.parse(slot.start);
    const endMs = Date.parse(slot.end);
    const conflict = this.bookings.some((booking) => {
      const bookingStart = Date.parse(booking.start);
      const bookingEnd = Date.parse(booking.end);
      return startMs < bookingEnd && endMs > bookingStart;
    });

    if (conflict) {
      throw new AppError(409, "slot_taken", "Этот слот уже занят");
    }

    const booking: StoredBooking = {
      id: randomUUID(),
      meetingTypeId: meetingType.id,
      start: slot.start,
      end: slot.end,
      guestName: input.guestName.trim(),
      guestEmail: input.guestEmail.trim(),
      createdAt: new Date(now).toISOString(),
      ...(input.guestNotes ? { guestNotes: input.guestNotes.trim() } : {}),
    };

    this.bookings.push(booking);
    return { ...booking, meetingType };
  }
}

export type { TimeInterval };
