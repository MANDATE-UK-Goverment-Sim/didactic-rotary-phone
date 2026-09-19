(() => {
  const parties = [
    { id:'lab', name:'Labour', short:'LAB', color:'#e3132c', dark:'#b80e22' },
    { id:'con', name:'Conservative', short:'CON', color:'#1477d4', dark:'#0d5ba6' },
    { id:'ld', name:'Liberal Democrat', short:'LD', color:'#f5a623', dark:'#c97d05' },
    { id:'ref', name:'Reform UH', short:'REF', color:'#16b8c4', dark:'#0a909a' },
    { id:'grn', name:'Green', short:'GRN', color:'#31aa48', dark:'#1f7e33' },
    { id:'uip', name:'UIP', short:'UIP', color:'#6d42c7', dark:'#4e2a9c' },
    { id:'oth', name:'Independent / Other', short:'OTH', color:'#7a8594', dark:'#58616d' }
  ];

  const regions = [
    'Crownshire','Northmarch','Caeldor Northlands','Eastern Coasts','Heartlands',
    'Western Vale','South Coast','Kingfisher Counties','Rivermere','High Moor',
    'Royal Boroughs','Outer Isles','Central Capital'
  ];

  const stems = [
    'Alderwick','Ashcombe','Bellmere','Blackthorn','Bracken','Briarfield','Brookmere','Calder','Carrow','Cedarford',
    'Cliffhaven','Crownfield','Dunmere','Eastmere','Elmstead','Fairbourne','Foxley','Glenford','Goldmere','Graywick',
    'Harbour','Hawthorne','Highcross','Kingsbridge','Lakeford','Larkhill','Lowmere','Marshfield','Meadowgate','Moorland',
    'Northgate','Oakminster','Pinehurst','Queensgate','Redford','Ridgeway','Rivergate','Rosebury','Seabourne','Silvermere',
    'Southbank','Stonebridge','Stormwick','Thornbury','Valehurst','Westhaven','Whiteford','Willowmere','Windermere','Woodgate'
  ];

  const suffix = [
    'Central',
    'North',
    'South',
    'East',
    'West',
    'Vale',
    'Heights',
    'Riverside',
    'Park',
    'Harbour'
  ];

  function hash(str){
    let h = 2166136261;

    for(let i=0;i<str.length;i++){
      h ^= str.charCodeAt(i);
      h = Math.imul(h,16777619);
    }

    return (h >>> 0);
  }

  function pickWinner(seed){
    const n = hash(seed) % 1000;

    if(n < 365) return 'lab';
    if(n < 680) return 'con';
    if(n < 780) return 'ld';
    if(n < 865) return 'ref';
    if(n < 925) return 'grn';
    if(n < 960) return 'uip';

    return 'oth';
  }

  function otherThan(id, seed){
    const opts = parties.filter(
      p => p.id !== id && p.id !== 'oth'
    );

    return opts[
      hash(seed) % opts.length
    ].id;
  }

  function makeShares(winner, seed){
    const base = {};

    parties.forEach((p,i) => {
      base[p.id] =
        3 +
        (hash(seed+p.id) % 130) / 10;
    });

    base[winner] +=
      24 +
      (hash(seed+'w') % 130) / 10;

    let total =
      Object.values(base)
        .reduce((a,b)=>a+b,0);

    const scaled = {};

    let used = 0;

    parties.forEach((p,i) => {

      if(i === parties.length-1){
        return;
      }

      const v = Math.max(
        1,
        Math.round(
          (base[p.id] / total) * 1000
        ) / 10
      );

      scaled[p.id] = v;

      used += v;
    });

    scaled[parties.at(-1).id] =
      Math.max(
        0.1,
        Math.round(
          (100-used) * 10
        ) / 10
      );

    return scaled;
  }

  // =========================================================
  // 650 GENERAL ELECTION CONSTITUENCIES
  // =========================================================

  const constituencies = [];

  for(let r=0;r<regions.length;r++){

    for(let i=0;i<50;i++){

      const stem =
        stems[i];

      const name =
        `${stem} ${suffix[(i+r)%suffix.length]}`;

      const id =
        `S${String(
          r*50+i+1
        ).padStart(3,'0')}`;

      const previous =
        pickWinner('prev'+id);

      let prediction =
        pickWinner('pred'+id);

      if(
        (hash(id+'hold')%100) < 58
      ){
        prediction = previous;
      }

      const runner =
        otherThan(
          prediction,
          id+'runner'
        );

      const likelihood =
        51 +
        (hash(id+'like') % 38);

      const electorate =
        41000 +
        (hash(id+'elect') % 42000);

      const turnout =
        54 +
        (hash(id+'turn') % 190) / 10;

      const previousShares =
        makeShares(
          previous,
          'ps'+id
        );

      const predictedShares =
        makeShares(
          prediction,
          'fs'+id
        );

      constituencies.push({
        id,
        name,
        region:regions[r],

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

        result:null,
        majority:null,

        mapX:
          (r%4)*12 +
          (i%10) +
          4 +
          (
            (
              Math.floor(r/4)%2
            ) * 3
          ),

        mapY:
          Math.floor(r/4)*8 +
          Math.floor(i/10) +
          2 +
          (
            (r%4)*2
          )
      });
    }
  }

  // =========================================================
  // 128 COUNCILS
  // =========================================================

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

  for(let i=0;i<128;i++){

    const id =
      `C${String(
        i+1
      ).padStart(3,'0')}`;

    const name =
      `${
        councilRoots[
          i%councilRoots.length
        ]
      } ${
        i<16
          ? ''
          : Math.floor(i/16)+1
      } ${
        councilTypes[
          Math.floor(i/16) %
          councilTypes.length
        ]
      }`
      .replace(/\s+/g,' ')
      .trim();

    const previous =
      pickWinner(
        'cprev'+id
      );

    let prediction =
      pickWinner(
        'cpred'+id
      );

    if(
      hash(id+'keep')%100 < 62
    ){
      prediction = previous;
    }

    councils.push({
      id,
      name,

      region:
        regions[
          i%regions.length
        ],

      previous,
      prediction,

      result:null,

      councillorChange:0,

      seats:
        32 +
        (
          hash(id)%49
        )
    });
  }

  // =========================================================
  // USHER GENERAL ELECTION HISTORY
  // ONLY THESE SIX ELECTIONS ARE NOW USED
  // =========================================================

  const historyYears = [
    2010,
    2015,
    2017,
    2019,
    2024,
    2026
  ];

  const history = {

    lab:[
      {year:2010,seats:201},
      {year:2015,seats:232},
      {year:2017,seats:275},
      {year:2019,seats:221},
      {year:2024,seats:348},
      {year:2026,seats:149}
    ],

    con:[
      {year:2010,seats:298},
      {year:2015,seats:331},
      {year:2017,seats:305},
      {year:2019,seats:376},
      {year:2024,seats:161},
      {year:2026,seats:188}
    ],

    ld:[
      {year:2010,seats:57},
      {year:2015,seats:21},
      {year:2017,seats:29},
      {year:2019,seats:34},
      {year:2024,seats:52},
      {year:2026,seats:53}
    ],

    ref:[
      {year:2010,seats:0},
      {year:2015,seats:1},
      {year:2017,seats:0},
      {year:2019,seats:2},
      {year:2024,seats:18},
      {year:2026,seats:12}
    ],

    grn:[
      {year:2010,seats:1},
      {year:2015,seats:4},
      {year:2017,seats:6},
      {year:2019,seats:11},
      {year:2024,seats:27},
      {year:2026,seats:98}
    ],

    uip:[
      {year:2010,seats:2},
      {year:2015,seats:7},
      {year:2017,seats:12},
      {year:2019,seats:25},
      {year:2024,seats:36},
      {year:2026,seats:142}
    ],

    oth:[
      {year:2010,seats:91},
      {year:2015,seats:54},
      {year:2017,seats:23},
      {year:2019,seats:31},
      {year:2024,seats:8},
      {year:2026,seats:8}
    ]
  };

  window.USHER_DATA = {
    parties,
    regions,
    constituencies,
    councils,
    historyYears,
    history
  };

})();
