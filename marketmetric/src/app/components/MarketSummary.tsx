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
    <div className="bg-white p-8 rounded-xl shadow-md border-2 border-gray-400">
      <div className="flex items-center gap-3 mb-6">
        <FiFileText className="w-7 h-7 text-primary-800" />
        <h2 className="text-3xl font-extrabold text-black">Market Report Summary</h2>
      </div>
      
      <div className="flex items-center mb-6">
        <p className="text-gray-700 font-bold text-xl">{reportName}</p>
      </div>
      
      {/* Report Summary Section */}
      {results.summary && (
        <div className="bg-white rounded-lg">
          <div className="prose prose-lg max-w-none text-black prose-headings:text-primary-800 prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-6 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-black">
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