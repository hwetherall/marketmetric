import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export interface ReportResults {
  has_publication_date: boolean;
  has_author: boolean;
  has_tam: boolean;
  has_cagr: boolean;
  has_customer_segments: boolean;
  has_competitive_landscape: boolean;
  has_emerging_tech: boolean;
  has_industry_trends: boolean;
  has_geographic_breakdown: boolean;
  has_regulatory_requirements: boolean;
  total_score: number;
}

interface ReportScoreProps {
  results: ReportResults;
  reportName: string;
}

export default function ReportScore({ results, reportName }: ReportScoreProps) {
  const criteriaLabels = {
    has_publication_date: 'Publication date included',
    has_author: 'Author or research organization identified',
    has_tam: 'Total Addressable Market (TAM) values provided',
    has_cagr: 'Compound Annual Growth Rate (CAGR) presented',
    has_customer_segments: 'Distinct customer segments identified',
    has_competitive_landscape: 'Competitive landscape described',
    has_emerging_tech: 'Emerging technologies or innovations included',
    has_industry_trends: 'Industry trends discussed',
    has_geographic_breakdown: 'Regional or geographic breakdown provided',
    has_regulatory_requirements: 'Regulatory requirements identified'
  };

  const criteriaKeys = Object.keys(criteriaLabels) as Array<keyof typeof criteriaLabels>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Report Score</h2>
      <p className="text-gray-600 mb-4">{reportName}</p>
      
      <div className="flex items-center justify-center mb-6">
        <div className="w-32 h-32 rounded-full flex items-center justify-center bg-blue-50 border-4 border-blue-500">
          <span className="text-4xl font-bold text-blue-600">{results.total_score}/10</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {criteriaKeys.map((key) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-700">{criteriaLabels[key]}</span>
            <span>
              {results[key] ? (
                <FiCheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <FiXCircle className="w-5 h-5 text-red-500" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 