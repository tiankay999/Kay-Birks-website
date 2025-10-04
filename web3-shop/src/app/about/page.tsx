import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Globe, Heart } from "lucide-react";

export const metadata = {
  title: "About Us | Kay Birks Crypto",
  description: "Learn about Kay Birks Crypto Shop - where premium footwear meets blockchain technology.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Kay Birks</h1>
          <p className="text-xl text-muted-foreground">
            Where premium footwear meets blockchain technology
          </p>
        </div>

        <div className="prose prose-lg mx-auto mb-12">
          <p className="text-muted-foreground leading-relaxed">
            Kay Birks Crypto Shop is pioneering the future of e-commerce by combining 
            the timeless quality of Birkenstock footwear with the innovation of Web3 
            technology. We believe in transparent, secure, and borderless commerce that 
            empowers customers worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
              <p className="text-muted-foreground">
                All transactions are recorded on the blockchain, ensuring complete 
                transparency and security for every purchase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fast Payments</h3>
              <p className="text-muted-foreground">
                Cryptocurrency payments are processed instantly, eliminating the 
                delays of traditional payment systems.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Globe className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Accessibility</h3>
              <p className="text-muted-foreground">
                Anyone with a crypto wallet can shop with us, regardless of their 
                location or traditional banking access.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Heart className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                We offer only authentic Birkenstock products, ensuring the same 
                quality and comfort you've come to trust.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            To revolutionise online shopping by making it more accessible, secure, 
            and efficient through blockchain technology, whilst maintaining our 
            commitment to quality products and exceptional customer service.
          </p>
          <p className="text-muted-foreground">
            We're not just selling shoes—we're building a bridge between traditional 
            e-commerce and the decentralised future.
          </p>
        </div>
      </div>
    </div>
  );
}
