'use client';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { ThemeToggle } from './theme-toggle';
import { ConnectButton } from './connect-button';
import Link from 'next/link';
import { Button } from './ui/button';
import { BookText, WalletMinimal } from 'lucide-react';
import { BackButton } from './back-button';

export default function Navbar() {
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="hidden sm:block">
                        <BackButton />
                    </div>
                    <Link href="/" className="flex items-center space-x-2">
                        <Image src={logo} alt="Robin Logo" width={32} height={32} className="rounded-lg" />
                        <div className="relative inline-block">
                            <span className="text-xl font-bold text-foreground">Robin</span>
                            <span className="absolute -top-2 -right-6 rotate-20 bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                BETA
                            </span>
                        </div>
                    </Link>
                </div>
                <nav className="flex items-center space-x-2">
                    <Link href="/portfolio">
                        <Button className="hidden md:inline-flex" variant="default">
                            <WalletMinimal className="w-4 h-4" /> Portfolio
                        </Button>
                        <Button className="inline-flex md:hidden" variant="default" size="icon">
                            <WalletMinimal className="w-4 h-4" />
                        </Button>
                    </Link>
                    <ConnectButton />
                    <ThemeToggle />
                    <Link href="https://robin-markets.gitbook.io" target="_blank" rel="noopener noreferrer" aria-label="Gitbook Docs">
                        <Button className="hidden md:inline-flex" variant="outline" size="icon">
                            <BookText className="w-5 h-5" />
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
