import {
  deleteMeetingType,
  listBookings,
  listMeetingTypes,
  type Booking,
  type MeetingType,
} from "@calendar/api-client";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { editMeetingTypePath, routes } from "@/routes";

async function fetchAdminData() {
  return Promise.all([listMeetingTypes(), listBookings({ query: { upcoming: true } })]);
}

export function AdminPage() {
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  function applyData(nextTypes: MeetingType[], nextBookings: Booking[]) {
    setMeetingTypes(nextTypes);
    setBookings(nextBookings);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    fetchAdminData()
      .then(([typesResult, bookingsResult]) => {
        if (!active) {
          return;
        }

        if (
          typesResult.error ||
          !typesResult.data ||
          bookingsResult.error ||
          !bookingsResult.data
        ) {
          setError("Не удалось загрузить данные админки.");
          setLoading(false);
          return;
        }

        applyData(typesResult.data, bookingsResult.data);
      })
      .catch(() => {
        if (active) {
          setError("Не удалось загрузить данные админки.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(meetingTypeId: string) {
    if (!window.confirm("Удалить этот тип встречи?")) {
      return;
    }

    setError(undefined);
    const result = await deleteMeetingType({ path: { meetingTypeId } });

    if (result.error) {
      setError(result.error.error.message);
      return;
    }

    const [typesResult, bookingsResult] = await fetchAdminData();
    if (typesResult.data && bookingsResult.data) {
      applyData(typesResult.data, bookingsResult.data);
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Админка
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Календарь владельца</h1>
        </div>
        <Button asChild>
          <Link to={routes.adminNewType}>Добавить тип встречи</Link>
        </Button>
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-10 text-muted-foreground">Загружаем данные…</p>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold">Типы встреч</h2>
            <div className="mt-4 space-y-3">
              {meetingTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">Типов встреч пока нет.</p>
              )}
              {meetingTypes.map((meetingType) => (
                <Card key={meetingType.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{meetingType.title}</CardTitle>
                    <CardDescription>{meetingType.durationMinutes} минут</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={editMeetingTypePath(meetingType.id)}>Редактировать</Link>
                    </Button>
                    <Button
                      onClick={() => void handleDelete(meetingType.id)}
                      size="sm"
                      variant="destructive"
                    >
                      Удалить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Предстоящие записи</h2>
            <div className="mt-4 space-y-3">
              {bookings.length === 0 && (
                <p className="text-sm text-muted-foreground">Предстоящих записей нет.</p>
              )}
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{formatDateTime(booking.start)}</CardTitle>
                    <CardDescription>
                      {booking.meetingType.title} · {booking.meetingType.durationMinutes} минут
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="font-medium">{booking.guestName}</p>
                    <p className="text-muted-foreground">{booking.guestEmail}</p>
                    {booking.guestNotes && (
                      <p className="text-muted-foreground">{booking.guestNotes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
