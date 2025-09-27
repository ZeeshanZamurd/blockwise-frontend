import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Shield, Users, FileText, Calendar, Building } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">BlocWise</span>
          </div>
          <div className="space-x-4">
            <Link to="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Trusted by 500+ Building Directors
          </Badge>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Transform Your Building Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Give directors transparency, ownership of their data, and better tools for governance. 
            Save 5-24 hours per month while maintaining the golden thread of your building records.
          </p>
          <div className="space-x-4">
            <Link to="/auth?mode=register">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points & Solutions */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stop Wasting Time on Manual Building Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Directors save an average of 5-24 hours per month using BlocWise
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Time Savings</CardTitle>
                <CardDescription>
                  Automated email processing and issue tracking saves 5-24 hours monthly
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Data Ownership</CardTitle>
                <CardDescription>
                  Complete transparency and control over your building's data and records
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Better Governance</CardTitle>
                <CardDescription>
                  Improved relationships with managing agents and streamlined compliance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-muted-foreground">
              Maintain the golden thread of your building records with intelligent automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Smart Email Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically synthesize, classify, and track issues from forwarded emails
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Issue Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Current and historical issue management with complete audit trails
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Calendar & Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AGM notes, meeting management, and supplier coordination
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Document Vault</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Secure storage for all building safety documents and records
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How BlocWise Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Forward Emails</h3>
              <p className="text-muted-foreground">
                Simply forward or copy building-related emails to your BlocWise system
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-muted-foreground">
                Our AI synthesizes, classifies, and creates trackable issues automatically
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Stay Organized</h3>
              <p className="text-muted-foreground">
                Access organized issues, communications, and documents in one central hub
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Building Management?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of directors who save hours every month with BlocWise
          </p>
          <Link to="/auth?mode=register">
            <Button size="lg" className="px-8">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 BlocWise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;