"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { Search } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
}

// Sample blog posts data
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Understanding Payroll Tax Compliance in 2025",
    excerpt: "A comprehensive guide to navigating the complex world of payroll tax compliance for businesses of all sizes.",
    imageUrl: "https://picsum.photos/id/1/600/400",
    category: "Tax Compliance",
    date: "February 15, 2025",
    author: {
      name: "Jennifer Smith",
      avatar: "https://picsum.photos/id/64/100/100"
    }
  },
  {
    id: 2,
    title: "5 Ways to Streamline Your Payroll Process",
    excerpt: "Discover the latest strategies and tools to make your payroll operations more efficient and error-free.",
    imageUrl: "https://picsum.photos/id/2/600/400",
    category: "Best Practices",
    date: "February 10, 2025",
    author: {
      name: "Michael Johnson",
      avatar: "https://picsum.photos/id/65/100/100"
    }
  },
  {
    id: 3,
    title: "The Future of Employee Benefits Administration",
    excerpt: "How technology is transforming the way companies manage and deliver employee benefits.",
    imageUrl: "https://picsum.photos/id/3/600/400",
    category: "Benefits",
    date: "February 5, 2025",
    author: {
      name: "Sarah Williams",
      avatar: "https://picsum.photos/id/66/100/100"
    }
  },
  {
    id: 4,
    title: "Remote Work and Payroll: What You Need to Know",
    excerpt: "Managing payroll for distributed teams across different states and countries.",
    imageUrl: "https://picsum.photos/id/4/600/400",
    category: "Remote Work",
    date: "January 28, 2025",
    author: {
      name: "David Brown",
      avatar: "https://picsum.photos/id/67/100/100"
    }
  },
  {
    id: 5,
    title: "Employee Self-Service Portals: Boosting Engagement",
    excerpt: "How self-service technology is changing the employee experience for the better.",
    imageUrl: "https://picsum.photos/id/5/600/400",
    category: "Technology",
    date: "January 20, 2025",
    author: {
      name: "Emily Davis",
      avatar: "https://picsum.photos/id/68/100/100"
    }
  },
  {
    id: 6,
    title: "Year-End Payroll Checklist for Businesses",
    excerpt: "Essential tasks and best practices to ensure a smooth year-end payroll process.",
    imageUrl: "https://picsum.photos/id/6/600/400",
    category: "Best Practices",
    date: "January 15, 2025",
    author: {
      name: "Robert Wilson",
      avatar: "https://picsum.photos/id/69/100/100"
    }
  }
];

// Categories for filtering
const categories = [
  "All Categories",
  "Tax Compliance",
  "Best Practices",
  "Benefits",
  "Remote Work",
  "Technology"
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts based on category and search query
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All Categories" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-12 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-text-dark mb-4">PayrollPro Blog</h1>
              <p className="text-lg text-text-light max-w-3xl mx-auto">
                Stay up to date with the latest payroll trends, compliance updates, and best practices.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <div className="md:w-1/4">
                <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Search</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-full border border-gray-200 rounded-md py-2 pl-3 pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Categories</h3>
                    <ul className="space-y-2">
                      {categories.map((category) => (
                        <li key={category}>
                          <button
                            className={`w-full text-left py-1 px-2 rounded-md ${
                              selectedCategory === category 
                                ? 'bg-primary text-white' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Main Content - Blog Posts in Masonry Layout */}
              <div className="md:w-3/4">
                <div className="grid md:grid-cols-2 gap-8">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center mb-3">
                          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {post.category}
                          </span>
                          <span className="ml-2 text-xs text-text-light">{post.date}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                        <p className="text-text-light mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img 
                              src={post.author.avatar} 
                              alt={post.author.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                            <span className="text-sm font-medium">{post.author.name}</span>
                          </div>
                          <a href="#" className="text-primary font-medium text-sm hover:underline">Read More</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredPosts.length === 0 && (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <h3 className="text-xl font-medium mb-2">No articles found</h3>
                    <p className="text-text-light">
                      Try adjusting your search or filter to find what you're looking for.
                    </p>
                  </div>
                )}
                
                {filteredPosts.length > 0 && (
                  <div className="mt-12 text-center">
                    <button className="bg-white border border-gray-200 hover:bg-gray-50 text-text-dark px-6 py-3 rounded-md font-medium">
                      Load More Articles
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}