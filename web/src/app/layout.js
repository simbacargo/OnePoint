"use client";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/snippets/Header";
import Aside from "@/snippets/Aside";
import { GlobalProvider, useGlobalContext } from "@/Context/GlobalContext";

// Global CSS imports
import './globals.css'; // Your main stylesheet
import '../../public/assets/vendor/bootstrap/css/bootstrap.min.css';
import '../../public/assets/vendor/bootstrap-icons/bootstrap-icons.css';
import '../../public/assets/vendor/boxicons/css/boxicons.min.css';
import '../../public/assets/vendor/quill/quill.snow.css';
import '../../public/assets/vendor/quill/quill.bubble.css';
import '../../public/assets/vendor/remixicon/remixicon.css';
import '../../public/assets/vendor/simple-datatables/style.css';
import '../../public/assets/css/style.css';
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata = {
  // title: "MESA, Your trusted partner in commercial excellence",
  // description: "Your trusted partner in commercial excellence",
// };




function HomeComponent({ children }) {
  const [first, setfirst] = useState("second")
  const { setShowSidebar,showSidebar} = useGlobalContext();
  return (
    <html lang="en">
      <body
        className={`${'toggle-sidebar'} `}
      >
          <Header />
          <Aside />
          <main id="main" className="main">
            {children}
          </main>
      </body>
    </html>
  );
}








export default function RootLayout({ children }) {
  return (
        <GlobalProvider>
          <HomeComponent>{children}</HomeComponent>;
        </GlobalProvider>
  )

}