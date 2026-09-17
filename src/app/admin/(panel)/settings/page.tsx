"use client";

import { useState, useEffect } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Loader2, Save } from "lucide-react";

type SiteSettings = {
  contact: {
    email: string;
    phone: string;
    address: string;
    website: string;
  };
  social_links: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    imageUrl: string | null;
  };
  branding: {
    logoUrl: string | null;
    logoMarkUrl: string | null;
    faviconUrl: string | null;
  };
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage("تم حفظ الإعدادات بنجاح");
      } else {
        const data = await res.json();
        setMessage(data.error || "فشل الحفظ");
      }
    } catch {
      setMessage("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 size={28} className="animate-spin text-brand-purple" />
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="admin-loading">
        <p className="text-brand-orange">فشل تحميل الإعدادات</p>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        titleAr="إعدادات الموقع"
        titleEn="Site Settings"
        descriptionAr="الشعار، بيانات التواصل، والصفحة الرئيسية"
        descriptionEn="Logo, contact details, and homepage content"
        backHref="/admin/dashboard"
      />

      <div className="admin-form-layout">
        {/* Branding / Logo */}
        <section className="admin-card">
          <h2 className="admin-card__title">الشعار والهوية البصرية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageUploader
              category="logos"
              label="الشعار الكامل"
              currentUrl={settings.branding.logoUrl}
              onUpload={(url) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, logoUrl: url },
                })
              }
              onRemove={() =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, logoUrl: null },
                })
              }
            />
            <ImageUploader
              category="logos"
              label="الرمز (Logomark)"
              currentUrl={settings.branding.logoMarkUrl}
              onUpload={(url) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, logoMarkUrl: url },
                })
              }
              onRemove={() =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, logoMarkUrl: null },
                })
              }
            />
            <ImageUploader
              category="logos"
              label="أيقونة الموقع (Favicon)"
              currentUrl={settings.branding.faviconUrl}
              onUpload={(url) =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, faviconUrl: url },
                })
              }
              onRemove={() =>
                setSettings({
                  ...settings,
                  branding: { ...settings.branding, faviconUrl: null },
                })
              }
            />
          </div>
        </section>

        {/* Hero */}
        <section className="admin-card">
          <h2 className="admin-card__title">الصفحة الرئيسية</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">العنوان الرئيسي</label>
              <input
                type="text"
                value={settings.hero.title}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero: { ...settings.hero, title: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">النص الفرعي</label>
              <textarea
                value={settings.hero.subtitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    hero: { ...settings.hero, subtitle: e.target.value },
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
              />
            </div>
            <ImageUploader
              category="site"
              label="صورة البانر الرئيسي"
              currentUrl={settings.hero.imageUrl}
              onUpload={(url) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, imageUrl: url },
                })
              }
              onRemove={() =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, imageUrl: null },
                })
              }
            />
          </div>
        </section>

        {/* Contact */}
        <section className="admin-card">
          <h2 className="admin-card__title">بيانات التواصل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, email: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">الهاتف</label>
              <input
                type="text"
                value={settings.contact.phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, phone: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                dir="ltr"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">العنوان</label>
              <input
                type="text"
                value={settings.contact.address}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, address: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="admin-card">
          <h2 className="admin-card__title">روابط التواصل الاجتماعي</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["facebook", "instagram", "twitter", "youtube", "linkedin"] as const).map(
              (platform) => (
                <div key={platform}>
                  <label className="block text-sm mb-1 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    value={settings.social_links[platform]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_links: {
                          ...settings.social_links,
                          [platform]: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                    dir="ltr"
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
              )
            )}
          </div>
        </section>

        {message && (
          <div
            className={`admin-alert ${message.includes("نجاح") ? "admin-alert--success" : "admin-alert--error"}`}
            role="status"
          >
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary admin-form-layout__submit"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save size={18} />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>
    </>
  );
}
