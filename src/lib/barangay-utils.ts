/**
 * Utility functions for multi-barangay support
 */

import type { Barangay } from './types';

/**
 * Default barangay ID for migration purposes
 */
export const DEFAULT_BARANGAY_ID = 'default';

/**
 * Generate a barangay ID from the barangay name
 */
export function generateBarangayId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Create a default barangay object for migration
 */
export function createDefaultBarangay(): Barangay {
  return {
    id: DEFAULT_BARANGAY_ID,
    name: 'Barangay Mina De Oro',
    address: 'Bongabong, Oriental Mindoro',
    municipality: 'Bongabong',
    province: 'Oriental Mindoro',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate barangay data
 */
export function validateBarangay(barangay: Partial<Barangay>): string[] {
  const errors: string[] = [];
  
  if (!barangay.name || barangay.name.trim().length === 0) {
    errors.push('Barangay name is required');
  }
  
  if (!barangay.address || barangay.address.trim().length === 0) {
    errors.push('Address is required');
  }
  
  if (!barangay.municipality || barangay.municipality.trim().length === 0) {
    errors.push('Municipality is required');
  }
  
  if (!barangay.province || barangay.province.trim().length === 0) {
    errors.push('Province is required');
  }
  
  return errors;
}

/**
 * Format barangay display name
 */
export function formatBarangayName(barangay: Barangay): string {
  return `Barangay ${barangay.name}, ${barangay.municipality}, ${barangay.province}`;
}
