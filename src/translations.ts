export interface TranslationDictionary {
  [key: string]: {
    login: string;
    logout: string;
    username: string;
    password: string;
    role: string;
    sign_in: string;
    sign_in_subtitle: string;
    dashboard: string;
    assets: string;
    network: string;
    systems: string;
    maintenance: string;
    helpdesk: string;
    licenses: string;
    vendors: string;
    users: string;
    audit_logs: string;
    notifications: string;
    language: string;
    search: string;
    filter: string;
    actions: string;
    view: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    status: string;
    priority: string;
    date: string;
    assigned_to: string;
    created_by: string;
    all: string;
    // Specific Modules
    // Dashboard
    kpi_assets: string;
    kpi_tickets: string;
    kpi_devices: string;
    kpi_systems: string;
    overview: string;
    recent_activities: string;
    uptime_summary: string;
    // Assets
    asset_register: string;
    asset_transfer: string;
    asset_dispose: string;
    asset_name: string;
    asset_serial: string;
    asset_category: string;
    asset_location: string;
    asset_history: string;
    asset_tag: string;
    // Network
    device_name: string;
    device_ip: string;
    device_type: string;
    device_status: string;
    device_latency: string;
    device_location: string;
    // Systems
    system_name: string;
    system_owner: string;
    system_hosting: string;
    system_status: string;
    system_url: string;
    // Maintenance
    maint_schedule: string;
    maint_log: string;
    maint_type: string;
    maint_technician: string;
    maint_preventive: string;
    maint_corrective: string;
    maint_scheduled_date: string;
    // Helpdesk
    ticket_subject: string;
    ticket_submit: string;
    ticket_escalate: string;
    ticket_history: string;
    ticket_description: string;
    ticket_category: string;
    // Licenses
    lic_name: string;
    lic_key: string;
    lic_expiry: string;
    lic_alerts: string;
    lic_warranty: string;
    days_left: string;
    // Vendors
    vendor_name: string;
    vendor_contact: string;
    vendor_sla: string;
    contract_start: string;
    contract_end: string;
  };
}

export const translations: TranslationDictionary = {
  en: {
    login: "Login",
    logout: "Logout",
    username: "Username",
    password: "Password",
    role: "User Role",
    sign_in: "Sign In to SIIMS",
    sign_in_subtitle: "Access Oromia Science & Technology Authority Portal",
    dashboard: "Dashboard",
    assets: "Asset Inventory",
    network: "Network Infrastructure",
    systems: "Application Registry",
    maintenance: "Maintenance Hub",
    helpdesk: "Helpdesk & Tickets",
    licenses: "Licenses & Warranties",
    vendors: "Vendors & Contracts",
    users: "User Management",
    audit_logs: "Audit Logs",
    notifications: "Notifications",
    language: "Language",
    search: "Search...",
    filter: "Filter",
    actions: "Actions",
    view: "View Details",
    edit: "Edit",
    delete: "Delete",
    save: "Save Changes",
    cancel: "Cancel",
    status: "Status",
    priority: "Priority",
    date: "Date",
    assigned_to: "Assigned To",
    created_by: "Created By",
    all: "All",
    kpi_assets: "Total Assets",
    kpi_tickets: "Active Tickets",
    kpi_devices: "Online Devices",
    kpi_systems: "Software Systems",
    overview: "Analytics & KPI Overview",
    recent_activities: "Recent Activity Stream",
    uptime_summary: "Network Uptime Trend",
    asset_register: "Register New Asset",
    asset_transfer: "Transfer Asset",
    asset_dispose: "Dispose Asset",
    asset_name: "Asset Name",
    asset_serial: "Serial Number",
    asset_category: "Category",
    asset_location: "Location",
    asset_history: "Change History Log",
    asset_tag: "Asset Tag",
    device_name: "Device Name",
    device_ip: "IP Address",
    device_type: "Device Type",
    device_status: "Connectivity",
    device_latency: "Ping Latency",
    device_location: "Branch Office",
    system_name: "Application Name",
    system_owner: "Owner Department",
    system_hosting: "Hosting Infrastructure",
    system_status: "Operational Status",
    system_url: "System Link",
    maint_schedule: "Schedule Preventive",
    maint_log: "Log Corrective Work",
    maint_type: "Task Category",
    maint_technician: "Technician In-charge",
    maint_preventive: "Preventive",
    maint_corrective: "Corrective",
    maint_scheduled_date: "Scheduled Date",
    ticket_subject: "Ticket Subject",
    ticket_submit: "Submit Support Ticket",
    ticket_escalate: "Escalate Ticket",
    ticket_history: "Progress Checklist",
    ticket_description: "Issue Description",
    ticket_category: "Issue Category",
    lic_name: "Product License / Warranty",
    lic_key: "License Key / Serial",
    lic_expiry: "Expiration Date",
    lic_alerts: "Critical Alerts",
    lic_warranty: "Hardware Warranty",
    days_left: "Days Remaining",
    vendor_name: "Vendor Name",
    vendor_contact: "Contact Information",
    vendor_sla: "Active SLA Status",
    contract_start: "Start Date",
    contract_end: "End Date",
  },
  om: {
    login: "Seenaa",
    logout: "Ba'i",
    username: "Maqaa Fayyadamaa",
    password: "Fungurroo",
    role: "Gahee Fayyadamaa",
    sign_in: "Gara SIIMS Seeni",
    sign_in_subtitle: "Waajjira Saayinsii fi Teknoolojii Oromiyaa (WSTO)",
    dashboard: "Gabatee Hojii",
    assets: "Kuusa Qabeenyaa",
    network: "Dhaabbata Neetwarkiin",
    systems: "Galmee Hojiiwwan",
    maintenance: "Hordoffii Suphaa",
    helpdesk: "Tikeetii & Gargaarsa",
    licenses: "Eeyyama & Wabii",
    vendors: "Dhiyeessitoota & Waliigaltee",
    users: "Bulchiinsa Fayyadamtootaa",
    audit_logs: "Galmeewwan Oditii",
    notifications: "Beeksisa",
    language: "Afaan",
    search: "Barbaadi...",
    filter: "Calali",
    actions: "Gochaalee",
    view: "Bal'inaan Ilaali",
    edit: "Gulaami",
    delete: "Haqi",
    save: "Hojii Ol-kaayi",
    cancel: "Dhiisi",
    status: "Haala Hojii",
    priority: "Dursi",
    date: "Guyyaa",
    assigned_to: "Kan Kennameef",
    created_by: "Kan Uumame",
    all: "Hunda",
    kpi_assets: "Waliigala Qabeenyaa",
    kpi_tickets: "Tikeetii Hojii Irra Jiru",
    kpi_devices: "Meeshaalee Sarara Irra Jiran",
    kpi_systems: "Hojiiwwan Sooftiweerii",
    overview: "Xiinxala & Ibsa KPI",
    recent_activities: "Gochaalee Dhiyoo",
    uptime_summary: "Haala Yeroo Hojii Neetwaarkii",
    asset_register: "Qabeenya Haaraya Galmeessi",
    asset_transfer: "Qabeenya Dabarsi",
    asset_dispose: "Qabeenya Dhabamsiisi",
    asset_name: "Maqaa Qabeenyaa",
    asset_serial: "Lakkoofsa Addaa (Serial)",
    asset_category: "Gosa",
    asset_location: "Iddoo",
    asset_history: "Galmee Jijjiiramaa",
    asset_tag: "Taga Qabeenyaa",
    device_name: "Maqaa Meeshaa",
    device_ip: "Teessoo IP",
    device_type: "Gosa Meeshaa",
    device_status: "Hidhii Sararaa",
    device_latency: "Turti Sararaa",
    device_location: "Damee Waajjiraa",
    system_name: "Maqaa Sirnaa",
    system_owner: "Kutaa Abbaa Sirnaa",
    system_hosting: "Iddoo Teessoo (Hosting)",
    system_status: "Haala Hojii",
    system_url: "Liinkii Sirnaa",
    maint_schedule: "Suphaa Dursaa Qopheessi",
    maint_log: "Galmee Suphaa Sirreessaa",
    maint_type: "Gosa Hojii",
    maint_technician: "Teknikaa Hordofu",
    maint_preventive: "Kan Dursaa",
    maint_corrective: "Kan Sirreessaa",
    maint_scheduled_date: "Guyyaa Suphaa",
    ticket_subject: "Dhimma Tikeetii",
    ticket_submit: "Tikeetii Gargaarsaa Galmeessi",
    ticket_escalate: "Sadarkaa Tikeetii Ol-guddisi",
    ticket_history: "Hordoffii Adeemsa Hojii",
    ticket_description: "Ibsa Rakkichaa",
    ticket_category: "Gosa Rakkichaa",
    lic_name: "Eeyyama / Wabii Meeshaa",
    lic_key: "Fungurroo Eeyyamaa / Serial",
    lic_expiry: "Guyyaa Dhumaa",
    lic_alerts: "Akeekkachiisa Cimaa",
    lic_warranty: "Wabii Meeshaa Hardiweerii",
    days_left: "Guyyoota Hafan",
    vendor_name: "Maqaa Dhiyeessaa",
    vendor_contact: "Quunnamtii",
    vendor_sla: "Haala Waliigaltee SLA",
    contract_start: "Guyyaa Jalqabaa",
    contract_end: "Guyyaa Dhumaa",
  },
  am: {
    login: "ግባ",
    logout: "ውጣ",
    username: "የተጠቃሚ ስም",
    password: "የይለፍ ቃል",
    role: "የተጠቃሚ ሚና",
    sign_in: "ወደ SIIMS ይግቡ",
    sign_in_subtitle: "የኦሮሚያ ሳይንስና ቴክኖሎጂ ባለስልጣን ፖርታል",
    dashboard: "ዳሽቦርድ",
    assets: "የንብረት ክምችት",
    network: "የኔትወርክ መሰረተ ልማት",
    systems: "የሶፍትዌር መዝገብ",
    maintenance: "የጥገና ማዕከል",
    helpdesk: "የእገዛ ጠረጴዛ እና ቲኬቶች",
    licenses: "ፈቃዶች እና ዋስትናዎች",
    vendors: "አቅራቢዎችና ኮንትራቶች",
    users: "የተጠቃሚዎች አስተዳደር",
    audit_logs: "የኦዲት መዝገቦች",
    notifications: "ማሳወቂያዎች",
    language: "ቋንቋ",
    search: "ፈልግ...",
    filter: "አጣራ",
    actions: "ድርጊቶች",
    view: "ዝርዝር እይ",
    edit: "አስተካክል",
    delete: "ሰርዝ",
    save: "ለውጦችን አስቀምጥ",
    cancel: "ተው",
    status: "ሁኔታ",
    priority: "ቅድሚያ የሚሰጠው",
    date: "ቀን",
    assigned_to: "የተመደበለት ሰው",
    created_by: "የፈጠረው ሰው",
    all: "ሁሉም",
    kpi_assets: "አጠቃላይ ንብረቶች",
    kpi_tickets: "ገባሪ ቲኬቶች",
    kpi_devices: "በመስመር ላይ ያሉ መሣሪያዎች",
    kpi_systems: "የሶፍትዌር ስርዓቶች",
    overview: "ትንተና እና የKPI አጠቃላይ እይታ",
    recent_activities: "የቅርብ ጊዜ እንቅስቃሴዎች",
    uptime_summary: "የኔትወርክ የስራ ጊዜ አዝማሚያ",
    asset_register: "አዲስ ንብረት መዝግብ",
    asset_transfer: "ንብረት አስተላልፍ",
    asset_dispose: "ንብረትን አስወግድ",
    asset_name: "የንብረት ስም",
    asset_serial: "ሴሪያል ቁጥር",
    asset_category: "ምድብ",
    asset_location: "ቦታ",
    asset_history: "የለውጥ ታሪክ ምዝግብ",
    asset_tag: "የንብረት መለያ ታግ",
    device_name: "የመሣሪያ ስም",
    device_ip: "የአይፒ አድራሻ",
    device_type: "የመሣሪያ ዓይነት",
    device_status: "የግንኙነት ሁኔታ",
    device_latency: "የምላሽ መዘግየት",
    device_location: "የቅርንጫፍ ቢሮ",
    system_name: "የመተግበሪያ ስም",
    system_owner: "ባለቤት መምሪያ",
    system_hosting: "የማስተናገጃ መሰረተ ልማት",
    system_status: "የአሠራር ሁኔታ",
    system_url: "የስርዓት ሊንክ",
    maint_schedule: "ቅድመ ጥገና ያቅዱ",
    maint_log: "የማስተካከያ ጥገና መዝግብ",
    maint_type: "የስራ ምድብ",
    maint_technician: "ኃላፊነት ያለው ቴክኒሻን",
    maint_preventive: "የቅድመ ጥገና",
    maint_corrective: "የማስተካከያ ጥገና",
    maint_scheduled_date: "የታቀደለት ቀን",
    ticket_subject: "የቲኬቱ ርዕሰ ጉዳይ",
    ticket_submit: "የእገዛ ቲኬት አስገባ",
    ticket_escalate: "የቲኬቱን ደረጃ አሳድግ",
    ticket_history: "የሂደት ክትትል",
    ticket_description: "የችግሩ መግለጫ",
    ticket_category: "የችግሩ ምድብ",
    lic_name: "የምርት ፈቃድ / ዋስትና",
    lic_key: "የፈቃድ ቁልፍ / ሴሪያል",
    lic_expiry: "የማብቂያ ቀን",
    lic_alerts: "አስፈላጊ ማስጠንቀቂያዎች",
    lic_warranty: "የሃርድዌር ዋስትና",
    days_left: "የቀሩት ቀናት",
    vendor_name: "የአቅራቢው ስም",
    vendor_contact: "የእውቂያ መረጃ",
    vendor_sla: "የነቃ የSLA ሁኔታ",
    contract_start: "የመጀመሪያ ቀን",
    contract_end: "የማብቂያ ቀን",
  },
};
