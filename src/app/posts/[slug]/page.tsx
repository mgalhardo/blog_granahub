import { getPostBySlug, getPostSlugs, getAllPosts } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import ShareArticle from '@/components/ShareArticle';

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
  const allPosts = getAllPosts();
  
  const relatedPosts = allPosts
    .filter(p => p.meta.category === post.meta.category && p.meta.slug !== post.meta.slug)
    .slice(0, 3);

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
        <div className="flex flex-wrap items-center gap-4 text-granahub-text-secondary">
          <span className="bg-granahub-primary/10 text-granahub-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {post.meta.category}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <time dateTime={post.meta.date} className="font-medium">
            {new Date(post.meta.date).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </time>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-sm">Da Redação</span>
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

      <div className="mt-16 pt-8 border-t border-gray-100 mb-16">
        <div className="bg-gradient-hero rounded-3xl p-8 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-granahub-text mb-2">
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
        
        <ShareArticle title={post.meta.title} />
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div className="mt-20 border-t border-gray-100 pt-16 pb-12">
          <h3 className="text-2xl font-bold text-granahub-text mb-8">
            Você também pode gostar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.meta.slug}
                href={`/posts/${relatedPost.meta.slug}`}
                className="group block"
              >
                <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 shadow-sm border border-gray-100">
                  <img
                    src={relatedPost.meta.coverImage}
                    alt={relatedPost.meta.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="text-xs font-bold text-granahub-primary uppercase tracking-wider mb-2 block">
                  {relatedPost.meta.category}
                </span>
                <h4 className="font-bold text-granahub-text line-clamp-2 leading-snug group-hover:text-granahub-primary transition-colors">
                  {relatedPost.meta.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
