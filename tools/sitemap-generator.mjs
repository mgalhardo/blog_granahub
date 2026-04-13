import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BASE_URL = 'https://blog.granahub.com.br';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

function generateSitemap() {
  console.log('🚀 Gerando sitemap.xml físico...');
  
  const posts = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(POSTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(content);
      const slug = file.replace('.md', '');
      return {
        slug: slug,
        date: data.date || new Date().toISOString()
      };
    });

  const urls = [
    { loc: BASE_URL, priority: '1.0', changefreq: 'daily' },
    ...posts.map(post => ({
      loc: `${BASE_URL}/posts/${post.slug}/`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: post.date
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
  console.log(`✅ Sitemap gerado com ${urls.length} URLs em public/sitemap.xml`);
}

generateSitemap();
