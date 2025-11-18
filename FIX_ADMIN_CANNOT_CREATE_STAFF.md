# 🔧 Fix: Admin Cannot Create Staff Accounts

## Problem

Barangay admin gets "Access Denied - Only administrators can access the staff management page" when trying to create staff accounts.

## Root Cause

The barangay admin account doesn't have the correct role. The system requires:
- Role = "Admin" OR
- isSuperAdmin = true

## Quick Fix

### Option 1: Check Your Role (Recommended)

Run this diagnostic script to see what role your account has:

```bash
npx tsx src/scripts/check-admin-role.ts
```

This will show:
- All users and their roles
- Which barangays have admins
- Recommendations for fixes

### Option 2: Fix in Firestore Console

1. **Go to Firestore Console**
2. **Navigate to `users` collection**
3. **Find YOUR admin account** (the one you're logged in with)
4. **Check the `role` field:**
   - If it says anything other than `"Admin"`, change it to `"Admin"`
   - Or add field `isSuperAdmin: true`
5. **Save changes**
6. **Refresh your browser** and try again

### Option 3: Verify Barangay Setup

When you created the barangay, an admin account should have been created. Check:

1. **In Firestore → `users` collection**
2. **Find user with email like:** `admin@barangaycarmundo.com`
3. **Verify:**
   - `role` = `"Admin"`
   - `barangayId` = (your barangay's ID)
   - `email` matches what you're using to login

## Understanding Roles

### Admin vs Barangay Captain

**Admin (Barangay Admin):**
- Full control over the barangay system
- Can create/edit/delete staff accounts
- Can manage all settings
- Can access all features
- **This is what you need to create staff**

**Barangay Captain:**
- A staff member role
- High-level oversight
- Views dashboards and reports
- **Cannot create other staff accounts** (by default)

### Correct Setup for a Barangay:

```
Barangay Carmundo
├─ Admin (role: "Admin") ← YOU (can create staff)
├─ Barangay Captain (role: "Barangay Captain") ← Staff member
├─ Secretary (role: "Secretary") ← Staff member
├─ Treasurer (role: "Treasurer") ← Staff member
└─ Residents (role: "Resident") ← Citizens
```

## Step-by-Step Fix

### 1. Identify Your Account

Log in and check the browser console:
```javascript
// In browser console (F12)
console.log(currentUser);
```

Look for:
- `role`: Should be "Admin"
- `barangayId`: Should match your barangay
- `isSuperAdmin`: true or false

### 2. Fix the Role

**In Firestore:**
```
users/{your-user-id}
├─ role: "Admin"  ← Change this
├─ barangayId: "your-barangay-id"
├─ email: "your-email@domain.com"
└─ isSuperAdmin: false (or true)
```

### 3. Test

1. Refresh browser (Ctrl+F5)
2. Go to Settings → Users tab
3. Try to add a new user
4. Should work now!

## Common Mistakes

### Mistake 1: Admin is Actually a Captain

**Problem:** The barangay admin account was created with role "Barangay Captain"

**Fix:** Change role to "Admin" in Firestore

### Mistake 2: Wrong Barangay ID

**Problem:** Admin account has different barangayId than the barangay

**Fix:** Update barangayId to match

### Mistake 3: No Admin Account

**Problem:** Barangay was created but no admin account exists

**Fix:** Create admin account via Super Admin or initial setup

## Prevention

When creating a new barangay:

1. **Via Initial Setup:**
   - Creates barangay
   - Creates admin account automatically
   - Admin has role "Admin"

2. **Via Super Admin:**
   - Create barangay first
   - Then create admin user
   - Set role to "Admin"
   - Set correct barangayId

## Still Not Working?

### Check These:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Log out and log back in**
3. **Check Firestore rules** - make sure they allow user creation
4. **Check browser console** for error messages
5. **Verify Firebase Authentication** is enabled

### Get Help:

Run the diagnostic script:
```bash
npx tsx src/scripts/check-admin-role.ts
```

Then contact support with the output:
- Email: ibarangays@gmail.com
- Developer: ryanclaud4@gmail.com

---

**Last Updated:** November 2024
