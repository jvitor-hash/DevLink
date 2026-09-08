import { NextRequest, NextResponse } from "next/server";

const PRIVATE_ROUTES = [
  "/settings",
  "/profile",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check whether this is a private route
  const isPrivateRoute = PRIVATE_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isPrivateRoute) {
    return NextResponse.next();
  }

  // Get the Better Auth session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // No session -> send user home
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    // Your Better Auth API
    const response = await fetch(
      `${process.env.AUTH_API_URL}/api/auth/get-session`,
      {
        headers: {
          Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
        },
        cache: "no-store",
      }
    );

    // Session doesn't exist / expired
    if (!response.ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const session = await response.json();

    // Better Auth returned no valid session
    if (!session?.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    // If the auth API can't be reached, don't allow
    // access to the protected route.
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/profile/:path*",
  ],
};
