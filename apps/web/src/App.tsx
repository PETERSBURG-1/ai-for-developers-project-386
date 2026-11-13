import { Link, Route, Routes, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import BookingPage from "@/pages/BookingPage";
import HomePage from "@/pages/HomePage";
import { routes } from "@/routes";

function App() {
  const { pathname } = useLocation();
  const isBookingPage = pathname === routes.booking;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link className="text-lg font-semibold tracking-tight" to={routes.home}>
            Календарь звонков
          </Link>
          {!isBookingPage && (
            <Button asChild size="sm">
              <Link to={routes.booking}>Записаться</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route element={<HomePage />} path={routes.home} />
          <Route element={<BookingPage />} path={routes.booking} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
