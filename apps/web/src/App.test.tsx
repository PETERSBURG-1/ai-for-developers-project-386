import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "./App";

function renderApp() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("shows the service landing and leads to the booking page", async () => {
    const user = userEvent.setup();
    renderApp();

    expect(
      screen.getByRole("heading", { level: 1, name: "Календарь звонков" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/без регистрации и лишних сообщений/i)).toBeInTheDocument();

    const bookingLinks = screen.getAllByRole("link", { name: "Записаться" });
    expect(bookingLinks.length).toBeGreaterThan(0);
    for (const link of bookingLinks) {
      expect(link).toHaveAttribute("href", "/book");
    }

    const firstBookingLink = bookingLinks[0];
    if (!firstBookingLink) {
      throw new Error("Expected a booking link");
    }

    await user.click(firstBookingLink);

    expect(screen.getByRole("heading", { level: 1, name: "Запись на звонок" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "На главную" })).toHaveAttribute("href", "/");
  });
});
