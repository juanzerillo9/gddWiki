// WikiLink inline extension placeholder
// BlockNote's inline content API evolves quickly; this file exposes
// the types and utilities for @-mention wikilinks once integrated.

export type WikiLinkAttrs = {
  pageId: string
  label: string
}

// TODO (Etapa 2): Implement custom BlockNote inline content type `pageLink`
// using createReactInlineContentSpec from @blocknote/react.
// The mention should open a combobox of pages in the same game
// when the user types "@".
export {}
