import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Input, Button, Select, useToast } from '@qrdine/ui';
import { restaurantService, insforge } from '@qrdine/lib';
import { generateSlug } from '@qrdine/shared';
import { 
  Building2, 
  MapPin, 
  Check, 
  Upload, 
  ArrowRight, 
  ArrowLeft,
  DollarSign,
  Globe,
  Loader2
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Onboarding Step state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State - Step 1: Restaurant Details
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [restaurantType, setRestaurantType] = useState('Fine Dining');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [gstNumber, setGstNumber] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Form State - Step 2: Primary Branch Details
  const [branchName, setBranchName] = useState('HQ Branch');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-slug generation
  const handleNameChange = (val: string) => {
    setRestaurantName(val);
    setSlug(generateSlug(val));
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast('Logo image must be smaller than 2MB', 'warning');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Options
  const typeOptions = [
    { value: 'Fine Dining', label: 'Fine Dining' },
    { value: 'Cafe', label: 'Cafe / Bakery' },
    { value: 'Fast Food', label: 'Fast Food / QSR' },
    { value: 'Bar / Pub', label: 'Bar / Pub' },
    { value: 'Food Court', label: 'Food Court Stall' },
  ];

  const currencyOptions = [
    { value: 'INR', label: 'Indian Rupee (INR)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'AED', label: 'UAE Dirham (AED)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
  ];

  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4:00)' },
    { value: 'America/New_York', label: 'Eastern Standard (GMT-5:00)' },
    { value: 'Europe/London', label: 'London (GMT+0:00)' },
  ];

  // Validation checks
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!restaurantName.trim()) errs.restaurantName = 'Restaurant name is required';
    if (!slug.trim()) errs.slug = 'Slug handle is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!email.trim()) errs.email = 'Email address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!branchName.trim()) errs.branchName = 'Branch name is required';
    if (!address.trim()) errs.address = 'Address is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!country.trim()) errs.country = 'Country is required';
    if (!branchPhone.trim()) errs.branchPhone = 'Branch phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const uploadLogo = async (file: File, slugHandle: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${slugHandle}-${Date.now()}.${fileExt}`;
      const { data, error } = await insforge.storage
        .from('restaurant-logos')
        .upload(filePath, file);

      if (error) throw error;
      return filePath;
    } catch {
      return null;
    }
  };

  const handleOnboardSubmit = async () => {
    if (!user) return;
    try {
      setSubmitting(true);

      // Verify unique slug
      const slugExists = await restaurantService.checkRestaurantSlugExists(slug);
      if (slugExists.data) {
        toast('Restaurant handle (slug) is already taken. Please choose another.', 'error');
        setStep(1);
        return;
      }

      // Upload logo if selected
      let logoUrl: string | undefined = undefined;
      if (logoFile) {
        const uploadedPath = await uploadLogo(logoFile, slug);
        if (uploadedPath) {
          logoUrl = uploadedPath;
        }
      }

      // Execute Onboarding Transaction
      const onboardResult = await restaurantService.onboardRestaurant({
        name: restaurantName,
        slug,
        restaurant_type: restaurantType,
        phone,
        email,
        gst_number: gstNumber || undefined,
        timezone,
        currency,
        logo_url: logoUrl,
        
        branch_name: branchName,
        address,
        city,
        state,
        country,
        postal_code: postalCode,
        branch_phone: branchPhone,

        auth_user_id: user.id,
        owner_name: user.name || 'Owner',
        owner_email: user.email
      });

      if (onboardResult.error) {
        toast(onboardResult.error.message, 'error');
      } else {
        toast('Restaurant onboarded successfully!', 'success');
        await refreshAuth();
        navigate('/');
      }
    } catch (err: any) {
      toast(err.message || 'Onboarding failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-y-auto">
      {/* Background Decorators */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col gap-6 py-8">
        {/* Onboarding Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Setup Your Restaurant Profile</h1>
          <p className="text-sm text-slate-400 mt-1.5">Prepare your workspace and branch endpoints for operations</p>
        </div>

        {/* Multi-step Stepper Progress */}
        <div className="flex items-center justify-center gap-2 px-4 mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
              step >= 1 ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </span>
            <span className="text-xs font-semibold hidden sm:inline text-slate-300">Restaurant details</span>
          </div>
          <span className="w-8 h-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
              step >= 2 ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </span>
            <span className="text-xs font-semibold hidden sm:inline text-slate-300">HQ Branch info</span>
          </div>
          <span className="w-8 h-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
              step === 3 ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}>
              3
            </span>
            <span className="text-xs font-semibold hidden sm:inline text-slate-300">Confirm</span>
          </div>
        </div>

        {/* Multi-step Form Cards */}
        <Card className="border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-8 shadow-xl">
          {/* Step 1: Restaurant Info */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                <Building2 className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-slate-200">Step 1: Restaurant Profile</h3>
              </div>

              {/* Logo File Selector */}
              <div className="flex items-center gap-4 py-2">
                <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-700" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Restaurant Logo</label>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg cursor-pointer border border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <Input
                id="restaurantName"
                label="Restaurant Name"
                placeholder="Acme Pizzeria"
                value={restaurantName}
                onChange={(e) => handleNameChange(e.target.value)}
                error={errors.restaurantName}
              />

              <Input
                id="slug"
                label="Restaurant Handle (Subdomain Slug)"
                placeholder="acme-pizzeria"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                error={errors.slug}
                helperText="This defines the URL slug customers scan to order"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  id="restaurantType"
                  label="Restaurant Type"
                  options={typeOptions}
                  value={restaurantType}
                  onChange={(e) => setRestaurantType(e.target.value)}
                />
                <Input
                  id="phone"
                  label="Primary Phone Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                />
              </div>

              <Input
                id="email"
                type="email"
                label="Primary Business Email"
                placeholder="acme@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  id="currency"
                  label="Default Currency"
                  options={currencyOptions}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
                <Select
                  id="timezone"
                  label="Restaurant Timezone"
                  options={timezoneOptions}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>

              <Input
                id="gstNumber"
                label="Tax Identification / GST Number (Optional)"
                placeholder="22AAAAA1111A1Z1"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => validateStep1() && setStep(2)} 
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Branch Setup
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Primary Branch Details */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-slate-200">Step 2: Headquarter Branch Details</h3>
              </div>

              <Input
                id="branchName"
                label="Branch Location Name"
                placeholder="HQ Branch"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                error={errors.branchName}
                helperText="e.g. 'HQ Branch' or 'Connaught Place'"
              />

              <Input
                id="address"
                label="Street Address"
                placeholder="123 Food Street, Sector 5"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={errors.address}
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

              <Input
                id="branchPhone"
                label="Branch Phone Line"
                placeholder="+91 11 2345 6789"
                value={branchPhone}
                onChange={(e) => setBranchPhone(e.target.value)}
                error={errors.branchPhone}
              />

              <div className="flex justify-between pt-4">
                <Button 
                  variant="secondary"
                  onClick={() => setStep(1)} 
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => validateStep2() && setStep(3)} 
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Confirmation
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation Summary */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
                <Check className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-slate-200">Step 3: Review Profile Summary</h3>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-5 text-sm">
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-orange-500 uppercase tracking-wider text-xs">Restaurant profile</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-slate-300">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-medium text-slate-200">{restaurantName}</span>
                    <span className="text-slate-500">Handle / Slug:</span>
                    <span className="font-mono text-slate-200">/{slug}</span>
                    <span className="text-slate-500">Classification:</span>
                    <span>{restaurantType}</span>
                    <span className="text-slate-500">Currency & Zone:</span>
                    <span>{currency} | {timezone}</span>
                  </div>
                </div>

                <hr className="border-slate-800/60" />

                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-orange-500 uppercase tracking-wider text-xs">HQ Branch profile</h4>
                  <div className="grid grid-cols-2 gap-y-2 text-slate-300">
                    <span className="text-slate-500">Branch Name:</span>
                    <span className="font-medium text-slate-200">{branchName}</span>
                    <span className="text-slate-500">Street Address:</span>
                    <span>{address}, {city}</span>
                    <span className="text-slate-500">Contact:</span>
                    <span>{branchPhone}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="secondary"
                  disabled={submitting}
                  onClick={() => setStep(2)} 
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button 
                  disabled={submitting}
                  isLoading={submitting}
                  onClick={handleOnboardSubmit}
                  leftIcon={!submitting ? <Check className="w-4 h-4" /> : undefined}
                >
                  Submit Setup
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
export default OnboardingPage;
