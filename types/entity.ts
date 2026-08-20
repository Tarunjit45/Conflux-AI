// Entity models for West Bengal Local Knowledge Platform

export type LocalityType = 'state' | 'district' | 'city' | 'town' | 'municipality' | 'block' | 'locality' | 'village';

export interface DistrictEntity {
  id: string; // e.g. 'dist-uttar-dinajpur'
  slug: string; // e.g. 'uttar-dinajpur'
  name: string; // 'Uttar Dinajpur'
  bnName: string; // 'উত্তর দিনাজপুর'
  division: string; // 'Malda Division'
  hqName: string; // 'Raiganj'
  summary: string;
  localBusinessContext?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  priority: number;
}

export interface CityEntity {
  id: string; // e.g. 'loc-raiganj'
  slug: string; // e.g. 'raiganj'
  districtId: string; // 'dist-uttar-dinajpur'
  name: string; // 'Raiganj'
  bnName: string; // 'রায়গঞ্জ'
  type: 'city' | 'town' | 'municipality';
  pincodes: string[]; // ['733134', '733130']
  latitude?: number;
  longitude?: number;
  summary: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

export interface LocalityEntity {
  id: string; // e.g. 'loc-raiganj-mohanbati'
  slug: string; // e.g. 'mohanbati'
  cityId: string; // 'loc-raiganj'
  name: string; // 'Mohanbati'
  bnName: string; // 'মোহনবাটী'
  description?: string;
  landmarkContext?: string;
}

export interface BusinessCategoryEntity {
  id: string; // e.g. 'restaurants-eateries'
  slug: string; // e.g. 'restaurants'
  name: string; // 'Restaurants, Cafes & Eateries'
  bnName: string; // 'রেস্তোরাঁ ও ক্যাফে'
  schemaType: 'Restaurant' | 'Hotel' | 'LocalBusiness' | 'EducationalOrganization' | 'MedicalBusiness' | 'Store';
  icon: string;
}

export interface BusinessEntity {
  id: string;
  slug: string;
  cityId: string;
  localityId?: string;
  categoryId: string;
  name: string;
  bnName?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: Record<string, string>;
  priceRange?: string; // '₹', '₹₹', '₹₹₹', '₹₹₹₹'
  facilities?: string[];
  description: string;
  editorialNotes?: string;
  evidenceRecordIds?: string[];
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  lastVerifiedAt?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}
