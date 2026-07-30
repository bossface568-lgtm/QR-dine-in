import React, { useState, useEffect } from 'react';
import { Branch } from '@qrdine/types';
import { Modal, Button, Badge } from '@qrdine/ui';
import { branchService } from '@qrdine/lib';
import { useAuth } from '../../contexts/AuthContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Edit,
  Calendar,
  Globe,
  Compass,
  Users,
  Grid3X3,
  Building2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface BranchDetailsModalProps {
  branch: Branch | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (branch: Branch) => void;
}

export const BranchDetailsModal: React.FC<BranchDetailsModalProps> = ({
  branch,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { restaurantId } = useAuth();
  const [metrics, setMetrics] = useState<{ staffCount: number; tableCount: number }>({
    staffCount: 0,
    tableCount: 0,
  });

  useEffect(() => {
    if (restaurantId && branch?.id) {
      branchService.getBranchMetrics(restaurantId, branch.id).then((res) => {
        if (res.data) setMetrics(res.data);
      });
    }
  }, [restaurantId, branch?.id]);

  if (!branch) return null;

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

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Branch Profile: ${branch.name}`} size="lg">
      <div className="flex flex-col gap-6 py-2">
        {/* Header Summary */}
        <div className="flex items-start justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100">{branch.name}</h3>
                {branch.branch_code && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-700">
                    {branch.branch_code}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">Timezone: {branch.timezone || 'Asia/Kolkata'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {branch.is_default && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                Default Primary HQ
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

        {/* Operational Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-orange-500" /> Staff
            </span>
            <span className="text-base font-bold text-slate-100 mt-1">{metrics.staffCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Grid3X3 className="w-3.5 h-3.5 text-blue-500" /> Tables
            </span>
            <span className="text-base font-bold text-slate-100 mt-1">{metrics.tableCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-500" /> Hours
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">
              {formatTime(branch.opening_time)} - {formatTime(branch.closing_time)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-500" /> Schedule
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1.5">
              {branch.business_days ? `${branch.business_days.length} Days/Wk` : '7 Days/Wk'}
            </span>
          </div>
        </div>

        {/* Location & Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Address Panel */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 flex flex-col gap-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-orange-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Address & Location
            </h4>
            <div className="flex flex-col gap-1 text-slate-300">
              <span className="font-medium text-slate-100">{branch.address || 'No street address specified'}</span>
              {branch.address_line2 && <span>{branch.address_line2}</span>}
              <span>
                {[branch.city, branch.state, branch.country, branch.postal_code].filter(Boolean).join(', ')}
              </span>
            </div>

            {(branch.latitude || branch.longitude) && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-slate-400">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>Lat: {branch.latitude || 'N/A'}, Long: {branch.longitude || 'N/A'}</span>
              </div>
            )}
          </div>

          {/* Contact & Meta Panel */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 flex flex-col gap-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] text-orange-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Contact & Information
            </h4>
            <div className="flex flex-col gap-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium text-slate-200">{branch.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-medium text-slate-200">{branch.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-300">{formatDate(branch.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Updated:</span>
                <span className="text-slate-300">{formatDate(branch.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onClose();
              onEdit(branch);
            }}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit Branch
          </Button>
        </div>
      </div>
    </Modal>
  );
};
