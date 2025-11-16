import { useMemo } from 'react';
import type { DocumentRequest } from '@/lib/types';

export function useNotificationCount(requests: DocumentRequest[] | null) {
  return useMemo(() => {
    if (!requests) return 0;
    
    // Count important notifications
    const readyForPickup = requests.filter(r => r.status === 'Ready for Pickup').length;
    const approved = requests.filter(r => r.status === 'Approved' && r.amount > 0).length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    
    return readyForPickup + approved + rejected;
  }, [requests]);
}
