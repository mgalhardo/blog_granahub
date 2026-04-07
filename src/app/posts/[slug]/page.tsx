import { getPostBySlug, getPostSlugs } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.md$/, ''),
  }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);
  return {
    title: `${post.meta.title} | GranaHub Blog`,
    description: post.meta.description,
    openGraph: {
      images: [post.meta.coverImage || ''],
    },
  };
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        href="/"
        className="inline-flex items-center text-granahub-text-secondary hover:text-granahub-primary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para o Blog
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-granahub-text leading-tight mb-4 text-balance">
          {post.meta.title}
        </h1>
        <div className="flex items-center gap-4 text-granahub-text-secondary">
          <time dateTime={post.meta.date} className="font-medium">
            {new Date(post.meta.date).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </time>
          <span className="w-1.5 h-1.5 rounded-full bg-granahub-primary/30" />
          <span>GranaHub IA</span>
        </div>
      </header>

      {post.meta.coverImage && (
        <div className="aspect-[2/1] w-full mb-12 rounded-3xl overflow-hidden shadow-lg">
          <img
            src={post.meta.coverImage}
            alt={post.meta.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-lg prose-granahub max-w-none prose-headings:text-granahub-text prose-a:text-granahub-primary hover:prose-a:text-granahub-primary-light prose-img:rounded-2xl">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-100 pb-16">
        <div className="bg-gradient-hero rounded-3xl p-8 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-granahub-text mb-4">
            Gostou do artigo?
          </h3>
          <p className="text-granahub-text-secondary mb-6 max-w-xl mx-auto">
            Experimente o GranaHub e assuma o controle da sua vida financeira diretamente pelo WhatsApp. Zero complicação.
          </p>
          <a
            href="https://app.granahub.com.br/auth?mode=register&planType=month"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-granahub-primary hover:bg-granahub-primary-light text-white font-semibold py-3 px-8 rounded-lg shadow-cta transition-all hover:scale-105"
          >
            Conhecer o GranaHub
          </a>
        </div>
      </div>
    </article>
  );
}
