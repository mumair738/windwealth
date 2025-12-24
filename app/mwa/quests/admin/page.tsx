import Navbar from '@/components/navbar/Navbar';
import { Footer } from '@/components/footer/Footer';
import Link from 'next/link';
import styles from './page.module.css';

const communityAvatars = [
  { name: 'Nova', color: '#5B8DEF' },
  { name: 'Vale', color: '#7C8CFF' },
  { name: 'Rune', color: '#9F8CFF' },
  { name: 'Cyra', color: '#A5C8FF' },
  { name: 'Iris', color: '#6AD9FF' },
];

export default function AdminVotingPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.content}>
          <div className={styles.breadcrumbs}>
            <Link href="/home">Home</Link>
            <span className={styles.chevron}>/</span>
            <Link href="/quests">Quests</Link>
            <span className={styles.chevron}>/</span>
            <span className={styles.current}>Admin Voting</span>
          </div>

          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>MWA • Decision Room</p>
              <h1 className={styles.title}>Admin Voting</h1>
              <p className={styles.subtitle}>
                Every quest submission lands here. Azura auto-votes with AgentKit while admins debate outcomes and settle the tally.
              </p>
            </div>
            <div className={styles.badge}>Live</div>
          </header>

          <section className={styles.grid}>
            <div className={styles.cardDark}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardEyebrow}>AI Agentic Daemon</p>
                  <h2 className={styles.cardTitle}>Azura</h2>
                  <p className={styles.cardText}>
                    Azura reads the submission, drafts a human-friendly recommendation, and sits beside admins as a calm co-pilot.
                  </p>
                </div>
                <span className={styles.autoChip}>Co-pilot</span>
              </div>

              <div className={styles.checklist}>
                <div className={styles.checkItem}>
                  <span className={styles.checkDot} />
                  <div>
                    <p className={styles.checkTitle}>Understands intent</p>
                    <p className={styles.checkText}>Summarizes proof and highlights what matters for review.</p>
                  </div>
                </div>
                <div className={styles.checkItem}>
                  <span className={styles.checkDot} />
                  <div>
                    <p className={styles.checkTitle}>Drafts a stance</p>
                    <p className={styles.checkText}>Offers a lean recommendation for admins to accept or adjust.</p>
                  </div>
                </div>
              </div>

              <div className={styles.timeline}>
                <p className={styles.timelineLabel}>Azura is active</p>
                <div className={styles.timelineBar}>
                  <span className={styles.timelineFill} />
                </div>
                <p className={styles.timelineFoot}>Reading, drafting, and syncing with admins.</p>
              </div>
            </div>

            <div className={styles.cardLight}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.cardEyebrowLight}>Community Council</p>
                  <h2 className={styles.cardTitle}>Admin Voting Room</h2>
                  <p className={styles.cardTextLight}>
                    A quiet room for admins to discuss the submission, ask for edits, and land the final call with Azura’s summary beside them.
                  </p>
                </div>
                <div className={styles.avatarCluster}>
                  {communityAvatars.map((avatar, index) => (
                    <span
                      key={avatar.name}
                      className={styles.avatar}
                      style={{ background: avatar.color, zIndex: communityAvatars.length - index }}
                      aria-label={avatar.name}
                    >
                      {avatar.name[0]}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.threadBox}>
                <div className={styles.threadPill}>Admin thread</div>
                <p className={styles.threadText}>
                  Keep notes brief and human. Tag Azura to rephrase, clarify evidence, or propose next steps.
                </p>
              </div>

              <div className={styles.footerActions}>
                <button className={`${styles.primaryButton} ${styles.primaryButtonFull}`} type="button">Publish decision</button>
              </div>
            </div>
          </section>

          <section className={styles.submissionCard}>
            <div className={styles.submissionHeader}>
              <div>
                <p className={styles.submissionEyebrow}>Submission</p>
                <h3 className={styles.submissionTitle}>Quest: Launch Teaser Video</h3>
              </div>
              <div className={styles.statusPill}>Awaiting admin review</div>
            </div>

            <div className={styles.submissionMeta}>
              <div>
                <p className={styles.metaLabel}>Submitted by</p>
                <p className={styles.metaValue}>@orbit_builder • 12 mins ago</p>
              </div>
              <div>
                <p className={styles.metaLabel}>Azura’s summary</p>
                <p className={styles.metaValue}>Complete • Tone: clear, concise</p>
              </div>
              <div>
                <p className={styles.metaLabel}>Proof</p>
                <Link href="#" className={styles.metaLink}>View upload</Link>
              </div>
            </div>

            <div className={styles.submissionBody}>
              <p className={styles.submissionText}>
                “Short, 35-second teaser with clear CTA to register. Visuals show the product flow and a closing beat inviting viewers to join the cohort. Audio levels balanced.”
              </p>
            </div>

            <div className={styles.submissionFooter}>
              <div className={styles.avatarRow}>
                {communityAvatars.slice(0, 3).map((avatar, index) => (
                  <span
                    key={avatar.name}
                    className={styles.avatarSmall}
                    style={{ background: avatar.color, zIndex: communityAvatars.length - index }}
                    aria-label={avatar.name}
                  >
                    {avatar.name[0]}
                  </span>
                ))}
              </div>
              <div className={styles.submissionActions}>
                <button className={styles.secondaryButton} type="button">Ask for edit</button>
                <button className={styles.primaryButton} type="button">Approve & publish</button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

