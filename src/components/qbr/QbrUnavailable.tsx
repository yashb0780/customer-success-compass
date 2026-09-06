import { FileQuestion, WifiOff } from "lucide-react";
import type { AccountView } from "@/lib/accountView";

type Reason = Extract<AccountView, { kind: "unavailable" }>["reason"];

/**
 * Shown instead of the QBR when this account id cannot be served.
 *
 * It deliberately renders NO account content. The previous behaviour fell back
 * to the copy bundled into the page, which meant any URL — /qbr/acme, /qbr/
 * anything — rendered the demo account's content under it.
 */
const COPY: Record<Reason, { title: string; body: string; icon: typeof FileQuestion }> = {
  "invalid-id": {
    title: "This QBR link isn't valid",
    body: "Check the link you were sent. QBR links contain a long unique code.",
    icon: FileQuestion,
  },
  "not-found": {
    title: "This QBR isn't available",
    body: "The link is well formed, but there is no QBR behind it. It may have been removed.",
    icon: FileQuestion,
  },
  unreachable: {
    title: "This QBR couldn't be loaded",
    body: "We couldn't reach the server. Please try again in a moment.",
    icon: WifiOff,
  },
};

export default function QbrUnavailable({ reason }: { reason: Reason }) {
  const { title, body, icon: Icon } = COPY[reason];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-sm space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-card">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
