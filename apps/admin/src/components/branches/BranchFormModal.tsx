import React, { useState, useEffect } from 'react';
import { Branch, CreateBranchPayload, UpdateBranchPayload } from '@qrdine/types';
import { Modal, Input, Button, Select, Checkbox, Toggle } from '@qrdine/ui';
import {
  Building2,
  MapPin,
  Clock,
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar
} from 'lucide-react';

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<boolean>;
  editingBranch?: Branch | null;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const BranchFormModal: React.FC<BranchFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBranch,
}) => {
  const isEditing = !!editingBranch;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [name, setName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [isDefault, setIsDefault] = useState(false);

  const [address, setAddress] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [businessDays, setBusinessDays] = useState<string[]>(ALL_DAYS);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingBranch) {
      setName(editingBranch.name || '');
      setBranchCode(editingBranch.branch_code || '');
      setPhone(editingBranch.phone || '');
      setEmail(editingBranch.email || '');
      setTimezone(editingBranch.timezone || 'Asia/Kolkata');
      setIsDefault(!!editingBranch.is_default);

      setAddress(editingBranch.address || '');
      setAddressLine2(editingBranch.address_line2 || '');
      setCity(editingBranch.city || '');
      setState(editingBranch.state || '');
      setCountry(editingBranch.country || 'India');
      setPostalCode(editingBranch.postal_code || '');
      setLatitude(editingBranch.latitude ? String(editingBranch.latitude) : '');
      setLongitude(editingBranch.longitude ? String(editingBranch.longitude) : '');

      setOpeningTime(editingBranch.opening_time || '09:00');
      setClosingTime(editingBranch.closing_time || '22:00');
      setBusinessDays(editingBranch.business_days || ALL_DAYS);
      setIsActive(editingBranch.is_active ?? true);
    } else {
      resetForm();
    }
    setStep(1);
    setErrors({});
  }, [editingBranch, isOpen]);

  const resetForm = () => {
    setName('');
    setBranchCode('');
    setPhone('');
    setEmail('');
    setTimezone('Asia/Kolkata');
    setIsDefault(false);
    setAddress('');
    setAddressLine2('');
    setCity('');
    setState('');
    setCountry('India');
    setPostalCode('');
    setLatitude('');
    setLongitude('');
    setOpeningTime('09:00');
    setClosingTime('22:00');
    setBusinessDays(ALL_DAYS);
    setIsActive(true);
  };

  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4:00)' },
    { value: 'America/New_York', label: 'Eastern Standard (GMT-5:00)' },
    { value: 'Europe/London', label: 'London (GMT+0:00)' },
    { value: 'Asia/Singapore', label: 'Singapore (GMT+8:00)' },
  ];

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Branch name is required.';
    if (!phone.trim()) errs.phone = 'Phone number is required.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Invalid email address format.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!address.trim()) errs.address = 'Street address is required.';
    if (!city.trim()) errs.city = 'City is required.';
    if (!country.trim()) errs.country = 'Country is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;

    setSubmitting(true);
    const payload: CreateBranchPayload | UpdateBranchPayload = {
      name: name.trim(),
      branch_code: branchCode.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      timezone,
      is_default: isDefault,

      address: address.trim() || undefined,
      address_line2: addressLine2.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      country: country.trim() || 'India',
      postal_code: postalCode.trim() || undefined,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,

      opening_time: openingTime,
      closing_time: closingTime,
      business_days: businessDays,
      is_active: isActive,
    };

    const success = await onSubmit(payload);
    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const toggleDay = (day: string) => {
    if (businessDays.includes(day)) {
      if (businessDays.length === 1) return; // Must have at least 1 day
      setBusinessDays(businessDays.filter((d) => d !== day));
    } else {
      setBusinessDays([...businessDays, day]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Branch: ${editingBranch.name}` : 'Create New Branch Outlet'}
      size="lg"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Stepper Header */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                step >= 1 ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 text-slate-500'
              }`}
            >
              1
            </span>
            <span className={`text-xs font-semibold ${step === 1 ? 'text-orange-400' : 'text-slate-400'}`}>
              Basic Info
            </span>
          </div>
          <span className="w-8 h-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                step >= 2 ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={`text-xs font-semibold ${step === 2 ? 'text-orange-400' : 'text-slate-400'}`}>
              Address & Geo
            </span>
          </div>
          <span className="w-8 h-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                step === 3 ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={`text-xs font-semibold ${step === 3 ? 'text-orange-400' : 'text-slate-400'}`}>
              Schedule & Status
            </span>
          </div>
        </div>

        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
              <Building2 className="w-4 h-4" /> Identity & Contact
            </div>

            <Input
              id="name"
              label="Branch Name"
              placeholder="e.g. Connaught Place HQ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="branchCode"
                label="Branch Code / Identifier (Optional)"
                placeholder="e.g. CP-01"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                helperText="Short code used in internal orders"
              />
              <Select
                id="timezone"
                label="Branch Timezone"
                options={timezoneOptions}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="phone"
                label="Phone Number"
                placeholder="+91 11 2345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
              <Input
                id="email"
                type="email"
                label="Email Address (Optional)"
                placeholder="branch@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">Default Primary Branch</span>
                <span className="text-[11px] text-slate-400">
                  Primary default outlet for restaurant orders and operations
                </span>
              </div>
              <Toggle checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            </div>
          </div>
        )}

        {/* STEP 2: Address & Coordinates */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
              <MapPin className="w-4 h-4" /> Location Details
            </div>

            <Input
              id="address"
              label="Address Line 1"
              placeholder="123 Food Street, Sector 5"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              error={errors.address}
            />

            <Input
              id="addressLine2"
              label="Address Line 2 (Optional)"
              placeholder="Near Metro Gate 2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="city"
                label="City"
                placeholder="New Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                error={errors.city}
              />
              <Input
                id="state"
                label="State / Province"
                placeholder="Delhi"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="country"
                label="Country"
                placeholder="India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                error={errors.country}
              />
              <Input
                id="postalCode"
                label="Postal / Zip Code"
                placeholder="110001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="latitude"
                type="number"
                step="any"
                label="Latitude (Optional Geo)"
                placeholder="28.6139"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              <Input
                id="longitude"
                type="number"
                step="any"
                label="Longitude (Optional Geo)"
                placeholder="77.2090"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Operating Schedule & Status */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Schedule & Active Status
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="openingTime"
                type="time"
                label="Daily Opening Time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
              />
              <Input
                id="closingTime"
                type="time"
                label="Daily Closing Time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Operating Business Days
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {ALL_DAYS.map((day) => {
                  const selected = businessDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">Active Operational Status</span>
                <span className="text-[11px] text-slate-400">
                  Allow customers to place orders at this branch outlet
                </span>
              </div>
              <Toggle checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            </div>
          </div>
        )}

        {/* Modal Buttons Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
          {step > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStep(step - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button
              size="sm"
              onClick={() => {
                if (step === 1 && validateStep1()) setStep(2);
                else if (step === 2 && validateStep2()) setStep(3);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              size="sm"
              isLoading={submitting}
              onClick={handleSubmit}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {isEditing ? 'Save Changes' : 'Create Branch'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
