'use client';

import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';
import { cn, shortenAddress } from '@/lib/utils';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';

export function ConnectButton({ className, connectTitle = 'Connect Wallet' }: { className?: string; connectTitle?: string }) {
    const { proxyAddress, hasProxyDeployed, isCheckingProxyDeployed } = useProxyAccount();
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
                                    <Button variant="outline" onClick={openConnectModal} className={cn('transition-colors', className)}>
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
                                <Button
                                    variant="outline"
                                    onClick={openAccountModal}
                                    className={cn('transition-colors flex flex-col gap-0 relative group', className)}
                                >
                                    <span className="text-sm font-bold">{account.displayName}</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        {shortenAddress(proxyAddress, 4)}
                                        {!hasProxyDeployed && !isCheckingProxyDeployed && (
                                            <span className="relative inline-flex items-center">
                                                <AlertCircle className="size-3 text-amber-600" />
                                                <span className="pointer-events-none absolute left-1/2 top-full z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow group-hover:block">
                                                    No Polymarket proxy wallet deployed for this account
                                                </span>
                                            </span>
                                        )}
                                    </span>
                                </Button>
                            );
                        })()}
                    </div>
                );
            }}
        </RainbowKitConnectButton.Custom>
    );
}
