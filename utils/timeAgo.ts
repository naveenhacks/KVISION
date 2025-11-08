
export const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
        return `${seconds} seconds ago`;
    }

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minutes ago`;
    }

    const hours = Math.round(minutes / 60);
    if (hours < 24) {
        return `${hours} hours ago`;
    }

    const days = Math.round(hours / 24);
    if (days < 30) {
        return `${days} days ago`;
    }
    
    const months = Math.round(days / 30);
    if (months < 12) {
        return `${months} months ago`;
    }
    
    const years = Math.round(months / 12);
    return `${years} years ago`;
};
