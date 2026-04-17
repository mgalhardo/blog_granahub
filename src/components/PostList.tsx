"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/posts';

interface PostListProps {
  posts: Post[];
  categories: string[];
}

export function PostList({ posts, categories }: PostListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = selectedCategory
    ? posts.filter(post => post.meta.category === selectedCategory)
    : posts;

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedCategory === null
              ? 'bg-granahub-primary text-white shadow-lg shadow-granahub-primary/20 scale-105'
              : 'bg-white text-granahub-text-secondary hover:bg-gray-100'
          }`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-granahub-primary text-white shadow-lg shadow-granahub-primary/20 scale-105'
                : 'bg-white text-granahub-text-secondary hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
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
                {/* Category Badge */}
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-granahub-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {post.meta.category}
                </span>
              </div>
            ) : (
              <div className="aspect-video w-full gradient-primary relative">
                 <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-granahub-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {post.meta.category}
                </span>
              </div>
            )}
            <div className="p-6">
              <time className="text-sm font-medium text-granahub-primary-light mb-2 block">
                {new Date(post.meta.date).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC'
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

      {filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-granahub-text-secondary text-lg">Nenhum post encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
}
