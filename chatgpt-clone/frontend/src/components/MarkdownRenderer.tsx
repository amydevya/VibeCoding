import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
          lineHeight: '1.7',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  return (
    <div className="prose prose-slate prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            
            // Check if it's a code block (has language) or inline code
            if (match) {
              return <CodeBlock language={match[1]} code={code} />;
            }
            
            // Inline code
            return (
              <code
                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[13px] font-mono before:content-none after:content-none"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-slate-800 mt-6 mb-3 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-slate-800 mt-5 mb-2 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-slate-800 mt-4 mb-2 first:mt-0">{children}</h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-slate-700 leading-7 mb-3 last:mb-0">{children}</p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 mb-3 space-y-1 text-slate-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 mb-3 space-y-1 text-slate-700">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-7">{children}</li>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-slate-300 pl-4 my-4 text-slate-600 italic">
              {children}
            </blockquote>
          ),
          // Table
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 px-4 py-2 text-left text-sm font-semibold text-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-4 py-2 text-sm text-slate-600">
              {children}
            </td>
          ),
          // Horizontal rule
          hr: () => <hr className="my-6 border-slate-200" />,
          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-800">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700">{children}</em>
          ),
          // Pre (for code blocks without language)
          pre: ({ children }) => {
            // If children is already a CodeBlock, just return it
            if (typeof children === 'object') {
              return <>{children}</>;
            }
            return (
              <pre className="bg-slate-100 rounded-xl p-4 overflow-x-auto my-4 text-sm font-mono">
                {children}
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-0.5 h-5 bg-slate-400 animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
}
