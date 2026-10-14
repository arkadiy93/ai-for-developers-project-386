import { useState } from 'react';
import { Button } from '@/components/ui/button';

type HealthStatus = 'idle' | 'loading' | 'ok' | 'error';

function App() {
  const [status, setStatus] = useState<HealthStatus>('idle');

  async function checkHealth() {
    setStatus('loading');
    try {
      const res = await fetch('/api/health');
      const data: { status?: string } = await res.json();
      setStatus(res.ok && data.status === 'ok' ? 'ok' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Календарь звонков</h1>
      <Button onClick={checkHealth} disabled={status === 'loading'}>
        Проверить API
      </Button>
      <p className="text-muted-foreground text-sm" data-testid="health-status">
        API: {status}
      </p>
    </main>
  );
}

export default App;
