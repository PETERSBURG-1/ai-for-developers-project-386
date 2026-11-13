import { getHealth } from "@calendar/api-client";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ApiStatus = "checking" | "ok" | "error";

const statusLabel: Record<ApiStatus, string> = {
  checking: "Проверяем API…",
  ok: "API доступен",
  error: "API недоступен",
};

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    let active = true;

    getHealth()
      .then(({ data, error }) => {
        if (active) {
          setApiStatus(!error && data?.status === "ok" ? "ok" : "error");
        }
      })
      .catch(() => {
        if (active) {
          setApiStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Календарь звонков</CardTitle>
          <CardDescription>
            Каркас приложения готов. Каталог встреч и запись появятся на следующих шагах.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{statusLabel[apiStatus]}</p>
          <Button disabled>Записаться</Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
