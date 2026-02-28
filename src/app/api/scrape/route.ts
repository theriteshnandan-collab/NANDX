import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    try {
        console.log(`[SCRAPE-API] 🚀 Scraping: ${url}`);
        const result = await scrapeUrl(url, { format: 'text' });

        // Return only what's needed for the preview to save bandwidth
        return NextResponse.json({
            title: result.title,
            metadata: {
                siteName: result.metadata.siteName,
                image: result.metadata.image,
                description: result.metadata.description
            }
        });
    } catch (error: unknown) {
        console.error(`[SCRAPE-API] ❌ Failed:`, (error as Error).message);
        return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 });
    }
}
