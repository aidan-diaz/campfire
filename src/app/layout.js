import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

// #region agent log
fetch('http://127.0.0.1:7796/ingest/71282e33-1ee2-46da-b64e-15c04240e19d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d2c956'},body:JSON.stringify({sessionId:'d2c956',runId:'post-fix-2',location:'layout.js:3',message:'clerk nextjs import resolved',data:{ClerkProviderType:typeof ClerkProvider,ClerkProviderValue:String(ClerkProvider)},hypothesisId:'D',timestamp:Date.now()})}).catch(()=>{});
// #endregion
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QuestHire",
  description: "Gamified hiring experience",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
