import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// #region agent log
fetch('http://127.0.0.1:7796/ingest/71282e33-1ee2-46da-b64e-15c04240e19d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d2c956'},body:JSON.stringify({sessionId:'d2c956',runId:'post-fix-2',location:'proxy.ts:3',message:'clerk server imports resolved',data:{clerkMiddlewareType:typeof clerkMiddleware,createRouteMatcherType:typeof createRouteMatcher,createRouteMatcherValue:String(createRouteMatcher)},hypothesisId:'B',timestamp:Date.now()})}).catch(()=>{});
// #endregion

const isProtectedRoute = createRouteMatcher([
  '/home(.*)',
  '/onboarding(.*)',
  '/applicant(.*)',
  '/recruiter(.*)',
  '/interviewer(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
