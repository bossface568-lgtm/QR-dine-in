import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { restaurantService, tableService, categoryService, menuItemService } from '@qrdine/lib';
import { Restaurant, Branch, Table, Category, MenuItem } from '@qrdine/types';
import { formatCurrency } from '@qrdine/shared';
import { Spinner } from '@qrdine/ui';
import { RestaurantNotFoundPage } from './RestaurantNotFoundPage';
import { TableNotFoundPage } from './TableNotFoundPage';
import { RestaurantUnavailablePage } from './RestaurantUnavailablePage';
import {
  Utensils,
  Search,
  MapPin,
  Clock,
  Sparkles,
  Leaf,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';

export const CustomerMenuPage: React.FC = () => {
  const { slug, tableToken } = useParams<{ slug: string; tableToken?: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  
  const [errorState, setErrorState] = useState<'none' | 'restaurant_404' | 'table_invalid' | 'restaurant_unavailable'>('none');
  const [errorCode, setErrorCode] = useState<string>('INVALID_TABLE_TOKEN');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      setErrorState('none');

      try {
        if (tableToken) {
          // Resolve table token & restaurant together
          const res = await tableService.getTableByToken(slug, tableToken);
          if (res.error) {
            if (res.error.code === 'RESTAURANT_NOT_FOUND') {
              setErrorState('restaurant_404');
            } else if (res.error.code === 'RESTAURANT_UNAVAILABLE') {
              setErrorState('restaurant_unavailable');
            } else {
              setErrorState('table_invalid');
              setErrorCode(res.error.code || 'INVALID_TABLE_TOKEN');
              setErrorMessage(res.error.message || '');
            }
            setLoading(false);
            return;
          }
          if (res.data) {
            setRestaurant(res.data.restaurant);
            setBranch(res.data.branch);
            setTable(res.data.table);
          }
        } else {
          // Resolve restaurant by slug only
          const res = await restaurantService.getRestaurantBySlug(slug);
          if (res.error || !res.data) {
            setErrorState('restaurant_404');
            setLoading(false);
            return;
          }
          if (res.data.status !== 'active') {
            setErrorState('restaurant_unavailable');
            setLoading(false);
            return;
          }
          setRestaurant(res.data);
        }

        // Fetch categories & menu items
        const currentRest = tableToken 
          ? (await tableService.getTableByToken(slug, tableToken)).data?.restaurant 
          : (await restaurantService.getRestaurantBySlug(slug)).data;
          
        if (currentRest?.id) {
          const [catRes, itemsRes] = await Promise.all([
            categoryService.getCategories(currentRest.id),
            menuItemService.getMenuItems(currentRest.id),
          ]);
          if (catRes.data) setCategories(catRes.data.filter((c) => c.is_visible && c.is_active));
          if (itemsRes.data) setMenuItems(itemsRes.data.filter((i) => i.status === 'available'));
        }
      } catch (err) {
        console.error('Error loading customer menu:', err);
        setErrorState('restaurant_404');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, tableToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" className="text-orange-500" />
        <p className="text-xs font-semibold text-slate-400">Loading Digital Menu...</p>
      </div>
    );
  }

  if (errorState === 'restaurant_404') {
    return <RestaurantNotFoundPage />;
  }

  if (errorState === 'restaurant_unavailable') {
    return <RestaurantUnavailablePage restaurantName={restaurant?.name} />;
  }

  if (errorState === 'table_invalid') {
    return <TableNotFoundPage restaurantName={restaurant?.name} code={errorCode} message={errorMessage} />;
  }

  const filteredItems = menuItems.filter((item) => {
    if (activeCategory !== 'all' && item.category_id !== activeCategory) return false;
    if (vegOnly && !item.dietary_tags?.includes('veg')) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Cover / Header */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 pt-10 border-b border-slate-800">
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {restaurant?.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-800 shadow-xl"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xl">
                  {restaurant?.name?.charAt(0) || 'R'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-slate-100">{restaurant?.name}</h1>
                {branch && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" /> {branch.name}
                  </p>
                )}
              </div>
            </div>

            {/* Table Badge if Table Token provided */}
            {table && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">Seated At</span>
                <span className="px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono font-extrabold text-sm shadow-sm">
                  {table.label || `Table ${table.table_number}`}
                </span>
              </div>
            )}
          </div>

          {/* Search & Veg Filter */}
          <div className="flex items-center gap-2 mt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-orange-500/60"
              />
            </div>
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                vegOnly
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Veg Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Horizontal Scroll Tabs */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="max-w-xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items List */}
      <div className="max-w-xl mx-auto p-4 flex flex-col gap-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No menu items found matching your filter.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.dietary_tags?.includes('veg') ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <h3 className="font-bold text-slate-100 text-sm">{item.name}</h3>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                )}
                <span className="text-sm font-extrabold text-orange-400 mt-1">
                  {formatCurrency(item.base_price, restaurant?.currency)}
                </span>
              </div>

              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-700 shrink-0">
                  <Utensils className="w-6 h-6" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
