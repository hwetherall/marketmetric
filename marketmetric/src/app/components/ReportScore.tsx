import { FiCheckCircle, FiXCircle, FiBarChart2 } from 'react-icons/fi';

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

  // Function to determine score color
  const getScoreColor = (score: number) => {
    if (score <= 3) return 'border-red-700 bg-red-100 text-black';
    if (score <= 6) return 'border-yellow-700 bg-yellow-100 text-black';
    return 'border-emerald-700 bg-emerald-100 text-black';
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border-2 border-gray-400">
      <div className="flex items-center gap-3 mb-5">
        <FiBarChart2 className="w-7 h-7 text-primary-800" />
        <h2 className="text-3xl font-extrabold text-black">Report Analysis</h2>
      </div>
      <p className="text-black mb-6 font-bold text-xl">{reportName}</p>
      
      <div className="flex items-center justify-center mb-10">
        <div className={`w-40 h-40 rounded-full flex items-center justify-center border-4 ${getScoreColor(results.total_score)}`}>
          <div className="text-center">
            <span className="text-6xl font-extrabold">{results.total_score}</span>
            <span className="text-2xl font-bold">/10</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {criteriaKeys.map((key) => (
          <div key={key} className={`flex items-center p-4 rounded-lg ${
            results[key] 
              ? 'bg-green-100 border-2 border-green-500 text-black' 
              : 'bg-red-100 border-2 border-red-500 text-black'
          }`}>
            <span className="flex-grow font-bold text-base">
              {criteriaLabels[key]}
            </span>
            <span>
              {results[key] ? (
                <FiCheckCircle className="w-6 h-6 text-green-700" />
              ) : (
                <FiXCircle className="w-6 h-6 text-red-700" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 