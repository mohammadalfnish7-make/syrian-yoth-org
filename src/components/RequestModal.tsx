"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { InvolveCardIconKey } from "@/lib/site-content";

type Governorate = { id: string; nameAr: string };

type RequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: InvolveCardIconKey | null;
  governorates: Governorate[];
};

export function RequestModal({
  isOpen,
  onClose,
  type,
  governorates,
}: RequestModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !type) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`/api/public/requests/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to submit request.");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const titleAr =
    type === "volunteer"
      ? "طلب انضمام كمتطوع"
      : type === "partner"
        ? "طلب شراكة مؤسسية"
        : type === "program"
          ? "طلب التسجيل في برنامج"
          : "تقديم فكرة مبادرة";

  const titleEn =
    type === "volunteer"
      ? "Volunteer Application"
      : type === "partner"
        ? "Partnership Request"
        : type === "program"
          ? "Program Registration"
          : "Submit an Initiative";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 content-ar">{titleAr}</h2>
            <h2 className="text-xl font-bold text-gray-900 content-en">{titleEn}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto" style={{ padding: "1rem", overflowY: "auto" }}>
          {success ? (
            <div className="text-center py-8" style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ width: "4rem", height: "4rem", backgroundColor: "#d1fae5", color: "#059669", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "2rem" }}>
                ✓
              </div>
              <p style={{ color: "#065f46", fontWeight: "bold" }} className="content-ar">تم إرسال طلبك بنجاح!</p>
              <p style={{ color: "#065f46", fontWeight: "bold" }} className="content-en">Request submitted successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {error && (
                <div style={{ padding: "0.75rem", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "0.375rem", fontSize: "0.875rem" }}>
                  {error}
                </div>
              )}

              {type === "partner" ? (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">اسم المؤسسة *</label>
                    <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Organization Name *</label>
                    <input required name="orgName" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", color: "#000" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">الشخص المسؤول *</label>
                    <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Contact Person *</label>
                    <input required name="contactPerson" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", color: "#000" }} />
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">الاسم الكامل *</label>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Full Name *</label>
                  <input required name="fullName" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", color: "#000" }} />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">رقم الهاتف *</label>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Phone *</label>
                  <input required name="phone" dir="ltr" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", color: "#000" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">البريد الإلكتروني</label>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Email</label>
                  <input type="email" name="email" dir="ltr" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", color: "#000" }} />
                </div>
              </div>

              {type === "volunteer" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">المحافظة *</label>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Governorate *</label>
                  <select required name="governorateId" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", backgroundColor: "white", color: "#000" }}>
                    <option value="">--</option>
                    {governorates.map((g) => (
                      <option key={g.id} value={g.id}>{g.nameAr}</option>
                    ))}
                  </select>
                </div>
              )}

              {type === "program" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">البرنامج المفضل *</label>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Preferred Program *</label>
                  <input required name="programName" style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", color: "#000" }} />
                </div>
              )}

              {type === "initiative" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">فكرة المبادرة *</label>
                  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Initiative Idea *</label>
                  <textarea required name="initiativeIdea" rows={3} style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", color: "#000" }} />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-ar">رسالة إضافية</label>
                <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#374151" }} className="content-en">Additional Message</label>
                <textarea name="message" rows={2} style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", boxSizing: "border-box", color: "#000" }} />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{ width: "100%", backgroundColor: "#503694", color: "white", padding: "0.75rem", borderRadius: "0.375rem", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span className="content-ar">جاري الإرسال...</span>
                    <span className="content-en">Submitting...</span>
                  </>
                ) : (
                  <>
                    <span className="content-ar">إرسال الطلب</span>
                    <span className="content-en">Submit Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
