'use client';

import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function ConnectButton({ className, connectTitle = 'Connect Wallet' }: { className?: string; connectTitle?: string }) {
    return (
        <RainbowKitConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button variant="default" onClick={openConnectModal} className={cn('transition-colors', className)}>
                                        {connectTitle}
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button variant="outline" onClick={openChainModal} className={cn('transition-colors', className)}>
                                        Wrong network
                                    </Button>
                                );
                            }

                            return (
                                <Button onClick={openAccountModal} className={cn('transition-colors', className)}>
                                    {account.displayName}
                                </Button>
                            );
                        })()}
                    </div>
                );
            }}
        </RainbowKitConnectButton.Custom>
    );
}
