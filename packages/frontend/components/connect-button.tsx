'use client';

import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';
import { cn, shortenAddress } from '@/lib/utils';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';

export function ConnectButton({ className, connectTitle = 'Connect Wallet' }: { className?: string; connectTitle?: string }) {
    const { proxyAddress } = useProxyAccount();
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
                                    className={cn('transition-colors flex flex-col gap-0', className)}
                                >
                                    <span className="text-sm font-bold">{account.displayName}</span>
                                    <span className="text-xs text-muted-foreground">{shortenAddress(proxyAddress, 4)}</span>
                                </Button>
                            );
                        })()}
                    </div>
                );
            }}
        </RainbowKitConnectButton.Custom>
    );
}
