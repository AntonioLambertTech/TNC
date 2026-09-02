/* ======================================================================
   EDIT ME: This is the only file most people will ever need to touch.
   ====================================================================== */

/* Homepage sections, in the order they should appear.
   - id: used in the "see all" link, lowercase, no spaces
   - label: must match the "Section" column in the Inventory sheet
            (not case sensitive)
   To add a section: add a new line below.
   To remove a section: delete its line.
   The order of this list is the order sections show on the homepage. */
const SECTIONS = [
  { id: "all", label: "All T-Shirts" },
  { id: "party", label: "Party" },
  { id: "graduation", label: "Graduation" },
  { id: "birthday", label: "Birthday" },
  { id: "sports", label: "Sports" }
];

/* Company info shown in the top bar and footer. */
const COMPANY = {
  name: "Your Company",
  phone: "(555) 555-5555",
  email: "orders@yourcompany.com",
  logoUrl: "images/logo.png"
};

/* Paste the "Publish to web" CSV link for the Inventory tab of your
   Google Sheet here. See README.md for how to get this link. */
const INVENTORY_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS8Bh4h40Cc4N_q6M-jnzJFnfvjpo9qGfq1_i1Eom7WuSOuFo4SVFdXUjag3EtIUYGOMnm8GEcnCWMo/pub?gid=0&single=true&output=csv";

/* Paste the deployed Apps Script Web App URL here. See README.md. */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyv3bE0YLK-jJolIWRflStq2hSZrB7odiwiOLX5qJbcAiPTH2BmULWY1IijJtG8RaAIPQ/exec";

/* How many items to show per homepage section before "see all". */
const ITEMS_PER_HOMEPAGE_SECTION = 10;
