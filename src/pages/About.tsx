import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Globe, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "We prioritize the security of your funds and personal information with enterprise-grade encryption and compliance standards."
    },
    {
      icon: Users,
      title: "Customer Focused",
      description: "Our platform is designed with you in mind, providing intuitive interfaces and 24/7 customer support."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Access financial services across multiple countries and currencies with competitive exchange rates."
    },
    {
      icon: Award,
      title: "Innovation",
      description: "We continuously evolve our platform with the latest fintech innovations and user feedback."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About Sheltrade
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're building the future of digital finance, providing secure, accessible, and comprehensive financial services for everyone.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              To democratize access to financial services by providing a secure, user-friendly platform that enables individuals and businesses to manage their digital assets, trade cryptocurrencies, and conduct financial transactions with confidence and ease.
            </p>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="w-8 h-8 text-text-light" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2024, Sheltrade emerged from a vision to simplify and secure digital financial transactions. Our founding team recognized the growing need for a comprehensive platform that could handle everything from basic wallet management to complex cryptocurrency trading.
              </p>
              <p>
                What started as a simple digital wallet solution has evolved into a full-featured financial platform serving thousands of users worldwide. We've continuously expanded our services based on user feedback and market demands.
              </p>
              <p>
                Today, Sheltrade stands as a trusted partner for individuals and businesses looking to navigate the digital financial landscape with confidence and security.
              </p>
            </div>
          </div>
          <div className="bg-gradient-primary rounded-2xl p-8 text-text-light">
            <h3 className="text-2xl font-bold mb-6">Platform Statistics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm opacity-90">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$2M+</div>
                <div className="text-sm opacity-90">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm opacity-90">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm opacity-90">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Leadership Team
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            Our experienced team combines expertise in finance, technology, and customer service to deliver exceptional results.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Frank Jane", role: "CEO & Founder", bio: "Former fintech executive with 15+ years experience" },
              { name: "Sarah Johnson", role: "CTO", bio: "Blockchain technology expert and security specialist" },
              { name: "Michael Chen", role: "Head of Operations", bio: "Financial services veteran focused on customer experience" }
            ].map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-24 h-24 bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-text-light">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-primary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-primary rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-text-light mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-text-light/90 mb-8 max-w-2xl mx-auto">
            Experience the future of digital finance with our secure and comprehensive platform.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}