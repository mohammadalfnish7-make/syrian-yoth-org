"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Loader2, Save } from "lucide-react";

type Stat = {
  id: string;
  labelAr: string;
  value: string;
  icon: string | null;
  isActive: boolean;
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stats }),
    });
    const data = await res.json();
    setMessage(res.ok ? "تم الحفظ بنجاح" : data.error || "فشل الحفظ");
    setSaving(false);
  }

  function updateStat(id: string, field: keyof Stat, value: string | boolean) {
    setStats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
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
        titleAr="إحصائيات الأثر"
        titleEn="Impact Stats"
        descriptionAr="تعديل أرقام التأثير المعروضة في الموقع"
        descriptionEn="Edit impact numbers shown on the public site"
        backHref="/admin/dashboard"
      />

      <div className="admin-form-layout">
        {stats.map((stat) => (
          <div key={stat.id} className="admin-card admin-stat-edit">
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>التسمية</label>
                <input
                  className="admin-field__input admin-field__input--plain"
                  value={stat.labelAr}
                  onChange={(e) =>
                    updateStat(stat.id, "labelAr", e.target.value)
                  }
                />
              </div>
              <div className="admin-field">
                <label>القيمة</label>
                <input
                  className="admin-field__input admin-field__input--plain"
                  value={stat.value}
                  onChange={(e) => updateStat(stat.id, "value", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {message && (
          <div
            className={`admin-alert ${message.includes("نجاح") ? "admin-alert--success" : "admin-alert--error"}`}
          >
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          حفظ الإحصائيات
        </button>
      </div>
    </>
  );
}
