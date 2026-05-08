# Firebase Security Specification

## Data Invariants
1. **Projects**: Must have an `ownerId` matching the creator's UID.
2. **Shots**: Must reside within a `Project` document. The user must be the owner of the parent project.
3. **Tasks**: Must reside within a `Shot` document. The user must be the owner of the ancestor project.
4. **Timestamps**: All `createdAt` and `updatedAt` (if used) must be server-validated.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Project)**: Create a project with an `ownerId` that is not the requester's UID.
2. **Unauthorized Project Read**: Try to read a project owned by another user.
3. **Ghost Field (Project)**: Create a project with an extra field `isAdmin: true`.
4. **Orphaned Shot**: Try to create a shot with a `projectId` that doesn't match the path.
5. **Privilege Escalation (Shot)**: Try to update a shot's `projectId` to one owned by someone else.
6. **ID Poisoning**: Use a 1.5KB string as a document ID for a project.
7. **Type Mismatch (Shot Version)**: Set `version` to a string instead of an integer.
8. **Malicious Enum (Status)**: Set `status` to "PWNED" instead of the allowed values.
9. **Denial of Wallet (Tasks)**: Attempt to batch-create 10,000 tasks in one request (handled by Firestore throughput, but rules should restrict size).
10. **Shadow Update (Task)**: Update a task but try to change its `shotId`.
11. **PII Leak**: Try to list all shots across all projects without filters (rules must enforce path-based access).
12. **Terminal State Bypass**: (If applicable) Update a "DELIVERED (FINAL)" shot back to "ACTIVE" if we decide that's a terminal state.

## Test Runner Plan
I will generate `firestore.rules.test.ts` to verify these constraints.
