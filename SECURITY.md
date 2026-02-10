# Security Policy

## Overview

This document outlines the security measures implemented in the Gladex Requisition Management System.

## Authentication & Authorization

### Authentication
- Firebase Authentication with Email/Password
- Secure password requirements enforced
- Session management handled by Firebase
- Automatic token refresh

### Authorization (Role-Based Access Control)

#### Staff Role
- Create requisitions
- View own requisitions
- Upload requester signature
- Cannot approve requisitions

#### Procurement Department
- All staff permissions
- Review and approve requisitions at procurement stage
- Add procurement signature
- Move requisitions to account approval

#### Accounts Department
- All staff permissions
- Final approval of requisitions
- Add account signature
- Mark requisitions as approved

#### Managing Director (MD)
- Full administrative access
- Approve at ANY stage (bypass normal workflow)
- Delete requisitions
- View all requisitions
- Requires special access code for registration

## Data Security

### Environment Variables

All sensitive configuration is stored in environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_MD_ACCESS_CODE
```

**Note**: Firebase API keys are safe to expose in frontend code as they are protected by Firebase Security Rules. However, we follow best practice by using environment variables.

### Firebase Security Rules

Firestore security rules enforce:
- Authentication required for all operations
- Role-based read/write permissions
- Users can only modify their own data (except MD)
- Activity logs are immutable (audit trail)
- Requisition approval restricted by department

### Data Validation

- Client-side validation for all form inputs
- Server-side validation via Firebase Security Rules
- Type safety enforced with TypeScript
- Sanitization of user inputs

## Signature Security

### Digital Signatures
- Stored as base64-encoded images in Firestore
- Associated with specific user and timestamp
- Cannot be modified once saved
- Included in PDF exports for verification

### Signature Workflow
1. User uploads signature image
2. Converted to base64 and stored in database
3. Linked to user ID and requisition
4. Immutable once approval is complete

## Access Control Matrix

| Action | Staff | Procurement | Accounts | MD |
|--------|-------|-------------|----------|-----|
| Create Requisition | ✅ | ✅ | ✅ | ✅ |
| View Own Requisitions | ✅ | ✅ | ✅ | ✅ |
| View All Requisitions | ❌ | ❌ | ❌ | ✅ |
| Approve Procurement | ❌ | ✅ | ❌ | ✅ |
| Approve Account | ❌ | ❌ | ✅ | ✅ |
| Delete Requisition | ❌ | ❌ | ❌ | ✅ |
| Upload Signature | ✅ | ✅ | ✅ | ✅ |
| Download PDF | ✅ | ✅ | ✅ | ✅ |

## Audit Trail

### Activity Logging
- All requisition actions logged
- Includes: user, action, timestamp, details
- Logs are immutable (cannot be edited or deleted)
- Stored in separate `activity_log` collection

### Logged Actions
- Requisition creation
- Procurement approval
- Account approval
- Requisition deletion (MD only)
- User registration

## Best Practices

### For Administrators

1. **Change Default MD Access Code**
   - Update `NEXT_PUBLIC_MD_ACCESS_CODE` in production
   - Use a strong, unique code
   - Share securely with authorized personnel

2. **Monitor Firebase Usage**
   - Check Firebase Console regularly
   - Review authentication logs
   - Monitor Firestore read/write operations

3. **Regular Security Reviews**
   - Review Firebase Security Rules quarterly
   - Audit user accounts monthly
   - Check activity logs for suspicious activity

4. **Backup Strategy**
   - Regular Firestore backups
   - Export critical data periodically
   - Test restore procedures

### For Developers

1. **Never Commit Secrets**
   - Always use `.env.local` for sensitive data
   - Verify `.gitignore` includes `.env*`
   - Use `.env.example` for documentation

2. **Code Security**
   - Validate all user inputs
   - Use TypeScript for type safety
   - Follow principle of least privilege
   - Keep dependencies updated

3. **Testing**
   - Test security rules before deployment
   - Verify role-based access control
   - Test authentication flows
   - Validate data permissions

## Vulnerability Reporting

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Contact the development team directly
3. Provide detailed information:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Updates

### Current Version: 1.0.0

- ✅ Firebase configuration secured with environment variables
- ✅ Role-based access control implemented
- ✅ Firestore security rules applied
- ✅ Activity logging for audit trail
- ✅ Signature persistence and verification
- ✅ Input validation and sanitization

### Planned Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Firebase App Check integration
- [ ] Rate limiting for API calls
- [ ] Enhanced password requirements
- [ ] Session timeout configuration
- [ ] IP whitelisting for MD access

## Compliance

### Data Protection
- User data stored securely in Firebase
- Access controlled by authentication
- Audit trail maintained
- Data can be exported/deleted on request

### Password Policy
- Minimum 6 characters (Firebase default)
- Recommend: 12+ characters with mixed case, numbers, symbols
- No password reuse enforcement (consider implementing)

## Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Disable affected accounts
   - Rotate Firebase credentials
   - Review activity logs
   - Notify affected users

2. **Investigation**
   - Identify breach source
   - Assess data exposure
   - Document timeline
   - Implement fixes

3. **Recovery**
   - Restore from backup if needed
   - Update security measures
   - Deploy patches
   - Monitor for further issues

4. **Post-Incident**
   - Conduct security review
   - Update procedures
   - Train users
   - Document lessons learned

## Contact

For security concerns:
- Email: security@gladex.com (example)
- Emergency: Contact system administrator

## Last Updated

February 10, 2026
