import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  File, 
  FileSpreadsheet, 
  FileText, 
  Code, 
  Image as ImageIcon, 
  Eye, 
  Download, 
  ArrowLeft, 
  BarChart 
} from 'lucide-react';
import { formatFileSize } from '@/lib/dataConnectionAgent';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  path: string;
  content?: string;
}

interface FileViewerPanelProps {
  file: FileItem;
  onBack: () => void;
  onAnalyze?: (file: FileItem) => void;
}

export default function FileViewerPanel({ file, onBack, onAnalyze }: FileViewerPanelProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata' | 'analysis'>('preview');
  
  const getFileIcon = () => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    } else if (['txt', 'md', 'rtf', 'doc', 'docx', 'pdf'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if (['json', 'xml', 'html', 'js', 'ts', 'py'].includes(ext || '')) {
      return <Code className="h-5 w-5 text-purple-600" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="h-5 w-5 text-pink-600" />;
    }
    
    return <File className="h-5 w-5 text-gray-600" />;
  };
  
  const renderFilePreview = () => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!file.content) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-md p-6">
          <div className="mb-4">
            {getFileIcon()}
          </div>
          <p className="text-gray-500 text-sm">Preview not available for this file type</p>
          <Button variant="outline" size="sm" className="mt-4">
            <Download className="h-4 w-4 mr-2" />
            Download to View
          </Button>
        </div>
      );
    }
    
    if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
      // Simple CSV preview
      const rows = file.content.split('\n').map(row => row.split(','));
      const headers = rows[0] || [];
      const dataRows = rows.slice(1);
      
      return (
        <div className="overflow-auto max-h-96 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, i) => (
                  <TableHead key={i}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataRows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    
    if (['txt', 'md', 'rtf', 'json', 'xml', 'html', 'js', 'ts', 'py'].includes(ext || '')) {
      return (
        <div className="overflow-auto max-h-96 p-4 bg-gray-50 rounded-md font-mono text-sm whitespace-pre-wrap">
          {file.content}
        </div>
      );
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext || '')) {
      return (
        <div className="flex justify-center p-4 bg-gray-50 rounded-md">
          <img 
            src={`data:image/${ext};base64,${file.content}`} 
            alt={file.name} 
            className="max-h-96 object-contain" 
          />
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-md p-6">
        <div className="mb-4">
          {getFileIcon()}
        </div>
        <p className="text-gray-500 text-sm">Preview not available for this file type</p>
        <Button variant="outline" size="sm" className="mt-4">
          <Download className="h-4 w-4 mr-2" />
          Download to View
        </Button>
      </div>
    );
  };
  
  const renderFileMetadata = () => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="text-sm font-medium text-gray-500">File Name</div>
          <div className="text-sm">{file.name}</div>
          
          <div className="text-sm font-medium text-gray-500">File Type</div>
          <div className="text-sm">{ext?.toUpperCase() || 'Unknown'}</div>
          
          <div className="text-sm font-medium text-gray-500">File Size</div>
          <div className="text-sm">{formatFileSize(file.size)}</div>
          
          <div className="text-sm font-medium text-gray-500">Last Modified</div>
          <div className="text-sm">{file.lastModified.toLocaleString()}</div>
          
          <div className="text-sm font-medium text-gray-500">Path</div>
          <div className="text-sm truncate">{file.path}</div>
        </div>
      </div>
    );
  };
  
  const renderFileAnalysis = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Data Quality Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completeness</span>
                <span className="font-medium">98%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '98%' }}></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Format Consistency</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data Validity</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-blue-50 text-blue-600 p-1 rounded-full mr-2 mt-0.5">
                  <BarChart className="h-3 w-3" />
                </span>
                <span>
                  This file appears to contain payroll data. Consider analyzing it with our Payroll Analysis Agent.
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-amber-50 text-amber-600 p-1 rounded-full mr-2 mt-0.5">
                  <BarChart className="h-3 w-3" />
                </span>
                <span>
                  Some date formats are inconsistent. Recommend normalizing before processing.
                </span>
              </li>
            </ul>
            
            <Button className="w-full mt-4" onClick={() => onAnalyze && onAnalyze(file)}>
              Analyze with AI
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Files
        </Button>
        <div className="flex items-center">
          <div className="mr-3">
            {getFileIcon()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{file.name}</h2>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)} • Last modified on {file.lastModified.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      <Tabs 
        defaultValue="preview" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value as 'preview' | 'metadata' | 'analysis')}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <File className="h-4 w-4 mr-2" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview">
          {renderFilePreview()}
        </TabsContent>
        
        <TabsContent value="metadata">
          {renderFileMetadata()}
        </TabsContent>
        
        <TabsContent value="analysis">
          {renderFileAnalysis()}
        </TabsContent>
      </Tabs>
    </div>
  );
}