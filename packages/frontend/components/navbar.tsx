'use client';
import Image from 'next/image';
import logo from '@/public/logo.png';
import { ThemeToggle } from './theme-toggle';
import { ConnectButton } from './connect-button';
import Link from 'next/link';
import { Button } from './ui/button';
import { BookText, WalletMinimal, Menu, Home, Sparkles, Trophy } from 'lucide-react';
import { BackButton } from './back-button';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    // { href: '/genesis', label: 'Genesis Vault', icon: Sparkles },
    { href: '/portfolio', label: 'Portfolio', icon: WalletMinimal },
    { href: '/rewards', label: 'Rewards', icon: Trophy },
    { href: 'https://robin-markets.gitbook.io', label: 'Docs', icon: BookText, external: true },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="hidden sm:block">
                        <BackButton />
                    </div>
                    <Link href="/" className="flex items-center space-x-2">
                        <Image src={logo} alt="Robin Logo" width={32} className="rounded-lg w-auto" priority />
                        <div className="relative inline-block">
                            <span className="text-xl font-bold text-foreground">Robin</span>
                            <span className="absolute -top-2 -right-6 rotate-20 bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                BETA
                            </span>
                        </div>
                    </Link>
                </div>
                <nav className="flex items-center space-x-2">
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navigationItems.map(item => {
                            const isActive = pathname === item.href;
                            const NavIcon = item.icon;
                            if (item.external) {
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                            isActive ? 'border-primary border-b-2' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }`}
                                    >
                                        <NavIcon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            }
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive ? 'border-primary border-b-2' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    }`}
                                >
                                    <NavIcon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Navigation Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="lg:hidden">
                                <Menu className="w-5 h-5" />
                                <span className="sr-only">Open navigation menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {navigationItems.map(item => {
                                const isActive = pathname === item.href;
                                const NavIcon = item.icon;
                                if (item.external) {
                                    return (
                                        <DropdownMenuItem key={item.href} asChild>
                                            <Link
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-2 ${isActive ? 'bg-accent' : ''}`}
                                            >
                                                <NavIcon className="w-4 h-4" />
                                                {item.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    );
                                }
                                return (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href} className={`flex items-center gap-2 ${isActive ? 'bg-accent' : ''}`}>
                                            <NavIcon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ConnectButton />
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
