"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DocumentGrid } from "@/components/dashboard/document-grid";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2Icon } from "lucide-react";
import { debounce } from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  
  // Fetch documents based on search query
  const fetchDocuments = async (query: string) => {
    if (!query.trim()) {
      setDocuments([]);
      setIsSearched(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      setDocuments(data.documents);
      setIsSearched(true);
    } catch (error) {
      console.error("Error searching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Debounced search function
  const debouncedSearch = debounce((query: string) => {
    fetchDocuments(query);
    
    // Update URL with search query
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    
    router.replace(`/search?${params.toString()}`);
  }, 500);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };
  
  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments(searchQuery);
    
    // Update URL with search query
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }
    
    router.replace(`/search?${params.toString()}`);
  };
  
  // Initial search if query is provided in URL
  useEffect(() => {
    if (initialQuery) {
      fetchDocuments(initialQuery);
    }
  }, [initialQuery]);
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Documents</h1>
        <p className="text-muted-foreground mt-1">
          Search for documents by title, description, or tags.
        </p>
      </div>
      
      <Separator className="opacity-50" />
      
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="search"
          placeholder="Search documents..."
          className="pl-10 py-6 text-lg"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Button
          type="submit"
          className="absolute right-0 top-0 h-full rounded-l-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2Icon className="h-5 w-5 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </form>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Searching...</span>
        </div>
      ) : isSearched ? (
        documents.length > 0 ? (
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Found {documents.length} document{documents.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
            <DocumentGrid initialDocuments={documents} />
          </div>
        ) : (
          <EmptyState
            onReset={() => {
              setSearchQuery("");
              setDocuments([]);
              setIsSearched(false);
              router.replace("/search");
            }}
            hasFilters={true}
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 mt-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <SearchIcon className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Search for documents</h2>
          
          <p className="text-muted-foreground max-w-md mb-6">
            Enter keywords to search for documents by title, description, or tags.
          </p>
        </div>
      )}
    </div>
  );
}