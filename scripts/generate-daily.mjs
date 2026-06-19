#!/usr/bin/env node

/**
 * Daily Pulse content generator script.
 * Fetches recent articles from RSS feeds, summarizes them using the Gemini API,
 * and saves the generated edition in the public/_data folder.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

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
  energy: [
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=1200'
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

// RSS feeds to parse
const FEEDS = [
  'https://news.ycombinator.com/rss'
];

/**
 * Basic XML helper to extract RSS items
 */
function parseRSS(xmlText) {
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map(item => {
    // Helper to extract tags and clean up CDATA
    const extract = (tag) => {
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
      description: extract('description') || 'Latest update from Hacker News.'
    };
  });
}

/**
 * Initialize Gemini API
 */
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY or API_KEY environment variable is required.');
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

/**
 * Generate daily edition articles using Gemini API
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

  // Select top 4 unique articles to process
  const uniqueArticles = [];
  const seenUrls = new Set();
  for (const art of rawArticles) {
    if (art.link && !seenUrls.has(art.link)) {
      seenUrls.add(art.link);
      uniqueArticles.push(art);
      if (uniqueArticles.length >= 4) break;
    }
  }

  if (uniqueArticles.length === 0) {
    console.error('❌ No articles found in feed.');
    process.exit(1);
  }

  console.log(`Processing ${uniqueArticles.length} articles using Gemini...`);
  const processedArticles = [];

  for (const art of uniqueArticles) {
    try {
      const prompt = `Analyze the following article info:
Title: ${art.title}
Link: ${art.link}
Description/Excerpt: ${art.description}

Provide a JSON response with:
- title: A polished, engaging, publication-grade title (sentence case, clear).
- shortDescription: A 1-sentence punchy summary.
- fullSummary: A detailed 3-paragraph summary of the article, including its context, details, and broader impact.
- category: One of these categories: Technology, Science, Space, Energy, Design, Philosophy, Education.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              shortDescription: { type: Type.STRING },
              fullSummary: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['title', 'shortDescription', 'fullSummary', 'category']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const categoryLower = (parsed.category || 'default').toLowerCase();
      const imagesList = THEME_IMAGES[categoryLower] || THEME_IMAGES.default;
      const imageUrl = imagesList[Math.floor(Math.random() * imagesList.length)];

      processedArticles.push({
        id: `art-${Math.random().toString(36).substring(2, 11)}`,
        url: art.link,
        title: parsed.title,
        shortDescription: parsed.shortDescription,
        fullSummary: parsed.fullSummary,
        imageUrl,
        date: new Date().toISOString(),
        category: parsed.category
      });

      console.log(`✓ Processed: ${parsed.title}`);
    } catch (err) {
      console.error(`Failed to process article: ${art.title}`, err);
    }
  }

  if (processedArticles.length === 0) {
    console.error('❌ Failed to process any articles.');
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const edition = {
    id: `ed-${today}`,
    date: new Date().toISOString(),
    title: 'Daily Tech & Science Curation',
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
    const files = fsReaddirSync(PUBLIC_DATA_DIR);
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

// Quick helper since we are dynamically loading fs functions or using destructured ones
import { readdirSync as fsReaddirSync } from 'fs';

generateEdition().catch(err => {
  console.error('Unexpected error running script:', err);
  process.exit(1);
});
