import { Text } from "@var-ui/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { ErrorText } from "./ErrorText";

const classesOf = (html: string): string[] =>
  (/class="([^"]*)"/.exec(html)?.[1] ?? "").split(/\s+/).filter(Boolean);

describe("ErrorText", () => {
  it("renders the message with Text's own classes plus a danger class", () => {
    const plain = classesOf(renderToStaticMarkup(<Text size="sm">Oops</Text>));
    const html = renderToStaticMarkup(<ErrorText size="sm">Oops</ErrorText>);
    const error = classesOf(html);

    expect(html).toContain("Oops");
    for (const name of plain) expect(error).toContain(name);
    expect(error.length).toBe(plain.length + 1);
  });

  it("keeps a caller's className", () => {
    const html = renderToStaticMarkup(<ErrorText className="extra">Oops</ErrorText>);
    expect(classesOf(html)).toContain("extra");
  });
});
