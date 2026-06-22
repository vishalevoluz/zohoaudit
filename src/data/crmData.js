// ─── CRM Audit Studio · Data Store ───────────────────────────────────────────

export const MODULES = [
  { id: 'leads',     name: 'Leads',           icon: 'users',        color: '#E1F5EE', textColor: '#085041', fields: 18, workflows: 4, functions: 6,  health: 'good',   issues: [] },
  { id: 'contacts',  name: 'Contacts',        icon: 'user',         color: '#E6F1FB', textColor: '#0C447C', fields: 22, workflows: 3, functions: 4,  health: 'review', issues: ['MD-008', 'MD-010'] },
  { id: 'deals',     name: 'Deals',           icon: 'coin',         color: '#FAEEDA', textColor: '#633806', fields: 16, workflows: 5, functions: 7,  health: 'issues', issues: ['MD-011', 'MD-012', 'MD-007', 'MD-009', 'MD-010'] },
  { id: 'accounts',  name: 'Accounts',        icon: 'building',     color: '#EEEDFE', textColor: '#3C3489', fields: 14, workflows: 2, functions: 3,  health: 'good',   issues: [] },
  { id: 'activities',name: 'Activities',      icon: 'calendar',     color: '#EAF3DE', textColor: '#3B6D11', fields: 9,  workflows: 1, functions: 1,  health: 'good',   issues: [] },
  { id: 'campaigns', name: 'Campaigns',       icon: 'speakerphone', color: '#FAECE7', textColor: '#993C1D', fields: 11, workflows: 2, functions: 2,  health: 'issues', issues: ['MD-014', 'MD-006', 'MD-007', 'MD-010'] },
  { id: 'support',   name: 'Support Tickets', icon: 'ticket',       color: '#FAEEDA', textColor: '#633806', fields: 13, workflows: 3, functions: 0,  health: 'good',   issues: [] },
  { id: 'products',  name: 'Products',        icon: 'package',      color: '#E6F1FB', textColor: '#0C447C', fields: 8,  workflows: 1, functions: 0,  health: 'good',   issues: [] },
];

export const WORKFLOWS = [
  { id: 'wf1',  name: 'Lead Scoring',        module: 'Leads',    trigger: 'Record Create', steps: 5, lastRun: 'May 15, 2026', status: 'inactive' },
  { id: 'wf2',  name: 'Deal Stage Notify',   module: 'Deals',    trigger: 'Field Change',  steps: 3, lastRun: 'Jun 3, 2026',  status: 'active' },
  { id: 'wf3',  name: 'Follow-up Reminder',  module: 'Contacts', trigger: 'Scheduled',     steps: 4, lastRun: 'Apr 20, 2026', status: 'inactive' },
  { id: 'wf4',  name: 'Onboarding Sequence', module: 'Accounts', trigger: 'Record Create', steps: 7, lastRun: 'Apr 1, 2026',  status: 'inactive' },
  { id: 'wf5',  name: 'Contract Renewal Alert', module: 'Deals', trigger: 'Date-based',   steps: 2, lastRun: 'Jun 2, 2026',  status: 'active' },
  { id: 'wf6',  name: 'Ticket Escalation',   module: 'Support',  trigger: 'Field Change',  steps: 4, lastRun: 'Jun 3, 2026',  status: 'active' },
  { id: 'wf7',  name: 'NPS Survey',          module: 'Contacts', trigger: 'Scheduled',     steps: 3, lastRun: 'Jun 1, 2026',  status: 'active' },
  { id: 'wf8',  name: 'New Draft Workflow',  module: 'Campaigns',trigger: '—',             steps: 1, lastRun: '—',            status: 'draft' },
];

export const WORKFLOW_STEPS = [
  { id: 1, label: 'New Lead Created', type: 'trigger' },
  { id: 2, label: 'Source = Website?', type: 'condition' },
  { id: 3, label: 'Set Score +20',    type: 'action' },
  { id: 4, label: 'Assign to SDR',    type: 'action' },
  { id: 5, label: 'Send Welcome Email', type: 'action' },
  { id: 6, label: 'End',              type: 'end' },
];

export const FIELDS = [
  { id: 'f1',  name: 'Deal Name',       module: 'Deals',    type: 'Text',     required: true,  documented: 'yes' },
  { id: 'f2',  name: 'Amount',          module: 'Deals',    type: 'Currency', required: true,  documented: 'yes' },
  { id: 'f3',  name: 'Close Date',      module: 'Deals',    type: 'Date',     required: true,  documented: 'yes' },
  { id: 'f4',  name: 'Deal Stage',      module: 'Deals',    type: 'Picklist', required: true,  documented: 'yes' },
  { id: 'f5',  name: 'Probability (%)', module: 'Deals',    type: 'Integer',  required: false, documented: 'yes' },
  { id: 'f6',  name: 'Contract Value',  module: 'Deals',    type: 'Currency', required: false, documented: 'partial' },
  { id: 'f7',  name: 'Lead Source',     module: 'Deals',    type: 'Picklist', required: false, documented: 'yes' },
  { id: 'f8',  name: 'Owner',           module: 'Deals',    type: 'Lookup',   required: true,  documented: 'yes' },
  { id: 'f9',  name: 'Custom_Field_1',  module: 'Deals',    type: 'Unknown',  required: false, documented: 'no' },
  { id: 'f10', name: 'CF_Revenue_Type', module: 'Deals',    type: 'Picklist', required: false, documented: 'no' },
  { id: 'f11', name: 'First Name',      module: 'Contacts', type: 'Text',     required: true,  documented: 'yes' },
  { id: 'f12', name: 'Email',           module: 'Contacts', type: 'Text',     required: true,  documented: 'yes' },
  { id: 'f13', name: 'Phone',           module: 'Contacts', type: 'Text',     required: false, documented: 'yes' },
];

export const FUNCTIONS = [
  { id: 'fn1', name: 'calcDealScore()',   module: 'Deals',    lang: 'Deluge', calledBy: 2, lastRun: 'Jun 3, 2026',  status: 'ok' },
  { id: 'fn2', name: 'sendSlackAlert()',  module: 'Leads',    lang: 'Deluge', calledBy: 3, lastRun: 'Jun 3, 2026',  status: 'ok' },
  { id: 'fn3', name: 'updateContractVal()',module:'Deals',    lang: 'Deluge', calledBy: 1, lastRun: 'May 30, 2026', status: 'error' },
  { id: 'fn4', name: 'syncToERP()',       module: 'Deals',    lang: 'API',    calledBy: 2, lastRun: 'May 15, 2026', status: 'error' },
  { id: 'fn5', name: 'assignRoundRobin()',module: 'Leads',    lang: 'Deluge', calledBy: 1, lastRun: 'Jun 2, 2026',  status: 'ok' },
  { id: 'fn6', name: 'legacyMigrate()',   module: 'Contacts', lang: 'Deluge', calledBy: 0, lastRun: 'Jan 10, 2026', status: 'unused' },
  { id: 'fn7', name: 'sendNPS()',         module: 'Contacts', lang: 'Deluge', calledBy: 1, lastRun: 'Jun 1, 2026',  status: 'ok' },
  { id: 'fn8', name: 'calcCommission()',  module: 'Deals',    lang: 'Deluge', calledBy: 0, lastRun: 'Mar 5, 2026',  status: 'unused' },
  { id: 'fn9', name: 'old_syncContacts()',module: 'Contacts', lang: 'Deluge', calledBy: 0, lastRun: 'Nov 2025',     status: 'unused' },
];

// Severity levels: critical · high · medium · low · info
export const AUDIT_ISSUES = [
  {
    id: 'a1', code: 'FN-013', severity: 'critical',
    title: 'updateContractVal() references a deleted field',
    desc: 'The function references "Old_Contract_Value" which was deleted on May 20, 2026. This breaks 1 workflow that depends on it.',
    meta: 'Deals · Functions',
    fixPrompt: 'Fix the updateContractVal function that references the deleted Old_Contract_Value field in Zoho CRM Deals module',
  },
  {
    id: 'a2', code: 'FN-011', severity: 'critical',
    title: 'syncToERP() API endpoint returning 401 Unauthorized',
    desc: 'The ERP sync function has an expired API key. Deals are not syncing to the ERP system. 2 workflows affected.',
    meta: 'Deals · Functions',
    fixPrompt: 'How do I update the API credentials for the syncToERP function in Zoho CRM?',
  },
  {
    id: 'a3', code: 'WF-003', severity: 'high',
    title: '3 workflows inactive for more than 30 days',
    desc: 'Lead Scoring, Follow-up Reminder, and Onboarding Sequence workflows haven\'t run in over 30 days.',
    meta: 'Leads, Contacts, Accounts · Workflows',
    fixPrompt: null,
  },
  {
    id: 'a4', code: 'FD-018', severity: 'medium',
    title: '31 fields missing documentation',
    desc: 'Fields across Deals, Contacts, and Campaigns modules have no description, owner, or data lineage documented.',
    meta: 'Multiple modules · Fields',
    fixPrompt: 'Generate documentation for all 31 undocumented CRM fields based on their names and module context',
  },
  {
    id: 'a5', code: 'FD-005', severity: 'low',
    title: '2 orphaned picklist options in Deal Stage',
    desc: '"Old Prospect" and "Trial" stage options exist but are not part of any workflow or automation rule.',
    meta: 'Deals · Options',
    fixPrompt: null,
  },
  {
    id: 'a6', code: 'FN-012', severity: 'low',
    title: '6 unused functions consuming resources',
    desc: 'Functions with zero workflow references and last run over 90 days ago. Candidates for archiving or deletion.',
    meta: 'Multiple modules · Functions',
    fixPrompt: null,
  },
  {
    id: 'a7', code: 'FD-003', severity: 'info',
    title: '3 duplicate field definitions found',
    desc: 'Fields "Phone" and "Mobile" in both Leads and Contacts modules have overlapping definitions.',
    meta: 'Leads, Contacts · Fields',
    fixPrompt: null,
  },
];

export const PICKLIST_DEAL_STAGE = [
  { label: 'Qualification',        value: 'Qualification',        prob: 20,  order: 1, status: 'active' },
  { label: 'Needs Analysis',       value: 'Needs_Analysis',       prob: 40,  order: 2, status: 'active' },
  { label: 'Value Proposition',    value: 'Value_Proposition',    prob: 60,  order: 3, status: 'active' },
  { label: 'Id. Decision Makers',  value: 'Id_Decision_Makers',   prob: 70,  order: 4, status: 'active' },
  { label: 'Closed Won',           value: 'Closed_Won',           prob: 100, order: 6, status: 'active' },
  { label: 'Closed Lost',          value: 'Closed_Lost',          prob: 0,   order: 7, status: 'active' },
  { label: 'Old Prospect',         value: 'Old_Prospect',         prob: null,order: null, status: 'orphaned' },
];

export const PICKLIST_LEAD_SOURCE = [
  { label: 'Website',         score: '+20', status: 'active' },
  { label: 'Cold Call',       score: '+5',  status: 'active' },
  { label: 'Partner Referral',score: '+30', status: 'active' },
  { label: 'Social Media',    score: '+15', status: 'active' },
  { label: 'Trade Show',      score: '+10', status: 'review' },
  { label: 'Trial',           score: '—',   status: 'orphaned' },
];

export const RECENT_CHANGES = [
  { change: 'Added field "Contract Value"',     module: 'Deals',    by: 'Priya S.', date: 'Jun 3, 2026',  status: 'applied' },
  { change: 'Modified lead scoring workflow',   module: 'Leads',    by: 'Raj K.',   date: 'Jun 2, 2026',  status: 'review' },
  { change: 'Deleted custom function',          module: 'Contacts', by: 'Admin',    date: 'Jun 1, 2026',  status: 'breaking' },
  { change: 'New module: Vendors',              module: '—',        by: 'Priya S.', date: 'May 30, 2026', status: 'applied' },
  { change: 'Updated picklist: Deal Stage',     module: 'Deals',    by: 'Raj K.',   date: 'May 29, 2026', status: 'applied' },
];

export const HEALTH_METRICS = [
  { label: 'Module coverage',     value: 88, color: 'green' },
  { label: 'Field documentation', value: 63, color: 'amber' },
  { label: 'Workflow validity',   value: 75, color: 'amber' },
  { label: 'Function health',     value: 48, color: 'red' },
  { label: 'Role permissions',    value: 91, color: 'green' },
];

// ── Workflow Issue Parameter Catalog (WF-001 – WF-018) ───────────────────────
// Evaluated during a workflow audit scan. Issues are raised when a parameter
// value is missing, invalid, or violates best-practice configuration rules.
export const WORKFLOW_ISSUE_PARAMS = [
  {
    code: 'WF-001', parameter: 'trigger_event', severity: 'critical', entity: 'Workflow',
    description: 'Trigger event is missing or set to null/undefined. Workflow will never fire.',
    resolution:  'Assign a valid trigger: record.create, record.update, record.delete, datetime, or scheduled.',
  },
  {
    code: 'WF-002', parameter: 'trigger_condition', severity: 'high', entity: 'Workflow',
    description: 'Condition block is empty or has conflicting criteria resulting in always-true evaluation.',
    resolution:  'Review condition logic; add field-level filters to prevent unintended mass execution.',
  },
  {
    code: 'WF-003', parameter: 'workflow_status', severity: 'high', entity: 'Workflow',
    description: 'Workflow is in Draft or Inactive state and will not execute in production.',
    resolution:  'Activate the workflow or document the reason for deactivation in audit notes.',
  },
  {
    code: 'WF-004', parameter: 'execution_count', severity: 'medium', entity: 'Workflow',
    description: 'Zero executions recorded in the last 90 days — possible dead workflow or broken trigger.',
    resolution:  'Verify the trigger event still exists in the CRM module; archive if obsolete.',
  },
  {
    code: 'WF-005', parameter: 'action_type', severity: 'critical', entity: 'Action',
    description: 'Action type is unrecognised or unsupported in the current CRM API version.',
    resolution:  'Update to a supported type: email, field_update, task, webhook, function, note.',
  },
  {
    code: 'WF-006', parameter: 'action_order', severity: 'high', entity: 'Action',
    description: 'Duplicate action order indices detected — execution sequence is ambiguous.',
    resolution:  'Re-index action_order values sequentially (1, 2, 3 …) with no gaps or duplicates.',
  },
  {
    code: 'WF-007', parameter: 'delay_value', severity: 'medium', entity: 'Action',
    description: 'Delay is set to 0 or a negative value, causing immediate or undefined execution timing.',
    resolution:  'Set a valid positive integer; use 0 only if immediate execution is intentional and documented.',
  },
  {
    code: 'WF-008', parameter: 'webhook_url', severity: 'critical', entity: 'Webhook',
    description: 'Webhook URL is empty, malformed, or points to a deprecated/unreachable endpoint.',
    resolution:  'Supply a valid HTTPS URL; test endpoint reachability before activation.',
  },
  {
    code: 'WF-009', parameter: 'field_update_value', severity: 'high', entity: 'Field Action',
    description: 'Field update action references a field that has been deleted or renamed.',
    resolution:  'Remap field_update_value to the correct current field API name.',
  },
  {
    code: 'WF-010', parameter: 'email_template_id', severity: 'high', entity: 'Email Action',
    description: 'Email template ID is null or references a deleted template.',
    resolution:  'Assign a valid, active email template ID or recreate the template.',
  },
  {
    code: 'WF-011', parameter: 'associated_module', severity: 'critical', entity: 'Workflow',
    description: 'Workflow is mapped to a module that no longer exists or has been renamed.',
    resolution:  'Update associated_module to the correct current module API name.',
  },
  {
    code: 'WF-012', parameter: 're_trigger_policy', severity: 'high', entity: 'Workflow',
    description: 'Re-trigger policy allows infinite re-trigger on field update — risks infinite loop execution.',
    resolution:  'Set re_trigger_policy to ONCE or add a loop-breaking condition field.',
  },
  {
    code: 'WF-013', parameter: 'scheduled_time', severity: 'medium', entity: 'Scheduled WF',
    description: 'Scheduled execution time is in the past with no recurrence rule defined.',
    resolution:  'Update scheduled_time to a future datetime or define a valid rrule recurrence.',
  },
  {
    code: 'WF-014', parameter: 'criteria_pattern', severity: 'high', entity: 'Workflow',
    description: "criteria_pattern references indices that don't match the criteria array length.",
    resolution:  "Synchronise criteria_pattern (e.g., '1 AND 2') with actual criteria count.",
  },
  {
    code: 'WF-015', parameter: 'notify_user_ids', severity: 'medium', entity: 'Notification',
    description: 'Notification user IDs include deactivated or deleted CRM users.',
    resolution:  'Replace deactivated user IDs with active users or CRM roles.',
  },
  {
    code: 'WF-016', parameter: 'custom_function_ref', severity: 'critical', entity: 'Function Action',
    description: 'Custom function reference in workflow action points to a non-existent or deleted function.',
    resolution:  'Restore or recreate the referenced function; update function_ref in the action payload.',
  },
  {
    code: 'WF-017', parameter: 'execution_time_window', severity: 'low', entity: 'Workflow',
    description: 'No execution time window configured — workflow can fire at any hour including off-hours.',
    resolution:  'Define time_window (start_time/end_time) to restrict execution to business hours if needed.',
  },
  {
    code: 'WF-018', parameter: 'workflow_description', severity: 'info', entity: 'Workflow',
    description: 'Workflow has no description — audit trail lacks context for future maintainers.',
    resolution:  'Add a description: purpose, owner, creation date, and last review date.',
  },
];

// ── Custom Function Issue Parameter Catalog (FN-001 – FN-018) ────────────────
// Evaluated for metadata correctness and static-analysis patterns in script body.
export const FUNCTION_ISSUE_PARAMS = [
  {
    code: 'FN-001', parameter: 'function_name', severity: 'critical', entity: 'Function',
    description: 'Function name is null, empty, or contains special characters invalid for API references.',
    resolution:  'Use alphanumeric + underscores only; max 50 characters. E.g., update_lead_score.',
  },
  {
    code: 'FN-002', parameter: 'language', severity: 'critical', entity: 'Function',
    description: 'Language field is missing or set to an unsupported scripting language.',
    resolution:  "Set to 'deluge' for Zoho-native functions or 'javascript' for serverless triggers.",
  },
  {
    code: 'FN-003', parameter: 'function_status', severity: 'high', entity: 'Function',
    description: 'Function is Inactive and cannot be invoked by workflows or API calls.',
    resolution:  'Activate the function or confirm intentional disablement and document in audit log.',
  },
  {
    code: 'FN-004', parameter: 'script_body', severity: 'critical', entity: 'Function',
    description: 'Script body is empty or contains only whitespace — function returns null on execution.',
    resolution:  'Provide valid Deluge/JavaScript logic; even a stub should return a meaningful response.',
  },
  {
    code: 'FN-005', parameter: 'return_type', severity: 'high', entity: 'Function',
    description: 'Declared return_type does not match the actual value returned by the function body.',
    resolution:  'Align return_type with script output: string, map, list, boolean, number.',
  },
  {
    code: 'FN-006', parameter: 'input_param_name', severity: 'high', entity: 'Parameter',
    description: 'Input parameter name is missing, duplicated, or contains spaces.',
    resolution:  'Use unique camelCase or snake_case names; no spaces allowed.',
  },
  {
    code: 'FN-007', parameter: 'input_param_type', severity: 'medium', entity: 'Parameter',
    description: "Parameter type is set to 'any' — reduces type safety and makes debugging harder.",
    resolution:  'Specify explicit types: string, number, boolean, map, list, date, datetime.',
  },
  {
    code: 'FN-008', parameter: 'input_param_default', severity: 'high', entity: 'Parameter',
    description: 'Mandatory parameter has no default value and no null-check in script body.',
    resolution:  "Add a default value or implement null-guard: if (param == null) { param = ''; }",
  },
  {
    code: 'FN-009', parameter: 'execution_timeout', severity: 'medium', entity: 'Function',
    description: 'No timeout configured — long-running functions can block Zoho execution threads.',
    resolution:  'Set execution_timeout; Zoho cap is 15 s for workflow functions, 60 s for scheduled.',
  },
  {
    code: 'FN-010', parameter: 'error_handling', severity: 'high', entity: 'Function',
    description: 'Script body has no try/catch — runtime errors will silently fail or crash the workflow.',
    resolution:  'Wrap critical logic in try/catch; log errors to a custom module or send admin alert.',
  },
  {
    code: 'FN-011', parameter: 'api_connection_name', severity: 'critical', entity: 'Connection',
    description: 'CRM/API connection referenced in script does not exist or has expired credentials.',
    resolution:  'Re-authorise the connection in Settings > Connections; update connection name in script.',
  },
  {
    code: 'FN-012', parameter: 'associated_workflow_id', severity: 'info', entity: 'Function',
    description: 'Function is not linked to any workflow, blueprint, or scheduler — orphaned asset.',
    resolution:  'Link function to a workflow action or schedule, or archive if no longer needed.',
  },
  {
    code: 'FN-013', parameter: 'deluge_syntax_error', severity: 'critical', entity: 'Function',
    description: 'Script body contains Deluge syntax errors detected during static analysis.',
    resolution:  'Open the function editor, resolve all highlighted syntax errors, and run a test execution.',
  },
  {
    code: 'FN-014', parameter: 'hardcoded_credentials', severity: 'critical', entity: 'Security',
    description: 'Script body contains hardcoded API keys, tokens, or passwords.',
    resolution:  'Move credentials to Zoho Vault or CRM Custom Variables; reference via getSecretValue().',
  },
  {
    code: 'FN-015', parameter: 'rate_limit_handling', severity: 'medium', entity: 'Function',
    description: 'Script calls an external API without retry logic or rate-limit back-off.',
    resolution:  'Implement exponential back-off; respect target API rate limits to avoid 429 errors.',
  },
  {
    code: 'FN-016', parameter: 'last_modified_date', severity: 'low', entity: 'Function',
    description: 'Function has not been reviewed or modified in over 365 days.',
    resolution:  'Schedule a quarterly review; verify against current CRM schema.',
  },
  {
    code: 'FN-017', parameter: 'test_coverage', severity: 'high', entity: 'Function',
    description: 'No test execution records found — function has never been tested in staging or production.',
    resolution:  'Execute with sample payloads in sandbox; log pass/fail results in audit comments.',
  },
  {
    code: 'FN-018', parameter: 'function_description', severity: 'info', entity: 'Function',
    description: 'Function has no description or changelog — purpose and change history are undocumented.',
    resolution:  'Add a header comment block: purpose, author, version, parameters, return value, last changed.',
  },
];

// ── Field Configuration Issue Parameter Catalog (FD-001 – FD-018) ────────────
// Evaluated for data quality, form usability, reporting accuracy, and security.
export const FIELD_ISSUE_PARAMS = [
  {
    code: 'FD-001', parameter: 'field_api_name', severity: 'critical', entity: 'Field',
    description: 'Field API name contains spaces, uppercase characters, or special symbols.',
    resolution:  'Use lowercase snake_case only. Rename and update all references in workflows/functions.',
  },
  {
    code: 'FD-002', parameter: 'field_type', severity: 'critical', entity: 'Field',
    description: 'Field type is missing or set to an unsupported/deprecated data type.',
    resolution:  'Set to a supported type: text, number, date, datetime, picklist, lookup, boolean, etc.',
  },
  {
    code: 'FD-003', parameter: 'field_label', severity: 'high', entity: 'Field',
    description: 'Field label is empty or a duplicate of another field in the same module.',
    resolution:  'Assign a unique, human-readable label for every field.',
  },
  {
    code: 'FD-004', parameter: 'mandatory_field', severity: 'high', entity: 'Field',
    description: 'Field is marked mandatory but has no default value and no workflow to auto-populate it.',
    resolution:  'Add a default value or create a workflow to auto-fill the field on record creation.',
  },
  {
    code: 'FD-005', parameter: 'picklist_values', severity: 'high', entity: 'Field',
    description: 'Picklist field has fewer than 2 options or contains duplicate values.',
    resolution:  'Define at least 2 distinct picklist values; remove duplicates.',
  },
  {
    code: 'FD-006', parameter: 'lookup_module', severity: 'critical', entity: 'Lookup Field',
    description: 'Lookup field references a module that has been deleted or is currently disabled.',
    resolution:  'Update the lookup field to reference a valid, active module or remove the field.',
  },
  {
    code: 'FD-007', parameter: 'field_length', severity: 'medium', entity: 'Field',
    description: 'Text field max_length is set to 0 or exceeds the Zoho CRM limit of 2000 characters.',
    resolution:  'Set max_length between 1 and 2000; use multi-line text type for longer content.',
  },
  {
    code: 'FD-008', parameter: 'formula_expression', severity: 'critical', entity: 'Formula Field',
    description: 'Formula field expression references a deleted field or contains a division-by-zero risk.',
    resolution:  'Update formula to reference valid fields; add IFNULL or conditional guards.',
  },
  {
    code: 'FD-009', parameter: 'currency_decimal', severity: 'medium', entity: 'Currency Field',
    description: "Currency field decimal_places is not set, defaulting to 0 — causes rounding errors in reports.",
    resolution:  "Set decimal_places to 2 (or the organisation's standard precision).",
  },
  {
    code: 'FD-010', parameter: 'field_permissions', severity: 'high', entity: 'Field',
    description: 'Field is hidden for all profiles — no user can view or edit the field\'s data.',
    resolution:  'Grant at least read access to one active profile, or remove the field if unused.',
  },
  {
    code: 'FD-011', parameter: 'auto_number_prefix', severity: 'low', entity: 'Auto-Number',
    description: 'Auto-number field has no prefix defined — generated values are indistinguishable across modules.',
    resolution:  "Set a unique prefix per module (e.g., 'ORD-' for Orders, 'TICK-' for Tickets).",
  },
  {
    code: 'FD-012', parameter: 'date_default_value', severity: 'medium', entity: 'Date Field',
    description: 'Date field default is set to a hardcoded past date rather than a dynamic expression.',
    resolution:  'Use dynamic defaults: {today} for today, {now} for current datetime.',
  },
  {
    code: 'FD-013', parameter: 'orphan_field', severity: 'low', entity: 'Field',
    description: 'Field is not included in any layout, list view, search layout, or report — functionally inaccessible.',
    resolution:  'Add the field to at least one layout or list view, or remove it to reduce clutter.',
  },
  {
    code: 'FD-014', parameter: 'encrypted_field_usage', severity: 'critical', entity: 'Security Field',
    description: 'Sensitive field (SSN, PAN, bank account) is not marked as encrypted.',
    resolution:  'Enable field-level encryption in field settings and notify the compliance team.',
  },
  {
    code: 'FD-015', parameter: 'conditional_field_rule', severity: 'medium', entity: 'Field',
    description: 'Conditional field show/hide rule references a deleted or renamed controlling field.',
    resolution:  'Update the conditional rule to reference the correct active controlling field.',
  },
  {
    code: 'FD-016', parameter: 'field_history_tracking', severity: 'high', entity: 'Field',
    description: 'History tracking is not enabled on critical audit fields (e.g., Stage, Amount, Owner).',
    resolution:  'Enable field history tracking for fields that must be auditable per compliance policy.',
  },
  {
    code: 'FD-017', parameter: 'rollup_summary_field', severity: 'critical', entity: 'Rollup Field',
    description: 'Rollup summary field aggregates data from a child module that has since been deleted.',
    resolution:  'Remove or rebuild the rollup field to target a valid, existing child module.',
  },
  {
    code: 'FD-018', parameter: 'field_description', severity: 'info', entity: 'Field',
    description: "Field has no description or tooltip text — data entry expectations are unclear to users.",
    resolution:  "Add a description or tooltip explaining the field's purpose and expected format.",
  },
];

// ── Module Configuration Issue Parameter Catalog (MD-001 – MD-015) ───────────
// Module-level issues affect structural integrity and cascade into workflows,
// functions, and reports if left unresolved.
export const MODULE_ISSUE_PARAMS = [
  {
    code: 'MD-001', parameter: 'module_name', severity: 'critical', entity: 'Module',
    description: 'Module API name contains spaces, special characters, or reserved Zoho keywords.',
    resolution:  "Rename using alphanumeric + underscores; avoid Zoho reserved names like 'Contacts', 'Leads'.",
  },
  {
    code: 'MD-002', parameter: 'module_status', severity: 'high', entity: 'Module',
    description: 'Module is disabled but still referenced in active workflows or functions.',
    resolution:  'Enable the module or update all referencing workflows/functions to use the correct module.',
  },
  {
    code: 'MD-003', parameter: 'singular_label', severity: 'medium', entity: 'Module',
    description: 'Singular label is missing or identical to the plural label causing UI display errors.',
    resolution:  "Set a distinct singular_label (e.g., 'Lead') and plural_label (e.g., 'Leads').",
  },
  {
    code: 'MD-004', parameter: 'field_count', severity: 'low', entity: 'Module',
    description: 'Module has no custom fields defined — may be a placeholder or misconfigured entity.',
    resolution:  'Add required custom fields or archive the module if it was created in error.',
  },
  {
    code: 'MD-005', parameter: 'profile_access', severity: 'critical', entity: 'Module',
    description: 'No CRM profile has been granted access to the module — no user can view or edit records.',
    resolution:  'Assign the module to at least one active CRM profile with appropriate permissions.',
  },
  {
    code: 'MD-006', parameter: 'related_list_config', severity: 'high', entity: 'Module',
    description: 'Related list references a deleted or renamed module causing broken relationship panels.',
    resolution:  'Update the related list configuration to point to the correct current module API name.',
  },
  {
    code: 'MD-007', parameter: 'search_layout', severity: 'medium', entity: 'Module',
    description: 'Search layout is empty — users cannot find records in global search.',
    resolution:  'Add at least 2–3 key fields (e.g., Name, Email, Phone) to the search layout.',
  },
  {
    code: 'MD-008', parameter: 'list_view_fields', severity: 'low', entity: 'Module',
    description: 'Default list view has fewer than 3 fields — provides insufficient context in list screens.',
    resolution:  'Configure a default list view with 4–6 meaningful fields for the module.',
  },
  {
    code: 'MD-009', parameter: 'kanban_field', severity: 'medium', entity: 'Module',
    description: 'Kanban field referenced in board view no longer exists or is of an unsupported type.',
    resolution:  'Update kanban_field to an active picklist or status field in the module.',
  },
  {
    code: 'MD-010', parameter: 'module_description', severity: 'info', entity: 'Module',
    description: 'Module has no description — purpose and ownership are undocumented.',
    resolution:  'Add a module description: business purpose, data owner, and creation date.',
  },
  {
    code: 'MD-011', parameter: 'duplicate_check_fields', severity: 'high', entity: 'Module',
    description: 'Duplicate check configuration has no fields defined — duplicate records will not be detected.',
    resolution:  'Define at least 1–2 key fields (e.g., Email, Phone) for duplicate detection.',
  },
  {
    code: 'MD-012', parameter: 'audit_trail_enabled', severity: 'high', entity: 'Module',
    description: 'Audit trail is disabled for a module containing sensitive business data.',
    resolution:  'Enable audit trail logging for modules containing PII, financial, or compliance data.',
  },
  {
    code: 'MD-013', parameter: 'territory_mapping', severity: 'medium', entity: 'Module',
    description: 'Territory rules reference deleted or inactive territories causing assignment failures.',
    resolution:  'Update territory mapping rules to reference only active, valid territory IDs.',
  },
  {
    code: 'MD-014', parameter: 'webform_module_link', severity: 'high', entity: 'Module',
    description: "A web form is mapped to this module but the module's required fields have changed.",
    resolution:  'Review web form field mappings and update to match current module required fields.',
  },
  {
    code: 'MD-015', parameter: 'record_count_threshold', severity: 'low', entity: 'Module',
    description: 'Module record count exceeds 1M without archiving or data segmentation strategy in place.',
    resolution:  'Implement data archiving policy or segment data across sub-modules to maintain performance.',
  },
];

export const ROLES = ['Admin', 'Sales Manager', 'SDR', 'Support', 'Read-only'];
export const ROLE_MATRIX = [
  { module: 'Leads',     perms: ['full', 'full', 'edit', 'view', 'view'] },
  { module: 'Deals',     perms: ['full', 'full', 'edit', 'view', 'view'] },
  { module: 'Contacts',  perms: ['full', 'full', 'edit', 'edit', 'view'] },
  { module: 'Accounts',  perms: ['full', 'full', 'view', 'view', 'view'] },
  { module: 'Functions', perms: ['full', 'view', 'none', 'none', 'none'] },
  { module: 'Workflows', perms: ['full', 'edit', 'none', 'none', 'none'] },
];
