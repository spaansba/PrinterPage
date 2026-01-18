import { clerkMiddleware } from "@clerk/nextjs/server";

// Make sure that the `/api/webhooks/(.*)` route is not protected here
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// export function middleware(request: NextRequest) {
//   console.log({
//     method: request.method,
//     path: request.nextUrl.pathname,
//     //  body: request.body, // Note: body is a ReadableStream
//     query: Object.fromEntries(request.nextUrl.searchParams),
//     timestamp: new Date().toISOString(),

//   })
//   return NextResponse.next()
// }
