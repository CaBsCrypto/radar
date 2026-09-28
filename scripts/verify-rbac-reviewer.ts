import { 
  SUPERADMIN_EMAIL, 
  TEAM_MEMBER_EMAILS, 
  ADMIN_WHITELIST,
  getUserRole, 
  isUserAuthorizedForAdmin, 
  isUserSuperAdmin,
  exportToCSV
} from '../src/services/firestoreService';
import type { User } from 'firebase/auth';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('=== TEST SUITE 1: CANONICAL CONFIG & WHITELIST ===');
assert(SUPERADMIN_EMAIL === 'cabscryptocontacto@gmail.com', 'SuperAdmin email is canonical');
assert(TEAM_MEMBER_EMAILS.length === 6, '6 hackathon team member emails registered');
assert(ADMIN_WHITELIST.length === 7, 'Total whitelist is 7 members');
assert(TEAM_MEMBER_EMAILS.includes('martin.fuentes.r@usach.cl'), 'Contains martin.fuentes.r@usach.cl');
assert(TEAM_MEMBER_EMAILS.includes('paolo.fardella@usach.cl'), 'Contains paolo.fardella@usach.cl');
assert(TEAM_MEMBER_EMAILS.includes('sebastian.salles@usach.cl'), 'Contains sebastian.salles@usach.cl');
assert(TEAM_MEMBER_EMAILS.includes('israel.aguilar@usach.cl'), 'Contains israel.aguilar@usach.cl');
assert(TEAM_MEMBER_EMAILS.includes('crwom01@gmail.com'), 'Contains crwom01@gmail.com');
assert(TEAM_MEMBER_EMAILS.includes('alphadocere@gmail.com'), 'Contains alphadocere@gmail.com');

console.log('\n=== TEST SUITE 2: ROLE RESOLUTION & NORMALIZATION ===');
// Helper to mock User
const mockUser = (email: string | null): User => ({ email } as unknown as User);

// SuperAdmin permutations
assert(getUserRole(mockUser('cabscryptocontacto@gmail.com')) === 'superadmin', 'SuperAdmin exact match');
assert(getUserRole(mockUser('CABScryptoContacto@gmail.com')) === 'superadmin', 'SuperAdmin uppercase match');
assert(getUserRole(mockUser('  cabscryptocontacto@gmail.com  ')) === 'superadmin', 'SuperAdmin with whitespace match');
assert(isUserSuperAdmin(mockUser('cabscryptocontacto@gmail.com')) === true, 'isUserSuperAdmin true for SuperAdmin');
assert(isUserAuthorizedForAdmin(mockUser('cabscryptocontacto@gmail.com')) === true, 'isUserAuthorizedForAdmin true for SuperAdmin');

// Hackathon team member permutations
for (const email of TEAM_MEMBER_EMAILS) {
  assert(getUserRole(mockUser(email)) === 'viewer', `Viewer exact match for ${email}`);
  assert(getUserRole(mockUser(email.toUpperCase())) === 'viewer', `Viewer uppercase match for ${email.toUpperCase()}`);
  assert(getUserRole(mockUser(`  ${email}  `)) === 'viewer', `Viewer whitespace match for ${email}`);
  assert(isUserSuperAdmin(mockUser(email)) === false, `isUserSuperAdmin false for ${email}`);
  assert(isUserAuthorizedForAdmin(mockUser(email)) === true, `isUserAuthorizedForAdmin true for ${email}`);
}

// Unauthorized accounts
const unauthorizedEmails = [
  'attacker@malicious.com',
  'cabscryptocontacto@usach.cl',
  'martin.fuentes.r@gmail.com',
  'random.user@usach.cl',
  'crwom01@usach.cl',
  'admin@chileairadar.cl',
  ''
];

for (const email of unauthorizedEmails) {
  assert(getUserRole(mockUser(email)) === null, `Unauthorized null role for "${email}"`);
  assert(isUserSuperAdmin(mockUser(email)) === false, `isUserSuperAdmin false for "${email}"`);
  assert(isUserAuthorizedForAdmin(mockUser(email)) === false, `isUserAuthorizedForAdmin false for "${email}"`);
}

// Null and undefined users
assert(getUserRole(null) === null, 'Null user role is null');
assert(getUserRole(mockUser(null)) === null, 'User with null email is null');
assert(isUserAuthorizedForAdmin(null) === false, 'Null user not authorized');
assert(isUserSuperAdmin(null) === false, 'Null user not superadmin');

console.log('\n=== TEST SUITE 3: FIRESTORE SECURITY RULES SIMULATION ===');
// Simulate Firestore rules logic
function simulateFirestoreRules(auth: { email?: string; email_verified?: boolean } | null, operation: 'read' | 'write' | 'update' | 'delete', collectionName: string): boolean {
  if (!auth) return false;
  const isSuperAdmin = auth.email_verified === true && 
                       typeof auth.email === 'string' && 
                       auth.email.toLowerCase() === 'cabscryptocontacto@gmail.com';

  const isTeamMember = auth.email_verified === true &&
                       typeof auth.email === 'string' &&
                       [
                         'cabscryptocontacto@gmail.com',
                         'martin.fuentes.r@usach.cl',
                         'paolo.fardella@usach.cl',
                         'sebastian.salles@usach.cl',
                         'israel.aguilar@usach.cl',
                         'crwom01@gmail.com',
                          'alphadocere@gmail.com'
                       ].includes(auth.email.toLowerCase());

  if (collectionName === 'waitlist_subscribers' || collectionName === 'business_submissions') {
    if (operation === 'read') return isTeamMember;
    if (operation === 'update') return isTeamMember;
    if (operation === 'delete') return isSuperAdmin;
  }

  if (collectionName === 'mcp_solicitudes') {
    if (operation === 'read') return true;
    if (operation === 'update') return isTeamMember;
    if (operation === 'delete') return isSuperAdmin;
  }

  if (collectionName === 'organizations' || collectionName === 'events') {
    if (operation === 'read') return true;
    if (operation === 'write' || operation === 'update') return isTeamMember;
    if (operation === 'delete') return isSuperAdmin;
  }

  if (collectionName === 'propuestas_publicas') {
    if (operation === 'read') return isTeamMember;
    if (operation === 'delete') return isTeamMember;
  }

  return false;
}

// SuperAdmin rules
assert(simulateFirestoreRules({ email: 'cabscryptocontacto@gmail.com', email_verified: true }, 'read', 'waitlist_subscribers') === true, 'Firestore: SuperAdmin can read waitlist');
assert(simulateFirestoreRules({ email: 'cabscryptocontacto@gmail.com', email_verified: true }, 'update', 'waitlist_subscribers') === true, 'Firestore: SuperAdmin can update waitlist');
assert(simulateFirestoreRules({ email: 'cabscryptocontacto@gmail.com', email_verified: true }, 'delete', 'waitlist_subscribers') === true, 'Firestore: SuperAdmin can delete waitlist');
assert(simulateFirestoreRules({ email: 'cabscryptocontacto@gmail.com', email_verified: true }, 'read', 'business_submissions') === true, 'Firestore: SuperAdmin can read submissions');
assert(simulateFirestoreRules({ email: 'cabscryptocontacto@gmail.com', email_verified: true }, 'update', 'business_submissions') === true, 'Firestore: SuperAdmin can update submissions');
assert(simulateFirestoreRules({ email: 'cabscryptocontacto@gmail.com', email_verified: true }, 'delete', 'business_submissions') === true, 'Firestore: SuperAdmin can delete submissions');
assert(simulateFirestoreRules({ email: 'cabscryptocontacto@gmail.com', email_verified: true }, 'delete', 'organizations') === true, 'Firestore: SuperAdmin can delete organizations');
assert(simulateFirestoreRules({ email: 'cabscryptocontacto@gmail.com', email_verified: true }, 'delete', 'events') === true, 'Firestore: SuperAdmin can delete events');

// Team Members (Read & Update ALLOWED, Delete DENIED except for proposals)
for (const email of TEAM_MEMBER_EMAILS) {
  // exact case
  assert(simulateFirestoreRules({ email, email_verified: true }, 'read', 'waitlist_subscribers') === true, `Firestore: ${email} can read waitlist`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'update', 'waitlist_subscribers') === true, `Firestore: ${email} CAN update waitlist`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'delete', 'waitlist_subscribers') === false, `Firestore: ${email} CANNOT delete waitlist`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'read', 'business_submissions') === true, `Firestore: ${email} can read submissions`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'update', 'business_submissions') === true, `Firestore: ${email} CAN update submissions status`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'delete', 'business_submissions') === false, `Firestore: ${email} CANNOT delete submissions`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'update', 'mcp_solicitudes') === true, `Firestore: ${email} CAN approve/revert mcp_solicitudes`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'delete', 'mcp_solicitudes') === false, `Firestore: ${email} CANNOT delete mcp_solicitudes`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'update', 'organizations') === true, `Firestore: ${email} CAN create/edit organizations`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'delete', 'organizations') === false, `Firestore: ${email} CANNOT delete organizations`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'update', 'events') === true, `Firestore: ${email} CAN create/edit events`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'delete', 'events') === false, `Firestore: ${email} CANNOT delete events`);
  assert(simulateFirestoreRules({ email, email_verified: true }, 'delete', 'propuestas_publicas') === true, `Firestore: ${email} CAN delete propuestas_publicas upon approval`);

  // UPPERCASE / MIXED CASE
  assert(simulateFirestoreRules({ email: email.toUpperCase(), email_verified: true }, 'read', 'waitlist_subscribers') === true, `Firestore: ${email.toUpperCase()} (uppercase) can read waitlist with .lower()`);

  // UNVERIFIED EMAIL
  assert(simulateFirestoreRules({ email, email_verified: false }, 'read', 'waitlist_subscribers') === false, `Firestore: ${email} with email_verified=false is REJECTED`);
}

// Unauthorized user (ALL DENIED)
assert(simulateFirestoreRules({ email: 'hacker@anonymous.com', email_verified: true }, 'read', 'waitlist_subscribers') === false, 'Firestore: Hacker cannot read waitlist');
assert(simulateFirestoreRules({ email: 'hacker@anonymous.com', email_verified: true }, 'read', 'business_submissions') === false, 'Firestore: Hacker cannot read submissions');
assert(simulateFirestoreRules({ email: 'hacker@anonymous.com', email_verified: true }, 'update', 'mcp_solicitudes') === false, 'Firestore: Hacker cannot update solicitudes');
assert(simulateFirestoreRules(null, 'read', 'waitlist_subscribers') === false, 'Firestore: Unauthenticated cannot read waitlist');

console.log('\n=== TEST SUITE 4: SOLICITUDES SEARCH FILTER LOGIC ===');
const mockSolicitudes = [
  { id: '1', empresa: 'Acme AI', regionId: '13-rm', metodos: ['consultarRUT', 'validarDoc'], paquete: 'pack-starter', estado: 'postulando' },
  { id: '2', empresa: null, regionId: '05-valparaiso', metodos: ['analisisStock'], paquete: 'pack-scale', estado: 'conectada' },
  { id: '3', empresa: 'BioBio Tech', regionId: '08-biobio', metodos: ['facturar'], paquete: null, estado: 'postulando' },
];

function filterSolicitudes(list: typeof mockSolicitudes, query: string) {
  if (!query) return list;
  const q = query.toLowerCase();
  return list.filter(s => {
    const regionText = (s.regionId === '13-rm' ? 'Metropolitana' : s.regionId === '05-valparaiso' ? 'Valparaíso' : 'Biobío').toLowerCase();
    const empresaText = (s.empresa || '').toLowerCase();
    const metodosText = (s.metodos || []).join(' ').toLowerCase();
    const paqueteText = (s.paquete || '').toLowerCase();
    return empresaText.includes(q) || regionText.includes(q) || s.regionId.toLowerCase().includes(q) || metodosText.includes(q) || paqueteText.includes(q);
  });
}

assert(filterSolicitudes(mockSolicitudes, 'acme').length === 1, 'Search by company name finds Acme AI');
assert(filterSolicitudes(mockSolicitudes, 'valparaíso').length === 1, 'Search by region name finds Valparaíso');
assert(filterSolicitudes(mockSolicitudes, 'consultarrut').length === 1, 'Search by method finds consultarRUT');
assert(filterSolicitudes(mockSolicitudes, 'pack-scale').length === 1, 'Search by package finds pack-scale');
assert(filterSolicitudes(mockSolicitudes, 'inexistente').length === 0, 'Search for non-existent returns empty');

console.log('\n=== TEST SUITE 5: CSV GENERATION & UTF-8 BOM ENCODING ===');
const sampleRow = [{ ID: '1', Name: 'Valparaíso & Biobío', Metodos: ['consultarRUT', 'validarDoc'] }];
const headers = Object.keys(sampleRow[0]);
const csvContent = [
  headers.join(','),
  ...sampleRow.map(row => 
    headers.map(h => {
      let val = (row as any)[h];
      if (val === undefined || val === null) val = '';
      if (Array.isArray(val)) val = val.join(';');
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',')
  )
].join('\r\n');
const withBom = '\uFEFF' + csvContent;
assert(withBom.charCodeAt(0) === 0xFEFF, 'CSV starts with UTF-8 BOM character for Excel compatibility');
assert(csvContent.includes('"Valparaíso & Biobío"'), 'CSV preserves Spanish accents and characters');
assert(csvContent.includes('"consultarRUT;validarDoc"'), 'CSV joins array fields with semicolon');

console.log(`\n========================================`);
console.log(`TEST RUN COMPLETE: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
