import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FileSearchIcon, HomeIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <FileSearchIcon className="w-24 h-24 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
      <p className="mt-4 text-lg text-muted-foreground mb-8">
        We couldn't find the page you're looking for.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">
            <HomeIcon className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}