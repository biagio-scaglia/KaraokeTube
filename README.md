# 🎤 KaraokeTube

**KaraokeTube** è un'applicazione web moderna e reattiva progettata per portare l'esperienza del karaoke direttamente nel tuo browser. Sfruttando la potenza di YouTube e la sincronizzazione precisa dei testi tramite file `.lrc`, KaraokeTube trasforma qualsiasi video musicale in una sessione di karaoke professionale.

---
> [!NOTE]
> **Made by Biagio** - Sviluppato con passione per tutti gli amanti della musica.

## ✨ Caratteristiche Principali

- 📺 **Integrazione YouTube**: Carica qualsiasi video musicale semplicemente inserendo l'URL o l'ID del video.
- 🎶 **Sincronizzazione Testi**: Supporto per il formato `.lrc` per visualizzare i testi in tempo reale, perfettamente a tempo con la musica.
- 📱 **Mobile Friendly**: Interfaccia ottimizzata per smartphone, tablet e desktop.
- 🎨 **Interfaccia Moderna**: Design elegante con animazioni fluide grazie a Framer Motion e icone di Lucide-React.
- ⚡ **Performance Elevate**: Costruito con React 19, TypeScript e Vite per una velocità fulminea.

## 🚀 Tecnologie Utilizzate

- **Core**: [React 19](https://react.dev/)
- **Linguaggio**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animazioni**: [Framer Motion](https://www.framer.com/motion/)
- **Icone**: [Lucide React](https://lucide.dev/)

## 🛠️ Installazione e Sviluppo

Se desideri eseguire il progetto localmente, segui questi passaggi:

1. **Clona il repository**:
   ```bash
   git clone https://github.com/biagio-scaglia/KaraokeTube.git
   cd KaraokeTube
   ```

2. **Installa le dipendenze**:
   ```bash
   npm install
   ```

3. **Avvia il server di sviluppo**:
   ```bash
   npm run dev
   ```

4. **Build per la produzione**:
   ```bash
   npm run build
   ```

## 🌐 Deployment (Cloudflare Pages)

Il progetto è pronto per essere distribuito su **Cloudflare Pages**. 

### Configurazione su Cloudflare:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Root Directory**: `/`

Per gestire correttamente il routing lato client, è presente un file `_redirects` nella cartella `public`.

---

**KaraokeTube** - *Canta la tua passione.*

