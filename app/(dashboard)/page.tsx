import React from "react";
import FileUpload from "@/components/dashboard/file-upload";
import { DocumentGrid } from "@/components/dashboard/document-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/Document";

// Fetch initial documents for SSR
async function getDocuments() {
  try {
    await connectToDatabase();
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    
    return JSON.parse(JSON.stringify(documents));
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export default async function HomePage() {
  const documents = await getDocuments();
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage your documents in one place.
        </p>
      </div>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-md border-muted/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Upload Document</CardTitle>
            </CardHeader>
            <Separator className="opacity-50" />
            <CardContent className="pt-6">
              <FileUpload />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <DocumentGrid initialDocuments={documents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}