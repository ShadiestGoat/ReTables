# Replugged Tables

A plug to render markdown tables, in discord.

## Features

- Renders Tables!!!!
  - Including column alignment
- Utility classes:
  - Table: md-table
  - Rows: md-table-row
  - Cell: md-table-col
  - Alignment: md-table-col-{left/center/right}
  - Heading columns: md-table-h
- Pre-format tables before sending them (so that non plugin users still see tables)
  - Note - because of fonts not being monospaced, while it'd help somewhat, it isn't able to fully format the tables to be amazing. Sorry ://

## TODO Before Release

- [ ] Excel-like tab navigation:
  - [ ] tab: go to or create next cell in same row
  - [ ] shift+tab: go to previous cell on same row, or go to last cell on previous row
  - [ ] enter: go to or create first cell on next row
- [ ] Configurable column justification keybinds
