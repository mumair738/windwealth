'use client';

import React from 'react';
import styles from './ImpactSnapshot.module.css';

interface ImpactSectionProps {
  title: string;
  description: string;
  metrics?: Array<{ label: string; value: string }>;
  status?: {
    label: string;
    intensity?: string;
    urgency?: string;
  };
  proposals?: Array<{ title: string; status: string }>;
}

const ImpactSection: React.FC<ImpactSectionProps> = ({ 
  title, 
  description, 
  metrics,
  status,
  proposals
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      
      {metrics && metrics.length > 0 && (
        <div className={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <div key={index} className={styles.metric}>
              <span className={styles.metricLabel}>{metric.label}</span>
              <span className={styles.metricValue}>{metric.value}</span>
            </div>
          ))}
        </div>
      )}

      {status && (
        <div className={styles.statusContainer}>
          <div className={styles.statusBadge}>
            <span className={styles.statusLabel}>{status.label}</span>
            {status.intensity && (
              <span className={styles.statusIntensity}>{status.intensity}</span>
            )}
            {status.urgency && (
              <span className={styles.statusUrgency}>{status.urgency}</span>
            )}
          </div>
        </div>
      )}

      {proposals && proposals.length > 0 && (
        <div className={styles.proposalsContainer}>
          <div className={styles.proposalsHeader}>
            <span className={styles.proposalsTitle}>Proposals Moving Toward Funding</span>
          </div>
          <div className={styles.proposalsList}>
            {proposals.map((proposal, index) => (
              <div key={index} className={styles.proposalItem}>
                <div className={styles.proposalContent}>
                  <span className={styles.proposalTitle}>{proposal.title}</span>
                  <span className={styles.proposalStatus}>{proposal.status}</span>
                </div>
                <div className={styles.proposalArrow}>→</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ImpactSnapshot() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <ImpactSection
          title="Your Impact"
          description="Your participation shapes decisions and guides resources toward meaningful initiatives."
          metrics={[
            { label: "Decisions Influenced", value: "3 this month" },
            { label: "Funds Guided", value: "$x,xxx allocated" },
            { label: "Communities Supported", value: "2 initiatives activated" }
          ]}
        />
        
        <ImpactSection
          title="Your Voice"
          description="Your feedback is heard, remembered, and actively informs future proposals and decisions."
          metrics={[
            { label: "Last Contribution", value: "Jan 4 - Incorporated" },
            { label: "Themes You Care About", value: "Access, Prevention, Support" },
            { label: "Agent Memory", value: "Active - Informing proposals" }
          ]}
        />
        
        <ImpactSection
          title="System Health"
          description="The governance system is operating smoothly with low-intensity, reflective participation."
          status={{
            label: "This week's discussions: High signal",
            intensity: "Low-intensity",
            urgency: "No urgency"
          }}
          proposals={[
            { title: "Mental Health Access Initiative", status: "Moving toward funding" },
            { title: "Community Support Program", status: "In review" },
            { title: "Prevention Framework", status: "Gathering input" }
          ]}
        />
      </div>
    </div>
  );
}
