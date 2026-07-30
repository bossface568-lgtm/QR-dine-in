import React from 'react';
import { Card } from '@qrdine/ui';

export const MenuPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-bold text-slate-100 mb-2">Menu & Categories Management</h2>
        <p className="text-sm text-slate-400">
          Scaffold list grids and category layouts here. Enables Developer A to build food categorizations and product parameters.
        </p>
      </Card>
    </div>
  );
};
