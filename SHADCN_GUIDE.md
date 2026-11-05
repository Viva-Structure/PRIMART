# Guide Shadcn/ui - Plateforme PRIMART

## ✅ Installation complétée

- ✅ Tailwind CSS v3
- ✅ Shadcn/ui (configuration manuelle)
- ✅ Alias @ configuré dans Vite
- ✅ Composants de base installés:
  - Button
  - Card
  - Input
  - Label

## 📦 Composants disponibles

### Utilisation

```jsx
import { Button, Card, CardHeader, CardTitle, Input, Label } from '@/components/ui'

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Titre</CardTitle>
      </CardHeader>
      <Button variant="default">Cliquer</Button>
      <Input placeholder="Entrez du texte" />
    </Card>
  )
}
```

## 🚀 Ajouter plus de composants Shadcn/ui

### Composants populaires à ajouter:

#### 1. Dialog (Modal)
```bash
npm install @radix-ui/react-dialog
```

Créez `src/components/ui/dialog.jsx` avec le code Shadcn/ui pour Dialog

#### 2. Select
```bash
npm install @radix-ui/react-select
```

#### 3. Tabs
```bash
npm install @radix-ui/react-tabs
```

#### 4. Alert
```bash
npm install @radix-ui/react-alert-dialog
```

#### 5. Toast
```bash
npm install sonner
```

### Structure des composants

Chaque composant Shadcn/ui suit cette structure:
```jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const MyComponent = React.forwardRef(({ className, ...props }, ref) => (
  <div className={cn("base-styles", className)} ref={ref} {...props} />
))
MyComponent.displayName = "MyComponent"

export { MyComponent }
```

## 🎨 Customisation Tailwind

Modifiez `tailwind.config.js` pour personnaliser les couleurs, espacements, etc.

### Exemple:
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      }
    },
  },
}
```

## 📖 Ressources

- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)

## 🔧 Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Vérifier les erreurs eslint
npm run lint
```
