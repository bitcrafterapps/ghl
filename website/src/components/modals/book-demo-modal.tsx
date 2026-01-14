"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { GHL_CONFIG, submitToGHL } from "@/lib/ghl-config";

interface BookDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDemoModal({ open, onOpenChange }: BookDemoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Submit to GoHighLevel webhook
    const result = await submitToGHL(GHL_CONFIG.bookDemoWebhook, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.companyName,
      industry: formData.industry,
      form_type: 'book_demo',
      tags: 'website-demo-request',
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError('Something went wrong. Please try again or call us directly.');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setIsSubmitted(false);
      setError(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        industry: '',
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-safety-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-safety-400" />
                </div>
                <DialogTitle>Book a 10-Minute Demo</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                See exactly how our AI system can recover missed calls and book more jobs for your business.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-steel-300 mb-1.5">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-steel-300 mb-1.5">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-300 mb-1.5">
                  Business Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@yourcompany.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-300 mb-1.5">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-300 mb-1.5">
                  Company Name *
                </label>
                <Input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="ABC Contracting"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-300 mb-1.5">
                  Industry *
                </label>
                <Select 
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select your industry</option>
                  <option value="general-contractor">General Contractor</option>
                  <option value="hvac">HVAC</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="roofing">Roofing</option>
                  <option value="restoration">Water/Fire Restoration</option>
                  <option value="cleaning">Carpet & Tile Cleaning</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-5 w-5" />
                      Schedule My Demo
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-steel-500 text-center">
                We&apos;ll reach out within 24 hours to confirm your demo time.
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-emerald-500/20 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-display text-white mb-2">
              YOU&apos;RE ALL SET!
            </h3>
            <p className="text-steel-300 mb-6">
              We&apos;ll reach out within 24 hours to schedule your personalized demo. Check your email for confirmation.
            </p>
            <Button onClick={handleClose} variant="secondary">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

