import React from 'react';
import { Card } from '@qrdine/ui';

export const StaffPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-bold text-slate-100 mb-2">Staff & RBAC Permissions</h2>
        <p className="text-sm text-slate-400">
          Scaffold restaurant staff registration lists, emails, and role selections here.
        </p>
      </Card>
    </div>
  );
};
