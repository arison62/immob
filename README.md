# Immob - Gestion de Patrimoine Immobilier Meublé

Application web moderne de gestion de biens immobiliers meublés, développée avec Django et React via Inertia.js.

## 📋 Table des matières

- [À propos](#à-propos)
- [Technologies utilisées](#technologies-utilisées)
- [Architecture du projet](#architecture-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Structure du projet](#structure-du-projet)
- [Ressources et documentation](#ressources-et-documentation)
- [Contribution](#contribution)

## 🎯 À propos

**Immob** est une application de gestion de patrimoine immobilier meublé qui permet de :
- Gérer les biens immobiliers et leurs caractéristiques
- Suivre les contrats de location
- Visualiser le patrimoine sur une carte interactive
- Générer des tableaux de bord et statistiques

Le projet utilise un stack technologique moderne et équilibré, évitant la complexité d'une API REST complète tout en offrant une expérience utilisateur performante.

## 🛠 Technologies utilisées

### Backend
- **[Django](https://www.djangoproject.com/)** (≥ 5.0) - Framework web Python mature avec sécurité intégrée
- **[PostgreSQL](https://www.postgresql.org/)** (≥ 14) - Base de données relationnelle robuste
- **[Inertia-Django](https://inertiajs.github.io/inertia-django/)** - Bridge pour intégrer React sans API REST

### Frontend
- **[React.js](https://react.dev/)** (≥ 18) - Bibliothèque JavaScript pour interfaces réactives
- **[Inertia.js](https://inertiajs.com/)** - Créer des SPA avec backends monolithiques
- **[Vite](https://vitejs.dev/)** - Build tool moderne et rapide
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Shadcn UI](https://ui.shadcn.com/)** - Collection de composants React réutilisables

### Pourquoi ce stack ?

- ✅ **Django** : Sécurité robuste (authentification, protection XSS/CSRF, injection SQL)
- ✅ **Inertia-Django** : Intégration React sans complexité API REST
- ✅ **React.js** : Performance et réactivité côté frontend
- ✅ **Shadcn UI** : Composants prêts à l'emploi, personnalisables
- ✅ **Tailwind CSS** : Styling rapide et responsive
- ✅ **PostgreSQL** : Gestion de données complexes avec performance

## 📁 Architecture du projet

```
immob/
├── immob/                  # Configuration Django principale
│   ├── settings.py        # Paramètres du projet
│   ├── urls.py            # Routes principales
│   └── wsgi.py            # Point d'entrée WSGI
├── frontend/              # Ressources frontend (React + Vite)
│   ├── css/               # Fichiers CSS
│   │   └── main.css       # Styles generer par tailwindcss
│   │   └── tailwind.css   # Styles  tailwindcss
│   └── js/                # Fichiers JavaScript/React
│       ├── components/    # Composants React réutilisables
│       ├── lib/           # Utilitaires (cn helper, etc.)
│       ├── pages/         # Composants pages Inertia
│       └── main.tsx       # Point d'entrée React/Inertia
├── templates/             # Templates Django de base
│   └── base.html          # Template racine pour Inertia
├── docs/                  # Documentation du projet
├── static/                # Fichiers statiques (CSS, JS compilés)
├── media/                 # Fichiers uploadés par les utilisateurs
├── components.json        # Configuration Shadcn UI
├── package.json           # Dépendances Node.js
├── requirements.txt       # Dépendances Python
├── vite.config.js         # Configuration Vite
├── tailwind.config.js     # Configuration Tailwind CSS
├── .env.example           # Exemple de variables d'environnement
├── .env                   # Variables d'environnement (non versionné)
├── manage.py              # Utilitaire Django
└── README.md              # Ce fichier
```

## 💻 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python** ≥ 3.10 ([Télécharger](https://www.python.org/downloads/))
- **PostgreSQL** ≥ 14 ([Télécharger](https://www.postgresql.org/download/))
- **Node.js** ≥ 20.x ([Télécharger](https://nodejs.org/))
- **npm** ou **yarn** (inclus avec Node.js)
- **Git** ([Télécharger](https://git-scm.com/downloads))

Vérifiez vos versions :
```bash
python --version
psql --version
node --version
npm --version
```

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/arison62/immob.git
cd immob
```

### 2. Configurer l'environnement Python

Créer et activer l'environnement virtuel :

**Linux/macOS :**
```bash
python -m venv .venv
source .venv/bin/activate
```

**Windows :**
```bash
python -m venv .venv
.venv\Scripts\activate
```

### 3. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### 4. Installer les dépendances Node.js

```bash
npm install
```

## ⚙️ Configuration

### 1. Variables d'environnement

Copier le fichier exemple et le configurer :

```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos paramètres :

```env
# Django
SECRET_KEY=votre-clé-secrète-django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données PostgreSQL (format URL)
DATABASE_URL=postgresql://utilisateur:mot_de_passe@localhost:5432/immob_db

# Exemple complet :
# DATABASE_URL=postgresql://immob_user:SecurePass123@localhost:5432/immob_db

# Autres configurations
DJANGO_SETTINGS_MODULE=immob.settings
```

### 2. Créer la base de données PostgreSQL

Connectez-vous à PostgreSQL et créez la base de données :

```bash
psql -U postgres
```

Dans le shell PostgreSQL :
```sql
CREATE DATABASE immob_db;
CREATE USER votre_utilisateur_postgres WITH PASSWORD 'votre_mot_de_passe';
ALTER ROLE votre_utilisateur_postgres SET client_encoding TO 'utf8';
ALTER ROLE votre_utilisateur_postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE votre_utilisateur_postgres SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE immob_db TO votre_utilisateur_postgres;
\q
```

### 3. Appliquer les migrations

```bash
python manage.py migrate
```

### 4. Créer un superutilisateur (optionnel)

```bash
python manage.py createsuperuser
```

## 🔧 Développement

### Lancer le projet en mode développement

Vous devez lancer **deux serveurs simultanément** dans des terminaux séparés :

**Terminal 1 - Serveur Django (backend) :**
```bash
source .venv/bin/activate  # Activer l'environnement virtuel
python manage.py runserver
```
Le serveur Django sera accessible sur `http://localhost:8000`

**Terminal 2 - Serveur Vite (frontend) :**
```bash
npm run dev
```
Le serveur Vite compilera les assets frontend en temps réel.

> **Note :** En développement, Django sert l'application et Vite compile les assets React/Tailwind en hot-reload.

### Commandes utiles

#### Django

```bash
# Créer une nouvelle app Django
python manage.py startapp nom_app

# Créer des migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Lancer le shell Django
python manage.py shell

# Collecter les fichiers statiques (production)
python manage.py collectstatic
```

#### Frontend

```bash
# Installer un composant Shadcn UI
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# Build de production
npm run build

# Linter le code JavaScript
npm run lint
```

#### Inertia.js

Dans vos vues Django, retournez une réponse Inertia :

```python
from inertia import render

def index(request):
    return render(request, 'Dashboard', {
        'user': request.user.serialize(),
        'stats': get_statistics()
    })
```

Le composant React correspondant dans `frontend/js/pages/Dashboard.jsx` :

```tsx
import React from 'react';
import { Head } from '@inertiajs/react';

export default function Dashboard({ user, stats }) {
    return (
        <>
            <Head title="Tableau de bord" />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold">Bienvenue {user.name}</h1>
                {/* Votre contenu */}
            </div>
        </>
    );
}
```

## 📚 Structure du projet

### Organisation des composants React

```
frontend/
├── css/
│   └── main.css                # Styles Generer
│   └── tailwind.css            # Styles Tailwind principaux
└── js/
    ├── main.tsx               # Point d'entrée Inertia/React
    ├── pages/                 # Pages Inertia (routes)
    │   ├── Dashboard.tsx
    │   ├── Properties/
    │   │   ├── Index.tsx
    │   │   ├── Show.tsx
    │   │   └── Create.tsx
    │   └── Auth/
    │       ├── Login.tsx
    │       └── Register.tsx
    ├── components/            # Composants réutilisables
    │   ├── ui/               # Composants Shadcn UI
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   └── ...
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   └── Sidebar.tsx
    │   └── PropertyCard.tsx
    └── lib/
        └── utils.ts          # Utilitaires (cn helper, etc.)
```

### Modèles Django (exemple)

```python
from django.db import models
from django.contrib.auth.models import User

class Property(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    address = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_furnished = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Properties"
```

## 📖 Ressources et documentation

### Documentation officielle

- **Django** : https://docs.djangoproject.com/
- **Django Tutorial (MDN)** : https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django
- **PostgreSQL** : https://www.postgresql.org/docs/
- **Inertia.js** : https://inertiajs.com/
- **Inertia-Django** : https://inertiajs.github.io/inertia-django/
- **React** : https://react.dev/learn
- **Vite** : https://vitejs.dev/guide/
- **Tailwind CSS** : https://tailwindcss.com/docs
- **Shadcn UI** : https://ui.shadcn.com/docs

### Tutoriels recommandés

- [Django Girls Tutorial](https://tutorial.djangogirls.org/)
- [React Beta Docs](https://react.dev/learn)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/installation)
- [Inertia.js Documentation](https://inertiajs.com/the-protocol)

### Dépannage courant

#### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré : `sudo service postgresql status`
- Vérifiez les credentials dans `.env`

#### Erreur Inertia "Page component not found"
- Vérifiez que le composant existe dans `frontend/js/pages/`
- Le nom doit correspondre exactement (sensible à la casse)

#### Assets non chargés en développement
- Assurez-vous que `npm run dev` est en cours d'exécution
- Vérifiez la configuration Vite dans `vite.config.js`

#### Composant Shadcn UI non trouvé
- Réinstallez le composant : `npx shadcn@latest add nom-composant`
- Vérifiez le chemin d'import dans `components.json`

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Standards de code

- **Python** : Suivre PEP 8
- **TypeScript** : Utiliser ESLint (config fournie)
- **Commits** : Messages clairs et descriptifs en français ou anglais

## 👥 Équipe

Développé avec ❤️ par l'équipe Immob.

---

**Questions ?** Ouvrez une issue sur GitHub ou contactez l'équipe de développement.

🚀 Bon développement !