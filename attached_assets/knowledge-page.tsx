'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash, Filter, Database, FileText } from 'lucide-react';
import FileUpload from '@/components/ai/FileUpload';
import MainLayout from '@/components/layouts/MainLayout';

// Define categories for knowledge base entries
const KNOWLEDGE_CATEGORIES = [
  'tax_regulations',
  'compliance_federal',
  'compliance_state',
  'compliance_industry',
  'expense_categories',
  'payroll_guides',
  'company_policies',
  'employee_handbook'
];

interface KnowledgeEntry {
  id: string;
  content: string;
  category: string;
  metadata: Record<string, any>;
  source: string;
  created_at: string;
  similarity?: number;
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Fetch entries when search or category changes
  useEffect(() => {
    if (searchQuery) {
      fetchEntries();
    } else {
      // Clear entries if search is empty
      setEntries([]);
    }
  }, [searchQuery, selectedCategory]);

  const fetchEntries = async () => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    
    try {
      const queryParams = new URLSearchParams({
        query: searchQuery
      });
      
      if (selectedCategory) {
        queryParams.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/knowledge?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setEntries(data.results || []);
      } else {
        console.error('Error fetching knowledge entries:', data.error);
      }
    } catch (error) {
      console.error('Error fetching knowledge entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntries();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value === 'all' ? null : value);
  };

  const handleUploadSuccess = () => {
    // Show success message
    setShowUploadForm(false);
    
    // Refresh entries if there was a search
    if (searchQuery) {
      fetchEntries();
    }
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntries(prev => {
      if (prev.includes(id)) {
        return prev.filter(entryId => entryId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === entries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(entries.map(entry => entry.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedEntries.length) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedEntries.length} entries?`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/knowledge', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: selectedEntries
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove deleted entries from state
        setEntries(prev => prev.filter(entry => !selectedEntries.includes(entry.id)));
        setSelectedEntries([]);
      } else {
        console.error('Error deleting knowledge entries:', data.error);
      }
    } catch (error) {
      console.error('Error deleting knowledge entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Management</h1>
          <p className="text-gray-600 mt-2">
            Manage the knowledge base used by AI agents for better, more accurate responses.
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
                    placeholder="Search knowledge base..."
                  />
                </div>
              </form>
              
              <div className="w-full md:w-64">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={selectedCategory || 'all'}
                    onChange={handleCategoryChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
                  >
                    <option value="all">All Categories</option>
                    {KNOWLEDGE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
              >
                {showUploadForm ? (
                  <>
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Document
                  </>
                )}
              </button>
            </div>
            
            {/* Upload Form */}
            {showUploadForm && (
              <div className="mt-6">
                <FileUpload
                  categories={KNOWLEDGE_CATEGORIES}
                  onSuccess={handleUploadSuccess}
                  onError={(error) => console.error('Upload error:', error)}
                />
              </div>
            )}
          </div>

          {/* Knowledge Entries */}
          <div>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 border-4 border-gray-200 border-t-primary-blue rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No entries found</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Search for knowledge base entries or add new documents'}
                </p>
              </div>
            ) : (
              <div>
                {/* Actions Bar */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEntries.length === entries.length && entries.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedEntries.length} selected
                    </span>
                  </div>
                  
                  {selectedEntries.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      className="flex items-center text-sm text-red-600 hover:text-red-800"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete Selected
                    </button>
                  )}
                </div>
                
                {/* Entries List */}
                <ul className="divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <li key={entry.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="h-5 flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedEntries.includes(entry.id)}
                            onChange={() => handleSelectEntry(entry.id)}
                            className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {entry.category}
                              </span>
                              {entry.similarity !== undefined && (
                                <span className="ml-2 text-xs text-gray-500">
                                  {(entry.similarity * 100).toFixed(1)}% match
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-700">
                            {truncateContent(entry.content)}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Source: {entry.source}
                            {entry.metadata?.filename && ` | File: ${entry.metadata.filename}`}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
