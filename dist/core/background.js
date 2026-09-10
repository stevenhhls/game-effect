export function validateBackgroundFile(file) {
    const supported = file.type ? ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) : /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!supported)
        throw new Error('Choose a PNG, JPG or WebP image.');
    if (file.size === 0)
        throw new Error('The selected image is empty.');
    if (file.size > 20 * 1024 * 1024)
        throw new Error('Choose an image smaller than 20 MB.');
}
export function backgroundSize(width, height, textureLimit) {
    if (![width, height, textureLimit].every(Number.isFinite) || Math.min(width, height, textureLimit) <= 0) {
        throw new Error('The image has invalid dimensions.');
    }
    const scale = Math.min(1, 1600 / width, 1000 / height, textureLimit / width, textureLimit / height);
    return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}
