"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Plus, Loader2, UserX, UserCheck, Pencil } from "lucide-react";

type Governorate = { id: string; nameAr: string };
type GovAdmin = {
  id: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  governorate: Governorate | null;
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<GovAdmin[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    username: "",
    password: "",
    governorateId: "",
  });

  function resetForm() {
    setForm({ username: "", password: "", governorateId: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setMessage("");
    setForm({ username: "", password: "", governorateId: "" });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(admin: GovAdmin) {
    setMessage("");
    setForm({
      username: admin.username,
      password: "",
      governorateId: admin.governorate?.id ?? "",
    });
    setEditingId(admin.id);
    setShowForm(true);
  }

  const loadData = useCallback(async () => {
    const [adminsRes, govRes] = await Promise.all([
      fetch("/api/admin/governorate-admins"),
      fetch("/api/admin/governorates"),
    ]);
    const adminsData = await adminsRes.json();
    const govData = await govRes.json();
    setAdmins(Array.isArray(adminsData) ? adminsData : []);
    setGovernorates(Array.isArray(govData) ? govData : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = editingId
      ? {
          username: form.username,
          governorateId: form.governorateId,
          ...(form.password ? { password: form.password } : {}),
        }
      : form;

    const res = await fetch(
      editingId
        ? `/api/admin/governorate-admins/${editingId}`
        : "/api/admin/governorate-admins",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();

    if (res.ok) {
      setMessage(editingId ? "تم تحديث الحساب بنجاح" : "تم إنشاء الحساب بنجاح");
      resetForm();
      loadData();
    } else {
      setMessage(data.error || (editingId ? "فشل التحديث" : "فشل الإنشاء"));
    }
    setSaving(false);
  }

  async function toggleActive(admin: GovAdmin) {
    const res = await fetch(`/api/admin/governorate-admins/${admin.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !admin.isActive }),
    });
    if (res.ok) loadData();
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
        titleAr="إدارة الأدمن"
        titleEn="Admin Users"
        descriptionAr="إنشاء وإدارة حسابات أدمن المحافظات"
        descriptionEn="Create and manage governorate admin accounts"
        backHref="/admin/dashboard"
      />

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-btn-primary"
          onClick={() => (showForm && !editingId ? resetForm() : openCreateForm())}
        >
          <Plus size={18} />
          إضافة أدمن محافظة
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card admin-form-inline">
          <h3 className="admin-card__title">
            {editingId ? "تعديل الحساب" : "حساب جديد"}
          </h3>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label>اسم المستخدم</label>
              <input
                className="admin-field__input admin-field__input--plain"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="admin-field">
              <label>كلمة المرور</label>
              <input
                type="password"
                className="admin-field__input admin-field__input--plain"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editingId}
                minLength={form.password ? 8 : undefined}
                placeholder={editingId ? "اتركها فارغة للإبقاء على الحالية" : undefined}
              />
            </div>
            <div className="admin-field">
              <label>المحافظة</label>
              <select
                className="admin-field__input admin-field__input--plain"
                value={form.governorateId}
                onChange={(e) =>
                  setForm({ ...form, governorateId: e.target.value })
                }
                required
              >
                <option value="">اختر المحافظة</option>
                {governorates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إنشاء"}
            </button>
            <button type="button" className="admin-btn-ghost" onClick={resetForm}>
              إلغاء
            </button>
          </div>
        </form>
      )}

      {message && (
        <div
          className={`admin-alert ${message.includes("نجاح") ? "admin-alert--success" : "admin-alert--error"}`}
        >
          {message}
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>اسم المستخدم</th>
              <th>المحافظة</th>
              <th>الحالة</th>
              <th>آخر دخول</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  لا يوجد أدمن محافظات بعد
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.username}</td>
                  <td>{admin.governorate?.nameAr || "—"}</td>
                  <td>
                    <span
                      className={`admin-badge ${admin.isActive ? "admin-badge--active" : "admin-badge--inactive"}`}
                    >
                      {admin.isActive ? "نشط" : "معطّل"}
                    </span>
                  </td>
                  <td>
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleDateString("ar-SY")
                      : "—"}
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn-icon"
                      onClick={() => openEditForm(admin)}
                      title="تعديل"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon"
                      onClick={() => toggleActive(admin)}
                      title={admin.isActive ? "تعطيل" : "تفعيل"}
                    >
                      {admin.isActive ? (
                        <UserX size={16} />
                      ) : (
                        <UserCheck size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
