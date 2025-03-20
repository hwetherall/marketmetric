import { FiFileText } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ReportResults {
  summary?: string; // Market report summary in markdown format
}

interface MarketSummaryProps {
  results: ReportResults;
  reportName: string;
}

export default function MarketSummary({ results, reportName }: MarketSummaryProps) {
  return (
    <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-300">
      <div className="flex items-center gap-3 mb-8 border-b pb-5 border-gray-200">
        <FiFileText className="w-8 h-8 text-primary-800" />
        <div>
          <h2 className="text-3xl font-extrabold text-primary-900">Market Report Summary</h2>
          <p className="text-gray-600 text-lg mt-1">{reportName}</p>
        </div>
      </div>
      
      {/* Report Summary Section */}
      {results.summary && (
        <div className="bg-white rounded-lg">
          <div className="prose prose-lg max-w-none text-black
            prose-headings:text-black
            prose-headings:font-bold 
            prose-h1:text-3xl 
            prose-h1:border-b 
            prose-h1:border-gray-200 
            prose-h1:pb-2
            prose-h1:mb-6
            prose-h2:text-2xl 
            prose-h2:mt-8 
            prose-h2:mb-4
            prose-p:text-black
            prose-p:leading-relaxed
            prose-li:text-black
            prose-li:my-1
            prose-strong:text-black
            prose-strong:font-semibold
            prose-ul:ml-2
            prose-ol:ml-2
            prose-a:text-blue-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {results.summary}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to convert markdown to HTML
function convertMarkdownToHtml(markdown: string): string {
  // Simple conversion - in a real app, use a proper markdown library
  return markdown
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-3 mb-1">$1</h3>')
    .replace(/^\*\*(.*)\*\*/gm, '<b>$1</b>')
    .replace(/^\*(.*)\*/gm, '<i>$1</i>')
    .replace(/^\- (.*$)/gm, '<li class="ml-6">$1</li>')
    .replace(/^\d\. (.*$)/gm, '<li class="ml-6">$1</li>')
    .replace(/\n\n/g, '<br /><br />');
} 