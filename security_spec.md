# Security Specification - Rexdevcyber

## Data Invariants
- A contact submission must have a valid name, email, and message.
- `createdAt` must be set to the server time.
- Contact submissions are "write-only" for the public; only admins can list or read them.

## The "Dirty Dozen" Payloads

1. **Anonymous Read**: Attempt to read all contacts without authentication. (Denied)
2. **Identity Spoofing**: Attempt to create a contact with a fake `ownerId`. (Denied - we don't have ownerId yet, but good to note)
3. **Ghost Field Injection**: Attempt to create a contact with an extra `isProcessed: true` field. (Denied)
4. **Invalid Type**: Send `name: 123` (integer). (Denied)
5. **Resource Poisoning**: Send a 2MB message string. (Denied)
6. **Future Timestamp**: Send `createdAt` in the future. (Denied)
7. **Cross-User Edit**: Attempt to update someone else's contact submission. (Denied)
8. **Malicious ID**: Create a contact with ID `../../../etc/passwd`. (Denied)
9. **Blanket Query**: Query for all contacts where `email != ""`. (Denied)
10. **Schema Bypass**: Create a contact missing the `email` field. (Denied)
11. **PII Leak**: Authenticated user trying to `get` a specific contact document they didn't create. (Denied)
12. **Admin Escalation**: Attempt to write to a hypothetical `admins` collection. (Denied)

## Test Runner (Mock Logic)
*Tests would verify PERMISSION_DENIED for all the above.*
