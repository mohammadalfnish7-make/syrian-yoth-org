"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Loader2 } from "lucide-react";

type VolunteerReq = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: string;
  submittedAt: string;
  governorate: { nameAr: string };
};

type PartnerReq = {
  id: string;
  orgName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  status: string;
  submittedAt: string;
};

type ProgramReq = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  programName: string;
  status: string;
  submittedAt: string;
};

type InitiativeReq = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  initiativeIdea: string;
  status: string;
  submittedAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  reviewed: "تمت المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

export default function RequestsPage() {
  const [volunteer, setVolunteer] = useState<VolunteerReq[]>([]);
  const [partner, setPartner] = useState<PartnerReq[]>([]);
  const [program, setProgram] = useState<ProgramReq[]>([]);
  const [initiative, setInitiative] = useState<InitiativeReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"volunteer" | "partner" | "program" | "initiative">("volunteer");

  useEffect(() => {
    fetch("/api/admin/requests")
      .then((r) => r.json())
      .then((data) => {
        setVolunteer(data.volunteer || []);
        setPartner(data.partner || []);
        setProgram(data.program || []);
        setInitiative(data.initiative || []);
        setLoading(false);
      });
  }, []);

  async function updateStatus(
    id: string,
    type: "volunteer" | "partner" | "program" | "initiative",
    status: string
  ) {
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type, status }),
    });
    const res = await fetch("/api/admin/requests");
    const data = await res.json();
    setVolunteer(data.volunteer || []);
    setPartner(data.partner || []);
    setProgram(data.program || []);
    setInitiative(data.initiative || []);
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={28} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        titleAr="الطلبات الواردة"
        titleEn="Incoming Requests"
        descriptionAr="طلبات التطوع والشراكة المؤسسية"
        descriptionEn="Volunteer and partnership requests"
        backHref="/admin/dashboard"
      />

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tabs__btn ${tab === "volunteer" ? "admin-tabs__btn--active" : ""}`}
          onClick={() => setTab("volunteer")}
        >
          التطوع ({volunteer.length})
        </button>
        <button
          type="button"
          className={`admin-tabs__btn ${tab === "partner" ? "admin-tabs__btn--active" : ""}`}
          onClick={() => setTab("partner")}
        >
          الشراكة ({partner.length})
        </button>
        <button
          type="button"
          className={`admin-tabs__btn ${tab === "program" ? "admin-tabs__btn--active" : ""}`}
          onClick={() => setTab("program")}
        >
          البرامج ({program.length})
        </button>
        <button
          type="button"
          className={`admin-tabs__btn ${tab === "initiative" ? "admin-tabs__btn--active" : ""}`}
          onClick={() => setTab("initiative")}
        >
          المبادرات ({initiative.length})
        </button>
      </div>

      {tab === "volunteer" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>المحافظة</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>تحديث</th>
              </tr>
            </thead>
            <tbody>
              {volunteer.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table__empty">
                    لا توجد طلبات تطوع
                  </td>
                </tr>
              ) : (
                volunteer.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fullName}</td>
                    <td dir="ltr">{r.phone}</td>
                    <td>{r.governorate.nameAr}</td>
                    <td>
                      <span className="admin-badge admin-badge--draft">
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td>
                      {new Date(r.submittedAt).toLocaleDateString("ar-SY")}
                    </td>
                    <td>
                      <select
                        className="admin-field__input admin-field__input--plain admin-field__input--sm"
                        value={r.status}
                        onChange={(e) =>
                          updateStatus(r.id, "volunteer", e.target.value)
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : tab === "partner" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المؤسسة</th>
                <th>المسؤول</th>
                <th>الهاتف</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>تحديث</th>
              </tr>
            </thead>
            <tbody>
              {partner.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table__empty">
                    لا توجد طلبات شراكة
                  </td>
                </tr>
              ) : (
                partner.map((r) => (
                  <tr key={r.id}>
                    <td>{r.orgName}</td>
                    <td>{r.contactPerson}</td>
                    <td dir="ltr">{r.phone}</td>
                    <td>
                      <span className="admin-badge admin-badge--draft">
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td>
                      {new Date(r.submittedAt).toLocaleDateString("ar-SY")}
                    </td>
                    <td>
                      <select
                        className="admin-field__input admin-field__input--plain admin-field__input--sm"
                        value={r.status}
                        onChange={(e) =>
                          updateStatus(r.id, "partner", e.target.value)
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : tab === "program" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>البرنامج</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>تحديث</th>
              </tr>
            </thead>
            <tbody>
              {program.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table__empty">
                    لا توجد طلبات للبرامج
                  </td>
                </tr>
              ) : (
                program.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fullName}</td>
                    <td dir="ltr">{r.phone}</td>
                    <td>{r.programName}</td>
                    <td>
                      <span className="admin-badge admin-badge--draft">
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td>
                      {new Date(r.submittedAt).toLocaleDateString("ar-SY")}
                    </td>
                    <td>
                      <select
                        className="admin-field__input admin-field__input--plain admin-field__input--sm"
                        value={r.status}
                        onChange={(e) =>
                          updateStatus(r.id, "program", e.target.value)
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>فكرة المبادرة</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>تحديث</th>
              </tr>
            </thead>
            <tbody>
              {initiative.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-table__empty">
                    لا توجد طلبات للمبادرات
                  </td>
                </tr>
              ) : (
                initiative.map((r) => (
                  <tr key={r.id}>
                    <td>{r.fullName}</td>
                    <td dir="ltr">{r.phone}</td>
                    <td>{r.initiativeIdea}</td>
                    <td>
                      <span className="admin-badge admin-badge--draft">
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td>
                      {new Date(r.submittedAt).toLocaleDateString("ar-SY")}
                    </td>
                    <td>
                      <select
                        className="admin-field__input admin-field__input--plain admin-field__input--sm"
                        value={r.status}
                        onChange={(e) =>
                          updateStatus(r.id, "initiative", e.target.value)
                        }
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
