"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
const QUALIFICATIONS = [
  "BAMS",
  "MD/MS (Ayurveda)",
  "PhD",
  "Fellowship",
  "Diploma",
  "Other",
];

const SPECIALIZATIONS = [
  "Agad Tantra evam Vidhi Vaidyaka",
  "Dravyaguna Vigyan",
  "Kaumarabhritya",
  "Kayachikitsa",
  "Kriya Sharir",
  "Panchakarma",
  "Prasuti Tantra evam Stree Roga",
  "Rachana Sharir",
  "Rasashastra evam Bhaishajya Kalpana",
  "Roga Nidan evam Vikriti Vigyan",
  "Shalakya Tantra",
  "Shalya Tantra",
  "Samhita & Siddhant",
  "Swasthavritta evam Yoga",
  "Any",
  "Other",
];
const PAGE_SIZE = 50;

export default function JobSeekersPage() {
  const [seekers, setSeekers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [qualificationFilter, setQualificationFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSeekers();
  }, []);

  const fetchSeekers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_JOBS_URL}/admin/employees`
      );

      setSeekers(
        res.data?.data?.employees ||
        res.data?.employees ||
        []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const qualifications = useMemo(() => {
    const set = new Set<string>();

    seekers.forEach((e) =>
      e.qualification?.forEach((q: string) => set.add(q))
    );

    return Array.from(set);
  }, [seekers]);

  const specializations = useMemo(() => {
    const set = new Set<string>();

    seekers.forEach((e) => {
      if (e.specialization) {
        set.add(e.specialization);
      }
    });

    return Array.from(set);
  }, [seekers]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return seekers.filter((emp) => {
      const matchesSearch =
        !q ||
        emp.fullName?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.contactNumber?.toLowerCase().includes(q);

      const matchesQualification =
        !qualificationFilter ||
        emp.qualification?.includes(qualificationFilter);

      const matchesSpecialization =
        !specializationFilter ||
        emp.specialization === specializationFilter;

      const matchesVisibility =
        !visibilityFilter ||
        emp.visibility === visibilityFilter;

      return (
        matchesSearch &&
        matchesQualification &&
        matchesSpecialization &&
        matchesVisibility
      );
    });
  }, [
    seekers,
    search,
    qualificationFilter,
    specializationFilter,
    visibilityFilter,
  ]);

  const totalPages = Math.ceil(
    filteredData.length / PAGE_SIZE
  );

  const paginated = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
  <div className="h-screen flex flex-col">
    {/* Sticky Top Section */}

    <div className="sticky top-0 z-30 border-b border-stone-200">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">
              Job Seekers
            </h1>

            <p className="text-sm text-stone-500 mt-1">
              {filteredData.length} candidates found
            </p>
          </div>
        </div>

        {/* Filters */}

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <input
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="
                h-10
                border
                border-stone-300
                rounded-lg
                px-3
                text-sm
                outline-none
                focus:ring-2
                focus:ring-stone-200
              "
            />

            <select
              value={qualificationFilter}
              onChange={(e) => {
                setQualificationFilter(e.target.value);
                setPage(1);
              }}
              className="
                h-10
                border
                border-stone-300
                rounded-lg
                px-3
                text-sm
                outline-none
              "
            >
              <option value="">
                All Qualifications
              </option>

              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>

            <select
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                setPage(1);
              }}
              className="
                h-10
                border
                border-stone-300
                rounded-lg
                px-3
                text-sm
                outline-none
              "
            >
              <option value="">
                All Specializations
              </option>

              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>

    {/* Scrollable Content */}

    <div className="flex-1 px-6 py-5 overflow-hidden">
      <div className="h-full bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* Scrollable Rows Area */}

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-20 bg-stone-50">
              <tr className="border-b border-stone-200">
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Candidate
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Specialization
                </th>

                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Location
                </th>

                <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="p-6">
                      <div className="h-14 rounded-lg bg-stone-100 animate-pulse" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                paginated.map((emp: any) => (
                  <tr
                    key={emp._id}
                    className="
                      border-b
                      border-stone-100
                      hover:bg-stone-50
                      transition-colors
                    "
                  >
                    {/* Candidate */}

                    <td className="px-6 py-6">
                      <div>
                        <div className="text-sm font-medium text-stone-900">
                          {emp.fullName}
                        </div>

                        <div className="text-xs text-stone-500 mt-1">
                          {emp.email || "-"}
                        </div>

                        <div className="text-xs text-stone-500">
                          {emp.contactNumber || "-"}
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}

                    <td className="px-6 py-6">
                      <span className="text-sm text-stone-700">
                        {emp.specialization || "-"}
                      </span>
                    </td>

                    {/* Location */}

                    <td className="px-6 py-6">
                      <span className="text-sm text-stone-700">
                        {[
                          emp.address?.city,
                          emp.address?.state,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </span>
                    </td>

                    {/* Action */}

                    <td className="px-6 py-6 text-right">
                      <Link
                        href={`/jobs/job-seekers/${emp._id}`}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-stone-300
                          bg-white
                          px-3
                          py-2
                          text-xs
                          font-medium
                          text-stone-700
                          hover:bg-stone-50
                          transition-colors
                        "
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}

              {!loading &&
                filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-24"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-sm font-medium text-stone-700">
                          No candidates found
                        </div>

                        <div className="text-xs text-stone-500 mt-1">
                          Try adjusting your search or filters
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* Sticky Footer */}

        <div className="border-t border-stone-200 bg-stone-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-stone-500">
              Showing {paginated.length} of {filteredData.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="
                  border
                  border-stone-300
                  bg-white
                  rounded-md
                  px-3
                  py-1.5
                  text-xs
                  disabled:opacity-40
                "
              >
                Previous
              </button>

              <span className="text-xs text-stone-500 px-2">
                Page {page} of {Math.max(totalPages, 1)}
              </span>

              <button
                disabled={
                  page === totalPages ||
                  totalPages === 0
                }
                onClick={() => setPage((p) => p + 1)}
                className="
                  border
                  border-stone-300
                  bg-white
                  rounded-md
                  px-3
                  py-1.5
                  text-xs
                  disabled:opacity-40
                "
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
);
}