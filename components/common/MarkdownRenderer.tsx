import React from 'react';

// A simple component to render basic markdown for the AI tutor response
export const MarkdownRenderer = ({ content }: { content: string }) => {
    const parseMarkdown = (text: string) => {
        // Process block-level elements first (lists)
        const lines = text.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                if (!inList) {
                    html += '<ul class="list-disc list-inside pl-4 space-y-1 my-2">';
                    inList = true;
                }
                html += `<li>${trimmedLine.substring(2)}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (trimmedLine) {
                     html += `<p class="mb-2">${line}</p>`;
                }
            }
        });

        if (inList) {
            html += '</ul>';
        }
        
        // Process inline elements
        return html
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-brand-light-purple rounded px-1.5 py-1 font-mono text-sm">$1</code>');
    };

    return <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />;
};
