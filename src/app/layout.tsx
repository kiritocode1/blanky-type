import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Blanky Type | Typing Practice",
	description: "Improve your typing speed and accuracy with Blanky Type - a modern, interactive typing practice application",
	keywords: ["typing practice", "typing test", "typing speed", "typing accuracy", "typing game", "touch typing"],
	authors: [{ name: "Blanky Type" }],
	creator: "Blanky Type",
	publisher: "Blanky Type",
	robots: {
		index: true,
		follow: true,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://blanky-type.vercel.app",
		title: "Blanky Type | Typing Practice",
		description: "Improve your typing speed and accuracy with Blanky Type - a modern, interactive typing practice application",
		siteName: "Blanky Type",
	},
	twitter: {
		card: "summary_large_image",
		title: "Blanky Type | Typing Practice",
		description: "Improve your typing speed and accuracy with Blanky Type - a modern, interactive typing practice application",
	},
	viewport: {
		width: "device-width",
		initialScale: 1,
	},
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
