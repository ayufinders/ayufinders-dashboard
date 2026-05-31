"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Employee } from "@/types";
import Image from "next/image";

export default function CandidateProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_JOBS_URL}/admin/employees/${id}`,
        );

        setEmployee(res.data?.employee || res.data?.data?.employee);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
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

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Candidate not found
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back */}

        <Link
          href="/jobs/job-seekers"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Back
        </Link>

        {/* Hero */}

        <div className="bg-white border border-stone-200 rounded-2xl p-8 mt-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex items-center gap-5 flex-1">
              {employee.profilePicture ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_AWS_URL}/${employee.profilePicture}`}
                  alt={employee.fullName}
                  className="h-24 w-24 rounded-full object-cover border"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-stone-200 flex items-center justify-center text-2xl font-semibold text-stone-600">
                  {employee.fullName?.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-semibold text-stone-900">
                  {employee.fullName}
                </h1>

                <p className="text-stone-500 mt-1">
                  {employee.currentDesignation || "—"}
                </p>

                <p className="text-sm text-stone-500">
                  {employee.specialization || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm min-w-[320px]">
              <InfoRow label="Email" value={employee.email} />

              <InfoRow label="Phone" value={employee.contactNumber} />

              <InfoRow label="Gender" value={employee.gender} />

              <InfoRow
                label="DOB"
                value={
                  employee.dob
                    ? new Date(employee.dob).toLocaleDateString()
                    : "-"
                }
              />
            </div>
          </div>
        </div>

        {/* Main Grid */}

        <div className="grid lg:grid-cols-3 gap-5 mt-5">
          {/* LEFT */}

          <div className="lg:col-span-2 space-y-5">
            {/* Professional */}

            <Card title="Professional Information">
              <GridInfo
                items={[
                  {
                    label: "Specialization",
                    value: employee.specialization,
                  },
                  {
                    label: "Designation",
                    value: employee.currentDesignation,
                  },
                  {
                    label: "Employer",
                    value: employee.currentEmployer,
                  },
                  {
                    label: "Council",
                    value: employee.registration?.council,
                  },
                  {
                    label: "Registration Number",
                    value: employee.registration?.number,
                  },
                  {
                    label: "Visibility",
                    value: employee.visibility,
                  },
                ]}
              />
            </Card>

            {/* Qualifications */}

            <Card title="Qualifications">
              {employee.qualification?.length ? (
                <div className="space-y-5">
                  {/* Qualification Tags */}

                  <div className="flex flex-wrap gap-2">
                    {employee.qualification.map((q: string) => (
                      <Badge key={q}>{q}</Badge>
                    ))}
                  </div>

                  {/* Fellowship Details */}

                  {employee.qualification.includes("Fellowship") &&
                    employee.fellowshipDetails && (
                      <div>
                        <div className="text-xs uppercase text-stone-500 mb-2">
                          Fellowship Details
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                          {employee.fellowshipDetails}
                        </div>
                      </div>
                    )}

                  {/* Diploma Details */}

                  {employee.qualification.includes("Diploma") &&
                    employee.diplomaDetails && (
                      <div>
                        <div className="text-xs uppercase text-stone-500 mb-2">
                          Diploma Details
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                          {employee.diplomaDetails}
                        </div>
                      </div>
                    )}

                  {/* Other Qualification */}

                  {employee.qualification.includes("Other") &&
                    employee.qualificationOther && (
                      <div>
                        <div className="text-xs uppercase text-stone-500 mb-2">
                          Other Qualification
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                          {employee.qualificationOther}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <Empty />
              )}
            </Card>

            {/* Experience */}

            <Card title="Experience">
              <div className="grid md:grid-cols-3 gap-4">
                <MetricCard
                  title="Clinical"
                  years={employee.clinicalYearsExact}
                  months={employee.clinicalMonthsExact}
                />

                <MetricCard
                  title="Teaching"
                  years={employee.teachingYearsExact}
                  months={employee.teachingMonthsExact}
                />

                <MetricCard
                  title="Research"
                  years={employee.researchYearsExact}
                  months={employee.researchMonthsExact}
                />
              </div>
            </Card>

            {/* Publications */}

            <Card title="Research Publications">
              {employee.researchPublications?.links?.length ? (
                <div className="space-y-3">
                  {employee.researchPublications.links.map(
                    (pub: any, index: number) => (
                      <a
                        key={index}
                        href={pub.link}
                        target="_blank"
                        className="block border rounded-lg p-3 hover:bg-stone-50"
                      >
                        <div className="font-medium">{pub.title}</div>

                        <div className="text-xs text-stone-500">{pub.link}</div>
                      </a>
                    ),
                  )}
                </div>
              ) : (
                <Empty />
              )}
            </Card>

            {/* Certificates */}

            <Card title="Certificates">
              {employee.certificates?.length ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {employee.certificates.map((cert: any, index: number) => (
                    <a
                      key={index}
                      href={`${process.env.NEXT_PUBLIC_AWS_URL}/${cert.url}`}
                      target="_blank"
                      className="border rounded-lg p-3 hover:bg-stone-50"
                    >
                      <div className="font-medium">
                        {cert.name || `Certificate ${index + 1}`}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </Card>
          </div>

          {/* RIGHT */}

          <div className="space-y-5">
            <Card title="Location">
              <GridInfo
                items={[
                  {
                    label: "City",
                    value: employee.address?.city,
                  },
                  {
                    label: "State",
                    value: employee.address?.state,
                  },
                  {
                    label: "PIN",
                    value: employee.address?.pin,
                  },
                ]}
              />
            </Card>

            <Card title="Skills">
              <div className="flex flex-wrap gap-2">
                {employee.skills?.length ? (
                  employee.skills.map((skill: string) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))
                ) : (
                  <Empty />
                )}
              </div>
            </Card>

            <Card title="Languages">
              <div className="flex flex-wrap gap-2">
                {employee.languagesKnown?.length ? (
                  employee.languagesKnown.map((lang: string) => (
                    <Badge key={lang}>{lang}</Badge>
                  ))
                ) : (
                  <Empty />
                )}
              </div>
            </Card>

            <Card title="Job Preferences">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-stone-500 mb-2">
                    Preferred Areas
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {employee.preferredWorkArea?.map((area: string) => (
                      <Badge key={area}>{area}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase text-stone-500 mb-2">
                    Job Types
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {employee.jobType?.map((job: string) => (
                      <Badge key={job}>{job}</Badge>
                    ))}
                  </div>
                </div>

                <GridInfo
                  items={[
                    {
                      label: "Relocate",
                      value: employee.willingnessToRelocate ? "Yes" : "No",
                    },
                    {
                      label: "Salary",
                      value: employee.expectedSalary?.min
                        ? `₹${employee.expectedSalary.min.toLocaleString()} - ₹${employee.expectedSalary.max?.toLocaleString()} LPA`
                        : "-",
                    },
                  ]}
                />
              </div>
            </Card>

            <Card title="Resume">
              {employee.resume && (
                <a
                  href={`${process.env.NEXT_PUBLIC_AWS_URL}/${employee.resume.url}`}
                  target="_blank"
                  className="inline-flex items-center justify-center w-full rounded-lg bg-stone-900 text-white py-3 text-sm"
                >
                  View Resume
                </a>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-stone-900 mb-5">{title}</h2>

      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm">
      {children}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between">
      <span className="text-stone-500">{label}</span>

      <span className="text-stone-900">{value || "-"}</span>
    </div>
  );
}

function GridInfo({
  items,
}: {
  items: {
    label: string;
    value: any;
  }[];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="text-xs uppercase text-stone-500">{item.label}</div>

          <div className="text-sm text-stone-900 mt-1">{item.value || "-"}</div>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ title, years, months }: any) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-xs uppercase text-stone-500">{title}</div>

      <div className="text-xl font-semibold mt-2">
        {years || 0}y {months || 0}m
      </div>
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-stone-500">No data available</div>;
}
