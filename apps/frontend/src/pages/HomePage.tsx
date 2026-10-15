import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';

export function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Call Calendar</h1>
      <p className="text-muted-foreground max-w-md text-lg">
        Pick a free time and book a 15- or 30-minute call. No sign-up needed.
      </p>
      <Link to="/book" className={buttonVariants({ size: 'lg' })}>
        Book a call
      </Link>
    </main>
  );
}
