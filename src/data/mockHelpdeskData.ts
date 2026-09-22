import { HelpdeskTask, SOPTemplate, CannedCommand, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr-tech-01',
  email: 'ethankrewu@gmail.com',
  name: 'Ethan Krewu',
  role: 'tier2',
  roleLabel: 'Tier 2 / SysAdmin',
  shift: 'Shift A (07:00 - 15:30 EST)',
};

export const SOP_TEMPLATES: SOPTemplate[] = [
  {
    id: 'sop-onboard',
    title: 'Employee Laptop Onboarding',
    category: 'Service Request',
    description: 'Standard procedure for staging, provisioning, and assigning employee workstations.',
    estimatedMinutes: 45,
    steps: [
      { id: 's1', label: 'Wipe disk', completed: true },
      { id: 's2', label: 'Install OS image', completed: true },
      { id: 's3', label: 'Join Active Directory', completed: false },
      { id: 's4', label: 'Assign asset tag', completed: false },
      { id: 's5', label: 'Deploy CrowdStrike Falcon & Intune profile', completed: false },
    ],
  },
  {
    id: 'sop-offboard',
    title: 'Emergency User Offboarding & Revocation',
    category: 'Security',
    description: 'Immediate access termination and cloud identity revocation for departing personnel.',
    estimatedMinutes: 20,
    steps: [
      { id: 'o1', label: 'Disable Entra ID / Active Directory account', completed: false },
      { id: 'o2', label: 'Revoke active Okta and Google Workspace SSO tokens', completed: false },
      { id: 'o3', label: 'Convert M365 mailbox to shared and retain license', completed: false },
      { id: 'o4', label: 'Initiate remote wipe for MDM-enrolled mobile devices', completed: false },
    ],
  },
  {
    id: 'sop-patch',
    title: 'Zero-Day Endpoint Patch Rollout',
    category: 'Maintenance',
    description: 'Emergency vulnerability remediation SOP for enterprise workstations.',
    estimatedMinutes: 60,
    steps: [
      { id: 'p1', label: 'Validate KB hash in staging sandbox', completed: false },
      { id: 'p2', label: 'Deploy patch rings 0 and 1 via Microsoft Intune', completed: false },
      { id: 'p3', label: 'Verify fleet restart compliance telemetry', completed: false },
      { id: 'p4', label: 'Log change management ticket update in Jira', completed: false },
    ],
  },
  {
    id: 'sop-vip-audio',
    title: 'Executive Boardroom A/V Verification',
    category: 'Incident',
    description: 'Rapid diagnostic workflow for Zoom Rooms, Crestron, and Dante audio networks.',
    estimatedMinutes: 15,
    steps: [
      { id: 'v1', label: 'Ping Crestron touchscreen controller & DSP unit', completed: false },
      { id: 'v2', label: 'Re-sync Dante Virtual Soundcard clock master', completed: false },
      { id: 'v3', label: 'Run loopback microphone level check', completed: false },
    ],
  },
];

// Helper to generate dynamic deadlines relative to now
const now = new Date();
const minutesFromNow = (mins: number) => new Date(now.getTime() + mins * 60 * 1000).toISOString();

export const INITIAL_TASKS: HelpdeskTask[] = [
  {
    id: 'task-1',
    ticketId: 'INC-4821',
    title: 'Identity service unavailable',
    description: 'Multiple users reporting 502 Bad Gateway during Okta SSO redirect to ERP portals.',
    priority: 'P1',
    category: 'Incident',
    status: 'in_progress',
    createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
    slaDeadline: minutesFromNow(10), // 10 minutes left (pulsing urgent red)
    targetResolutionMinutes: 30,
    assignedTo: 'Ethan Krewu',
    flaggedForHandover: true,
    sopId: 'sop-offboard',
    sopTitle: 'Security Incident Escalation',
    sopSteps: [
      { id: 'inc-1', label: 'Verify Okta trust federation cert', completed: true },
      { id: 'inc-2', label: 'Check AD FS / Entra Connect health agent', completed: true },
      { id: 'inc-3', label: 'Engage Identity SecOps war room', completed: false },
    ],
    notes: 'Escalated to Tier 3 Identity SecOps. Bridge line active.',
  },
  {
    id: 'task-2',
    ticketId: 'SR-3107',
    title: 'Prepare laptop for new starter',
    description: 'Hardware provisioning for incoming Senior VP of Engineering starting Thursday.',
    priority: 'P3',
    category: 'Service Request',
    status: 'in_progress',
    createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    slaDeadline: minutesFromNow(138), // 2h 18m left
    targetResolutionMinutes: 240,
    assignedTo: 'Ethan Krewu',
    flaggedForHandover: false,
    sopId: 'sop-onboard',
    sopTitle: 'Employee Laptop Onboarding',
    sopSteps: [
      { id: 's1', label: 'Wipe disk', completed: true },
      { id: 's2', label: 'Install OS image', completed: true },
      { id: 's3', label: 'Join Active Directory', completed: false },
      { id: 's4', label: 'Assign asset tag', completed: false },
    ],
  },
  {
    id: 'task-3',
    ticketId: 'INC-4830',
    title: 'VPN Gateway Tunnel Flapping (Dublin Hub)',
    description: 'High packet loss on redundant IPSec tunnel between AWS eu-west-1 and on-prem DC.',
    priority: 'P2',
    category: 'Incident',
    status: 'todo',
    createdAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
    slaDeadline: minutesFromNow(28), // 28 minutes left (warning amber)
    targetResolutionMinutes: 60,
    assignedTo: 'Ethan Krewu',
    flaggedForHandover: true,
    notes: 'ISP ticket opened: REF#882910. Secondary BGP route taking traffic.',
  },
  {
    id: 'task-4',
    ticketId: 'MN-1092',
    title: 'Emergency CrowdStrike Sensor Definition Update',
    description: 'Deploy hotfix channel update across 45 virtual engineering build agents.',
    priority: 'P2',
    category: 'Maintenance',
    status: 'in_progress',
    createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    slaDeadline: minutesFromNow(75),
    targetResolutionMinutes: 90,
    assignedTo: 'Ethan Krewu',
    flaggedForHandover: false,
    sopId: 'sop-patch',
    sopTitle: 'Zero-Day Endpoint Patch Rollout',
    sopSteps: [
      { id: 'p1', label: 'Validate KB hash in staging sandbox', completed: true },
      { id: 'p2', label: 'Deploy patch rings 0 and 1 via Microsoft Intune', completed: false },
      { id: 'p3', label: 'Verify fleet restart compliance telemetry', completed: false },
    ],
  },
  {
    id: 'task-5',
    ticketId: 'SR-3112',
    title: 'Provision AutoCAD license & VDI workstation',
    description: 'Contractor onboard request for Architecture team with dedicated GPU passthrough.',
    priority: 'P4',
    category: 'Service Request',
    status: 'todo',
    createdAt: new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
    slaDeadline: minutesFromNow(480), // 8 hours left
    targetResolutionMinutes: 600,
    assignedTo: 'Ethan Krewu',
    flaggedForHandover: false,
  },
  {
    id: 'task-6',
    ticketId: 'INC-4819',
    title: 'Finance Sharepoint Document Lock Glitch',
    description: 'Excel co-authoring session locked by phantom user session.',
    priority: 'P3',
    category: 'Incident',
    status: 'done',
    createdAt: new Date(now.getTime() - 180 * 60 * 1000).toISOString(),
    slaDeadline: minutesFromNow(-30),
    targetResolutionMinutes: 120,
    assignedTo: 'Ethan Krewu',
    flaggedForHandover: false,
    notes: 'Purged session lock in M365 Admin Center. Confirmed resolved with user.',
  },
];

export const CANNED_COMMANDS: CannedCommand[] = [
  {
    id: 'cmd-1',
    title: 'Flush DNS Resolver Cache',
    category: 'Network',
    command: 'ipconfig /flushdns',
    description: 'Clears cached DNS client lookups. Fixes hostname mismatch after DNS records update.',
    osBadge: 'Windows',
  },
  {
    id: 'cmd-2',
    title: 'Force Group Policy Update',
    category: 'Windows/AD',
    command: 'gpupdate /force',
    description: 'Immediately triggers Active Directory domain policy sync on the target workstation.',
    osBadge: 'Windows',
  },
  {
    id: 'cmd-3',
    title: 'Test Remote Port Connectivity',
    category: 'Network',
    command: 'Test-NetConnection -ComputerName server.domain.local -Port 443 -InformationLevel Detailed',
    description: 'PowerShell alternative to Telnet for checking socket connectivity and route diagnosis.',
    osBadge: 'PowerShell',
  },
  {
    id: 'cmd-4',
    title: 'DISM & System File Integrity Repair',
    category: 'Windows/AD',
    command: 'DISM.exe /Online /Cleanup-image /Restorehealth && sfc /scannow',
    description: 'Repairs corrupted Windows component store and restores validated system files.',
    osBadge: 'CMD / Admin',
  },
  {
    id: 'cmd-5',
    title: 'Query Active Directory User Details',
    category: 'Windows/AD',
    command: 'net user %USERNAME% /domain',
    description: 'Displays password age, group memberships, and logon workstation restrictions.',
    osBadge: 'Windows',
  },
  {
    id: 'cmd-6',
    title: 'Flush macOS DNS Cache',
    category: 'macOS/Linux',
    command: 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder',
    description: 'Flushes multicast DNS responder cache across modern macOS Sequoia and Sonoma.',
    osBadge: 'macOS',
  },
  {
    id: 'cmd-7',
    title: 'Investigate Active Listening Ports',
    category: 'macOS/Linux',
    command: 'sudo netstat -tulpn | grep LISTEN',
    description: 'Lists all processes binding to local network sockets on Linux servers.',
    osBadge: 'Linux',
  },
  {
    id: 'cmd-8',
    title: 'Ticket Escalation Note',
    category: 'Email Responses',
    command: `Hello [User],

Your ticket has been prioritized and escalated to our Senior Systems Engineering team for immediate investigation.
Ticket Reference: [TICKET_ID]
SLA Target: Within 1 Hour

We will follow up with direct telemetry findings as soon as diagnostics complete.
Best regards,
IT Service Desk Operations`,
    description: 'Professional template for updating users when escalating P1/P2 issues to Tier 2/3.',
    osBadge: 'Template',
  },
  {
    id: 'cmd-9',
    title: 'Resolution & User Sign-Off Email',
    category: 'Email Responses',
    command: `Hi [User],

We have resolved the reported issue regarding [ISSUE_SUMMARY]. Root cause was identified and remediated.
Please test your access and let us know if you experience any further anomalies.

If no further response is received within 24 hours, this ticket will automatically close.
Best regards,
IT Operations Team`,
    description: 'Standard service desk sign-off template requesting user confirmation.',
    osBadge: 'Template',
  },
];
