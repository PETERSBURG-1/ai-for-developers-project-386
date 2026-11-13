import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminPage } from "./AdminPage";

vi.mock("@calendar/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@calendar/api-client")>();
  return {
    ...actual,
    listMeetingTypes: vi.fn<() => Promise<unknown>>().mockResolvedValue({
      data: [
        {
          id: "intro-15",
          title: "Встреча 15 минут",
          description: "Короткий звонок",
          durationMinutes: 15,
        },
      ],
      error: undefined,
      response: { status: 200 },
    }),
    listBookings: vi.fn<() => Promise<unknown>>().mockResolvedValue({
      data: [
        {
          id: "booking-1",
          meetingTypeId: "intro-15",
          meetingType: {
            id: "intro-15",
            title: "Встреча 15 минут",
            description: "Короткий звонок",
            durationMinutes: 15,
          },
          start: "2026-11-15T06:00:00.000Z",
          end: "2026-11-15T06:15:00.000Z",
          guestName: "Анна",
          guestEmail: "anna@example.com",
          guestNotes: "Обсудить проект",
          createdAt: "2026-11-14T00:00:00.000Z",
        },
      ],
      error: undefined,
      response: { status: 200 },
    }),
  };
});

describe("AdminPage", () => {
  it("shows meeting types and upcoming bookings", async () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Встреча 15 минут")).toBeInTheDocument();
    expect(await screen.findByText("Анна")).toBeInTheDocument();
    expect(screen.getByText("anna@example.com")).toBeInTheDocument();
    expect(screen.getByText("Обсудить проект")).toBeInTheDocument();
  });
});
