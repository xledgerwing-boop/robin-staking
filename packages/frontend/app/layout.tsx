import type { Metadata } from 'next';
import './globals.css';
import PlausibleProvider from 'next-plausible';
import localFont from 'next/font/local';
import { ThemeProvider } from 'next-themes';
import { Web3Provider } from '@/components/providers/web3-provider';
import Footer from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';
import { BackButton } from '@/components/back-button';
import Navbar from '@/components/navbar';
import BlockedGuard from '@/components/blocked-guard';

const myFont = localFont({
    src: '../public/Satoshi-Variable.ttf',
});

const title = 'Robin - Earn Yield on Prediction Markets';
const description = 'Coming soon - Earn yield on your Polymarket positions with Robin';
const domain = 'staking.robin.markets';

export const metadata: Metadata = {
    title: title,
    description: description,
    icons: {
        icon: [
            {
                media: '(prefers-color-scheme: dark)',
                url: '/logo.png',
                href: '/logo.png',
            },
            {
                media: '(prefers-color-scheme: light)',
                url: '/logo.png',
                href: '/logo.png',
            },
        ],
    },
    openGraph: {
        type: 'website',
        url: `https://${domain}`,
        title: title,
        description: description,
        images: [
            {
                url: `https://${domain}/graph.png`,
                width: 1200,
                height: 630,
                alt: 'Robin Thumbnail',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: `https://${domain}`,
        title: title,
        description: description,
        images: {
            url: `https://${domain}/graph.png`,
            width: 1200,
            height: 630,
            alt: 'Robin Thumbnail',
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {process.env.ANALYTICS === 'true' && (
                    <PlausibleProvider
                        domain={domain}
                        customDomain="https://plausible.robin.markets"
                        trackOutboundLinks
                        trackFileDownloads
                        taggedEvents
                        selfHosted
                    />
                )}
            </head>
            <body className={`${myFont.className} antialiased`}>
                <Web3Provider>
                    <ThemeProvider defaultTheme="light">
                        <Navbar />
                        <BlockedGuard>
                            <div className="block sm:hidden py-3 px-2">
                                <BackButton />
                            </div>
                            {children}
                            <Footer />
                        </BlockedGuard>
                        <Toaster />
                    </ThemeProvider>
                </Web3Provider>
            </body>
        </html>
    );
}
