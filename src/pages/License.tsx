import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";

export default function License() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Legal Information
          </h1>
          <p className="text-xl text-muted-foreground">
            Our privacy policy and terms of service
          </p>
        </div>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <p className="text-sm text-muted-foreground">Last updated: January 1, 2024</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
                  <p className="text-muted-foreground mb-4">
                    We collect information you provide directly to us, such as when you create an account, make a transaction, or contact us for support.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Personal information (name, email, phone number)</li>
                    <li>Financial information (bank account details, transaction history)</li>
                    <li>Device and usage information</li>
                    <li>Location data (when permitted)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Process transactions and provide our services</li>
                    <li>Verify your identity and prevent fraud</li>
                    <li>Communicate with you about your account</li>
                    <li>Improve our platform and user experience</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Information Security</h3>
                  <p className="text-muted-foreground">
                    We implement industry-standard security measures to protect your personal and financial information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                    <li>256-bit SSL encryption for all data transmission</li>
                    <li>Multi-factor authentication options</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Segregated fund storage</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Data Sharing</h3>
                  <p className="text-muted-foreground">
                    We do not sell your personal information. We may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                    <li>With your explicit consent</li>
                    <li>To comply with legal requirements</li>
                    <li>With trusted service providers who assist in platform operations</li>
                    <li>In case of business transfer or merger</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
                  <p className="text-muted-foreground mb-3">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Access and review your personal information</li>
                    <li>Request corrections to inaccurate information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Data portability where applicable</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                  <p className="text-muted-foreground">
                    For privacy-related questions or concerns, contact us at:
                    <br />
                    Email: privacy@sheltrade.com
                    <br />
                    Address: 123 Financial Street, Tech City, TC 12345
                  </p>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
                <p className="text-sm text-muted-foreground">Last updated: January 1, 2024</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">Acceptance of Terms</h3>
                  <p className="text-muted-foreground">
                    By accessing and using Sheltrade, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">User Accounts</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>You must be at least 18 years old to create an account</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>One account per person is permitted</li>
                    <li>You must provide accurate and complete information</li>
                    <li>We reserve the right to suspend accounts for violations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Financial Services</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>All transactions are subject to verification and approval</li>
                    <li>We reserve the right to refuse or reverse transactions</li>
                    <li>Exchange rates may fluctuate and are updated regularly</li>
                    <li>Transaction fees apply as outlined in our fee schedule</li>
                    <li>Funds are held in segregated accounts for user protection</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Prohibited Activities</h3>
                  <p className="text-muted-foreground mb-3">
                    Users are prohibited from:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Using the platform for illegal activities</li>
                    <li>Money laundering or terrorist financing</li>
                    <li>Providing false or misleading information</li>
                    <li>Attempting to breach platform security</li>
                    <li>Creating multiple accounts</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Risk Disclosure</h3>
                  <p className="text-muted-foreground">
                    Trading cryptocurrencies and other financial instruments involves significant risk of loss. Past performance does not guarantee future results. You should only trade with funds you can afford to lose.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Limitation of Liability</h3>
                  <p className="text-muted-foreground">
                    Sheltrade shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform, including but not limited to loss of profits, data, or goodwill.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Termination</h3>
                  <p className="text-muted-foreground">
                    We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Changes to Terms</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use constitutes acceptance of modified terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <p className="text-muted-foreground">
                    For questions about these Terms of Service, contact us at:
                    <br />
                    Email: legal@sheltrade.com
                    <br />
                    Address: 123 Financial Street, Tech City, TC 12345
                  </p>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}