"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [employer, setEmployer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployer = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_JOBS_URL}/admin/employers/${id}`,
        );

        setEmployer(res.data?.data?.employer || res.data?.employer);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
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

  if (!employer) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        Employer not found
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back */}

        <Link
          href="/jobs/employers"
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          ← Back to Employers
        </Link>

        {/* Hero */}

        <div className="bg-white border border-stone-200 rounded-2xl p-8 mt-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left */}

            <div className="flex items-center gap-5 flex-1">
              {employer.organizationLogo ? (
                <Image
                  src={employer.organizationLogo}
                  alt={employer.organizationName}
                  className="h-24 w-24 rounded-2xl object-cover border"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-stone-200 flex items-center justify-center text-3xl font-semibold text-stone-600">
                  {employer.organizationName?.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-semibold text-stone-900">
                  {employer.organizationName}
                </h1>

                <p className="text-stone-500 mt-1">
                  {employer.typeOfOrganization || "-"}
                </p>
              </div>
            </div>

            {/* Right */}

            <div className="grid grid-cols-1 gap-2 text-sm min-w-[350px]">
              <InfoRow label="Email" value={employer.email} />

              <InfoRow label="Phone" value={employer.contactNumber} />

              <InfoRow label="Contact Person" value={employer.contactPerson} />

              <InfoRow
                label="Designation"
                value={employer.contactDesignation}
              />
            </div>
          </div>
        </div>

        {/* Content */}

        <div className="grid lg:grid-cols-3 gap-5 mt-5">
          {/* Main */}

          <div className="lg:col-span-2 space-y-5">
            <Card title="Organization Information">
              <GridInfo
                items={[
                  {
                    label: "Organization Name",
                    value: employer.organizationName,
                  },
                  {
                    label: "Type",
                    value: employer.typeOfOrganization,
                  },
                  {
                    label: "Established",
                    value: employer.yearOfEstablishment,
                  },
                  {
                    label: "Employees",
                    value: employer.numberOfEmployees,
                  },
                ]}
              />
            </Card>

            <Card title="Contact Information">
              <GridInfo
                items={[
                  {
                    label: "Contact Person",
                    value: employer.contactPerson,
                  },
                  {
                    label: "Designation",
                    value: employer.contactDesignation,
                  },
                  {
                    label: "Phone",
                    value: employer.contactNumber,
                  },
                  {
                    label: "Email",
                    value: employer.email,
                  },
                ]}
              />
            </Card>

            <Card title="Recognition & Affiliations">
              <div className="space-y-5">
                <div>
                  <div className="text-xs uppercase text-stone-500 mb-3">
                    Recognition
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {employer.recognition?.length ? (
                      employer.recognition.map((item: string) => (
                        <Badge key={item}>{item}</Badge>
                      ))
                    ) : (
                      <Empty />
                    )}
                  </div>
                </div>

                <GridInfo
                  items={[
                    {
                      label: "University",
                      value: employer.universityName,
                    },
                    {
                      label: "Recognition Other",
                      value: employer.recognitionOther,
                    },
                  ]}
                />
              </div>
            </Card>

            <Card title="Address">
              <GridInfo
                items={[
                  {
                    label: "Street",
                    value: employer.address?.street,
                  },
                  {
                    label: "City",
                    value: employer.address?.city,
                  },
                  {
                    label: "State",
                    value: employer.address?.state,
                  },
                  {
                    label: "PIN Code",
                    value: employer.address?.pin,
                  },
                ]}
              />
            </Card>
          </div>

          {/* Sidebar */}

          <div className="space-y-5">
            <Card title="Website">
              {employer.website ? (
                <a
                  href={
                    employer.website.startsWith("http")
                      ? employer.website
                      : `https://${employer.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    w-full
                    rounded-lg
                    bg-stone-900
                    text-white
                    py-3
                    text-sm
                    hover:bg-stone-800
                  "
                >
                  Visit Website
                </a>
              ) : (
                <Empty />
              )}
            </Card>

            <Card title="Quick Stats">
              <div className="space-y-3">
                <StatRow
                  label="Employees"
                  value={employer.numberOfEmployees || "-"}
                />

                <StatRow
                  label="Established"
                  value={employer.yearOfEstablishment || "-"}
                />

                <StatRow
                  label="Recognitions"
                  value={employer.recognition?.length || 0}
                />
              </div>
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
    <span className="px-3 py-1.5 rounded-full text-stone-700 text-sm">
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

function StatRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
      <span className="text-sm text-stone-500">{label}</span>

      <span className="font-medium text-stone-900">{value}</span>
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-stone-500">No data available</div>;
}
