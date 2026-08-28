export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface LandParcel {
  id: number;
  land_identity_id: string;
  state: string;
  district: string;
  anchal: string;
  halka: string;
  mauza: string;
  khata_no: string;
  khesra_no: string;
  area_acre: number;
  land_type: string;
  polygon_json?: string;
  owner_name?: string;
}

export interface KhatianRecord {
  owner_name: string;
  father_husband_name: string;
  caste: string;
  khata_no?: string;
  khesra_no?: string;
  recorded_area_acre: number;
  khatian_type: string;
  record_date: string;
}

export interface Register2Record {
  current_owner_name: string;
  volume_no: string;
  page_no: string;
  lagan_status: string;
  last_paid_year: string;
  recorded_area_acre: number;
  remarks: string;
}

export interface MutationRecord {
  application_no: string;
  applicant_name: string;
  buyer_name: string;
  seller_name: string;
  status: string;
  current_stage: string;
  submitted_at: string;
  updated_at: string;
  age_days: number;
  sla_days: number;
  remarks: string;
}

export interface TransactionRecord {
  deed_no: string;
  deed_type: string;
  seller_name: string;
  buyer_name: string;
  transacted_area_acre: number;
  consideration_amount_inr: number;
  registration_date: string;
  registration_office: string;
}

export interface CourtCaseRecord {
  case_no: string;
  court_name: string;
  case_type: string;
  petitioner: string;
  respondent: string;
  status: string;
  stay_order: number;
  filing_date: string;
  description: string;
}

export interface EncumbranceRecord {
  bank_institution: string;
  mortgage_type: string;
  loan_amount_inr: number;
  charge_status: string;
  registration_date: string;
}

export interface RiskFinding {
  rule_id: string;
  rule_name: string;
  severity: RiskLevel;
  score_contribution: number;
  title: string;
  description: string;
  evidence: Record<string, any>;
}

export interface RiskAnalysis {
  land_identity_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  findings_count: number;
  findings: RiskFinding[];
  status_summary: {
    khatian: RiskLevel;
    register2: RiskLevel;
    mutation: RiskLevel;
    transaction: RiskLevel;
    map: RiskLevel;
    court: RiskLevel;
    encumbrance: RiskLevel;
  };
}

export interface LandProfileResponse {
  parcel: LandParcel;
  records: {
    khatian?: KhatianRecord;
    register2?: Register2Record;
    mutations: MutationRecord[];
    transactions: TransactionRecord[];
    court_cases: CourtCaseRecord[];
    encumbrances: EncumbranceRecord[];
  };
  risk_analysis: RiskAnalysis;
  ai_explanation: string;
}

export interface OfficerCase {
  case_no: string;
  land_identity_id: string;
  district: string;
  anchal: string;
  mauza: string;
  khata_no: string;
  khesra_no: string;
  owner_name: string;
  risk_level: RiskLevel;
  risk_score: number;
  findings: RiskFinding[];
  evidence_sources: Record<string, any>;
}
