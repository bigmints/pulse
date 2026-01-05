import { DailyEdition } from '../types';

/**
 * Data service to load daily editions from JSON files in the _data folder
 */

// List of available dates (in production, this could be generated or fetched from an index)
// List of available dates (Fallback)
const FALLBACK_DATES = [
    '2025-12-27',
    '2025-12-25',
    '2024-12-25',
    '2024-12-24',
    '2024-12-23',
    '2024-12-22',
    '2024-12-21',
    '2024-12-20',
    '2024-12-19',
    '2024-12-18'
];

/**
 * Load a specific edition by date
 */
export async function loadEdition(date: string): Promise<DailyEdition | null> {
    try {
        // Use BASE_URL to ensure correct path on GitHub Pages
        const baseUrl = (import.meta as any).env?.BASE_URL || '/';
        const url = `${baseUrl}_data/${date}.json`;
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to load edition for ${date}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading edition for ${date}:`, error);
        return null;
    }
}

/**
 * Load all available editions
 */
export async function loadAllEditions(): Promise<DailyEdition[]> {
    let dates = FALLBACK_DATES;

    try {
        const baseUrl = (import.meta as any).env?.BASE_URL || '/';
        const response = await fetch(`${baseUrl}_data/index.json?v=${Date.now()}`); // cache buster
        if (response.ok) {
            dates = await response.json();
        }
    } catch (error) {
        console.error('Failed to load edition index, using fallback', error);
    }

    const editions = await Promise.all(
        dates.map(date => loadEdition(date))
    );

    // Filter out any failed loads and sort by date (newest first)
    return editions
        .filter((edition): edition is DailyEdition => edition !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get list of available dates (Returns fallback, mainly for dev reference now)
 */
export function getAvailableDates(): string[] {
    return [...FALLBACK_DATES];
}
