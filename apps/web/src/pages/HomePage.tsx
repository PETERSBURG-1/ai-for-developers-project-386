import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/routes";

const steps = [
  {
    title: "Выберите тип встречи",
    description: "Посмотрите доступные форматы и выберите подходящий по теме и длительности.",
  },
  {
    title: "Найдите свободный слот",
    description: "Откройте календарь на ближайшие 14 дней и выберите удобное время.",
  },
  {
    title: "Подтвердите запись",
    description: "Оставьте имя, email и заметку — владелец увидит запись в своём календаре.",
  },
];

function HomePage() {
  return (
    <div>
      <section className="mx-auto w-full max-w-5xl px-6 py-16 md:py-24">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Запись без переписки
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Календарь звонков</h1>
          <p className="text-lg text-muted-foreground">
            Выберите тип встречи, свободный слот и запишитесь на звонок за пару минут. Без
            регистрации и лишних сообщений.
          </p>
          <Button asChild size="lg">
            <Link to={routes.booking}>Записаться</Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/30" id="how-it-works">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Как это работает</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title}>
                <CardHeader>
                  <p className="text-sm font-medium text-muted-foreground">Шаг {index + 1}</p>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
