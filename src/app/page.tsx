import { getAllPosts, getAllCategories } from '@/lib/posts';
import { PostList } from '@/components/PostList';

export default function Home() {
  const posts = getAllPosts();
  const categories = getAllCategories();

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

      <PostList posts={posts} categories={categories} />
    </div>
  );
}
