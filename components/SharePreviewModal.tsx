import React, { useState, useEffect } from 'react';
import { DailyEdition } from '../types';
import { generateShareImage } from '../services/shareService';
import { X, Share2, Download, Loader2 } from 'lucide-react';

interface SharePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    edition: DailyEdition;
}

const SharePreviewModal: React.FC<SharePreviewModalProps> = ({ isOpen, onClose, edition }) => {
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [shareText, setShareText] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadImage();
            // Friendly default message as requested
            const dateStr = new Date(edition.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            setShareText(`Look what I found on Pulse by Pretheesh - checking out the ${dateStr} edition.`);
        } else {
            // Cleanup
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setImageBlob(null);
            }
        }
    }, [isOpen, edition]);

    const loadImage = async () => {
        setIsLoading(true);
        try {
            const blob = await generateShareImage(edition);
            if (blob) {
                setImageBlob(blob);
                setPreviewUrl(URL.createObjectURL(blob));
            }
        } catch (error) {
            console.error('Failed to generate preview', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        if (!imageBlob) return;

        try {
            setIsSharing(true);
            const file = new File([imageBlob], `pulse-edition-${edition.id}.png`, { type: 'image/png' });
            const title = edition.cover?.title || edition.title || 'Pulse Intelligence';
            const url = 'https://pulse.saveaday.ai';

            // Use the edited text
            const text = shareText;

            if (navigator.share) {
                try {
                    await navigator.share({
                        files: [file],
                        title,
                        text,
                        url
                    });
                    onClose();
                } catch (shareError) {
                    console.log('Share canceled or failed', shareError);
                }
            } else {
                // Fallback to download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(imageBlob);
                link.download = `pulse-edition-${edition.id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                onClose();
            }
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white">Share Story</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#18181b]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[300px] gap-3">
                            <Loader2 size={32} className="text-primary-500 animate-spin" />
                            <p className="text-sm text-zinc-400 font-medium">Generating preview...</p>
                        </div>
                    ) : previewUrl ? (
                        <>
                            {/* Image Preview */}
                            <div className="rounded-xl overflow-hidden shadow-lg border border-white/5 bg-zinc-900 border border-zinc-800">
                                <img
                                    src={previewUrl}
                                    alt="Share Preview"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Editable Text Area */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    value={shareText}
                                    onChange={(e) => setShareText(e.target.value)}
                                    className="w-full bg-zinc-800 border border-white/5 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none font-sans"
                                    rows={3}
                                    placeholder="Add a note..."
                                />
                            </div>
                        </>
                    ) : (
                        <p className="text-zinc-400 text-center">Failed to load preview</p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-zinc-900">
                    <button
                        onClick={handleShare}
                        disabled={isLoading || isSharing || !imageBlob}
                        className="w-full py-4 bg-white text-black rounded-2xl font-bold text-base hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSharing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Sharing...
                            </>
                        ) : (
                            <>
                                {navigator.share ? <Share2 size={20} /> : <Download size={20} />}
                                {navigator.share ? 'Share Story' : 'Download Image'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharePreviewModal;
