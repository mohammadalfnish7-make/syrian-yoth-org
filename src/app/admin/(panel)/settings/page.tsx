"use client";

import { useState, useEffect } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { DEFAULT_ABOUT } from "@/lib/about-defaults";
import { normalizeAboutSettings } from "@/lib/normalize-about";
import { ORG_NAME } from "@/lib/profile-content";
import { DEFAULT_HERO_VIDEO_URL, type AboutSettings } from "@/types/site";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

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
    videoUrl: string | null;
  };
  branding: {
    nameAr: string;
    nameEn: string;
    logoUrl: string | null;
    logoMarkUrl: string | null;
    faviconUrl: string | null;
  };
  about: AboutSettings;
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
        setSettings({
          ...data,
          hero: {
            title: "",
            subtitle: "",
            tagline: "",
            imageUrl: null,
            videoUrl: DEFAULT_HERO_VIDEO_URL,
            ...(data.hero ?? {}),
          },
          about: normalizeAboutSettings(data.about, DEFAULT_ABOUT),
          branding: {
            logoUrl: null,
            logoMarkUrl: null,
            faviconUrl: null,
            ...(data.branding ?? {}),
            nameAr: data.branding?.nameAr || ORG_NAME.ar,
            nameEn: data.branding?.nameEn || ORG_NAME.en,
          },
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    const payload = {
      ...settings,
      about: {
        ...settings.about,
        values: settings.about.values.filter(
          (value) => value.ar.trim() || value.en.trim()
        ),
      },
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-1">اسم المؤسسة (عربي)</label>
              <input
                type="text"
                value={settings.branding.nameAr}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, nameAr: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Organization name (English)</label>
              <input
                type="text"
                value={settings.branding.nameEn}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, nameEn: e.target.value },
                  })
                }
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                dir="ltr"
              />
            </div>
          </div>
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
            <VideoUploader
              currentUrl={settings.hero.videoUrl}
              onUpload={(url) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, videoUrl: url },
                })
              }
              onRemove={() =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, videoUrl: null },
                })
              }
            />
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

        {/* About Info */}
        <section className="admin-card">
          <h2 className="admin-card__title">معلومات من نحن</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">الاسم (عربي)</label>
                <input
                  type="text"
                  value={settings.about.label.ar}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: {
                        ...settings.about,
                        label: { ...settings.about.label, ar: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Name (English)</label>
                <input
                  type="text"
                  value={settings.about.label.en}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: {
                        ...settings.about,
                        label: { ...settings.about.label, en: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">العنوان (عربي)</label>
                <input
                  type="text"
                  value={settings.about.title.ar}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: {
                        ...settings.about,
                        title: { ...settings.about.title, ar: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Title (English)</label>
                <input
                  type="text"
                  value={settings.about.title.en}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: {
                        ...settings.about,
                        title: { ...settings.about.title, en: e.target.value },
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">الوصف (عربي)</label>
              <textarea
                value={settings.about.mission.ar}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    about: {
                      ...settings.about,
                      mission: { ...settings.about.mission, ar: e.target.value },
                    },
                  })
                }
                rows={4}
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Description (English)</label>
              <textarea
                value={settings.about.mission.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    about: {
                      ...settings.about,
                      mission: { ...settings.about.mission, en: e.target.value },
                    },
                  })
                }
                rows={4}
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                dir="ltr"
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">قيمنا</p>
              <div className="space-y-3">
                {settings.about.values.map((value, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div>
                      <label className="block text-sm mb-1">القيمة (عربي)</label>
                      <input
                        type="text"
                        value={value.ar}
                        onChange={(e) => {
                          const values = settings.about.values.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, ar: e.target.value } : item
                          );
                          setSettings({
                            ...settings,
                            about: { ...settings.about, values },
                          });
                        }}
                        className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Value (English)</label>
                      <input
                        type="text"
                        value={value.en}
                        onChange={(e) => {
                          const values = settings.about.values.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, en: e.target.value } : item
                          );
                          setSettings({
                            ...settings,
                            about: { ...settings.about, values },
                          });
                        }}
                        className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="button"
                      className="admin-btn-icon admin-btn-icon--danger"
                      onClick={() => {
                        const values = settings.about.values.filter((_, itemIndex) => itemIndex !== index);
                        setSettings({
                          ...settings,
                          about: { ...settings.about, values },
                        });
                      }}
                      aria-label="حذف القيمة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="admin-btn-ghost mt-3"
                onClick={() =>
                  setSettings({
                    ...settings,
                    about: {
                      ...settings.about,
                      values: [...settings.about.values, { ar: "", en: "" }],
                    },
                  })
                }
              >
                <Plus size={16} />
                قيمة جديدة
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">رقم الحضور (مثال: 10)</label>
                <input
                  type="text"
                  value={settings.about.yearsOfExperience}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      about: { ...settings.about, yearsOfExperience: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">وصف الرقم (عربي)</label>
              <input
                type="text"
                value={settings.about.presenceLabel.ar}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    about: {
                      ...settings.about,
                      presenceLabel: {
                        ...settings.about.presenceLabel,
                        ar: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Number caption (English)</label>
              <input
                type="text"
                value={settings.about.presenceLabel.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    about: {
                      ...settings.about,
                      presenceLabel: {
                        ...settings.about.presenceLabel,
                        en: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-4 py-2 border border-brand-grey-2 rounded-md"
                dir="ltr"
              />
            </div>
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
