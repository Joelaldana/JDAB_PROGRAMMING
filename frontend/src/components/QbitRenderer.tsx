import React from 'react';
import { Qbit } from './Qbit';

export const QbitRenderer: React.FC<{ skinId: string; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ skinId, size = 'md', className = '' }) => (
  <Qbit skinId={skinId} size={size} className={className} />
);
