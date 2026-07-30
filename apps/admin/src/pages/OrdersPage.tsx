import React from 'react';
import { Card } from '@qrdine/ui';

export const OrdersPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-bold text-slate-100 mb-2">Live Order Manager</h2>
        <p className="text-sm text-slate-400">
          Scaffold lists of incoming order transactions and statuses here. Link up realtime listeners to auto-refresh rows.
        </p>
      </Card>
    </div>
  );
};
