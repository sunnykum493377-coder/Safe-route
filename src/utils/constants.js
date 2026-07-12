export const MODE_FACTOR = {
  car: 1,
  bike: 1.4,
  bus: 1.85,
  walk: 8
};

export const ICONS = ['⚡', '🛡️', '🗺️'];

export const ROUTE_NAMES = ['Fastest Route', 'Alternate Route', 'Scenic Route'];

export const ROUTE_DESCRIPTIONS = [
  'Fastest road route. Live conditions at destination.',
  'Alternate path — better air quality zone.',
  'Longer but less congested scenic path.'
];

export const TRANSPORT_MODES = [
  { id: 'car', icon: '🚗', label: 'Car' },
  { id: 'bike', icon: '🏍️', label: 'Bike' },
  { id: 'bus', icon: '🚌', label: 'Bus' },
  { id: 'walk', icon: '🚶', label: 'Walk' }
];

// ── Travel Mode definitions ──────────────────────────────────────────────────

export const TRAVEL_MODE_META = {
  normal: {
    routeNames:   ['Fastest Route',     'Alternate Route',   'Scenic Route'],
    icons:        ['⚡',                '🗺️',                '🌿'],
    descriptions: [
      'Fastest road route via main highway. Live traffic factored in.',
      'Balanced alternate — slightly longer but avoids hotspots.',
      'Scenic path through city roads with less congestion.',
    ],
    safetyLabels: ['Standard',          'Standard',          'Standard'],
    aiRec:        [
      '✅ Fastest & most direct route.',
      '↗️ Good alternative if highway is jammed.',
      '🌿 Enjoy a leisurely scenic drive.',
    ],
    trafficStatus: ['Moderate',         'Low',               'Heavy'],
    safetyScoreBonus: [0,               2,                   -5],
    colorOverride: null,
  },
  women: {
    routeNames:   ['Safest Route',       'CCTV-Covered Route', 'Police Patrolled'],
    icons:        ['🌸',                 '📹',                 '👮'],
    descriptions: [
      'Well-lit roads with CCTV coverage and police stations nearby. Avoids isolated zones.',
      'Maximum CCTV surveillance corridor — highly monitored stretch.',
      'Route runs past active police stations with regular night patrols.',
    ],
    safetyLabels: ['Women Safe',         'Surveillance+',      'Police Zone'],
    aiRec:        [
      '✅ Recommended for solo women travel.',
      '📹 Best CCTV coverage on this route.',
      '👮 Police patrols active on this corridor.',
    ],
    trafficStatus: ['Low',              'Moderate',            'Low'],
    safetyScoreBonus: [12,              8,                     10],
    colorOverride: null,
  },
  pregnancy: {
    routeNames:   ['Smooth Comfort Route', 'Hospital Proximity Route', 'Rest-Stop Route'],
    icons:        ['🤱',                    '🏥',                       '☕'],
    descriptions: [
      'Smooth, well-maintained roads. Avoids potholes and construction zones.',
      'Stays closest to hospitals and clinics for emergencies.',
      'Includes verified clean rest stops and washrooms along the way.',
    ],
    safetyLabels: ['Smooth Roads',        'Hospitals Nearby',          'Rest Stops'],
    aiRec:        [
      '✅ Most comfortable route — minimal bumps.',
      '🏥 Hospitals accessible within 2 km throughout.',
      '☕ Clean rest areas every 15 km on this path.',
    ],
    trafficStatus: ['Low',                'Moderate',                   'Low'],
    safetyScoreBonus: [8,                 10,                           6],
    colorOverride: null,
  },
  night: {
    routeNames:   ['Lit Safe Route',     'CCTV Night Route',  'Patrolled Night Route'],
    icons:        ['🌙',                 '📷',                '🚔'],
    descriptions: [
      'Well-lit streets throughout. Avoids unlit zones and crime-prone areas.',
      'Full CCTV corridor — monitored 24/7 by traffic authorities.',
      'Active police patrol reported on this route after 10 PM.',
    ],
    safetyLabels: ['Well-Lit',           'Monitored',         'Patrolled'],
    aiRec:        [
      '✅ Best visibility — safest for night driving.',
      '📷 Highest surveillance density after midnight.',
      '🚔 Police presence confirmed on this corridor.',
    ],
    trafficStatus: ['Low',               'Low',               'Very Low'],
    safetyScoreBonus: [10,               9,                   11],
    colorOverride: null,
  },
};

// Extra details shown in the route hover card on the map
export const TRAVEL_MODE_EXTRA = {
  normal: [
    { hospital: 'Rajindra Hospital – 2.1 km', police: 'Patiala Sadar – 1.2 km',  petrol: 'HP Pump – 0.6 km',       cctv: 'Partial',        lighting: 'Good'      },
    { hospital: 'Fortis Patiala – 3.4 km',    police: 'Model Town – 2.5 km',      petrol: 'IOC Station – 1.1 km',   cctv: 'Partial',        lighting: 'Good'      },
    { hospital: 'Civil Hospital – 4.0 km',     police: 'Rajpura City – 0.8 km',    petrol: 'BPCL Pump – 2.3 km',     cctv: 'Low',            lighting: 'Moderate'  },
  ],
  women: [
    { hospital: 'Rajindra Hospital – 1.8 km', police: 'Patiala Sadar – 0.8 km',  petrol: 'HP Pump – 0.6 km',       cctv: 'Full Coverage',  lighting: 'Excellent' },
    { hospital: 'Fortis Patiala – 2.9 km',    police: 'Model Town – 1.2 km',      petrol: 'IOC Station – 1.1 km',   cctv: 'Full Coverage',  lighting: 'Good'      },
    { hospital: 'Civil Hospital – 3.2 km',     police: 'Rajpura City – 0.4 km',    petrol: 'BPCL Pump – 1.8 km',     cctv: 'Partial',        lighting: 'Good'      },
  ],
  pregnancy: [
    { hospital: 'Rajindra Hospital – 1.5 km', police: 'Patiala Sadar – 1.2 km',  petrol: 'HP Pump – 0.6 km',       cctv: 'Partial',        lighting: 'Good',      restStop: 'Mall Cafe – 6 km'    },
    { hospital: 'Fortis Patiala – 1.1 km',    police: 'Model Town – 2.0 km',      petrol: 'IOC Station – 1.1 km',   cctv: 'Partial',        lighting: 'Good',      restStop: 'Dhaba – 8 km'        },
    { hospital: 'Mata Kaushalya – 2.0 km',    police: 'Rajpura City – 0.8 km',    petrol: 'BPCL Pump – 2.0 km',     cctv: 'Low',            lighting: 'Moderate',  restStop: 'Petrol Cafe – 10 km' },
  ],
  night: [
    { hospital: 'Rajindra Hospital – 2.1 km', police: 'Patiala Sadar – 0.6 km',  petrol: 'HP Pump – 0.6 km',       cctv: 'Full Coverage',  lighting: 'Excellent' },
    { hospital: 'Fortis Patiala – 3.4 km',    police: 'Model Town – 1.0 km',      petrol: 'IOC Station – 1.1 km',   cctv: 'Full Coverage',  lighting: 'Good'      },
    { hospital: 'Civil Hospital – 4.0 km',     police: 'Rajpura City – 0.5 km',    petrol: 'BPCL Pump – 2.3 km',     cctv: 'Partial',        lighting: 'Good'      },
  ],
};
