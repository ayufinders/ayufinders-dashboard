"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";

const PAGE_SIZE = 50;

const STATUS_OPTIONS = [
  "Draft",
  "Published",
  "Closed",
  "Filled",
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");
  const [
    specializationFilter,
    setSpecializationFilter,
  ] = useState("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_JOBS_URL}/admin/jobs`
      );

      setJobs(
        res.data?.data?.jobs ||
          res.data?.jobs ||
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

    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.jobTitle
          ?.toLowerCase()
          .includes(q) ||
        job.employer?.organizationName
          ?.toLowerCase()
          .includes(q);

      const matchesStatus =
        !statusFilter ||
        job.status === statusFilter;

      const matchesSpecialization =
        !specializationFilter ||
        job.specialization ===
          specializationFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSpecialization
      );
    });
  }, [
    jobs,
    search,
    statusFilter,
    specializationFilter,
  ]);

  const totalPages = Math.ceil(
    filteredData.length / PAGE_SIZE
  );

  const paginated = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-700";

      case "Closed":
        return "bg-red-100 text-red-700";

      case "Filled":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-stone-100 text-stone-700";
    }
  };

  return (
    <div className="h-screen flex flex-col">

      {/* Header */}

      <div className="sticky top-0 z-30 border-b border-stone-200">
        <div className="px-6 pt-6 pb-5">

          <div className="mb-5">
            <h1 className="text-xl font-semibold text-stone-900">
              Job Posts
            </h1>

            <p className="text-sm text-stone-500 mt-1">
              {filteredData.length} jobs found
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">

              <input
                placeholder="Search job title or employer..."
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
                "
              />

              <select
                value={specializationFilter}
                onChange={(e) => {
                  setSpecializationFilter(
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
                "
              >
                <option value="">
                  All Specializations
                </option>

                {SPECIALIZATIONS.map(
                  (spec) => (
                    <option
                      key={spec}
                      value={spec}
                    >
                      {spec}
                    </option>
                  )
                )}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
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
                "
              >
                <option value="">
                  All Status
                </option>

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
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
                    Job
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Specialization
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Location
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Status
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
                  paginated.map((job) => (
                    <tr
                      key={job._id}
                      className="
                        border-b
                        border-stone-100
                        hover:bg-stone-50
                        transition-colors
                      "
                    >

                      {/* Job */}

                      <td className="px-6 py-6">
                        <div>
                          <div className="text-sm font-medium text-stone-900">
                            {job.jobTitle}
                          </div>

                          <div className="text-xs text-stone-500 mt-1">
                            {
                              job.employer
                                ?.organizationName
                            }
                          </div>

                          <div className="text-xs text-stone-500">
                            {job.jobType}
                            {" • "}
                            {job.vacancies} vacancy
                            {job.vacancies > 1
                              ? "ies"
                              : ""}
                          </div>
                        </div>
                      </td>

                      {/* Specialization */}

                      <td className="px-6 py-6">
                        <span className="text-sm text-stone-700">
                          {job.specialization ||
                            "-"}
                        </span>
                      </td>

                      {/* Location */}

                      <td className="px-6 py-6">
                        <span className="text-sm text-stone-700">
                          {[
                            job.address?.city,
                            job.address?.state,
                          ]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </span>
                      </td>

                      {/* Status */}

                      <td className="px-6 py-6">
                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            ${getStatusClass(
                              job.status
                            )}
                          `}
                        >
                          {job.status}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-6 py-6 text-right">
                        <Link
                          href={`/jobs/job-posts/${job._id}`}
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
                          "
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}

                {!loading &&
                  filteredData.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-24"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-sm font-medium text-stone-700">
                            No jobs found
                          </div>

                          <div className="text-xs text-stone-500 mt-1">
                            Try adjusting
                            your filters
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