# Next Build Milestones

This document defines the immediate next implementation targets following completion of authentication, profiles, username availability, and avatar logic. The goal is to move the system from *identity-ready* to *economy-active* while preserving clean UX language ("accounts," not "wallets") and governance integrity.

---

## 1. Functioning Quests and Rewards

### Objective

Activate the quest system as a first-class interaction loop: users complete meaningful actions, the agent validates outcomes, and rewards are distributed in a traceable, auditable way.

### Core Components

**Quest Definition**

* Quest ID (immutable)
* Title and description (human-readable)
* Quest type (one-off, repeatable, evolving)
* Completion criteria (explicit, machine-verifiable where possible)
* Reward schema (credits, tokens, reputation points)
* Status (active, paused, deprecated)

**Quest Lifecycle**

* Creation: agent-authored or admin-authored
* Visibility: surfaced in UI with clear progress indicators
* Completion: user submits proof or system auto-detects
* Validation: agent verifies completion conditions
* Resolution: rewards issued + quest state updated

**Reward Issuance**

* Rewards are triggered only after successful validation
* Agent executes reward logic from its controlled account
* Reward events are logged (user ID, quest ID, timestamp, reward type)

### Key Safeguards

* Idempotency: a quest cannot be rewarded twice unintentionally
* Rate limits on repeatable quests
* Clear failure states (why a quest was rejected)

### Deliverables

* Quest execution pipeline (backend)
* Quest progress + completion UI
* Reward confirmation state (visual + logged)

---

## 2. Account Linking Prompt (Blockchain Account)

### Objective

Introduce a clear, non-intimidating flow that prompts users to link a blockchain account *only when necessary* to hold or receive quest rewards.

### Language Constraint

* Always refer to wallets as **accounts**
* Avoid crypto jargon unless explicitly expanded

### Trigger Conditions

* User completes a quest that issues onchain rewards
* User attempts to view or claim blockchain-based rewards
* User opts into governance or voting features that require an account

### UX Flow

1. Soft prompt modal appears
2. Explains *why* an account is needed (receiving rewards, participation, ownership)
3. Provides a single clear action: "Link an account"
4. Allows dismissal without penalty if no immediate reward is blocked

### System Behavior

* Account linking is optional until required
* Linked accounts are stored as references (no private keys)
* Support for future multi-account linking (one primary, others optional)

### Deliverables

* Contextual modal component
* Backend account-linking endpoint
* User state flag (account linked / not linked)

---

## 3. Privy Base Account Signup Prompt (Connector)

### Objective

Ensure users create or connect a base account via Privy to enable seamless account linking, recovery, and cross-device continuity.

### When This Prompt Appears

* On first attempt to link a blockchain account
* On first reward claim that requires onchain settlement
* Not shown during initial platform signup unless needed

### UX Requirements

* Clear explanation: Privy is the account connector, not the reward issuer
* Emphasize simplicity, recovery, and safety
* Avoid framing as "crypto setup"; frame as "secure account connection"

### Technical Notes

* Privy handles authentication + account abstraction
* Platform only receives public identifiers and permissions
* No custody of user secrets by the platform

### Failure Handling

* Graceful fallback if user abandons flow
* Clear retry path without data loss

### Deliverables

* Privy connector integration
* Signup / connect modal copy and logic
* User metadata update on successful connection

---

## Cross-Cutting Concerns

**Logging and Observability**

* Every quest completion and reward issuance must be logged
* Account linking events should be auditable

**Governance Readiness**

* Quest outcomes should be queryable for future reputation weighting
* Account links should support future DAO voting logic

**UX Principle**

* Progressive disclosure: only show complexity when required
* Identity first, economy second, governance third

---

## Summary

At this stage, the platform transitions from *profile-complete* to *participation-capable*. These systems establish the trust surface for rewards, reputation, and future governance without overexposing users to blockchain complexity prematurely.

Once these items are implemented, the platform will be ready for:

* Live quest economies
* Measurable contribution loops
* Credible onchain/offchain hybrid governance

End of document.
