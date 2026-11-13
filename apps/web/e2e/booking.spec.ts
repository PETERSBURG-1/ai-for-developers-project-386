import { expect, test } from "@playwright/test";

const meetingTypeId = `e2e-${Date.now()}`;
const meetingTypeTitle = "E2E встреча";
const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Europe/Moscow",
  hour: "2-digit",
  minute: "2-digit",
});

test.describe.configure({ mode: "serial" });

test("guest books a slot and owner sees the booking", async ({ page, request }) => {
  const created = await request.post("/api/meeting-types", {
    data: {
      id: meetingTypeId,
      title: meetingTypeTitle,
      description: "Тип встречи для браузерного сценария",
      durationMinutes: 15,
    },
  });
  expect(created.status()).toBe(201);

  await page.goto("/book");
  await page.locator(`a[href="/book/${meetingTypeId}"]`).click();
  await expect(page.getByRole("heading", { name: meetingTypeTitle })).toBeVisible();

  await page.locator('ul[aria-label="Дни"] button').nth(1).click();
  await page
    .getByRole("button", { name: /Свободно/ })
    .first()
    .click();
  await page.getByRole("textbox", { name: "Имя" }).fill("Тестовый гость");
  await page.getByRole("textbox", { name: "Email" }).fill("guest@example.com");
  await page.getByRole("textbox", { name: "Заметка" }).fill("Проверка записи");
  await page.getByRole("button", { name: "Подтвердить запись" }).click();

  await expect(page.getByText("Вы записаны")).toBeVisible();
  await expect(page.getByText(meetingTypeTitle, { exact: false }).first()).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByText(meetingTypeTitle).first()).toBeVisible();
  await expect(page.getByText("Тестовый гость").first()).toBeVisible();
  await expect(page.getByText("guest@example.com").first()).toBeVisible();
});

test("guest sees a conflict when the slot is taken concurrently", async ({ page, request }) => {
  const availabilityResponse = await request.get(
    `/api/meeting-types/${meetingTypeId}/availability`,
  );
  expect(availabilityResponse.status()).toBe(200);
  const availability = await availabilityResponse.json();
  const firstDay = availability.days[0];
  const slot = firstDay?.slots.find((candidate: { available: boolean }) => candidate.available);

  expect(slot).toBeTruthy();

  await page.goto(`/book/${meetingTypeId}`);
  const timeLabel = timeFormatter.format(new Date(slot.start));
  const slotButton = page.getByRole("button", {
    name: new RegExp(`${timeLabel}\\s*Свободно`),
  });
  await expect(slotButton).toBeVisible();
  await slotButton.click();

  await page.getByRole("textbox", { name: "Имя" }).fill("Второй гость");
  await page.getByRole("textbox", { name: "Email" }).fill("second@example.com");

  const booked = await request.post("/api/bookings", {
    data: {
      meetingTypeId,
      start: slot.start,
      guestName: "Другой гость",
      guestEmail: "other@example.com",
    },
  });
  expect(booked.status()).toBe(201);

  await page.getByRole("button", { name: "Подтвердить запись" }).click();

  await expect(page.getByRole("alert")).toContainText("уже занят");
});
