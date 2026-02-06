export interface Project {
    id: string;
    title: string;
    description: string | null;
    category: string;
    imageUrl: string | null;
    videoUrl: string | null;
    extraVideos: string | null;
    clientName: string | null;
    published: boolean;
    order: number;
}

export interface Category {
    id: string;
    name: string;
    title: string;
    description: string | null;
    order: number;
}
