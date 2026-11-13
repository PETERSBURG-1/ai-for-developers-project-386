import { listMeetingTypes, type MeetingType } from "@calendar/api-client";
import { useEffect, useState } from "react";

import { MeetingTypeCard } from "@/components/meeting-type-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type LoadStatus = "loading" | "ready" | "error";

export function CatalogPage() {
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let active = true;

    listMeetingTypes()
      .then(({ data, error }) => {
        if (!active) {
          return;
        }

        if (error || !data) {
          setStatus("error");
          return;
        }

        setMeetingTypes(data);
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
  }, []);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 md:py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Запись на звонок
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Выберите тип встречи
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Подберите формат по теме и длительности — дальше останется выбрать удобное время.
        </p>
      </div>

      {status === "loading" && (
        <p className="mt-10 text-muted-foreground">Загружаем типы встреч…</p>
      )}

      {status === "error" && (
        <p className="mt-10 text-destructive" role="alert">
          Не удалось загрузить типы встреч. Обновите страницу и попробуйте ещё раз.
        </p>
      )}

      {status === "ready" && meetingTypes.length === 0 && (
        <Card className="mt-10 max-w-xl">
          <CardHeader>
            <CardTitle>Пока нет типов встреч</CardTitle>
            <CardDescription>
              Владелец ещё не опубликовал ни одного формата. Загляните позже.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      )}

      {status === "ready" && meetingTypes.length > 0 && (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {meetingTypes.map((meetingType) => (
            <MeetingTypeCard key={meetingType.id} meetingType={meetingType} />
          ))}
        </div>
      )}
    </section>
  );
}
