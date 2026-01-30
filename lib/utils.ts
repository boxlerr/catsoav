export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ")
}
