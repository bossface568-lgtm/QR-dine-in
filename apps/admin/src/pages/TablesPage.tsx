import React from 'react';
import { Card } from '@qrdine/ui';

export const TablesPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-bold text-slate-100 mb-2">Seating & Table Manager</h2>
        <p className="text-sm text-slate-400">
          Scaffold restaurant table layouts and QR code printable sheets generators here.
        </p>
      </Card>
    </div>
  );
};
