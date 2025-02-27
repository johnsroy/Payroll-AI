import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import FeaturesPage from "@/pages/features";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import LoginPage from "@/pages/login";
import GetStartedPage from "@/pages/get-started-button";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/features" component={FeaturesPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/get-started-button" component={GetStartedPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
