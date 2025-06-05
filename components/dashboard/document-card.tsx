"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  MoreVerticalIcon,
  CalendarIcon,
  TagIcon,
  DownloadIcon,
  TrashIcon,
  EditIcon,
  FileType2Icon,
  ClockIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DocumentCardProps {
  document: {
    _id: string;
    title: string;
    type: string;
    customType?: string;
    description?: string;
    tags?: string[];
    issueDate?: string;
    expiryDate?: string;
    fileUrl: string;
    thumbnailUrl: string;
    fileSize: number;
    mimeType: string;
    fileName: string;
    isTemporary: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onDelete?: (id: string) => void;
  onEdit?: (document: any) => void;
}

export function DocumentCard({ document, onDelete, onEdit }: DocumentCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fileType = document.mimeType.split('/')[0];
  const isImage = fileType === 'image';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/documents/${document._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success('Document deleted successfully');
      if (onDelete) {
        onDelete(document._id);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDownload = () => {
    window.open(document.fileUrl, '_blank');
  };

  const getDocumentIcon = () => {
    if (isImage) return <ImageIcon className="h-6 w-6 text-blue-500" />;
    if (document.mimeType.includes('pdf')) return <FileIcon className="h-6 w-6 text-red-500" />;
    if (document.mimeType.includes('word') || document.mimeType.includes('document')) {
      return <FileTextIcon className="h-6 w-6 text-blue-700" />;
    }
    return <FileType2Icon className="h-6 w-6 text-gray-500" />;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <Card className="overflow-hidden bg-card/50 backdrop-blur-md border-muted/80 hover:shadow-lg transition-all">
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-muted">{getDocumentIcon()}</div>
                <div className="truncate max-w-[180px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-medium truncate">{document.title}</h3>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{document.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownload}>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit && onEdit(document)}>
                    <EditIcon className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-36 w-full relative rounded-md overflow-hidden bg-muted/50">
              {isImage ? (
                <>
                  {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  )}
                  <Image
                    src={document.thumbnailUrl}
                    alt={document.title}
                    fill
                    className={`object-cover transition-opacity duration-300 ${
                      isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setIsImageLoaded(true)}
                  />
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    {getDocumentIcon()}
                    <p className="mt-2 text-xs text-muted-foreground">{document.fileName}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <FileType2Icon className="h-3.5 w-3.5 mr-1" />
                <span className="capitalize">{document.type}</span>
                {document.customType && ` - ${document.customType}`}
                <span className="mx-1">•</span>
                <span>{formatBytes(document.fileSize)}</span>
              </div>
              
              {document.issueDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                  <span>Issued: {formatDate(document.issueDate)}</span>
                </div>
              )}
              
              {document.isTemporary && (
                <div className="flex items-center">
                  <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Temporary
                  </Badge>
                </div>
              )}
              
              {document.tags && document.tags.length > 0 && (
                <div className="flex items-center text-xs space-x-1 overflow-hidden">
                  <TagIcon className="h-3.5 w-3.5 mr-1 shrink-0 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {document.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {document.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{document.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDate(document.createdAt)}
            </span>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <DownloadIcon className="h-4 w-4 mr-1" />
              Download
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this document. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function DocumentCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-36 w-full rounded-md" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  );
}