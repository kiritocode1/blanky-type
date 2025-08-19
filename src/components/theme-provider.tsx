"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
type ThemeProviderProps = {
	children: React.ReactNode;
	attribute?: "class" | "data-theme";
	defaultTheme?: string;
	enableSystem?: boolean;
	disableTransitionOnChange?: boolean;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
			{...props}
		>
			{children}
		</NextThemesProvider>
	);
}
