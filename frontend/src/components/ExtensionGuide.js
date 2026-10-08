export default function ExtensionGuide() {
    return (
        <section className="extension-guide" aria-label="Browser extension instructions">
            <details>
                <summary>
                    <span className="guide-kicker">EXTENSION / QUICK START</span>
                    <span className="guide-summary-title">Use Keepsake while browsing</span>
                    <span className="guide-toggle" aria-hidden="true">+</span>
                </summary>
                <div className="guide-content">
                    <p className="guide-intro">The unpacked extension is a local development copy. It runs in this Chrome profile and is not yet published in the Chrome Web Store.</p>
                    <ol className="guide-steps">
                        <li>
                            <span className="guide-step-number">01</span>
                            <div><h3>Load the local copy</h3><p>In Chrome, open <code>chrome://extensions</code>, turn on <strong>Developer mode</strong>, choose <strong>Load unpacked</strong>, then select this project's <code>extension/</code> folder.</p></div>
                        </li>
                        <li>
                            <span className="guide-step-number">02</span>
                            <div><h3>Open a product page</h3><p>Visit a regular <code>https://</code> or <code>http://</code> product page. Chrome system pages and the Chrome Web Store don't allow extensions to read the active page.</p></div>
                        </li>
                        <li>
                            <span className="guide-step-number">03</span>
                            <div><h3>Sign in and save</h3><p>Open Keepsake from Chrome's Extensions menu, sign in with the same email and password as the website, enter a price and category, then select <strong>Save to wishlist</strong>.</p></div>
                        </li>
                        <li>
                            <span className="guide-step-number">04</span>
                            <div><h3>Confirm it arrived</h3><p>Refresh the website if needed. The saved item should appear in your collection under the same account.</p></div>
                        </li>
                    </ol>
                    <p className="guide-note">After changing extension files, return to <code>chrome://extensions</code> and click the extension's reload icon. You only need to load the unpacked folder once per Chrome profile.</p>
                </div>
            </details>
        </section>
    );
}
