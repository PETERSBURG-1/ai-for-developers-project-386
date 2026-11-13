import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MeetingTypeCard } from "./meeting-type-card";

describe("MeetingTypeCard", () => {
  it("shows the meeting type details and links to its calendar", () => {
    render(
      <MemoryRouter>
        <MeetingTypeCard
          meetingType={{
            id: "intro-15",
            title: "Встреча 15 минут",
            description: "Короткий звонок",
            durationMinutes: 15,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Встреча 15 минут")).toBeInTheDocument();
    expect(screen.getByText("15 минут")).toBeInTheDocument();
    expect(screen.getByText("Короткий звонок")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Выбрать время" })).toHaveAttribute(
      "href",
      "/book/intro-15",
    );
  });
});
