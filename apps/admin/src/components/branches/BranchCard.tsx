import React, { useState, useEffect } from 'react';
import { Branch } from '@qrdine/types';
import { Card, Button, Badge } from '@qrdine/ui';
import { branchService } from '@qrdine/lib';
import { useAuth } from '../../contexts/AuthContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Edit,
  Eye,
  Archive,
  Power,
  Trash2,
  Users,
  Grid3X3,
  Calendar
} from 'lucide-react';

interface BranchCardProps {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onView: (branch: Branch) => void;
  onArchive: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onToggleStatus: (branchId: string, currentStatus: boolean) => void;
  onSetDefault: (branchId: string) => void;
}

export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onEdit,
  onView,
  onArchive,
  onDelete,
  onToggleStatus,
  onSetDefault,
}) => {
  const { restaurantId } = useAuth();
  const [metrics, setMetrics] = useState<{ staffCount: number; tableCount: number }>({
    staffCount: 0,
    tableCount: 0,
  });

  useEffect(() => {
    if (restaurantId && branch.id) {
      branchService.getBranchMetrics(restaurantId, branch.id).then((res) => {
        if (res.data) setMetrics(res.data);
      });
    }
  }, [restaurantId, branch.id]);

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
    <Card className="flex flex-col justify-between border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl hover:border-slate-700/80 transition-all duration-200 group">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-slate-100 group-hover:text-orange-400 transition-colors truncate">
                {branch.name}
              </h3>
              {branch.branch_code && (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono font-semibold border border-slate-700/60">
                  {branch.branch_code}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <span>
                {[branch.address, branch.city, branch.state].filter(Boolean).join(', ') || 'No address specified'}
              </span>
            </p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {branch.is_default && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                Default HQ
              </span>
            )}
            {branch.is_archived ? (
              <Badge variant="archived">Archived</Badge>
            ) : branch.is_active ? (
              <Badge variant="available">Active</Badge>
            ) : (
              <Badge variant="inactive">Inactive</Badge>
            )}
          </div>
        </div>

        <hr className="border-slate-800/60" />

        {/* Branch Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">
              {formatTime(branch.opening_time)} - {formatTime(branch.closing_time)}
            </span>
          </div>

          {branch.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate">{branch.phone}</span>
            </div>
          )}

          {branch.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate">{branch.email}</span>
            </div>
          )}

          {branch.business_days && branch.business_days.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate text-slate-400">
                {branch.business_days.length === 7 ? '7 Days / Week' : `${branch.business_days.length} Days / Wk`}
              </span>
            </div>
          )}
        </div>

        {/* Operational Metrics Sub-bar */}
        <div className="flex items-center gap-4 py-2 px-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 mt-1">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span className="font-semibold text-slate-200">{metrics.staffCount}</span> Staff
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Grid3X3 className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold text-slate-200">{metrics.tableCount}</span> Tables
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-800/60 pt-4 mt-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(branch)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(branch)}
            leftIcon={<Edit className="w-3.5 h-3.5" />}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Edit
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {!branch.is_default && !branch.is_archived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetDefault(branch.id)}
              leftIcon={<Star className="w-3.5 h-3.5 text-amber-400" />}
              className="text-xs text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10"
              title="Set as Primary Default Branch"
            >
              Make Default
            </Button>
          )}

          {!branch.is_archived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(branch.id, branch.is_active)}
              leftIcon={<Power className={`w-3.5 h-3.5 ${branch.is_active ? 'text-rose-400' : 'text-emerald-400'}`} />}
              className={`text-xs ${branch.is_active ? 'hover:bg-rose-500/10 text-slate-400 hover:text-rose-300' : 'hover:bg-emerald-500/10 text-emerald-400'}`}
              title={branch.is_active ? 'Deactivate Branch' : 'Activate Branch'}
            >
              {branch.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          )}

          {!branch.is_archived && !branch.is_default && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(branch)}
              leftIcon={<Archive className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400" />}
              className="text-xs text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 p-1.5"
              title="Archive Branch"
            />
          )}

          {!branch.is_default && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(branch)}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />}
              className="text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5"
              title="Permanently Delete Branch"
            />
          )}
        </div>
      </div>
    </Card>
  );
};
