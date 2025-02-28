import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  BarChart3Icon, 
  BarChart2Icon, 
  PieChartIcon, 
  LineChartIcon, 
  TrendingUpIcon,
  DatabaseIcon,
  ArrowRightIcon
} from 'lucide-react';

import { BackgroundParticles } from '../components/animations/BackgroundParticles';
import { WorkflowMenu } from '../components/layout/WorkflowMenu';

export default function AIAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <WorkflowMenu />

      {/* Hero Header */}
      <div className="relative py-10 bg-purple-600 text-white overflow-hidden">
        <BackgroundParticles />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              AI-Powered Data Analysis
            </motion.h1>
            <motion.p 
              className="mt-2 text-purple-100 text-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Gain deep insights from your payroll data with our advanced analytics engine
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3Icon className="mr-2 h-5 w-5 text-purple-500" />
                Analysis Options
              </h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center">
                  <BarChart2Icon className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Payroll Cost Analysis</h3>
                    <p className="text-sm text-gray-500">Analyze your payroll expenses over time</p>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg border border-gray-200 flex items-center">
                  <PieChartIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Department Breakdown</h3>
                    <p className="text-sm text-gray-500">View costs by department and role</p>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg border border-gray-200 flex items-center">
                  <LineChartIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Trend Analysis</h3>
                    <p className="text-sm text-gray-500">Identify patterns and outliers</p>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg border border-gray-200 flex items-center">
                  <TrendingUpIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Forecasting</h3>
                    <p className="text-sm text-gray-500">Project future payroll expenses</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-2">No Data Connected</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Connect to your data sources first to perform advanced analysis
                </p>
                <Link href="/data-connection">
                  <div className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm cursor-pointer">
                    Connect Data Sources
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="md:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Payroll Cost Analysis
                </h2>
                <div className="flex space-x-2">
                  <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white">
                    <option>Last 6 months</option>
                    <option>Last 12 months</option>
                    <option>Year to date</option>
                    <option>Custom range</option>
                  </select>
                  <button className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-md font-medium">
                    Export
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <DatabaseIcon className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
                <p className="text-gray-500 mt-1 text-center max-w-md">
                  To perform AI analysis, you need to first connect your data sources
                  from the Data Connection page.
                </p>
                <Link href="/data-connection">
                  <div className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors cursor-pointer inline-block">
                    Connect Data
                  </div>
                </Link>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h3 className="font-medium text-gray-900 mb-2">How it works</h3>
                <p className="text-sm text-gray-600">
                  Our AI analyzes your payroll data to identify patterns, anomalies, and optimization 
                  opportunities. We use advanced machine learning algorithms to provide insights that 
                  can help you reduce costs and improve efficiency.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">1. Connect Data</div>
                    <p className="text-xs text-gray-500">Import your payroll information</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">2. AI Analysis</div>
                    <p className="text-xs text-gray-500">Our AI processes and analyzes</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="font-medium text-gray-900">3. Get Insights</div>
                    <p className="text-xs text-gray-500">View reports and recommendations</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}