"use client";

import React, { useState, useEffect } from "react";
import { DocumentCard, DocumentCardSkeleton } from "./document-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Grid2X2Icon,
  ListIcon, 
  PlusIcon,
  SearchIcon,
  FilterIcon,
  SlidersHorizontalIcon,
  XIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { documentTypes } from "@/lib/validators";
import { debounce } from "@/lib/utils";
import { DocumentEditDialog } from "./document-edit";
import { EmptyState } from "./empty-state";

interface DocumentGridProps {
  initialDocuments?: any[];
}

export function DocumentGrid({ initialDocuments = [] }: DocumentGridProps) {
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(!initialDocuments.length);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    isTemporary: undefined as boolean | undefined,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [editingDocument, setEditingDocument] = useState<any | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Extract all unique tags from documents
  useEffect(() => {
    if (documents.length) {
      const tags = documents
        .flatMap((doc) => doc.tags || [])
        .filter((tag, index, self) => tag && self.indexOf(tag) === index);
      setAvailableTags(tags);
    }
  }, [documents]);

  // Fetch documents on component mount
  useEffect(() => {
    if (!initialDocuments.length) {
      fetchDocuments();
    }
  }, [initialDocuments]);

  // Fetch documents with filters
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      let url = "/api/documents?";
      
      if (search) {
        url += `search=${encodeURIComponent(search)}&`;
      }
      
      if (filters.type) {
        url += `type=${encodeURIComponent(filters.type)}&`;
      }
      
      if (filters.isTemporary !== undefined) {
        url += `isTemporary=${filters.isTemporary}&`;
      }
      
      if (selectedTags.length > 0) {
        url += `tags=${encodeURIComponent(selectedTags.join(","))}&`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce(() => {
    fetchDocuments();
  }, 500);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch();
  };

  // Handle filter changes
  const handleFilterChange = (filter: string, value: any) => {
    setFilters((prev) => ({ ...prev, [filter]: value }));
    fetchDocuments();
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    fetchDocuments();
  };

  // Handle document delete
  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc._id !== id));
  };

  // Handle document edit
  const handleEditDocument = (document: any) => {
    setEditingDocument(document);
  };

  // Handle document update
  const handleUpdateDocument = (updatedDocument: any) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc._id === updatedDocument._id ? updatedDocument : doc
      )
    );
    setEditingDocument(null);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setFilters({
      type: "",
      isTemporary: undefined,
    });
    setSelectedTags([]);
    fetchDocuments();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView("grid")}
              className={view === "grid" ? "bg-accent" : ""}
            >
              <Grid2X2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView("list")}
              className={view === "list" ? "bg-accent" : ""}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="w-[200px] sm:w-[300px] pl-8"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && documents.length === 0) {
    return <EmptyState onReset={resetFilters} hasFilters={!!(search || filters.type || filters.isTemporary !== undefined || selectedTags.length > 0)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView("grid")}
              className={view === "grid" ? "bg-accent" : ""}
            >
              <Grid2X2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView("list")}
              className={view === "list" ? "bg-accent" : ""}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="w-[200px] sm:w-[300px] pl-8"
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
        
        {showFilters && (
          <div className="p-4 border rounded-lg space-y-4 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center">
                <SlidersHorizontalIcon className="h-4 w-4 mr-2" />
                Filters
              </h3>
              {(filters.type || filters.isTemporary !== undefined || selectedTags.length > 0) && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8">
                  <XIcon className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={
                    filters.isTemporary === undefined
                      ? ""
                      : filters.isTemporary
                      ? "temporary"
                      : "permanent"
                  }
                  onValueChange={(value) =>
                    handleFilterChange(
                      "isTemporary",
                      value === "" ? undefined : value === "temporary"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All documents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All documents</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <XIcon className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div
        className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "space-y-3"
        }
      >
        {documents.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            onDelete={handleDeleteDocument}
            onEdit={handleEditDocument}
          />
        ))}
      </div>
      
      {editingDocument && (
        <DocumentEditDialog
          document={editingDocument}
          open={!!editingDocument}
          onOpenChange={(open) => !open && setEditingDocument(null)}
          onUpdate={handleUpdateDocument}
        />
      )}
    </div>
  );
}