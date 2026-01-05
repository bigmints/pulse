import { DailyEdition } from '../types';

/**
 * Generates a shareable image for a daily edition using HTML Canvas
 */
export async function generateShareImage(edition: DailyEdition): Promise<Blob | null> {
    const canvas = document.createElement('canvas');
    // User requested 3:4 aspect ratio
    const width = 1200;
    const height = 1600;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Background (Dark)
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    // 2. Cover Image (Full bleed)
    const imageUrl = edition.cover?.imageUrl || edition.articles[0]?.imageUrl;
    if (imageUrl) {
        try {
            const img = await loadImage(imageUrl);

            // Cover fit logic
            const scale = Math.max(width / img.width, height / img.height);
            const x = (width / 2) - (img.width / 2) * scale;
            const y = (height / 2) - (img.height / 2) * scale;

            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        } catch (err) {
            console.error('Failed to load cover image', err);
        }
    }

    // 3. Gradient Overlays
    ctx.globalCompositeOperation = 'source-over';

    // Overall darken
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, width, height);

    // Bottom gradient for text
    const gradient = ctx.createLinearGradient(0, height, 0, height * 0.4);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 4. Typography
    const padding = 80; // Slightly reduced padding for 3:4
    const bottomMargin = 160;

    // --- MAIN TEXT (SUMMARY) ---
    const fontSize = 72; // Slightly smaller font for 3:4 balance
    const lineHeight = fontSize * 1.15;

    ctx.font = `800 ${fontSize}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const mainText = edition.cover?.summary || edition.summary || 'Daily Intelligence';
    let lines = getWrappedLines(ctx, mainText, width - (padding * 2));

    // LIMIT LINES to prevent text going off screen
    const maxLines = 6;
    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        // Add ellipsis to last line
        const lastLine = lines[maxLines - 1];
        if (!lastLine.endsWith('...')) {
            lines[maxLines - 1] = lastLine.slice(0, -3) + '...';
        }
    }

    const textHeight = lines.length * lineHeight;

    // Calculate Y clearly (Bottom Up)
    const textStartY = height - bottomMargin - textHeight + fontSize;

    lines.forEach((line, i) => {
        ctx.fillText(line, padding, textStartY + (i * lineHeight));
    });

    // --- EYEBROW (DATE + TITLE) ---
    const eyebrowValues = [
        new Date(edition.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    ];
    const eyebrowText = eyebrowValues.join(' • ').toUpperCase();

    ctx.font = `700 28px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    // Draw above main text (approx 70px gap)
    ctx.fillText(eyebrowText, padding, textStartY - 70);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
