// Firebase has been fully removed. This file is intentionally left as a
// deprecated stub that simply renders nothing to keep any lingering import
// from breaking the build. Use `SupabaseStatusModal` instead.
import React from 'react';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = () => null;

export default FirebaseStatusModal;