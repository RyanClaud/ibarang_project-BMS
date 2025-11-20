# Firebase Authentication Cleanup Guide

## Why Auth Accounts Remain After Deletion

When you delete a staff account in the iBarangay system, the user is **disabled** but their Firebase Authentication account remains. This is because:

1. **Security Restriction**: Client-side apps cannot delete Firebase Auth accounts for security reasons
2. **Audit Trail**: Keeping auth accounts helps maintain a record of who had access
3. **Reversibility**: Accounts can be re-enabled if needed

## What Happens When You Delete a User

✅ **User is blocked from logging in**  
✅ **User document is marked as deleted in Firestore**  
✅ **User is demoted to "Resident" role (no staff permissions)**  
✅ **User disappears from the staff list**  
❌ **Firebase Auth account remains** (needs manual cleanup)

## How to Clean Up Firebase Auth Accounts

### Option 1: Manual Deletion (Firebase Console)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** in the left sidebar
4. Click **Users** tab
5. Find the user by email
6. Click the **⋮** (three dots) menu
7. Click **Delete account**
8. Confirm deletion

### Option 2: Batch Deletion (Firebase CLI)

If you have many accounts to delete:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Use Firebase Admin SDK script
node scripts/cleanup-auth-accounts.js
```

### Option 3: Cloud Function (Automated)

Deploy the Cloud Function provided in `functions/deleteUser.js`:

```bash
# Initialize Firebase Functions
firebase init functions

# Deploy the function
firebase deploy --only functions:deleteUserAccount
```

Then update the app to call this function instead of soft delete.

## Recommended Workflow

### For Development/Testing:
- Use soft delete (current implementation)
- Manually clean up auth accounts periodically from Firebase Console

### For Production:
- Deploy the Cloud Function for complete deletion
- Update the `deleteUser` function to call the Cloud Function
- Auth accounts will be automatically deleted

## Identifying Deleted Users in Firebase Console

Deleted users in the system will:
- Still appear in Firebase Authentication
- Have their email visible
- Show last sign-in date
- **Cannot log in** (they'll see "Account Disabled" message)

To identify them:
1. Check the Firestore `users` collection
2. Look for documents with `isDeleted: true`
3. Match the email addresses with Firebase Auth

## Security Notes

⚠️ **Important**: Even though auth accounts remain, deleted users:
- Cannot access the system
- Cannot view any data
- Cannot perform any actions
- Are blocked at login

The remaining auth accounts are **harmless** but should be cleaned up periodically for good housekeeping.

## Future Enhancement

Consider implementing:
1. **Scheduled cleanup**: Cloud Function that runs weekly to delete auth accounts marked as deleted
2. **Admin dashboard**: Show list of auth accounts that need cleanup
3. **Bulk operations**: Delete multiple auth accounts at once

## Questions?

If you need help with Firebase Auth cleanup, refer to:
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- Cloud Function template in `functions/deleteUser.js`
