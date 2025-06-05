import React from "react";
import { DocumentGrid } from "@/components/dashboard/document-grid";
import { Separator } from "@/components/ui/separator";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/Document";

// Fetch all documents for SSR
async function getDocuments() {
  try {
    await connectToDatabase();
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .lean();
    
    return JSON.parse(JSON.stringify(documents));
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