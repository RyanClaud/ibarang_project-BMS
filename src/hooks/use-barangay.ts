/**
 * Custom hook for barangay-related operations
 */

import { useAppContext } from "@/contexts/app-context";
import type { Barangay } from "@/lib/types";

export function useBarangay() {
  const { currentUser, barangayConfig } = useAppContext();

  const isSuperAdmin = currentUser?.isSuperAdmin === true;
  const canManageBarangay = isSuperAdmin || currentUser?.role === "Admin";
  const currentBarangay = barangayConfig;
  const currentBarangayId = currentUser?.barangayId;

  return {
    currentBarangay,
    currentBarangayId,
    isSuperAdmin,
    canManageBarangay,
  };
}
