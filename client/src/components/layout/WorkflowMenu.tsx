import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  HomeIcon, 
  FileIcon, 
  BarChart2Icon, 
  CheckSquareIcon, 
  ZapIcon 
} from 'lucide-react';

interface WorkflowMenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export function WorkflowMenu() {
  const [location] = useLocation();
  
  const menuItems: WorkflowMenuItem[] = [
    {
      name: 'Workflow Home',
      href: '/workflow-home',
      icon: <HomeIcon className="w-5 h-5" />,
      description: 'Overview and introduction'
    },
    {
      name: 'Data Connection',
      href: '/workflow/data-connection',
      icon: <FileIcon className="w-5 h-5" />,
      description: 'Upload and connect data'
    },
    {
      name: 'Review',
      href: '/workflow/review',
      icon: <CheckSquareIcon className="w-5 h-5" />,
      description: 'Review AI recommendations'
    },
    {
      name: 'Implementation',
      href: '/workflow/implement',
      icon: <ZapIcon className="w-5 h-5" />,
      description: 'Implement and automate'
    }
  ];
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/workflow-home">
            <span className="flex items-center space-x-2 text-blue-600 font-medium cursor-pointer">
              <BarChart2Icon className="w-5 h-5" />
              <span>PayrollPro AI Workflow</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => {
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <span 
                    className={`flex items-center space-x-1 text-sm cursor-pointer ${
                      isActive 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                    title={item.description}
                  >
                    <div className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </div>
                    <span>{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
          
          <div className="hidden md:block">
            <Link href="/">
              <span className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                Return to Home
              </span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-blue-600 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {/* This would be shown/hidden with state management in a full implementation */}
    </div>
  );
}