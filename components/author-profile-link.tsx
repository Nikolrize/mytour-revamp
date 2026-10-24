import type { AuthorProfileLinkProps } from "@/lib/type";
import Link from "next/link";

// Older illustrative content can omit the author ID and remain plain text.
export function AuthorProfileLink({
  authorId,
  children,
  className,
}: AuthorProfileLinkProps) {
  return authorId ? (
    <Link href={"/users/" + encodeURIComponent(authorId)} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}
