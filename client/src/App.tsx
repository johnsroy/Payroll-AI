import React from 'react';
import { Route, Switch, Link, useLocation } from 'wouter';
import { 
  BarChart3, 
  Home, 
  Users, 
  FileSpreadsheet, 
  DollarSign, 
  Settings, 
  Menu, 
  X,
  Cpu
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Pages
import HomePage from './pages/Home';
import PayrollPage from './pages/PayrollPage';
import NotFound from './pages/NotFound';

// Landing page components
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import HowItWorks from './components/sections/HowItWorks';
import Testimonials from './components/sections/Testimonials';
import FAQ from './components/sections/FAQ';
import CTA from './components/sections/CTA';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // If we're on the landing page, don't show the app layout
  if (location === '/') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PayrollPro AI</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" />
          <NavLink href="/employees" icon={<Users className="h-5 w-5" />} label="Employees" />
          <NavLink href="/payroll" icon={<DollarSign className="h-5 w-5" />} label="Payroll" />
          <NavLink href="/reports" icon={<BarChart3 className="h-5 w-5" />} label="Reports" />
          <NavLink href="/documents" icon={<FileSpreadsheet className="h-5 w-5" />} label="Documents" />
          <NavLink href="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
        </nav>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          className="bg-primary text-primary-foreground p-2 rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 bg-card p-4 h-full z-50" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 p-2">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                <Cpu className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">PayrollPro AI</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              <NavLink 
                href="/dashboard" 
                icon={<Home className="h-5 w-5" />} 
                label="Dashboard" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              <NavLink 
                href="/employees" 
                icon={<Users className="h-5 w-5" />} 
                label="Employees" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              <NavLink 
                href="/payroll" 
                icon={<DollarSign className="h-5 w-5" />} 
                label="Payroll" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              <NavLink 
                href="/reports" 
                icon={<BarChart3 className="h-5 w-5" />} 
                label="Reports" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              <NavLink 
                href="/documents" 
                icon={<FileSpreadsheet className="h-5 w-5" />} 
                label="Documents" 
                onClick={() => setMobileMenuOpen(false)} 
              />
              <NavLink 
                href="/settings" 
                icon={<Settings className="h-5 w-5" />} 
                label="Settings" 
                onClick={() => setMobileMenuOpen(false)} 
              />
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function NavLink({ href, icon, label, onClick }: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full justify-start",
        isActive ? "bg-muted" : "hover:bg-muted"
      )}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
}

function App() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/dashboard" component={HomePage} />
        <Route path="/payroll" component={PayrollPage} />
        <Route path="/employees" component={() => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Employees</h1><p>Employee management coming soon</p></div>} />
        <Route path="/reports" component={() => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Reports</h1><p>Reports functionality coming soon</p></div>} />
        <Route path="/documents" component={() => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Documents</h1><p>Document management coming soon</p></div>} />
        <Route path="/settings" component={() => <div className="p-8"><h1 className="text-2xl font-bold mb-4">Settings</h1><p>Settings page coming soon</p></div>} />
        <Route path="/:rest*" component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export default App;