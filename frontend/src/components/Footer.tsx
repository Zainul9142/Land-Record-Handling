import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-lg mb-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <span>BhoomiShield</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Unified digital land identity, multi-source record consistency engine, risk scoring, explainable evidence analysis, and verifiable land reports for Jharkhand.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Jharkhand Ecosystem Integration</h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>• Jharbhoomi Land Records Portal</li>
            <li>• JharBhuNaksha Cadastral Spatial Maps</li>
            <li>• Registration & Deed Registry Feed</li>
            <li>• Revenue & Civil Court Litigation Data</li>
            <li>• CERSAI & Bank Mortgage Charges</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Core Capabilities</h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>• Universal Land Search (Khata/Khesra/Owner)</li>
            <li>• Unified Land Identity (`LandIdentityID`)</li>
            <li>• Deterministic Risk Rules (R001–R007)</li>
            <li>• QR-Verifiable Land Verification PDF</li>
            <li>• Officer Review & Case Resolution Workflow</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Disclaimer & Purpose</h4>
          <p className="text-xs leading-relaxed text-slate-400">
            BhoomiShield sits as an intelligent verification layer on top of official records. It does not alter government land records or guarantee legal title. SIH 2026 / Pilot Prototype Version.
          </p>
          <div className="mt-3 text-[11px] text-sky-400">
            © 2026 BhoomiShield Jharkhand • All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
};
