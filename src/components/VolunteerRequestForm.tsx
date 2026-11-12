"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  Check,
  CircleAlert,
  CloudUpload,
  Download,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { localeFromPath, type Locale } from "@/lib/locale";
import {
  VOLUNTEER_COLLEGES,
  VOLUNTEER_CV_TEMPLATE_URL,
  VOLUNTEER_DOCUMENT_MAX_MB,
  VOLUNTEER_EDUCATION_LEVELS,
  VOLUNTEER_EMPLOYMENT_STATUSES,
  VOLUNTEER_GENDERS,
  VOLUNTEER_HOBBIES,
  VOLUNTEER_IMAGE_MAX_MB,
  VOLUNTEER_STUDY_YEARS,
  VOLUNTEER_UNIVERSITIES,
  VOLUNTEER_YES_NO,
  isValidVolunteerPhone,
  isValidVolunteerTelegram,
  normalizeVolunteerPhone,
  normalizeVolunteerTelegram,
  volunteerHobbyDisplay,
  volunteerOptionLabel,
} from "@/lib/volunteer-form";

type Governorate = { id: string; nameAr: string; nameEn?: string | null };

type VolunteerRequestFormProps = {
  governorates: Governorate[];
  onSubmit: (formData: FormData) => Promise<void>;
  submitting: boolean;
  error: string;
  /** Called when the form goes from pristine to edited (or back). */
  onDirtyChange?: (dirty: boolean) => void;
};

type Msg = { ar: string; en: string };
type Errors = Partial<Record<string, Msg>>;

const OTHER = "أخرى";
const NO_WORKPLACE_STATUSES = new Set(["طالب", "باحث عن عمل"]);

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const DOC_EXT = /\.(pdf|docx?)$/i;

const M = {
  required: { ar: "هذا الحقل مطلوب", en: "This field is required" },
  choose: { ar: "يرجى اختيار أحد الخيارات", en: "Please choose an option" },
  fullName: { ar: "اكتب اسمك الثلاثي", en: "Please enter your full name" },
  address: { ar: "اكتب عنوان سكنك", en: "Please enter your address" },
  dob: { ar: "تاريخ الميلاد غير صحيح", en: "Please enter a valid date of birth" },
  phone: {
    ar: "الرقم غير صحيح. مثال: 0912345678 أو 00963912345678",
    en: "Invalid number. Example: 0912345678 or 00963912345678",
  },
  telegram: {
    ar: "المعرّف غير صحيح. يتكوّن من 3 أحرف إنجليزية أو أرقام على الأقل، مثل ‎@username",
    en: "Invalid username. Use at least 3 English letters, numbers or _, e.g. @username",
  },
  hobbies: { ar: "اختر هواية واحدة على الأقل", en: "Choose at least one" },
  file: { ar: "يرجى رفع الملف", en: "Please upload this file" },
  fileType: { ar: "نوع الملف غير مدعوم", en: "This file type isn't supported" },
} satisfies Record<string, Msg>;

const fileTooBig = (mb: number): Msg => ({
  ar: `حجم الملف أكبر من ${mb} ميغابايت`,
  en: `File is larger than ${mb} MB`,
});

/** Server errors that come back in English only. */
const SERVER_ERRORS: Record<string, Msg> = {
  "Invalid data provided.": {
    ar: "بعض البيانات غير صحيحة. راجع الحقول وحاول مرة أخرى.",
    en: "Some details are invalid. Please review the form and try again.",
  },
  "Request too large": {
    ar: "حجم الملفات المرفقة كبير جداً. جرّب ملفات أصغر.",
    en: "The attached files are too large. Try smaller files.",
  },
  "Governorate not found": {
    ar: "المحافظة المختارة غير متاحة. اختر محافظة أخرى.",
    en: "The selected governorate is unavailable. Please choose another.",
  },
  "Failed to submit request": {
    ar: "تعذّر إرسال الطلب. حاول مرة أخرى بعد قليل.",
    en: "We couldn't send your request. Please try again shortly.",
  },
};

/** Order in which errors are focused (top to bottom of the form). */
const FIELD_ORDER = [
  "fullName",
  "gender",
  "dateOfBirth",
  "governorateId",
  "address",
  "phone",
  "telegram",
  "hasLinkedIn",
  "employmentStatus",
  "educationLevel",
  "educationLevelOther",
  "university",
  "college",
  "studyYear",
  "studyYearOther",
  "hobbies",
  "hobbiesOther",
  "idDocument",
  "personalPhoto",
  "cv",
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function checkFile(
  file: File | null,
  kind: "image" | "document"
): Msg | undefined {
  if (!file || file.size === 0) return M.file;
  const okType =
    kind === "image"
      ? IMAGE_TYPES.includes(file.type)
      : DOC_TYPES.includes(file.type) || DOC_EXT.test(file.name);
  if (!okType) return M.fileType;
  const max = kind === "image" ? VOLUNTEER_IMAGE_MAX_MB : VOLUNTEER_DOCUMENT_MAX_MB;
  if (file.size > max * 1024 * 1024) return fileTooBig(max);
  return undefined;
}

function str(fd: FormData, key: string) {
  const value = fd.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validate(fd: FormData, hobbies: string[]): Errors {
  const errors: Errors = {};
  const need = (key: string, msg: Msg = M.required) => {
    if (!str(fd, key)) errors[key] = msg;
  };

  if (str(fd, "fullName").length < 2) errors.fullName = M.fullName;
  need("gender", M.choose);

  const dob = str(fd, "dateOfBirth");
  if (!dob) errors.dateOfBirth = M.required;
  else if (dob > todayIso() || dob < "1940-01-01") errors.dateOfBirth = M.dob;

  need("governorateId", M.choose);
  if (str(fd, "address").length < 3) errors.address = M.address;

  const phone = str(fd, "phone");
  if (!phone) errors.phone = M.required;
  else if (!isValidVolunteerPhone(phone)) errors.phone = M.phone;

  const telegram = str(fd, "telegram");
  if (!telegram) errors.telegram = M.required;
  else if (!isValidVolunteerTelegram(telegram)) errors.telegram = M.telegram;

  need("hasLinkedIn", M.choose);
  need("employmentStatus", M.choose);
  need("educationLevel", M.choose);
  if (str(fd, "educationLevel") === OTHER) need("educationLevelOther");
  need("university", M.choose);
  need("college", M.choose);
  need("studyYear", M.choose);
  if (str(fd, "studyYear") === OTHER) need("studyYearOther");

  if (hobbies.length === 0) errors.hobbies = M.hobbies;
  if (hobbies.includes(OTHER)) need("hobbiesOther");

  const file = (key: string) => {
    const value = fd.get(key);
    return value instanceof File ? value : null;
  };
  const idErr = checkFile(file("idDocument"), "image");
  if (idErr) errors.idDocument = idErr;
  const photoErr = checkFile(file("personalPhoto"), "image");
  if (photoErr) errors.personalPhoto = photoErr;
  const cvErr = checkFile(file("cv"), "document");
  if (cvErr) errors.cv = cvErr;

  return errors;
}

export function VolunteerRequestForm({
  governorates,
  onSubmit,
  submitting,
  error,
  onDirtyChange,
}: VolunteerRequestFormProps) {
  const locale: Locale = localeFromPath(usePathname() || "/ar");
  const t = (ar: string, en: string) => (locale === "en" ? en : ar);
  const tm = (msg: Msg) => (locale === "en" ? msg.en : msg.ar);

  const formRef = useRef<HTMLFormElement>(null);
  const serverErrorRef = useRef<HTMLDivElement>(null);
  const dirtyRef = useRef(false);

  const [employmentStatus, setEmploymentStatus] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [studyYear, setStudyYear] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [progress, setProgress] = useState(0);

  const errorCount = Object.keys(errors).length;
  const showWorkplace =
    employmentStatus !== "" && !NO_WORKPLACE_STATUSES.has(employmentStatus);

  useEffect(() => {
    if (error) {
      serverErrorRef.current?.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [error]);

  function updateProgress(currentHobbies = hobbies) {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const required = [
      "fullName",
      "gender",
      "dateOfBirth",
      "governorateId",
      "address",
      "phone",
      "telegram",
      "hasLinkedIn",
      "employmentStatus",
      "educationLevel",
      "university",
      "college",
      "studyYear",
    ];
    let done = required.filter((key) => str(fd, key)).length;
    if (currentHobbies.length > 0) done += 1;
    for (const key of ["idDocument", "personalPhoto", "cv"]) {
      const value = fd.get(key);
      if (value instanceof File && value.size > 0) done += 1;
    }
    const total = required.length + 4;
    setProgress(Math.round((done / total) * 100));

    const dirty = done > 0;
    if (dirty !== dirtyRef.current) {
      dirtyRef.current = dirty;
      onDirtyChange?.(dirty);
    }
  }

  function clearError(name: string) {
    if (!name || !errors[name]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function toggleHobby(hobby: string) {
    const next = hobbies.includes(hobby)
      ? hobbies.filter((item) => item !== hobby)
      : [...hobbies, hobby];
    setHobbies(next);
    clearError("hobbies");
    updateProgress(next);
  }

  function focusField(name: string) {
    const form = formRef.current;
    if (!form) return;
    const target =
      name === "hobbies"
        ? form.querySelector<HTMLElement>('[data-field="hobbies"] input')
        : form.querySelector<HTMLElement>(`[name="${name}"]`);
    target?.focus({ preventScroll: true });
    target
      ?.closest("[data-field]")
      ?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  }

  function normalizeOnBlur(name: "phone" | "telegram", value: string) {
    const form = formRef.current;
    const input = form?.elements.namedItem(name);
    if (!(input instanceof HTMLInputElement)) return;
    const normalized =
      name === "phone"
        ? normalizeVolunteerPhone(value)
        : normalizeVolunteerTelegram(value);
    if (normalized && normalized !== value) input.value = normalized;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.set("phone", normalizeVolunteerPhone(str(formData, "phone")));
    formData.set(
      "telegram",
      normalizeVolunteerTelegram(str(formData, "telegram"))
    );
    formData.set("hobbies", JSON.stringify(hobbies));

    const nextErrors = validate(formData, hobbies);
    setErrors(nextErrors);
    const firstInvalid = FIELD_ORDER.find((key) => nextErrors[key]);
    if (firstInvalid) {
      setShowSummary(true);
      focusField(firstInvalid);
      return;
    }

    setShowSummary(false);
    await onSubmit(formData);
  }

  function fieldProps(name: string) {
    const invalid = Boolean(errors[name]);
    return {
      id: `vf-${name}`,
      name,
      "aria-invalid": invalid || undefined,
      "aria-describedby": invalid ? `vf-${name}-error` : undefined,
      className: `volunteer-form__input${invalid ? " is-invalid" : ""}`,
    };
  }

  const placeholderOption = (
    <option value="" disabled>
      {t("اختر من القائمة", "Select an option")}
    </option>
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={(e) => {
        // Change events bubble up from the individual inputs.
        const { name } = e.target as unknown as { name?: string };
        clearError(name ?? "");
        updateProgress();
      }}
      className="volunteer-form"
      encType="multipart/form-data"
      noValidate
    >
      <div className="volunteer-form__intro">
        <p>
          {t(
            "يستغرق ملء الطلب نحو 10 دقائق. جهّز مسبقاً: صورة لهويتك، وصورة شخصية بخلفية بيضاء، وسيرتك الذاتية على النموذج المعتمد.",
            "This takes about 10 minutes. Have these ready: a photo of your ID, a personal photo on a white background, and your CV on our template."
          )}
        </p>
        <p className="volunteer-form__required-note">
          {t("الحقول المعلّمة بـ", "Fields marked")}{" "}
          <span className="volunteer-form__req" aria-hidden="true">
            *
          </span>{" "}
          {t("إلزامية.", "are required.")}
        </p>
      </div>

      <div
        className="volunteer-form__progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={t("نسبة إكمال الطلب", "Form completion")}
      >
        <div className="volunteer-form__progress-track">
          <div
            className="volunteer-form__progress-bar"
            style={{ inlineSize: `${progress}%` }}
          />
        </div>
        <span className="volunteer-form__progress-label">
          {t(`مكتمل ${progress}%`, `${progress}% complete`)}
        </span>
      </div>

      {/* 1. About you */}
      <Section
        number={1}
        title={t("البيانات الشخصية", "About you")}
      >
        <Field
          name="fullName"
          label={t("الاسم الثلاثي", "Full name")}
          hint={t(
            "الاسم واسم الأب والكنية",
            "First name, father's name and family name"
          )}
          required
          error={errors.fullName && tm(errors.fullName)}
        >
          <input {...fieldProps("fullName")} autoComplete="name" maxLength={120} />
        </Field>

        <div className="volunteer-form__grid">
          <ChoiceGroup
            name="gender"
            label={t("الجنس", "Gender")}
            required
            error={errors.gender && tm(errors.gender)}
          >
            {VOLUNTEER_GENDERS.map((gender) => (
              <Choice
                key={gender}
                name="gender"
                value={gender}
                label={volunteerOptionLabel(gender, locale)}
              />
            ))}
          </ChoiceGroup>

          <Field
            name="dateOfBirth"
            label={t("تاريخ الميلاد", "Date of birth")}
            required
            error={errors.dateOfBirth && tm(errors.dateOfBirth)}
          >
            <input
              {...fieldProps("dateOfBirth")}
              type="date"
              autoComplete="bday"
              min="1940-01-01"
              max={todayIso()}
            />
          </Field>
        </div>

        <Field
          name="governorateId"
          label={t("المحافظة", "Governorate")}
          required
          error={errors.governorateId && tm(errors.governorateId)}
        >
          <select {...fieldProps("governorateId")} defaultValue="">
            {placeholderOption}
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {locale === "en" ? g.nameEn || g.nameAr : g.nameAr}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="address"
          label={t("عنوان السكن", "Home address")}
          hint={t(
            "المحافظة – المنطقة – المدينة أو البلدة",
            "Governorate – district – city or town"
          )}
          required
          error={errors.address && tm(errors.address)}
        >
          <input
            {...fieldProps("address")}
            autoComplete="street-address"
            maxLength={300}
            placeholder={t(
              "مثال: إدلب – معرة النعمان – جرجناز",
              "e.g. Idlib – Maarat al-Numan – Jirjnaz"
            )}
          />
        </Field>
      </Section>

      {/* 2. Contact */}
      <Section number={2} title={t("معلومات التواصل", "How to reach you")}>
        <div className="volunteer-form__grid">
          <Field
            name="phone"
            label={t("رقم الواتساب", "WhatsApp number")}
            hint={t(
              "سنضيف رمز سوريا (00963) تلقائياً إن لم تكتبه",
              "We'll add Syria's code (00963) if you leave it out"
            )}
            required
            error={errors.phone && tm(errors.phone)}
          >
            <input
              {...fieldProps("phone")}
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              maxLength={24}
              placeholder="0912 345 678"
              onBlur={(e) => normalizeOnBlur("phone", e.target.value)}
            />
          </Field>

          <Field
            name="telegram"
            label={t("معرّف تيليغرام", "Telegram username")}
            hint={t(
              "اسم المستخدم في تيليغرام، مثل ‎@username",
              "Your Telegram handle, e.g. @username"
            )}
            required
            error={errors.telegram && tm(errors.telegram)}
          >
            <input
              {...fieldProps("telegram")}
              dir="ltr"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={64}
              placeholder="@username"
              onBlur={(e) => normalizeOnBlur("telegram", e.target.value)}
            />
          </Field>
        </div>

        <ChoiceGroup
          name="hasLinkedIn"
          label={t(
            "هل لديك حساب على LinkedIn؟",
            "Do you have a LinkedIn account?"
          )}
          required
          error={errors.hasLinkedIn && tm(errors.hasLinkedIn)}
        >
          {VOLUNTEER_YES_NO.map((value) => (
            <Choice
              key={value}
              name="hasLinkedIn"
              value={value}
              label={volunteerOptionLabel(value, locale)}
            />
          ))}
        </ChoiceGroup>
      </Section>

      {/* 3. Work and education */}
      <Section number={3} title={t("العمل والدراسة", "Work and education")}>
        <Field
          name="employmentStatus"
          label={t("ما وضعك المهني الحالي؟", "What is your current work status?")}
          required
          error={errors.employmentStatus && tm(errors.employmentStatus)}
        >
          <select
            {...fieldProps("employmentStatus")}
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
          >
            {placeholderOption}
            {VOLUNTEER_EMPLOYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {volunteerOptionLabel(status, locale)}
              </option>
            ))}
          </select>
        </Field>

        {showWorkplace ? (
          <Field
            name="workplacePosition"
            label={t(
              "أين تعمل، وما مسمّاك الوظيفي؟",
              "Where do you work, and what is your role?"
            )}
            optionalLabel={t("اختياري", "Optional")}
          >
            <input
              {...fieldProps("workplacePosition")}
              maxLength={200}
              placeholder={t(
                "مثال: مصمم جرافيك في شركة …",
                "e.g. Graphic designer at …"
              )}
            />
          </Field>
        ) : null}

        <div className="volunteer-form__grid">
          <Field
            name="educationLevel"
            label={t("أعلى مؤهل علمي حصلت عليه", "Highest qualification")}
            required
            error={errors.educationLevel && tm(errors.educationLevel)}
          >
            <select
              {...fieldProps("educationLevel")}
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              {placeholderOption}
              {VOLUNTEER_EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {volunteerOptionLabel(level, locale)}
                </option>
              ))}
            </select>
          </Field>

          <Field
            name="studyYear"
            label={t("السنة الدراسية الحالية", "Current year of study")}
            required
            error={errors.studyYear && tm(errors.studyYear)}
          >
            <select
              {...fieldProps("studyYear")}
              value={studyYear}
              onChange={(e) => setStudyYear(e.target.value)}
            >
              {placeholderOption}
              {VOLUNTEER_STUDY_YEARS.map((year) => (
                <option key={year} value={year}>
                  {volunteerOptionLabel(year, locale)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {educationLevel === OTHER ? (
          <Field
            name="educationLevelOther"
            label={t("اكتب مؤهلك العلمي", "Please specify your qualification")}
            required
            error={errors.educationLevelOther && tm(errors.educationLevelOther)}
          >
            <input {...fieldProps("educationLevelOther")} maxLength={120} />
          </Field>
        ) : null}

        {studyYear === OTHER ? (
          <Field
            name="studyYearOther"
            label={t("اكتب سنتك الدراسية", "Please specify your year of study")}
            required
            error={errors.studyYearOther && tm(errors.studyYearOther)}
          >
            <input {...fieldProps("studyYearOther")} maxLength={120} />
          </Field>
        ) : null}

        <Field
          name="university"
          label={t("الجامعة أو جهة الدراسة", "University or place of study")}
          hint={t(
            "اختر «لا يوجد» إن لم ينطبق عليك",
            "Choose “None” if this doesn't apply"
          )}
          required
          error={errors.university && tm(errors.university)}
        >
          <select {...fieldProps("university")} defaultValue="">
            {placeholderOption}
            {VOLUNTEER_UNIVERSITIES.map((university) => (
              <option key={university} value={university}>
                {volunteerOptionLabel(university, locale)}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="college"
          label={t("الكلية أو المعهد", "Faculty or institute")}
          hint={t(
            "الذي تدرس فيه حالياً أو تخرّجت منه",
            "Where you study now or graduated from"
          )}
          required
          error={errors.college && tm(errors.college)}
        >
          <select {...fieldProps("college")} defaultValue="">
            {placeholderOption}
            {VOLUNTEER_COLLEGES.map((college) => (
              <option key={college} value={college}>
                {volunteerOptionLabel(college, locale)}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      {/* 4. Hobbies */}
      <Section number={4} title={t("الهوايات والاهتمامات", "Hobbies and interests")}>
        <fieldset
          className="volunteer-form__fieldset"
          data-field="hobbies"
          aria-describedby={errors.hobbies ? "vf-hobbies-error" : undefined}
        >
          <legend className="volunteer-form__label">
            {t("ما هواياتك واهتماماتك؟", "What are your hobbies and interests?")}
            <span className="volunteer-form__req" aria-hidden="true">
              {" "}
              *
            </span>
          </legend>
          <p className="volunteer-form__hint">
            {t(
              "اختر كل ما ينطبق عليك، خياراً واحداً على الأقل.",
              "Pick everything that applies — at least one."
            )}
            {hobbies.length > 0 ? (
              <span className="volunteer-form__count">
                {t(`تم اختيار ${hobbies.length}`, `${hobbies.length} selected`)}
              </span>
            ) : null}
          </p>
          <div
            className={`volunteer-form__hobbies${errors.hobbies ? " is-invalid" : ""}`}
          >
            {VOLUNTEER_HOBBIES.map((hobby) => {
              const { title, examples } = volunteerHobbyDisplay(hobby, locale);
              const checked = hobbies.includes(hobby);
              return (
                <label
                  key={hobby}
                  className={`volunteer-form__hobby${checked ? " is-checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="volunteer-form__hobby-input"
                    checked={checked}
                    onChange={() => toggleHobby(hobby)}
                  />
                  <span className="volunteer-form__hobby-check" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="volunteer-form__hobby-text">
                    <span className="volunteer-form__hobby-title">{title}</span>
                    {examples ? (
                      <span className="volunteer-form__hobby-examples">
                        {examples}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
          <FieldError name="hobbies" message={errors.hobbies && tm(errors.hobbies)} />
        </fieldset>

        {hobbies.includes(OTHER) ? (
          <Field
            name="hobbiesOther"
            label={t("ما هواياتك الأخرى؟", "What other hobbies do you have?")}
            required
            error={errors.hobbiesOther && tm(errors.hobbiesOther)}
          >
            <input {...fieldProps("hobbiesOther")} maxLength={200} />
          </Field>
        ) : null}
      </Section>

      {/* 5. Documents */}
      <Section
        number={5}
        title={t("الوثائق والسيرة الذاتية", "Documents and CV")}
        lede={t(
          "ارفع ملفات واضحة ومقروءة. الصور بصيغة JPG أو PNG أو WebP.",
          "Please upload clear, readable files. Images can be JPG, PNG or WebP."
        )}
      >
        <FileField
          name="idDocument"
          kind="image"
          locale={locale}
          label={t("صورة الهوية الشخصية", "Photo of your ID")}
          hint={t(
            "الوجهان الأمامي والخلفي في صورة واحدة. إن لم تكن لديك هوية، ارفع أي وثيقة رسمية أخرى.",
            "Front and back in a single image. No ID? Upload any other official document."
          )}
          error={errors.idDocument && tm(errors.idDocument)}
        />

        <FileField
          name="personalPhoto"
          kind="image"
          locale={locale}
          label={t("صورة شخصية رسمية", "Formal personal photo")}
          hint={t(
            "بخلفية بيضاء. للمتطوعات: يمكنكِ رفع أي صورة رسمية بخلفية بيضاء ترتاحين لمشاركتها، مثل صورة الهوية أو صورة رمزية (أفاتار) أو صورة بالنقاب.",
            "On a white background. Female volunteers may upload any formal image on a white background they are comfortable sharing, such as their ID photo, an avatar, or a photo wearing a niqab."
          )}
          error={errors.personalPhoto && tm(errors.personalPhoto)}
        />

        <div className="volunteer-form__cv-note">
          <div>
            <p className="volunteer-form__cv-title">
              {t("السيرة الذاتية على النموذج المعتمد", "CV on our approved template")}
            </p>
            <ol className="volunteer-form__steps">
              <li>{t("حمّل النموذج", "Download the template")}</li>
              <li>{t("املأه ببياناتك", "Fill in your details")}</li>
              <li>{t("ارفعه في الحقل أدناه", "Upload it below")}</li>
            </ol>
          </div>
          <a
            href={VOLUNTEER_CV_TEMPLATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="volunteer-form__cv-link"
          >
            <Download size={16} aria-hidden="true" />
            {t("تحميل النموذج", "Download template")}
          </a>
        </div>

        <FileField
          name="cv"
          kind="document"
          locale={locale}
          label={t("السيرة الذاتية بعد تعبئتها", "Your completed CV")}
          error={errors.cv && tm(errors.cv)}
        />
      </Section>

      <p className="request-form__privacy volunteer-form__privacy">
        {t(
          "نستخدم بياناتك ووثائقك لدراسة طلب التطوع والتواصل معك بشأنه.",
          "We use your details and documents to review your volunteer application and contact you about it."
        )}{" "}
        <LocaleLink href="/privacy">
          {t("سياسة الخصوصية", "Privacy policy")}
        </LocaleLink>
      </p>

      {error ? (
        <div
          ref={serverErrorRef}
          className="volunteer-form__alert"
          role="alert"
        >
          <CircleAlert size={18} aria-hidden="true" />
          <div>
            <strong>{t("لم يُرسل الطلب", "Your request wasn't sent")}</strong>
            <p>{SERVER_ERRORS[error] ? tm(SERVER_ERRORS[error]) : error}</p>
          </div>
        </div>
      ) : null}

      {showSummary && errorCount > 0 ? (
        <div className="volunteer-form__alert" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>
            {t(
              errorCount === 1
                ? "يرجى تصحيح الحقل المعلّم باللون الأحمر."
                : `يرجى تصحيح الحقول المعلّمة باللون الأحمر (${errorCount}).`,
              errorCount === 1
                ? "Please fix the highlighted field."
                : `Please fix the ${errorCount} highlighted fields.`
            )}
          </p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="volunteer-form__submit"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            {t("جارٍ الإرسال…", "Sending…")}
          </>
        ) : (
          t("إرسال الطلب", "Submit application")
        )}
      </button>
    </form>
  );
}

function Section({
  number,
  title,
  lede,
  children,
}: {
  number: number;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  const id = `vf-section-${number}`;
  return (
    <section className="volunteer-form__section" aria-labelledby={id}>
      <header className="volunteer-form__section-head">
        <span className="volunteer-form__section-num" aria-hidden="true">
          {number}
        </span>
        <div>
          <h3 id={id} className="volunteer-form__section-title">
            {title}
          </h3>
          {lede ? <p className="volunteer-form__lede">{lede}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function RequiredMark() {
  return (
    <span className="volunteer-form__req" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`vf-${name}-error`} className="volunteer-form__error">
      <CircleAlert size={14} aria-hidden="true" />
      {message}
    </p>
  );
}

function Field({
  name,
  label,
  hint,
  required,
  optionalLabel,
  error,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  optionalLabel?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="volunteer-form__field" data-field={name}>
      <label htmlFor={`vf-${name}`} className="volunteer-form__label">
        {label}
        {required ? <RequiredMark /> : null}
        {optionalLabel ? (
          <span className="volunteer-form__optional">{optionalLabel}</span>
        ) : null}
      </label>
      {hint ? <p className="volunteer-form__hint">{hint}</p> : null}
      {children}
      <FieldError name={name} message={error} />
    </div>
  );
}

function ChoiceGroup({
  name,
  label,
  required,
  error,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      className="volunteer-form__fieldset"
      data-field={name}
      aria-describedby={error ? `vf-${name}-error` : undefined}
    >
      <legend className="volunteer-form__label">
        {label}
        {required ? <RequiredMark /> : null}
      </legend>
      <div className={`volunteer-form__choices${error ? " is-invalid" : ""}`}>
        {children}
      </div>
      <FieldError name={name} message={error} />
    </fieldset>
  );
}

function Choice({
  name,
  value,
  label,
}: {
  name: string;
  value: string;
  label: string;
}) {
  return (
    <label className="volunteer-form__choice">
      <input type="radio" name={name} value={value} />
      <span>{label}</span>
    </label>
  );
}

function FileField({
  name,
  kind,
  locale,
  label,
  hint,
  error,
}: {
  name: string;
  kind: "image" | "document";
  locale: Locale;
  label: string;
  hint?: string;
  error?: string;
}) {
  const t = (ar: string, en: string) => (locale === "en" ? en : ar);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file || kind !== "image" || typeof URL.createObjectURL !== "function") {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, kind]);

  const maxMb = kind === "image" ? VOLUNTEER_IMAGE_MAX_MB : VOLUNTEER_DOCUMENT_MAX_MB;
  const accept =
    kind === "image"
      ? IMAGE_TYPES.join(",")
      : `.pdf,.doc,.docx,${DOC_TYPES.join(",")}`;
  const formats =
    kind === "image" ? "JPG · PNG · WebP" : "PDF · Word (DOC, DOCX)";

  function clear() {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setFile(null);
    inputRef.current?.focus();
  }

  return (
    <div className="volunteer-form__field" data-field={name}>
      <label htmlFor={`vf-${name}`} className="volunteer-form__label">
        {label}
        <RequiredMark />
      </label>
      {hint ? <p className="volunteer-form__hint">{hint}</p> : null}
      <div
        className={`volunteer-form__drop${file ? " has-file" : ""}${error ? " is-invalid" : ""}`}
      >
        <input
          ref={inputRef}
          id={`vf-${name}`}
          name={name}
          type="file"
          accept={accept}
          className="volunteer-form__drop-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `vf-${name}-error` : undefined}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="volunteer-form__file">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="volunteer-form__thumb" />
            ) : (
              <span className="volunteer-form__file-icon" aria-hidden="true">
                <FileText size={20} />
              </span>
            )}
            <span className="volunteer-form__file-meta">
              <span className="volunteer-form__file-name" dir="auto">
                {file.name}
              </span>
              <span className="volunteer-form__file-size">
                {formatSize(file.size)} · {t("اضغط للتغيير", "Click to change")}
              </span>
            </span>
            <button
              type="button"
              className="volunteer-form__file-remove"
              onClick={clear}
              aria-label={t("إزالة الملف", "Remove file")}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="volunteer-form__drop-empty" aria-hidden="true">
            <CloudUpload size={22} />
            <span className="volunteer-form__drop-cta">
              {t("اضغط لاختيار ملف أو اسحبه إلى هنا", "Click to choose a file, or drag it here")}
            </span>
            <span className="volunteer-form__drop-meta">
              {formats} · {t(`حتى ${maxMb} ميغابايت`, `up to ${maxMb} MB`)}
            </span>
          </div>
        )}
      </div>
      <FieldError name={name} message={error} />
    </div>
  );
}
