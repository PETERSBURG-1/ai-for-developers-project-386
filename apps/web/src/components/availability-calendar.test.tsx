import { render, screen, within } from "@testing-library/react";
import type { Slot } from "@calendar/api-client";
import { describe, expect, it, vi } from "vitest";

import { AvailabilityCalendar } from "./availability-calendar";

const days = [
  {
    date: "2026-11-15",
    freeSlotsCount: 1,
    slots: [
      {
        start: "2026-11-15T06:00:00.000Z",
        end: "2026-11-15T06:15:00.000Z",
        available: true,
      },
      {
        start: "2026-11-15T06:15:00.000Z",
        end: "2026-11-15T06:30:00.000Z",
        available: false,
      },
    ],
  },
];

describe("AvailabilityCalendar", () => {
  it("shows free slot counts and disables occupied slots", () => {
    render(
      <AvailabilityCalendar
        days={days}
        onSelectDate={vi.fn<(date: string) => void>()}
        onSelectSlot={vi.fn<(slot: Slot) => void>()}
        selectedDate="2026-11-15"
        selectedSlot={undefined}
      />,
    );

    expect(screen.getByText("1 свободно")).toBeInTheDocument();

    const freeSlot = screen.getByRole("button", { name: /09:00/ });
    expect(freeSlot).toBeEnabled();
    expect(within(freeSlot).getByText("Свободно")).toBeInTheDocument();

    const occupiedSlot = screen.getByRole("button", { name: /09:15/ });
    expect(occupiedSlot).toBeDisabled();
    expect(within(occupiedSlot).getByText("Занято")).toBeInTheDocument();
  });
});
