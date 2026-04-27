import { useState } from "react"; // eslint-disable-line

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const PALETTE = ["#C8A96E", "#7BBFAE", "#B8849A", "#8AA4C8", "#B8C88A", "#E08A6A", "#A78BCC", "#6AC8C8", "#CC9A7B", "#7BA8CC", "#C8C87B", "#CC7BA8", "#8ACC8A", "#CCB07B", "#7BBBC8"];
const SECTIONS = ["1. CAD REVIEW", "2. MODELLING — 3DS MAX", "3. UE5 IMPORT & QC", "4. INTERIOR — UE5", "5. FOLIAGE", "6. NIGHT LIGHTING", "7. OUTER CITY & NEARBY LOCATIONS", "8. INTEGRATION — UE5 DEV", "9. LOOK DEVELOPMENT", "10. TESTING & DEPLOYMENT"];
const CAD_AREAS = ["Landscape Plan", "Hardscape Plan", "Hardscape Elevation", "Floor Plan", "Master Floor Plan", "Site Plan", "Reflected Ceiling Plan", "Sectional Drawings", "Facade Elevation", "Unit Layout Plan", "Terrace / Rooftop Plan", "Basement / Parking Plan"];
const STATUS = {
    "Not Started": { bg: "#f1f1f5", text: "#888", dot: "#bbb", border: "#e0e0e8" },
    "In Progress": { bg: "#e8f4ff", text: "#3a86c8", dot: "#3a86c8", border: "#b8d8f8" },
    "Review": { bg: "#fffbea", text: "#b07a10", dot: "#C8A96E", border: "#f0d98a" },
    "Done": { bg: "#eafaf1", text: "#2a8a50", dot: "#4caf7d", border: "#a8e6c0" },
    "Blocked": { bg: "#fff0f0", text: "#c84040", dot: "#e06060", border: "#f8c0c0" },
};
const STATUS_KEYS = Object.keys(STATUS);
const PRIORITY = { "High": { color: "#e06060" }, "Medium": { color: "#C8A96E" }, "Low": { color: "#5aabcc" } };
const CAD_STATUS_FLOW = ["Awaiting from Client", "Received", "In Use", "Issue — Missing/Incomplete"];
const CAD_STATUS_STYLE = {
    "Awaiting from Client": { color: "#b07a10", bg: "#fffbea", border: "#f0d98a" },
    "Received": { color: "#2a8a50", bg: "#eafaf1", border: "#a8e6c0" },
    "In Use": { color: "#3a86c8", bg: "#e8f4ff", border: "#b8d8f8" },
    "Issue — Missing/Incomplete": { color: "#c84040", bg: "#fff0f0", border: "#f8c0c0" },
};
const CLIENT_SUGGESTIONS = ["Emaar", "Sobha", "Prestige", "Brigade", "Godrej", "DLF", "Lodha", "Shapoorji", "Tata Housing", "Mahindra Lifespaces"];
const TYPE_OPTIONS = ["Residential", "Commercial", "Mixed-Use", "Villa", "Township", "Hospitality", "Retail"];
const STATUS_OPTIONS = ["Active", "On Hold", "Completed", "Archived"];
const ROLES = ["3D Artist", "UE5 Artist", "Interior Artist", "Foliage Artist", "Night Lighting Artist", "Outer City Artist", "UE5 Developer", "Project Lead", "CAD Analyst", "Look Dev Artist"];

function uid() { return Math.random().toString(36).substr(2, 9); }
function parseDateSafe(str) { const d = new Date(str); return isNaN(d) ? new Date() : d; }
function daysBetween(a, b) { return Math.round((parseDateSafe(b) - parseDateSafe(a)) / 86400000); }
function formatDate(str) { return parseDateSafe(str).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }); }
function addDays(dateStr, days) { const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
const TODAY_STR = new Date().toISOString().slice(0, 10);

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
    bg: "#f7f7fb", surface: "#ffffff", surface2: "#f2f2f7", border: "#e4e4ec", border2: "#ececf4",
    text: "#1a1a2e", text2: "#555570", text3: "#9090a8", text4: "#b8b8cc",
    accent: "#5a6af0", shadow: "0 1px 4px rgba(0,0,0,0.07)", shadowMd: "0 4px 16px rgba(0,0,0,0.09)",
};

// ─── SHARED UI ───────────────────────────────────────────────────────────────
const inputStyle = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontSize: 12, fontFamily: "inherit", padding: "7px 10px", outline: "none", width: "100%", boxSizing: "border-box", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" };
function bS(v, accent) {
    const base = { display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 6, fontSize: 11, fontFamily: "inherit", cursor: "pointer", border: "1px solid", whiteSpace: "nowrap", fontWeight: 500 };
    const a = accent || T.accent;
    if (v === "primary") return { ...base, background: `${a}12`, color: a, borderColor: `${a}44` };
    if (v === "ghost") return { ...base, background: "none", color: T.text2, borderColor: T.border };
    if (v === "danger") return { ...base, background: "#fff0f0", color: "#c84040", borderColor: "#f8c0c0" };
    if (v === "solid") return { ...base, background: a, color: "#fff", borderColor: a, boxShadow: `0 2px 8px ${a}44` };
    return base;
}
function Dot({ color, size = 6 }) { return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />; }
function Avatar({ name, color, size = 26, role }) {
    return <div title={role || name} style={{ width: size, height: size, borderRadius: "50%", background: `${color}20`, border: `1.5px solid ${color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, color, fontWeight: 700, flexShrink: 0 }}>{name[0].toUpperCase()}</div>;
}
function Pill({ label, color, bg }) { return <span style={{ background: bg || `${color}14`, color, border: `1px solid ${color}33`, borderRadius: 20, padding: "2px 8px", fontSize: 9, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>; }
function ProgressBar({ pct, color, height = 3 }) { const c = color || T.accent; return <div style={{ height, background: T.border2, borderRadius: height, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: c, borderRadius: height, transition: "width .35s" }} /></div>; }
function Field({ label, children }) { return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 9, color: T.text3, letterSpacing: "0.1em", fontWeight: 600 }}>{label.toUpperCase()}</span>{children}</div>; }
function Overlay({ children, onClose }) { return <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(80,80,120,0.18)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", maxHeight: "90vh", overflowY: "auto", width: "100%", maxWidth: 500, boxShadow: T.shadowMd }}>{children}</div></div>; }
function ModalHead({ title, sub, onClose }) { return <div style={{ padding: "17px 22px 13px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: T.surface2 }}><div>{sub && <div style={{ fontSize: 9, color: T.accent, letterSpacing: "0.15em", marginBottom: 3, fontWeight: 700 }}>{sub.toUpperCase()}</div>}<div style={{ fontSize: 16, color: T.text, fontWeight: 600 }}>{title}</div></div><button onClick={onClose} style={{ background: "none", border: "none", color: T.text3, cursor: "pointer", padding: 4, borderRadius: 5 }}>✕</button></div>; }

// ─── ICONS ───────────────────────────────────────────────────────────────────
const I = {
    plus: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    edit: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    trash: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
    save: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    back: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
    grid: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    list: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    search: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    team: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    folder: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
    warn: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    flag: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>,
    check: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>,
    home: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    board: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    gantt: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="15" y2="6" /><line x1="3" y1="12" x2="20" y2="12" /><line x1="3" y1="18" x2="11" y2="18" /></svg>,
    cad: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    avail: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    mail: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
};

// ─── SEED DATA ───────────────────────────────────────────────────────────────
function seedTasks(start) {
    const s = start || "2026-04-22";
    const phases = [
        { section: "1. CAD REVIEW", tasks: [["Receive & Catalogue CAD Files", 1, "High", "Log all received files from client"], ["CAD Review & Missing File Highlight", 2, "High", "Flag missing or incomplete drawings"], ["Client Sign-off on CAD Completeness", 1, "High", "Confirmation before modelling begins"]] },
        { section: "2. MODELLING — 3DS MAX", tasks: [["Import CAD into 3Ds Max", 1, "High", ""], ["Base Mesh Modelling", 8, "High", "Facade, structure, hardscape, rooftop"], ["Basic Material Assignment", 2, "Medium", "Placeholder materials for UE5 handoff"], ["Export to UE5 (FBX/Datasmith)", 1, "High", ""]] },
        { section: "3. UE5 IMPORT & QC", tasks: [["Import Assets into UE5", 2, "High", ""], ["Material Application in UE5", 4, "High", "Apply actual PBR materials"], ["QC & Modelling Issue Review", 2, "High", "UE5 artist flags issues back to 3D artist"], ["Modelling Fixes & Re-export", 2, "Medium", "3D artist fixes and re-sends"], ["Final Asset Sign-off in UE5", 1, "High", ""]] },
        { section: "4. INTERIOR — UE5", tasks: [["Interior Layout & Furniture Placement", 5, "High", "Furniture, props, décor aesthetic"], ["Interior Texturing & Materials", 4, "High", ""], ["Interior Lighting (Lumen)", 4, "High", "Lumen GI, rect lights, IES profiles"], ["Interior Camera Sequences", 2, "Medium", "Sequencer cuts for interior walkthrough"]] },
        { section: "5. FOLIAGE", parallel: true, tasks: [["Tree, Shrub & Ground Cover Assets", 4, "Medium", ""], ["Foliage Scatter & Placement in UE5", 3, "Medium", ""]] },
        { section: "6. NIGHT LIGHTING", parallel: true, tasks: [["Exterior Night Lighting Setup", 3, "Medium", "Façade lighting, pathway, pool area"], ["Emissive & Accent Light Pass", 2, "Low", ""]] },
        { section: "7. OUTER CITY & NEARBY LOCATIONS", parallel: true, tasks: [["Outer City Context Scene", 5, "Medium", "City backdrop around the project"], ["Nearby Landmarks & Client POIs", 3, "Medium", "Locations client wants to showcase"]] },
        { section: "8. INTEGRATION — UE5 DEV", tasks: [["Day / Night Simulation", 3, "High", ""], ["Weather Simulation", 3, "High", ""], ["Floor Slice View & Floor Selection", 4, "High", ""], ["POIs for Amenities", 3, "High", "Interactive points of interest"], ["Other Interactive Logic", 3, "Medium", "Unit selection, info panels, navigation"]] },
        { section: "9. LOOK DEVELOPMENT", tasks: [["Overall Visual Tone & Grading", 3, "High", "Post process volume, colour grading"], ["Sky & Atmosphere Fine-tuning", 2, "Medium", ""], ["Final Render / Screenshot Pass", 2, "Medium", ""]] },
        { section: "10. TESTING & DEPLOYMENT", tasks: [["Internal QA & Bug Testing", 3, "High", ""], ["Client Review & Feedback Round", 2, "High", ""], ["Bug Fixes Post Client Review", 2, "High", ""], ["Package & Deploy to Client Computer", 1, "High", ""]] },
    ];
    const result = []; let cursor = s, p4s = s, p4e = s;
    phases.forEach((phase, idx) => {
        const ps = phase.parallel ? p4s : cursor; let ts = ps;
        phase.tasks.forEach(([task, manDays, priority, notes]) => { const te = addDays(ts, manDays - 1); result.push({ id: uid(), section: phase.section, task, artist: "Unassigned", manDays, daysUsed: 0, status: "Not Started", priority, startDate: ts, endDate: te, notes }); ts = addDays(te, 1); });
        const pe = ts;
        if (idx === 3) { p4s = ps; p4e = pe; }
        if (!phase.parallel) cursor = pe;
        if (idx === 6) cursor = p4e > cursor ? p4e : cursor;
    });
    return result;
}
function seedCAD() { return []; }

// ─── GLOBAL TEAM ──────────────────────────────────────────────────────────────
const INITIAL_GLOBAL_TEAM = [
    { id: uid(), name: "Shri", color: "#C8A96E", role: "Project Lead", email: "shri@3dimmersive.com", availability: "Available", projects: ["Ekaanta"] },
    { id: uid(), name: "Bharath", color: "#7BBFAE", role: "3D Artist", email: "bharath@3dimmersive.com", availability: "Available", projects: ["Ekaanta"] },
    { id: uid(), name: "Dain", color: "#B8849A", role: "Foliage Artist", email: "dain@3dimmersive.com", availability: "Available", projects: ["Ekaanta"] },
    { id: uid(), name: "Sharan", color: "#8AA4C8", role: "UE5 Artist", email: "sharan@3dimmersive.com", availability: "Available", projects: ["Ekaanta"] },
    { id: uid(), name: "Manju", color: "#B8C88A", role: "Interior Artist", email: "manju@3dimmersive.com", availability: "Available", projects: ["Ekaanta"] },
];

function makeProject({ name, client, type, color, startDate, endDate, status = "Active", description = "" }) {
    const teamColors = { Shri: "#C8A96E", Bharath: "#7BBFAE", Dain: "#B8849A", Sharan: "#8AA4C8", Manju: "#B8C88A", Unassigned: "#bbb" };
    return { id: uid(), name, client, type, color, startDate, endDate, status, description, createdAt: TODAY_STR, team: ["Shri", "Bharath", "Dain", "Sharan", "Manju"], teamColors, tasks: seedTasks(startDate), cad: seedCAD() };
}

function makeDemoProject() {
    const p = makeProject({ name: "Ekaanta", client: "Emaar", type: "Residential", color: "#C8A96E", startDate: "2026-04-22", endDate: "2026-07-06", description: "Luxury residential tower visualization" });
    const statusMap = { "Receive & Catalogue CAD Files": { status: "Done", daysUsed: 1 }, "CAD Review & Missing File Highlight": { status: "Done", daysUsed: 2 }, "Client Sign-off on CAD Completeness": { status: "Done", daysUsed: 1 }, "Import CAD into 3Ds Max": { status: "Done", daysUsed: 1 }, "Base Mesh Modelling": { status: "In Progress", daysUsed: 5 }, "Modelling Fixes & Re-export": { status: "Blocked", daysUsed: 0, notes: "Waiting on revised CAD from client for Tower B" } };
    const artistMap = { "Receive & Catalogue CAD Files": "Shri", "CAD Review & Missing File Highlight": "Shri", "Client Sign-off on CAD Completeness": "Shri", "Import CAD into 3Ds Max": "Bharath", "Base Mesh Modelling": "Bharath", "Basic Material Assignment": "Dain", "Export to UE5 (FBX/Datasmith)": "Dain", "Import Assets into UE5": "Sharan", "Material Application in UE5": "Sharan", "QC & Modelling Issue Review": "Sharan", "Modelling Fixes & Re-export": "Bharath", "Final Asset Sign-off in UE5": "Sharan", "Interior Layout & Furniture Placement": "Manju", "Interior Texturing & Materials": "Manju", "Tree, Shrub & Ground Cover Assets": "Dain", "Foliage Scatter & Placement in UE5": "Dain", "Exterior Night Lighting Setup": "Shri", "Outer City Context Scene": "Bharath", "Nearby Landmarks & Client POIs": "Bharath" };
    p.tasks = p.tasks.map(t => ({ ...t, artist: artistMap[t.task] || t.artist, status: statusMap[t.task]?.status || t.status, daysUsed: statusMap[t.task]?.daysUsed ?? t.daysUsed, notes: statusMap[t.task]?.notes || t.notes }));
    p.cad = [{ id: uid(), area: "Landscape Plan", status: "Received", assignee: "Shri", notes: "", lastUpdated: "2026-04-23" }, { id: uid(), area: "Hardscape Plan", status: "Received", assignee: "Shri", notes: "", lastUpdated: "2026-04-23" }, { id: uid(), area: "Hardscape Elevation", status: "Received", assignee: "Bharath", notes: "", lastUpdated: "2026-04-24" }, { id: uid(), area: "Floor Plan", status: "In Use", assignee: "Bharath", notes: "Imported into 3Ds Max", lastUpdated: "2026-04-25" }, { id: uid(), area: "Master Floor Plan", status: "In Use", assignee: "Bharath", notes: "", lastUpdated: "2026-04-25" }, { id: uid(), area: "Facade Elevation", status: "Issue — Missing/Incomplete", assignee: "Shri", notes: "Tower B elevation missing", lastUpdated: "2026-04-26" }, { id: uid(), area: "Site Plan", status: "Awaiting from Client", assignee: "Unassigned", notes: "Requested on Apr 22", lastUpdated: "" }, { id: uid(), area: "Unit Layout Plan", status: "Awaiting from Client", assignee: "Unassigned", notes: "", lastUpdated: "" }];
    return p;
}

const INIT_PROJECTS = [
    makeDemoProject(),
    makeProject({ name: "Sky Villas", client: "Sobha", type: "Villa", color: "#5aabcc", startDate: "2026-03-01", endDate: "2026-06-30", description: "Premium villa cluster renders" }),
    makeProject({ name: "Nexus Mall", client: "Prestige", type: "Commercial", color: "#B8849A", startDate: "2026-01-15", endDate: "2026-05-15", status: "On Hold", description: "Commercial complex walkthrough" }),
];

// ─── MEMBER MODAL ─────────────────────────────────────────────────────────────
function MemberModal({ member, projects, onSave, onClose, onDelete }) {
    const isNew = !member.id;
    const [f, setF] = useState({ name: "", role: ROLES[0], email: "", color: PALETTE[0], availability: "Available", projects: [], ...member });
    const s = (k, v) => setF(p => ({ ...p, [k]: v }));
    function toggleProject(name) { setF(p => ({ ...p, projects: p.projects.includes(name) ? p.projects.filter(x => x !== name) : [...p.projects, name] })); }
    return (
        <Overlay onClose={onClose}>
            <ModalHead title={isNew ? "New Team Member" : f.name} sub={isNew ? "ADD MEMBER" : "EDIT MEMBER"} onClose={onClose} />
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Full Name"><input value={f.name} onChange={e => s("name", e.target.value)} style={inputStyle} placeholder="e.g. Rajan Kumar" /></Field>
                    <Field label="Role"><select value={f.role} onChange={e => s("role", e.target.value)} style={inputStyle}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></Field>
                </div>
                <Field label="Email"><input value={f.email} onChange={e => s("email", e.target.value)} style={inputStyle} placeholder="name@studio.com" type="email" /></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Availability">
                        <select value={f.availability} onChange={e => s("availability", e.target.value)} style={{ ...inputStyle, color: f.availability === "Available" ? "#2a8a50" : f.availability === "Busy" ? "#b07a10" : "#c84040" }}>
                            {["Available", "Busy", "On Leave"].map(a => <option key={a}>{a}</option>)}
                        </select>
                    </Field>
                    <Field label="Colour">
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingTop: 4 }}>
                            {PALETTE.slice(0, 10).map(p => <button key={p} onClick={() => s("color", p)} style={{ width: 20, height: 20, borderRadius: 5, background: p, border: f.color === p ? `2px solid ${T.text}` : `1px solid ${T.border}`, cursor: "pointer", padding: 0 }} />)}
                        </div>
                    </Field>
                </div>
                <Field label="Assigned Projects">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                        {projects.map(p => {
                            const on = f.projects.includes(p.name);
                            return <button key={p.id} onClick={() => toggleProject(p.name)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontFamily: "inherit", cursor: "pointer", fontWeight: 600, border: `1px solid ${on ? p.color : T.border}`, background: on ? `${p.color}18` : "none", color: on ? p.color : T.text3 }}>{p.name}</button>;
                        })}
                        {projects.length === 0 && <span style={{ fontSize: 11, color: T.text4 }}>No projects yet.</span>}
                    </div>
                </Field>
            </div>
            <div style={{ padding: "13px 22px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", background: T.surface2 }}>
                {!isNew ? <button onClick={() => onDelete(member.id)} style={bS("danger")}>{I.trash} Remove</button> : <div />}
                <div style={{ display: "flex", gap: 8 }}><button onClick={onClose} style={bS("ghost")}>Cancel</button><button onClick={() => { if (!f.name.trim()) return; onSave({ ...f, id: f.id || uid() }); }} style={bS("solid")}>{I.save} {isNew ? "Add Member" : "Save"}</button></div>
            </div>
        </Overlay>
    );
}

// ─── TEAM SCREEN ──────────────────────────────────────────────────────────────
function TeamScreen({ globalTeam, projects, onUpdateTeam, onOpenProject }) {
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("All");
    const [filterAvail, setFilterAvail] = useState("All");
    const [editMember, setEditMember] = useState(null);
    const [showAdd, setShowAdd] = useState(false);

    function saveMember(m) {
        onUpdateTeam(prev => prev.find(x => x.id === m.id) ? prev.map(x => x.id === m.id ? m : x) : [...prev, m]);
        setEditMember(null); setShowAdd(false);
    }
    function deleteMember(id) { onUpdateTeam(prev => prev.filter(m => m.id !== id)); setEditMember(null); }

    const filtered = globalTeam.filter(m =>
        (filterRole === "All" || m.role === filterRole) &&
        (filterAvail === "All" || m.availability === filterAvail) &&
        (m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()))
    );

    const availColor = { Available: "#2a8a50", Busy: "#b07a10", "On Leave": "#c84040" };
    const totalTasks = name => projects.reduce((a, p) => a + p.tasks.filter(t => t.artist === name).length, 0);
    const doneTasks = name => projects.reduce((a, p) => a + p.tasks.filter(t => t.artist === name && t.status === "Done").length, 0);
    const activeTasks = name => projects.reduce((a, p) => a + p.tasks.filter(t => t.artist === name && t.status === "In Progress").length, 0);
    const blockedTasks = name => projects.reduce((a, p) => a + p.tasks.filter(t => t.artist === name && t.status === "Blocked").length, 0);
    const memberProjects = name => projects.filter(p => p.team.includes(name) && p.status === "Active");

    const availCount = globalTeam.filter(m => m.availability === "Available").length;
    const busyCount = globalTeam.filter(m => m.availability === "Busy").length;
    const leaveCount = globalTeam.filter(m => m.availability === "On Leave").length;


    const selS = { ...inputStyle, padding: "6px 8px", fontSize: 11, width: "auto" };
    const allRoles = [...new Set(globalTeam.map(m => m.role))];

    return (
        <div style={{ padding: "0" }}>
            {showAdd && <MemberModal member={{}} projects={projects} onSave={saveMember} onClose={() => setShowAdd(false)} onDelete={() => { }} />}
            {editMember && <MemberModal member={editMember} projects={projects} onSave={saveMember} onClose={() => setEditMember(null)} onDelete={deleteMember} />}

            {/* KPI strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: T.border, borderBottom: `1px solid ${T.border}` }}>
                {[{ l: "Total Members", v: globalTeam.length, c: T.text }, { l: "Available", v: availCount, c: "#2a8a50" }, { l: "Busy", v: busyCount, c: "#b07a10" }, { l: "On Leave", v: leaveCount, c: "#c84040" }].map(k => (
                    <div key={k.l} style={{ background: T.surface, padding: "14px 24px" }}>
                        <div style={{ fontSize: 9, color: T.text3, letterSpacing: "0.1em", marginBottom: 5, fontWeight: 600 }}>{k.l.toUpperCase()}</div>
                        <div style={{ fontSize: 24, color: k.c, fontWeight: 700 }}>{k.v}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ padding: "14px 32px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: T.surface }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", flex: "1 1 200px", maxWidth: 260 }}>
                    {I.search}<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" style={{ background: "none", border: "none", outline: "none", color: T.text, fontSize: 12, fontFamily: "inherit", flex: 1 }} />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={selS}><option value="All">All Roles</option>{allRoles.map(r => <option key={r}>{r}</option>)}</select>
                <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)} style={selS}><option value="All">All Availability</option>{["Available", "Busy", "On Leave"].map(a => <option key={a}>{a}</option>)}</select>
                <span style={{ fontSize: 10, color: T.text3, marginLeft: "auto" }}>{filtered.length} of {globalTeam.length} members</span>
                <button onClick={() => setShowAdd(true)} style={bS("solid")}>{I.plus} Add Member</button>
            </div>

            <div style={{ padding: "24px 32px" }}>
                {filtered.length === 0 && <div style={{ textAlign: "center", padding: "50px 20px", color: T.text3 }}><div style={{ fontSize: 32, marginBottom: 10 }}>👥</div><div style={{ fontSize: 13, color: T.text2 }}>No members found.</div></div>}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
                    {filtered.map(m => {
                        const total = totalTasks(m.name), done = doneTasks(m.name), active = activeTasks(m.name), blocked = blockedTasks(m.name);
                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                        const projs = memberProjects(m.name);
                        const ac = availColor[m.availability] || T.text3;
                        return (
                            <div key={m.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", boxShadow: T.shadow }}>
                                <div style={{ height: 3, background: `linear-gradient(90deg,${m.color},${m.color}44)` }} />
                                <div style={{ padding: "16px 16px 0" }}>
                                    {/* Header */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <Avatar name={m.name} color={m.color} size={42} role={m.role} />
                                            <div>
                                                <div style={{ fontSize: 15, color: T.text, fontWeight: 700 }}>{m.name}</div>
                                                <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{m.role}</div>
                                                {m.email && <div style={{ fontSize: 10, color: T.accent, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>{I.mail} {m.email}</div>}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                                            <Pill label={m.availability} color={ac} />
                                            <button onClick={() => setEditMember(m)} style={{ ...bS("ghost"), padding: "3px 7px", fontSize: 10 }}>{I.edit}</button>
                                        </div>
                                    </div>

                                    {/* Task stats */}
                                    {total > 0 ? (
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.text3, marginBottom: 4, fontWeight: 600 }}><span>TASK PROGRESS</span><span style={{ color: m.color }}>{pct}% · {done}/{total}</span></div>
                                            <ProgressBar pct={pct} color={m.color} height={4} />
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 8 }}>
                                                {[{ l: "Active", v: active, c: "#3a86c8" }, { l: "Done", v: done, c: "#2a8a50" }, { l: "Blocked", v: blocked, c: blocked > 0 ? "#c84040" : T.text4 }].map(s => (
                                                    <div key={s.l} style={{ background: T.surface2, borderRadius: 6, padding: "6px 8px", textAlign: "center", border: `1px solid ${T.border}` }}>
                                                        <div style={{ fontSize: 14, color: s.c, fontWeight: 700 }}>{s.v}</div>
                                                        <div style={{ fontSize: 8, color: T.text3, fontWeight: 600, letterSpacing: "0.06em" }}>{s.l.toUpperCase()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 11, color: T.text4, marginBottom: 12, padding: "8px", background: T.surface2, borderRadius: 6, textAlign: "center" }}>No tasks assigned yet</div>
                                    )}

                                    {/* Projects */}
                                    <div style={{ borderTop: `1px solid ${T.border2}`, padding: "10px 0 12px" }}>
                                        <div style={{ fontSize: 9, color: T.text3, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 7 }}>ACTIVE PROJECTS</div>
                                        {projs.length === 0 ? (
                                            <div style={{ fontSize: 11, color: T.text4 }}>Not on any active project</div>
                                        ) : (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                                {projs.map(p => (
                                                    <button key={p.id} onClick={() => onOpenProject(p.id)}
                                                        style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontFamily: "inherit", cursor: "pointer", fontWeight: 600, border: `1px solid ${p.color}44`, background: `${p.color}14`, color: p.color, display: "flex", alignItems: "center", gap: 4 }}>
                                                        {p.name} →
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Workload overview table */}
                {globalTeam.length > 0 && (
                    <div style={{ marginTop: 28 }}>
                        <div style={{ fontSize: 9, color: T.text3, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 12 }}>WORKLOAD OVERVIEW — ALL PROJECTS</div>
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", boxShadow: T.shadow }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(5,1fr)", padding: "10px 16px", background: T.surface2, borderBottom: `1px solid ${T.border}`, gap: 10 }}>
                                {["MEMBER", "TOTAL TASKS", "DONE", "IN PROGRESS", "BLOCKED", "WORKLOAD"].map(h => <span key={h} style={{ fontSize: 8, color: T.text3, letterSpacing: "0.1em", fontWeight: 700 }}>{h}</span>)}
                            </div>
                            {globalTeam.map((m, i) => {
                                const tot = totalTasks(m.name), done = doneTasks(m.name), active = activeTasks(m.name), blk = blockedTasks(m.name);
                                const pct = tot > 0 ? Math.round((done / tot) * 100) : 0;
                                return (
                                    <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(5,1fr)", padding: "10px 16px", borderBottom: i < globalTeam.length - 1 ? `1px solid ${T.border2}` : "none", background: i % 2 === 0 ? T.surface : T.surface2, gap: 10, alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <Avatar name={m.name} color={m.color} size={26} />
                                            <div><div style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: 9, color: T.text3 }}>{m.role}</div></div>
                                        </div>
                                        <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{tot}</span>
                                        <span style={{ fontSize: 13, color: "#2a8a50", fontWeight: 600 }}>{done}</span>
                                        <span style={{ fontSize: 13, color: "#3a86c8", fontWeight: 600 }}>{active}</span>
                                        <span style={{ fontSize: 13, color: blk > 0 ? "#c84040" : T.text4, fontWeight: 600 }}>{blk}</span>
                                        <div style={{ minWidth: 80 }}><ProgressBar pct={pct} color={m.color} height={4} /><div style={{ fontSize: 9, color: m.color, marginTop: 3, fontWeight: 700 }}>{pct}%</div></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── PROJECT MODAL ────────────────────────────────────────────────────────────
function ProjectModal({ project, onSave, onClose, onDelete }) {
    const isNew = !project.id;
    const [f, setF] = useState({ name: "", client: "", type: "Residential", color: PALETTE[0], startDate: TODAY_STR, endDate: "", status: "Active", description: "", ...project });
    const s = (k, v) => setF(p => ({ ...p, [k]: v }));
    return (
        <Overlay onClose={onClose}>
            <ModalHead title={isNew ? "New Project" : f.name} sub={isNew ? "CREATE PROJECT" : "EDIT PROJECT"} onClose={onClose} />
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 13 }}>
                <Field label="Project Name"><input value={f.name} onChange={e => s("name", e.target.value)} style={inputStyle} placeholder="e.g. Ekaanta Phase 2" /></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Client"><input list="clients" value={f.client} onChange={e => s("client", e.target.value)} style={inputStyle} placeholder="Client name" /><datalist id="clients">{CLIENT_SUGGESTIONS.map(c => <option key={c} value={c} />)}</datalist></Field>
                    <Field label="Project Type"><select value={f.type} onChange={e => s("type", e.target.value)} style={inputStyle}>{TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}</select></Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Start Date"><input type="date" value={f.startDate} onChange={e => s("startDate", e.target.value)} style={inputStyle} /></Field>
                    <Field label="End Date"><input type="date" value={f.endDate} onChange={e => s("endDate", e.target.value)} style={inputStyle} /></Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Status"><select value={f.status} onChange={e => s("status", e.target.value)} style={inputStyle}>{STATUS_OPTIONS.map(st => <option key={st}>{st}</option>)}</select></Field>
                    <Field label="Accent Color"><div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 4 }}>{PALETTE.map(p => <button key={p} onClick={() => s("color", p)} style={{ width: 20, height: 20, borderRadius: 5, background: p, border: f.color === p ? `2px solid ${T.text}` : `1px solid ${T.border}`, cursor: "pointer", padding: 0 }} />)}</div></Field>
                </div>
                <Field label="Description"><textarea value={f.description} onChange={e => s("description", e.target.value)} rows={2} placeholder="Brief description…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} /></Field>
            </div>
            <div style={{ padding: "13px 22px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", background: T.surface2 }}>
                {!isNew ? <button onClick={() => onDelete(project.id)} style={bS("danger")}>{I.trash} Delete</button> : <div />}
                <div style={{ display: "flex", gap: 8 }}><button onClick={onClose} style={bS("ghost")}>Cancel</button><button onClick={() => { if (!f.name.trim()) return; onSave({ ...f, id: f.id || uid(), tasks: f.tasks || seedTasks(f.startDate), cad: f.cad || seedCAD(), team: f.team || ["Shri", "Bharath", "Dain", "Sharan", "Manju"], teamColors: f.teamColors || { Shri: "#C8A96E", Bharath: "#7BBFAE", Dain: "#B8849A", Sharan: "#8AA4C8", Manju: "#B8C88A", Unassigned: "#bbb" }, createdAt: f.createdAt || TODAY_STR }); }} style={bS("solid", f.color)}>{I.save} {isNew ? "Create" : "Save"}</button></div>
            </div>
        </Overlay>
    );
}

// ─── TASK MODAL ───────────────────────────────────────────────────────────────
function TaskModal({ task, team, teamColors, onSave, onClose, onDelete }) {
    const [f, setF] = useState({ ...task });
    const s = (k, v) => setF(p => ({ ...p, [k]: v }));
    const pct = f.manDays > 0 ? Math.round((f.daysUsed / f.manDays) * 100) : 0;
    const cfg = STATUS[f.status] || STATUS["Not Started"];
    return (
        <Overlay onClose={onClose}>
            <ModalHead title={task.task || "New Task"} sub={f.section} onClose={onClose} />
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 13 }}>
                <Field label="Task Name"><input value={f.task} onChange={e => s("task", e.target.value)} style={inputStyle} placeholder="Task name…" /></Field>
                <Field label="Section"><select value={f.section} onChange={e => s("section", e.target.value)} style={inputStyle}>{SECTIONS.map(x => <option key={x}>{x}</option>)}</select></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Status"><select value={f.status} onChange={e => s("status", e.target.value)} style={{ ...inputStyle, color: cfg.text }}>{STATUS_KEYS.map(x => <option key={x}>{x}</option>)}</select></Field>
                    <Field label="Priority"><select value={f.priority} onChange={e => s("priority", e.target.value)} style={{ ...inputStyle, color: PRIORITY[f.priority]?.color || T.text2 }}>{Object.keys(PRIORITY).map(x => <option key={x}>{x}</option>)}</select></Field>
                </div>
                <Field label="Assigned To"><select value={f.artist} onChange={e => s("artist", e.target.value)} style={{ ...inputStyle, color: teamColors[f.artist] || T.text2 }}><option value="Unassigned">Unassigned</option>{team.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Start Date"><input type="date" value={f.startDate} onChange={e => s("startDate", e.target.value)} style={inputStyle} /></Field>
                    <Field label="End Date"><input type="date" value={f.endDate} onChange={e => s("endDate", e.target.value)} style={inputStyle} /></Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Man-Days"><input type="number" min="0" value={f.manDays} onChange={e => s("manDays", Number(e.target.value))} style={inputStyle} /></Field>
                    <Field label="Days Used"><input type="number" min="0" value={f.daysUsed} onChange={e => s("daysUsed", Number(e.target.value))} style={inputStyle} /></Field>
                </div>
                {f.manDays > 0 && <div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 9 }}><span style={{ color: T.text3 }}>PROGRESS</span><span style={{ color: cfg.text, fontWeight: 600 }}>{pct}%</span></div><ProgressBar pct={pct} color={cfg.dot} height={5} /></div>}
                <Field label="Notes"><textarea value={f.notes} onChange={e => s("notes", e.target.value)} rows={2} placeholder="Context, blockers…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} /></Field>
            </div>
            <div style={{ padding: "13px 22px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", background: T.surface2 }}>
                <button onClick={() => onDelete(task.id)} style={bS("danger")}>{I.trash} Delete</button>
                <div style={{ display: "flex", gap: 8 }}><button onClick={onClose} style={bS("ghost")}>Cancel</button><button onClick={() => onSave(f)} style={bS("solid")}>{I.save} Save</button></div>
            </div>
        </Overlay>
    );
}

// ─── PROJECT TEAM MODAL (inside project) ─────────────────────────────────────
function ProjectTeamModal({ team, teamColors, onClose, onAdd, onRemove }) {
    const [name, setName] = useState(""); const [color, setColor] = useState(PALETTE[team.length % PALETTE.length]); const [err, setErr] = useState("");
    function handleAdd() { const t = name.trim(); if (!t) return setErr("Name required."); if (team.map(x => x.toLowerCase()).includes(t.toLowerCase())) return setErr("Already exists."); onAdd(t, color); setName(""); setColor(PALETTE[(team.length + 1) % PALETTE.length]); setErr(""); }
    return (
        <Overlay onClose={onClose}>
            <ModalHead title="Project Team" sub={`${team.length} members`} onClose={onClose} />
            <div style={{ padding: "12px 20px", maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                {team.map(m => { const c = teamColors[m] || "#888"; return (<div key={m} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8 }}><Avatar name={m} color={c} size={28} /><span style={{ flex: 1, fontSize: 13, color: T.text }}>{m}</span><div style={{ width: 14, height: 14, borderRadius: 4, background: c }} /><button onClick={() => onRemove(m)} style={{ background: "none", border: "none", color: T.text4, cursor: "pointer", padding: 3 }} onMouseEnter={e => e.currentTarget.style.color = "#c84040"} onMouseLeave={e => e.currentTarget.style.color = T.text4}>{I.trash}</button></div>); })}
            </div>
            <div style={{ padding: "13px 20px", borderTop: `1px solid ${T.border}`, background: T.surface2 }}>
                <div style={{ fontSize: 9, color: T.text3, letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>ADD TO PROJECT</div>
                <div style={{ display: "flex", gap: 8 }}><input value={name} onChange={e => { setName(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && handleAdd()} placeholder="Member name…" style={{ ...inputStyle, flex: 1 }} /><div style={{ position: "relative", width: 34, height: 34 }}><div style={{ width: 34, height: 34, borderRadius: 7, background: color, border: `2px solid ${T.border}` }}><input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} /></div></div><button onClick={handleAdd} style={bS("solid")}>{I.plus}</button></div>
                <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>{PALETTE.map(p => <button key={p} onClick={() => setColor(p)} style={{ width: 18, height: 18, borderRadius: 4, background: p, padding: 0, cursor: "pointer", border: color === p ? `2px solid ${T.text}` : `1px solid ${T.border}` }} />)}</div>
                {err && <div style={{ color: "#c84040", fontSize: 11, marginTop: 6 }}>{err}</div>}
            </div>
        </Overlay>
    );
}

// ─── L1: PROJECT LIST ─────────────────────────────────────────────────────────
function ProjectListScreen({ projects, globalTeam, onOpen, onNewProject, onEditProject, onDeleteProject, onUpdateGlobalTeam, onSave, onLoad }) {
    const [l1Tab, setL1Tab] = useState("projects");
    const [viewMode, setViewMode] = useState("grid");
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterType, setFilterType] = useState("All");
    const [editingProject, setEditingProject] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);

    const filtered = projects.filter(p => (filterStatus === "All" || p.status === filterStatus) && (filterType === "All" || p.type === filterType) && (p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())));
    const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
    const doneTasks = projects.reduce((a, p) => a + p.tasks.filter(t => t.status === "Done").length, 0);
    const activeProj = projects.filter(p => p.status === "Active").length;
    const blockedAll = projects.reduce((a, p) => a + p.tasks.filter(t => t.status === "Blocked").length, 0);
    const statusColor = { Active: "#2a8a50", "On Hold": "#b07a10", Completed: T.accent, Archived: T.text3 };
    const selS = { ...inputStyle, padding: "6px 8px", fontSize: 11, width: "auto" };

    function downloadReport(p) {
        const done = p.tasks.filter(t => t.status === "Done").length, inProg = p.tasks.filter(t => t.status === "In Progress").length, blocked = p.tasks.filter(t => t.status === "Blocked").length, review = p.tasks.filter(t => t.status === "Review").length, notSt = p.tasks.filter(t => t.status === "Not Started").length;
        const pct = p.tasks.length > 0 ? Math.round((done / p.tasks.length) * 100) : 0, totalMD = p.tasks.reduce((a, t) => a + t.manDays, 0), usedMD = p.tasks.reduce((a, t) => a + t.daysUsed, 0), overdue = p.tasks.filter(t => t.endDate < TODAY_STR && t.status !== "Done");

        const totalDays = daysBetween(p.startDate, p.endDate), elapsed = Math.max(0, Math.min(totalDays, daysBetween(p.startDate, TODAY_STR))), remaining = Math.max(0, totalDays - elapsed);
        const sectionRows = SECTIONS.map(sec => { const st = p.tasks.filter(t => t.section === sec); if (!st.length) return ""; const sd = st.filter(t => t.status === "Done").length, sp = st.filter(t => t.status === "In Progress").length, sb = st.filter(t => t.status === "Blocked").length, spct = Math.round((sd / st.length) * 100); return `<tr><td>${sec}</td><td>${st.length}</td><td>${sd}</td><td>${sp}</td><td>${sb}</td><td>${spct}%</td></tr>`; }).join("");
        const taskRows = p.tasks.map(t => { const od = t.endDate < TODAY_STR && t.status !== "Done"; return `<tr style="${od ? "background:#fff8f8" : ""}"><td>${t.task}</td><td>${t.section}</td><td>${t.artist}</td><td style="color:${STATUS[t.status]?.text || "#555"}">${t.status}</td><td>${t.priority}</td><td>${t.manDays}d</td><td>${t.daysUsed}d</td><td>${formatDate(t.startDate)}</td><td>${formatDate(t.endDate)}</td><td>${od ? "⚠ Overdue" : ""}</td></tr>`; }).join("");
        const cadRows = p.cad.length > 0 ? p.cad.map(c => `<tr><td>${c.area}</td><td>${c.status}</td><td>${c.assignee}</td><td>${c.notes || "—"}</td><td>${c.lastUpdated ? formatDate(c.lastUpdated) : "—"}</td></tr>`).join("") : "<tr><td colspan='5' style='color:#aaa'>No CAD files tracked</td></tr>";
        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${p.name} — Project Report</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff;padding:40px 48px}.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid ${p.color};margin-bottom:28px}.brand{font-size:10px;color:#999;letter-spacing:0.15em;margin-bottom:4px}.proj-name{font-size:26px;font-weight:700}.proj-meta{font-size:12px;color:#777;margin-top:4px}.accent-bar{width:60px;height:4px;background:${p.color};border-radius:2px;margin-bottom:8px}.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}.kpi{background:#f7f7fb;border-radius:8px;padding:14px 16px;border:1px solid #eee}.kpi-val{font-size:24px;font-weight:700}.kpi-lbl{font-size:9px;color:#999;letter-spacing:0.1em;font-weight:600;margin-top:3px}.progress-wrap{background:#eee;border-radius:4px;height:7px;margin:6px 0 2px}.progress-fill{height:7px;border-radius:4px;background:${p.color}}h2{font-size:13px;font-weight:700;letter-spacing:0.1em;color:#999;margin:28px 0 12px;text-transform:uppercase}table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px}th{background:#f7f7fb;padding:8px 10px;text-align:left;font-size:9px;color:#999;letter-spacing:0.1em;font-weight:700;border-bottom:1px solid #eee}td{padding:8px 10px;border-bottom:1px solid #f0f0f5;color:#333}tr:last-child td{border-bottom:none}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#bbb;display:flex;justify-content:space-between}</style></head><body><div class="header"><div><div class="brand">3D IMMERSIVE TEAM · PROJECT REPORT</div><div class="proj-name">${p.name}</div><div class="proj-meta">${p.client} · ${p.type} · ${formatDate(p.startDate)} → ${formatDate(p.endDate)}</div></div><div style="text-align:right"><div class="accent-bar" style="margin-left:auto"></div><div style="font-size:11px;color:#999">Generated on</div><div style="font-size:13px;font-weight:600">${formatDate(TODAY_STR)}</div></div></div><div class="kpi-grid"><div class="kpi"><div class="kpi-val" style="color:${p.color}">${pct}%</div><div class="progress-wrap"><div class="progress-fill" style="width:${pct}%"></div></div><div class="kpi-lbl">OVERALL COMPLETION · ${done}/${p.tasks.length} TASKS</div></div><div class="kpi"><div class="kpi-val">${usedMD}/${totalMD}d</div><div class="kpi-lbl">MAN-DAYS USED</div></div><div class="kpi"><div class="kpi-val" style="color:${remaining < 14 ? "#c84040" : remaining < 30 ? "#b07a10" : "#2a8a50"}">${remaining}d</div><div class="kpi-lbl">DAYS REMAINING · ${elapsed} ELAPSED</div></div><div class="kpi"><div class="kpi-val" style="color:${blocked + overdue.length > 0 ? "#c84040" : "#2a8a50"}">${blocked + overdue.length}</div><div class="kpi-lbl">NEEDS ATTENTION</div></div></div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:28px">${[["Done", done, "#2a8a50"], ["In Progress", inProg, "#3a86c8"], ["Review", review, "#b07a10"], ["Blocked", blocked, "#c84040"], ["Not Started", notSt, "#aaa"]].map(([l, v, c]) => `<div style="text-align:center;padding:10px;border-radius:8px;background:#f7f7fb;border:1px solid #eee"><div style="font-size:20px;font-weight:700;color:${c}">${v}</div><div style="font-size:8px;color:#999;letter-spacing:0.08em;font-weight:600;margin-top:2px">${l.toUpperCase()}</div></div>`).join("")}</div><h2>Section progress</h2><table><thead><tr><th>Section</th><th>Total</th><th>Done</th><th>In Progress</th><th>Blocked</th><th>Progress</th></tr></thead><tbody>${sectionRows}</tbody></table><h2>All tasks</h2><table><thead><tr><th>Task</th><th>Section</th><th>Artist</th><th>Status</th><th>Priority</th><th>Man-Days</th><th>Used</th><th>Start</th><th>End</th><th>Flag</th></tr></thead><tbody>${taskRows}</tbody></table><h2>CAD file tracker</h2><table><thead><tr><th>File / Area</th><th>Status</th><th>Assigned To</th><th>Notes</th><th>Received On</th></tr></thead><tbody>${cadRows}</tbody></table><div class="footer"><span>3D Immersive Team · ${p.name} · ${p.client}</span><span>Report generated ${formatDate(TODAY_STR)}</span></div></body></html>`;
        const w = window.open("", "_blank"); if (w) { w.document.open(); w.document.write(html); w.document.close(); }
    }

    const L1_TABS = [{ id: "projects", label: "Projects", icon: I.folder }, { id: "team", label: "Team", icon: I.team }];

    return (
        <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {showNewModal && <ProjectModal project={{}} onSave={p => { onNewProject(p); setShowNewModal(false); }} onClose={() => setShowNewModal(false)} onDelete={() => { }} />}
            {editingProject && <ProjectModal project={editingProject} onSave={p => { onEditProject(p); setEditingProject(null); }} onClose={() => setEditingProject(null)} onDelete={id => { onDeleteProject(id); setEditingProject(null); }} />}

            {/* Header */}
            <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "18px 32px 0", boxShadow: T.shadow }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                        <div style={{ fontSize: 11, color: T.accent, letterSpacing: "0.15em", marginBottom: 4, fontWeight: 700 }}>3D IMMERSIVE TEAM</div>
                        <div style={{ fontSize: 24, color: T.text, fontWeight: 700, letterSpacing: "-0.02em" }}>Studio Dashboard</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button onClick={onSave} style={bS("ghost")} title="Save all data to a JSON file">↓ Save Backup</button>
                            <label style={{ ...bS("ghost"), cursor: "pointer" }} title="Load data from a previously saved JSON file">
                                ↑ Load Backup
                                <input type="file" accept=".json" onChange={onLoad} style={{ display: "none" }} />
                            </label>
                            {l1Tab === "projects" && <button onClick={() => setShowNewModal(true)} style={bS("solid")}>{I.plus} New Project</button>}
                        </div>
                        {l1Tab === "team" && <button onClick={() => { const w = window.open("", "_blank"); if (w) { const teamHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Team Report</title><style>body{font-family:Segoe UI,sans-serif;padding:40px;color:#1a1a2e}h1{font-size:22px;margin-bottom:4px}p{color:#888;font-size:12px;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f7f7fb;padding:8px 10px;text-align:left;font-size:9px;color:#999;letter-spacing:0.1em;font-weight:700;border-bottom:1px solid #eee}td{padding:9px 10px;border-bottom:1px solid #f0f0f5}.footer{margin-top:30px;font-size:10px;color:#bbb}</style></head><body><h1>Team Report — 3D Immersive Team</h1><p>Generated ${formatDate(TODAY_STR)}</p><table><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Availability</th><th>Active Projects</th><th>Total Tasks</th><th>Done</th><th>Active</th><th>Blocked</th></tr></thead><tbody>${globalTeam.map(m => { const tot = projects.reduce((a, p) => a + p.tasks.filter(t => t.artist === m.name).length, 0), dn = projects.reduce((a, p) => a + p.tasks.filter(t => t.artist === m.name && t.status === "Done").length, 0), ac = projects.reduce((a, p) => a + p.tasks.filter(t => t.artist === m.name && t.status === "In Progress").length, 0), bl = projects.reduce((a, p) => a + p.tasks.filter(t => t.artist === m.name && t.status === "Blocked").length, 0), projs = projects.filter(p => p.team.includes(m.name) && p.status === "Active").map(p => p.name).join(", ") || "—"; return `<tr><td>${m.name}</td><td>${m.role}</td><td>${m.email || "—"}</td><td>${m.availability}</td><td>${projs}</td><td>${tot}</td><td>${dn}</td><td>${ac}</td><td>${bl}</td></tr>`; }).join("")}</tbody></table><div class="footer">3D Immersive Team · Team Report · ${formatDate(TODAY_STR)}</div></body></html>`; w.document.open(); w.document.write(teamHtml); w.document.close(); } }} style={bS("ghost")}>↓ Team Report</button>}
                    </div>
                </div>
                {/* L1 Tabs */}
                <div style={{ display: "flex", gap: 0 }}>
                    {L1_TABS.map(t => <button key={t.id} onClick={() => setL1Tab(t.id)} style={{ padding: "8px 20px", background: "none", border: "none", borderBottom: l1Tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent", color: l1Tab === t.id ? T.accent : T.text3, fontSize: 12, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: l1Tab === t.id ? 700 : 500 }}>{t.icon} {t.label} {t.id === "team" && <span style={{ background: l1Tab === "team" ? `${T.accent}18` : T.border2, color: l1Tab === "team" ? T.accent : T.text3, borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{globalTeam.length}</span>}</button>)}
                </div>
            </div>

            {/* PROJECTS TAB */}
            {l1Tab === "projects" && <>
                {/* KPI */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: T.border, borderBottom: `1px solid ${T.border}` }}>
                    {[{ l: "Total Projects", v: projects.length, c: T.text }, { l: "Active", v: activeProj, c: "#2a8a50" }, { l: "Tasks Done", v: `${doneTasks}/${totalTasks}`, c: T.accent }, { l: "Blocked", v: blockedAll, c: blockedAll > 0 ? "#c84040" : T.text3 }].map(k => (
                        <div key={k.l} style={{ background: T.surface, padding: "14px 24px" }}><div style={{ fontSize: 9, color: T.text3, letterSpacing: "0.1em", marginBottom: 5, fontWeight: 600 }}>{k.l.toUpperCase()}</div><div style={{ fontSize: 24, color: k.c, fontWeight: 700 }}>{k.v}</div></div>
                    ))}
                </div>
                {/* Filters */}
                <div style={{ padding: "14px 32px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: T.surface }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", flex: "1 1 200px", maxWidth: 280 }}>
                        {I.search}<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or clients…" style={{ background: "none", border: "none", outline: "none", color: T.text, fontSize: 12, fontFamily: "inherit", flex: 1 }} />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selS}><option value="All">All Statuses</option>{STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}</select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selS}><option value="All">All Types</option>{TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}</select>
                    <span style={{ fontSize: 10, color: T.text3, marginLeft: "auto" }}>{filtered.length} of {projects.length} projects</span>
                    <div style={{ display: "flex", gap: 1, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 7, overflow: "hidden" }}>
                        {[["grid", I.grid], ["list", I.list]].map(([m, ic]) => <button key={m} onClick={() => setViewMode(m)} style={{ padding: "6px 10px", background: viewMode === m ? T.border2 : "none", border: "none", color: viewMode === m ? T.accent : T.text3, cursor: "pointer" }}>{ic}</button>)}
                    </div>
                </div>
                <div style={{ padding: "24px 32px" }}>
                    {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 20px", color: T.text3 }}><div style={{ fontSize: 36, marginBottom: 12 }}>📁</div><div style={{ fontSize: 14, color: T.text2, marginBottom: 6 }}>No projects match your filters.</div></div>}
                    {viewMode === "grid" ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
                            {filtered.map(p => {
                                const done = p.tasks.filter(t => t.status === "Done").length, pct = p.tasks.length > 0 ? Math.round((done / p.tasks.length) * 100) : 0;
                                const blocked = p.tasks.filter(t => t.status === "Blocked").length, totalDays = daysBetween(p.startDate, p.endDate), remaining = Math.max(0, totalDays - Math.max(0, daysBetween(p.startDate, TODAY_STR)));
                                const sc = statusColor[p.status] || T.text3;
                                return (
                                    <div key={p.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", boxShadow: T.shadow, transition: "box-shadow .15s,border-color .15s" }} onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = `${p.color}66`; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.borderColor = T.border; }}>
                                        <div style={{ height: 4, background: `linear-gradient(90deg,${p.color},${p.color}55)` }} />
                                        <div style={{ padding: "15px 16px" }} onClick={() => onOpen(p.id)}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                                <div><div style={{ fontSize: 16, color: T.text, fontWeight: 700, marginBottom: 2 }}>{p.name}</div><div style={{ fontSize: 11, color: T.text3 }}>{p.client} · {p.type}</div></div>
                                                <Pill label={p.status} color={sc} />
                                            </div>
                                            {p.description && <div style={{ fontSize: 11, color: T.text3, marginBottom: 10, lineHeight: 1.6 }}>{p.description}</div>}
                                            <div style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 9 }}><span style={{ color: T.text3, fontWeight: 600 }}>COMPLETION</span><span style={{ color: p.color, fontWeight: 700 }}>{pct}% · {done}/{p.tasks.length}</span></div><ProgressBar pct={pct} color={p.color} height={4} /></div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                                                {[{ l: "Remaining", v: `${remaining}d`, c: remaining < 14 ? "#c84040" : remaining < 30 ? "#b07a10" : "#2a8a50" }, { l: "Blocked", v: blocked, c: blocked > 0 ? "#c84040" : T.text3 }, { l: "Team", v: p.team.length, c: T.accent }].map(s => (
                                                    <div key={s.l} style={{ background: T.surface2, borderRadius: 7, padding: "7px 8px", textAlign: "center", border: `1px solid ${T.border}` }}><div style={{ fontSize: 15, color: s.c, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 8, color: T.text3, letterSpacing: "0.08em", fontWeight: 600 }}>{s.l.toUpperCase()}</div></div>
                                                ))}
                                            </div>
                                            {/* Team avatars */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                                                {p.team.slice(0, 6).map(m => <Avatar key={m} name={m} color={p.teamColors[m] || "#bbb"} size={22} />)}
                                                {p.team.length > 6 && <span style={{ fontSize: 9, color: T.text3, marginLeft: 2 }}>+{p.team.length - 6}</span>}
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.text4 }}><span>{formatDate(p.startDate)}</span><span>{formatDate(p.endDate)}</span></div>
                                        </div>
                                        <div style={{ borderTop: `1px solid ${T.border}`, padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 6, background: T.surface2 }}>
                                            <button onClick={e => { e.stopPropagation(); setEditingProject(p); }} style={{ ...bS("ghost"), padding: "5px 10px", fontSize: 10 }}>{I.edit} Edit</button>
                                            <button onClick={e => { e.stopPropagation(); downloadReport(p); }} style={{ ...bS("ghost"), padding: "5px 10px", fontSize: 10 }}>↓ Report</button>
                                            <button onClick={e => { e.stopPropagation(); onOpen(p.id); }} style={{ ...bS("solid", p.color), padding: "5px 12px", fontSize: 10 }}>Open →</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", boxShadow: T.shadow }}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 80px 90px 100px 80px", padding: "10px 18px", background: T.surface2, borderBottom: `1px solid ${T.border}`, gap: 10 }}>
                                {["PROJECT", "CLIENT", "TYPE", "START", "END", "PROGRESS", "STATUS", ""].map(h => <span key={h} style={{ fontSize: 8, color: T.text3, letterSpacing: "0.12em", fontWeight: 700 }}>{h}</span>)}
                            </div>
                            {filtered.map((p, i) => {
                                const done = p.tasks.filter(t => t.status === "Done").length, pct = p.tasks.length > 0 ? Math.round((done / p.tasks.length) * 100) : 0, sc = statusColor[p.status] || T.text3;
                                return (<div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px 80px 90px 100px 80px", padding: "12px 18px", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border2}` : "none", gap: 10, alignItems: "center", cursor: "pointer", transition: "background .1s" }} onClick={() => onOpen(p.id)} onMouseEnter={e => e.currentTarget.style.background = T.surface2} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 3, height: 30, borderRadius: 2, background: p.color, flexShrink: 0 }} /><div><div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 9, color: T.text3 }}>{p.tasks.length} tasks</div></div></div>
                                    <span style={{ fontSize: 12, color: T.text2 }}>{p.client}</span>
                                    <span style={{ fontSize: 11, color: T.text3 }}>{p.type}</span>
                                    <span style={{ fontSize: 10, color: T.text3 }}>{formatDate(p.startDate)}</span>
                                    <span style={{ fontSize: 10, color: T.text3 }}>{formatDate(p.endDate)}</span>
                                    <div><div style={{ fontSize: 9, color: p.color, marginBottom: 3, fontWeight: 700 }}>{pct}%</div><ProgressBar pct={pct} color={p.color} height={3} /></div>
                                    <Pill label={p.status} color={sc} />
                                    <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                                        <button onClick={() => setEditingProject(p)} style={{ ...bS("ghost"), padding: "4px 7px" }}>{I.edit}</button>
                                        <button onClick={() => downloadReport(p)} style={{ ...bS("ghost"), padding: "4px 7px", fontSize: 10 }}>↓</button>
                                        <button onClick={() => onOpen(p.id)} style={{ ...bS("solid", p.color), padding: "4px 9px" }}>→</button>
                                    </div>
                                </div>);
                            })}
                        </div>
                    )}
                </div>
            </>}

            {/* TEAM TAB */}
            {l1Tab === "team" && <TeamScreen globalTeam={globalTeam} projects={projects} onUpdateTeam={onUpdateGlobalTeam} onOpenProject={onOpen} />}
        </div>
    );
}

// ─── DAY ZERO VIEW ────────────────────────────────────────────────────────────
function DayZeroView({ tasks, cad, team, teamColors, onOpenTask, project, onChangeProjectDates }) {
    const [editingDates, setEditingDates] = useState(false);
    const [draftStart, setDraftStart] = useState(project.startDate);
    const [draftEnd, setDraftEnd] = useState(project.endDate);
    const totalDays = daysBetween(project.startDate, project.endDate), elapsed = Math.max(0, Math.min(totalDays, daysBetween(project.startDate, TODAY_STR))), remaining = Math.max(0, totalDays - elapsed), pctTime = totalDays > 0 ? (elapsed / totalDays) * 100 : 0;
    const total = tasks.length, done = tasks.filter(t => t.status === "Done").length, inProg = tasks.filter(t => t.status === "In Progress").length, blocked = tasks.filter(t => t.status === "Blocked").length, review = tasks.filter(t => t.status === "Review").length, notStarted = tasks.filter(t => t.status === "Not Started").length;
    const pctDone = total > 0 ? Math.round((done / total) * 100) : 0, totalMD = tasks.reduce((a, t) => a + t.manDays, 0), usedMD = tasks.reduce((a, t) => a + t.daysUsed, 0), pctMD = totalMD > 0 ? Math.round((usedMD / totalMD) * 100) : 0;
    const overdue = tasks.filter(t => t.endDate < TODAY_STR && t.status !== "Done");
    const cadDone = cad.filter(c => c.status === "Received" || c.status === "In Use").length, cadBlocked = cad.filter(c => c.status === "Issue — Missing/Incomplete").length, cadPending = cad.filter(c => c.status === "Awaiting from Client").length;
    const workload = team.map(m => ({ name: m, color: teamColors[m] || "#888", tasks: tasks.filter(t => t.artist === m), done: tasks.filter(t => t.artist === m && t.status === "Done").length, active: tasks.filter(t => t.artist === m && t.status === "In Progress").length, days: tasks.filter(t => t.artist === m).reduce((a, t) => a + t.manDays, 0) }));
    const secHealth = SECTIONS.map(sec => { const st = tasks.filter(t => t.section === sec); return { sec, total: st.length, done: st.filter(t => t.status === "Done").length, blocked: st.filter(t => t.status === "Blocked").length }; }).filter(s => s.total > 0);
    const G = (ch, st = {}) => <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px", boxShadow: T.shadow, ...st }}>{ch}</div>;
    const GT = (t, action) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}><span style={{ fontSize: 9, color: T.text3, letterSpacing: "0.12em", fontWeight: 700 }}>{t}</span>{action}</div>;
    return (
        <div style={{ padding: "22px 0" }}>
            {G(<>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div><div style={{ fontSize: 9, color: T.text3, letterSpacing: "0.12em", marginBottom: 4, fontWeight: 700 }}>PROJECT TIMELINE — {project.name.toUpperCase()}</div><div style={{ fontSize: 20, color: T.text, fontWeight: 700 }}>{formatDate(project.startDate)}<span style={{ color: T.border, margin: "0 8px" }}>→</span>{formatDate(project.endDate)}</div></div>
                    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                        {[{ l: "Total", v: totalDays, c: T.text2 }, { l: "Elapsed", v: elapsed, c: project.color }, { l: "Remaining", v: remaining, c: remaining < 14 ? "#c84040" : remaining < 30 ? "#b07a10" : "#2a8a50" }].map(s => <div key={s.l} style={{ textAlign: "center" }}><div style={{ fontSize: 22, color: s.c, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 8, color: T.text3, letterSpacing: "0.08em", fontWeight: 600 }}>{s.l.toUpperCase()}</div></div>)}
                        <button onClick={() => { setDraftStart(project.startDate); setDraftEnd(project.endDate); setEditingDates(true); }} style={bS("ghost")}>{I.edit} Edit</button>
                    </div>
                </div>
                <div style={{ position: "relative", height: 8, background: T.border2, borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${pctTime}%`, background: `linear-gradient(90deg,${project.color},${project.color}88)`, borderRadius: 4 }} />
                    <div style={{ position: "absolute", left: `${pctTime}%`, top: -4, width: 3, height: 16, background: project.color, borderRadius: 2, transform: "translateX(-50%)", boxShadow: `0 0 6px ${project.color}` }}><div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: project.color, whiteSpace: "nowrap", fontWeight: 700 }}>TODAY</div></div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 8, color: T.text4 }}><span>{formatDate(project.startDate)}</span><span>{formatDate(project.endDate)}</span></div>
            </>, { marginBottom: 16 })}
            {editingDates && <Overlay onClose={() => setEditingDates(false)}><ModalHead title="Edit Project Dates" onClose={() => setEditingDates(false)} /><div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}><Field label="Start"><input type="date" value={draftStart} onChange={e => setDraftStart(e.target.value)} style={inputStyle} /></Field><Field label="End"><input type="date" value={draftEnd} onChange={e => setDraftEnd(e.target.value)} style={inputStyle} /></Field></div><div style={{ padding: "12px 22px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 8, background: T.surface2 }}><button onClick={() => setEditingDates(false)} style={bS("ghost")}>Cancel</button><button onClick={() => { onChangeProjectDates(draftStart, draftEnd); setEditingDates(false); }} style={bS("solid")}>{I.save} Save</button></div></Overlay>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
                {[{ l: "Progress", v: `${pctDone}%`, sub: `${done}/${total} tasks complete`, c: project.color }, { l: "Man-Days", v: `${usedMD}/${totalMD}d`, sub: `${pctMD}% of capacity used`, c: "#5aabcc" }, { l: "Active Now", v: inProg, sub: `${review} review · ${notStarted} queued`, c: "#8AA4C8" }, { l: "Attention", v: blocked + overdue.length, sub: `${blocked} blocked · ${overdue.length} overdue`, c: blocked + overdue.length > 0 ? "#c84040" : "#2a8a50" }].map(s => G(<><div style={{ fontSize: 9, color: T.text3, letterSpacing: "0.1em", marginBottom: 7, fontWeight: 600 }}>{s.l.toUpperCase()}</div><div style={{ fontSize: 26, color: s.c, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>{s.sub}</div></>))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 14, marginBottom: 16 }}>
                {G(<>{GT("Task Status")}
                    {[{ k: "Done", v: done }, { k: "In Progress", v: inProg }, { k: "Review", v: review }, { k: "Blocked", v: blocked }, { k: "Not Started", v: notStarted }].map(r => { const cfg = STATUS[r.k]; const p = total > 0 ? (r.v / total) * 100 : 0; return (<div key={r.k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Dot color={cfg.dot} /><span style={{ fontSize: 11, color: T.text2, width: 86 }}>{r.k}</span><div style={{ flex: 1, height: 4, background: T.border2, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${p}%`, background: cfg.dot, borderRadius: 2 }} /></div><span style={{ fontSize: 11, color: cfg.text, width: 20, textAlign: "right", fontWeight: 600 }}>{r.v}</span></div>); })}
                    <div style={{ borderTop: `1px solid ${T.border2}`, paddingTop: 10, marginTop: 4 }}><ProgressBar pct={pctDone} color={project.color} height={5} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: T.text3 }}><span>OVERALL COMPLETION</span><span style={{ color: project.color, fontWeight: 700 }}>{pctDone}%</span></div></div>
                </>)}
                {G(<>{GT("Team Workload")}
                    {workload.map(w => { const p = w.tasks.length > 0 ? (w.done / w.tasks.length) * 100 : 0; return (<div key={w.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}><Avatar name={w.name} color={w.color} size={28} /><div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{w.name}</span><span style={{ fontSize: 9, color: T.text3 }}>{w.done}/{w.tasks.length} · {w.days}d</span></div><ProgressBar pct={p} color={w.color} height={4} /></div>{w.active > 0 && <Pill label={`${w.active} active`} color={w.color} />}</div>); })}
                </>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 16 }}>
                {G(<>{GT("Section Health", <button onClick={() => onOpenTask()} style={bS("solid")}>{I.plus} New Task</button>)}
                    {secHealth.map(s => { const p = Math.round((s.done / s.total) * 100); return (<div key={s.sec} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 9, color: T.text2, width: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{s.sec}</span><div style={{ flex: 1, height: 4, background: T.border2, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${p}%`, background: s.blocked > 0 ? "#e06060" : p === 100 ? "#4caf7d" : project.color, borderRadius: 2 }} /></div><span style={{ fontSize: 9, color: T.text3, width: 28, textAlign: "right", fontWeight: 600 }}>{p}%</span>{s.blocked > 0 && <span style={{ color: "#e06060", fontSize: 11 }}>⚠</span>}</div>); })}
                </>)}
                {G(<>{GT("Alerts & CAD")}
                    <div style={{ marginBottom: 12 }}>
                        {overdue.length === 0 && blocked === 0 && cadBlocked === 0 && <div style={{ fontSize: 11, color: T.text3, display: "flex", alignItems: "center", gap: 6 }}><Dot color="#4caf7d" size={7} /> All clear</div>}
                        {overdue.map(t => <div key={t.id} onClick={() => onOpenTask(t)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#fff0f0", borderRadius: 7, border: "1px solid #f8c0c0", marginBottom: 5, cursor: "pointer" }}><span style={{ color: "#e06060" }}>{I.warn}</span><div style={{ flex: 1 }}><div style={{ fontSize: 11, color: "#c84040", fontWeight: 500 }}>{t.task}</div><div style={{ fontSize: 8, color: "#c07070" }}>Overdue · {formatDate(t.endDate)}</div></div></div>)}
                        {tasks.filter(t => t.status === "Blocked").map(t => <div key={t.id} onClick={() => onOpenTask(t)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#fdf0f8", borderRadius: 7, border: "1px solid #e8c0d8", marginBottom: 5, cursor: "pointer" }}><span style={{ color: "#B8849A" }}>{I.flag}</span><div style={{ flex: 1 }}><div style={{ fontSize: 11, color: "#B8849A", fontWeight: 500 }}>{t.task}</div><div style={{ fontSize: 8, color: "#c090a8" }}>Blocked · {t.artist}</div></div></div>)}
                    </div>
                    <div style={{ borderTop: `1px solid ${T.border2}`, paddingTop: 10 }}>
                        <div style={{ fontSize: 9, color: T.text3, letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>CAD FILES</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {[{ l: "Received", v: cadDone, c: "#2a8a50" }, { l: "Awaiting", v: cadPending, c: T.text3 }, { l: "Issues", v: cadBlocked, c: "#c84040" }].map(s => <div key={s.l} style={{ flex: 1, background: T.surface2, borderRadius: 8, padding: "8px 6px", textAlign: "center", border: `1px solid ${T.border}` }}><div style={{ fontSize: 18, color: s.c, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 8, color: T.text3, fontWeight: 600, letterSpacing: "0.06em" }}>{s.l.toUpperCase()}</div></div>)}
                        </div>
                    </div>
                </>)}
            </div>
        </div>
    );
}

// ─── BOARD VIEW ───────────────────────────────────────────────────────────────
function BoardView({ tasks, team, teamColors, onEditTask, accentColor }) {
    const [fa, setFa] = useState("All"); const [fs, setFs] = useState("All"); const [fp, setFp] = useState("All");
    const filtered = tasks.filter(t => (fa === "All" || t.artist === fa) && (fs === "All" || t.status === fs) && (fp === "All" || t.priority === fp));
    const sel = { ...inputStyle, padding: "6px 8px", fontSize: 11, width: "auto" };
    const ac = accentColor || T.accent;
    return (
        <div style={{ padding: "18px 0" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
                {[["Artist", ["All", "Unassigned", ...team], fa, setFa], ["Status", ["All", ...STATUS_KEYS], fs, setFs], ["Priority", ["All", ...Object.keys(PRIORITY)], fp, setFp]].map(([l, opts, val, set]) => <select key={l} value={val} onChange={e => set(e.target.value)} style={sel}>{opts.map(o => <option key={o}>{o === "All" ? `All ${l}s` : o}</option>)}</select>)}
                <span style={{ fontSize: 10, color: T.text3 }}>{filtered.length} tasks</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                {SECTIONS.map(section => {
                    const st = filtered.filter(t => t.section === section); const allSec = tasks.filter(t => t.section === section); const done = allSec.filter(t => t.status === "Done").length; const pct = allSec.length > 0 ? Math.round((done / allSec.length) * 100) : 0; if (!allSec.length) return null;
                    return (<div key={section} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 11, overflow: "hidden", boxShadow: T.shadow }}>
                        <div style={{ padding: "11px 13px 9px", borderBottom: `1px solid ${T.border}`, background: T.surface2 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: ac }}>{section}</span><span style={{ fontSize: 9, color: T.text3, fontWeight: 600 }}>{done}/{allSec.length}</span></div><ProgressBar pct={pct} color={pct === 100 ? "#4caf7d" : ac} height={3} /></div>
                        <div style={{ padding: "7px 7px 5px" }}>
                            {st.length === 0 && <div style={{ fontSize: 10, color: T.text4, textAlign: "center", padding: "10px 0" }}>No matches</div>}
                            {st.map(task => {
                                const cfg = STATUS[task.status] || STATUS["Not Started"]; const ac2 = teamColors[task.artist] || T.text3; const pct = task.manDays > 0 ? Math.round((task.daysUsed / task.manDays) * 100) : 0; const od = task.endDate < TODAY_STR && task.status !== "Done";
                                return (<div key={task.id} onClick={() => onEditTask(task)} style={{ background: od ? "#fff8f8" : T.surface, border: `1px solid ${od ? "#f8c0c0" : T.border}`, borderRadius: 8, padding: "10px 11px", marginBottom: 6, cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = `${ac}44`; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = od ? "#f8c0c0" : T.border; }}>
                                    <div style={{ fontSize: 12, color: T.text, fontWeight: 500, marginBottom: 6, lineHeight: 1.4 }}>{task.task}</div>
                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}><Pill label={task.status} color={cfg.text} bg={cfg.bg} />{task.artist !== "Unassigned" && <Pill label={task.artist} color={ac2} />}{od && <Pill label="Overdue" color="#c84040" bg="#fff0f0" />}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.text3, marginBottom: 5 }}><span>{formatDate(task.startDate)} → {formatDate(task.endDate)}</span><span style={{ color: cfg.text, fontWeight: 600 }}>{pct}%</span></div>
                                    <ProgressBar pct={pct} color={cfg.dot} height={3} />
                                </div>);
                            })}
                        </div>
                    </div>);
                })}
            </div>
        </div>
    );
}

// ─── GANTT VIEW ───────────────────────────────────────────────────────────────
function GanttView({ tasks, teamColors, projectStart, projectEnd, accentColor }) {
    const DAY_W = 22; const ac = accentColor || T.accent;
    const dates = (() => { const arr = [], s = new Date(projectStart), e = new Date(projectEnd); for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1))arr.push(new Date(d)); return arr; })();
    const months = []; let lm = -1; dates.forEach((d, i) => { if (d.getMonth() !== lm) { months.push({ label: d.toLocaleString("default", { month: "short", year: "2-digit" }), col: i }); lm = d.getMonth(); } });
    const todayCol = dates.findIndex(d => d.toISOString().slice(0, 10) === TODAY_STR);
    function dc(str) { const idx = dates.findIndex(d => d.toISOString().slice(0, 10) === str); return idx >= 0 ? idx : 0; }
    const grouped = SECTIONS.map(sec => ({ sec, tasks: tasks.filter(t => t.section === sec) })).filter(g => g.tasks.length > 0);
    return (
        <div style={{ padding: "18px 0" }}>
            <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "72vh", borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                <div style={{ minWidth: 260 + dates.length * DAY_W }}>
                    <div style={{ display: "flex", position: "sticky", top: 0, zIndex: 12, background: T.surface2, borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ width: 260, minWidth: 260, borderRight: `1px solid ${T.border}`, padding: "7px 14px", fontSize: 9, color: T.text3, fontWeight: 700 }}>TASK / ARTIST</div>
                        <div style={{ position: "relative", flex: 1, height: 26 }}>{months.map(m => <span key={m.label} style={{ position: "absolute", left: m.col * DAY_W + 3, top: 7, fontSize: 9, color: T.text3, fontWeight: 600, pointerEvents: "none" }}>{m.label}</span>)}</div>
                    </div>
                    <div style={{ display: "flex", position: "sticky", top: 26, zIndex: 11, background: T.surface2, borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ width: 260, minWidth: 260, borderRight: `1px solid ${T.border}` }} />
                        <div style={{ display: "flex" }}>{dates.map((d, i) => <div key={i} style={{ width: DAY_W, minWidth: DAY_W, textAlign: "center", padding: "3px 0", fontSize: 8, fontWeight: i === todayCol ? 700 : 400, color: i === todayCol ? ac : d.getDay() === 0 || d.getDay() === 6 ? T.border : T.text4, borderRight: d.getDay() === 0 ? `1px solid ${T.border}` : "none" }}>{d.getDate()}</div>)}</div>
                    </div>
                    {grouped.map(({ sec, tasks: st }) => (
                        <div key={sec}>
                            <div style={{ display: "flex", background: "#f9f9fd", borderBottom: `1px solid ${T.border}` }}>
                                <div style={{ width: 260, minWidth: 260, padding: "5px 14px", fontSize: 9, fontWeight: 700, color: ac, letterSpacing: "0.06em", borderRight: `1px solid ${T.border}` }}>▸ {sec}</div>
                                <div style={{ flex: 1, background: `repeating-linear-gradient(90deg,#f9f9fd 0,#f9f9fd 21px,${T.border2} 21px,${T.border2} 22px)` }} />
                            </div>
                            {st.map(task => {
                                const sc = dc(task.startDate), ec = dc(task.endDate); const w = Math.max(1, ec - sc + 1) * DAY_W; const cfg = STATUS[task.status] || STATUS["Not Started"]; const pct = task.manDays > 0 ? (task.daysUsed / task.manDays) * 100 : 0;
                                return (<div key={task.id} style={{ display: "flex", borderBottom: `1px solid ${T.border2}`, minHeight: 34, alignItems: "center" }}>
                                    <div style={{ width: 260, minWidth: 260, padding: "0 14px", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                                        <span style={{ fontSize: 11, color: T.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.task}</span>
                                        <div style={{ display: "flex", gap: 6, fontSize: 8 }}>{task.artist !== "Unassigned" && <span style={{ color: teamColors[task.artist] || T.text3, fontWeight: 600 }}>{task.artist}</span>}<span style={{ color: cfg.text, fontWeight: 600 }}>● {task.status}</span></div>
                                    </div>
                                    <div style={{ flex: 1, position: "relative", height: 34, background: `repeating-linear-gradient(90deg,${T.surface} 0,${T.surface} 21px,${T.surface2} 21px,${T.surface2} 22px)` }}>
                                        {todayCol >= 0 && <div style={{ position: "absolute", left: todayCol * DAY_W, top: 0, bottom: 0, width: 2, background: `${ac}44`, zIndex: 2 }} />}
                                        <div style={{ position: "absolute", left: sc * DAY_W + 1, top: 7, width: w - 2, height: 20, borderRadius: 5, background: cfg.bg, border: `1px solid ${cfg.border}`, overflow: "hidden", zIndex: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                                            <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: `${cfg.dot}28` }} />
                                            <span style={{ position: "relative", zIndex: 1, fontSize: 9, color: cfg.text, paddingLeft: 5, lineHeight: "20px", whiteSpace: "nowrap", display: "block", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>{task.task}</span>
                                        </div>
                                    </div>
                                </div>);
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── CAD TRACKER ─────────────────────────────────────────────────────────────
function CADTracker({ cad, setCad, team, teamColors }) {
    const [showAdd, setShowAdd] = useState(false); const [newName, setNewName] = useState(""); const [newCustom, setNewCustom] = useState(""); const [newNotes, setNewNotes] = useState("");
    function upd(id, k, v) { setCad(p => p.map(c => c.id === id ? { ...c, [k]: v } : c)); }
    function del(id) { setCad(p => p.filter(c => c.id !== id)); }
    function addFile() { const name = (newName === "custom" ? newCustom : newName).trim(); if (!name) return; setCad(p => [...p, { id: uid(), area: name, status: "Awaiting from Client", assignee: "Unassigned", notes: newNotes.trim(), lastUpdated: "" }]); setNewName(""); setNewCustom(""); setNewNotes(""); setShowAdd(false); }
    const awaiting = cad.filter(c => c.status === "Awaiting from Client").length, received = cad.filter(c => c.status === "Received").length, inUse = cad.filter(c => c.status === "In Use").length, issues = cad.filter(c => c.status === "Issue — Missing/Incomplete").length;
    return (
        <div style={{ padding: "22px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
                {[{ l: "Awaiting", v: awaiting, c: "#b07a10", bg: "#fffbea", b: "#f0d98a" }, { l: "Received", v: received, c: "#2a8a50", bg: "#eafaf1", b: "#a8e6c0" }, { l: "In Use", v: inUse, c: "#3a86c8", bg: "#e8f4ff", b: "#b8d8f8" }, { l: "Issues", v: issues, c: "#c84040", bg: "#fff0f0", b: "#f8c0c0" }].map(s => <div key={s.l} style={{ background: s.bg, border: `1px solid ${s.b}`, borderRadius: 10, padding: "13px 16px", textAlign: "center", boxShadow: T.shadow }}><div style={{ fontSize: 26, color: s.c, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 9, color: s.c, letterSpacing: "0.1em", marginTop: 2, fontWeight: 600 }}>{s.l.toUpperCase()}</div></div>)}
            </div>
            {cad.length > 0 && <><ProgressBar pct={(received + inUse) / cad.length * 100} color="#4caf7d" height={5} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, marginBottom: 20, fontSize: 9, color: T.text3, fontWeight: 600 }}><span>FILES RECEIVED</span><span style={{ color: "#2a8a50" }}>{received + inUse} of {cad.length} files</span></div></>}
            <div style={{ marginBottom: 16 }}>
                {!showAdd ? <button onClick={() => setShowAdd(true)} style={{ ...bS("ghost"), fontSize: 11 }}>{I.plus} Add CAD File</button> : (
                    <div style={{ background: T.surface, border: `1px solid ${T.accent}44`, borderRadius: 10, padding: "14px 16px", boxShadow: T.shadow, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ fontSize: 9, color: T.accent, fontWeight: 700, letterSpacing: "0.1em" }}>ADD CAD FILE</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, marginBottom: 4 }}>FILE TYPE</div><select value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle}><option value="">— Select or type custom —</option>{CAD_AREAS.map(a => <option key={a} value={a}>{a}</option>)}<option value="custom">Custom…</option></select></div>
                            {newName === "custom" && <div><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, marginBottom: 4 }}>CUSTOM NAME</div><input value={newCustom} onChange={e => setNewCustom(e.target.value)} placeholder="e.g. MEP Layout" style={inputStyle} /></div>}
                            <div><div style={{ fontSize: 9, color: T.text3, fontWeight: 600, marginBottom: 4 }}>NOTES (optional)</div><input value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="e.g. 2nd floor only" style={inputStyle} /></div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}><button onClick={addFile} style={bS("solid")}>{I.plus} Add File</button><button onClick={() => { setShowAdd(false); setNewName(""); setNewCustom(""); setNewNotes(""); }} style={bS("ghost")}>Cancel</button></div>
                    </div>
                )}
            </div>
            {cad.length === 0 ? <div style={{ textAlign: "center", padding: "50px 20px", color: T.text3, background: T.surface, borderRadius: 12, border: `1px solid ${T.border}` }}><div style={{ fontSize: 30, marginBottom: 10 }}>📂</div><div style={{ fontSize: 13, color: T.text2, fontWeight: 500, marginBottom: 4 }}>No CAD files added yet</div><div style={{ fontSize: 11 }}>Click "Add CAD File" to start tracking files from the client.</div></div> : (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", boxShadow: T.shadow }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 160px 140px 1fr 110px 36px", padding: "10px 16px", background: T.surface2, borderBottom: `1px solid ${T.border}`, gap: 10 }}>
                        {["CAD FILE", "STATUS", "ASSIGNED TO", "NOTES", "RECEIVED ON", ""].map(h => <span key={h} style={{ fontSize: 8, color: T.text3, letterSpacing: "0.1em", fontWeight: 700 }}>{h}</span>)}
                    </div>
                    {cad.map((item, idx) => {
                        const cs = CAD_STATUS_STYLE[item.status] || CAD_STATUS_STYLE["Awaiting from Client"]; const ac2 = teamColors[item.assignee] || T.text3;
                        return (<div key={item.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 160px 140px 1fr 110px 36px", padding: "10px 16px", borderBottom: idx < cad.length - 1 ? `1px solid ${T.border2}` : "none", background: idx % 2 === 0 ? T.surface : T.surface2, gap: 10, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{item.area}</span>
                            <select value={item.status} onChange={e => upd(item.id, "status", e.target.value)} style={{ background: cs.bg, border: `1px solid ${cs.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 10, color: cs.color, fontFamily: "inherit", fontWeight: 600, cursor: "pointer", outline: "none" }}>{CAD_STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            <select value={item.assignee} onChange={e => upd(item.id, "assignee", e.target.value)} style={{ ...inputStyle, padding: "5px 7px", fontSize: 11, color: ac2, width: "auto" }}><option value="Unassigned">Unassigned</option>{team.map(m => <option key={m} value={m}>{m}</option>)}</select>
                            <input value={item.notes} onChange={e => upd(item.id, "notes", e.target.value)} placeholder="Add notes…" style={{ background: "none", border: "none", borderBottom: `1px solid ${T.border}`, color: T.text2, fontSize: 11, fontFamily: "inherit", outline: "none", width: "95%", padding: "3px 0" }} onFocus={e => e.currentTarget.style.borderColor = T.accent} onBlur={e => e.currentTarget.style.borderColor = T.border} />
                            <input type="date" value={item.lastUpdated || ""} onChange={e => upd(item.id, "lastUpdated", e.target.value)} style={{ ...inputStyle, padding: "4px 7px", fontSize: 10 }} />
                            <button onClick={() => del(item.id)} style={{ background: "none", border: "none", color: T.text4, cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.color = "#c84040"} onMouseLeave={e => e.currentTarget.style.color = T.text4}>{I.trash}</button>
                        </div>);
                    })}
                </div>
            )}
        </div>
    );
}

// ─── L2: PROJECT DETAIL ───────────────────────────────────────────────────────
function ProjectDetailScreen({ project, onUpdateProject, onBack }) {
    const [tab, setTab] = useState("home"); const [showTeam, setShowTeam] = useState(false); const [editTask, setEditTask] = useState(null);
    function updateProject(updates) { onUpdateProject({ ...project, ...updates }); }
    function openTask(t) { setEditTask(t || { id: uid(), section: SECTIONS[0], task: "", artist: "Unassigned", manDays: 1, daysUsed: 0, status: "Not Started", priority: "Medium", startDate: project.startDate, endDate: project.startDate, notes: "" }); }
    function saveTask(t) { updateProject({ tasks: project.tasks.find(x => x.id === t.id) ? project.tasks.map(x => x.id === t.id ? t : x) : [...project.tasks, t] }); setEditTask(null); }
    function delTask(id) { updateProject({ tasks: project.tasks.filter(t => t.id !== id) }); setEditTask(null); }
    function addMember(name, color) { updateProject({ team: [...project.team, name], teamColors: { ...project.teamColors, [name]: color } }); }
    function removeMember(name) { updateProject({ team: project.team.filter(m => m !== name), tasks: project.tasks.map(t => t.artist === name ? { ...t, artist: "Unassigned" } : t) }); }
    function setCad(fn) { updateProject({ cad: fn(project.cad) }); }
    const pct = project.tasks.length > 0 ? Math.round((project.tasks.filter(t => t.status === "Done").length / project.tasks.length) * 100) : 0;
    const TABS = [{ id: "home", label: "Day Zero", icon: I.home }, { id: "board", label: "Board", icon: I.board }, { id: "gantt", label: "Timeline", icon: I.gantt }, { id: "cad", label: "CAD", icon: I.cad }];
    return (
        <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {editTask && <TaskModal task={editTask} team={project.team} teamColors={project.teamColors} onSave={saveTask} onClose={() => setEditTask(null)} onDelete={delTask} />}
            {showTeam && <ProjectTeamModal team={project.team} teamColors={project.teamColors} onClose={() => setShowTeam(false)} onAdd={addMember} onRemove={removeMember} />}
            <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 28px 0", position: "sticky", top: 0, zIndex: 20, boxShadow: T.shadow }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={onBack} style={{ ...bS("ghost"), padding: "6px 10px" }}>{I.back} Projects</button>
                        <div style={{ width: 1, height: 24, background: T.border }} />
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: project.color, boxShadow: `0 0 0 3px ${project.color}33` }} />
                        <div><div style={{ fontSize: 9, color: project.color, letterSpacing: "0.15em", fontWeight: 700 }}>{project.client.toUpperCase()} · {project.type.toUpperCase()}</div><div style={{ fontSize: 17, color: T.text, fontWeight: 700 }}>{project.name}</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ textAlign: "right" }}><div style={{ fontSize: 15, color: project.color, fontWeight: 700 }}>{pct}%</div><div style={{ fontSize: 8, color: T.text3, fontWeight: 600 }}>COMPLETE</div></div>
                        <div style={{ width: 80 }}><ProgressBar pct={pct} color={project.color} height={4} /><div style={{ fontSize: 8, color: T.text3, marginTop: 3 }}>{project.tasks.filter(t => t.status === "Done").length}/{project.tasks.length} tasks</div></div>
                        <button onClick={() => openTask(null)} style={bS("solid", project.color)}>{I.plus} New Task</button>
                        <button onClick={() => setShowTeam(true)} style={bS("ghost")}>{I.team} Team</button>
                    </div>
                </div>
                <div style={{ display: "flex" }}>
                    {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 18px", background: "none", border: "none", borderBottom: tab === t.id ? `2px solid ${project.color}` : "2px solid transparent", color: tab === t.id ? project.color : T.text3, fontSize: 11, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: tab === t.id ? 700 : 500 }}>{t.icon} {t.label}</button>)}
                </div>
            </div>
            <div style={{ padding: "6px 28px 8px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: T.surface2 }}>
                <span style={{ fontSize: 8, color: T.text4, fontWeight: 700, letterSpacing: "0.12em" }}>TEAM</span>
                {project.team.map(m => { const c = project.teamColors[m] || "#888"; const count = project.tasks.filter(t => t.artist === m).length; return (<div key={m} style={{ display: "flex", alignItems: "center", gap: 5 }}><Avatar name={m} color={c} size={22} /><span style={{ fontSize: 10, color: T.text2, fontWeight: 500 }}>{m}</span>{count > 0 && <span style={{ fontSize: 8, color: c, background: `${c}18`, borderRadius: 10, padding: "1px 6px", fontWeight: 700 }}>{count}</span>}</div>); })}
            </div>
            <div style={{ padding: "0 28px" }}>
                {tab === "home" && <DayZeroView tasks={project.tasks} cad={project.cad} team={project.team} teamColors={project.teamColors} onOpenTask={openTask} project={project} onChangeProjectDates={(s, e) => updateProject({ startDate: s, endDate: e })} />}
                {tab === "board" && <BoardView tasks={project.tasks} team={project.team} teamColors={project.teamColors} onEditTask={openTask} accentColor={project.color} />}
                {tab === "gantt" && <GanttView tasks={project.tasks} teamColors={project.teamColors} projectStart={project.startDate} projectEnd={project.endDate} accentColor={project.color} />}
                {tab === "cad" && <CADTracker cad={project.cad} setCad={setCad} team={project.team} teamColors={project.teamColors} />}
            </div>
        </div>
    );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
    const [projects, setProjects] = useState(INIT_PROJECTS);
    const [globalTeam, setGlobalTeam] = useState(INITIAL_GLOBAL_TEAM);
    const [openProjectId, setOpenProjectId] = useState(null);
    const openProject = projects.find(p => p.id === openProjectId);

    if (openProject) return <ProjectDetailScreen project={openProject} onUpdateProject={p => setProjects(prev => prev.map(x => x.id === p.id ? p : x))} onBack={() => setOpenProjectId(null)} />;

    function saveToFile() {
        const data = JSON.stringify({ projects, globalTeam }, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `3d-immersive-backup-${TODAY_STR}.json`;
        a.click(); URL.revokeObjectURL(url);
    }

    function loadFromFile(e) {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (parsed.projects) setProjects(parsed.projects);
                if (parsed.globalTeam) setGlobalTeam(parsed.globalTeam);
            } catch { alert("Invalid file. Please load a valid backup JSON."); }
        };
        reader.readAsText(file);
        e.target.value = "";
    }

    return <ProjectListScreen
        projects={projects} globalTeam={globalTeam}
        onOpen={setOpenProjectId}
        onNewProject={p => setProjects(prev => [...prev, p])}
        onEditProject={p => setProjects(prev => prev.map(x => x.id === p.id ? p : x))}
        onDeleteProject={id => setProjects(prev => prev.filter(p => p.id !== id))}
        onUpdateGlobalTeam={setGlobalTeam}
        onSave={saveToFile}
        onLoad={loadFromFile}
    />;
}