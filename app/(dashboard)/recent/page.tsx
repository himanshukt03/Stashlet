import React from "react";
import { DocumentGrid } from "@/components/dashboard/document-grid";
import { Separator } from "@/components/ui/separator";
import { listDocuments, mapToApiDocument } from "@/lib/document-repository";

// Fetch recent documents for SSR
async function getRecentDocuments() {
  try {
    const result = await listDocuments({ sortBy: "createdAt", sortOrder: "desc", limit: 20 });
    return result.items.map(mapToApiDocument);
  } catch (error) {
    console.error("Error fetching recent documents:", error);
    return [];
  }
}

export default async function RecentPage() {
  const documents = await getRecentDocuments();
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recent Documents</h1>
        <p className="text-muted-foreground mt-1">
          View your most recently added documents.
        </p>
      </div>
      
      <Separator className="opacity-50" />
      
      <DocumentGrid initialDocuments={documents} />
    </div>
  );
}