import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Eye, Settings, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplianceSectionProps {
  emptyDataMode?: boolean;
}

interface ComplianceTemplate {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  completedChecks: number;
  totalChecks: number;
  status: 'complete' | 'in-progress' | 'overdue' | 'not-started';
  dueDate?: string;
  lastUpdated?: string;
  isCustom?: boolean;
  customChecklist?: CustomChecklist;
}

interface CustomSection {
  id: string;
  title: string;
  items: CustomChecklistItem[];
  expanded: boolean;
}

interface CustomChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface CustomChecklist {
  [sectionId: string]: CustomChecklistItem[];
}

const ComplianceSection = ({ emptyDataMode = false }: ComplianceSectionProps) => {
  const [showManageTemplates, setShowManageTemplates] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [customTemplates, setCustomTemplates] = useState<ComplianceTemplate[]>([]);
  const [customSections, setCustomSections] = useState<{ [templateId: string]: CustomSection[] }>({});
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  
  const [templates, setTemplates] = useState<ComplianceTemplate[]>([
    {
      id: 'mor',
      title: 'Mandatory Occurrence Register (MOR)',
      description: 'Complete setup and implementation of building occurrence reporting system',
      enabled: false,
      completedChecks: 0,
      totalChecks: 24,
      status: 'not-started',
      dueDate: '2024-06-30'
    },
    {
      id: 'safety-case',
      title: 'Safety Case',
      description: 'Document demonstrating how building safety risks are managed',
      enabled: false,
      completedChecks: 0,
      totalChecks: 32,
      status: 'not-started',
      dueDate: '2024-09-01'
    },
    {
      id: 'fire-safety',
      title: 'Fire Safety Checks',
      description: 'Regular fire safety assessments and equipment checks',
      enabled: false,
      completedChecks: 0,
      totalChecks: 43,
      status: 'not-started',
      dueDate: '2024-07-30'
    },
    {
      id: 'resident-engagement',
      title: 'Resident Engagement Strategy',
      description: 'Plan for engaging residents in building safety matters',
      enabled: false,
      completedChecks: 0,
      totalChecks: 25,
      status: 'not-started',
      dueDate: '2024-10-01'
    },
    {
      id: 'complaints-procedure',
      title: 'Complaints Procedure for Safety Concerns',
      description: 'Process for handling resident safety complaints and concerns',
      enabled: false,
      completedChecks: 0,
      totalChecks: 29,
      status: 'not-started',
      dueDate: '2024-08-30'
    }
  ]);

  const [morChecklist, setMorChecklist] = useState({
    systemSetup: [
      { id: 'responsible-person', text: 'Designate a responsible person to maintain the MOR (e.g., Building Director or Safety Officer)', checked: false },
      { id: 'email-address', text: 'Create a dedicated email address for MOR reporting (e.g., mor@building.com)', checked: false },
      { id: 'dropbox-mailbox', text: 'Set up MOR dropbox/mailbox in the lobby or communal area', checked: false },
      { id: 'printable-forms', text: 'Create printable forms for residents/contractors to complete', checked: false },
      { id: 'contact-phone', text: 'Set up contact phone number for verbal reports (optional)', checked: false },
      { id: 'lobby-instructions', text: 'Post instructions in the lobby, elevators, or other communal spaces', checked: false },
      { id: 'resident-portal', text: 'Share instructions via resident portal, newsletter, or email', checked: false }
    ],
    reportingGuidelines: [
      { id: 'define-reporting', text: 'Define what must be reported (fire alarm activations, lift failures, safety defects, incidents, etc.)', checked: false },
      { id: 'online-instructions', text: 'Provide clear instructions for online/email form submission', checked: false },
      { id: 'physical-instructions', text: 'Provide clear instructions for physical form/dropbox submission', checked: false },
      { id: 'phone-instructions', text: 'Provide clear instructions for phone or in-person notification', checked: false },
      { id: 'urgency-guidance', text: 'Include guidance on urgency: which issues require immediate action vs. routine logging', checked: false }
    ],
    loggingDocumentation: [
      { id: 'central-log', text: 'Create a central MOR log (digital or paper)', checked: false },
      { id: 'date-time', text: 'Ensure log captures date and time of occurrence', checked: false },
      { id: 'reporter-details', text: 'Ensure log captures reporter details', checked: false },
      { id: 'incident-category', text: 'Ensure log captures category/type of incident', checked: false },
      { id: 'location-field', text: 'Ensure log captures location', checked: false },
      { id: 'description-field', text: 'Ensure log captures description of the incident', checked: false },
      { id: 'actions-taken', text: 'Ensure log captures actions taken', checked: false },
      { id: 'responsible-follow-up', text: 'Ensure log captures responsible person for follow-up', checked: false },
      { id: 'attachments', text: 'Ensure attachments can be added (photos, reports, emails)', checked: false },
      { id: 'backup-records', text: 'Keep a backup of all records (digital or physical) to comply with BAC requirements', checked: false }
    ],
    followUpResolution: [
      { id: 'assign-responsible', text: 'Assign responsible person for each MOR entry', checked: false },
      { id: 'due-dates', text: 'Set due dates for action and follow-up', checked: false },
      { id: 'update-resolution', text: 'Update the log when issues are resolved', checked: false },
      { id: 'escalate-critical', text: 'Escalate unresolved critical issues (e.g., fire risk) to external authorities if needed', checked: false }
    ],
    communicationTransparency: [
      { id: 'resident-summary', text: 'Share MOR summary or trends with residents periodically (e.g., newsletter, portal)', checked: false },
      { id: 'confidentiality', text: 'Maintain confidentiality where appropriate, but ensure transparency on safety-critical issues', checked: false },
      { id: 'reminder-signage', text: 'Use signage and communications to remind residents and contractors they can report incidents anytime', checked: false }
    ],
    periodicReview: [
      { id: 'regular-review', text: 'Review MOR entries regularly (monthly/quarterly) to identify trends', checked: false },
      { id: 'annual-audit', text: 'Audit the system annually to ensure reporting methods are still effective', checked: false },
      { id: 'feedback-adjustment', text: 'Adjust reporting channels, instructions, or forms based on resident and staff feedback', checked: false }
    ]
  });

  const [fireSafetyChecklist, setFireSafetyChecklist] = useState({
    fireRiskAssessment: [
      { id: 'annual-fra', text: 'Conduct a full Fire Risk Assessment (FRA) annually or after major building changes', checked: false },
      { id: 'review-fra', text: 'Review FRA after incidents, significant maintenance, or layout changes', checked: false },
      { id: 'record-findings', text: 'Record findings in the Golden Thread for BAC readiness', checked: false }
    ],
    fireAlarmDetection: [
      { id: 'test-alarms', text: 'Test fire alarms weekly (manual or automatic check)', checked: false },
      { id: 'annual-service', text: 'Carry out annual full system service by a certified engineer', checked: false },
      { id: 'check-detectors', text: 'Check that all detectors are operational and unobstructed', checked: false }
    ],
    emergencyLighting: [
      { id: 'monthly-test', text: 'Test emergency lighting monthly (visual check)', checked: false },
      { id: 'annual-functional', text: 'Conduct annual full functional test and replace faulty units', checked: false }
    ],
    fireDoorsCompartmentation: [
      { id: 'monthly-inspection', text: 'Inspect all fire doors monthly for proper closing, no damage, no obstructions', checked: false },
      { id: 'check-strips', text: 'Check intumescent strips, seals, and signage annually', checked: false },
      { id: 'maintain-records', text: 'Maintain records of repairs/replacements', checked: false }
    ],
    escapeRoutesSignage: [
      { id: 'weekly-routes', text: 'Inspect escape routes weekly for blockages and hazards', checked: false },
      { id: 'monthly-signs', text: 'Check exit signs and emergency lighting monthly', checked: false },
      { id: 'fire-doors-open', text: 'Ensure fire doors along escape routes are not wedged open', checked: false }
    ],
    firefightingEvacuationLifts: [
      { id: 'firefighting-flick', text: 'Firefighting lift: Perform flick test to confirm lift recalls and returns to fire service access level', checked: false },
      { id: 'firefighting-control', text: 'Firefighting lift: Confirm lift becomes controllable by fire service', checked: false },
      { id: 'evacuation-functionality', text: 'Evacuation lift: Check functionality for safe use during evacuations', checked: false },
      { id: 'record-tests', text: 'Record results of tests and any defects immediately', checked: false }
    ],
    fireSafetyEquipment: [
      { id: 'extinguishers-service', text: 'Inspect and service fire extinguishers annually', checked: false },
      { id: 'fire-blankets', text: 'Check fire blankets and other firefighting equipment quarterly', checked: false },
      { id: 'equipment-records', text: 'Keep records of service dates and deficiencies', checked: false }
    ],
    sprinklersSuppression: [
      { id: 'test-sprinklers', text: 'Test sprinkler systems according to manufacturer and regulatory guidance (often annually)', checked: false },
      { id: 'inspect-valves', text: 'Inspect control valves, pumps, and alarms quarterly', checked: false },
      { id: 'maintenance-activities', text: 'Record all maintenance activities', checked: false }
    ],
    staffResidentTraining: [
      { id: 'evacuation-drills', text: 'Conduct annual fire evacuation drills for residents', checked: false },
      { id: 'train-wardens', text: 'Train resident fire wardens annually, update as needed', checked: false },
      { id: 'educate-residents', text: 'Educate residents on proper use of extinguishers and alarm procedures', checked: false }
    ],
    smokingHazardsStorage: [
      { id: 'smoking-compliance', text: 'Monitor compliance with no-smoking policies', checked: false },
      { id: 'hazardous-materials', text: 'Check communal areas for hazardous materials or clutter monthly', checked: false },
      { id: 'storage-standards', text: 'Ensure storage rooms meet fire safety standards', checked: false }
    ],
    documentationReporting: [
      { id: 'digital-records', text: 'Maintain digital records of all inspections, tests, and maintenance', checked: false },
      { id: 'report-issues', text: 'Report issues promptly and assign responsibilities for remedial action', checked: false },
      { id: 'golden-thread', text: 'Link all records to Golden Thread for BAC compliance', checked: false }
    ]
  });

  const [safetyCaseChecklist, setSafetyCaseChecklist] = useState({
    purposeScope: [
      { id: 'define-objective', text: 'Define the objective of the Safety Case (demonstrate how building safety risks are identified, managed, and mitigated)', checked: false },
      { id: 'specify-coverage', text: 'Specify building coverage: all communal areas, flats, lifts, fire systems, structural elements, etc.', checked: false },
      { id: 'determine-audience', text: 'Determine audience: regulators (Building Safety Regulator), residents, board, managing agents', checked: false }
    ],
    appointResponsible: [
      { id: 'designate-owner', text: 'Designate a Safety Case Owner (typically Building Director or Safety Manager)', checked: false },
      { id: 'identify-contributors', text: 'Identify contributors: fire safety consultant, structural engineer, managing agent, facilities team', checked: false },
      { id: 'define-roles', text: 'Define roles for ongoing updates and review', checked: false }
    ],
    gatherEvidence: [
      { id: 'collect-documentation', text: 'Collect all relevant documentation: fire risk assessments, maintenance logs, inspection records, contractor reports, MOR entries', checked: false },
      { id: 'organise-files', text: 'Organise files in a digital folder structure or portal accessible to key stakeholders', checked: false },
      { id: 'version-control', text: 'Ensure version control and traceability for regulatory audits', checked: false }
    ],
    reportingMonitoring: [
      { id: 'establish-channels', text: 'Establish ongoing reporting channels (e.g., MOR, resident feedback, inspections)', checked: false },
      { id: 'assign-update-tasks', text: 'Assign tasks for regular updates to the Safety Case when changes occur', checked: false },
      { id: 'implement-dashboards', text: 'Implement dashboards to monitor compliance and risk metrics', checked: false }
    ],
    riskManagement: [
      { id: 'identify-hazards', text: 'Identify key safety hazards (fire, lifts, structural failures, evacuation)', checked: false },
      { id: 'assess-likelihood', text: 'Assess likelihood and severity for each hazard', checked: false },
      { id: 'define-controls', text: 'Define controls and mitigation measures for each risk', checked: false },
      { id: 'assign-monitoring', text: 'Assign responsible person for monitoring and maintaining each control', checked: false }
    ],
    safetyCaseContents: [
      { id: 'executive-summary', text: 'Executive Summary: overview of building, risks, and compliance approach', checked: false },
      { id: 'building-description', text: 'Building Description: height, number of flats, layout, and fire safety systems', checked: false },
      { id: 'roles-responsibilities', text: 'Roles & Responsibilities: Safety Case owner, fire wardens, contractors', checked: false },
      { id: 'risk-assessments', text: 'Risk Assessments & Controls: hazards, likelihood, severity, mitigation measures', checked: false },
      { id: 'fire-safety-systems', text: 'Fire Safety Systems & Maintenance: alarms, doors, lifts, sprinklers, extinguishers', checked: false },
      { id: 'occurrence-register', text: 'Mandatory Occurrence Register: log of all incidents affecting safety', checked: false },
      { id: 'resident-engagement', text: 'Resident Engagement Evidence: communications, training, drills, consultations', checked: false },
      { id: 'audit-records', text: 'Audit & Inspection Records: FRAs, lift tests, fire door inspections, emergency lighting', checked: false },
      { id: 'improvement-actions', text: 'Improvement Actions & Lessons Learned: updates following incidents or audits', checked: false },
      { id: 'references-documentation', text: 'References & Supporting Documentation: contractor reports, certificates, and legal compliance evidence', checked: false }
    ],
    reviewApproval: [
      { id: 'internal-review', text: 'Conduct internal review by Safety Case Owner and key stakeholders', checked: false },
      { id: 'update-correct', text: 'Update and correct any missing or incomplete sections', checked: false },
      { id: 'formal-approval', text: 'Obtain formal approval/sign-off from board or safety committee', checked: false }
    ],
    maintenanceUpdates: [
      { id: 'annual-review', text: 'Review and update Safety Case at least annually or after significant changes', checked: false },
      { id: 'change-log', text: 'Record all updates in change log (dates, changes, responsible person)', checked: false },
      { id: 'link-monitoring', text: 'Link ongoing monitoring (MOR, inspections, resident engagement) to Safety Case updates', checked: false }
    ]
  });

  const [residentEngagementChecklist, setResidentEngagementChecklist] = useState({
    communicationInformation: [
      { id: 'hrb-introduction', text: 'Provide residents with an introduction to HRB status and Building Safety Act requirements', checked: false },
      { id: 'regular-updates', text: 'Share regular updates on fire safety measures, maintenance works, and risk assessments', checked: false },
      { id: 'communication-channels', text: 'Set up dedicated communication channels (email, portal, WhatsApp, noticeboards)', checked: false },
      { id: 'faqs-guidance', text: 'Publish FAQs and guidance on resident responsibilities (smoking, storage, etc.)', checked: false }
    ],
    consultationFeedback: [
      { id: 'safety-consultations', text: 'Conduct consultations on safety decisions (fire doors, cladding, alarm systems)', checked: false },
      { id: 'resident-surveys', text: 'Distribute resident surveys to gather concerns and priorities', checked: false },
      { id: 'suggestion-boxes', text: 'Provide suggestion boxes or online feedback forms for continuous input', checked: false }
    ],
    safetyTrainingDrills: [
      { id: 'evacuation-drills', text: 'Schedule annual (or more frequent) fire evacuation drills', checked: false },
      { id: 'train-wardens', text: 'Train resident fire wardens or safety representatives', checked: false },
      { id: 'educate-equipment', text: 'Educate residents on fire safety equipment use (extinguishers, alarms, sprinklers)', checked: false }
    ],
    engagementParticipation: [
      { id: 'safety-committee', text: 'Establish a Resident Safety Committee or liaison group', checked: false },
      { id: 'workshops-sessions', text: 'Organize workshops or info sessions on HRB risks and compliance updates', checked: false },
      { id: 'volunteer-participation', text: 'Encourage volunteer participation in safety checks or communal area inspections', checked: false }
    ],
    transparencyReporting: [
      { id: 'safety-reports', text: 'Share regular reports on safety audits, risk assessments, and completed works', checked: false },
      { id: 'bac-updates', text: 'Provide updates on BAC (Building Assessment Certificate) readiness', checked: false },
      { id: 'incident-reports', text: 'Publish incident reports and lessons learned (without breaching privacy)', checked: false }
    ],
    technologyTools: [
      { id: 'online-portal', text: 'Enable online portal or app for reporting issues and receiving updates', checked: false },
      { id: 'alert-system', text: 'Set up SMS/email alerts for urgent safety notices', checked: false },
      { id: 'digital-access', text: 'Provide digital access to key documents (fire strategy, risk assessments, compliance certificates)', checked: false }
    ],
    behavioralCulture: [
      { id: 'safety-culture', text: 'Promote a safety-first culture among residents', checked: false },
      { id: 'recognize-participation', text: 'Recognize participation in safety programs (e.g., fire wardens)', checked: false },
      { id: 'escalation-process', text: 'Establish clear escalation process for non-compliance or breaches', checked: false }
    ],
    continuousMonitoring: [
      { id: 'effectiveness-review', text: 'Review engagement effectiveness periodically (feedback, surveys, participation rates)', checked: false },
      { id: 'adjust-methods', text: 'Adjust communication channels and methods based on resident preferences', checked: false },
      { id: 'benchmark-practices', text: 'Benchmark against other HRBs for best practices', checked: false }
    ]
  });

  const [complaintsProcedureChecklist, setComplaintsProcedureChecklist] = useState({
    purposeScope: [
      { id: 'define-objective', text: 'Define the objective: provide residents, staff, and contractors a clear way to raise safety concerns or complaints', checked: false },
      { id: 'specify-scope', text: 'Specify the scope: fire safety, lifts, structural hazards, escape routes, equipment failures, etc.', checked: false },
      { id: 'clarify-submitters', text: 'Clarify who can submit complaints (residents, contractors, staff, visitors)', checked: false }
    ],
    appointResponsible: [
      { id: 'designate-officer', text: 'Designate a Complaints Officer / Safety Officer to receive and manage complaints', checked: false },
      { id: 'secondary-contact', text: 'Identify a secondary contact for escalation if the first person is unavailable', checked: false },
      { id: 'assign-reviewers', text: 'Assign reviewers or investigators for each complaint based on category', checked: false }
    ],
    reportingChannels: [
      { id: 'email-address', text: 'Email address dedicated to safety complaints (e.g., safetyconcerns@building.com)', checked: false },
      { id: 'physical-dropbox', text: 'Physical dropbox or complaint form in the lobby or communal area', checked: false },
      { id: 'phone-option', text: 'Phone line or in-person reporting option for urgent matters', checked: false },
      { id: 'digital-portal', text: 'Resident portal or online form to submit complaints digitally', checked: false }
    ],
    submissionGuidelines: [
      { id: 'clear-instructions', text: 'Provide clear instructions on how to submit (email, form, phone, in-person)', checked: false },
      { id: 'information-required', text: 'Specify what information to include (date, location, description, evidence/photos)', checked: false },
      { id: 'urgency-levels', text: 'Indicate urgency levels (immediate danger vs. non-urgent concerns)', checked: false },
      { id: 'confidentiality-assurance', text: 'Assure residents their complaint will be confidential and taken seriously', checked: false }
    ],
    loggingDocumentation: [
      { id: 'central-log', text: 'Record all complaints in a central digital log with date received, reporter details, nature/category', checked: false },
      { id: 'location-assignment', text: 'Log location of issue, assigned responsible person, and status tracking', checked: false },
      { id: 'actions-taken', text: 'Document actions taken and attach supporting documents (photos, emails, reports)', checked: false },
      { id: 'regulatory-compliance', text: 'Maintain records for regulatory compliance (linked to Golden Thread for BAC)', checked: false }
    ],
    investigationResolution: [
      { id: 'assign-investigator', text: 'Assign responsible person to investigate each complaint', checked: false },
      { id: 'define-timeframes', text: 'Define timeframes for acknowledgment, investigation, and resolution', checked: false },
      { id: 'escalate-urgent', text: 'Escalate urgent safety complaints to external authorities if needed (e.g., Fire & Rescue Service)', checked: false },
      { id: 'document-findings', text: 'Document findings and actions taken in the log', checked: false },
      { id: 'notify-complainant', text: 'Notify the complainant of the outcome (while respecting confidentiality)', checked: false }
    ],
    communicationTransparency: [
      { id: 'publish-procedure', text: 'Publish the procedure in accessible locations: lobby, portal, newsletter', checked: false },
      { id: 'periodic-reminders', text: 'Remind residents periodically about how to report safety concerns', checked: false },
      { id: 'aggregate-trends', text: 'Aggregate trends or recurring complaints for transparency without breaching privacy', checked: false }
    ],
    reviewImprovement: [
      { id: 'review-complaints', text: 'Review complaints periodically to identify trends and systemic issues', checked: false },
      { id: 'update-procedure', text: 'Update the procedure, reporting channels, or instructions based on feedback', checked: false },
      { id: 'integrate-findings', text: 'Integrate findings into Safety Case updates, MOR, and resident engagement plans', checked: false }
    ]
  });

  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showMorModal, setShowMorModal] = useState(false);
  const [showSafetyCaseModal, setShowSafetyCaseModal] = useState(false);
  const [showFireSafetyModal, setShowFireSafetyModal] = useState(false);
  const [showResidentEngagementModal, setShowResidentEngagementModal] = useState(false);
  const [showComplaintsProcedureModal, setShowComplaintsProcedureModal] = useState(false);

  // Calculate total completed checks for MOR
  const getTotalMorCompleted = () => {
    return Object.values(morChecklist).flat().filter(item => item.checked).length;
  };

  // Calculate total completed checks for Safety Case
  const getTotalSafetyCaseCompleted = () => {
    return Object.values(safetyCaseChecklist).flat().filter(item => item.checked).length;
  };

  // Calculate total completed checks for Fire Safety
  const getTotalFireSafetyCompleted = () => {
    return Object.values(fireSafetyChecklist).flat().filter(item => item.checked).length;
  };

  // Calculate total completed checks for Resident Engagement
  const getTotalResidentEngagementCompleted = () => {
    return Object.values(residentEngagementChecklist).flat().filter(item => item.checked).length;
  };

  // Calculate total completed checks for Complaints Procedure
  const getTotalComplaintsProcedureCompleted = () => {
    return Object.values(complaintsProcedureChecklist).flat().filter(item => item.checked).length;
  };

  useEffect(() => {
    const completedMorChecks = getTotalMorCompleted();
    setTemplates(prev => prev.map(template => 
      template.id === 'mor' 
        ? { 
            ...template, 
            completedChecks: completedMorChecks,
            status: completedMorChecks === 0 ? 'not-started' : 
                   completedMorChecks === 24 ? 'complete' : 'in-progress',
            lastUpdated: new Date().toISOString()
          }
        : template
    ));
  }, [morChecklist]);

  useEffect(() => {
    const completedSafetyCaseChecks = getTotalSafetyCaseCompleted();
    setTemplates(prev => prev.map(template => 
      template.id === 'safety-case' 
        ? { 
            ...template, 
            completedChecks: completedSafetyCaseChecks,
            status: completedSafetyCaseChecks === 0 ? 'not-started' : 
                   completedSafetyCaseChecks === 32 ? 'complete' : 'in-progress',
            lastUpdated: new Date().toISOString()
          }
        : template
    ));
  }, [safetyCaseChecklist]);

  useEffect(() => {
    const completedFireSafetyChecks = getTotalFireSafetyCompleted();
    setTemplates(prev => prev.map(template => 
      template.id === 'fire-safety' 
        ? { 
            ...template, 
            completedChecks: completedFireSafetyChecks,
            status: completedFireSafetyChecks === 0 ? 'not-started' : 
                   completedFireSafetyChecks === 43 ? 'complete' : 'in-progress',
            lastUpdated: new Date().toISOString()
          }
        : template
    ));
  }, [fireSafetyChecklist]);

  useEffect(() => {
    const completedResidentEngagementChecks = getTotalResidentEngagementCompleted();
    setTemplates(prev => prev.map(template => 
      template.id === 'resident-engagement' 
        ? { 
            ...template, 
            completedChecks: completedResidentEngagementChecks,
            status: completedResidentEngagementChecks === 0 ? 'not-started' : 
                   completedResidentEngagementChecks === 25 ? 'complete' : 'in-progress',
            lastUpdated: new Date().toISOString()
          }
        : template
    ));
  }, [residentEngagementChecklist]);

  useEffect(() => {
    const completedComplaintsProcedureChecks = getTotalComplaintsProcedureCompleted();
    setTemplates(prev => prev.map(template => 
      template.id === 'complaints-procedure' 
        ? { 
            ...template, 
            completedChecks: completedComplaintsProcedureChecks,
            status: completedComplaintsProcedureChecks === 0 ? 'not-started' : 
                   completedComplaintsProcedureChecks === 29 ? 'complete' : 'in-progress',
            lastUpdated: new Date().toISOString()
          }
        : template
    ));
  }, [complaintsProcedureChecklist]);

  const toggleMorChecklistItem = (section: string, itemId: string) => {
    setMorChecklist(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const toggleSafetyCaseChecklistItem = (section: string, itemId: string) => {
    setSafetyCaseChecklist(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const toggleFireSafetyChecklistItem = (section: string, itemId: string) => {
    setFireSafetyChecklist(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const toggleResidentEngagementChecklistItem = (section: string, itemId: string) => {
    setResidentEngagementChecklist(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const toggleComplaintsProcedureChecklistItem = (section: string, itemId: string) => {
    setComplaintsProcedureChecklist(prev => ({
      ...prev,
      [section]: prev[section as keyof typeof prev].map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, enabled: !template.enabled }
        : template
    ));
    setCustomTemplates(prev => prev.map(template => 
      template.id === id 
        ? { ...template, enabled: !template.enabled }
        : template
    ));
  };

  const createCustomTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateDescription.trim()) return;
    
    const newTemplate: ComplianceTemplate = {
      id: `custom-${Date.now()}`,
      title: newTemplateName,
      description: newTemplateDescription,
      enabled: true,
      completedChecks: 0,
      totalChecks: 0,
      status: 'not-started',
      isCustom: true,
      customChecklist: {}
    };
    
    setCustomTemplates(prev => [newTemplate, ...prev]);
    setCustomSections(prev => ({ ...prev, [newTemplate.id]: [] }));
    setNewTemplateName('');
    setNewTemplateDescription('');
    setShowManageTemplates(false);
  };

  const addCustomSection = (templateId: string) => {
    if (!newSectionName.trim()) return;
    
    const newSection: CustomSection = {
      id: `section-${Date.now()}`,
      title: newSectionName,
      items: [],
      expanded: true
    };
    
    setCustomSections(prev => ({
      ...prev,
      [templateId]: [...(prev[templateId] || []), newSection]
    }));
    setNewSectionName('');
  };

  const addCustomItem = (templateId: string, sectionId: string) => {
    if (!newItemText.trim()) return;
    
    const newItem: CustomChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText,
      checked: false
    };
    
    setCustomSections(prev => ({
      ...prev,
      [templateId]: prev[templateId].map(section =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    }));
    
    // Update total checks for the template
    setCustomTemplates(prev => prev.map(template =>
      template.id === templateId
        ? { ...template, totalChecks: template.totalChecks + 1 }
        : template
    ));
    
    setNewItemText('');
    setEditingSectionId(null);
  };

  const toggleCustomItem = (templateId: string, sectionId: string, itemId: string) => {
    setCustomSections(prev => ({
      ...prev,
      [templateId]: prev[templateId].map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              )
            }
          : section
      )
    }));
    
    // Update completed checks for the template
    const sections = customSections[templateId] || [];
    let newCompletedChecks = 0;
    
    sections.forEach(section => {
      if (section.id === sectionId) {
        section.items.forEach(item => {
          if (item.id === itemId) {
            newCompletedChecks += !item.checked ? 1 : -1;
          } else if (item.checked) {
            newCompletedChecks += 1;
          }
        });
      } else {
        newCompletedChecks += section.items.filter(item => item.checked).length;
      }
    });
    
    setCustomTemplates(prev => prev.map(template =>
      template.id === templateId
        ? { 
            ...template, 
            completedChecks: Math.max(0, template.completedChecks + (customSections[templateId].find(s => s.id === sectionId)?.items.find(i => i.id === itemId)?.checked ? -1 : 1)),
            status: newCompletedChecks === template.totalChecks && template.totalChecks > 0 ? 'complete' : 
                   newCompletedChecks > 0 ? 'in-progress' : 'not-started'
          }
        : template
    ));
  };

  const toggleCustomSection = (templateId: string, sectionId: string) => {
    setCustomSections(prev => ({
      ...prev,
      [templateId]: prev[templateId].map(section =>
        section.id === sectionId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'not-started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return CheckCircle;
      case 'in-progress': return Clock;
      case 'overdue': return AlertTriangle;
      case 'not-started': return FileText;
      default: return FileText;
    }
  };

  if (emptyDataMode) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Compliance Templates Available
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Compliance templates help you manage building safety requirements and regulatory obligations. 
          Set up your first template to get started.
        </p>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Set Up Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Compliance Hub</h2>
          <p className="text-muted-foreground">Manage building safety compliance templates and checklists</p>
        </div>
        <Dialog open={showManageTemplates} onOpenChange={setShowManageTemplates}>
          <DialogTrigger asChild>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Custom Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Enter a brief description of what this template covers"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowManageTemplates(false)}>
                  Cancel
                </Button>
                <Button onClick={createCustomTemplate} disabled={!newTemplateName.trim() || !newTemplateDescription.trim()}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-4">
          {/* Custom Templates First */}
          {customTemplates.map((template) => {
            const StatusIcon = getStatusIcon(template.status);
            const progress = template.totalChecks > 0 ? (template.completedChecks / template.totalChecks) * 100 : 0;
            
            return (
              <Card key={template.id} className="border-purple-200 bg-purple-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={cn(
                        "h-5 w-5",
                        template.status === 'complete' && "text-green-600",
                        template.status === 'in-progress' && "text-purple-600",
                        template.status === 'overdue' && "text-red-600",
                        template.status === 'not-started' && "text-gray-500"
                      )} />
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-1">
                          Custom Template
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={template.enabled}
                        onCheckedChange={() => toggleTemplate(template.id)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
                  {template.enabled && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span>{template.completedChecks}/{template.totalChecks} completed</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardHeader>
                {template.enabled && (
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Checklist
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <StatusIcon className="h-5 w-5" />
                              {template.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {(customSections[template.id] || []).map((section) => (
                              <div key={section.id} className="border rounded-lg p-4">
                                <div 
                                  className="flex items-center justify-between cursor-pointer mb-3"
                                  onClick={() => toggleCustomSection(template.id, section.id)}
                                >
                                  <h4 className="font-semibold flex items-center gap-2">
                                    {section.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    {section.title}
                                  </h4>
                                  <span className="text-sm text-muted-foreground">
                                    {section.items.filter(item => item.checked).length}/{section.items.length}
                                  </span>
                                </div>
                                {section.expanded && (
                                  <div className="space-y-2">
                                    {section.items.map((item) => (
                                      <div key={item.id} className="flex items-start space-x-3">
                                        <Checkbox
                                          id={item.id}
                                          checked={item.checked}
                                          onCheckedChange={() => toggleCustomItem(template.id, section.id, item.id)}
                                          className="mt-1"
                                        />
                                        <Label htmlFor={item.id} className="text-sm leading-relaxed cursor-pointer">
                                          {item.text}
                                        </Label>
                                      </div>
                                    ))}
                                    {editingSectionId === section.id ? (
                                      <div className="flex gap-2 mt-3">
                                        <Input
                                          value={newItemText}
                                          onChange={(e) => setNewItemText(e.target.value)}
                                          placeholder="Enter checklist item"
                                          onKeyDown={(e) => e.key === 'Enter' && addCustomItem(template.id, section.id)}
                                        />
                                        <Button size="sm" onClick={() => addCustomItem(template.id, section.id)}>Add</Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingSectionId(null)}>Cancel</Button>
                                      </div>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="mt-3"
                                        onClick={() => setEditingSectionId(section.id)}
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Item
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                              <div className="flex gap-2">
                                <Input
                                  value={newSectionName}
                                  onChange={(e) => setNewSectionName(e.target.value)}
                                  placeholder="Enter section name (e.g., 'System Setup', 'Documentation')"
                                  onKeyDown={(e) => e.key === 'Enter' && addCustomSection(template.id)}
                                />
                                <Button onClick={() => addCustomSection(template.id)} disabled={!newSectionName.trim()}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Section
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
          
          {/* Standard Templates */}
          {templates.map((template) => {
            const StatusIcon = getStatusIcon(template.status);
            const progress = template.totalChecks > 0 ? (template.completedChecks / template.totalChecks) * 100 : 0;
            
            return (
              <Card key={template.id} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={cn(
                        "h-5 w-5",
                        template.status === 'complete' && "text-green-600",
                        template.status === 'in-progress' && "text-blue-600",
                        template.status === 'overdue' && "text-red-600",
                        template.status === 'not-started' && "text-gray-500"
                      )} />
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(template.status)}>
                        {template.status.replace('-', ' ')}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`template-${template.id}`} className="text-sm font-medium">
                          Active
                        </Label>
                        <Switch
                          id={`template-${template.id}`}
                          checked={template.enabled}
                          onCheckedChange={() => toggleTemplate(template.id)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {template.enabled && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {template.completedChecks}/{template.totalChecks} items completed
                        </span>
                      </div>
                      
                      <Progress value={progress} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="text-lg font-bold text-primary">{Math.round(progress)}% complete</span>
                        {template.dueDate && (
                          <span>Due: {new Date(template.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>

                      {template.lastUpdated && (
                        <Alert>
                          <AlertDescription className="text-sm">
                            Last updated: {new Date(template.lastUpdated).toLocaleString()}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex space-x-2">
                        {template.id === 'mor' ? (
                          <Dialog open={showMorModal} onOpenChange={setShowMorModal}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Checklist
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Mandatory Occurrence Register (MOR) Setup</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* System Setup Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('systemSetup')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('systemSetup') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      1. System Setup
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {morChecklist.systemSetup.filter(item => item.checked).length}/{morChecklist.systemSetup.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('systemSetup') && (
                                    <div className="space-y-3">
                                      {morChecklist.systemSetup.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleMorChecklistItem('systemSetup', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleMorChecklistItem('systemSetup', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Reporting Guidelines Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('reportingGuidelines')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('reportingGuidelines') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      2. Reporting Guidelines
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {morChecklist.reportingGuidelines.filter(item => item.checked).length}/{morChecklist.reportingGuidelines.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('reportingGuidelines') && (
                                    <div className="space-y-3">
                                      {morChecklist.reportingGuidelines.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleMorChecklistItem('reportingGuidelines', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleMorChecklistItem('reportingGuidelines', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Logging & Documentation Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('loggingDocumentation')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('loggingDocumentation') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      3. Logging & Documentation
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {morChecklist.loggingDocumentation.filter(item => item.checked).length}/{morChecklist.loggingDocumentation.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('loggingDocumentation') && (
                                    <div className="space-y-3">
                                      {morChecklist.loggingDocumentation.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleMorChecklistItem('loggingDocumentation', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleMorChecklistItem('loggingDocumentation', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Follow-Up & Resolution Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('followUpResolution')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('followUpResolution') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      4. Follow-Up & Resolution
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {morChecklist.followUpResolution.filter(item => item.checked).length}/{morChecklist.followUpResolution.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('followUpResolution') && (
                                    <div className="space-y-3">
                                      {morChecklist.followUpResolution.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleMorChecklistItem('followUpResolution', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleMorChecklistItem('followUpResolution', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Communication & Transparency Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('communicationTransparency')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('communicationTransparency') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      5. Communication & Transparency
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {morChecklist.communicationTransparency.filter(item => item.checked).length}/{morChecklist.communicationTransparency.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('communicationTransparency') && (
                                    <div className="space-y-3">
                                      {morChecklist.communicationTransparency.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleMorChecklistItem('communicationTransparency', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleMorChecklistItem('communicationTransparency', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Periodic Review Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('periodicReview')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('periodicReview') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      6. Periodic Review & Improvement
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {morChecklist.periodicReview.filter(item => item.checked).length}/{morChecklist.periodicReview.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('periodicReview') && (
                                    <div className="space-y-3">
                                      {morChecklist.periodicReview.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleMorChecklistItem('periodicReview', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleMorChecklistItem('periodicReview', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Overall Progress */}
                                <div className="border-t pt-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">Overall Progress</span>
                                    <span className="text-sm text-muted-foreground">
                                      {getTotalMorCompleted()}/24 items completed
                                    </span>
                                  </div>
                                  <Progress value={(getTotalMorCompleted() / 24) * 100} className="mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    {Math.round((getTotalMorCompleted() / 24) * 100)}% complete
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : template.id === 'safety-case' ? (
                          <Dialog open={showSafetyCaseModal} onOpenChange={setShowSafetyCaseModal}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Checklist
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Safety Case Template</DialogTitle>
                              </DialogHeader>
                              {/* Full Safety Case modal content would be here */}
                            </DialogContent>
                          </Dialog>
                        ) : template.id === 'fire-safety' ? (
                          <Dialog open={showFireSafetyModal} onOpenChange={setShowFireSafetyModal}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Checklist
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Fire Safety Checks</DialogTitle>
                              </DialogHeader>
                              {/* Full Fire Safety modal content would be here */}
                            </DialogContent>
                          </Dialog>
                        ) : template.id === 'resident-engagement' ? (
                          <Dialog open={showResidentEngagementModal} onOpenChange={setShowResidentEngagementModal}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Checklist
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Resident Engagement Strategy</DialogTitle>
                              </DialogHeader>
                              {/* Full Resident Engagement modal content would be here */}
                            </DialogContent>
                          </Dialog>
                        ) : template.id === 'complaints-procedure' ? (
                          <Dialog open={showComplaintsProcedureModal} onOpenChange={setShowComplaintsProcedureModal}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Eye className="h-4 w-4 mr-2" />
                                View Checklist
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Complaints Procedure for Safety Concerns</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Purpose & Scope Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('purposeScope')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('purposeScope') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      1. Purpose & Scope
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {complaintsProcedureChecklist.purposeScope.filter(item => item.checked).length}/{complaintsProcedureChecklist.purposeScope.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('purposeScope') && (
                                    <div className="space-y-3">
                                      {complaintsProcedureChecklist.purposeScope.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleComplaintsProcedureChecklistItem('purposeScope', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleComplaintsProcedureChecklistItem('purposeScope', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Appoint Responsible Parties Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('appointResponsible')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('appointResponsible') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      2. Appoint Responsible Parties
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {complaintsProcedureChecklist.appointResponsible.filter(item => item.checked).length}/{complaintsProcedureChecklist.appointResponsible.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('appointResponsible') && (
                                    <div className="space-y-3">
                                      {complaintsProcedureChecklist.appointResponsible.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleComplaintsProcedureChecklistItem('appointResponsible', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleComplaintsProcedureChecklistItem('appointResponsible', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Reporting Channels Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('reportingChannels')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('reportingChannels') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      3. Set Up Reporting Channels
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {complaintsProcedureChecklist.reportingChannels.filter(item => item.checked).length}/{complaintsProcedureChecklist.reportingChannels.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('reportingChannels') && (
                                    <div className="space-y-3">
                                      {complaintsProcedureChecklist.reportingChannels.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleComplaintsProcedureChecklistItem('reportingChannels', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleComplaintsProcedureChecklistItem('reportingChannels', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Submission Guidelines Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('submissionGuidelines')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('submissionGuidelines') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      4. Submission Guidelines
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {complaintsProcedureChecklist.submissionGuidelines.filter(item => item.checked).length}/{complaintsProcedureChecklist.submissionGuidelines.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('submissionGuidelines') && (
                                    <div className="space-y-3">
                                      {complaintsProcedureChecklist.submissionGuidelines.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleComplaintsProcedureChecklistItem('submissionGuidelines', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleComplaintsProcedureChecklistItem('submissionGuidelines', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Logging & Documentation Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('loggingDocumentation')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('loggingDocumentation') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      5. Logging & Documentation
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {complaintsProcedureChecklist.loggingDocumentation.filter(item => item.checked).length}/{complaintsProcedureChecklist.loggingDocumentation.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('loggingDocumentation') && (
                                    <div className="space-y-3">
                                      {complaintsProcedureChecklist.loggingDocumentation.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleComplaintsProcedureChecklistItem('loggingDocumentation', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleComplaintsProcedureChecklistItem('loggingDocumentation', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Investigation & Resolution Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('investigationResolution')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('investigationResolution') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      6. Investigation & Resolution
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {complaintsProcedureChecklist.investigationResolution.filter(item => item.checked).length}/{complaintsProcedureChecklist.investigationResolution.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('investigationResolution') && (
                                    <div className="space-y-3">
                                      {complaintsProcedureChecklist.investigationResolution.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleComplaintsProcedureChecklistItem('investigationResolution', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleComplaintsProcedureChecklistItem('investigationResolution', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Communication & Transparency Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('communicationTransparency')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('communicationTransparency') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      7. Communication & Transparency
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {complaintsProcedureChecklist.communicationTransparency.filter(item => item.checked).length}/{complaintsProcedureChecklist.communicationTransparency.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('communicationTransparency') && (
                                    <div className="space-y-3">
                                      {complaintsProcedureChecklist.communicationTransparency.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleComplaintsProcedureChecklistItem('communicationTransparency', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleComplaintsProcedureChecklistItem('communicationTransparency', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Review & Continuous Improvement Section */}
                                <div className="border rounded-lg p-4">
                                  <div 
                                    className="flex items-center justify-between cursor-pointer mb-3"
                                    onClick={() => toggleSection('reviewImprovement')}
                                  >
                                    <h3 className="text-lg font-semibold flex items-center">
                                      {expandedSections.includes('reviewImprovement') ? 
                                        <ChevronDown className="h-4 w-4 mr-2" /> : 
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                      }
                                      8. Review & Continuous Improvement
                                    </h3>
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {complaintsProcedureChecklist.reviewImprovement.filter(item => item.checked).length}/{complaintsProcedureChecklist.reviewImprovement.length}
                                    </Badge>
                                  </div>
                                  {expandedSections.includes('reviewImprovement') && (
                                    <div className="space-y-3">
                                      {complaintsProcedureChecklist.reviewImprovement.map((item) => (
                                        <div key={item.id} className="flex items-start space-x-3">
                                          <Checkbox
                                            checked={item.checked}
                                            onCheckedChange={() => toggleComplaintsProcedureChecklistItem('reviewImprovement', item.id)}
                                            className="mt-1"
                                          />
                                          <label className="text-sm cursor-pointer" onClick={() => toggleComplaintsProcedureChecklistItem('reviewImprovement', item.id)}>
                                            {item.text}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Overall Progress */}
                                <div className="border-t pt-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">Overall Progress</span>
                                    <span className="text-sm text-muted-foreground">
                                      {getTotalComplaintsProcedureCompleted()}/29 items completed
                                    </span>
                                  </div>
                                  <Progress value={(getTotalComplaintsProcedureCompleted() / 29) * 100} className="mb-2" />
                                  <p className="text-sm text-muted-foreground">
                                    {Math.round((getTotalComplaintsProcedureCompleted() / 29) * 100)}% complete
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Edit Checklist
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComplianceSection;
