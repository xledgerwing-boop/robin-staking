import Image from 'next/image';
import logo from '@/public/logo.png';
import { ThemeToggle } from './theme-toggle';
import { ConnectButton } from './connect-button';

export default function Navbar() {
    return (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Image src={logo} alt="Robin Logo" width={32} height={32} className="rounded-lg" />
                    <span className="text-xl font-bold text-foreground">Robin</span>
                </div>
                <nav className="hidden md:flex items-center space-x-2">
                    <ThemeToggle />
                    <ConnectButton />
                </nav>
            </div>
        </header>
    );
}
