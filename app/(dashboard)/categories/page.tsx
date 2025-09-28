import React from "react";
import { Separator } from "@/components/ui/separator";
import { documentTypes } from "@/lib/validators";
import { fetchAllDocuments } from "@/lib/document-repository";
import { 
  FileIcon, 
  ImageIcon, 
  FileTextIcon,
  FileType2Icon,
  FileBoxIcon,
  FileBarChart2Icon,
  FileBadgeIcon,
  FileDigitIcon,
} from "lucide-react";
import MotionCardWrapper from "@/components/motion-card-wrapper";

// Fetch document counts by type for SSR
async function getDocumentCountsByType() {
  try {
    const documents = await fetchAllDocuments();

    return documentTypes.map((type) => ({
      type,
      count: documents.filter((document) => document.type === type).length,
    }));
  } catch (error) {
    console.error("Error fetching document counts:", error);
    return [];
  }
}

// Icon mapping for document types
const typeIcons: Record<string, React.ElementType> = {
  identification: FileIcon,
  financial: FileBarChart2Icon,
  medical: FileBadgeIcon,
  legal: FileDigitIcon,
  education: FileTextIcon,
  personal: ImageIcon,
  work: FileBoxIcon,
  custom: FileType2Icon,
};

// Helper function to get description for each document type
function getTypeDescription(type: string): string {
  switch (type) {
    case 'identification':
      return 'Personal identification documents such as ID cards, passports, and driver\'s licenses.';
    case 'financial':
      return 'Financial records, bank statements, tax forms, and investment documents.';
    case 'medical':
      return 'Health records, insurance cards, prescriptions, and medical reports.';
    case 'legal':
      return 'Contracts, agreements, certificates, and legal notices.';
    case 'education':
      return 'Diplomas, certificates, transcripts, and educational records.';
    case 'personal':
      return 'Personal documents, notes, letters, and personal records.';
    case 'work':
      return 'Work-related documents, resumes, references, and professional certificates.';
    case 'custom':
      return 'Custom categorized documents that don\'t fit into standard categories.';
    default:
      return 'Miscellaneous documents.';
  }
}

export default async function CategoriesPage() {
  const typeCounts = await getDocumentCountsByType();
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground mt-1">
          Browse your documents by category.
        </p>
      </div>
      
      <Separator className="opacity-50" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {typeCounts.map(({ type, count }) => {
          const Icon = typeIcons[type] || FileIcon;
          const displayName = type.charAt(0).toUpperCase() + type.slice(1);
          
          return (
            <MotionCardWrapper
              key={type}
              type={type}
              count={count}
              displayName={displayName}
              description={getTypeDescription(type)}
              icon={<Icon className="h-6 w-6 text-primary" />}
            />
          );
        })}
      </div>
    </div>
  );
}