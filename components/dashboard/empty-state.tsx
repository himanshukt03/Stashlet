import React from "react";
import { motion } from "framer-motion";
import { FileIcon, UploadIcon, FilterIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onReset?: () => void;
  hasFilters?: boolean;
  title?: string;
  description?: string;
  icon?: string;
}

export function EmptyState({ 
  onReset, 
  hasFilters = false, 
  title = "No documents found", 
  description = "Get started by uploading your first document", 
  icon = "document" 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 mt-10"
    >      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        {icon === "filter" || hasFilters ? (
          <FilterIcon className="h-10 w-10 text-primary" />
        ) : icon === "search" ? (
          <SearchIcon className="h-10 w-10 text-primary" />
        ) : icon === "upload" ? (
          <UploadIcon className="h-10 w-10 text-primary" />
        ) : (
          <FileIcon className="h-10 w-10 text-primary" />
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-2">
        {title || (hasFilters ? "No matching documents" : "No documents yet")}
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-6">
        {description || (hasFilters
          ? "We couldn't find any documents that match your current filters. Try adjusting your search criteria or clear the filters."
          : "Upload your first document to get started. You can upload various file types like PDFs, images, and documents.")}
      </p>
      
      {hasFilters ? (
        <Button onClick={onReset} className="px-6">
          Clear Filters
        </Button>
      ) : (
        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-6">
          <UploadIcon className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      )}
    </motion.div>
  );
}