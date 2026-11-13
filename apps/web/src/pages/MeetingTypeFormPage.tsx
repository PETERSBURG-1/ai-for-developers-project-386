import {
  createMeetingType,
  getMeetingType,
  updateMeetingType,
  type CreateMeetingTypeRequest,
} from "@calendar/api-client";
import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { InputField, TextAreaField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { routes } from "@/routes";

interface FormState {
  description: string;
  durationMinutes: number;
  id: string;
  title: string;
}

const emptyForm: FormState = {
  id: "",
  title: "",
  description: "",
  durationMinutes: 15,
};

export function MeetingTypeFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    getMeetingType({ path: { meetingTypeId: id } })
      .then(({ data, error: fetchError }) => {
        if (!active) {
          return;
        }

        if (fetchError || !data) {
          setError("Не удалось загрузить тип встречи.");
          setLoading(false);
          return;
        }

        setForm({
          id: data.id,
          title: data.title,
          description: data.description,
          durationMinutes: data.durationMinutes,
        });
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError("Не удалось загрузить тип встречи.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);

    const payload: CreateMeetingTypeRequest = {
      id: form.id,
      title: form.title,
      description: form.description,
      durationMinutes: form.durationMinutes,
    };

    const result = id
      ? await updateMeetingType({
          path: { meetingTypeId: id },
          body: {
            title: form.title,
            description: form.description,
            durationMinutes: form.durationMinutes,
          },
        })
      : await createMeetingType({ body: payload });

    setSaving(false);

    if (result.error) {
      setError(result.error.error.message);
      return;
    }

    navigate(routes.admin);
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16">
      <Link className="text-sm text-muted-foreground hover:text-foreground" to={routes.admin}>
        ← В админку
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {id ? "Редактировать тип встречи" : "Новый тип встречи"}
      </h1>

      {loading ? (
        <p className="mt-8 text-muted-foreground">Загружаем тип встречи…</p>
      ) : (
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <InputField
            disabled={Boolean(id)}
            label="ID"
            onChange={(event) => setForm({ ...form, id: event.target.value })}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="intro-15"
            required
            value={form.id}
          />
          <InputField
            label="Название"
            maxLength={120}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
            value={form.title}
          />
          <TextAreaField
            label="Описание"
            maxLength={2000}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            value={form.description}
          />
          <InputField
            label="Длительность, минут"
            max={480}
            min={5}
            onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })}
            required
            step={5}
            type="number"
            value={form.durationMinutes}
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button disabled={saving} type="submit">
              {saving ? "Сохраняем…" : "Сохранить"}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link to={routes.admin}>Отмена</Link>
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
