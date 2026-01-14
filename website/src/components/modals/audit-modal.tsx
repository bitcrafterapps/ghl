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
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck, CheckCircle2, Loader2, DollarSign } from "lucide-react";
import { GHL_CONFIG, submitToGHL } from "@/lib/ghl-config";

interface AuditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditModal({ open, onOpenChange }: AuditModalProps) {
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
    callsPerMonth: '',
    biggestChallenge: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Submit to GoHighLevel webhook
    const result = await submitToGHL(GHL_CONFIG.auditWebhook, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.companyName,
      calls_per_month: formData.callsPerMonth,
      biggest_challenge: formData.biggestChallenge,
      form_type: 'missed_jobs_audit',
      tags: 'website-audit-request',
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
        callsPerMonth: '',
        biggestChallenge: '',
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-safety-500/20 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-safety-400" />
                </div>
                <DialogTitle>Free &quot;Missed Jobs&quot; Audit</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                We&apos;ll analyze your current lead flow and estimate how much revenue you&apos;re leaving on the table from missed calls and slow follow-up.
              </DialogDescription>
            </DialogHeader>

            {/* Value proposition */}
            <div className="bg-safety-500/10 border border-safety-500/20 rounded-lg p-4 my-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-safety-400" />
                <div>
                  <p className="text-white font-semibold">What You&apos;ll Get:</p>
                  <p className="text-sm text-steel-300">
                    A personalized report showing estimated lost revenue and how to recover it.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  How many calls/leads do you get per month? *
                </label>
                <Select 
                  name="callsPerMonth"
                  value={formData.callsPerMonth}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select range</option>
                  <option value="1-20">1-20 calls/month</option>
                  <option value="21-50">21-50 calls/month</option>
                  <option value="51-100">51-100 calls/month</option>
                  <option value="100+">100+ calls/month</option>
                  <option value="not-sure">Not sure</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-steel-300 mb-1.5">
                  What&apos;s your biggest challenge right now? (Optional)
                </label>
                <Textarea
                  name="biggestChallenge"
                  value={formData.biggestChallenge}
                  onChange={handleInputChange}
                  placeholder="e.g., Missing calls after hours, slow follow-up on quotes, etc."
                  rows={3}
                />
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="mr-2 h-5 w-5" />
                      Get My Free Audit
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-steel-500 text-center">
                No obligation. We&apos;ll send your audit within 48 hours.
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-emerald-500/20 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-display text-white mb-2">
              AUDIT REQUEST RECEIVED!
            </h3>
            <p className="text-steel-300 mb-6">
              We&apos;re crunching the numbers. You&apos;ll receive your personalized &quot;Missed Jobs&quot; audit within 48 hours.
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

