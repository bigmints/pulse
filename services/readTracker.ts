/**
 * Utility functions for tracking read/unread articles using localStorage
 */

const READ_EDITIONS_KEY = 'pulseReadEditions';

/**
 * Get all read edition IDs from localStorage
 */
export function getReadEditions(): Set<string> {
    try {
        const stored = localStorage.getItem(READ_EDITIONS_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
        console.error('Error reading read editions from localStorage:', error);
        return new Set();
    }
}

/**
 * Mark an edition as read
 */
export function markEditionAsRead(editionId: string): void {
    try {
        const readEditions = getReadEditions();
        if (!readEditions.has(editionId)) {
            readEditions.add(editionId);
            localStorage.setItem(READ_EDITIONS_KEY, JSON.stringify([...readEditions]));
        }
    } catch (error) {
        console.error('Error marking edition as read:', error);
    }
}

/**
 * Check if an edition has been read
 */
export function isEditionRead(editionId: string): boolean {
    return getReadEditions().has(editionId);
}

/**
 * Get count of unread editions
 */
export function getUnreadCount(editionIds: string[]): number {
    const readEditions = getReadEditions();
    return editionIds.filter(id => !readEditions.has(id)).length;
}

/**
 * Clear all read history
 */
export function clearReadHistory(): void {
    try {
        localStorage.removeItem(READ_EDITIONS_KEY);
    } catch (error) {
        console.error('Error clearing read history:', error);
    }
}
