import React from "react";

function StudentHome({
  walletAddress,
  scholarships,
  onConnectWallet,
  onApply,
}) {
  return (
    <main className="student-page">
      {/* HERO */}
      <section className="student-hero">
        <div className="student-hero-glow"></div>

        <div className="student-hero-inner">
          {/* LEFT SIDE */}
          <div className="student-hero-copy">
            <div className="hero-badge">
              <span></span>
              DECENTRALIZED SCHOLARSHIPS
            </div>

            <h1>
              Your education.
              <br />
              <span>On-chain.</span>
            </h1>

            <p>
              Discover scholarship opportunities, apply securely, and follow
              your application through a transparent blockchain-powered
              platform.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() =>
                  document
                    .getElementById("scholarships")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore opportunities
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn more
              </button>
            </div>

            <div className="hero-trust">
              <span>Powered by Ethereum</span>
              <span className="hero-trust-dot">•</span>
              <span>Sepolia Network</span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="hero-visual">
            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>

            <div className="hero-center-card">
              <div className="hero-center-top">
                <span>SC</span>

                <div className="live-indicator">
                  <span></span>
                  LIVE
                </div>
              </div>

              <div className="hero-center-content">
                <small>ScholarChain Network</small>

                <strong>Verified.</strong>
                <strong>Transparent.</strong>
                <strong>On-chain.</strong>
              </div>

              <div className="hero-center-bottom">
                <span>NETWORK</span>
                <strong>ETHEREUM</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCHOLARSHIP BOARD */}
      <section className="opportunities-section" id="scholarships">
        <div className="opportunities-container">
          <div className="opportunities-heading">
            <div>
              <span className="section-label">SCHOLARSHIP BOARD</span>

              <h2>
                Opportunities
                <br />
                worth discovering.
              </h2>
            </div>

            <div className="opportunities-summary">
              <span>AVAILABLE</span>
              <strong>{scholarships.length}</strong>
            </div>
          </div>

          <div className="opportunities-line"></div>

          {scholarships.length === 0 ? (
            /* EMPTY STATE */
            <div className="empty-opportunities">
              <div className="empty-state-header">
                <div>
                  <span className="empty-label">SCHOLARSHIP BOARD</span>

                  <h3>Available Scholarships</h3>
                </div>

                <div
                  className="network-status"
                  role="status"
                  aria-label="ScholarChain network is active"
                >
                  <span className="network-status-dot"></span>
                  <span>Network Active</span>
                </div>
              </div>

              <div className="empty-state-divider"></div>

              <div className="empty-state-content">
                <div className="empty-state-icon" aria-hidden="true">
                  <span>SC</span>
                </div>

                <h3>No Active Opportunities Yet</h3>

                <p>
                  There are no active scholarships available right now. New
                  opportunities will appear here automatically once scholarship
                  providers publish them on-chain.
                </p>

                <button
                  type="button"
                  className="empty-refresh-button"
                  onClick={() => window.location.reload()}
                >
                  Refresh List
                </button>
              </div>

              <div className="empty-state-footer">
                <span className="network-status-dot"></span>

                <span>
                  ScholarChain is connected to the Ethereum network
                </span>
              </div>
            </div>
          ) : (
            /* SCHOLARSHIP LIST */
            <div className="opportunity-list">
              {scholarships.map((scholarship, index) => {
  const hasApplied = scholarship.hasApplied === true;

  return (
                <article
                  className="opportunity-row"
                  key={scholarship.id}
                >
                  <div className="opportunity-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="opportunity-main">
                    <div className="opportunity-status">
                      <span
                        className={
                          scholarship.active
                            ? "status-live"
                            : "status-closed"
                        }
                      ></span>

                      {scholarship.active ? "OPEN" : "CLOSED"}
                    </div>

                    <h3>{scholarship.title}</h3>

                    <p>{scholarship.description}</p>
                  </div>

                  <div className="opportunity-meta">
                    <div>
                      <span>FUNDING</span>
                      <strong>{scholarship.amount} ETH</strong>
                    </div>

                    <div>
                      <span>APPLICANTS</span>
                      <strong>
                        {scholarship.applicantCount ?? 0}/
                        {scholarship.maxApplicants}
                      </strong>
                    </div>

                    <div>
                      <span>DEADLINE</span>
                      <strong>{scholarship.deadline}</strong>
                    </div>
                  </div>

                  <div className="opportunity-action">
                   <button
  disabled={!scholarship.active || !walletAddress || hasApplied}
  onClick={() => onApply(scholarship.id)}
>
  {!walletAddress
    ? "Connect wallet"
    : hasApplied
      ? "Applied"
      : scholarship.active
        ? "Apply"
        : "Closed"}

  <span>→</span>
</button>
                  </div>
               </article>
  );
})}
            </div>
          )}
        </div>
      </section>

          {/* ABOUT SCHOLARCHAIN */}
<section className="about-section" id="about">
  <div className="about-container">
    <div className="about-visual">
      <div className="about-visual-grid"></div>

      <div className="about-orbit about-orbit-one"></div>
      <div className="about-orbit about-orbit-two"></div>

      <div className="about-network about-network-one"></div>
      <div className="about-network about-network-two"></div>
      <div className="about-network about-network-three"></div>
      <div className="about-network about-network-four"></div>

      <span className="about-node about-node-one"></span>
      <span className="about-node about-node-two"></span>
      <span className="about-node about-node-three"></span>
      <span className="about-node about-node-four"></span>

      <div className="about-visual-center">
        <span className="about-visual-eyebrow">SCHOLARCHAIN</span>
        <strong>SC</strong>
        <span className="about-visual-status">
          <i></i>
          ON-CHAIN
        </span>
      </div>

      <div className="about-tech-label about-tech-top">
        <span>NETWORK</span>
        <strong>ETHEREUM</strong>
      </div>

      <div className="about-tech-label about-tech-bottom">
        <span>STATUS</span>
        <strong>VERIFIED</strong>
      </div>

      <div className="about-visual-corner">
        <span>01</span>
        <span>BLOCKCHAIN</span>
      </div>
    </div>

    <div className="about-content">
      <span className="about-badge">ABOUT SCHOLARCHAIN</span>

      <h2>
        A Transparent Scholarship <span>Ecosystem</span>
      </h2>

      <p className="about-lead">
        ScholarChain is a blockchain-powered scholarship platform designed to
        make scholarship funding and distribution more transparent, accessible,
        and verifiable.
      </p>

      <div className="about-features">
        <div className="about-feature">
          <div className="about-feature-number">01</div>

          <div className="about-feature-content">
            <h3>Smart Contracts</h3>
            <p>
              Scholarship activity is recorded and managed through
              blockchain-based smart contracts.
            </p>
          </div>

          <span className="about-feature-arrow">↗</span>
        </div>

        <div className="about-feature">
          <div className="about-feature-number">02</div>

          <div className="about-feature-content">
            <h3>Wallet-Based Interaction</h3>
            <p>
              Students can discover opportunities, connect their wallets, and
              apply directly through the platform.
            </p>
          </div>

          <span className="about-feature-arrow">↗</span>
        </div>

        <div className="about-feature">
          <div className="about-feature-number">03</div>

          <div className="about-feature-content">
            <h3>Transparent Verification</h3>
            <p>
              Important scholarship actions can be independently tracked and
              verified on the blockchain.
            </p>
          </div>

          <span className="about-feature-arrow">↗</span>
        </div>
      </div>
    </div>
  </div>
</section>
   

      {/* WHY SCHOLARCHAIN */}
      <section className="why-section">
        <div className="why-container">
          <div className="why-heading">
            <span className="section-label">WHY SCHOLARCHAIN</span>

            <h2>
              Built for a more
              <br />
              transparent future.
            </h2>

            <p>
              The platform combines blockchain infrastructure with a simple
              scholarship experience.
            </p>
          </div>

          <div className="why-principles">
            <div className="why-principle">
              <div className="principle-number">01</div>

              <div className="principle-content">
                <h3>Transparent by design</h3>

                <p>
                  Important scholarship actions are recorded on-chain, making
                  them easier to verify rather than relying solely on private
                  records.
                </p>
              </div>

              <span className="principle-arrow">↗</span>
            </div>

            <div className="why-principle">
              <div className="principle-number">02</div>

              <div className="principle-content">
                <h3>Direct wallet interaction</h3>

                <p>
                  Students interact with the platform through their own
                  wallets, giving them a direct connection to the application
                  process.
                </p>
              </div>

              <span className="principle-arrow">↗</span>
            </div>

            <div className="why-principle">
              <div className="principle-number">03</div>

              <div className="principle-content">
                <h3>Smart-contract powered</h3>

                <p>
                  Scholarship creation, applications, approvals, and payments
                  are handled through programmable blockchain logic.
                </p>
              </div>

              <span className="principle-arrow">↗</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default StudentHome;