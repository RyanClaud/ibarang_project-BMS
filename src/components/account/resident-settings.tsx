'use client';

import { EditProfileForm } from "./edit-profile-form";
import { ChangePasswordForm } from "./change-password-form";

export function ResidentSettings() {
  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="animate-fade-in [--animation-delay:100ms] opacity-0">
        <EditProfileForm />
      </div>
      
      {/* Security Section */}
      <div className="animate-fade-in [--animation-delay:200ms] opacity-0">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
