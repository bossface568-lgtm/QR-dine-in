import React from 'react';
import { Branch } from '@qrdine/types';
import { Button, Badge } from '@qrdine/ui';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Edit,
  Eye,
  Archive,
  Power,
  Trash2
} from 'lucide-react';

interface BranchTableViewProps {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
  onView: (branch: Branch) => void;
  onArchive: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onToggleStatus: (branchId: string, currentStatus: boolean) => void;
  onSetDefault: (branchId: string) => void;
}

export const BranchTableView: React.FC<BranchTableViewProps> = ({
  branches,
  onEdit,
  onView,
  onArchive,
  onDelete,
  onToggleStatus,
  onSetDefault,
}) => {
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return 'N/A';
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
            <th className="py-3.5 px-4">Branch Details</th>
            <th className="py-3.5 px-4">Location</th>
            <th className="py-3.5 px-4">Contact</th>
            <th className="py-3.5 px-4">Operating Hours</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {branches.map((b) => (
            <tr key={b.id} className="hover:bg-slate-800/30 transition-colors group">
              {/* Branch Name & Code */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors text-sm">
                    {b.name}
                  </span>
                  {b.branch_code && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700/60">
                      {b.branch_code}
                    </span>
                  )}
                  {b.is_default && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      Default HQ
                    </span>
                  )}
                </div>
              </td>

              {/* Address */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {[b.address, b.city, b.state].filter(Boolean).join(', ') || 'N/A'}
                  </span>
                </div>
              </td>

              {/* Contact */}
              <td className="py-3.5 px-4">
                <div className="flex flex-col gap-0.5">
                  {b.phone && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <Phone className="w-3 h-3 text-slate-500" /> {b.phone}
                    </span>
                  )}
                  {b.email && <span className="text-slate-500 text-[11px] truncate max-w-[160px]">{b.email}</span>}
                </div>
              </td>

              {/* Hours */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {formatTime(b.opening_time)} - {formatTime(b.closing_time)}
                  </span>
                </div>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4">
                {b.is_archived ? (
                  <Badge variant="archived">Archived</Badge>
                ) : b.is_active ? (
                  <Badge variant="available">Active</Badge>
                ) : (
                  <Badge variant="inactive">Inactive</Badge>
                )}
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(b)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    className="text-xs text-slate-400 hover:text-slate-200 p-1.5"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(b)}
                    leftIcon={<Edit className="w-3.5 h-3.5" />}
                    className="text-xs text-slate-400 hover:text-slate-200 p-1.5"
                  />

                  {!b.is_default && !b.is_archived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefault(b.id)}
                      leftIcon={<Star className="w-3.5 h-3.5 text-amber-400" />}
                      className="text-xs text-amber-400 hover:bg-amber-500/10 p-1.5"
                      title="Make Default HQ"
                    />
                  )}

                  {!b.is_archived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(b.id, b.is_active)}
                      leftIcon={<Power className={`w-3.5 h-3.5 ${b.is_active ? 'text-rose-400' : 'text-emerald-400'}`} />}
                      className="text-xs p-1.5"
                      title={b.is_active ? 'Deactivate' : 'Activate'}
                    />
                  )}

                  {!b.is_archived && !b.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchive(b)}
                      leftIcon={<Archive className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400" />}
                      className="text-xs text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 p-1.5"
                      title="Archive"
                    />
                  )}

                  {!b.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(b)}
                      leftIcon={<Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />}
                      className="text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5"
                      title="Permanently Delete"
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
