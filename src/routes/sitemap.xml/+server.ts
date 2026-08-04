import { tools } from '$lib/data/tools';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const origin = url.origin;

    const pages = [
        origin,
        `${origin}/notepad`,
        `${origin}/notepad2`,
        `${origin}/login`,
        `${origin}/register`,
        `${origin}/privacy-policy`,
        `${origin}/disclaimer`,
        `${origin}/data-deletion`
    ];

    tools.forEach((tool) => {
        const path = tool.href.split('?')[0];
        pages.push(`${origin}${path}`);
    });

    // Remove duplicates just in case
    const uniquePages = [...new Set(pages)];

    const sitemap = `
<?xml version="1.0" encoding="UTF-8" ?>
<urlset
    xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="https://www.w3.org/1999/xhtml"
    xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
    xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
    xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
    ${uniquePages
        .map(
            (page) => `
    <url>
        <loc>${page}</loc>
        <changefreq>daily</changefreq>
        <priority>${page === origin ? '1.0' : '0.8'}</priority>
    </url>`
        )
        .join('')}
</urlset>`.trim();

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=0, s-maxage=3600'
        }
    });
};
