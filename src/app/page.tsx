import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-granahub-text mb-4">
          Blog <span className="text-granahub-primary">GranaHub</span>
        </h1>
        <p className="text-xl text-granahub-text-secondary max-w-2xl mx-auto">
          Dicas práticas, estratégias e guias para você ter o controle do seu dinheiro sem complicação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.meta.slug}
            href={`/posts/${post.meta.slug}`}
            className="group block bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
          >
            {post.meta.coverImage ? (
              <div className="aspect-video w-full overflow-hidden relative">
                <img
                  src={post.meta.coverImage}
                  alt={post.meta.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-gradient-primary" />
            )}
            <div className="p-6">
              <time className="text-sm font-medium text-granahub-primary-light mb-2 block">
                {new Date(post.meta.date).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </time>
              <h2 className="text-xl font-bold text-granahub-text mb-3 line-clamp-2 group-hover:text-granahub-primary transition-colors">
                {post.meta.title}
              </h2>
              <p className="text-granahub-text-secondary line-clamp-3">
                {post.meta.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
