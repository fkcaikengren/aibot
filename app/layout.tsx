/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getBuildConfig } from "./config/build";
import Modal from './components/Modal';
import NavigationEvents from "./components/NavigationEvents";
import { Toaster } from "react-hot-toast";
import { divide } from "lodash";



const buildConfig = getBuildConfig();

export const metadata = {
  title:  process.env.NEXT_PUBLIC_WEBSITE_NAME,
  description: "AI永恒, 爱永恒, AI中文智能对话, 与AI对话, ChatGPT",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
  appleWebApp: {
    title: process.env.NEXT_PUBLIC_WEBSITE_NAME,
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <html lang="en">
      <head>
        <meta name="version" content={buildConfig.commitId} />
        <link rel="manifest" href="/site.webmanifest"></link>
      </head>
      <body>
        <Modal>
          <div className="h-screen flex">
          
            <NavigationEvents >
            {children}
            </NavigationEvents>
          </div>  
        </Modal>
        <Toaster />
      </body>
      
    </html>
  );
}




