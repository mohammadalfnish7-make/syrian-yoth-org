import type { PublicSettings } from "@/types/site";
import { telHref, whatsappHref } from "@/lib/phone";

export function ContactLinks({ contact }: { contact: PublicSettings["contact"] }) {
  const addressEn = contact.address === "دمشق، سوريا" ? "Damascus, Syria" : contact.address;

  return (
    <ul className="footer__contact">
      <li>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </li>
      <li>
        <a href={telHref(contact.phone)}>{contact.phone}</a>
      </li>
      <li>
        <a href={whatsappHref(contact.phone)} target="_blank" rel="noopener noreferrer">
          <span className="content-ar">واتساب</span>
          <span className="content-en">WhatsApp</span>
        </a>
      </li>
      <li>
        <span className="content-ar">{contact.address}</span>
        <span className="content-en">{addressEn}</span>
      </li>
    </ul>
  );
}
