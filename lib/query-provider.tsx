"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import { makeQueryClient } from "@/lib/query-client";

export function QueryProvider({ children }: Readonly<PropsWithChildren>) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
