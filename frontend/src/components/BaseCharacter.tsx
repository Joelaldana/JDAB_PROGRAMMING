import React from 'react';
import { Qbit } from './Qbit';

export const BaseCharacter: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string; layers?: unknown }> = ({ size = 'md', className = '' }) => (
  <Qbit skinId="default" size={size} className={className} />
);
