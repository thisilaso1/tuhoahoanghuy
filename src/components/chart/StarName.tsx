import React from 'react';
import { ELEMENT_LABEL, STAR_ELEMENTS } from '../../domain/starElements';

interface StarNameProps { starId: string; name: string; className?: string }
const warnedUnknownStars = new Set<string>();

export const StarName: React.FC<StarNameProps> = ({ starId, name, className }) => {
  const metadata = STAR_ELEMENTS[starId];
  if (!metadata && import.meta.env.DEV && !warnedUnknownStars.has(starId)) {
    warnedUnknownStars.add(starId);
    console.warn(`[StarName] Missing Ngũ Hành metadata for star: ${starId}`);
  }
  const primary = metadata?.primary;
  const secondary = metadata?.secondary;
  const title = primary
    ? `Ngũ Hành: ${ELEMENT_LABEL[primary]}${secondary ? ` · Hành phụ: ${ELEMENT_LABEL[secondary]}` : ''}`
    : name;

  return <span className={`star-name${className ? ` ${className}` : ''}`} data-star-id={starId} data-element={primary ?? 'UNKNOWN'} title={title}>{name}</span>;
};
