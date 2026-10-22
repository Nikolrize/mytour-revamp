import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ClientLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-[4vw] sm:px-[3.5vw] lg:px-[3.3vw]">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}