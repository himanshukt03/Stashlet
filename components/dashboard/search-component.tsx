"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DocumentGrid } from "@/components/dashboard/document-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2Icon } from "lucide-react";
import { debounce } from "@/lib/utils";
import { EmptyState } from "@/components/dashboard/empty-state";

export function SearchComponent() {
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
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    
    router.replace(`/search?${params.toString()}`);
  }, 500);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };
  
  // Initial search on mount
  useEffect(() => {
    if (initialQuery) {
      fetchDocuments(initialQuery);
    }
  }, [initialQuery]);
  
  return (
    <div>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search documents by title, content, or tags..."
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </div>
      
      <div className="min-h-[300px] mt-6">
        {isSearched ? (
          documents.length > 0 ? (
            <DocumentGrid initialDocuments={documents} />
          ) : (
            <EmptyState
              title="No results found"
              description="Try searching with different keywords"
              icon="search"
            />
          )
        ) : (
          <EmptyState
            title="Search for documents"
            description="Enter keywords to find documents"
            icon="search"
          />
        )}
      </div>
    </div>
  );
}
