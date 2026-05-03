import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const TickContext = createContext<Date>(new Date());

export function TickProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <TickContext.Provider value={now}>{children}</TickContext.Provider>;
}

export function useTick(): Date {
  return useContext(TickContext);
}
