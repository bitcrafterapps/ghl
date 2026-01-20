'use client';

import { Layout } from '@/components/Layout';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContacts } from '@/hooks/useContacts';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactForm } from '@/components/contacts/ContactForm';
import { ContactFiltersBar } from '@/components/contacts/ContactFilters';
import type { Contact, CreateContactDTO, ContactFilters } from '@/types/contacts';
import { Plus, Users, Loader2, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubHeader } from '@/components/SubHeader';

export default function ContactsPage() {
  const router = useRouter();
  const {
    contacts,
    loading,
    error,
    pagination,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    setFilters,
    setPage,
    refresh,
  } = useContacts();
  
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setLocalFilters] = useState<ContactFilters>({});
  const [deleteConfirm, setDeleteConfirm] = useState<Contact | null>(null);
  
  useEffect(() => {
    fetchContacts();
  }, []);
  
  const handleCreateContact = async (data: CreateContactDTO) => {
    setFormLoading(true);
    try {
      await createContact(data);
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleUpdateContact = async (data: CreateContactDTO) => {
    if (!editingContact) return;
    setFormLoading(true);
    try {
      await updateContact(editingContact.id, data);
      setEditingContact(null);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDeleteContact = async () => {
    if (!deleteConfirm) return;
    await deleteContact(deleteConfirm.id);
    setDeleteConfirm(null);
  };
  
  const handleFiltersChange = (newFilters: ContactFilters) => {
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };
  
  const handleViewContact = (contact: Contact) => {
    router.push(`/contacts/${contact.id}`);
  };
  
  return (
    <Layout isAuthenticated={true} noPadding>
      <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-full">
      <SubHeader
        icon={Users}
        title="Contacts"
        subtitle="Manage your customers and leads"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>

            <div className="flex items-center bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'grid' 
                    ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" 
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list' 
                    ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" 
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        }
      />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8">
          <ContactFiltersBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalCount={pagination?.total}
          />
        </div>
        
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading && contacts.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
        
        {/* Empty State */}
        {!loading && contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-500/10 rounded-full mb-4">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No contacts yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Start building your customer database by adding your first contact.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Contact
            </button>
          </div>
        )}
        
        {/* Contacts Grid */}
        {contacts.length > 0 && (
          <div className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "flex flex-col gap-3"
          )}>
            {contacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onView={handleViewContact}
                onEdit={(c) => setEditingContact(c)}
                onDelete={(c) => setDeleteConfirm(c)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={cn(
                  "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                  page === pagination.page
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Create/Edit Form Modal */}
      {(showForm || editingContact) && (
        <ContactForm
          contact={editingContact}
          onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
          onCancel={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
          isLoading={formLoading}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Delete Contact</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-gray-900 dark:text-white font-medium">
                {deleteConfirm.firstName} {deleteConfirm.lastName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContact}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}
