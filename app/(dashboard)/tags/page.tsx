import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import Document from "@/models/Document";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TagIcon } from "lucide-react";
import { motion } from "framer-motion";

// Fetch all unique tags and their counts
async function getTagsWithCounts() {
  try {
    await connectToDatabase();
    
    const documents = await Document.find({ tags: { $exists: true, $ne: [] } }).lean();
    
    // Extract all tags and count occurrences
    const tagCounts: Record<string, number> = {};
    
    documents.forEach((doc) => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by count (descending)
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

export default async function TagsPage() {
  const tags = await getTagsWithCounts();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };
  
  // Function to determine badge size based on count
  const getBadgeSize = (count: number): string => {
    const max = Math.max(...tags.map(t => t.count));
    const min = Math.min(...tags.map(t => t.count));
    
    // Normalize to a scale from 0 to 1
    const normalized = (count - min) / (max - min || 1);
    
    // Map to font sizes from 0.75rem to 1.5rem
    if (normalized < 0.2) return "text-xs py-1 px-2";
    if (normalized < 0.4) return "text-sm py-1 px-3";
    if (normalized < 0.6) return "text-base py-1.5 px-3";
    if (normalized < 0.8) return "text-lg py-1.5 px-4";
    return "text-xl py-2 px-4";
  };
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Tags</h1>
        <p className="text-muted-foreground mt-1">
          Browse your documents by tags.
        </p>
      </div>
      
      <Separator className="opacity-50" />
      
      {tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 mt-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <TagIcon className="h-10 w-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">No tags found</h2>
          
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't added any tags to your documents yet. Add tags when uploading or editing documents to organize them better.
          </p>
        </div>
      ) : (
        <motion.div 
          className="flex flex-wrap gap-3 mt-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {tags.map(({ tag, count }) => (
            <motion.div key={tag} variants={item}>
              <Link href={`/documents?tags=${tag}`}>
                <Badge 
                  variant="secondary" 
                  className={`${getBadgeSize(count)} cursor-pointer hover:bg-primary/20 transition-colors`}
                >
                  {tag} <span className="ml-1 text-muted-foreground">({count})</span>
                </Badge>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}