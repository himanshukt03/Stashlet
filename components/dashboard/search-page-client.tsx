"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Separator } from "@/components/ui/separator";

// Import the search component dynamically with client-side only rendering
const ClientSearchComponent = dynamic(
  () => import("@/components/dashboard/search-component").then(mod => ({ default: mod.SearchComponent })),
  { ssr: false }
);

// Loading component to display while search is loading
function SearchLoading() {
  return (
    <div className="flex h-32 w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}

export function SearchPageClient() {
  return (
    <>
      <Suspense fallback={<SearchLoading />}>
        <ClientSearchComponent />
      </Suspense>
      
      <Separator className="my-6" />
    </>
  );
}
