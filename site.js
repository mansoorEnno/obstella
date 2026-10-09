const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);

const screens = {
  income: { label: 'FINANCIAL REPORTING', title: 'Know how your hospital is doing.', description: 'See income by date, category or doctor. Review daily totals or a longer period, then export a report for your records.', points: ['Daily, weekly, monthly and yearly views', 'Doctor and category breakdowns', 'PDF and CSV exports'], image: 'daily-income.png', alt: 'Obstella daily income report with date filters and category totals' },
  patients: { label: 'PATIENT RECORDS', title: 'A history you can come back to.', description: 'Register a patient once. Keep visits, admissions, payments and balances together, then find the record by name, guardian or mobile number.', points: ['Searchable patient directory', 'Visit and admission history', 'CSV export for patient records'], image: 'patient-list.png', alt: 'Obstella patient directory showing patient search, visit filters and records' },
  rooms: { label: 'BED MANAGEMENT', title: 'Know which rooms are available.', description: 'See your blocks, floors and rooms in one occupancy view. Admissions reserve rooms and discharge releases them automatically.', points: ['Live room occupancy', 'Patient and procedure details', 'Separate VIP room tracking'], image: 'hospital-map.png', alt: 'Obstella hospital structure showing room availability across blocks and floors' },
  billing: { label: 'DISCHARGE & BILLING', title: 'Bring the stay to a clear close.', description: 'Use the surgery package, discount and payment details to calculate the final bill. Print the receipt and keep any unpaid balance visible.', points: ['Automatic package and discount calculation', 'Cash, card and bank payment modes', 'Print-ready A5 discharge receipt'], image: 'discharge.png', alt: 'Obstella discharge form with bill, discount and payment fields' },
  dues: { label: 'OUTSTANDING DUES', title: 'Keep unpaid balances in view.', description: 'Find outstanding balances in one worklist, with the oldest first and patient contact numbers beside them. Open the patient record to record payment.', points: ['Total outstanding balance', 'Days since discharge', 'Patient contact details for follow-up'], image: 'dues.png', alt: 'Obstella outstanding dues worklist with balances and patient contact details' },
  visits: { label: 'FRONT DESK', title: 'Make the next visit straightforward.', description: 'Choose OPD, Private OPD, Lab or Ultrasound in one form. Assign the doctor and let consultation fees and test totals fill in automatically.', points: ['Four visit types in one form', 'Automatic fees and lab test totals', 'Queue token printing'], image: 'visit-entry.png', alt: 'Obstella visit entry form with visit types, doctor assignment and fees' }
};
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
let currentScreen = 'income';
function selectScreen(tab, focus = false) {
  const screen = screens[tab.dataset.screen];
  currentScreen = tab.dataset.screen;
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  document.querySelector('#product-panel').setAttribute('aria-labelledby', tab.id);
  document.querySelector('#screen-label').textContent = screen.label;
  document.querySelector('#screen-title').textContent = screen.title;
  document.querySelector('#screen-description').textContent = screen.description;
  document.querySelector('#screen-points').replaceChildren(...screen.points.map(point => {
    const li = document.createElement('li');
    li.textContent = point;
    return li;
  }));
  const image = document.querySelector('#screen-image');
  image.src = `assets/${screen.image}`;
  image.alt = screen.alt;
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectScreen(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = tabs.length - 1;
    if (target !== undefined) {
      event.preventDefault();
      selectScreen(tabs[target], true);
    }
  });
});
const screenDialog = document.querySelector('#screen-dialog');
document.querySelector('.screen-enlarge').addEventListener('click', () => {
  const screen = screens[currentScreen];
  document.querySelector('#dialog-title').textContent = document.querySelector(`[data-screen="${currentScreen}"]`).textContent;
  const image = document.querySelector('#dialog-image');
  image.src = `assets/${screen.image}`;
  image.alt = screen.alt;
  screenDialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click', () => screenDialog.close());
screenDialog.addEventListener('click', event => {
  const rect = screenDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) screenDialog.close();
});
