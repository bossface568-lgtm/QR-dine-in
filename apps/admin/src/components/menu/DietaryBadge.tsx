import React from 'react';
import { DietaryTag } from '@qrdine/types';
import { Badge } from '@qrdine/ui';
import { DIETARY_TAG_OPTIONS } from '@qrdine/shared';

interface DietaryBadgeProps {
  tag: DietaryTag;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ tag }) => {
  const option = DIETARY_TAG_OPTIONS?.find(o => o.value === tag) || { label: tag, color: 'slate' };
  
  return (
    <Badge variant={option.color as any || 'neutral'}>
      {option.label}
    </Badge>
  );
};
