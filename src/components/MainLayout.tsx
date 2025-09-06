"use client";

import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
  Navbar,
}: {
  children: React.ReactNode;
  Navbar: React.ReactNode;
}) {
  const pathname = usePathname();
  console.log(pathname);

  const hideNavbarOnRoutes = ["/sign-in", "/sign-up"];
  const shouldHideNavbar = hideNavbarOnRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      {!shouldHideNavbar && Navbar}
      <main className={`${!shouldHideNavbar && "pt-16"}`}>{children}</main>
    </>
  );
}
