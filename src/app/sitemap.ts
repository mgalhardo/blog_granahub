import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://blog.granahub.com.br';
  const posts = getAllPosts();

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.meta.slug}`,
    lastModified: new Date(post.meta.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...postUrls,
  ];
}
