import React from "react";
import { DocumentGrid } from "@/components/dashboard/document-grid";
import { Separator } from "@/components/ui/separator";
import { listDocuments, mapToApiDocument } from "@/lib/document-repository";

// Fetch all documents for SSR
async function getDocuments() {
  try {
    const result = await listDocuments({ sortBy: "createdAt", sortOrder: "desc", limit: 100 });
    return result.items.map(mapToApiDocument);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export default async function DocumentsPage() {
  const documents = await getDocuments();
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Documents</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your stored documents.
        </p>
      </div>
      
      <Separator className="opacity-50" />
      
      <DocumentGrid initialDocuments={documents} />
    </div>
  );
}