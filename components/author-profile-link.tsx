import type { ReactNode } from "react";
import Link from "next/link";

// Older illustrative content can omit the author ID and remain plain text.
export function AuthorProfileLink({ authorId, children, className }: { authorId?: string; children: ReactNode; className?: string }) {
  return authorId ? <Link href={"/users/" + encodeURIComponent(authorId)} className={className}>{children}</Link> : <div className={className}>{children}</div>;
}
