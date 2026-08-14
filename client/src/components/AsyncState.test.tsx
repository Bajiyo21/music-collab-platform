import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState, ListSkeleton } from "./AsyncState";

describe("AsyncState components", () => {
  it("renders the requested number of accessible loading placeholders", () => {
    const markup = renderToStaticMarkup(<ListSkeleton rows={2} />);
    expect(markup).toContain('role="status"');
    expect((markup.match(/animate-pulse/g) ?? []).length).toBe(6);
  });

  it("renders an empty-state title, description, and optional action", () => {
    const markup = renderToStaticMarkup(<EmptyState title="No tracks yet" description="Upload a track to begin." action={<button>Upload</button>} />);
    expect(markup).toContain("No tracks yet");
    expect(markup).toContain("Upload a track to begin.");
    expect(markup).toContain("Upload");
  });
});
