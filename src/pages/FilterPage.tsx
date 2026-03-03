import {
  Form,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router-dom";
import type { RegionsData, LoaderData } from "./types";
import {
  Map,
  Building2,
  MapPin,
  LayoutDashboard,
  RotateCcw,
} from "lucide-react";

/* =======================
   LOADER
======================= */

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const provinceParam = url.searchParams.get("province");
  const regencyParam = url.searchParams.get("regency");
  const districtParam = url.searchParams.get("district");

  const provinceId = provinceParam ? Number(provinceParam) : undefined;
  const regencyId = regencyParam ? Number(regencyParam) : undefined;
  const districtId = districtParam ? Number(districtParam) : undefined;

  const res = await fetch("/data/indonesia_regions.json");
  const data: RegionsData = await res.json();

  const selectedProvince = data.provinces.find(p => p.id === provinceId);
  const selectedRegency =
  provinceId
    ? data.regencies.find(
        r => r.id === regencyId && r.province_id === provinceId
      )
    : undefined;
  const selectedDistrict =
  regencyId
    ? data.districts.find(
        d => d.id === districtId && d.regency_id === regencyId
      )
    : undefined;

  return {
    provinces: data.provinces,
    regencies: provinceId
      ? data.regencies.filter(r => r.province_id === provinceId)
      : [],
    districts: regencyId
      ? data.districts.filter(d => d.regency_id === regencyId)
      : [],
    selectedProvince,
    selectedRegency,
    selectedDistrict,
  } satisfies LoaderData;
}

/* =======================
   REUSABLE COMPONENTS
======================= */

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
      </div>

      <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
        <Icon size={24} />
      </div>
    </div>
  );
}

type SelectFieldProps<T> = {
  label: string;
  name: string;
  options: T[];
  value?: number;
  disabled?: boolean;
};

function SelectField<T extends { id: number; name: string }>({
  label,
  name,
  options,
  value,
  disabled,
}: SelectFieldProps<T>) {
  return (
    <div>
      <label className="block text-sm mb-2 font-medium">{label}</label>
      <select
        name={name}
        defaultValue={value ?? ""}
        disabled={disabled}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 transition"
      >
        <option value="">Pilih {label}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =======================
   PAGE
======================= */

export default function FilterPage() {
  const {
    provinces,
    regencies,
    districts,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
  } = useLoaderData() as LoaderData;

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col">
        <h1 className="text-xl font-bold mb-10 tracking-tight">
          RegionSaaS
        </h1>

        <nav className="space-y-2 text-sm">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-medium">
            <LayoutDashboard size={18} />
            Dashboard
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Region Overview</h2>
            <p className="text-xs text-gray-400">
              Monitor & filter wilayah Indonesia
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition"
          >
            <RotateCcw size={16} />
            Reset Filter
          </button>
        </header>

        {/* CONTENT */}
        <main className="p-8 space-y-8">

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Total Provinsi"
              value={provinces.length}
              icon={Map}
            />

            <StatCard
              label="Total Kota/Kabupaten"
              value={selectedProvince ? regencies.length : "-"}
              icon={Building2}
            />

            <StatCard
              label="Total Kecamatan"
              value={selectedRegency ? districts.length : "-"}
              icon={MapPin}
            />
          </div>

          {/* FILTER + RESULT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* FILTER */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold mb-6">Filter Wilayah</h3>

              <Form method="get" className="space-y-6">
                <SelectField
                  label="Provinsi"
                  name="province"
                  options={provinces}
                  value={selectedProvince?.id}
                />

                <SelectField
                  label="Kota / Kabupaten"
                  name="regency"
                  options={regencies}
                  value={selectedRegency?.id}
                  disabled={!selectedProvince}
                />

                <SelectField
                  label="Kecamatan"
                  name="district"
                  options={districts}
                  value={selectedDistrict?.id}
                  disabled={!selectedRegency}
                />
              </Form>
            </div>

            {/* RESULT */}
            <div className="md:col-span-2 bg-white rounded-2xl border shadow-sm p-8 flex items-center justify-center">

              {!selectedProvince ? (
                <div className="text-center space-y-3">
                  <div className="text-5xl">🌏</div>
                  <p className="text-lg font-semibold">
                    Mulai dari memilih provinsi
                  </p>
                  <p className="text-sm text-gray-400">
                    Data wilayah akan muncul di sini
                  </p>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-2 text-gray-400 uppercase text-xs tracking-widest">
                      <Map size={16} />
                      Provinsi
                    </div>
                    <h1 className="text-4xl font-bold">
                      {selectedProvince.name}
                    </h1>
                  </div>

                  {selectedRegency && (
                    <div>
                      <div className="flex items-center justify-center gap-2 text-gray-400 uppercase text-xs tracking-widest">
                        <Building2 size={16} />
                        Kota / Kabupaten
                      </div>
                      <h2 className="text-3xl font-semibold">
                        {selectedRegency.name}
                      </h2>
                    </div>
                  )}

                  {selectedDistrict && (
                    <div>
                      <div className="flex items-center justify-center gap-2 text-gray-400 uppercase text-xs tracking-widest">
                        <MapPin size={16} />
                        Kecamatan
                      </div>
                      <h3 className="text-2xl text-gray-600">
                        {selectedDistrict.name}
                      </h3>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}