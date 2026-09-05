import type { TermsContent, TermsListItem, TermsSection } from "@/lib/types";

const LIST_CLASS: Record<NonNullable<TermsSection["listStyle"]>, string> = {
  disc: "list-disc pl-5",
  alpha: "list-[lower-alpha] pl-5",
  decimal: "list-decimal pl-5",
};

function ClauseItems({ items, listStyle }: { items: TermsListItem[]; listStyle?: TermsSection["listStyle"] }) {
  return (
    <ul className={LIST_CLASS[listStyle ?? "decimal"]}>
      {items.map((item, index) => (
        <li key={index} className="mb-4">
          {item.term ? (
            <>
              <strong>&quot;{item.term}&quot;</strong> {item.text}
            </>
          ) : (
            item.text
          )}
          {item.subItems && item.subItems.length > 0 ? (
            <ul className="mt-3 list-[upper-roman] pl-5">
              {item.subItems.map((sub) => (
                <li key={sub} className="mb-2">
                  {sub}
                </li>
              ))}
            </ul>
          ) : null}
          {item.after ? <p className="mt-3">{item.after}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function TermsDocument({ content }: { content: TermsContent }) {
  return (
    <div className="terms-doc mx-[10%] mt-[3%] text-justify max-md:mx-[5%] max-md:mt-4">
      <h1>{content.companyName}</h1>
      <h1 className="mb-10">{content.title}</h1>
      {content.sections.map((section) => (
        <section key={section.heading}>
          <h1 className="mb-4">{section.heading}</h1>
          {section.body ? <p className="mb-4">{section.body}</p> : null}
          {section.items && section.items.length > 0 ? (
            <ClauseItems items={section.items} listStyle={section.listStyle} />
          ) : null}
        </section>
      ))}
    </div>
  );
}
