/**
 * Whether the page is being viewed in admin mode.
 *
 * The same gate `QbrDashboard` uses to decide whether to mount the editor:
 * `?admin` in the URL. This is NOT authentication — see "Known gaps" in
 * CLAUDE.md — it only keeps internal affordances off a customer's copy.
 *
 * Note this is deliberately not `isEditorOpen`: the editor is a full-screen
 * overlay, so anything gated on it being *open* would be covered by it and
 * never seen.
 */
export function isAdminMode(): boolean {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).has("admin");
}
