import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { SystemStatus } from '../components/dashboard/SystemStatus';
import { Card, Button, Spinner } from '@qrdine/ui';
import { restaurantService, insforge } from '@qrdine/lib';
import { 
  ShoppingBag, 
  DollarSign, 
  Grid3X3, 
  UtensilsCrossed, 
  FolderTree, 
  MapPin, 
  Users, 
  Users2,
  AlertTriangle,
  FolderPlus,
  PlusCircle,
  PlusSquare,
  ArrowRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { restaurant, branches, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [staffCount, setStaffCount] = useState<number | null>(null);

  // Future-ready mock counts for non-existent relational tables
  const [categoryCount, setCategoryCount] = useState(0);
  const [menuItemCount, setMenuItemCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);

  const fetchDashboardStats = async () => {
    if (!restaurant) return;
    try {
      setLoading(true);
      
      // 1. Fetch Staff Count (Table exists)
      const { data: staffData } = await insforge.database
        .from('staff')
        .select('id', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id);
      
      setStaffCount(staffData ? (staffData as any).length || 0 : 0);

      // 2. Safely query other tables if they are created in the future
      // Since they do not exist yet, we wrap them or fallback to placeholders.
      // This ensures zero crash triggers on start.
    } catch {
      setStaffCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [restaurant]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Header Banner */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Hello, {restaurant?.name || 'Restaurant Owner'}!
        </h2>
        <p className="text-xs text-slate-400">
          Here is your operational snapshot for today. Use the sidebar to configure locations and menus.
        </p>
      </div>

      {/* Dynamic Inline Onboarding Empty State Alerts */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Setup Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* No Branches */}
          {branches.length === 0 && (
            <Card className="p-5 border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div className="flex-1 flex flex-col gap-1 text-sm">
                <span className="font-bold text-slate-200">No Branch Outlets Setup</span>
                <span className="text-xs text-slate-400">To scan and receive orders, configure your primary branches.</span>
                <Link to="/branches">
                  <Button size="sm" className="mt-2.5 w-fit bg-amber-500 hover:bg-amber-600 border-0">
                    Setup Branch
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* No Categories */}
          {categoryCount === 0 && (
            <Card className="p-5 border border-orange-500/20 bg-orange-500/5 flex items-start gap-4">
              <span className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <FolderPlus className="w-5 h-5" />
              </span>
              <div className="flex-1 flex flex-col gap-1 text-sm">
                <span className="font-bold text-slate-200">Create Your First Menu Category</span>
                <span className="text-xs text-slate-400">Add categories like "Appetizers" or "Beverages" to start organizing.</span>
                <Link to="/categories">
                  <Button size="sm" className="mt-2.5 w-fit bg-orange-500 hover:bg-orange-600 border-0">
                    Create Category
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* No Menu Items */}
          {menuItemCount === 0 && (
            <Card className="p-5 border border-blue-500/20 bg-blue-500/5 flex items-start gap-4">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <PlusCircle className="w-5 h-5" />
              </span>
              <div className="flex-1 flex flex-col gap-1 text-sm">
                <span className="font-bold text-slate-200">No Menu Items Configured</span>
                <span className="text-xs text-slate-400">Add dishes, pricing, description, and allergens to open checkout.</span>
                <Link to="/menu">
                  <Button size="sm" className="mt-2.5 w-fit bg-blue-500 hover:bg-blue-600 border-0">
                    Add Menu Item
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* No Tables */}
          {tableCount === 0 && (
            <Card className="p-5 border border-purple-500/20 bg-purple-500/5 flex items-start gap-4">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <PlusSquare className="w-5 h-5" />
              </span>
              <div className="flex-1 flex flex-col gap-1 text-sm">
                <span className="font-bold text-slate-200">Generate Tables & QR Codes</span>
                <span className="text-xs text-slate-400">Define seating arrangements and export scannable table QR stickers.</span>
                <Link to="/tables">
                  <Button size="sm" className="mt-2.5 w-fit bg-purple-500 hover:bg-purple-600 border-0">
                    Create Table
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Dashboard Stats Widgets System */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metrics Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardWidget 
            title="Today's Orders" 
            value={ordersToday} 
            description="Active order tickets processed"
            icon={<ShoppingBag className="w-4 h-4" />}
            loading={loading}
          />
          <DashboardWidget 
            title="Today's Revenue" 
            value={`₹${revenueToday}`} 
            description="Sales completed today"
            icon={<DollarSign className="w-4 h-4" />}
            loading={loading}
          />
          <DashboardWidget 
            title="Active Tables" 
            value={tableCount} 
            description="Tables currently occupied"
            icon={<Grid3X3 className="w-4 h-4" />}
            loading={loading}
          />
          <DashboardWidget 
            title="Menu Items" 
            value={menuItemCount} 
            description="Dishes published in active branch"
            icon={<UtensilsCrossed className="w-4 h-4" />}
            loading={loading}
          />
          <DashboardWidget 
            title="Menu Categories" 
            value={categoryCount} 
            description="Categories mapped"
            icon={<FolderTree className="w-4 h-4" />}
            loading={loading}
          />
          <DashboardWidget 
            title="Operational Branches" 
            value={branches.length} 
            description="Active location endpoints"
            icon={<MapPin className="w-4 h-4" />}
            loading={loading}
          />
          <DashboardWidget 
            title="Staff Members" 
            value={staffCount} 
            description="Employees linked to outlet"
            icon={<Users className="w-4 h-4" />}
            loading={loading}
          />
          <DashboardWidget 
            title="Total Customers" 
            value={customerCount} 
            description="Customer profiles recorded"
            icon={<Users2 className="w-4 h-4" />}
            loading={loading}
          />
        </div>
      </div>

      {/* Quick Actions Grid Panel */}
      <QuickActions />

      {/* Double Column Layout: Activity Logs and Integration status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <SystemStatus />
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
