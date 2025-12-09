import React from 'react';

/**
 * Component to format AI responses with proper markdown-like formatting
 * Handles bold, italic, code blocks, lists, and line breaks
 */
const MessageFormatter = ({ content }) => {
  if (!content) return null;

  const formatText = (text) => {
    const parts = [];
    let currentIndex = 0;
    const patterns = [
      // Code blocks ```code```
      { regex: /```([\s\S]*?)```/g, type: 'codeBlock' },
      // Inline code `code`
      { regex: /`([^`]+)`/g, type: 'inlineCode' },
      // Bold **text**
      { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
      // Italic *text*
      { regex: /\*([^*]+)\*/g, type: 'italic' },
      // Numbered lists
      { regex: /^\d+\.\s+(.+)$/gm, type: 'numberedList' },
      // Bullet lists
      { regex: /^[•\-\*]\s+(.+)$/gm, type: 'bulletList' },
    ];

    // Split text by newlines to preserve line breaks
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <br key={`br-${lineIndex}`} />;
      }

      // Check for code blocks
      if (line.startsWith('```') && line.endsWith('```')) {
        const code = line.slice(3, -3).trim();
        return (
          <div key={`code-${lineIndex}`} className="my-2 bg-gray-900 rounded-lg p-3 overflow-x-auto">
            <code className="text-sm text-green-400 font-mono">{code}</code>
          </div>
        );
      }

      // Check for numbered list
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        return (
          <div key={`num-${lineIndex}`} className="flex gap-2 my-1">
            <span className="font-bold text-purple-400">{numberedMatch[1]}.</span>
            <span>{formatInlineStyles(numberedMatch[2])}</span>
          </div>
        );
      }

      // Check for bullet list
      const bulletMatch = line.match(/^[•\-\*]\s+(.+)$/);
      if (bulletMatch) {
        return (
          <div key={`bullet-${lineIndex}`} className="flex gap-2 my-1">
            <span className="text-purple-400">•</span>
            <span>{formatInlineStyles(bulletMatch[1])}</span>
          </div>
        );
      }

      // Check for headings
      if (line.startsWith('# ')) {
        return (
          <h3 key={`h3-${lineIndex}`} className="text-lg font-bold mt-3 mb-2 text-purple-300">
            {line.slice(2)}
          </h3>
        );
      }

      // Regular line with inline formatting
      return (
        <div key={`line-${lineIndex}`} className="my-1">
          {formatInlineStyles(line)}
        </div>
      );
    });
  };

  const formatInlineStyles = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Check for inline code `code`
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch && codeMatch.index === 0) {
        parts.push(
          <code key={`code-${key++}`} className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-sm font-mono">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Check for bold **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch.index === 0) {
        parts.push(
          <strong key={`bold-${key++}`} className="font-bold text-white">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Check for italic *text*
      const italicMatch = remaining.match(/\*([^*]+)\*/);
      if (italicMatch && italicMatch.index === 0) {
        parts.push(
          <em key={`italic-${key++}`} className="italic text-gray-200">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Find the next special character
      const nextSpecial = Math.min(
        ...[
          remaining.indexOf('`'),
          remaining.indexOf('**'),
          remaining.indexOf('*')
        ].filter(i => i !== -1).concat(remaining.length)
      );

      if (nextSpecial > 0) {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      } else {
        parts.push(remaining);
        break;
      }
    }

    return parts;
  };

  return (
    <div className="formatted-message">
      {formatText(content)}
    </div>
  );
};

export default MessageFormatter;
