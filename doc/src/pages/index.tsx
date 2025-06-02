import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>
                <p className="hero__subtitle">
                    Official documentation for AutoSmark: manage clients, marketing campaigns, and automated messages.
                </p>
                <div className={styles.buttons}>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/intro">
                        Get Started 🚀
                    </Link>
                </div>
            </div>
        </header>
    );
}

function FeatureCard({ title, description, link }: { title: string; description: string; link: string }) {
    return (
        <div className="col col--4">
            <div className="card margin--sm padding--md shadow--md">
                <div className="card__header">
                    <Heading as="h3">{title}</Heading>
                </div>
                <div className="card__body">
                    <p>{description}</p>
                </div>
                <div className="card__footer">
                    <Link className="button button--outline button--primary" to={link}>
                        View Section →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function HomepageFeatures(): ReactNode {
    return (
        <section className="features">
            <div className="container">
                <div className="row">
                    <FeatureCard
                        title="Client Management"
                        description="Learn how to register, import, and categorize clients with custom tags."
                        link="/docs/clients/register"
                    />
                    <FeatureCard
                        title="Marketing Campaigns"
                        description="Create targeted campaigns, segment audiences, and analyze results."
                        link="/docs/marketingCampaigns/create"
                    />
                    <FeatureCard
                        title="Ad Messages"
                        description="Send messages via Email or Telegram using dynamic templates and automated scheduling."
                        link="/docs/adMessages/send"
                    />
                </div>
            </div>
        </section>
    );
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Welcome to ${siteConfig.title}`}
            description="AutoSmark help portal and documentation site">
            <HomepageHeader />
            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    );
}