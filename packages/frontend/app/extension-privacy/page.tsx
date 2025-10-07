import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy — Robin Staking Browser Extension',
    description: 'Privacy Policy for the Chrome extension that injects a staking UI onto Polymarket.',
};

export default function PrivacyPolicy() {
    const effectiveDate = 'October 7, 2025';
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <main className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
                <header className="mb-6">
                    <h1 className="text-3xl font-semibold">Privacy Policy - Robin Browser Extension</h1>
                    <p className="mt-1 text-sm text-gray-600">Effective Date: {effectiveDate}</p>
                </header>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">Introduction</h2>
                    <p className="mt-2 text-gray-700">
                        This Privacy Policy explains how the Chrome extension (the “Extension”) operates with respect to personal data and privacy.
                        The Extension injects a staking user interface into the Polymarket trading page. We are committed to protecting your privacy
                        and making transparent disclosures about the Extension’s behaviour.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">Summary</h2>
                    <ul className="mt-2 list-disc pl-5 text-gray-700">
                        <li>
                            We <strong>do not</strong> collect, store, or transmit personal data.
                        </li>
                        <li>
                            All network requests are initiated directly from your browser to third‑party services (Polymarket and blockchain RPC
                            endpoints).
                        </li>
                        <li>
                            We operate <strong>no backend servers</strong> that receive or persist user data for the Extension.
                        </li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">1. Information the Extension Accesses</h2>
                    <p className="mt-2 text-gray-700">
                        The Extension does not access or collect personally identifiable information (PII). Functionally, when the Extension is active
                        in your browser it may:
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-gray-700">
                        <li>
                            Make <strong>read‑only</strong> HTTP GET requests to Polymarket’s public API to retrieve market and trade data.
                        </li>
                        <li>
                            Use the same blockchain RPC transport available to Polymarket from your browser (for example the RPC provider already
                            present in the page or available via your wallet extension) to submit or read on‑chain information. These RPC interactions
                            are performed by your browser and are subject to the policies of your wallet/provider.
                        </li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                        All requests originate from the user’s device and are not proxied through, logged, or stored by the Extension developer.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">2. Data Collection and Storage</h2>
                    <p className="mt-2 text-gray-700">
                        <strong>No collection.</strong> The Extension does not collect, transmit, or store your personal information or browsing
                        activity on any developer-controlled servers. The Extension does not use cookies, local analytics, or third‑party trackers.
                    </p>
                    <p className="mt-2 text-gray-700">
                        Any data returned by Polymarket’s public API or by on‑chain RPC calls is fetched directly into your browser session solely to
                        power the injected staking UI, and is retained only in memory while the page is active. The Extension does not persist this
                        data to disk or to remote services.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">3. Third‑Party Services</h2>
                    <p className="mt-2 text-gray-700">
                        The Extension interacts exclusively with third‑party services controlled by others, specifically:
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-gray-700">
                        <li>Polymarket’s public API endpoints.</li>
                        <li>Blockchain RPC endpoints used by Polymarket (as provided by the page or your wallet provider).</li>
                    </ul>
                    <p className="mt-2 text-gray-700">
                        These third parties have their own privacy policies and practices; we recommend reviewing them if you have questions about how
                        those services treat data.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">4. Data Sharing and Disclosure</h2>
                    <p className="mt-2 text-gray-700">
                        Because the Extension does not collect or store personal data, there is no user data that we share, sell, or disclose to third
                        parties. The Extension never transmits data to developer-owned servers.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">5. Security</h2>
                    <p className="mt-2 text-gray-700">
                        We follow best practices in development to avoid introducing vulnerabilities in the Extension. However, the primary risk
                        vector for operations that involve blockchain transactions or wallet interactions is the user’s wallet/provider and the
                        security of the environment in which the Extension runs. We encourage users to keep their browser and wallet extensions up to
                        date and to follow standard security hygiene.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">6. Data Retention</h2>
                    <p className="mt-2 text-gray-700">
                        The Extension does not retain user data. Any data loaded from Polymarket or from RPC calls persists only in memory while the
                        webpage is active and is released when the page or browser tab is closed or refreshed.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">7. User Controls</h2>
                    <p className="mt-2 text-gray-700">
                        You can disable or remove the Extension at any time from Chrome’s extensions page (chrome://extensions/). Removing the
                        Extension will stop it from injecting the UI and making any requests. Because no data is collected or stored, there are no
                        account-level controls or data deletion requests required.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">8. Changes to this Privacy Policy</h2>
                    <p className="mt-2 text-gray-700">
                        We may update this Privacy Policy occasionally. When changes are significant, we will update the Effective Date above and post
                        the revised policy here.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-medium">9. Contact</h2>
                    <p className="mt-2 text-gray-700">
                        For questions about this Privacy Policy, please contact us at{' '}
                        <a href="mailto:xledgerwing@gmail.com" className="text-sky-600 underline">
                            xledgerwing[at]gmail.com
                        </a>
                        .
                    </p>
                </section>

                <footer className="mt-8 border-t pt-4 text-sm text-gray-600">
                    <p>
                        This Privacy Policy applies exclusively to the described Chrome extension and does not apply to Polymarket or any other
                        third‑party site or service.
                    </p>
                </footer>
            </main>
        </div>
    );
}
