import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchOptions, type BroadcastOptions } from "./broadcast";

// Le serveur décide qui peut diffuser (liste d'e-mails admins). Le résultat est
// gardé en mémoire par compte pour ne demander qu'une fois (menu + page).
const cache = new Map<string, Promise<BroadcastOptions>>();

function load(email: string) {
  let pending = cache.get(email);
  if (!pending) {
    pending = fetchOptions().catch(() => {
      cache.delete(email); // on réessaiera à la prochaine occasion
      return { autorise: false } as BroadcastOptions;
    });
    cache.set(email, pending);
  }
  return pending;
}

export function useBroadcastAccess() {
  const { status, profile } = useAuth();
  const email = profile?.email?.toLowerCase() ?? "";
  const [state, setState] = useState<{ email: string; options: BroadcastOptions } | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !email) {
      setState(null);
      return;
    }
    let live = true;
    load(email).then((options) => live && setState({ email, options }));
    return () => {
      live = false;
    };
  }, [status, email]);

  const options = state?.email === email ? state.options : null;
  return {
    /** false tant que la réponse du serveur n'est pas arrivée. */
    ready: status !== "loading" && (status === "anonymous" || options !== null),
    allowed: Boolean(options?.autorise),
    options,
  };
}
