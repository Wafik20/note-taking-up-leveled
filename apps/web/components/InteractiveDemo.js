import { useState, useEffect } from 'react';

export default function InteractiveDemo() {
  const [markdown, setMarkdown] = useState(`# Welcome to Note Taking Upleveled!

This is a **live demo** of our markdown editor. Try editing the text on the left and see the preview update in real-time!

## Features You Can Try:

### Text Formatting
- **Bold text** and *italic text*
- ~~Strikethrough~~ and \`inline code\`
- [Links](https://example.com)

### Lists
1. Numbered lists
2. Like this one
   - With nested items
   - And more levels

### Code Blocks
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Math Formulas
Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Tables
| Feature | Description |
|---------|-------------|
| Markdown | Full markdown support |
| Math | LaTeX math rendering |
| Groups | Organize your notes |

Try editing this content to see the live preview!`);

  const [preview, setPreview] = useState('');

  // Process table rows into HTML
  const processTableRows = (rows) => {
    if (rows.length < 2) return rows.join('<br>'); // Need at least header and separator
    const tableRows = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.split('|').slice(1, -1).map(cell => cell.trim()); // Remove empty first/last cells
      if (i === 0) {
        // Header row
        const headerCells = cells.map(cell =>
          `<th style="border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; background: #f8fafc; font-weight: 600;">${cell}</th>`
        ).join('');
        tableRows.push(`<tr>${headerCells}</tr>`);
      } else if (i === 1 && row.match(/^\|[\s\-:|]+\|$/)) {
        // Separator row - skip it
        continue;
      } else {
        // Data row
        const dataCells = cells.map(cell =>
          `<td style="border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left;">${cell}</td>`
        ).join('');
        tableRows.push(`<tr>${dataCells}</tr>`);
      }
    }
    return `<table style="border-collapse: collapse; width: 100%; margin: 1rem 0; border: 1px solid #e2e8f0;"><tbody>${tableRows.join('')}</tbody></table>`;
  };

  // Improved markdown to HTML converter with better list handling
  const convertMarkdown = (text) => {
    let html = text;
    // Handle code blocks first (before other replacements)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<pre style="background: #f1f5f9; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 1rem 0;"><code class="language-${language}" style="color: #334155; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${code.trim()}</code></pre>`;
    });
    // Preserve math expressions before other processing
    const mathExpressions = [];
    let mathIndex = 0;
    html = html.replace(/\$([^$\n\r]+?)\$/g, (match, math) => {
      const placeholder = `__MATH_INLINE_${mathIndex}__`;
      mathExpressions.push({ placeholder, math: `$${math}$` });
      mathIndex++;
      return placeholder;
    });
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      const placeholder = `__MATH_BLOCK_${mathIndex}__`;
      mathExpressions.push({ placeholder, math: `$$${math}$$` });
      mathIndex++;
      return placeholder;
    });
    // Headers
    html = html
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`(.*?)`/g, '<code style="background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace;">$1</code>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none;">$1</a>');
    // Tables - process before line breaks
    const lines = html.split('\n');
    const processedLines = [];
    let inTable = false;
    let tableRows = [];
    let inList = false;
    let listType = null;
    let listBuffer = [];
    let lastIndent = 0;
    function flushList() {
      if (listBuffer.length === 0) return;
      if (listType === 'ol') {
        processedLines.push(`<ol style="margin: 1rem 0; padding-left: 2rem;">${listBuffer.join('')}</ol>`);
      } else if (listType === 'ul') {
        processedLines.push(`<ul style="margin: 1rem 0; padding-left: 2rem;">${listBuffer.join('')}</ul>`);
      }
      listBuffer = [];
      inList = false;
      listType = null;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Table detection
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
        continue;
      } else if (inTable && tableRows.length > 0) {
        const tableHtml = processTableRows(tableRows);
        processedLines.push(tableHtml);
        tableRows = [];
        inTable = false;
      }
      // List detection
      const olMatch = line.match(/^(\s*)(\d+)\. (.*)$/);
      const ulMatch = line.match(/^(\s*)- (.*)$/);
      if (olMatch) {
        const indent = olMatch[1].length;
        if (!inList || listType !== 'ol' || indent !== lastIndent) {
          flushList();
          inList = true;
          listType = 'ol';
        }
        listBuffer.push(`<li>${olMatch[3]}</li>`);
        lastIndent = indent;
        continue;
      } else if (ulMatch) {
        const indent = ulMatch[1].length;
        if (!inList || listType !== 'ul' || indent !== lastIndent) {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listBuffer.push(`<li>${ulMatch[2]}</li>`);
        lastIndent = indent;
        continue;
      } else {
        flushList();
      }
      processedLines.push(line);
    }
    // Handle table or list at the end
    if (inTable && tableRows.length > 0) {
      const tableHtml = processTableRows(tableRows);
      processedLines.push(tableHtml);
    }
    flushList();
    // Instead of blindly joining with <br>, only add <br> for non-block lines
    html = processedLines.map(line => {
      const trimmed = line.trim();
      if (
        trimmed === '' ||
        trimmed.startsWith('<h1') ||
        trimmed.startsWith('<h2') ||
        trimmed.startsWith('<h3') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<li') ||
        trimmed.startsWith('<table') ||
        trimmed.startsWith('<tr') ||
        trimmed.startsWith('<th') ||
        trimmed.startsWith('<td') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<code') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<hr')
      ) {
        return line;
      } else {
        return line + '<br>';
      }
    }).join('');
    // Restore math expressions
    mathExpressions.forEach(({ placeholder, math }) => {
      html = html.replace(placeholder, math);
    });
    return html;
  };

  // Load MathJax with config for $...$ and $$...$$
  useEffect(() => {
    if (!window.MathJax) {
      // Add MathJax config
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.id = 'mathjax-config';
      configScript.text = `window.MathJax = {tex: {inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$', '$$'], ['\\[', '\\]']]}};`;
      document.head.appendChild(configScript);
      // Add MathJax script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'mathjax-script';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    setPreview(convertMarkdown(markdown));
  }, [markdown]);

  // Render markdown and typeset math
  useEffect(() => {
    if (preview) {
      // Wait for MathJax to be ready, then typeset
      function typeset() {
        if (window.MathJax && window.MathJax.typesetPromise) {
          // Find the preview element and typeset it
          const previewElement = document.querySelector('[data-preview]');
          if (previewElement) {
            window.MathJax.typesetPromise([previewElement]);
          }
        } else {
          setTimeout(typeset, 200); // Retry until MathJax is ready
        }
      }
      typeset();
    }
  }, [preview]);

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        background: '#f8fafc',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#ef4444'
        }} />
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#f59e0b'
        }} />
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#10b981'
        }} />
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.9rem',
          color: '#64748b',
          fontWeight: 500
        }}>
          Live Demo - Try it out!
        </span>
      </div>

      {/* Editor and Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '400px'
      }}>
        {/* Editor */}
        <div style={{
          borderRight: '1px solid #e2e8f0',
          position: 'relative'
        }}>
          <div style={{
            padding: '1rem',
            fontSize: '0.9rem',
            color: '#64748b',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            Editor
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            style={{
              width: '100%',
              height: 'calc(100% - 50px)',
              border: 'none',
              outline: 'none',
              padding: '1.5rem',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'monospace',
              resize: 'none',
              background: '#fff'
            }}
            placeholder="Start typing your markdown here..."
          />
        </div>

        {/* Preview */}
        <div style={{
          position: 'relative'
        }}>
          <div style={{
            padding: '1rem',
            fontSize: '0.9rem',
            color: '#64748b',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            Preview
          </div>
          <div
            data-preview
            style={{
              padding: '1.5rem',
              height: 'calc(100% - 50px)',
              overflow: 'auto',
              fontSize: '14px',
              lineHeight: '1.3',
              position: 'relative'
            }}
            dangerouslySetInnerHTML={{ __html: preview + `
              <style>
                .demo-preview h1, .demo-preview h2, .demo-preview h3 {
                  margin-top: 0.3em; margin-bottom: 0.2em;
                }
                .demo-preview ul, .demo-preview ol {
                  margin-top: 0.1em; margin-bottom: 0.1em; padding-left: 1em;
                }
                .demo-preview li {
                  margin-bottom: 0; line-height: 1.2;
                }
                .demo-preview pre, .demo-preview code {
                  margin: 0.1em 0;
                }
                .demo-preview table {
                  margin: 0.2em 0;
                }
                .demo-preview th, .demo-preview td {
                  padding: 0.15em 0.3em;
                }
                .demo-preview br {
                  line-height: 1;
                }
                .demo-preview p {
                  margin: 0.1em 0 0.1em 0;
                }
              </style>` }}
            className="demo-preview"
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#f8fafc',
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          ✨ Real-time preview • 📝 Markdown support • ∑ Math rendering
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          Try editing the content above!
        </div>
      </div>
    </div>
  );
} 