export type Province = {
  id: number;
  name: string;
};

export type Regency = {
  id: number;
  name: string;
  province_id: number;
};

export type District = {
  id: number;
  name: string;
  regency_id: number;
};

export type RegionsData = {
  provinces: Province[];
  regencies: Regency[];
  districts: District[];
};

export type LoaderData = {
  provinces: Province[];
  regencies: Regency[];
  districts: District[];
  selectedProvince?: Province;
  selectedRegency?: Regency;
  selectedDistrict?: District;
};