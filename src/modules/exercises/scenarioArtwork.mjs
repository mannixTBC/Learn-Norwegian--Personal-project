// Language-independent artwork: stable scenario IDs, never translated titles or levels.
// The generated sheets have uneven row boundaries; these measured crops exclude seams.
export const scenarioArtworkAtlases = [
  {
    path: 'transport', src: '/images/studio/scenarios/transport.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 204, 403, 594, 786, 1024],
    scenarios: [
      'bus-delay', 'bus-ticket', 'bus-lost-bag', 'bus-stop-question',
      'transport-introduction', 'transport-driver-card', 'transport-break-room', 'transport-radio-check',
      'transport-shift-time', 'transport-break-change', 'transport-delivery-window', 'transport-vehicle-handover',
      'transport-wrong-address', 'transport-damaged-box', 'transport-missing-label', 'transport-passenger-transfer',
      'transport-diversion-message', 'transport-load-priority', 'transport-disputed-delivery', 'transport-shift-summary',
    ],
  },
  {
    path: 'hospitality', src: '/images/studio/scenarios/hospitality.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 191, 383, 575, 768, 1024],
    scenarios: [
      'hotel-booking', 'hotel-towels', 'hotel-room-noise', 'hotel-luggage',
      'hotel-first-shift', 'hotel-room-direction', 'hotel-breakfast-place', 'hotel-extra-cup',
      'hotel-breakfast-time', 'hotel-table-booking', 'hotel-cleaning-time', 'hotel-late-arrival',
      'hotel-wrong-order', 'hotel-room-key', 'hotel-lamp-report', 'hotel-bill-question',
      'hotel-food-information', 'hotel-group-arrival', 'hotel-shift-notes', 'hotel-service-recovery',
    ],
  },
  {
    path: 'office', src: '/images/studio/scenarios/office.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 204, 407, 610, 800, 1024],
    scenarios: [
      'team-plan', 'office-meeting-time', 'office-file-access', 'office-handover',
      'office-introduction', 'office-desk', 'office-contact', 'office-name-check',
      'office-lunch', 'office-room-booking', 'office-online-call', 'office-training-time',
      'office-printer', 'office-wrong-attachment', 'office-task-question', 'office-deadline-risk',
      'office-conflicting-feedback', 'office-scope-change', 'office-status-report', 'office-workload',
    ],
  },
  {
    path: 'general', src: '/images/studio/scenarios/general.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 203, 403, 602, 800, 1024],
    scenarios: [
      'cafe-order', 'general-parcel', 'general-neighbor-noise', 'general-hair-appointment',
      'general-introduction', 'general-library-card', 'general-toilet', 'general-phone-number',
      'general-gym-visit', 'general-coffee-invite', 'general-laundry-time', 'general-weather-plan',
      'general-wrong-parcel', 'general-home-repair', 'general-wrong-drink', 'general-missed-visit',
      'general-subscription', 'general-building-work', 'general-event-change', 'general-service-followup',
    ],
  },
  {
    path: 'construction', src: '/images/studio/scenarios/construction.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 204, 409, 613, 803, 1024],
    scenarios: [
      'site-materials', 'site-tool-missing', 'site-instructions', 'site-delivery-count',
      'site-new-colleague', 'site-storage-location', 'site-marked-box', 'site-clothing-size',
      'site-start-time', 'site-delivery-arrival', 'site-work-order', 'site-meeting-reschedule',
      'site-drawing-version', 'site-wrong-material', 'site-damaged-tool', 'site-access-card',
      'site-weather-update', 'site-handover-incomplete', 'site-two-crews', 'site-extra-request',
    ],
  },
  {
    path: 'healthcare', src: '/images/studio/scenarios/healthcare.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 205, 408, 589, 779, 1024],
    scenarios: [
      'care-comfort', 'care-visit-time', 'care-water-request', 'care-room-air',
      'care-new-colleague', 'care-reading-glasses', 'care-blanket', 'care-common-room',
      'care-phone-call', 'care-activity-choice', 'care-visitor-time', 'care-room-preference',
      'care-missing-belonging', 'care-message-repeat', 'care-appointment-note', 'care-light-request',
      'care-family-update', 'care-choice-respect', 'care-support-handover', 'care-activity-cancelled',
    ],
  },
  {
    path: 'cleaning', src: '/images/studio/scenarios/cleaning.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 204, 409, 614, 820, 1024],
    scenarios: [
      'cleaning-plan', 'cleaning-occupied-room', 'cleaning-supplies', 'cleaning-spill',
      'cleaning-new-team', 'cleaning-cupboard', 'cleaning-room-number', 'cleaning-count-cloths',
      'cleaning-start-time', 'cleaning-floor-order', 'cleaning-meeting-room', 'cleaning-shift-swap',
      'cleaning-vacuum-report', 'cleaning-unmarked-bottle', 'cleaning-forgotten-item', 'cleaning-feedback-spot',
      'cleaning-extra-room', 'cleaning-client-complaint', 'cleaning-handover', 'cleaning-scope',
    ],
  },
  {
    path: 'retail', src: '/images/studio/scenarios/retail.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 203, 408, 612, 801, 1024],
    scenarios: [
      'shop-exchange', 'shop-find-product', 'shop-price-label', 'shop-receipt',
      'shop-new-colleague', 'shop-bag-request', 'shop-color', 'shop-quantity',
      'shop-opening-time', 'shop-reserve-item', 'shop-shift-plan', 'shop-collection-time',
      'shop-damaged-package', 'shop-missing-item', 'shop-wrong-size-label', 'shop-payment-status',
      'shop-return-question', 'shop-stock-promise', 'shop-queue-help', 'shop-order-change',
    ],
  },
  {
    path: 'studies', src: '/images/studio/scenarios/studies.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 198, 396, 594, 792, 1024],
    scenarios: [
      'study-meeting', 'study-library-book', 'study-assignment', 'study-group-roles',
      'study-introduction', 'study-classroom', 'study-borrow-pencil', 'study-repeat-word',
      'study-course-time', 'study-practice-partner', 'study-book-room', 'study-late-arrival',
      'study-platform-access', 'study-missed-class', 'study-feedback', 'study-submit-file',
      'study-source-check', 'study-group-absence', 'study-presentation-length', 'study-project-revision',
    ],
  },
  {
    path: 'family', src: '/images/studio/scenarios/family.webp',
    width: 1536, height: 1024, columns: [0, 384, 768, 1152, 1536],
    rows: [0, 206, 409, 615, 818, 1024],
    scenarios: [
      'kindergarten-plan', 'family-pickup-delay', 'family-spare-clothes', 'family-parent-meeting',
      'family-new-neighbor', 'family-playground', 'family-name-label', 'family-bring-book',
      'family-playdate', 'family-school-meeting', 'family-activity-signup', 'family-shared-dinner',
      'family-lost-mittens', 'family-message-unclear', 'family-photo-consent', 'family-wrong-bag',
      'family-pickup-change', 'family-group-disagreement', 'family-cost-question', 'family-event-followup',
    ],
  },
];

const scenes = new Map();
const defaults = new Map();
for (const atlas of scenarioArtworkAtlases) {
  atlas.scenarios.forEach((id, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    const inset = 4;
    const crop = [
      atlas.columns[column] + inset,
      atlas.rows[row] + inset,
      atlas.columns[column + 1] - atlas.columns[column] - inset * 2,
      atlas.rows[row + 1] - atlas.rows[row] - inset * 2,
    ];
    const artwork = { src: atlas.src, width: atlas.width, height: atlas.height, viewBox: crop.join(' ') };
    scenes.set(id, artwork);
    if (index === 0) defaults.set(atlas.path, artwork);
  });
}

export function getScenarioArtwork(scenarioId, pathId = 'general') {
  return scenes.get(scenarioId) || defaults.get(pathId) || defaults.get('general');
}
