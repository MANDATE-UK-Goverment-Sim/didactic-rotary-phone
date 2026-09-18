(() => {
  // ============================================================
  // USHER ELECTION NIGHT — DATA
  // Fresh V5 data file
  // ============================================================

  const parties = [
    { id: 'lab', name: 'Labour', short: 'LAB', color: '#e3132c', dark: '#b80e22' },
    { id: 'con', name: 'Conservative', short: 'CON', color: '#1477d4', dark: '#0d5ba6' },
    { id: 'ld', name: 'Liberal Democrat', short: 'LD', color: '#f5a623', dark: '#c97d05' },
    { id: 'ref', name: 'Reform UH', short: 'REF', color: '#16b8c4', dark: '#0a909a' },
    { id: 'grn', name: 'Green', short: 'GRN', color: '#31aa48', dark: '#1f7e33' },
    { id: 'uip', name: 'UIP', short: 'UIP', color: '#6d42c7', dark: '#4e2a9c' },
    { id: 'oth', name: 'Independent / Other', short: 'OTH', color: '#7a8594', dark: '#58616d' }
  ];

  const regions = [
    'Crownshire',
    'Northmarch',
    'Caeldor Northlands',
    'Eastern Coasts',
    'Heartlands',
    'Western Vale',
    'South Coast',
    'Kingfisher Counties',
    'Rivermere',
    'High Moor',
    'Royal Boroughs',
    'Outer Isles',
    'Central Capital'
  ];

  const stems = [
    'Alderwick','Ashcombe','Bellmere','Blackthorn','Bracken','Briarfield','Brookmere','Calder','Carrow','Cedarford',
    'Cliffhaven','Crownfield','Dunmere','Eastmere','Elmstead','Fairbourne','Foxley','Glenford','Goldmere','Graywick',
    'Harbour','Hawthorne','Highcross','Kingsbridge','Lakeford','Larkhill','Lowmere','Marshfield','Meadowgate','Moorland',
    'Northgate','Oakminster','Pinehurst','Queensgate','Redford','Ridgeway','Rivergate','Rosebury','Seabourne','Silvermere',
    'Southbank','Stonebridge','Stormwick','Thornbury','Valehurst','Westhaven','Whiteford','Willowmere','Windermere','Woodgate'
  ];

  const suffix = [
    'Central','North','South','East','West','Vale','Heights','Riverside','Park','Harbour'
  ];

  // ------------------------------------------------------------
  // Deterministic helper functions
  // ------------------------------------------------------------

  function hash(str) {
    let h = 2166136261;

    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }

    return h >>> 0;
  }

  function pickWinner(seed) {
    const n = hash(seed) % 1000;

    // Used only for generated previous results and predictions.
    if (n < 350) return 'lab';
    if (n < 675) return 'con';
    if (n < 785) return 'ld';
    if (n < 825) return 'ref';
    if (n < 915) return 'grn';
    if (n < 970) return 'uip';

    return 'oth';
  }

  function otherThan(id, seed) {
    const options = parties.filter(
      p => p.id !== id && p.id !== 'oth'
    );

    return options[hash(seed) % options.length].id;
  }

  function makeShares(winner, seed) {
    const base = {};

    parties.forEach(p => {
      base[p.id] =
        3 +
        (hash(seed + p.id) % 130) / 10;
    });

    base[winner] +=
      24 +
      (hash(seed + 'winner') % 130) / 10;

    const total =
      Object.values(base)
        .reduce((a, b) => a + b, 0);

    const scaled = {};

    let used = 0;

    parties.forEach((p, index) => {

      if (index === parties.length - 1) {
        return;
      }

      const value = Math.max(
        1,
        Math.round(
          (base[p.id] / total) * 1000
        ) / 10
      );

      scaled[p.id] = value;

      used += value;
    });

    scaled[parties.at(-1).id] =
      Math.max(
        0.1,
        Math.round(
          (100 - used) * 10
        ) / 10
      );

    return scaled;
  }


  // ============================================================
  // GENERAL ELECTION
  // 650 CONSTITUENCIES
  // Majority = 326
  // ============================================================

  const constituencies = [];

  for (let r = 0; r < regions.length; r++) {

    for (let i = 0; i < 50; i++) {

      const stem = stems[i];

      const name =
        `${stem} ${suffix[(i + r) % suffix.length]}`;

      const id =
        `S${String(
          r * 50 + i + 1
        ).padStart(3, '0')}`;

      const previous =
        pickWinner(
          'previous-' + id
        );

      let prediction =
        pickWinner(
          'prediction-' + id
        );

      // Most seats are predicted to remain with
      // their previous party, but gains still happen.
      if (
        (hash(id + '-hold') % 100) < 58
      ) {
        prediction = previous;
      }

      const runner =
        otherThan(
          prediction,
          id + '-runner'
        );

      const likelihood =
        51 +
        (
          hash(
            id + '-likelihood'
          ) % 38
        );

      const electorate =
        41000 +
        (
          hash(
            id + '-electorate'
          ) % 42000
        );

      const turnout =
        54 +
        (
          hash(
            id + '-turnout'
          ) % 190
        ) / 10;

      const previousShares =
        makeShares(
          previous,
          'previous-shares-' + id
        );

      const predictedShares =
        makeShares(
          prediction,
          'predicted-shares-' + id
        );

      constituencies.push({
        id,

        name,

        region: regions[r],

        previous,

        prediction,

        runner,

        likelihood,

        electorate,

        turnout:
          Math.round(
            turnout * 10
          ) / 10,

        previousShares,

        predictedShares,

        result: null,

        majority: null,

        mapX:
          (r % 4) * 12 +
          (i % 10) +
          4 +
          (
            (
              Math.floor(r / 4) % 2
            ) * 3
          ),

        mapY:
          Math.floor(r / 4) * 8 +
          Math.floor(i / 10) +
          2 +
          (
            (r % 4) * 2
          )
      });
    }
  }


  // ============================================================
  // COUNCIL ELECTIONS
  // 128 COUNCILS
  // ============================================================

  const councilRoots = [
    'Rivermere',
    'Alder',
    'Crown',
    'Northgate',
    'Southbank',
    'High Moor',
    'West Vale',
    'East Coast',
    'Kingston',
    'Queenstown',
    'Harbour',
    'Meadow',
    'Stone',
    'Oak',
    'Pine',
    'Rose'
  ];

  const councilTypes = [
    'Borough Council',
    'District Council',
    'County Council',
    'City Council',
    'Metropolitan Council',
    'Isles Council',
    'Regional Council',
    'Civic Council'
  ];

  const councils = [];

  for (let i = 0; i < 128; i++) {

    const id =
      `C${String(
        i + 1
      ).padStart(3, '0')}`;

    const name =
      `${
        councilRoots[
          i % councilRoots.length
        ]
      } ${
        i < 16
          ? ''
          : Math.floor(i / 16) + 1
      } ${
        councilTypes[
          Math.floor(i / 16) %
          councilTypes.length
        ]
      }`
        .replace(/\s+/g, ' ')
        .trim();

    const previous =
      pickWinner(
        'council-previous-' + id
      );

    let prediction =
      pickWinner(
        'council-prediction-' + id
      );

    if (
      (hash(id + '-keep') % 100) < 62
    ) {
      prediction = previous;
    }

    councils.push({
      id,

      name,

      region:
        regions[
          i % regions.length
        ],

      previous,

      prediction,

      result: null,

      councillorChange: 0,

      seats:
        32 +
        (
          hash(id) % 49
        )
    });
  }


  // ============================================================
  // USHER GENERAL ELECTION HISTORY
  //
  // These are now the exact election years shown in the
  // presentation:
  //
  // 2010
  // 2015
  // 2017
  // 2019
  // 2024
  // 2026
  // ============================================================

  const historyYears = [
    2010,
    2015,
    2017,
    2019,
    2024,
    2026
  ];


  const history = {


    // ----------------------------------------------------------
    // LABOUR
    // ----------------------------------------------------------

    lab: [

      {
        year: 2010,
        seats: 201
      },

      {
        year: 2015,
        seats: 232
      },

      {
        year: 2017,
        seats: 275
      },

      {
        year: 2019,
        seats: 221
      },

      {
        year: 2024,
        seats: 348
      },

      {
        year: 2026,
        seats: 149
      }

    ],


    // ----------------------------------------------------------
    // CONSERVATIVE
    // ----------------------------------------------------------

    con: [

      {
        year: 2010,
        seats: 298
      },

      {
        year: 2015,
        seats: 331
      },

      {
        year: 2017,
        seats: 305
      },

      {
        year: 2019,
        seats: 376
      },

      {
        year: 2024,
        seats: 161
      },

      {
        year: 2026,
        seats: 188
      }

    ],


    // ----------------------------------------------------------
    // LIBERAL DEMOCRATS
    // ----------------------------------------------------------

    ld: [

      {
        year: 2010,
        seats: 57
      },

      {
        year: 2015,
        seats: 21
      },

      {
        year: 2017,
        seats: 29
      },

      {
        year: 2019,
        seats: 34
      },

      {
        year: 2024,
        seats: 52
      },

      {
        year: 2026,
        seats: 53
      }

    ],


    // ----------------------------------------------------------
    // REFORM UH
    // ----------------------------------------------------------

    ref: [

      {
        year: 2010,
        seats: 0
      },

      {
        year: 2015,
        seats: 1
      },

      {
        year: 2017,
        seats: 0
      },

      {
        year: 2019,
        seats: 2
      },

      {
        year: 2024,
        seats: 18
      },

      {
        year: 2026,
        seats: 12
      }

    ],


    // ----------------------------------------------------------
    // GREEN
    // ----------------------------------------------------------

    grn: [

      {
        year: 2010,
        seats: 1
      },

      {
        year: 2015,
        seats: 4
      },

      {
        year: 2017,
        seats: 6
      },

      {
        year: 2019,
        seats: 11
      },

      {
        year: 2024,
        seats: 27
      },

      {
        year: 2026,
        seats: 98
      }

    ],


    // ----------------------------------------------------------
    // UIP
    // ----------------------------------------------------------

    uip: [

      {
        year: 2010,
        seats: 2
      },

      {
        year: 2015,
        seats: 7
      },

      {
        year: 2017,
        seats: 12
      },

      {
        year: 2019,
        seats: 25
      },

      {
        year: 2024,
        seats: 36
      },

      {
        year: 2026,
        seats: 142
      }

    ],


    // ----------------------------------------------------------
    // INDEPENDENT / OTHER
    // ----------------------------------------------------------

    oth: [

      {
        year: 2010,
        seats: 91
      },

      {
        year: 2015,
        seats: 54
      },

      {
        year: 2017,
        seats: 23
      },

      {
        year: 2019,
        seats: 31
      },

      {
        year: 2024,
        seats: 8
      },

      {
        year: 2026,
        seats: 8
      }

    ]

  };


  // ============================================================
  // MAKE THE DATA AVAILABLE TO THE REST OF THE WEBSITE
  // ============================================================

  window.USHER_DATA = {

    parties,

    regions,

    constituencies,

    councils,

    historyYears,

    history

  };

})();
