import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-line bg-brand-surface-muted">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-12">
        <Link href="/" className="flex items-center" aria-label="MYTOUR home">
          <Image
            src="/mytour-logo.png"
            alt="MYTOUR"
            width={660}
            height={203}
            className="h-8 w-auto"
          />
        </Link>
        <p>
          Made for the long way round. Malaysia, with a little more meaning.
        </p>
        <span>© {new Date().getFullYear()} MYTOUR</span>
      </div>
    </footer>
  );
}
