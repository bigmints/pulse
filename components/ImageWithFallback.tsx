import React, { useState, useMemo } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackClassName?: string;
}

const GRADIENTS = [
    'bg-gradient-to-br from-primary-400 to-primary-600',
    'bg-gradient-to-br from-violet-500 to-purple-600',
    'bg-gradient-to-br from-primary-300 to-indigo-400',
    'bg-gradient-to-br from-indigo-500 to-primary-500',
    'bg-gradient-to-br from-purple-400 to-primary-500',
    'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    'bg-gradient-to-br from-violet-600 to-indigo-600',
];

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    className,
    fallbackClassName,
    ...props
}) => {
    const [hasError, setHasError] = useState(false);

    // Select a random gradient once on mount
    const randomGradient = useMemo(() => {
        return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    }, []);

    if (hasError || !src) {
        return (
            <div
                className={`${randomGradient} ${className} ${fallbackClassName}`}
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            {...props}
        />
    );
};

export default ImageWithFallback;
