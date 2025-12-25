# User Account System — Features & Testing Standards

## Purpose
This document defines the **required features**, **acceptance criteria**, and **testing standards** for the User Account system that will support quests, rewards, governance, and future DAO-style participation.

This is the identity primitive for the platform.

---

## 1. Core Account Features

### 1.1 User Registration
**Description**
Users must be able to register an account on the platform.

**Requirements**
- Support email-based registration, but user must always have a wallet
- Email must be unique
- Passwords must be securely handled by a trusted auth provider
- Account creation timestamp stored and blockchain address stored
- User assigned a permanent internal UUID

**Acceptance Criteria**
- User can successfully register with a valid email
- Duplicate emails are rejected
- Invalid email formats are rejected
- User record is created in the database on success

**Testing Standards**
- Unit test: email validation
- Integration test: auth provider → database user creation
- Negative test: duplicate email registration
- Security test: password never stored in plaintext

---

### 1.2 Authentication (Login / Logout)
**Description**
Users must be able to log in and log out securely.

**Requirements**
- Secure session or token-based authentication
- Automatic session expiration
- Logout invalidates active session

**Acceptance Criteria**
- Valid credentials log the user in
- Invalid credentials are rejected
- Logged-out users cannot access protected routes

**Testing Standards**
- Unit test: token/session validation
- Integration test: login → protected route access
- Negative test: expired session access denial

---

## 2. User Profile Features

### 2.1 Unique Username System
**Description**
Each user must have a unique, human-readable username.

**Requirements**
- Username must be unique across the platform
- Username availability checked in real time
- Username is editable by the user
- Username change frequency is rate-limited (e.g. once per 30 days)
- Old usernames cannot be reused

**Acceptance Criteria**
- User cannot select an already-taken username
- Profanity filter with a don't be silly pop-up
- Username updates persist correctly
- Rate limits are enforced
- Username uniqueness is enforced at the database level

**Testing Standards**
- Unit test: username validation rules
- Integration test: availability check API
- Concurrency test: simultaneous username claims
- Negative test: reuse of historical usernames

---

### 2.2 Profile Image (Avatar)
**Description**
Users can upload and change a profile image.

**Requirements**
- Image stored in object storage (not database)
- Supported formats defined (e.g. JPG, PNG, WEBP)
- File size limits enforced
- Avatar URL linked to user profile

**Acceptance Criteria**
- User can upload a valid image
- Invalid formats are rejected
- Oversized files are rejected
- Avatar updates reflect immediately in UI

**Testing Standards**
- Unit test: file type and size validation
- Integration test: upload → storage → profile update
- Negative test: malicious file upload attempts

---

### 2.3 Profile Editing
**Description**
Users can edit their public profile details.

**Requirements**
- Editable fields clearly defined (username, avatar)
- Immutable fields protected (UUID, creation date)
- Changes logged with timestamps

**Acceptance Criteria**
- User can update allowed fields
- User cannot modify protected fields
- Profile updates persist correctly

**Testing Standards**
- Unit test: editable vs non-editable fields
- Integration test: profile update API
- Security test: direct API manipulation attempts

---

## 3. Wallet Association

### 3.1 Wallet Linking
**Description**
Users can link a crypto wallet to their account.

**Requirements**
- Wallet address stored as reference only (no private keys)
- Wallet ownership verified via signature
- Multiple wallets optional but controlled

**Acceptance Criteria**
- Valid wallet can be linked
- Invalid signature is rejected
- Wallet address is unique per user (unless explicitly allowed)

**Testing Standards**
- Unit test: signature verification
- Integration test: wallet connect → profile update
- Negative test: wallet reuse across accounts

---

## 4. Authorization & Roles

### 4.1 User Roles
**Description**
Support for role-based permissions.
Support for badges and accolades that can be earned through quests.

**Requirements**
- Default role: user
- Optional roles: admin, moderator, agent
- Role stored in user profile

**Acceptance Criteria**
- Role-based access is enforced
- Unauthorized actions are blocked

**Testing Standards**
- Unit test: role permission checks
- Integration test: restricted route access
- Negative test: privilege escalation attempts

---

## 5. Quest & Governance Readiness (Identity Constraints)

### 5.1 Identity Integrity
**Description**
User accounts must be resilient against abuse in voting and rewards.

**Requirements**
- One account per unique identity (best-effort)
- Rate limiting on sensitive actions (voting, rewards)
- Immutable user UUID for governance tracking

**Acceptance Criteria**
- Duplicate account abuse is mitigated
- Voting actions are correctly attributed
- Quest rewards are tied to persistent user identity

**Testing Standards**
- Integration test: voting attribution
- Load test: rapid action attempts
- Abuse test: multi-account simulation

---

## 6. Data & Security Standards

### 6.1 Data Integrity
**Requirements**
- Database-level constraints for uniqueness
- Referential integrity between users, wallets, quests

**Testing Standards**
- Schema validation tests
- Migration rollback tests

---

### 6.2 Security
**Requirements**
- No sensitive data exposed to client
- API endpoints protected by authentication
- Rate limiting on auth and profile endpoints

**Testing Standards**
- Penetration testing (basic)
- API abuse simulation
- Session hijacking prevention tests

---

## 7. Observability & Monitoring

### 7.1 Logging
**Requirements**
- Account creation, profile changes, wallet links logged
- Logs exclude sensitive data

**Testing Standards**
- Log presence validation
- Redaction verification

---

## 8. Definition of Done (DoD)

A feature is considered complete when:
- All acceptance criteria are met
- All defined tests pass
- No critical security issues identified
- Feature integrates cleanly with quests and rewards

---

## Notes
This system is the **identity layer** for:
- Rewards
- Reputation
- Voting
- Governance evolution

Changes to this layer must be treated as protocol-level decisions.