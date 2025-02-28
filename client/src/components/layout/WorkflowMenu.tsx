import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  FileTextIcon, 
  DatabaseIcon, 
  BarChart2Icon, 
  CheckSquareIcon, 
  PlayCircleIcon 
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
      name: "Data Connection",
      href: "/data-connection",
      icon: <DatabaseIcon className="w-5 h-5" />,
      description: "Connect to your data sources"
    },
    {
      name: "AI Analysis",
      href: "/ai-analysis",
      icon: <BarChart2Icon className="w-5 h-5" />,
      description: "Get insights from your data"
    },
    {
      name: "Review",
      href: "/review",
      icon: <CheckSquareIcon className="w-5 h-5" />,
      description: "Review AI recommendations"
    },
    {
      name: "Implementation",
      href: "/implementation",
      icon: <PlayCircleIcon className="w-5 h-5" />,
      description: "Implement approved changes"
    }
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center -mb-px overflow-x-auto">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className={`mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}