"use client";

import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_JOBS_URL}/admin/jobs/${id}`,
        );

        setJob(res.data?.data?.job || res.data?.job);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-stone-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Job not found
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <Link href="/jobs/job-posts" className="text-sm text-stone-500">
          ← Back to Jobs
        </Link>

        {/* HERO */}

        <div className="bg-white border border-stone-200 rounded-2xl p-8 mt-4 shadow-sm">
          <div className="flex justify-between gap-8">
            <div>
              <h1 className="text-3xl font-semibold text-stone-900">
                {job.jobTitle}
              </h1>

              <p className="mt-2 text-stone-600">
                {job.employer?.organizationName}
              </p>

              <p className="text-sm text-stone-500 mt-1">
                {[job.address?.city, job.address?.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

            <div>
              <StatusBadge status={job.status} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mt-5">
          {/* LEFT */}

          <div className="lg:col-span-2 space-y-5">
            <Card title="Job Description">
              <div className="whitespace-pre-wrap text-sm text-stone-700 leading-7">
                {job.description || "No description"}
              </div>
            </Card>

            {job.employer && (
              <Card title="Employer Information">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="text-lg font-semibold text-stone-900">
                        {job.employer.organizationName}
                      </div>

                      <div className="text-sm text-stone-500 mt-1">
                        {job.employer.typeOfOrganization}
                      </div>
                    </div>

                    <GridInfo
                      items={[
                        {
                          label: "Contact Person",
                          value: job.employer.contactPerson,
                        },
                        {
                          label: "Contact Number",
                          value: job.employer.contactNumber,
                        },
                        {
                          label: "Email",
                          value: job.employer.email,
                        },
                        {
                          label: "Location",
                          value: [
                            job.employer.address?.city,
                            job.employer.address?.state,
                          ]
                            .filter(Boolean)
                            .join(", "),
                        },
                      ]}
                    />

                    {job.employer.website && (
                      <div className="flex items-center gap-3 pt-2">
                        <a
                          href={
                            job.employer.website.startsWith("http")
                              ? job.employer.website
                              : `https://${job.employer.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                inline-flex
                items-center
                rounded-lg
                border
                border-stone-300
                px-4
                py-2
                text-sm
                font-medium
                hover:bg-stone-50
              "
                        >
                          Visit Website
                        </a>

                        <Link
                          href={`/jobs/employers/${job.employer._id}`}
                          className="
                inline-flex
                items-center
                rounded-lg
                bg-stone-900
                text-white
                px-4
                py-2
                text-sm
                font-medium
                hover:bg-stone-800
              "
                        >
                          View Employer Profile
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <Card title="Requirements">
              <GridInfo
                items={[
                  {
                    label: "Specialization",
                    value: job.specialization,
                  },
                  {
                    label: "Experience Required",
                    value: job.experienceRequiredRange
                      ? `${job.experienceRequiredRange}+ years`
                      : "-",
                  },
                  {
                    label: "Vacancies",
                    value: job.vacancies,
                  },
                  {
                    label: "Job Type",
                    value: job.jobType,
                  },
                ]}
              />

              <div className="mt-6">
                <div className="text-xs uppercase text-stone-500 mb-3">
                  Qualifications
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.qualificationRequired?.map((q: string) => (
                    <Badge key={q}>{q}</Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Compensation">
              <GridInfo
                items={[
                  {
                    label: "Minimum Salary",
                    value: job.salaryRange?.min
                      ? `₹${job.salaryRange.min.toLocaleString()}`
                      : "-",
                  },
                  {
                    label: "Maximum Salary",
                    value: job.salaryRange?.max
                      ? `₹${job.salaryRange.max.toLocaleString()}`
                      : "-",
                  },
                ]}
              />

              <div className="mt-6">
                <div className="text-xs uppercase text-stone-500 mb-3">
                  Benefits
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.benefits?.map((benefit: string) => (
                    <Badge key={benefit}>{benefit}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT */}

          <div className="space-y-5">
            <Card title="Applications">
              <Metric label="Applicants" value={job.applicantsCount} />
            </Card>

            <Card title="Location">
              <GridInfo
                items={[
                  {
                    label: "City",
                    value: job.address?.city,
                  },
                  {
                    label: "State",
                    value: job.address?.state,
                  },
                ]}
              />
            </Card>

            <Card title="Timeline">
              <GridInfo
                items={[
                  {
                    label: "Published",
                    value: job.publishedAt
                      ? new Date(job.publishedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-",
                  },
                  {
                    label: "Deadline",
                    value: job.applicationDeadline
                      ? new Date(job.applicationDeadline).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )
                      : "-",
                  },
                ]}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Components */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Badge({ children }: any) {
  return (
    <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm">
      {children}
    </span>
  );
}

interface GridItem {
  label: string;
  value?: string | number | null;
}

function GridInfo({ items }: { items: GridItem[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((item: any) => (
        <div key={item.label}>
          <div className="text-xs uppercase text-stone-500">{item.label}</div>

          <div className="text-sm mt-1">{item.value || "-"}</div>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs uppercase text-stone-500">{label}</div>

      <div className="text-3xl font-semibold mt-2">{value || 0}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Draft: "bg-stone-100 text-stone-700",
    Published: "bg-green-100 text-green-700",
    Closed: "bg-red-100 text-red-700",
    Filled: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
        styles[status as keyof typeof styles]
      }`}
    >
      {status}
    </span>
  );
}
