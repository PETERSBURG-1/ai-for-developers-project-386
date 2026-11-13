import { Link, Route, Routes, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import { AdminPage } from "@/pages/AdminPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { HomePage } from "@/pages/HomePage";
import { MeetingTypeFormPage } from "@/pages/MeetingTypeFormPage";
import { MeetingTypePage } from "@/pages/MeetingTypePage";
import { routes } from "@/routes";

const navLinkClassName = "text-sm text-muted-foreground transition-colors hover:text-foreground";

export function App() {
  const { pathname } = useLocation();
  const isHome = pathname === routes.home;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link className="text-lg font-semibold tracking-tight" to={routes.home}>
            Календарь звонков
          </Link>
          <nav className="flex items-center gap-4">
            <Link className={navLinkClassName} to={routes.booking}>
              Каталог
            </Link>
            <Link className={navLinkClassName} to={routes.admin}>
              Админка
            </Link>
            {isHome && (
              <Button asChild size="sm">
                <Link to={routes.booking}>Записаться</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route element={<HomePage />} path={routes.home} />
          <Route element={<CatalogPage />} path={routes.booking} />
          <Route element={<MeetingTypePage />} path={routes.bookingType} />
          <Route element={<AdminPage />} path={routes.admin} />
          <Route element={<MeetingTypeFormPage />} path={routes.adminNewType} />
          <Route element={<MeetingTypeFormPage />} path={routes.adminEditType} />
        </Routes>
      </main>
    </div>
  );
}
