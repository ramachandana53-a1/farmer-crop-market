import React, { useState } from 'react';
import { PROJECT_CODE_FILES, AcademicCodeFile } from '../data/projectFiles';
import { 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  BookOpen, 
  FileText, 
  Layers,
  Sparkles,
  FileCode2,
  FolderDown,
  Info
} from 'lucide-react';

interface SourceCodeViewerProps {
  onDownloadZip?: () => void;
  isDownloading?: boolean;
  files?: AcademicCodeFile[];
}

export const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({
  onDownloadZip,
  isDownloading = false,
  files,
}) => {
  const codeFiles = files || PROJECT_CODE_FILES;
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);

  const activeFile: AcademicCodeFile = codeFiles[selectedFileIndex] || codeFiles[0] || PROJECT_CODE_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2500);
  };

  const handleDownloadSingleFile = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Earthy Context & Download Header */}
      <div className="bg-[#FAF7EE] border border-[#E2DAC5] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] shrink-0 text-2xl">
            📦
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-[#1B4332]">
                Academic Project Artifacts & Standalone Code Files
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E9C46A]/40 text-[#1B4332] border border-[#E9C46A]">
                7 Files Ready to Run
              </span>
            </div>
            <p className="text-xs text-[#40534C] mt-0.5">
              Complete implementations for DBMS (SQL), Python ML (scikit-learn), Java ADSA (Dijkstra), Java OOPJ, and standalone HTML/CSS web app.
            </p>
          </div>
        </div>

        <button
          id="download-zip-btn"
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] active:bg-[#1B4332] text-white text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
        >
          <FolderDown className="w-4 h-4 text-[#E9C46A]" />
          <span>{isDownloading ? 'Archiving ZIP...' : 'Download Project Bundle (.zip)'}</span>
        </button>
      </div>

      {/* Main File Browser & Code Viewer */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl overflow-hidden shadow-sm">
        {/* File Tabs Header */}
        <div className="flex items-center justify-between bg-[#FAF7EE] px-4 py-2.5 border-b border-[#E2DAC5] overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {codeFiles.map((file, idx) => (
              <button
                key={file.filename}
                onClick={() => {
                  setSelectedFileIndex(idx);
                  setCopiedFile(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition whitespace-nowrap cursor-pointer ${
                  selectedFileIndex === idx
                    ? 'bg-[#2D6A4F] text-white font-bold shadow-xs'
                    : 'text-[#40534C] hover:text-[#1B4332] hover:bg-[#F4F1DE]'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>{file.filename}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadSingleFile}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7EE] border border-[#E2DAC5] text-[#1B4332] text-xs font-bold transition cursor-pointer shadow-2xs"
              title="Save this file individually"
            >
              <Download className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 text-[#2D6A4F] border border-[#2D6A4F]/30 text-xs font-bold transition cursor-pointer"
            >
              {copiedFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Metadata Sub-bar */}
        <div className="px-4 py-2 bg-[#F4F1DE]/60 border-b border-[#E2DAC5] flex items-center justify-between text-xs text-[#52796F]">
          <div className="line-clamp-1 pr-2">
            <strong className="text-[#1B4332]">{activeFile.title}</strong> &bull; {activeFile.description}
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-[#2D6A4F] border border-[#E2DAC5] font-bold uppercase shrink-0">
            {activeFile.language}
          </span>
        </div>

        {/* Code Content in High-Contrast Container */}
        <div className="p-4 bg-[#1E2922] overflow-x-auto max-h-[560px] font-mono text-xs leading-relaxed text-[#EAE6D6]">
          <pre className="selection:bg-[#2D6A4F] selection:text-white">
            {activeFile.code}
          </pre>
        </div>
      </div>

      {/* Execution Commands Cheat Sheet */}
      <div className="bg-white border border-[#E2DAC5] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#2D6A4F]" />
          Terminal Execution & Compilation Commands
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Java ADSA & OOPJ */}
          <div className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-2">
            <span className="text-[#1B4332] font-bold">1. Java Modules (ADSA Graph & OOPJ CLI):</span>
            <pre className="p-2.5 bg-white rounded-lg font-mono text-[11px] text-[#1B4332] border border-[#D8CDB2] overflow-x-auto">
{`# Compile all Java modules:
javac TransitGraph.java FarmerMarketApp.java

# Run standalone ADSA Dijkstra test:
java TransitGraph

# Run full OOPJ application:
java FarmerMarketApp`}
            </pre>
          </div>

          {/* Python ML */}
          <div className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-2">
            <span className="text-[#1B4332] font-bold">2. Python ML (Yield & Price Prediction):</span>
            <pre className="p-2.5 bg-white rounded-lg font-mono text-[11px] text-[#1B4332] border border-[#D8CDB2] overflow-x-auto">
{`# Install dependencies:
pip install pandas numpy scikit-learn

# Run ML regression inference:
python crop_ml_predictor.py --crop_type "Durum Wheat" --rainfall 650 --soil_quality 75

# Run for Vine Tomatoes:
python crop_ml_predictor.py --crop_type "Vine Tomatoes" --rainfall 600 --soil_quality 82`}
            </pre>
          </div>

          {/* DBMS */}
          <div className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-2">
            <span className="text-[#1B4332] font-bold">3. DBMS (MySQL / PostgreSQL):</span>
            <pre className="p-2.5 bg-white rounded-lg font-mono text-[11px] text-[#1B4332] border border-[#D8CDB2] overflow-x-auto">
{`# Execute 3NF DDL & queries in MySQL:
mysql -u root -p farmer_market_db < schema.sql

# Or in PostgreSQL:
psql -U postgres -d farmer_market_db -f schema.sql`}
            </pre>
          </div>

          {/* Standalone Web App */}
          <div className="p-3.5 bg-[#FAF7EE] rounded-xl border border-[#E2DAC5] space-y-2">
            <span className="text-[#1B4332] font-bold">4. Standalone Web Portal (HTML / CSS):</span>
            <p className="text-[#40534C] text-[11px] leading-relaxed">
              Open <code className="bg-[#EAE6D6] px-1.5 py-0.5 rounded font-mono font-bold text-[#1B4332]">farmer_market_ui.html</code> directly in any web browser. 
              Features the requested earthy palette (<strong className="text-[#2D6A4F]">#2D6A4F</strong>, <strong className="text-[#877852]">#F4F1DE</strong>, <strong className="text-[#C99728]">#E9C46A</strong>), 
              visual crop icons (🌾, 🌽, 🍅), and in-browser Dijkstra and ML pricing engines without requiring node or a build tool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
