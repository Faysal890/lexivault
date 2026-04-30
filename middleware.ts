export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/words/:path*", "/quiz/:path*", "/stats/:path*", "/profile/:path*", "/admin/:path*", "/store/:path*"],
};
