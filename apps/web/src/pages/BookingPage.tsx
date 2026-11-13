import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { routes } from "@/routes";

function BookingPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-6 py-16 md:py-24">
      <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Следующий шаг
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Запись на звонок</h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        Каталог типов встреч и выбор слота появятся на следующем шаге. Пока можно вернуться на
        главную и посмотреть, как устроен сервис.
      </p>
      <Button asChild variant="outline">
        <Link to={routes.home}>На главную</Link>
      </Button>
    </section>
  );
}

export default BookingPage;
