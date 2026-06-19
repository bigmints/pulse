#!/usr/bin/env node

/**
 * Daily Pulse content generator script (No-API version).
 * Fetches recent articles from RSS feeds, parses them directly,
 * and saves the generated edition in the public/_data folder without external API calls.
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DATA_DIR = join(__dirname, '..', 'public', '_data');
const INDEX_FILE = join(PUBLIC_DATA_DIR, 'index.json');

// Curated Unsplash images by category to keep the design premium and fast-loading
const THEME_IMAGES = {
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200'
  ],
  science: [
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200'
  ],
  space: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=1200'
  ],
  design: [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&q=80&w=1200'
  ],
  default: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=1200'
  ]
};

// RSS feeds to parse. We use reliable feeds that contain good content descriptions.
const FEEDS = [
  'https://techcrunch.com/feed/',
  'https://news.ycombinator.com/rss'
];

/**
 * Clean HTML tags and decode basic HTML entities
 */
function cleanHTML(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // remove tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Basic XML helper to extract RSS items
 */
function parseRSS(xmlText) {
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map(item => {
    const extract = (tag) => {
      // Handle tag with namespace like content:encoded
      const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`);
      const match = item.match(regex);
      if (!match) return '';
      return match[1]
        .replace(/<!\[CDATA\[/g, '')
        .replace(/]]>/g, '')
        .trim();
    };

    return {
      title: extract('title'),
      link: extract('link'),
      description: extract('content:encoded') || extract('description') || 'Latest update.'
    };
  });
}

/**
 * Determine category and image based on keywords in title/description
 */
function categorize(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('space') || text.includes('nasa') || text.includes('moon') || text.includes('mars') || text.includes('orbit')) {
    return { category: 'Space', imageKey: 'space' };
  }
  if (text.includes('design') || text.includes('ui') || text.includes('art') || text.includes('ux') || text.includes('creative')) {
    return { category: 'Design', imageKey: 'design' };
  }
  if (text.includes('science') || text.includes('bio') || text.includes('physics') || text.includes('health') || text.includes('medical') || text.includes('climate')) {
    return { category: 'Science', imageKey: 'science' };
  }
  // Default to Technology
  return { category: 'Technology', imageKey: 'technology' };
}

/**
 * Generate daily edition articles
 */
async function generateEdition() {
  console.log('Fetching latest RSS feed articles...');
  let rawArticles = [];

  for (const feed of FEEDS) {
    try {
      const response = await fetch(feed);
      if (!response.ok) continue;
      const text = await response.text();
      rawArticles = [...rawArticles, ...parseRSS(text)];
    } catch (err) {
      console.error(`Failed to fetch feed ${feed}:`, err);
    }
  }

  // Filter unique valid articles
  const uniqueArticles = [];
  const seenUrls = new Set();
  for (const art of rawArticles) {
    const cleanedTitle = cleanHTML(art.title);
    if (art.link && cleanedTitle && !seenUrls.has(art.link)) {
      seenUrls.add(art.link);
      uniqueArticles.push(art);
      if (uniqueArticles.length >= 4) break;
    }
  }

  if (uniqueArticles.length === 0) {
    console.log('⚠️ No articles found in feed. Generating mock local fallback article...');
    uniqueArticles.push({
      title: 'Vite and PWA Development Reaches Critical Adoption',
      link: 'https://vite.dev',
      description: 'Modern front-end toolchains like Vite are replacing traditional bundlers completely, enabling seamless local PWA development.'
    });
  }

  console.log(`Processing ${uniqueArticles.length} articles...`);
  const processedArticles = [];

  for (const art of uniqueArticles) {
    const cleanedTitle = cleanHTML(art.title);
    const cleanedDesc = cleanHTML(art.description);
    
    // Create short description (first 130 characters)
    let shortDescription = cleanedDesc.substring(0, 130);
    if (cleanedDesc.length > 130) shortDescription += '...';
    
    // Create full summary (use cleanedDesc as first paragraph, and add two general context paragraphs)
    const { category, imageKey } = categorize(cleanedTitle, cleanedDesc);
    const imagesList = THEME_IMAGES[imageKey] || THEME_IMAGES.default;
    const imageUrl = imagesList[Math.floor(Math.random() * imagesList.length)];

    const paragraphs = [
      cleanedDesc,
      `This development marks a significant point in the ${category.toLowerCase()} sector. Industry analysts indicate that the trend will continue to gain momentum, potentially reshaping how developers and businesses approach similar challenges in the near future.`,
      `For further details, you can explore the full report and follow ongoing updates directly on the primary publisher's portal.`
    ];

    processedArticles.push({
      id: `art-${Math.random().toString(36).substring(2, 11)}`,
      url: art.link,
      title: cleanedTitle,
      shortDescription,
      fullSummary: paragraphs.join('\n\n'),
      imageUrl,
      date: new Date().toISOString(),
      category
    });

    console.log(`✓ Processed: ${cleanedTitle}`);
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Format day of week for title
  const options = { weekday: 'long' };
  const dayName = new Intl.DateTimeFormat('en-US', options).format(new Date());

  const edition = {
    id: `ed-${today}`,
    date: new Date().toISOString(),
    title: `Daily Pulse • ${dayName} Digest`,
    articles: processedArticles
  };

  // Ensure output dir exists
  if (!existsSync(PUBLIC_DATA_DIR)) {
    mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  }

  // Write new edition file
  const editionFile = join(PUBLIC_DATA_DIR, `${today}.json`);
  writeFileSync(editionFile, JSON.stringify(edition, null, 2), 'utf8');
  console.log(`\n✓ Created edition file: ${today}.json`);

  // Update index.json
  updateIndex();
}

/**
 * Update index.json listing all editions
 */
function updateIndex() {
  try {
    const files = readdirSync(PUBLIC_DATA_DIR);
    const dates = files
      .filter(file => file.match(/^\d{4}-\d{2}-\d{2}\.json$/))
      .map(file => file.replace('.json', ''))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const uniqueDates = [...new Set(dates)];
    writeFileSync(INDEX_FILE, JSON.stringify(uniqueDates, null, 2), 'utf8');
    console.log(`✓ Updated index.json with ${uniqueDates.length} editions.`);
  } catch (err) {
    console.error('Failed to update index.json:', err);
  }
}

generateEdition().catch(err => {
  console.error('Unexpected error running script:', err);
  process.exit(1);
});
