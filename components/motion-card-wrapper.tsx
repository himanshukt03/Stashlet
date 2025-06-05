'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";

interface MotionCardWrapperProps {
  type: string;
  count: number;
  displayName: string;
  description: string;
  icon: React.ReactNode;
}

export default function MotionCardWrapper({
  type,
  count,
  displayName,
  description,
  icon
}: MotionCardWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link href={`/documents?type=${type}`}>
        <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all bg-card/50 backdrop-blur-md border-muted/80">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-md bg-primary/10">
                {icon}
              </div>
            </div>
            <CardTitle className="mt-4">{displayName}</CardTitle>
            <CardDescription>
              {count} document{count !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="ghost" className="w-full justify-between" asChild>
              <span>
                View Documents
                <ChevronRightIcon className="h-4 w-4" />
              </span>
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}