import type { AvailabilityDay, Slot } from "@calendar/api-client";

import { formatDay, formatTime } from "@/lib/format";

interface AvailabilityCalendarProps {
  days: AvailabilityDay[];
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: Slot) => void;
  selectedDate: string | undefined;
  selectedSlot: string | undefined;
}

export function AvailabilityCalendar({
  days,
  onSelectDate,
  onSelectSlot,
  selectedDate,
  selectedSlot,
}: AvailabilityCalendarProps) {
  const currentDay = days.find((day) => day.date === selectedDate) ?? days[0];

  if (!currentDay) {
    return <p className="text-sm text-muted-foreground">Свободных дней пока нет.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div>
        <h2 className="text-lg font-semibold">Выберите день</h2>
        <div className="mt-4 grid gap-2">
          <ul aria-label="Дни" className="grid gap-2">
            {days.map((day) => (
              <li key={day.date}>
                <button
                  aria-pressed={day.date === currentDay.date}
                  className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:bg-muted aria-pressed:border-foreground aria-pressed:bg-muted"
                  onClick={() => onSelectDate(day.date)}
                  type="button"
                >
                  <span>{formatDay(day.date)}</span>
                  <span className="text-muted-foreground">{day.freeSlotsCount} свободно</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Слоты на {formatDay(currentDay.date)}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {currentDay.slots.map((slot) => (
            <button
              aria-pressed={slot.start === selectedSlot}
              className="rounded-lg border px-3 py-3 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground aria-pressed:border-foreground aria-pressed:bg-muted"
              disabled={!slot.available}
              key={slot.start}
              onClick={() => onSelectSlot(slot)}
              type="button"
            >
              <span className="block font-medium">{formatTime(slot.start)}</span>
              <span className="text-xs text-muted-foreground">
                {slot.available ? "Свободно" : "Занято"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
