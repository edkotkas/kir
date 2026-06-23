# キR (kir)

A lightweight desktop QR code generator with image masking, built with Tauri and React.

## Features

- **QR Code Generation** — Generate QR codes from any text input
- **Custom Styling** — Customize foreground and background colors with contrast validation
- **Image Masking** — Upload an image to create a QR code with a cutout effect
- **Auto-Save History** — Automatically save generated QR codes to local history
- **Desktop App** — Mobile-sized window bundled via Tauri for Windows

## Tech Stack

- [Tauri 2](https://v2.tauri.app/) — Desktop runtime
- [React 19](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) — Styling
- [Vite 8](https://vite.dev/) — Build tool

## Development

```bash
npm install          # Install dependencies
npm run tauri:dev    # Run the desktop app in development mode
npm run tauri:build  # Build the production binary
```