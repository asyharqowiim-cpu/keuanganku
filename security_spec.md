# Security Specification — KasaVault Firestore Rules

## 1. Data Invariants
1. **Strict Tenant Isolation**: Every document under `/users/{userId}/{collection}/{docId}` must belong exclusively to `request.auth.uid == userId`, and `data.userId == request.auth.uid`.
2. **Verified Identity**: All reads and writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Path ID Hardening**: All path variables (`userId`, `transactionId`, `savingId`, `budgetId`, `planId`) on single-document operations (`get`, `create`, `update`, `delete`) must match `^[a-zA-Z0-9_\-]+$` with length `1..128`.
4. **Strict Schema & Volumetric Bounds**: Every string field enforces `.size() <= maxLength` and regex patterns where specified in `firebase-blueprint.json`. Shadow fields are rejected via `.keys().hasAll(...)` and `.keys().hasOnly(...)`.
5. **Temporal & Ownership Immutability**: `createdAt` must equal `request.time` on `create` and remain immutable (`incoming().createdAt == existing().createdAt`) on `update`. `updatedAt` must always equal `request.time`. `userId` is immutable.
6. **Terminal State Locking**: Once a `FinancialPlan` reaches `status == 'completed'`, further updates are locked (`existing().status != 'completed'`).
7. **List Query Enforcement**: Every `allow list` rule evaluates `resource.data.userId == request.auth.uid` in addition to `isOwner(userId)`.

## 2. The "Dirty Dozen" Payloads
1. **Cross-Tenant Write (`userId` Mismatch)**: Authenticated user `user_A` writes to `/users/user_B/transactions/tx_1` or sets `userId: "user_B"`.
2. **Unverified Email Spoof**: Authenticated user with `email_verified: false` attempts to create a transaction.
3. **Shadow Field Injection**: Payload includes an undocumented field `isAdmin: true` on `/users/user_A/transactions/tx_1`.
4. **ID Poisoning Attack**: Document ID contains spaces or special characters (`tx$bad!id` or >128 chars).
5. **Oversized Ciphertext Exhaustion ("Denial of Wallet")**: `encryptedPayload` exceeds `4096` characters.
6. **Negative or Overflow Amount**: `amount` is negative (`-50000`) or exceeds `1000000000000`.
7. **Forged Client Timestamp on Create**: `createdAt` does not match `request.time`.
8. **Mutating Immutable `createdAt` on Update**: Updating a transaction while modifying `createdAt`.
9. **Ownership Transfer Attack on Update**: Changing `userId` from `user_A` to `user_B` during an `update`.
10. **Terminal State Bypass on FinancialPlan**: Attempting to update a `FinancialPlan` whose existing `status` is already `'completed'`.
11. **Invalid Enum Injection**: Creating a transaction with `type: "transfer_hack"` instead of `'income'` or `'expense'`.
12. **Malformed Date / MonthKey Pattern**: Creating a budget limit with `monthKey: "2026/13"` instead of `^[0-9]{4}-[0-9]{2}$`.
