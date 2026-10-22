import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { label: "Explore", href: "/explore" },
  { label: "Community", href: "/community" },
  { label: "My trips", href: "/trips" },
  { label: "Profile", href: "/profile" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-line bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-[4vw] py-5 sm:px-[3.5vw] lg:px-[3.3vw]">
        <Link href="/" className="flex items-center" aria-label="MYTOUR home">
          <Image
            src="/mytour-logo.png"
            alt="MYTOUR"
            width={660}
            height={203}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav
          className="hidden items-center gap-9 text-[13px] font-medium text-muted-foreground md:flex"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              className="transition-colors hover:text-brand-blue"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            variant="ghost"
            className="h-10 rounded-full px-4 text-brand-blue hover:bg-brand-blue-soft"
          >
            Log in
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/plan" />}
            className="h-10 rounded-full bg-brand-blue px-5 text-white shadow-sm hover:bg-brand-blue-hover"
          >
            Start planning <ArrowUpRight className="size-4" />
          </Button>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent
            side="right"
            className="border-brand-line bg-background p-0"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-brand-blue-deep">
                <Image
                  src="/mytour-logo.png"
                  alt="MYTOUR"
                  width={660}
                  height={203}
                  className="h-8 w-auto"
                />
              </SheetTitle>
              <SheetDescription>
                Find your own way through Malaysia.
              </SheetDescription>
            </SheetHeader>
            <nav
              className="flex flex-col gap-1 px-4"
              aria-label="Mobile navigation"
            >
              {navigation.map((item) => (
                <SheetClose
                  key={item.href}
                  render={
                    <Link
                      href={item.href}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-surface-muted hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  }
                />
              ))}
            </nav>
            <div className="px-4 pt-2">
              <SheetClose
                render={
                  <Link
                    href="/login"
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand-surface-muted hover:text-foreground"
                  >
                    Log in
                  </Link>
                }
              />
            </div>
            <div className="p-4">
              <SheetClose
                render={
                  <Link
                    href="/plan"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-medium text-white hover:bg-brand-blue-hover"
                  >
                    Start planning <ArrowUpRight className="size-4" />
                  </Link>
                }
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
