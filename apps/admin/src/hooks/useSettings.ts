import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@qrdine/ui';
import { restaurantService } from '@qrdine/lib';
import { Restaurant, UpdateRestaurantSettingsPayload } from '@qrdine/types';
import {
  validatePhone,
  validateEmail,
  validateGST,
  validatePAN,
  validateSlug,
  validateUrl,
} from '../utils/settings.validators';

export function useSettings() {
  const { restaurant, restaurantId, refreshAuth } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Restaurant>>({});
  const [originalData, setOriginalData] = useState<Partial<Restaurant>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keep a ref to originalData so updateField always has the latest snapshot
  const originalRef = useRef<Partial<Restaurant>>({});

  // Sync form state when restaurant in AuthContext loads or updates
  useEffect(() => {
    if (restaurant) {
      const initial: Partial<Restaurant> = {
        name: restaurant.name || '',
        slug: restaurant.slug || '',
        restaurant_type: restaurant.restaurant_type || 'casual_dining',
        description: restaurant.description || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        logo_url: restaurant.logo_url || null,
        cover_image_url: restaurant.cover_image_url || null,
        primary_color: restaurant.primary_color || '#f97316',
        secondary_color: restaurant.secondary_color || '#0f172a',
        accent_color: restaurant.accent_color || '#06b6d4',
        gst_number: restaurant.gst_number || '',
        pan_number: restaurant.pan_number || '',
        business_registration: restaurant.business_registration || '',
        opening_time: restaurant.opening_time || '09:00',
        closing_time: restaurant.closing_time || '23:00',
        business_days: restaurant.business_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        business_address: restaurant.business_address || '',
        currency: restaurant.currency || 'INR',
        timezone: restaurant.timezone || 'Asia/Kolkata',
        date_format: restaurant.date_format || 'DD/MM/YYYY',
        time_format: restaurant.time_format || '12h',
        language: restaurant.language || 'en',
        country: restaurant.country || 'IN',
        state: restaurant.state || '',
        city: restaurant.city || '',
        accept_orders: restaurant.accept_orders ?? true,
        enable_table_ordering: restaurant.enable_table_ordering ?? true,
        kitchen_display_enabled: restaurant.kitchen_display_enabled ?? true,
        email_notifications: restaurant.email_notifications ?? true,
        kitchen_alerts: restaurant.kitchen_alerts ?? true,
        order_alerts: restaurant.order_alerts ?? true,
        settings_json: restaurant.settings_json || {},
      };
      setFormData(initial);
      setOriginalData(initial);
      originalRef.current = initial;
      setIsDirty(false);
      setErrors({});
    }
  }, [restaurant]);

  const updateField = useCallback((key: keyof Restaurant, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [key]: value };
      // Compare against ref (always fresh) to determine dirty state
      const dirty = JSON.stringify(next) !== JSON.stringify(originalRef.current);
      setIsDirty(dirty);
      return next;
    });

    // Clear field-specific error on change
    setErrors(prev => {
      if (prev[key]) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return prev;
    });
  }, []);

  const validateAll = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Restaurant name is required.';
    }

    const slugErr = validateSlug(formData.slug);
    if (slugErr) newErrors.slug = slugErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const gstErr = validateGST(formData.gst_number);
    if (gstErr) newErrors.gst_number = gstErr;

    const panErr = validatePAN(formData.pan_number);
    if (panErr) newErrors.pan_number = panErr;

    const urlErr = validateUrl(formData.website);
    if (urlErr) newErrors.website = urlErr;

    // Check slug uniqueness if changed
    if (formData.slug && formData.slug !== originalData.slug) {
      setIsCheckingSlug(true);
      const slugCheck = await restaurantService.checkSlugAvailable(formData.slug, restaurantId || undefined);
      setIsCheckingSlug(false);
      if (slugCheck.error || !slugCheck.data) {
        newErrors.slug = 'This restaurant handle (slug) is already taken.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveSettings = async (): Promise<boolean> => {
    if (!restaurantId) {
      toast('No active restaurant selected.', 'error');
      return false;
    }

    const isValid = await validateAll();
    if (!isValid) {
      toast('Please correct the validation errors in the settings form.', 'error');
      return false;
    }

    setIsSaving(true);
    try {
      const payload: UpdateRestaurantSettingsPayload = {
        name: formData.name,
        slug: formData.slug,
        restaurant_type: formData.restaurant_type,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logo_url: formData.logo_url,
        cover_image_url: formData.cover_image_url,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        gst_number: formData.gst_number,
        pan_number: formData.pan_number,
        business_registration: formData.business_registration,
        opening_time: formData.opening_time,
        closing_time: formData.closing_time,
        business_days: formData.business_days,
        business_address: formData.business_address,
        currency: formData.currency,
        timezone: formData.timezone,
        date_format: formData.date_format,
        time_format: formData.time_format,
        language: formData.language,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        accept_orders: formData.accept_orders,
        enable_table_ordering: formData.enable_table_ordering,
        kitchen_display_enabled: formData.kitchen_display_enabled,
        email_notifications: formData.email_notifications,
        kitchen_alerts: formData.kitchen_alerts,
        order_alerts: formData.order_alerts,
        settings_json: formData.settings_json,
      };

      const res = await restaurantService.updateRestaurantSettings(restaurantId, payload);

      if (res.error || !res.data) {
        toast(res.error?.message || 'Failed to save restaurant settings.', 'error');
        return false;
      }

      const snapshot = { ...formData };
      setOriginalData(snapshot);
      originalRef.current = snapshot;
      setIsDirty(false);
      toast('Restaurant settings saved successfully!', 'success');
      await refreshAuth();
      return true;
    } catch (err: any) {
      toast(err.message || 'Unexpected error while saving settings.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = useCallback(() => {
    setFormData({ ...originalRef.current });
    setIsDirty(false);
    setErrors({});
    toast('Settings reset to last saved values.', 'info');
  }, [toast]);

  return {
    formData,
    originalData,
    isDirty,
    isSaving,
    isCheckingSlug,
    errors,
    updateField,
    saveSettings,
    resetSettings,
  };
}
