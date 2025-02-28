import { useEffect } from 'react';
import EmployeeDataImport from '@/components/data-integration/EmployeeDataImport';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { HomeIcon, Users } from "lucide-react";
import { Link } from 'wouter';

export default function EmployeeImportPage() {
  // Set the page title
  useEffect(() => {
    document.title = 'Employee Import | PayrollPro AI';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <div className="flex items-center">
                  <HomeIcon className="h-4 w-4" />
                </div>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">
                <div className="flex items-center">
                  Dashboard
                </div>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/data-connection">
                <div className="flex items-center">
                  Data Connection
                </div>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Employee Import
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <EmployeeDataImport />
    </div>
  );
}