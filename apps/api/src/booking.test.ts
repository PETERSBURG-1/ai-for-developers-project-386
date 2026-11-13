import { describe, expect, it } from "vitest";

import { buildApp } from "./app";
import { Store } from "./store";

const NOW = new Date("2026-11-14T00:00:00.000Z");

function setup() {
  const store = new Store(() => NOW);
  store.createMeetingType({
    id: "intro-15",
    title: "Встреча 15 минут",
    description: "Короткий тип события для быстрого слота",
    durationMinutes: 15,
  });

  return { app: buildApp({ store }), store };
}

async function createBooking(app: ReturnType<typeof buildApp>, start: string) {
  return app.inject({
    method: "POST",
    url: "/api/bookings",
    payload: {
      meetingTypeId: "intro-15",
      start,
      guestName: "Анна",
      guestEmail: "anna@example.com",
      guestNotes: "Обсудить проект",
    },
  });
}

describe("booking API", () => {
  it("lists meeting types and builds a 14-day availability window", async () => {
    const { app } = setup();

    const types = await app.inject({ method: "GET", url: "/api/meeting-types" });
    expect(types.statusCode).toBe(200);
    expect(types.json()).toEqual([
      {
        id: "intro-15",
        title: "Встреча 15 минут",
        description: "Короткий тип события для быстрого слота",
        durationMinutes: 15,
      },
    ]);

    const availability = await app.inject({
      method: "GET",
      url: "/api/meeting-types/intro-15/availability",
    });
    expect(availability.statusCode).toBe(200);
    const body = availability.json();
    expect(body.days).toHaveLength(14);
    expect(body.days[0].date).toBe("2026-11-15");
    expect(body.days[0].slots[0]).toMatchObject({
      start: "2026-11-15T06:00:00.000Z",
      end: "2026-11-15T06:15:00.000Z",
      available: true,
    });
    expect(body.days[0].slots.at(-1).end).toBe("2026-11-15T15:00:00.000Z");
  });

  it("creates a booking and marks the slot unavailable", async () => {
    const { app } = setup();

    const created = await createBooking(app, "2026-11-15T06:00:00.000Z");
    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({
      meetingTypeId: "intro-15",
      start: "2026-11-15T06:00:00.000Z",
      end: "2026-11-15T06:15:00.000Z",
      guestName: "Анна",
      guestEmail: "anna@example.com",
      guestNotes: "Обсудить проект",
    });

    const availability = await app.inject({
      method: "GET",
      url: "/api/meeting-types/intro-15/availability",
    });
    const firstSlot = availability.json().days[0].slots[0];
    expect(firstSlot.available).toBe(false);
    expect(availability.json().days[0].freeSlotsCount).toBe(35);
  });

  it("rejects an overlapping booking but allows the adjacent slot", async () => {
    const { app } = setup();

    expect((await createBooking(app, "2026-11-15T06:00:00.000Z")).statusCode).toBe(201);

    const conflict = await createBooking(app, "2026-11-15T06:00:00.000Z");
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json()).toEqual({
      error: {
        code: "slot_taken",
        message: "Этот слот уже занят",
      },
    });

    const adjacent = await createBooking(app, "2026-11-15T06:15:00.000Z");
    expect(adjacent.statusCode).toBe(201);
  });

  it("serializes concurrent bookings for the same slot", async () => {
    const { app } = setup();

    const responses = await Promise.all([
      createBooking(app, "2026-11-15T06:00:00.000Z"),
      createBooking(app, "2026-11-15T06:00:00.000Z"),
    ]);

    expect(responses.map((response) => response.statusCode).sort()).toEqual([201, 409]);
  });

  it("validates request data and reports unknown meeting types", async () => {
    const { app } = setup();

    const invalid = await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        meetingTypeId: "intro-15",
        start: "2026-11-15T06:00:00.000Z",
        guestName: "",
        guestEmail: "not-an-email",
      },
    });
    expect(invalid.statusCode).toBe(400);
    expect(invalid.json().error.code).toBe("validation_error");

    const missingType = await app.inject({
      method: "POST",
      url: "/api/bookings",
      payload: {
        meetingTypeId: "missing",
        start: "2026-11-15T06:00:00.000Z",
        guestName: "Анна",
        guestEmail: "anna@example.com",
      },
    });
    expect(missingType.statusCode).toBe(404);
    expect(missingType.json().error.code).toBe("meeting_type_not_found");
  });

  it("manages meeting types and prevents deleting a type with bookings", async () => {
    const { app } = setup();

    const updated = await app.inject({
      method: "PUT",
      url: "/api/meeting-types/intro-15",
      payload: {
        title: "Знакомство",
        description: "Короткий звонок",
        durationMinutes: 20,
      },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().title).toBe("Знакомство");

    const created = await app.inject({
      method: "POST",
      url: "/api/meeting-types",
      payload: {
        id: "deep-dive",
        title: "Глубокий разбор",
        description: "Больше времени",
        durationMinutes: 60,
      },
    });
    expect(created.statusCode).toBe(201);

    const deletedEmpty = await app.inject({
      method: "DELETE",
      url: "/api/meeting-types/deep-dive",
    });
    expect(deletedEmpty.statusCode).toBe(204);

    expect((await createBooking(app, "2026-11-15T06:00:00.000Z")).statusCode).toBe(201);

    const deletedBooked = await app.inject({
      method: "DELETE",
      url: "/api/meeting-types/intro-15",
    });
    expect(deletedBooked.statusCode).toBe(409);
    expect(deletedBooked.json().error.code).toBe("meeting_type_has_bookings");
  });

  it("lists only upcoming bookings sorted by start", async () => {
    const { app } = setup();

    await createBooking(app, "2026-11-16T06:00:00.000Z");
    await createBooking(app, "2026-11-15T06:00:00.000Z");

    const bookings = await app.inject({ method: "GET", url: "/api/bookings?upcoming=true" });
    expect(bookings.statusCode).toBe(200);
    expect(bookings.json().map((booking: { start: string }) => booking.start)).toEqual([
      "2026-11-15T06:00:00.000Z",
      "2026-11-16T06:00:00.000Z",
    ]);

    const withoutFlag = await app.inject({ method: "GET", url: "/api/bookings" });
    expect(withoutFlag.statusCode).toBe(400);

    const falseFlag = await app.inject({ method: "GET", url: "/api/bookings?upcoming=false" });
    expect(falseFlag.statusCode).toBe(200);

    const invalidFlag = await app.inject({ method: "GET", url: "/api/bookings?upcoming=no" });
    expect(invalidFlag.statusCode).toBe(400);
  });
});
