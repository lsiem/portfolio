import { notFound } from "next/navigation";

// Any URL below a locale that no other route matches. Without this, Next
// serves its built-in 404 instead of the localized `not-found.tsx`.
export default function CatchAllPage() {
  notFound();
}
