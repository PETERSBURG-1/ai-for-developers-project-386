import {
  createBooking,
  getAvailability,
  getMeetingType,
  type AvailabilityDay,
  type Booking,
  type MeetingType,
  type Slot,
} from "@calendar/api-client";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { AvailabilityCalendar } from "@/components/availability-calendar";
import { InputField, TextAreaField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/routes";

type LoadStatus = "loading" | "ready" | "error";

export function MeetingTypePage() {
  const { meetingTypeId } = useParams<{ meetingTypeId: string }>();
  const [meetingType, setMeetingType] = useState<MeetingType>();
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedSlot, setSelectedSlot] = useState<Slot>();
  const [status, setStatus] = useState<LoadStatus>(meetingTypeId ? "loading" : "error");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [booking, setBooking] = useState<Booking>();
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!meetingTypeId) {
      return;
    }

    let active = true;

    Promise.all([
      getMeetingType({ path: { meetingTypeId } }),
      getAvailability({ path: { meetingTypeId } }),
    ])
      .then(([meetingTypeResult, availabilityResult]) => {
        if (!active) {
          return;
        }

        if (meetingTypeResult.error || !meetingTypeResult.data || availabilityResult.error) {
          setStatus("error");
          return;
        }

        setMeetingType(meetingTypeResult.data);
        setDays(availabilityResult.data?.days ?? []);
        setSelectedDate(availabilityResult.data?.days[0]?.date);
        setStatus("ready");
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [meetingTypeId]);

  async function refreshAvailability() {
    if (!meetingTypeId) {
      return;
    }

    const result = await getAvailability({ path: { meetingTypeId } });
    if (result.data) {
      setDays(result.data.days);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!meetingTypeId || !selectedSlot) {
      return;
    }

    setSubmitting(true);
    setFormError(undefined);

    const result = await createBooking({
      body: {
        meetingTypeId,
        start: selectedSlot.start,
        guestName,
        guestEmail,
        ...(guestNotes ? { guestNotes } : {}),
      },
    });

    setSubmitting(false);

    if (result.error) {
      setFormError(result.error.error.message);
      if (result.error.error.code === "slot_taken") {
        await refreshAvailability();
      }
      return;
    }

    if (result.data) {
      setBooking(result.data);
      setSelectedSlot(undefined);
      setGuestName("");
      setGuestEmail("");
      setGuestNotes("");
      await refreshAvailability();
    }
  }

  if (!meetingTypeId) {
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-destructive" role="alert">
          Тип встречи не выбран.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link to={routes.booking}>Вернуться в каталог</Link>
        </Button>
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <p className="text-muted-foreground">Загружаем календарь…</p>
      </section>
    );
  }

  if (status === "error" || !meetingType) {
    return (
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="text-destructive" role="alert">
          Не удалось загрузить тип встречи.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link to={routes.booking}>Вернуться в каталог</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <Link className="text-sm text-muted-foreground hover:text-foreground" to={routes.booking}>
        ← Все типы встреч
      </Link>

      <div className="mt-6 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">{meetingType.title}</h1>
        <p className="mt-2 text-muted-foreground">
          {meetingType.description || "Описание появится позже."}
        </p>
        <p className="mt-2 text-sm font-medium">{meetingType.durationMinutes} минут</p>
      </div>

      {booking ? (
        <Card className="mt-10 max-w-xl">
          <CardHeader>
            <CardTitle>Вы записаны</CardTitle>
            <CardDescription>
              {booking.meetingType.title}, {formatDateTime(booking.start)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Мы сохранили запись для {booking.guestName}. Владелец увидит её в админке.
            </p>
            <Button asChild variant="outline">
              <Link to={routes.booking}>Выбрать другой тип встречи</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-10">
          <AvailabilityCalendar
            days={days}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot(undefined);
              setFormError(undefined);
            }}
            onSelectSlot={setSelectedSlot}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot?.start}
          />

          {selectedSlot && (
            <Card className="mt-8 max-w-xl">
              <CardHeader>
                <CardTitle>Подтвердите запись</CardTitle>
                <CardDescription>
                  {formatDateTime(selectedSlot.start)} · {meetingType.durationMinutes} минут
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <InputField
                    autoComplete="name"
                    label="Имя"
                    onChange={(event) => setGuestName(event.target.value)}
                    required
                    value={guestName}
                  />
                  <InputField
                    autoComplete="email"
                    label="Email"
                    onChange={(event) => setGuestEmail(event.target.value)}
                    required
                    type="email"
                    value={guestEmail}
                  />
                  <TextAreaField
                    label="Заметка"
                    onChange={(event) => setGuestNotes(event.target.value)}
                    placeholder="Что хотите обсудить?"
                    value={guestNotes}
                  />
                  {formError && (
                    <p className="text-sm text-destructive" role="alert">
                      {formError}
                    </p>
                  )}
                  <Button disabled={submitting} type="submit">
                    {submitting ? "Сохраняем…" : "Подтвердить запись"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
