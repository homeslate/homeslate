import { describe, expect, it } from "vite-plus/test";
import { getRegisteredCss } from "typestyles";
import {
  iconOnly,
  panel,
  panelTitle,
  widgetCopy,
  widgetIcon,
  widgetRow,
} from "./WidgetPanel.styles";

describe("WidgetPanel styles", () => {
  it("lays widget rows out as a full-width left-aligned list", () => {
    void widgetRow;
    void iconOnly;
    const css = getRegisteredCss();
    expect(css).toMatch(/\.ts-widgetpanel-widgetrow-\w+\s*\{[^}]*justify-content:\s*flex-start/);
    expect(css).toMatch(/\.ts-widgetpanel-widgetrow-\w+\s*\{[^}]*width:\s*100%/);
  });

  it("matches the add-widget list: tall rows, muted title, gray icon tiles", () => {
    void panel;
    void panelTitle;
    void widgetRow;
    void widgetIcon;
    void widgetCopy;
    const css = getRegisteredCss();
    expect(css).toMatch(/\.ts-widgetpanel-widgetrow-\w+\s*\{[^}]*height:\s*auto/);
    expect(css).toMatch(/\.ts-widgetpanel-widgetrow-\w+\s*\{[^}]*min-height:\s*0/);
    expect(css).toMatch(/\.ts-widgetpanel-widgeticon-\w+\s*\{[^}]*width:\s*40px/);
    expect(css).toMatch(
      /\.ts-widgetpanel-widgeticon-\w+\s*\{[^}]*color:\s*var\(--var-ui-color-text-primary\)/,
    );
    expect(css).toMatch(/\.ts-widgetpanel-widgeticon-\w+\s*\{[^}]*color-mix\(in srgb/);
    expect(css).toMatch(
      /\.ts-widgetpanel-panel-\w+\s*\{[^}]*background:\s*var\(--var-ui-color-background-app\)/,
    );
    expect(css).toMatch(
      /\.ts-widgetpanel-paneltitle-\w+\s*\{[^}]*color:\s*var\(--var-ui-color-text-secondary\)/,
    );
    expect(css).toMatch(/\.ts-widgetpanel-widgetcopy-\w+\s*\{[^}]*min-width:\s*0/);
  });
});
