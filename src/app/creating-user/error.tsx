'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    console.error('Error on creating-user page:', error);
    
    // Redirect to settings page
    window.location.href = '/settings?tab=users';
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4 p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Redirecting...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we redirect you back.
        </p>
      </div>
    </div>
  );
}
