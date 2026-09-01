import { CitizenReport, CitizenMyReports, CitizenNearbyReports, CitizenConfirmFix, CitizenMyVoice } from './CitizenSections.jsx';
import { ContractorRegister, ContractorJobs, ContractorAssignments, ContractorProof, ContractorEarnings } from './ContractorSections.jsx';
import {
  OfficialOverview, OfficialAgent, OfficialDispatch, OfficialPressure, OfficialPrevention, OfficialLedger,
} from './OfficialSections.jsx';

// role.sectionId -> view component. Keys mirror SECTIONS in config/nav.js.
export const SECTION_COMPONENTS = {
  citizen: {
    'report': CitizenReport,
    'my-reports': CitizenMyReports,
    'nearby': CitizenNearbyReports,
    'confirm': CitizenConfirmFix,
    'voice': CitizenMyVoice,
  },
  contractor: {
    'register': ContractorRegister,
    'jobs': ContractorJobs,
    'assignments': ContractorAssignments,
    'proof': ContractorProof,
    'earnings': ContractorEarnings,
  },
  official: {
    'overview': OfficialOverview,
    'agent': OfficialAgent,
    'dispatch': OfficialDispatch,
    'pressure': OfficialPressure,
    'prevention': OfficialPrevention,
    'ledger': OfficialLedger,
  },
};

export const sectionComponent = (role, sectionId) => SECTION_COMPONENTS[role]?.[sectionId] || null;
