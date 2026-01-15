
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DepartmentMismatch } from '../types';
import { summarizeOperations, SummaryResult } from '../services/geminiService';

const MOCK_DATA: DepartmentMismatch[] = [
  // Production
  { department: 'Production', metric: 'Tablet Compression (OEB3)', plan: 5000000, actual: 4200000, variance: -800000, unit: 'Tabs', status: 'critical', reasoning: 'Frequent hopper jams in Rotary Press #4; technician shortage in night shift.' },
  { department: 'Production', metric: 'Syrup Filling Line 2', plan: 150000, actual: 155000, variance: 5000, unit: 'Bottles', status: 'on-track', reasoning: 'Optimized changeover process reduced downtime.' },
  { department: 'Production', metric: 'Blister Packaging (Alu-Alu)', plan: 200000, actual: 180000, variance: -20000, unit: 'Packs', status: 'warning', reasoning: 'Quality rejection of foil batch due to pin-hole defects from supplier.' },
  { department: 'Production', metric: 'Sterile Area (BFS Line)', plan: 80000, actual: 45000, variance: -35000, unit: 'Vials', status: 'critical', reasoning: 'Environmental monitoring alert in Grade A zone forced immediate batch termination.' },
  { department: 'Production', metric: 'Capsule Polishing Capacity', plan: 1200000, actual: 950000, variance: -250000, unit: 'Caps', status: 'warning', reasoning: 'Delayed procurement of replacement brushes for the polishing unit.' },
  { department: 'Production', metric: 'Granulation Batch Yield', plan: 98, actual: 92, variance: -6, unit: '%', status: 'warning', reasoning: 'Higher than expected fine percentage in the latest batch of Metformin.' },

  // Quality Control
  { department: 'Quality Control', metric: 'Finished Product Potency', plan: 99.8, actual: 98.2, variance: -1.6, unit: '%', status: 'critical', reasoning: 'Atypical results in Amoxicillin stability samples requiring OOS investigation.' },
  { department: 'Quality Control', metric: 'Stability Chamber Audit', plan: 45, actual: 38, variance: -7, unit: 'Checks', status: 'warning', reasoning: 'Humidity deviation in Chamber 4 led to extensive re-logging.' },
  { department: 'Quality Control', metric: 'HPLC Column Availability', plan: 12, actual: 8, variance: -4, unit: 'Units', status: 'warning', reasoning: 'Global supply chain delay for C18 reverse-phase columns.' },
  { department: 'Quality Control', metric: 'Raw Material Testing Cycle', plan: 72, actual: 96, variance: 24, unit: 'Hours', status: 'critical', reasoning: 'Backlog in API testing due to unplanned maintenance of Gas Chromatograph.' },
  { department: 'Quality Control', metric: 'Microbiological Testing', plan: 100, actual: 85, variance: -15, unit: '%', status: 'critical', reasoning: 'Incubator space constraints affecting multi-product testing schedule.' },

  // Sales
  { department: 'Sales', metric: 'MREP Regional Revenue', plan: 25.0, actual: 21.0, variance: -4.0, unit: 'M PKR', status: 'critical', reasoning: 'Stock-out of fast-moving SKUs (Panadol) at the distributor level in Punjab.' },
  
  // Export
  { department: 'Export', metric: 'REGION 1 Revenue Mismatch', plan: 8.5, actual: 6.2, variance: -2.3, unit: 'M PKR', status: 'critical', reasoning: 'Regulatory delays in shipment clearance at destination port.' },

  // Finance
  { department: 'Finance', metric: 'Institutional Inflow', plan: 15.0, actual: 10.2, variance: -4.8, unit: 'M PKR', status: 'critical', reasoning: 'Delayed payments from provincial health departments.' },
  { department: 'Finance', metric: 'Raw Material LC payments', plan: 30.0, actual: 18.5, variance: -11.5, unit: 'M PKR', status: 'critical', reasoning: 'Foreign exchange liquidity constraints affecting letter of credit retirements.' },
  { department: 'Finance', metric: 'Tax Refund Realization', plan: 5.5, actual: 1.2, variance: -4.3, unit: 'M PKR', status: 'critical', reasoning: 'Pending FBR audits for the 2023-24 fiscal year slowing down inflows.' },
  { department: 'Finance', metric: 'OpEx Budget Utilization', plan: 12.0, actual: 14.8, variance: -2.8, unit: 'M PKR', status: 'warning', reasoning: 'Spike in diesel prices affecting distribution and generator fuel costs.' },
  { department: 'Finance', metric: 'Vendor Payable Cycle', plan: 45, actual: 62, variance: -17, unit: 'Days', status: 'warning', reasoning: 'Extended payment terms requested by local suppliers due to cash flow tightening.' },
  { department: 'Finance', metric: 'Freight & Logistics Cost', plan: 2.5, actual: 4.8, variance: 2.3, unit: 'M PKR', status: 'critical', reasoning: 'Surge in sea freight rates for imported API from European sources.' },
  { department: 'Finance', metric: 'Insurance Premium Aging', plan: 1.2, actual: 1.5, variance: 0.3, unit: 'M PKR', status: 'warning', reasoning: 'Unbudgeted increase in vehicle fleet insurance rates.' },

  // Business Development
  { department: 'Business Development', metric: 'New Franchise Onboarding', plan: 12, actual: 4, variance: -8, unit: 'Units', status: 'critical', reasoning: 'Slow legal vetting process for new distributor agreements in KP region.' },
  { department: 'Business Development', metric: 'Market Expansion (LSM)', plan: 5.0, actual: 3.5, variance: -1.5, unit: 'M PKR', status: 'warning', reasoning: 'Marketing campaign delayed due to pending creative approvals.' },
  { department: 'Business Development', metric: 'Product Registration (DRAP)', plan: 8, actual: 3, variance: -5, unit: 'Dossiers', status: 'critical', reasoning: 'Technical queries raised by DRAP on stability data for new generic line.' },
  { department: 'Business Development', metric: 'Tender Win Rate', plan: 40, actual: 22, variance: -18, unit: '%', status: 'critical', reasoning: 'Aggressive pricing from competitors in government procurement auctions.' },
  { department: 'Business Development', metric: 'Doctor Call Compliance', plan: 95, actual: 78, variance: -17, unit: '%', status: 'warning', reasoning: 'Resignation of field staff in the South Region affecting coverage.' },

  // Quality Assurance
  { department: 'Quality Assurance', metric: 'CAPA Closure Rate', plan: 95, actual: 72, variance: -23, unit: '%', status: 'critical', reasoning: 'Backlog in validation department affecting timely closure of internal audit findings.' },
  { department: 'Quality Assurance', metric: 'Annual Product Review (APR)', plan: 20, actual: 14, variance: -6, unit: 'Reports', status: 'warning', reasoning: 'Delayed data submission from the production department for Syrup lines.' },
  { department: 'Quality Assurance', metric: 'Vendor Audit Compliance', plan: 10, actual: 6, variance: -4, unit: 'Audits', status: 'warning', reasoning: 'Travel restrictions and budget constraints in Q3.' },
  { department: 'Quality Assurance', metric: 'BMR Review Lead Time', plan: 24, actual: 48, variance: 24, unit: 'Hours', status: 'critical', reasoning: 'High turnover in QA documentation staff causing release bottlenecks.' },
  { department: 'Quality Assurance', metric: 'Documentation Errors (Line)', plan: 5, actual: 18, variance: 13, unit: 'Count', status: 'critical', reasoning: 'Recent training session failed to address specific GxP requirements for new hires.' },

  // Engineering
  { department: 'Engineering', metric: 'Preventive Maintenance (PM)', plan: 100, actual: 82, variance: -18, unit: '%', status: 'critical', reasoning: 'Critical spare parts stuck in customs; affecting HVAC maintenance schedule.' },
  { department: 'Engineering', metric: 'Energy Consumption Efficiency', plan: 0.85, actual: 0.70, variance: -0.15, unit: 'Ratio', status: 'warning', reasoning: 'Inefficient boiler operation due to old insulation layers needing replacement.' },
  { department: 'Engineering', metric: 'Water System (WFI) Conductivity', plan: 1.3, actual: 1.8, variance: -0.5, unit: 'µS/cm', status: 'critical', reasoning: 'Resin exhaustion in DI columns leading to higher conductivity levels.' },
  { department: 'Engineering', metric: 'Generator Backup Reliability', plan: 99.9, actual: 92.5, variance: -7.4, unit: '%', status: 'critical', reasoning: 'Coolant leak in Generator 2; pending seal replacement from authorized dealer.' },
  { department: 'Engineering', metric: 'Utility Downtime (Unplanned)', plan: 10, actual: 35, variance: 25, unit: 'Hours', status: 'critical', reasoning: 'Grid instability and frequent transformer tripping at the main industrial site.' },

  // Regulatory
  { department: 'Regulatory', metric: 'WHO GMP Recertification', plan: 1, actual: 0, variance: -1, unit: 'Audit', status: 'critical', reasoning: 'Postponed due to documentation gaps in manufacturing logs identified during pre-audit.' },
  { department: 'Regulatory', metric: 'Dossier Submission (EMEA)', plan: 5, actual: 2, variance: -3, unit: 'Files', status: 'warning', reasoning: 'Technical queries from health authority on long-term stability data for new API.' },
  { department: 'Regulatory', metric: 'Labeling Compliance Update', plan: 100, actual: 85, variance: -15, unit: '%', status: 'warning', reasoning: 'Delay in approving new artwork for multi-lingual packaging.' },

  // Supply Chain
  { department: 'Supply Chain', metric: 'API Inventory Coverage', plan: 90, actual: 45, variance: -45, unit: 'Days', status: 'critical', reasoning: 'Global shortage of specialized raw materials for core cardiovascular products.' },
  { department: 'Supply Chain', metric: 'Lead Time Variance (Imports)', plan: 30, actual: 52, variance: 22, unit: 'Days', status: 'warning', reasoning: 'Port congestion and transshipment delays in Middle East logistics hubs.' },
  { department: 'Supply Chain', metric: 'Warehouse Pallet Utilization', plan: 95, actual: 99, variance: 4, unit: '%', status: 'warning', reasoning: 'Near capacity limits; risk of GSP non-compliance due to aisle blocking.' },

  // Distribution
  { department: 'Distribution', metric: 'Order Fulfillment Rate (OTIF)', plan: 98, actual: 82, variance: -16, unit: '%', status: 'critical', reasoning: 'Shortage of specialized delivery vans and localized fuel supply disruptions.' },
  { department: 'Distribution', metric: 'Cold Chain Integrity Breach', plan: 0, actual: 4, variance: 4, unit: 'Incidents', status: 'critical', reasoning: 'Failure of primary data loggers in the Karachi-Lahore transit route during peak heatwave.' },
  { department: 'Distribution', metric: 'Distributor Secondary Sales reporting', plan: 100, actual: 70, variance: -30, unit: '%', status: 'warning', reasoning: 'Legacy system downtime at regional distribution centers.' },
];

const MOCK_DEPARTMENT_BUDGETS: Record<string, { budget: number, spent: number }> = {
  'Sales': { budget: 16.0, spent: 13.0 },
  'Production': { budget: 50.0, spent: 48.0 },
  'Quality Control': { budget: 10.0, spent: 9.5 },
  'Business Development': { budget: 8.0, spent: 6.4 },
  'Quality Assurance': { budget: 5.0, spent: 4.8 },
  'Engineering': { budget: 20.0, spent: 19.0 },
  'Export': { budget: 12.0, spent: 10.0 },
  'Finance': { budget: 5.0, spent: 4.5 },
  'Regulatory': { budget: 4.0, spent: 3.5 },
  'Supply Chain': { budget: 25.0, spent: 22.0 },
  'Distribution': { budget: 15.0, spent: 14.5 },
};

const MOCK_FINANCE_PL = [
  { label: 'Net Sales Revenue', value: 185.50, type: 'income', detail: 'Gross sales across all divisions' },
  { label: 'Cost of Goods Sold (COGS)', value: -92.20, type: 'expense', detail: 'Direct production & raw material costs' },
  { label: 'Gross Profit', value: 93.30, type: 'total', detail: '50.2% Gross Margin' },
  { label: 'Operating Expenses (OpEx)', value: -42.80, type: 'expense', detail: 'Admin, Marketing & HR costs' },
  { label: 'Other Operating Income', value: 4.50, type: 'income', detail: 'Export rebates & scraps' },
  { label: 'EBITDA', value: 55.00, type: 'total', detail: 'Earnings before interest, taxes, dep.' },
  { label: 'Financial Charges (LCs)', value: -12.40, type: 'expense', detail: 'Interest on working capital' },
  { label: 'Taxation (Corporate)', value: -14.20, type: 'expense', detail: 'Estimated quarterly provision' },
  { label: 'Net Profit (Loss)', value: 28.40, type: 'final', detail: '15.3% Net Margin' },
];

interface DataGroup {
  groupName: string;
  items: { name: string; plan: number; actual: number; variance: number; status: 'critical' | 'warning' | 'on-track' }[];
}

const MOCK_SALES_DETAILS: DataGroup[] = [
  {
    groupName: 'Passionate',
    items: [
      { name: 'Omeprazole 20mg Delayed-Release', plan: 4.5, actual: 3.2, variance: -1.3, status: 'critical' },
      { name: 'Vitaglobin Syrup 120ml', plan: 2.2, actual: 2.5, variance: 0.3, status: 'on-track' },
      { name: 'Ferriboxy Injection 10ml USP', plan: 1.5, actual: 1.1, variance: -0.4, status: 'warning' },
    ]
  },
  {
    groupName: 'Concord',
    items: [
      { name: 'Dexalocal Tablet 0.5mg', plan: 4.2, actual: 2.8, variance: -1.4, status: 'critical' },
      { name: 'Panadol CF Tablet (30s)', plan: 3.0, actual: 1.8, variance: -1.2, status: 'critical' },
      { name: 'Gaviscon Liquid 120ml Mint', plan: 2.0, actual: 1.2, variance: -0.8, status: 'warning' },
    ]
  },
  {
    groupName: 'Dynamic',
    items: [
      { name: 'Arinac Forte Tablet (20s)', plan: 3.5, actual: 2.9, variance: -0.6, status: 'warning' },
      { name: 'Brufen 400mg Tablet (30s)', plan: 1.5, actual: 1.1, variance: -0.4, status: 'warning' },
      { name: 'Surbex Z Multivitamin (30s)', plan: 1.0, actual: 0.8, variance: -0.2, status: 'warning' },
    ]
  },
  {
    groupName: 'ACHIEVERS',
    items: [
      { name: 'D-ABs (Injection Portfolio)', plan: 8.5, actual: 3.2, variance: -5.3, status: 'critical' },
      { name: 'Co-Amoxiclav 625mg Tablet', plan: 12.0, actual: 9.5, variance: -2.5, status: 'warning' },
      { name: 'Levofloxacin 500mg Tablet', plan: 7.5, actual: 4.2, variance: -3.3, status: 'critical' },
      { name: 'Esomeprazole 40mg Capsule', plan: 9.0, actual: 8.1, variance: -0.9, status: 'warning' },
      { name: 'Cefixime 400mg Capsule', plan: 6.0, actual: 6.5, variance: 0.5, status: 'on-track' },
      { name: 'Moxifloxacin 400mg Tablet', plan: 4.0, actual: 4.2, variance: 0.2, status: 'on-track' },
      { name: 'Azithromycin 500mg (3s)', plan: 3.5, actual: 3.8, variance: 0.3, status: 'on-track' },
      { name: 'Metformin 1000mg SR', plan: 5.5, actual: 3.1, variance: -2.4, status: 'critical' },
      { name: 'Rosuvastatin 20mg Tablet', plan: 4.8, actual: 3.5, variance: -1.3, status: 'warning' },
    ]
  }
];

const MOCK_EXPORT_DETAILS: DataGroup[] = [
  {
    groupName: 'REGION 1 - EMEA',
    items: [
      { name: 'Omeprazole 20mg Delayed-Release', plan: 5.0, actual: 3.2, variance: -1.8, status: 'critical' },
      { name: 'Vitaglobin Syrup 120ml', plan: 2.5, actual: 2.1, variance: -0.4, status: 'warning' },
      { name: 'Ferriboxy Injection 10ml USP', plan: 1.0, actual: 0.9, variance: -0.1, status: 'warning' },
    ]
  },
  {
    groupName: 'REGION 2 - ASIA PACIFIC',
    items: [
      { name: 'Dexalocal Tablet 0.5mg', plan: 4.2, actual: 2.8, variance: -1.4, status: 'critical' },
      { name: 'Panadol CF Tablet (30s)', plan: 3.0, actual: 1.8, variance: -1.2, status: 'critical' },
      { name: 'Gaviscon Liquid 120ml Mint', plan: 2.0, actual: 1.2, variance: -0.8, status: 'warning' },
    ]
  },
  {
    groupName: 'REGION 3 - CENTRAL ASIA',
    items: [
      { name: 'Amoxicillin 500mg Capsule', plan: 3.5, actual: 2.1, variance: -1.4, status: 'critical' },
      { name: 'Ciprofloxacin 500mg (10s)', plan: 2.0, actual: 1.8, variance: -0.2, status: 'warning' },
      { name: 'Metformin 500mg Tablet', plan: 1.5, actual: 1.1, variance: -0.4, status: 'warning' },
    ]
  }
];

const COLORS = {
  critical: '#dc2626',
  warning: '#fbbf24',
  'on-track': '#16a34a'
};

const StatusCard: React.FC<{ title: string, value: string, subtitle: string, icon: string, color: string }> = ({ title, value, subtitle, icon, color }) => (
  <div className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all ${color === 'red' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-white shadow-sm">{icon}</div>
      <div className="h-4 w-4 bg-white rounded-full animate-pulse shadow-inner border border-slate-100"></div>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</p>
    <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter opacity-70">{subtitle}</p>
  </div>
);

const ConditionBadge: React.FC<{ status: 'critical' | 'warning' | 'on-track' }> = ({ status }) => {
  const config = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    'on-track': 'bg-green-100 text-green-700 border-green-200'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${config[status]}`}>
      {status}
    </span>
  );
};

export const Dashboard: React.FC = () => {
  const [report, setReport] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeSheet, setActiveSheet] = useState<string>('Executive Summary');
  const [isAutoDispatchOn, setIsAutoDispatchOn] = useState(() => localStorage.getItem('autoDispatch') === 'true');
  const [lastAutoDispatchDate, setLastAutoDispatchDate] = useState(() => localStorage.getItem('lastDispatchDate') || '');
  const [currentTime, setCurrentTime] = useState(new Date());

  const DISPATCH_HOUR = 21; // 9 PM

  const sheets = [
    'Executive Summary', 
    'Sales', 
    'Export', 
    'Production', 
    'Business Development', 
    'Quality Control', 
    'Quality Assurance', 
    'Engineering', 
    'Regulatory',
    'Supply Chain',
    'Distribution',
    'Finance'
  ];

  // Global Clock and Auto-Dispatch Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (isAutoDispatchOn) {
        const todayStr = now.toDateString();
        // Check if it's 9 PM or later and hasn't dispatched today
        if (now.getHours() >= DISPATCH_HOUR && lastAutoDispatchDate !== todayStr) {
          triggerAutoDispatch(todayStr);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timer);
  }, [isAutoDispatchOn, lastAutoDispatchDate]);

  const triggerAutoDispatch = async (todayStr: string) => {
    console.log('Automated Dispatch Triggered at:', new Date().toLocaleTimeString());
    setSyncing(true);
    try {
      const result = await summarizeOperations(MOCK_DATA);
      setReport(result);
      setLastAutoDispatchDate(todayStr);
      localStorage.setItem('lastDispatchDate', todayStr);
      let text = `*AUTOMATED SWISS DASHBOARD AUDIT: ${todayStr.toUpperCase()}*\n\n`;
      text += `*Executive Brief:* ${result.executiveSummary}\n\n*Key Actions:* ${result.actions.slice(0, 3).join(', ')}`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      console.log('Dispatch successful.');
    } catch (e) {
      console.error('Auto Dispatch Failed:', e);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleAutoDispatch = () => {
    const newState = !isAutoDispatchOn;
    setIsAutoDispatchOn(newState);
    localStorage.setItem('autoDispatch', newState.toString());
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredMismatches = useMemo(() => {
    return MOCK_DATA.filter(dept => (dept.status === 'critical' || dept.status === 'warning'));
  }, []);

  const departmentalFinancialStats = useMemo(() => {
    const depts = sheets.filter(s => s !== 'Executive Summary' && s !== 'Finance');
    return depts.map(dept => {
      const deptMetrics = MOCK_DATA.filter(d => d.department === dept);
      let totalAchievement = 0;
      if (deptMetrics.length > 0) {
        totalAchievement = deptMetrics.reduce((acc, curr) => acc + (curr.actual / curr.plan), 0) / deptMetrics.length * 100;
      }
      const budgetData = MOCK_DEPARTMENT_BUDGETS[dept] || { budget: 1, spent: 0 };
      const utilization = (budgetData.spent / budgetData.budget) * 100;
      return {
        name: dept,
        utilization: utilization.toFixed(1),
        achievement: totalAchievement.toFixed(1)
      };
    });
  }, []);

  const calculateChartData = (details: DataGroup[]) => {
    return details.map(group => {
      const filteredItems = group.items.filter(item => item.status !== 'on-track');
      const planTotal = filteredItems.reduce((acc, item) => acc + item.plan, 0);
      const actualTotal = filteredItems.reduce((acc, item) => acc + item.actual, 0);
      return {
        name: group.groupName,
        Plan: parseFloat(planTotal.toFixed(2)),
        Actual: parseFloat(actualTotal.toFixed(2))
      };
    });
  };

  const salesGroupChartData = useMemo(() => calculateChartData(MOCK_SALES_DETAILS), []);
  const exportGroupChartData = useMemo(() => calculateChartData(MOCK_EXPORT_DETAILS), []);

  const globalHealthData = useMemo(() => {
    const counts = { critical: 0, warning: 0, 'on-track': 0 };
    MOCK_DATA.forEach(d => counts[d.status]++);
    MOCK_SALES_DETAILS.forEach(g => g.items.forEach(i => counts[i.status]++));
    MOCK_EXPORT_DETAILS.forEach(g => g.items.forEach(i => counts[i.status]++));
    return [
      { name: 'Critical', value: counts.critical, color: COLORS.critical },
      { name: 'Warning', value: counts.warning, color: COLORS.warning },
      { name: 'On-Track', value: counts['on-track'], color: COLORS['on-track'] }
    ];
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await summarizeOperations(MOCK_DATA);
      setReport(result);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const shareViaWhatsApp = async () => {
    // 1. Trigger System Print
    handlePrint();

    // 2. Prepare WhatsApp dispatch message
    let text = `*SWISS MASTER AUDIT - DISPATCHED PDF FORM*\n\n`;
    text += `Full master audit generated. Please find the attached PDF report in this chat for immediate board review.\n\n`;
    
    if (activeSheet === 'Executive Summary' && report) {
      text += `*Executive Brief:* ${report.executiveSummary}\n`;
    } else {
      text += `*Scope:* ${activeSheet.toUpperCase()} Details & Mismatches\n`;
    }
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const renderDepartmentEfficiency = () => (
    <div className="bg-white p-8 border-b border-slate-100">
      <div className="mb-8">
        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Departmental Outcome vs Budget Efficiency</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cross-Functional Performance Analysis • Percentage Form Only</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Operational Unit</th>
              <th className="px-8 py-5 text-right">Budget Utilization (%)</th>
              <th className="px-8 py-5 text-right">Target Achievement (%)</th>
              <th className="px-8 py-5">Performance Insight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departmentalFinancialStats.map((dept, idx) => (
              <tr key={idx} className="text-sm hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5 font-black text-slate-800 uppercase tracking-tighter">{dept.name}</td>
                <td className="px-8 py-5 text-right">
                  <div className="inline-flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900">{dept.utilization}%</span>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-blue-600" style={{ width: `${dept.utilization}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="inline-flex items-center gap-3">
                    <span className={`font-mono font-black ${parseFloat(dept.achievement) < 70 ? 'text-red-600' : 'text-green-700'}`}>
                      {dept.achievement}%
                    </span>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                      <div className={`h-full ${parseFloat(dept.achievement) < 70 ? 'bg-red-500' : 'bg-green-600'}`} style={{ width: `${dept.achievement}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    parseFloat(dept.achievement) >= parseFloat(dept.utilization) 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {parseFloat(dept.achievement) >= parseFloat(dept.utilization) ? 'Efficient Outcome' : 'Sub-Optimal ROI'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfitLoss = () => (
    <div className="bg-white p-8 border-b border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Profit & Loss Statement</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Consolidated Financial Performance Summary • Q3 2024</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Currency</p>
          <p className="text-xs font-bold text-slate-700">PKR (Millions)</p>
        </div>
      </div>
      <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Financial Component</th>
              <th className="px-8 py-5 text-right">Amount (M)</th>
              <th className="px-8 py-5">Notes & Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_FINANCE_PL.map((item, idx) => (
              <tr key={idx} className={`text-sm hover:bg-slate-100/30 transition-colors ${item.type === 'total' ? 'bg-slate-50/80' : item.type === 'final' ? 'bg-green-50/30 font-black' : ''}`}>
                <td className={`px-8 py-5 ${item.type === 'total' || item.type === 'final' ? 'font-black text-slate-900' : 'text-slate-600 font-medium'}`}>{item.label}</td>
                <td className={`px-8 py-5 text-right font-mono ${item.type === 'income' ? 'text-green-700 font-bold' : item.type === 'expense' ? 'text-red-600 font-bold' : 'text-slate-900 font-black'}`}>
                  {item.value < 0 ? `(${Math.abs(item.value).toFixed(2)})` : item.value.toFixed(2)}
                </td>
                <td className="px-8 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGroupChart = (title: string, data: any[]) => (
    <div className="p-8 border-b border-slate-100 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title} Gaps</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Focusing on items requiring intervention</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-300 rounded"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Actual</span>
          </div>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
            <Bar dataKey="Plan" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
            <Bar dataKey="Actual" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderDepartmentAnalytics = (dept: string) => {
    const deptData = MOCK_DATA.filter(d => d.department === dept);
    const barData = deptData.map(d => ({
      name: d.metric.length > 15 ? d.metric.substring(0, 15) + '...' : d.metric,
      Plan: d.plan,
      Actual: d.actual
    }));
    const statusCounts = { critical: 0, warning: 0, 'on-track': 0 };
    deptData.forEach(d => statusCounts[d.status]++);
    const pieData = Object.keys(statusCounts).map(status => ({
      name: status.toUpperCase(),
      value: statusCounts[status as keyof typeof statusCounts],
      color: COLORS[status as keyof typeof COLORS]
    })).filter(d => d.value > 0);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 border-b border-slate-100 bg-white">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Metric Performance (Plan vs Actual)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="Plan" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Department Health Distribution</h4>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderGroupedSheet = (title: string, data: DataGroup[]) => {
    return (
      <div className="bg-white">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between no-print">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">{title}</h4>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="text-[10px] font-black text-slate-500 uppercase bg-white px-6 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">Export PDF / Print</button>
          </div>
        </div>
        <div className="p-8">
           {data.map((group, idx) => {
               const problematicItems = group.items.filter(i => i.status !== 'on-track');
               if (problematicItems.length === 0) return null;
               return (
                 <div key={idx} className="mb-8 last:mb-0">
                   <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-3">
                     <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                     {group.groupName}
                   </h5>
                   <div className="bg-white border border-slate-100 rounded-2xl overflow-x-auto scrollbar-thin shadow-sm">
                     <table className="w-full text-left min-w-[800px]">
                       <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                         <tr>
                           <th className="px-6 py-4">Item (Product) Details</th>
                           <th className="px-6 py-4 text-right">Plan</th>
                           <th className="px-6 py-4 text-right">Actual</th>
                           <th className="px-6 py-4 text-right">Mismatch</th>
                           <th className="px-6 py-4 text-center">Condition</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                         {problematicItems.map((p, pIdx) => (
                           <tr key={pIdx} className="text-xs hover:bg-slate-50/50 transition-colors">
                             <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                             <td className="px-6 py-4 text-right font-mono">{p.plan}</td>
                             <td className="px-6 py-4 text-right font-mono font-black">{p.actual}</td>
                             <td className={`px-6 py-4 text-right font-mono font-black ${p.variance < 0 ? 'text-red-600' : 'text-slate-400'}`}>{p.variance.toFixed(2)}</td>
                             <td className="px-6 py-4 text-center"><ConditionBadge status={p.status} /></td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               );
           })}
        </div>
      </div>
    );
  };

  const renderSheetContent = (sheetName: string = activeSheet) => {
    if (sheetName === 'Executive Summary') {
      return (
        <div className="p-0 bg-white">
          {!report && !loading ? (
            <div className="py-32 text-center flex flex-col items-center no-print">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner text-green-700">📋</div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Audit Ready for Dispatch</h3>
              <p className="text-slate-400 max-w-sm mt-2 font-medium">Synchronize operational datasets to generate board-level intelligence on performance gaps.</p>
              <button onClick={handleGenerateReport} className="mt-8 bg-green-700 text-white px-12 py-4 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-green-100">Launch Master Audit</button>
            </div>
          ) : loading ? (
            <div className="p-20 space-y-6 no-print">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-slate-50 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-slate-100">
                <div className="p-8 border-r border-slate-100 bg-slate-50/30">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">GLOBAL HEALTH MONITOR</span>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={globalHealthData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>
                          {globalHealthData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Board Intelligence Brief</h4>
                   <p className="text-slate-700 leading-relaxed font-medium text-lg italic">{report?.executiveSummary}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row border-b border-slate-100">
                <div className="w-full md:w-64 bg-slate-50 p-8 border-r border-slate-100 shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">B1: PRIORITY TASKS</span>
                  <h4 className="text-sm font-black text-red-600 uppercase tracking-widest">Remediation</h4>
                </div>
                <div className="p-8 bg-red-50/10 w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {report?.actions.map((action, i) => (
                      <div key={i} className="bg-white border border-red-100 p-5 rounded-2xl shadow-sm flex gap-4 items-start">
                        <span className="w-6 h-6 rounded-lg bg-red-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{action}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    if (sheetName === 'Sales') return <div className="divide-y divide-slate-100">{renderGroupChart("Sales GAP", salesGroupChartData)}{renderGroupedSheet("Problematic Regional Sales Portfolios", MOCK_SALES_DETAILS)}</div>;
    if (sheetName === 'Export') return <div className="divide-y divide-slate-100">{renderGroupChart("Export Region GAPs", exportGroupChartData)}{renderGroupedSheet("Global Export Mismatches", MOCK_EXPORT_DETAILS)}</div>;
    if (sheetName === 'Finance') {
      const displayRows = MOCK_DATA.filter(d => d.department === 'Finance' && d.status !== 'on-track');
      return (
        <div className="divide-y divide-slate-100">
          {renderProfitLoss()}
          {renderDepartmentEfficiency()}
          <div className="bg-white">
            <div className="bg-slate-50 p-6 border-b border-slate-200 no-print"><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operational Mismatches (GAPs)</h4></div>
            {renderDepartmentAnalytics('Finance')}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <tr><th className="px-8 py-5">Metric</th><th className="px-8 py-5 text-right">Plan</th><th className="px-8 py-5 text-right">Actual</th><th className="px-8 py-5 text-right">Gap</th><th className="px-8 py-5 text-center">Status</th><th className="px-8 py-5">Analysis</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayRows.map((r, i) => (
                    <tr key={i} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-900">{r.metric}</td>
                      <td className="px-8 py-6 text-right font-mono text-slate-500">{r.plan.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right font-mono font-black text-slate-900">{r.actual.toLocaleString()}</td>
                      <td className={`px-8 py-6 text-right font-mono font-black ${r.variance < 0 ? 'text-red-600 bg-red-50/20' : 'text-slate-400'}`}>{r.variance.toLocaleString()}</td>
                      <td className="px-8 py-6 text-center"><ConditionBadge status={r.status} /></td>
                      <td className="px-8 py-6 text-xs text-slate-600 italic">{r.reasoning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    const displayRows = MOCK_DATA.filter(d => d.department === sheetName && d.status !== 'on-track');
    return (
      <div className="bg-white">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between no-print">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">{sheetName} Operational Gaps</h4>
          <div className="flex gap-2"><button onClick={handlePrint} className="text-[10px] font-black text-slate-500 uppercase bg-white px-6 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-all">Export PDF / Print</button></div>
        </div>
        {renderDepartmentAnalytics(sheetName)}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <tr><th className="px-8 py-5">Operational Metric</th><th className="px-8 py-5 text-right">Plan Target</th><th className="px-8 py-5 text-right">Actual Realized</th><th className="px-8 py-5 text-right">Mismatch</th><th className="px-8 py-5 text-center">Condition</th><th className="px-8 py-5">Contextual Analysis</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRows.map((r, i) => (
                <tr key={i} className="text-sm hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6 font-bold text-slate-900">{r.metric}</td>
                  <td className="px-8 py-6 text-right font-mono text-slate-500">{r.plan.toLocaleString()} {r.unit !== '%' ? r.unit : ''}</td>
                  <td className="px-8 py-6 text-right font-mono font-black text-slate-900">{r.actual.toLocaleString()} {r.unit !== '%' ? r.unit : ''}</td>
                  <td className={`px-8 py-6 text-right font-mono font-black ${r.variance < 0 ? 'text-red-600 bg-red-50/20' : 'text-slate-400'}`}>{r.variance.toLocaleString()}</td>
                  <td className="px-8 py-6 text-center"><ConditionBadge status={r.status} /></td>
                  <td className="px-8 py-6 text-xs text-slate-600 italic leading-relaxed">{r.reasoning}</td>
                </tr>
              ))}
              {displayRows.length === 0 && (<tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">Operations healthy. No mismatches found for this department.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl border border-slate-800 relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-16 h-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-red-900/40">⚠️</div>
          <div>
            <h2 className="text-white text-3xl font-black tracking-tighter uppercase">MISMATCH COMMAND <span className="text-red-500 font-bold ml-2">PRO</span></h2>
            <p className="text-slate-400 font-medium text-sm mt-1 italic opacity-80">Gaps Audit Center • SWISS Pharmaceuticals (Pvt) Ltd</p>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Live Server Time</p>
             <p className="text-xl font-black text-white font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          </div>
          <button onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1500); }} className="bg-red-600/10 hover:bg-red-600/20 text-red-500 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] backdrop-blur-md transition-all border border-red-500/20 shadow-lg active:scale-95" disabled={syncing}>
            {syncing ? 'SCANNING...' : 'LIVE SYNC'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        <StatusCard title="Revenue GAP" value="-4.0M" subtitle="Consolidated Deficit" icon="📉" color="red" />
        <StatusCard title="Critical Gaps" value={filteredMismatches.filter(m => m.status === 'critical').length.toString()} subtitle="Urgent Review" icon="🚨" color="red" />
        <StatusCard title="Warning Alerts" value={filteredMismatches.filter(m => m.status === 'warning').length.toString()} subtitle="Pending Remediation" icon="⚠️" color="red" />
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Automated Dispatch</p>
              <div className="flex items-center gap-2 mt-1">
                 <div className={`w-2 h-2 rounded-full ${isAutoDispatchOn ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                 <h4 className="text-lg font-black text-white">{isAutoDispatchOn ? 'ACTIVE @ 21:00' : 'SCHEDULE OFF'}</h4>
              </div>
           </div>
           <button onClick={handleToggleAutoDispatch} className={`mt-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isAutoDispatchOn ? 'bg-red-600/10 text-red-500 border-red-500/20' : 'bg-green-600 text-white border-green-700'}`}>
              {isAutoDispatchOn ? 'DISABLE SCHEDULE' : 'ENABLE SCHEDULE'}
           </button>
        </div>
      </div>

      {/* Main Terminal UI (Hidden during print) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px] no-print">
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div></div>
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-100/50 px-4 py-1.5 rounded-full">SWISS_GAP_AUDIT_v5.LIVE</div>
        </div>
        <div className="flex-1 overflow-hidden">{renderSheetContent()}</div>
        <div className="bg-slate-50 border-t border-slate-200 px-2 flex items-center h-14 overflow-x-auto scrollbar-thin">
           {sheets.map((sheet) => (
              <button key={sheet} onClick={() => setActiveSheet(sheet)} className={`h-full px-10 text-[11px] font-black transition-all whitespace-nowrap uppercase tracking-tighter ${activeSheet === sheet ? 'bg-white text-red-700 border-l border-r border-slate-200 shadow-[0_-4px_0_0_#dc2626]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}>
                 {sheet}
              </button>
           ))}
        </div>
      </div>

      {/* Comprehensive Print View (Visible only during print) */}
      <div className="print-only">
        <div className="text-center py-10 border-b-4 border-slate-900 mb-10">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">SWISS Pharmaceuticals (Pvt) Ltd</h1>
          <h2 className="text-2xl font-black text-slate-600 tracking-widest uppercase">Consolidated Operations Audit Report</h2>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Date of Issue: {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</p>
        </div>
        {sheets.map((sheet, index) => (
          <div key={sheet} className="print-page-break">
            <div className="bg-slate-900 text-white p-6 mb-6 flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-widest">{sheet} Report</h3>
              <span className="text-xs font-bold opacity-60">Section {index + 1} of {sheets.length}</span>
            </div>
            {renderSheetContent(sheet)}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-lg no-print gap-6">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-3xl shadow-sm border border-red-100">📤</div>
            <div>
               <p className="text-lg font-black text-slate-800 uppercase tracking-tight">Executive Briefing Terminal</p>
               <p className="text-sm text-slate-400 font-medium italic">
                 {isAutoDispatchOn 
                   ? `Automated 9:00 PM dispatch is active. Last sent: ${lastAutoDispatchDate || 'Never'}`
                   : 'Manual override available. Dispatch GAP ledger with executive board via WhatsApp.'
                 }
               </p>
            </div>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Export PDF (All Depts)</span>
              <span className="text-xl">📄</span>
            </button>
            <button onClick={shareViaWhatsApp} className="flex-1 md:flex-none bg-red-700 hover:bg-red-800 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-3">
              <span>Immediate Dispatch</span>
              <span className="text-xl">📲</span>
            </button>
         </div>
      </div>
    </div>
  );
};
