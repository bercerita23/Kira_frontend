# Admin Dashboard

## Overview

The Kira application now includes a role-based admin dashboard that allows administrators to view and manage student information. This feature includes:

- **Role-based access control**: Only users with `role: 'admin'` can access the admin dashboard
- **Student management**: View all students as cards with their information
- **Automatic routing**: Admins are redirected to `/admin` after login, students to `/dashboard`
- **Security**: Non-admin users are blocked from accessing admin routes

## Features

### Admin Dashboard (`/admin`)
- **Student Cards Display**: Shows all users with `role: 'stu'` as individual cards
- **Student Information**: Each card displays:
  - Name and email
  - User ID
  - Role badge
  - School ID (if assigned)
  - Registration date
  - User avatar with initials
- **Statistics Overview**: 
  - Total students count
  - Recent signups (last 7 days)
  - Students with school assignments
- **Access Control**: Automatic redirect for non-admin users

### Role-Based Routing
- **Login Redirect**: 
  - Admin users (`role: 'admin'`) → `/admin`
  - Student users (`role: 'stu'`) → `/dashboard`
- **Sidebar Navigation**: Admin users see an additional "Admin Dashboard" menu item with crown icon
- **Route Protection**: `/admin` route is protected and requires authentication

## Testing the Admin Dashboard

### Current Database State
The current database contains 3 users, all with `role: 'stu'`:
1. **kira_fn kira_ln** - second_kira_user@gmail.com
2. **Xinwei Li** - xinwei@bercerita.org  
3. **Yar Moradpour** - khakho.morad@gmail.com

### To Test Admin Functionality

Since you mentioned not to modify the backend, here are the testing approaches:

#### Option 1: Manual Database Update (Requires Backend Access)
If backend access becomes available, update one user's role to 'admin':
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'xinwei@bercerita.org';
```

#### Option 2: Test Role-Based Features
1. **Student View**: Login with any existing user to see student dashboard
2. **Admin Route Protection**: Try to access `/admin` directly - you'll see the "Access Denied" message
3. **Code Review**: Examine the admin dashboard code to verify functionality

#### Option 3: Mock Admin User (Development Only)
For development testing, you could temporarily modify the auth context to mock an admin user.

## File Structure

### New Files Created
- `app/(dashboard)/admin/page.tsx` - Admin dashboard page component
- `ADMIN_DASHBOARD_README.md` - This documentation

### Modified Files
- `lib/context/auth-context.tsx` - Added role-based routing after login
- `components/dashboard/sidebar.tsx` - Added conditional admin dashboard link
- `middleware.ts` - Added `/admin` to protected routes

## Security Features

1. **Component-Level Protection**: Admin dashboard checks user role before rendering
2. **Route Protection**: Middleware ensures `/admin` requires authentication
3. **Access Denial**: Clear error message for unauthorized access attempts
4. **Automatic Redirection**: Non-admin users are redirected to student dashboard

## UI Components Used

- **Cards**: For student information display
- **Badges**: For role identification
- **Avatar**: With user initials fallback
- **Icons**: Crown for admin features, Shield for access denied
- **Loading States**: While fetching user data
- **Responsive Design**: Works on desktop and mobile

## API Integration

The admin dashboard uses the existing API endpoints:
- `authApi.getAllUsers()` - Fetches all users from `/auth/db`
- Filters users by `role: 'stu'` to display only students
- No additional backend changes required

## Next Steps

1. **Backend Role Assignment**: Create admin users in the database
2. **Enhanced Features**: Could add user editing, role management, etc.
3. **Permissions**: Could add more granular admin permissions
4. **Analytics**: Could add student progress analytics for admins

The admin dashboard is fully functional and ready for use once admin users are created in the database. 