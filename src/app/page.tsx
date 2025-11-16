'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Users, Shield, Zap, CheckCircle, Building2, Globe, Smartphone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-blue-600 rounded-full blur-md opacity-50"></div>
                <div className="relative bg-white p-2 rounded-full">
                  <Image src="/icon.png" alt="iBarangay" width={40} height={40} className="object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                  iBarangay
                </h1>
                <p className="text-xs text-muted-foreground">DICT MIMAROPA</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
              <div className="inline-block">
                <div className="bg-gradient-to-r from-blue-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  🇵🇭 Digital Governance for Oriental Mindoro
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                  Modern Barangay
                </span>
                <br />
                <span className="text-slate-900 dark:text-white">
                  Management System
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Streamline your barangay operations with our comprehensive digital platform. 
                From document requests to resident management, everything you need in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg h-14 px-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                    Register as Resident
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    Staff Login
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-muted-foreground">Barangays</div>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">1000+</div>
                  <div className="text-sm text-muted-foreground">Residents</div>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="relative animate-in fade-in slide-in-from-right duration-1000 delay-300">
              <div className="grid grid-cols-2 gap-6">
                {/* Document Requests Card */}
                <div className="group bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)] transform hover:-translate-y-3 transition-all duration-500 border-2 border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Document Requests</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Request certificates online anytime</p>
                  </div>
                </div>

                {/* Resident Portal Card */}
                <div className="group bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.5)] transform hover:-translate-y-3 transition-all duration-500 border-2 border-orange-100 dark:border-orange-900 hover:border-orange-300 dark:hover:border-orange-700 relative overflow-hidden mt-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Resident Portal</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Manage your profile and requests</p>
                  </div>
                </div>

                {/* Secure & Private Card */}
                <div className="group bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] transform hover:-translate-y-3 transition-all duration-500 border-2 border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Your data is protected</p>
                  </div>
                </div>

                {/* Fast Processing Card */}
                <div className="group bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(34,197,94,0.5)] transform hover:-translate-y-3 transition-all duration-500 border-2 border-green-100 dark:border-green-900 hover:border-green-300 dark:hover:border-green-700 relative overflow-hidden mt-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Fast Processing</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Quick turnaround time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                One Platform
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for efficient barangay management and resident services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Document Management',
                description: 'Request, track, and manage barangay certificates and clearances digitally',
                gradient: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-100 dark:bg-blue-900',
                iconColor: 'text-blue-600 dark:text-blue-400',
                hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.4)]',
                borderColor: 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600'
              },
              {
                icon: Users,
                title: 'Resident Database',
                description: 'Centralized resident information system with secure access controls',
                gradient: 'from-orange-500 to-red-500',
                bgColor: 'bg-orange-100 dark:bg-orange-900',
                iconColor: 'text-orange-600 dark:text-orange-400',
                hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.4)]',
                borderColor: 'border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600'
              },
              {
                icon: Building2,
                title: 'Multi-Barangay Support',
                description: 'Manage multiple barangays from a single unified platform',
                gradient: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-100 dark:bg-purple-900',
                iconColor: 'text-purple-600 dark:text-purple-400',
                hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)]',
                borderColor: 'border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600'
              },
              {
                icon: Smartphone,
                title: 'Mobile Responsive',
                description: 'Access from any device - desktop, tablet, or smartphone',
                gradient: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-100 dark:bg-green-900',
                iconColor: 'text-green-600 dark:text-green-400',
                hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(34,197,94,0.4)]',
                borderColor: 'border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600'
              },
              {
                icon: Shield,
                title: 'Role-Based Access',
                description: 'Secure permissions for captains, secretaries, treasurers, and residents',
                gradient: 'from-red-500 to-rose-500',
                bgColor: 'bg-red-100 dark:bg-red-900',
                iconColor: 'text-red-600 dark:text-red-400',
                hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(239,68,68,0.4)]',
                borderColor: 'border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600'
              },
              {
                icon: Globe,
                title: 'Real-Time Updates',
                description: 'Instant notifications and status updates for all transactions',
                gradient: 'from-indigo-500 to-blue-500',
                bgColor: 'bg-indigo-100 dark:bg-indigo-900',
                iconColor: 'text-indigo-600 dark:text-indigo-400',
                hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.4)]',
                borderColor: 'border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 ${feature.borderColor} ${feature.hoverShadow} transform hover:-translate-y-3 transition-all duration-500 animate-in fade-in slide-in-from-bottom overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Decorative Circle */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative">
                  {/* Icon Container */}
                  <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-orange-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Modernize Your Barangay?
            </h2>
            <p className="text-xl text-white/90">
              Join the digital transformation. Empower your community with efficient, transparent governance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-slate-100 text-lg h-14 px-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                  Register Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-2 border-white text-white hover:bg-white/10">
                  Staff Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image src="/icon.png" alt="iBarangay" width={32} height={32} />
                <span className="text-xl font-bold">iBarangay</span>
              </div>
              <p className="text-slate-400 text-sm">
                Digital governance platform for Oriental Mindoro barangays
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Powered By</h4>
              <p className="text-sm text-slate-400">
                DICT MIMAROPA<br />
                Region IV-B<br />
                Oriental Mindoro
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>© 2024 iBarangay. All rights reserved. Developed by RYAN LANUEVO CLAUD.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
