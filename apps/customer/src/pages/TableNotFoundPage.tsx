import React from 'react';
import { KeyRound, ShieldAlert, AlertTriangle } from 'lucide-react';

interface TableNotFoundPageProps {
  restaurantName?: string;
  code?: string;
  message?: string;
}

export const TableNotFoundPage: React.FC<TableNotFoundPageProps> = ({ restaurantName, code, message }) => {
  const isExpired = code === 'EXPIRED_TABLE_TOKEN';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
          isExpired 
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
        }`}>
          {isExpired ? <AlertTriangle className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        <h1 className="text-2xl font-extrabold text-slate-100 mb-2">
          {isExpired ? 'This QR Code Has Expired' : 'Invalid Table Code'}
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {message || (isExpired 
            ? 'This QR code has been regenerated or updated by restaurant staff. Please scan the fresh QR code located on your table.' 
            : `The table token in this QR code is invalid or does not belong to ${restaurantName || 'this restaurant'}. Please scan a valid table QR code.`)}
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
          <KeyRound className={`w-4 h-4 ${isExpired ? 'text-rose-400' : 'text-amber-400'}`} />
          <span>Error Code: {code || 'INVALID_TABLE_TOKEN'}</span>
        </div>
      </div>
    </div>
  );
};
