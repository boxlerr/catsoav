// Dynamic theme system for personalized project pages

export interface ProjectTheme {
    id: string
    name: string
    colors: {
        primary: string
        secondary: string
        accent: string
        background: string
        surface: string
        text: string
        textSecondary: string
    }
    gradients: {
        hero: string
        card: string
        glow: string
    }
    effects: {
        glassBlur: string
        shadowIntensity: 'light' | 'medium' | 'heavy'
        animationSpeed: 'slow' | 'normal' | 'fast'
    }
    layout: {
        type: 'video-hero' | 'gallery-masonry' | 'gallery-grid' | 'mixed-content' | 'photo-showcase'
        galleryColumns: number
    }
}

// Generate theme based on project characteristics
export function getProjectTheme(project: {
    id: string
    title: string
    category: string
    videoUrl?: string | null
    images?: string | null
}): ProjectTheme {
    const hasVideo = project.videoUrl && !project.videoUrl.includes('behance.net/gallery')
    const parsedImages = project.images ? JSON.parse(project.images) : []
    const imageCount = parsedImages.length

    // Determine layout type
    let layoutType: ProjectTheme['layout']['type'] = 'video-hero'
    if (!hasVideo && imageCount > 0) {
        layoutType = imageCount > 15 ? 'gallery-masonry' : imageCount > 4 ? 'gallery-grid' : 'photo-showcase'
    } else if (hasVideo && imageCount > 0) {
        layoutType = 'mixed-content'
    }

    // Create unique color scheme based on project ID (consistent but varied)
    const hash = project.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hueBase = hash % 360

    // Category-based color tendencies
    const category = project.category.toLowerCase()

    // Force Red (0) for ALL categories as per user request
    const categoryHue = 0 // Enforce Red globally

    // For Red theme (0), we want to stay within Red/Orange. 
    // If it's Red, minimize variance.
    const hueVariance = 15

    const hue1 = (categoryHue + (hash % hueVariance)) % 360

    // Analogous colors: 
    // Red (0) -> Orange (30) -> Gold (60)
    // Avoid Green (120) or Blue (240) for Red base
    const hue2 = (hue1 + 20) % 360
    const hue3 = (hue1 + 40) % 360

    // Vibrant, premium color palettes
    const themes: Record<string, Omit<ProjectTheme, 'id' | 'name' | 'layout'>> = {
        default: {
            colors: {
                // Use ~53% Lightness for primary to be bright but red, not orange.
                primary: `hsl(${hue1}, 100%, 53%)`,
                secondary: `hsl(${hue2}, 100%, 50%)`,
                accent: `hsl(${hue3}, 100%, 60%)`,
                background: 'hsl(0, 0%, 4%)',
                surface: 'hsl(0, 0%, 8%)',
                text: 'hsl(0, 0%, 100%)',
                textSecondary: 'hsl(0, 0%, 70%)',
            },
            gradients: {
                hero: `linear-gradient(135deg, hsl(${hue1}, 100%, 53%) 0%, hsl(${hue2}, 100%, 50%) 100%)`,
                card: `linear-gradient(135deg, hsl(${hue1}, 100%, 53%, 0.1) 0%, hsl(${hue2}, 100%, 50%, 0.1) 100%)`,
                glow: `radial-gradient(circle at 50% 0%, hsl(${hue1}, 100%, 53%, 0.15) 0%, transparent 50%)`,
            },
            effects: {
                glassBlur: '12px',
                shadowIntensity: 'medium' as const,
                animationSpeed: 'normal' as const,
            },
        },
    }

    // Special themes for specific content types
    if (layoutType === 'gallery-masonry') {
        return {
            id: project.id,
            name: project.title,
            ...themes.default,
            effects: {
                ...themes.default.effects,
                shadowIntensity: 'light' as const,
                animationSpeed: 'fast' as const,
            },
            layout: {
                type: layoutType,
                galleryColumns: 3,
            },
        }
    }

    if (layoutType === 'photo-showcase') {
        return {
            id: project.id,
            name: project.title,
            colors: {
                ...themes.default.colors,
                primary: `hsl(${hue1}, 100%, 53%)`,
                secondary: `hsl(${hue2}, 100%, 50%)`,
            },
            gradients: {
                hero: `linear-gradient(135deg, hsl(${hue1}, 100%, 53%) 0%, hsl(${hue2}, 100%, 50%) 100%)`,
                card: themes.default.gradients.card,
                glow: `radial-gradient(ellipse at top, hsl(${hue1}, 100%, 53%, 0.2) 0%, transparent 60%)`,
            },
            effects: {
                glassBlur: '16px',
                shadowIntensity: 'heavy' as const,
                animationSpeed: 'slow' as const,
            },
            layout: {
                type: layoutType,
                galleryColumns: imageCount === 1 ? 1 : 2,
            },
        }
    }

    if (layoutType === 'video-hero') {
        return {
            id: project.id,
            name: project.title,
            colors: {
                ...themes.default.colors,
                primary: `hsl(${hue1}, 100%, 53%)`,
            },
            gradients: {
                // Use opaque linear gradient for text visibility
                hero: `linear-gradient(135deg, hsl(${hue1}, 100%, 53%) 0%, hsl(${hue2}, 100%, 50%) 100%)`,
                card: themes.default.gradients.card,
                glow: `radial-gradient(circle at 50% 0%, hsl(${hue1}, 100%, 53%, 0.2) 0%, transparent 50%)`,
            },
            effects: {
                glassBlur: '20px',
                shadowIntensity: 'heavy' as const,
                animationSpeed: 'normal' as const,
            },
            layout: {
                type: layoutType,
                galleryColumns: 1,
            },
        }
    }

    // Default/mixed content theme
    return {
        id: project.id,
        name: project.title,
        ...themes.default,
        layout: {
            type: layoutType,
            galleryColumns: 3,
        },
    }
}

// Generate CSS variables from theme
export function generateThemeCSS(theme: ProjectTheme): string {
    return `
    --theme-primary: ${theme.colors.primary};
    --theme-secondary: ${theme.colors.secondary};
    --theme-accent: ${theme.colors.accent};
    --theme-background: ${theme.colors.background};
    --theme-surface: ${theme.colors.surface};
    --theme-text: ${theme.colors.text};
    --theme-text-secondary: ${theme.colors.textSecondary};
    --theme-gradient-hero: ${theme.gradients.hero};
    --theme-gradient-card: ${theme.gradients.card};
    --theme-gradient-glow: ${theme.gradients.glow};
    --theme-glass-blur: ${theme.effects.glassBlur};
  `.trim()
}
