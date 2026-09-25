// Conflux Platform — Authoritative Hierarchical Location Taxonomy
// Supports Country -> State -> District -> City/Town -> Locality dropdown selection

export interface LocalityOption {
  id: string;
  name: string;
  pincode?: string;
}

export interface CityOption {
  id: string;
  name: string;
  localities: LocalityOption[];
}

export interface DistrictOption {
  id: string;
  name: string;
  cities: CityOption[];
}

export interface StateOption {
  id: string;
  name: string;
  districts: DistrictOption[];
}

export interface CountryOption {
  id: string;
  code: string;
  name: string;
  phoneCode: string;
  states: StateOption[];
}

// Standard fallback localities for any city/town without custom micro-wards
const createStandardLocalities = (cityName: string): LocalityOption[] => [
  { id: `${cityName.toLowerCase()}-main-market`, name: `${cityName} Main Market / Station Road` },
  { id: `${cityName.toLowerCase()}-commercial-hub`, name: `${cityName} Central Commercial Hub` },
  { id: `${cityName.toLowerCase()}-town-centre`, name: `${cityName} Town Centre & High Street` },
  { id: `${cityName.toLowerCase()}-administrative-court`, name: `${cityName} Court & Administrative Area` },
  { id: `${cityName.toLowerCase()}-hospital-road`, name: `${cityName} Hospital & Medical Corridor` },
  { id: `${cityName.toLowerCase()}-industrial-estate`, name: `${cityName} Industrial Area / Growth Centre` },
  { id: `${cityName.toLowerCase()}-bypass-junction`, name: `${cityName} Bypass & Highway Crossing` },
  { id: `${cityName.toLowerCase()}-residential-sector`, name: `${cityName} Main Residential Ward` }
];

// ─────────────────────────────────────────────────────────────────────────────
// WEST BENGAL DETAILED LOCALITY ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────

const WB_DISTRICT_NADIA: DistrictOption = {
  id: 'nadia',
  name: 'Nadia',
  cities: [
    {
      id: 'ranaghat',
      name: 'Ranaghat',
      localities: [
        { id: 'ranaghat-subhas-avenue', name: 'Subhas Avenue Commercial Market' },
        { id: 'ranaghat-station-bazaar', name: 'Ranaghat Station Bazaar' },
        { id: 'ranaghat-college-para', name: 'College Para & Court Compound' },
        { id: 'ranaghat-biswaspara', name: 'Biswaspara Main Road' },
        { id: 'ranaghat-anulia', name: 'Anulia Market Zone' },
        { id: 'ranaghat-begopara', name: 'Begopara Main Road' },
        { id: 'ranaghat-rathtala', name: 'Rathtala More & NH12 Junction' },
        { id: 'ranaghat-coopers-camp', name: "Cooper's Camp Area" },
        { id: 'ranaghat-nasra', name: 'Nasra & Mission Field' },
        { id: 'ranaghat-municipal-market', name: 'Old Municipality Market' }
      ]
    },
    {
      id: 'krishnanagar',
      name: 'Krishnanagar',
      localities: [
        { id: 'krishnanagar-high-street', name: 'High Street Commercial Hub' },
        { id: 'krishnanagar-bowbazar', name: 'Bowbazar Market' },
        { id: 'krishnanagar-nediarpara', name: 'Nediarpara' },
        { id: 'krishnanagar-kadamtala', name: 'Kadamtala More' },
        { id: 'krishnanagar-ghurni', name: 'Ghurni Clay Modellers Colony' },
        { id: 'krishnanagar-shaktinagar', name: 'Shaktinagar District Hospital Area' },
        { id: 'krishnanagar-palpara', name: 'Palpara & Sadar Station' },
        { id: 'krishnanagar-bhatshala', name: 'Bhatshala Chowrasta' }
      ]
    },
    {
      id: 'kalyani',
      name: 'Kalyani',
      localities: [
        { id: 'kalyani-central-park', name: 'Central Park Commercial Area' },
        { id: 'kalyani-a-block', name: 'A-Block Market' },
        { id: 'kalyani-b-block', name: 'B-Block Main Market' },
        { id: 'kalyani-iti-more', name: 'ITI More & Station Road' },
        { id: 'kalyani-buddha-park', name: 'Buddha Park Sector' },
        { id: 'kalyani-university-aiims', name: 'University Campus & AIIMS Kalyani' },
        { id: 'kalyani-industrial-growth', name: 'Kalyani Industrial Growth Centre' },
        { id: 'kalyani-silpanchal', name: 'Silpanchal Phase 1 & 2' }
      ]
    },
    {
      id: 'santipur',
      name: 'Santipur',
      localities: [
        { id: 'santipur-handloom-hub', name: 'Santipur Tant Saree & Handloom Hub' },
        { id: 'santipur-station-road', name: 'Santipur Station Road' },
        { id: 'santipur-motiganj', name: 'Motiganj Market' },
        { id: 'santipur-dakghar', name: 'Dakghar Chowrasta' },
        { id: 'santipur-sutragarh', name: 'Sutragarh Weaver Colony' },
        { id: 'santipur-byturkhand', name: 'Byturkhand Road' }
      ]
    },
    {
      id: 'nabadwip',
      name: 'Nabadwip',
      localities: [
        { id: 'nabadwip-poraghat', name: 'Poraghat Commercial Market' },
        { id: 'nabadwip-station-bazaar', name: 'Nabadwip Dham Station Road' },
        { id: 'nabadwip-barabazar', name: 'Barabazar Saree & Brass Market' },
        { id: 'nabadwip-mayapur-ferry', name: 'Mayapur Ghat & Ferry Terminal' },
        { id: 'nabadwip-rudrapara', name: 'Rudrapara Main Road' }
      ]
    },
    {
      id: 'chakdaha',
      name: 'Chakdaha',
      localities: [
        { id: 'chakdaha-station-road', name: 'Chakdaha Station Road' },
        { id: 'chakdaha-subhasnagar', name: 'Subhasnagar Market' },
        { id: 'chakdaha-lalpur', name: 'Lalpur More' },
        { id: 'chakdaha-palpara', name: 'Palpara Crossing' }
      ]
    },
    {
      id: 'birnagar',
      name: 'Birnagar',
      localities: [
        { id: 'birnagar-municipality', name: 'Birnagar Municipality Area' },
        { id: 'birnagar-station-market', name: 'Birnagar Station Road' },
        { id: 'birnagar-taherpur', name: 'Taherpur Border Road' }
      ]
    },
    {
      id: 'tehatta',
      name: 'Tehatta',
      localities: createStandardLocalities('Tehatta')
    },
    {
      id: 'haringhata',
      name: 'Haringhata',
      localities: [
        { id: 'haringhata-dairy-farm', name: 'Haringhata Dairy & Farm Gate' },
        { id: 'haringhata-bara-jagulia', name: 'Bara Jagulia NH12 Crossing' },
        { id: 'haringhata-mohanpur', name: 'Mohanpur University Gate' }
      ]
    },
    {
      id: 'karimpur',
      name: 'Karimpur',
      localities: createStandardLocalities('Karimpur')
    },
    {
      id: 'bethuadahari',
      name: 'Bethuadahari',
      localities: createStandardLocalities('Bethuadahari')
    }
  ]
};

const WB_DISTRICT_KOLKATA: DistrictOption = {
  id: 'kolkata',
  name: 'Kolkata',
  cities: [
    {
      id: 'central-kolkata',
      name: 'Central Kolkata',
      localities: [
        { id: 'kol-bbd-bagh', name: 'BBD Bagh (Dalhousie Square)' },
        { id: 'kol-burrabazar', name: 'Burrabazar Wholesale Trading Hub' },
        { id: 'kol-chandni-chowk', name: 'Chandni Chowk Electronics Hub' },
        { id: 'kol-college-street', name: 'College Street & Boi Para' },
        { id: 'kol-esplanade', name: 'Esplanade & Dharmatala' },
        { id: 'kol-sealdah', name: 'Sealdah Station Commercial Area' }
      ]
    },
    {
      id: 'salt-lake',
      name: 'Salt Lake (Bidhannagar)',
      localities: [
        { id: 'kol-sector-5', name: 'Sector V IT & Tech Parks' },
        { id: 'kol-city-centre-1', name: 'City Centre 1 (DC Block)' },
        { id: 'kol-karunamoyee', name: 'Karunamoyee Central Bus Terminus' },
        { id: 'kol-salt-lake-stadium', name: 'Salt Lake Stadium / Broadway' },
        { id: 'kol-ultadanga', name: 'Ultadanga Crossing' },
        { id: 'kol-sector-1-ca', name: 'Sector 1 (CA / BD Block)' },
        { id: 'kol-sector-2-ia', name: 'Sector 2 (IA / Karunamoyee)' }
      ]
    },
    {
      id: 'new-town',
      name: 'New Town (Rajarhat)',
      localities: [
        { id: 'kol-newtown-action-1', name: 'Action Area 1 (Central Hub)' },
        { id: 'kol-newtown-action-2', name: 'Action Area 2 (Convention Center)' },
        { id: 'kol-newtown-action-3', name: 'Action Area 3 (Fintech Hub)' },
        { id: 'kol-ecospace', name: 'Ecospace & Business Park' },
        { id: 'kol-city-centre-2', name: 'City Centre 2 (Chinar Park)' },
        { id: 'kol-akankha', name: 'Akankha Crossing' }
      ]
    },
    {
      id: 'park-street-south-central',
      name: 'Park Street & South Central',
      localities: [
        { id: 'kol-park-street-main', name: 'Park Street Dining & Business' },
        { id: 'kol-camac-street', name: 'Camac Street High Street' },
        { id: 'kol-russell-street', name: 'Russell Street' },
        { id: 'kol-mullick-bazar', name: 'Mullick Bazar & AJC Bose Road' },
        { id: 'kol-theatre-road', name: 'Shakespeare Sarani (Theatre Road)' }
      ]
    },
    {
      id: 'south-kolkata',
      name: 'South Kolkata',
      localities: [
        { id: 'kol-gariahata', name: 'Gariahat Market & Triangle Park' },
        { id: 'kol-ballygunge', name: 'Ballygunge Phari' },
        { id: 'kol-jadavpur', name: 'Jadavpur 8B Bus Stand' },
        { id: 'kol-alipore', name: 'Alipore & New Alipore' },
        { id: 'kol-bhowanipore', name: 'Bhowanipore & Elgin Road' },
        { id: 'kol-tollygunge', name: 'Tollygunge & Prince Anwar Shah Road' },
        { id: 'kol-behala', name: 'Behala Chowrasta' }
      ]
    },
    {
      id: 'north-kolkata',
      name: 'North Kolkata',
      localities: [
        { id: 'kol-shyambazar', name: 'Shyambazar Five-Point Crossing' },
        { id: 'kol-hatibagan', name: 'Hatibagan Market' },
        { id: 'kol-shobhabazar', name: 'Shobhabazar & Rajbari Area' },
        { id: 'kol-dum-dum-junction', name: 'Dum Dum Junction Area' },
        { id: 'kol-vip-road', name: 'VIP Road Corridor' }
      ]
    }
  ]
};

const WB_DISTRICT_NORTH_24_PARGANAS: DistrictOption = {
  id: 'north-24-parganas',
  name: 'North 24 Parganas',
  cities: [
    {
      id: 'barasat',
      name: 'Barasat',
      localities: [
        { id: 'barasat-champadali', name: 'Champadali More' },
        { id: 'barasat-station-road', name: 'Barasat Station Road' },
        { id: 'barasat-colony-more', name: 'Colony More' },
        { id: 'barasat-dakshinpara', name: 'Dakshinpara' }
      ]
    },
    {
      id: 'barrackpore',
      name: 'Barrackpore',
      localities: [
        { id: 'barrackpore-station', name: 'Barrackpore Station Bazaar' },
        { id: 'barrackpore-cantonment', name: 'Cantonment Area' },
        { id: 'barrackpore-chiriamore', name: 'Chiriamore Crossing' }
      ]
    },
    {
      id: 'habra',
      name: 'Habra',
      localities: createStandardLocalities('Habra')
    },
    {
      id: 'bongaon',
      name: 'Bongaon',
      localities: createStandardLocalities('Bongaon')
    },
    {
      id: 'basirhat',
      name: 'Basirhat',
      localities: createStandardLocalities('Basirhat')
    },
    {
      id: 'madhyamgram',
      name: 'Madhyamgram',
      localities: createStandardLocalities('Madhyamgram')
    },
    {
      id: 'naihati',
      name: 'Naihati',
      localities: createStandardLocalities('Naihati')
    }
  ]
};

const WB_DISTRICT_HOWRAH: DistrictOption = {
  id: 'howrah',
  name: 'Howrah',
  cities: [
    {
      id: 'howrah-city',
      name: 'Howrah City',
      localities: [
        { id: 'howrah-station', name: 'Howrah Station Area' },
        { id: 'howrah-shibpur', name: 'Shibpur Mandirtala' },
        { id: 'howrah-salkia', name: 'Salkia Chowrasta' },
        { id: 'howrah-kadamtala', name: 'Kadamtala Market' },
        { id: 'howrah-panchanantala', name: 'Panchanantala Road' }
      ]
    },
    {
      id: 'bally',
      name: 'Bally',
      localities: createStandardLocalities('Bally')
    },
    {
      id: 'uluberia',
      name: 'Uluberia',
      localities: createStandardLocalities('Uluberia')
    }
  ]
};

const WB_DISTRICT_HOOGHLY: DistrictOption = {
  id: 'hooghly',
  name: 'Hooghly',
  cities: [
    {
      id: 'chinsurah',
      name: 'Chinsurah',
      localities: createStandardLocalities('Chinsurah')
    },
    {
      id: 'serampore',
      name: 'Serampore',
      localities: createStandardLocalities('Serampore')
    },
    {
      id: 'chandannagar',
      name: 'Chandannagar',
      localities: createStandardLocalities('Chandannagar')
    },
    {
      id: 'uttarpara',
      name: 'Uttarpara',
      localities: createStandardLocalities('Uttarpara')
    },
    {
      id: 'bandel',
      name: 'Bandel',
      localities: createStandardLocalities('Bandel')
    }
  ]
};

const WB_DISTRICT_PASCHIM_BARDHAMAN: DistrictOption = {
  id: 'paschim-bardhaman',
  name: 'Paschim Bardhaman',
  cities: [
    {
      id: 'asansol',
      name: 'Asansol',
      localities: createStandardLocalities('Asansol')
    },
    {
      id: 'durgapur',
      name: 'Durgapur',
      localities: [
        { id: 'durgapur-city-centre', name: 'City Centre Commercial Complex' },
        { id: 'durgapur-benachity', name: 'Benachity Main Bazaar' },
        { id: 'durgapur-steel-township', name: 'Steel Township (DSP)' },
        { id: 'durgapur-bhangore', name: 'Bhangore / Muchipara' }
      ]
    },
    {
      id: 'raniganj',
      name: 'Raniganj',
      localities: createStandardLocalities('Raniganj')
    }
  ]
};

const WB_DISTRICT_PURBA_MEDINIPUR: DistrictOption = {
  id: 'purba-medinipur',
  name: 'Purba Medinipur',
  cities: [
    {
      id: 'haldia',
      name: 'Haldia',
      localities: [
        { id: 'haldia-port-belt', name: 'Port & Industrial Belt' },
        { id: 'haldia-township', name: 'Haldia Township Market' },
        { id: 'haldia-durgachak', name: 'Durgachak Commercial Hub' }
      ]
    },
    {
      id: 'tamluk',
      name: 'Tamluk',
      localities: createStandardLocalities('Tamluk')
    },
    {
      id: 'contai',
      name: 'Contai',
      localities: createStandardLocalities('Contai')
    },
    {
      id: 'digha',
      name: 'Digha',
      localities: createStandardLocalities('Digha')
    }
  ]
};

const createStandardDistrict = (districtId: string, districtName: string, primaryCityName: string): DistrictOption => ({
  id: districtId,
  name: districtName,
  cities: [
    {
      id: `${districtId}-hq`,
      name: primaryCityName,
      localities: createStandardLocalities(primaryCityName)
    },
    {
      id: `${districtId}-market`,
      name: `${districtName} Station Area`,
      localities: createStandardLocalities(`${districtName} Station`)
    }
  ]
});

// All 23 West Bengal Districts
const ALL_WB_DISTRICTS: DistrictOption[] = [
  WB_DISTRICT_NADIA,
  WB_DISTRICT_KOLKATA,
  WB_DISTRICT_NORTH_24_PARGANAS,
  WB_DISTRICT_HOWRAH,
  WB_DISTRICT_HOOGHLY,
  WB_DISTRICT_PASCHIM_BARDHAMAN,
  WB_DISTRICT_PURBA_MEDINIPUR,
  createStandardDistrict('south-24-parganas', 'South 24 Parganas', 'Baruipur'),
  createStandardDistrict('purba-bardhaman', 'Purba Bardhaman', 'Bardhaman City'),
  createStandardDistrict('paschim-medinipur', 'Paschim Medinipur', 'Midnapore'),
  createStandardDistrict('birbhum', 'Birbhum', 'Suri'),
  createStandardDistrict('murshidabad', 'Murshidabad', 'Berhampore'),
  createStandardDistrict('darjeeling', 'Darjeeling', 'Darjeeling Town'),
  createStandardDistrict('jalpaiguri', 'Jalpaiguri', 'Jalpaiguri Town'),
  createStandardDistrict('alipurduar', 'Alipurduar', 'Alipurduar Town'),
  createStandardDistrict('cooch-behar', 'Cooch Behar', 'Cooch Behar Town'),
  createStandardDistrict('malda', 'Malda', 'English Bazar'),
  createStandardDistrict('uttar-dinajpur', 'Uttar Dinajpur', 'Raiganj'),
  createStandardDistrict('dakshin-dinajpur', 'Dakshin Dinajpur', 'Balurghat'),
  createStandardDistrict('bankura', 'Bankura', 'Bankura Town'),
  createStandardDistrict('purulia', 'Purulia', 'Purulia Town'),
  createStandardDistrict('jhargram', 'Jhargram', 'Jhargram Town'),
  createStandardDistrict('kalimpong', 'Kalimpong', 'Kalimpong Town')
];

// Major Indian States
const createStandardIndianState = (stateId: string, stateName: string, hqCity: string): StateOption => ({
  id: stateId,
  name: stateName,
  districts: [
    {
      id: `${stateId}-hq-district`,
      name: `${hqCity} District`,
      cities: [
        {
          id: `${stateId}-main-city`,
          name: hqCity,
          localities: createStandardLocalities(hqCity)
        }
      ]
    }
  ]
});

const ALL_INDIAN_STATES: StateOption[] = [
  {
    id: 'west-bengal',
    name: 'West Bengal',
    districts: ALL_WB_DISTRICTS
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    districts: [
      {
        id: 'mumbai-city',
        name: 'Mumbai City',
        cities: [
          {
            id: 'south-mumbai',
            name: 'South Mumbai',
            localities: [
              { id: 'mum-nariman-point', name: 'Nariman Point & Fort' },
              { id: 'mum-colaba', name: 'Colaba & Cuffe Parade' },
              { id: 'mum-marine-lines', name: 'Marine Lines & Churchgate' },
              { id: 'mum-lower-parel', name: 'Lower Parel Commercial Mills' }
            ]
          },
          {
            id: 'mumbai-suburban',
            name: 'Mumbai Suburban',
            localities: [
              { id: 'mum-bkc', name: 'Bandra Kurla Complex (BKC)' },
              { id: 'mum-andheri-east', name: 'Andheri East (MIDC / SEEPZ)' },
              { id: 'mum-powai', name: 'Powai Business District' },
              { id: 'mum-juhu', name: 'Juhu & Vile Parle' },
              { id: 'mum-borivali', name: 'Borivali & Kandivali' }
            ]
          }
        ]
      },
      {
        id: 'pune',
        name: 'Pune',
        cities: [
          {
            id: 'pune-city',
            name: 'Pune City',
            localities: [
              { id: 'pune-hinjewadi', name: 'Hinjewadi Infotech Park' },
              { id: 'pune-viman-nagar', name: 'Viman Nagar' },
              { id: 'pune-kothrud', name: 'Kothrud' },
              { id: 'pune-shivajinagar', name: 'Shivajinagar Central' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'delhi-nct',
    name: 'Delhi (NCT)',
    districts: [
      {
        id: 'central-delhi',
        name: 'Central Delhi',
        cities: [
          {
            id: 'new-delhi',
            name: 'New Delhi',
            localities: [
              { id: 'del-connaught-place', name: 'Connaught Place (CP)' },
              { id: 'del-barakhamba', name: 'Barakhamba Road' },
              { id: 'del-chankayapuri', name: 'Chanakyapuri Diplomatic Enclave' },
              { id: 'del-karol-bagh', name: 'Karol Bagh Market' }
            ]
          }
        ]
      },
      {
        id: 'south-delhi',
        name: 'South Delhi',
        cities: [
          {
            id: 'south-delhi-city',
            name: 'South Delhi',
            localities: [
              { id: 'del-hauz-khas', name: 'Hauz Khas & Green Park' },
              { id: 'del-saket', name: 'Saket District Centre' },
              { id: 'del-nehru-place', name: 'Nehru Place Tech Hub' },
              { id: 'del-lajpat-nagar', name: 'Lajpat Nagar Central Market' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    districts: [
      {
        id: 'bengaluru-urban',
        name: 'Bengaluru Urban',
        cities: [
          {
            id: 'bengaluru',
            name: 'Bengaluru',
            localities: [
              { id: 'blr-koramangala', name: 'Koramangala Start-up Hub' },
              { id: 'blr-indiranagar', name: 'Indiranagar 100ft Road' },
              { id: 'blr-whitefield', name: 'Whitefield EPIP Zone' },
              { id: 'blr-electronic-city', name: 'Electronic City Phase 1 & 2' },
              { id: 'blr-mg-road', name: 'MG Road & Brigade Road' },
              { id: 'blr-hsr-layout', name: 'HSR Layout' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    districts: [
      {
        id: 'chennai',
        name: 'Chennai',
        cities: [
          {
            id: 'chennai-city',
            name: 'Chennai City',
            localities: [
              { id: 'chn-omr', name: 'OMR IT Express Highway' },
              { id: 'chn-t-nagar', name: 'T. Nagar Retail Hub' },
              { id: 'chn-guindy', name: 'Guindy Industrial Estate' },
              { id: 'chn-anna-nagar', name: 'Anna Nagar' }
            ]
          }
        ]
      }
    ]
  },
  createStandardIndianState('uttar-pradesh', 'Uttar Pradesh', 'Lucknow'),
  createStandardIndianState('gujarat', 'Gujarat', 'Ahmedabad'),
  createStandardIndianState('telangana', 'Telangana', 'Hyderabad'),
  createStandardIndianState('rajasthan', 'Rajasthan', 'Jaipur'),
  createStandardIndianState('kerala', 'Kerala', 'Kochi'),
  createStandardIndianState('bihar', 'Bihar', 'Patna'),
  createStandardIndianState('odisha', 'Odisha', 'Bhubaneswar'),
  createStandardIndianState('punjab', 'Punjab', 'Chandigarh'),
  createStandardIndianState('haryana', 'Haryana', 'Gurugram'),
  createStandardIndianState('assam', 'Assam', 'Guwahati'),
  createStandardIndianState('jharkhand', 'Jharkhand', 'Ranchi'),
  createStandardIndianState('andhra-pradesh', 'Andhra Pradesh', 'Visakhapatnam'),
  createStandardIndianState('madhya-pradesh', 'Madhya Pradesh', 'Bhopal'),
  createStandardIndianState('chhattisgarh', 'Chhattisgarh', 'Raipur'),
  createStandardIndianState('uttarakhand', 'Uttarakhand', 'Dehradun'),
  createStandardIndianState('himachal-pradesh', 'Himachal Pradesh', 'Shimla'),
  createStandardIndianState('goa', 'Goa', 'Panaji')
];

// ─────────────────────────────────────────────────────────────────────────────
// WORLDWIDE COUNTRY REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

export const WORLD_COUNTRIES: CountryOption[] = [
  {
    id: 'india',
    code: 'IN',
    name: 'India',
    phoneCode: '+91',
    states: ALL_INDIAN_STATES
  },
  {
    id: 'united-states',
    code: 'US',
    name: 'United States',
    phoneCode: '+1',
    states: [
      {
        id: 'california',
        name: 'California',
        districts: [
          {
            id: 'san-francisco-county',
            name: 'San Francisco County',
            cities: [
              { id: 'san-francisco', name: 'San Francisco', localities: createStandardLocalities('San Francisco') },
              { id: 'silicon-valley', name: 'Silicon Valley / San Jose', localities: createStandardLocalities('San Jose') }
            ]
          },
          {
            id: 'los-angeles-county',
            name: 'Los Angeles County',
            cities: [
              { id: 'los-angeles', name: 'Los Angeles', localities: createStandardLocalities('Los Angeles') }
            ]
          }
        ]
      },
      {
        id: 'new-york',
        name: 'New York',
        districts: [
          {
            id: 'new-york-county',
            name: 'New York County',
            cities: [
              { id: 'manhattan', name: 'Manhattan', localities: createStandardLocalities('Manhattan') },
              { id: 'brooklyn', name: 'Brooklyn', localities: createStandardLocalities('Brooklyn') }
            ]
          }
        ]
      },
      {
        id: 'texas',
        name: 'Texas',
        districts: [
          {
            id: 'travis-county',
            name: 'Travis County (Austin)',
            cities: [
              { id: 'austin', name: 'Austin', localities: createStandardLocalities('Austin') }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'united-kingdom',
    code: 'GB',
    name: 'United Kingdom',
    phoneCode: '+44',
    states: [
      {
        id: 'england',
        name: 'England',
        districts: [
          {
            id: 'greater-london',
            name: 'Greater London',
            cities: [
              { id: 'city-of-london', name: 'City of London', localities: createStandardLocalities('Central London') },
              { id: 'westminster', name: 'Westminster', localities: createStandardLocalities('Westminster') }
            ]
          },
          {
            id: 'greater-manchester',
            name: 'Greater Manchester',
            cities: [
              { id: 'manchester', name: 'Manchester', localities: createStandardLocalities('Manchester') }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'united-arab-emirates',
    code: 'AE',
    name: 'United Arab Emirates',
    phoneCode: '+971',
    states: [
      {
        id: 'dubai-emirate',
        name: 'Dubai',
        districts: [
          {
            id: 'dubai-central',
            name: 'Dubai Central District',
            cities: [
              {
                id: 'dubai-city',
                name: 'Dubai City',
                localities: [
                  { id: 'dxb-downtown', name: 'Downtown Dubai & Burj Khalifa' },
                  { id: 'dxb-business-bay', name: 'Business Bay' },
                  { id: 'dxb-difc', name: 'DIFC Financial Centre' },
                  { id: 'dxb-marina', name: 'Dubai Marina & JBR' },
                  { id: 'dxb-deira', name: 'Deira Commercial Souk' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'abu-dhabi-emirate',
        name: 'Abu Dhabi',
        districts: [
          {
            id: 'abu-dhabi-central',
            name: 'Abu Dhabi Central',
            cities: [
              { id: 'abu-dhabi-city', name: 'Abu Dhabi City', localities: createStandardLocalities('Abu Dhabi') }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'canada',
    code: 'CA',
    name: 'Canada',
    phoneCode: '+1',
    states: [
      {
        id: 'ontario',
        name: 'Ontario',
        districts: [
          {
            id: 'greater-toronto',
            name: 'Greater Toronto Area',
            cities: [
              { id: 'toronto', name: 'Toronto', localities: createStandardLocalities('Toronto') },
              { id: 'mississauga', name: 'Mississauga', localities: createStandardLocalities('Mississauga') }
            ]
          }
        ]
      },
      {
        id: 'british-columbia',
        name: 'British Columbia',
        districts: [
          {
            id: 'greater-vancouver',
            name: 'Metro Vancouver',
            cities: [
              { id: 'vancouver', name: 'Vancouver', localities: createStandardLocalities('Vancouver') }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'australia',
    code: 'AU',
    name: 'Australia',
    phoneCode: '+61',
    states: [
      {
        id: 'new-south-wales',
        name: 'New South Wales',
        districts: [
          {
            id: 'sydney-metro',
            name: 'Sydney Metropolitan',
            cities: [
              { id: 'sydney-cbd', name: 'Sydney CBD', localities: createStandardLocalities('Sydney CBD') }
            ]
          }
        ]
      },
      {
        id: 'victoria',
        name: 'Victoria',
        districts: [
          {
            id: 'melbourne-metro',
            name: 'Melbourne Metropolitan',
            cities: [
              { id: 'melbourne-cbd', name: 'Melbourne CBD', localities: createStandardLocalities('Melbourne CBD') }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'singapore',
    code: 'SG',
    name: 'Singapore',
    phoneCode: '+65',
    states: [
      {
        id: 'singapore-main',
        name: 'Singapore City State',
        districts: [
          {
            id: 'central-region-sg',
            name: 'Central Business District',
            cities: [
              {
                id: 'singapore-cbd',
                name: 'Singapore CBD',
                localities: [
                  { id: 'sg-marina-bay', name: 'Marina Bay Financial Centre' },
                  { id: 'sg-raffles-place', name: 'Raffles Place' },
                  { id: 'sg-orchard-road', name: 'Orchard Road Commercial District' },
                  { id: 'sg-changi-hub', name: 'Changi Business Park' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'bangladesh',
    code: 'BD',
    name: 'Bangladesh',
    phoneCode: '+880',
    states: [
      {
        id: 'dhaka-division',
        name: 'Dhaka Division',
        districts: [
          {
            id: 'dhaka-district',
            name: 'Dhaka District',
            cities: [
              {
                id: 'dhaka-city',
                name: 'Dhaka City',
                localities: [
                  { id: 'bd-gulshan', name: 'Gulshan Commercial Area' },
                  { id: 'bd-banani', name: 'Banani' },
                  { id: 'bd-motijheel', name: 'Motijheel Commercial Area' },
                  { id: 'bd-dhanmondi', name: 'Dhanmondi' },
                  { id: 'bd-uttara', name: 'Uttara Sector Area' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'chittagong-division',
        name: 'Chittagong Division',
        districts: [
          {
            id: 'chittagong-district',
            name: 'Chittagong District',
            cities: [
              { id: 'chittagong-city', name: 'Chittagong Port City', localities: createStandardLocalities('Chittagong') }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'germany',
    code: 'DE',
    name: 'Germany',
    phoneCode: '+49',
    states: [
      {
        id: 'berlin-state',
        name: 'Berlin',
        districts: [
          {
            id: 'berlin-district',
            name: 'Berlin District',
            cities: [
              { id: 'berlin-city', name: 'Berlin City', localities: createStandardLocalities('Berlin Mitte') }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'saudi-arabia',
    code: 'SA',
    name: 'Saudi Arabia',
    phoneCode: '+966',
    states: [
      {
        id: 'riyadh-province',
        name: 'Riyadh Province',
        districts: [
          {
            id: 'riyadh-district',
            name: 'Riyadh District',
            cities: [
              { id: 'riyadh-city', name: 'Riyadh City', localities: createStandardLocalities('Riyadh Central') }
            ]
          }
        ]
      }
    ]
  }
];

// Helper Functions
export const getCountries = (): CountryOption[] => WORLD_COUNTRIES;

export const getStatesForCountry = (countryId: string): StateOption[] => {
  const country = WORLD_COUNTRIES.find(c => c.id === countryId || c.code === countryId);
  return country ? country.states : [];
};

export const getDistrictsForState = (countryId: string, stateId: string): DistrictOption[] => {
  const states = getStatesForCountry(countryId);
  const state = states.find(s => s.id === stateId);
  return state ? state.districts : [];
};

export const getCitiesForDistrict = (countryId: string, stateId: string, districtId: string): CityOption[] => {
  const districts = getDistrictsForState(countryId, stateId);
  const district = districts.find(d => d.id === districtId);
  return district ? district.cities : [];
};

export const getLocalitiesForCity = (
  countryId: string,
  stateId: string,
  districtId: string,
  cityId: string
): LocalityOption[] => {
  const cities = getCitiesForDistrict(countryId, stateId, districtId);
  const city = cities.find(c => c.id === cityId);
  return city ? city.localities : [];
};
