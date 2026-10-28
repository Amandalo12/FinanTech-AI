import { useCallback, useEffect, useState } from "react";
import { fetchHealth } from "../lib/api";
import type { ApiStatus } from "../types";

export function useHealth() {
  const [status, setStatus] = useState<ApiStatus>("checking");
  const [model, setModel] = useState<string>();

  const check = useCallback(async (signal?: AbortSignal) => {
    setStatus("checking");
    try {
      const health = await fetchHealth(signal);
      setModel(health.model);
      setStatus(health.configured ? "online" : "unconfigured");
    } catch {
      if (!signal?.aborted) setStatus("offline");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void check(controller.signal);
    return () => controller.abort();
  }, [check]);

  return { status, model, recheck: () => void check() };
}
