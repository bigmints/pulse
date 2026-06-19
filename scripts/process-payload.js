import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PUBLIC_DATA_DIR = path.join(__dirname, '../public/_data');
const INDEX_FILE = path.join(PUBLIC_DATA_DIR, 'index.json');

/**
 * Main function to process the payload
 */
function processPayload() {
    // 1. Get arguments
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node process-payload.js <path-to-json-file>');
        process.exit(1);
    }

    const payloadPath = args[0];

    try {
        // 2. Read and Parse Payload
        const rawData = fs.readFileSync(payloadPath, 'utf8');
        const payload = JSON.parse(rawData);

        if (!payload || typeof payload !== 'object') {
            console.warn('Payload is empty or null. Exiting gracefully.');
            process.exit(0);
        }

        // Normalize data to array of editions
        let editions = [];

        if (payload.data) {
            // Case 1: Original edition-based payload
            let items = [];
            if (Array.isArray(payload.data)) {
                items = payload.data;
            } else if (typeof payload.data === 'object') {
                items = [payload.data];
            }

            items.forEach(item => {
                if (item.status && item.status !== 'completed') return;
                if (!item.output) return;
                editions.push(item.output);
            });
        } else if (payload.title && (payload.content || payload.description)) {
            // Case 2: Flat article-based payload from Hermes
            const todayStr = new Date().toISOString().split('T')[0];
            const editionFile = path.join(PUBLIC_DATA_DIR, `${todayStr}.json`);
            
            let existingEdition = null;
            if (fs.existsSync(editionFile)) {
                try {
                    existingEdition = JSON.parse(fs.readFileSync(editionFile, 'utf8'));
                } catch (e) {
                    console.error('Failed to parse existing edition file:', e);
                }
            }

            const category = payload.source || 'Technology';
            
            // Choose Unsplash image based on category
            const THEME_IMAGES = {
              technology: [
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
                'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200'
              ],
              science: [
                'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=1200'
              ],
              default: [
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200'
              ]
            };
            const catLower = category.toLowerCase();
            const imagesList = THEME_IMAGES[catLower] || THEME_IMAGES.default;
            const imageUrl = imagesList[Math.floor(Math.random() * imagesList.length)];

            // Extract short description from description or start of content
            let shortDescription = payload.description || '';
            if (!shortDescription && payload.content) {
                shortDescription = payload.content.substring(0, 130);
                if (payload.content.length > 130) shortDescription += '...';
            }

            const newArticle = {
                id: `art-${Math.random().toString(36).substring(2, 11)}`,
                url: payload.source_url || 'https://example.com',
                title: payload.title,
                shortDescription,
                fullSummary: payload.content || payload.description || '',
                imageUrl,
                date: new Date().toISOString(),
                category
            };

            if (existingEdition && Array.isArray(existingEdition.articles)) {
                // Remove duplicates if the article is sent again
                existingEdition.articles = existingEdition.articles.filter(a => a.url !== newArticle.url);
                existingEdition.articles = [newArticle, ...existingEdition.articles];
                editions.push(existingEdition);
            } else {
                const options = { weekday: 'long' };
                const dayName = new Intl.DateTimeFormat('en-US', options).format(new Date());
                const newEdition = {
                    id: `ed-${todayStr}`,
                    date: new Date().toISOString(),
                    title: `Daily Pulse • ${dayName} Digest`,
                    articles: [newArticle]
                };
                editions.push(newEdition);
            }
        } else {
            console.error('Invalid payload: Unsupported format.');
            console.error('Received Payload Keys:', payload ? Object.keys(payload) : 'none');
            process.exit(1);
        }

        let processedCount = 0;

        editions.forEach(edition => {
            if (!edition || !edition.date || !Array.isArray(edition.articles)) {
                return;
            }

            const dateStr = edition.date.split('T')[0]; // Extract YYYY-MM-DD
            const filename = `${dateStr}.json`;
            const filePath = path.join(PUBLIC_DATA_DIR, filename);

            // Ensure directory exists
            if (!fs.existsSync(PUBLIC_DATA_DIR)) {
                fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
            }

            fs.writeFileSync(filePath, JSON.stringify(edition, null, 2));
            console.log(`Saved edition: ${filename}`);
            processedCount++;
        });

        // 5. Update Index
        if (processedCount > 0) {
            updateIndex();
        } else {
            console.log('No new completed editions found to process.');
        }

    } catch (error) {
        console.error('Error processing payload:', error);
        process.exit(1);
    }
}

/**
 * Update the index.json file with all available dates
 */
function updateIndex() {
    try {
        // Get all json files in the data directory
        const files = fs.readdirSync(PUBLIC_DATA_DIR);

        const dates = files
            .filter(file => file.match(/^\d{4}-\d{2}-\d{2}\.json$/)) // Match YYYY-MM-DD.json
            .map(file => file.replace('.json', '')); // Extract date

        // Sort descending (newest first)
        const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a));

        // Write unique list
        const uniqueDates = [...new Set(sortedDates)];

        if (uniqueDates.length > 0) {
            fs.writeFileSync(INDEX_FILE, JSON.stringify(uniqueDates, null, 2));
            console.log(`Updated index.json with ${uniqueDates.length} editions.`);
        }
    } catch (error) {
        console.error('Error updating index:', error);
    }
}

// Run
processPayload();
