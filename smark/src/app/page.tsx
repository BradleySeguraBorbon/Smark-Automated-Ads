'use client'

import { useEffect, useState } from 'react';
import { FeatureCard } from '@/components/FeatureCard';
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, MessageSquare, Users } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { decodeToken } from '@/lib/utils/decodeToken';
import { useRouter } from 'next/navigation';

export default function Home() {

  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [userInfo, setUserInfo] = useState<{ username: string; role: string; id: string } | null>(null);

  const [primaryButton, setPrimaryButton] = useState<JSX.Element | null>(null);
  const [secondaryButton, setSecondaryButton] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    const init = async () => {
      if (!token) {
        setUserInfo(null);
        return;
      }

      const user = await decodeToken(token)
      setUserInfo(user);
    }

    init();
  }, [hasHydrated, token])

  useEffect(() => {
    if (!hasHydrated) return;

    const role = userInfo?.role;

    if (role === 'admin') {
      setPrimaryButton(
        <Button asChild size="lg">
          <Link href="/marketingCampaigns/new">
            Create Campaign
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );

      setSecondaryButton(
        <Button variant="outline" size="lg" asChild>
          <Link href="/tags">See Tags</Link>
        </Button>
      );
    } else if (role === 'employee') {
      setPrimaryButton(
        <Button asChild size="lg">
          <Link href="/adMessages/new">
            Create Ad
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );

      setSecondaryButton(
        <Button variant="outline" size="lg" asChild>
          <Link href="/marketingCampaigns">See Campaigns</Link>
        </Button>
      );
    } else {
      setPrimaryButton(
        <Button asChild size="lg">
          <Link href="/clients/create">
            Register as a Client
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
      setSecondaryButton(null);
    }
  }, [userInfo, hasHydrated]);

  return (
    <div>
      <main>
        <section className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-5 mt-5">Personalized Marketing Campaigns</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Create, analyze, and distribute targeted marketing announcements to your clients via email and Telegram.
            </p>
            {hasHydrated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {primaryButton}
                {secondaryButton}
              </div>
            )}
          </div>
        </section>
        <section className="bg-muted py-16 dark:bg-[#121212]">
          <div className="container mx-auto px-0">
            <h3 className="text-2xl font-bold text-center mb-12">Our Features</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Mail className="h-10 w-10" />}
                title="Email & Telegram Integration"
                description="Send personalized announcements through multiple channels to reach your clients where they are."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10" />}
                title="Client Segmentation"
                description="AI analyzes client data to create targeted segments for more effective marketing campaigns."
              />
              <FeatureCard
                icon={<MessageSquare className="h-10 w-10" />}
                title="Announcement Editor"
                description="Intuitive editor for creating and personalizing marketing announcements with ease."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 dark:border-gray-600">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 AutoSmark. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
