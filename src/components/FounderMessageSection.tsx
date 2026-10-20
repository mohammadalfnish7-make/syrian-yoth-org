import Image from "next/image";
import type { FounderMessageSettings } from "@/types/site";

type FounderMessageSectionProps = {
  message: FounderMessageSettings;
};

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function FounderMessageSection({ message }: FounderMessageSectionProps) {
  const hasBody = message.body.ar.trim() || message.body.en.trim();
  if (!hasBody) return null;

  const arParagraphs = paragraphs(message.body.ar);
  const enParagraphs = paragraphs(message.body.en);

  return (
    <section className="section section--grey" aria-labelledby="founder-message-heading">
      <div className="container-yaf founder-message">
        <h2 id="founder-message-heading" className="founder-message__label content-ar">
          {message.label.ar}
        </h2>
        <h2 className="founder-message__label content-en">{message.label.en}</h2>

        <div className="founder-message__layout">
          {message.imageUrl ? (
            <div className="founder-message__portrait">
              <Image
                src={message.imageUrl}
                alt={message.name.ar || message.name.en}
                fill
                className="founder-message__image"
                sizes="(max-width: 719px) 160px, 200px"
                unoptimized={
                  message.imageUrl.startsWith("/api/uploads/") ||
                  message.imageUrl.startsWith("/images/managers/")
                }
              />
            </div>
          ) : null}

          <blockquote className="founder-message__quote">
            <div className="content-ar">
              {arParagraphs.map((paragraph, index) => (
                <p key={`ar-${index}`}>{paragraph}</p>
              ))}
            </div>
            <div className="content-en">
              {enParagraphs.map((paragraph, index) => (
                <p key={`en-${index}`}>{paragraph}</p>
              ))}
            </div>

            <footer className="founder-message__signoff">
              <cite className="founder-message__name content-ar">{message.name.ar}</cite>
              <cite className="founder-message__name content-en">{message.name.en}</cite>
              <span className="founder-message__role content-ar">{message.role.ar}</span>
              <span className="founder-message__role content-en">{message.role.en}</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
