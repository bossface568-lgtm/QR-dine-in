import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@qrdine/ui';
import { 
  FolderPlus, 
  PlusCircle, 
  Grid3X3, 
  MapPin, 
  UserPlus 
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Add Category',
      description: 'Define a new menu category',
      to: '/categories',
      icon: <FolderPlus className="w-5 h-5" />,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      title: 'Add Menu Item',
      description: 'Upload dishes and pricing',
      to: '/menu',
      icon: <PlusCircle className="w-5 h-5" />,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Create Table',
      description: 'Add physical dining tables',
      to: '/tables',
      icon: <Grid3X3 className="w-5 h-5" />,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      title: 'Create Branch',
      description: 'Scaffold new franchise outlets',
      to: '/branches',
      icon: <MapPin className="w-5 h-5" />,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      title: 'Invite Staff',
      description: 'Add cooks or branch managers',
      to: '/staff',
      icon: <UserPlus className="w-5 h-5" />,
      color: 'text-amber-500 bg-amber-500/10'
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {actions.map((act) => (
          <Link key={act.title} to={act.to} className="group">
            <Card className="p-5 border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:bg-slate-850/60 hover:border-slate-700 transition-all duration-200 cursor-pointer flex flex-col gap-3 h-32">
              <div className={`p-2.5 w-10 h-10 rounded-xl flex items-center justify-center border border-slate-800 group-hover:scale-105 transition-transform ${act.color}`}>
                {act.icon}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-200 group-hover:text-orange-400 transition-colors">
                  {act.title}
                </span>
                <span className="text-xxs text-slate-500">
                  {act.description}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default QuickActions;
