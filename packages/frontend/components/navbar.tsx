'use client';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { ThemeToggle } from './theme-toggle';
import { ConnectButton } from './connect-button';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowLeft, WalletMinimal } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const isStakingPage = pathname.includes('/market/') || pathname.includes('/portfolio');
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {isStakingPage && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (typeof window !== 'undefined' && window.history.length > 1) {
                                    router.back();
                                } else {
                                    router.push('/');
                                }
                            }}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <Image src={logo} alt="Robin Logo" width={32} height={32} className="rounded-lg" />
                    <span className="text-xl font-bold text-foreground">Robin</span>
                </div>
                <nav className="flex items-center space-x-2">
                    <Link href="/portfolio">
                        <Button variant="default">
                            <WalletMinimal className="w-4 h-4" /> Portfolio
                        </Button>
                    </Link>
                    <ConnectButton />
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
