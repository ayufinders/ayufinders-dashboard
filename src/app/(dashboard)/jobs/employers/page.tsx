"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

const ORGANIZATION_TYPES = [
  "Medical college & Hospital",
  "Hospital / Clinic",
  "Telemedicine / Digital Health Platform",
  "Pharmaceutical & Industry",
  "Corporate",
  "Other",
];

const PAGE_SIZE = 50;

export default function EmployersPage() {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [organizationTypeFilter, setOrganizationTypeFilter] =
    useState("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_JOBS_URL}/admin/employers`
      );

      setEmployers(
        res.data?.data?.employers ||
          res.data?.employers ||
          []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return employers.filter((emp) => {
      const matchesSearch =
        !q ||
        emp.organizationName
          ?.toLowerCase()
          .includes(q) ||
        emp.contactPerson
          ?.toLowerCase()
          .includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.contactNumber
          ?.toLowerCase()
          .includes(q);

      const matchesType =
        !organizationTypeFilter ||
        emp.typeOfOrganization ===
          organizationTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [
    employers,
    search,
    organizationTypeFilter,
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
      {/* Sticky Header */}

      <div className="sticky top-0 z-30 border-b border-stone-200">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-stone-900">
                Employers
              </h1>

              <p className="text-sm text-stone-500 mt-1">
                {filteredData.length} organizations
                found
              </p>
            </div>
          </div>

          {/* Filters */}

          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <input
                placeholder="Search organization, contact person, email..."
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
                value={organizationTypeFilter}
                onChange={(e) => {
                  setOrganizationTypeFilter(
                    e.target.value
                  );
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
                  All Organization Types
                </option>

                {ORGANIZATION_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="flex-1 px-6 py-5 overflow-hidden">
        <div className="h-full bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-20 bg-stone-50">
                <tr className="border-b border-stone-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Organization
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Type
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
                  Array.from({
                    length: 10,
                  }).map((_, i) => (
                    <tr key={i}>
                      <td
                        colSpan={5}
                        className="p-6"
                      >
                        <div className="h-14 rounded-lg bg-stone-100 animate-pulse" />
                      </td>
                    </tr>
                  ))}

                {!loading &&
                  paginated.map((emp) => (
                    <tr
                      key={emp._id}
                      className="
                        border-b
                        border-stone-100
                        hover:bg-stone-50
                        transition-colors
                      "
                    >
                      {/* Organization */}

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          {emp.organizationLogo ? (
                            <Image
                              src={
                                emp.organizationLogo
                              }
                              alt={
                                emp.organizationName
                              }
                              className="h-10 w-10 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-600">
                              {emp.organizationName?.charAt(
                                0
                              )}
                            </div>
                          )}

                          <div>
                            <div className="text-sm font-medium text-stone-900">
                              {
                                emp.organizationName
                              }
                            </div>

                            <div className="text-xs text-stone-500 mt-1">
                              {emp.contactPerson ||
                                "-"}
                            </div>

                            <div className="text-xs text-stone-500">
                              {emp.email || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}

                      <td className="px-6 py-6">
                        <span className="text-sm text-stone-700">
                          {emp.typeOfOrganization ||
                            "-"}
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

                      
                      {/* Actions */}

                      <td className="px-6 py-6 text-right">
                        <Link
                          href={`/jobs/employers/${emp._id}`}
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
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}

                {!loading &&
                  filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-24"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-sm font-medium text-stone-700">
                            No employers found
                          </div>

                          <div className="text-xs text-stone-500 mt-1">
                            Try adjusting your
                            search or filters
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          {/* Footer */}

          <div className="border-t border-stone-200 bg-stone-50 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-stone-500">
                Showing {paginated.length} of{" "}
                {filteredData.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((p) => p - 1)
                  }
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
                  Page {page} of{" "}
                  {Math.max(totalPages, 1)}
                </span>

                <button
                  disabled={
                    page === totalPages ||
                    totalPages === 0
                  }
                  onClick={() =>
                    setPage((p) => p + 1)
                  }
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