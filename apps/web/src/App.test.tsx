import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";

vi.mock("@calendar/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@calendar/api-client")>();
  return {
    ...actual,
    listMeetingTypes: vi.fn<() => Promise<unknown>>().mockResolvedValue({
      data: [],
      error: undefined,
      response: { status: 200 },
    }),
  };
});

function renderApp() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("shows the landing and opens the meeting type catalog", async () => {
    const user = userEvent.setup();
    renderApp();

    expect(
      screen.getByRole("heading", { level: 1, name: "Календарь звонков" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/без регистрации и лишних сообщений/i)).toBeInTheDocument();

    const bookingLinks = screen.getAllByRole("link", { name: "Записаться" });
    expect(bookingLinks.length).toBeGreaterThan(0);

    const firstBookingLink = bookingLinks[0];
    if (!firstBookingLink) {
      throw new Error("Expected a booking link");
    }

    await user.click(firstBookingLink);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Выберите тип встречи" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Пока нет типов встреч")).toBeInTheDocument();
  });
});
