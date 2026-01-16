'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContacts } from '@/hooks/useContacts';
import { ContactForm } from '@/components/contacts/ContactForm';
import type { Contact, ContactActivity, CreateContactDTO } from '@/types/contacts';
import { CONTACT_STATUS_COLORS, SOURCE_LABELS } from '@/types/contacts';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Plus,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  CheckCircle,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getContact, updateContact, deleteContact, getActivities, addActivity } = useContacts();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityType, setActivityType] = useState<string>('note');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  
  useEffect(() => {
    loadContact();
    loadActivities();
  }, [id]);
  
  const loadContact = async () => {
    setLoading(true);
    const data = await getContact(id);
    setContact(data);
    setLoading(false);
  };
  
  const loadActivities = async () => {
    const data = await getActivities(id);
    setActivities(data);
  };
  
  const handleUpdate = async (data: CreateContactDTO) => {
    setFormLoading(true);
    try {
      const updated = await updateContact(id, data);
      if (updated) {
        setContact(updated);
      }
      setShowEditForm(false);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDelete = async () => {
    const success = await deleteContact(id);
    if (success) {
      router.push('/contacts');
    }
  };
  
  const handleAddActivity = async () => {
    if (!activityTitle.trim()) return;
    
    const activity = await addActivity(id, {
      type: activityType as any,
      title: activityTitle,
      description: activityDescription || undefined,
    });
    
    if (activity) {
      setActivities(prev => [activity, ...prev]);
      setShowAddActivity(false);
      setActivityTitle('');
      setActivityDescription('');
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'status_change': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (!contact) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-bold text-white mb-2">Contact Not Found</h2>
        <p className="text-gray-500 mb-6">The contact you're looking for doesn't exist or has been deleted.</p>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Link>
      </div>
    );
  }
  
  const statusColors = CONTACT_STATUS_COLORS[contact.status];
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const fullAddress = [
    contact.addressLine1,
    contact.addressLine2,
    [contact.city, contact.state].filter(Boolean).join(', '),
    contact.zip,
  ].filter(Boolean).join('\n');
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/contacts"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                  <span className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full border capitalize',
                    statusColors.bg,
                    statusColors.text,
                    statusColors.border
                  )}>
                    {contact.status.replace('_', ' ')}
                  </span>
                </div>
                {contact.contactCompanyName && (
                  <p className="text-sm text-gray-400 mt-0.5">{contact.contactCompanyName}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6 space-y-5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Contact Info</h3>
              
              <div className="space-y-4">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-white group-hover:text-blue-400 transition-colors">{contact.email}</p>
                    </div>
                  </a>
                )}
                
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-start gap-3 group"
                  >
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <Phone className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-white group-hover:text-green-400 transition-colors">{contact.phone}</p>
                    </div>
                  </a>
                )}
                
                {fullAddress && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <MapPin className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm text-white whitespace-pre-line">{fullAddress}</p>
                    </div>
                  </div>
                )}
                
                {contact.contactCompanyName && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Building2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Company</p>
                      <p className="text-sm text-white">{contact.contactCompanyName}</p>
                      {contact.contactJobTitle && (
                        <p className="text-xs text-gray-500">{contact.contactJobTitle}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Meta Info */}
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Source</span>
                  <span className="text-white">{SOURCE_LABELS[contact.source]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-white">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="text-white">
                    {new Date(contact.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {contact.tags && contact.tags.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {contact.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Quick Actions</h3>
              
              <div className="space-y-2">
                <Link
                  href={`/jobs?contactId=${contact.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white">View Jobs</span>
                </Link>
                <Link
                  href={`/jobs/new?contactId=${contact.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Create Job</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Activity</h3>
                <button
                  onClick={() => setShowAddActivity(!showAddActivity)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Activity
                </button>
              </div>
              
              {/* Add Activity Form */}
              {showAddActivity && (
                <div className="px-6 py-4 bg-[#0a0a0f]/50 border-b border-white/5">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {['note', 'call', 'email', 'meeting'].map(type => (
                        <button
                          key={type}
                          onClick={() => setActivityType(type)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors",
                            activityType === type
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    
                    <input
                      type="text"
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      placeholder="Activity title..."
                      className="w-full px-4 py-2 bg-[#1C1C1C] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    
                    <textarea
                      value={activityDescription}
                      onChange={(e) => setActivityDescription(e.target.value)}
                      placeholder="Add details (optional)..."
                      rows={3}
                      className="w-full px-4 py-2 bg-[#1C1C1C] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddActivity(false)}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddActivity}
                        disabled={!activityTitle.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Add Activity
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Activity List */}
              <div className="divide-y divide-white/5">
                {activities.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No activity recorded yet</p>
                  </div>
                ) : (
                  activities.map(activity => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          activity.type === 'status_change' ? "bg-green-500/10" :
                          activity.type === 'call' ? "bg-blue-500/10" :
                          activity.type === 'email' ? "bg-purple-500/10" :
                          activity.type === 'meeting' ? "bg-orange-500/10" :
                          "bg-gray-500/10"
                        )}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            {activity.user && (
                              <span>{activity.user.firstName} {activity.user.lastName}</span>
                            )}
                            <span>•</span>
                            <span>{new Date(activity.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Notes */}
            {contact.notes && (
              <div className="mt-6 bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Form Modal */}
      {showEditForm && (
        <ContactForm
          contact={contact}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditForm(false)}
          isLoading={formLoading}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#1C1C1C] border border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Contact</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">{fullName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
