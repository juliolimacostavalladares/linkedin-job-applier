import LandingPage from '../LandingPage';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ lang: string }> | { lang: string };
}

export default async function HomePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  if (lang !== 'en' && lang !== 'pt-BR') {
    notFound();
  }

  return <LandingPage lang={lang as 'en' | 'pt-BR'} />;
}

export async function generateStaticParams() {
  return [
    { lang: 'pt-BR' },
    { lang: 'en' },
  ];
}
