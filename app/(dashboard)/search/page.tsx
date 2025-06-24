import React from "react";
import { SearchPageClient } from "@/components/dashboard/search-page-client";

export default function SearchPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Documents</h1>
        <p className="text-muted-foreground mt-1">
          Find documents by title, content, or tags
        </p>
      </div>
      
      <SearchPageClient />
    </div>
  );
}