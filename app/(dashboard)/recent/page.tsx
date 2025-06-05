import React from "react";
import { DocumentGrid } from "@/components/dashboard/document-grid";
import { Separator } from "@/components/ui/separator";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/Document";

// Fetch recent documents for SSR
async function getRecentDocuments() {
  try {
    await connectToDatabase();
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    return JSON.parse(JSON.stringify(documents));
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