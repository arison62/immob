import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Linkedin,
  Shield,
  Database,
  Code2,
  Layout,
  Lock,
  Users,
  Building2,
  BarChart3,
  FileCheck,
  Menu,
  X,
} from "lucide-react";

import { Link } from "@inertiajs/react";
import { useAuth } from "@/store/app-store";

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const teamMembers = [
    {
      name: "MANGO NGONO Honorine Jessica",
      github: "Mebson60",
      linkedin: "",
    },
    {
      name: "FOTSO PONE Albert Le Grand",
      github: "arison62",
      linkedin: "https://www.linkedin.com/in/albert-fotso-74a763238/",
    },
    {
      name: "Doubla Senguel",
      github: "",
      linkedin: "https://www.linkedin.com/in/senguel-doubla-8b42582b5/",
    },
    {
      name: "TSAGUE Bryan",
      github: "Tsague-Bryan",
      linkedin: "",
    },
    {
      name: "MOHAMED Abdouraman",
      github: "",
      linkedin: "",
    },
  ];

  const technologies = [
    {
      name: "Django",
      icon: <Code2 className="w-5 h-5" />,
      description:
        "Framework web Python mature avec sécurité intégrée (protection XSS, CSRF, injection SQL)",
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    {
      name: "PostgreSQL",
      icon: <Database className="w-5 h-5" />,
      description:
        "Base de données relationnelle robuste pour la gestion de données complexes",
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
    {
      name: "React.js",
      icon: <Layout className="w-5 h-5" />,
      description:
        "Bibliothèque JavaScript pour des interfaces réactives et performantes",
      color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    },
    {
      name: "Inertia.js",
      icon: <Code2 className="w-5 h-5" />,
      description:
        "Bridge pour créer des SPA avec Django sans complexité API REST",
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    },
    {
      name: "Shadcn UI",
      icon: <Layout className="w-5 h-5" />,
      description:
        "Composants React réutilisables et accessibles pour un développement rapide",
      color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    },
    {
      name: "Tailwind CSS",
      icon: <Code2 className="w-5 h-5" />,
      description:
        "Framework CSS utility-first pour un design responsive et cohérent",
      color: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
    },
  ];

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Gestion centralisée",
      description:
        "Gérez l'ensemble de votre patrimoine immobilier depuis une plateforme unique",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Sécurité robuste",
      description:
        "Protection des données avec authentification forte et contrôle d'accès granulaire",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Tableaux de bord",
      description:
        "Visualisez vos indicateurs clés et optimisez votre gestion financière",
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Conformité RGPD",
      description:
        "Respect des réglementations sur la protection des données personnelles",
    },
  ];

  const scrollToSection = (id : string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">Immob.</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("about")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                À propos
              </button>
              <button
                onClick={() => scrollToSection("team")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Équipe
              </button>
              <button
                onClick={() => scrollToSection("technologies")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Technologies
              </button>
              <Separator orientation="vertical" className="h-6" />
              {!isAuthenticated && (
                <Button variant="ghost" size="sm">
                  <Link href="accounts/login/">Login</Link>
                </Button>
              )}

              <Button size="sm">
                <Link href="dashboard/">Dashboard</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <button
                onClick={() => scrollToSection("about")}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
              >
                À propos
              </button>
              <button
                onClick={() => scrollToSection("team")}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
              >
                Équipe
              </button>
              <button
                onClick={() => scrollToSection("technologies")}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
              >
                Technologies
              </button>
              <div className="px-4 pt-2 space-y-2">
                {!isAuthenticated && (
                  <Button variant="ghost" size="sm" className="w-full">
                    <Link href="accounts/login/">Login</Link>
                  </Button>
                )}

                <Button size="sm" className="w-full">
                  <Link href="dashboard/">Dashboard</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              Projet TPE - GLO 519
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Immob.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Plateforme de Gestion de Patrimoine Immobilier Meublé
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Button size="lg" onClick={() => scrollToSection("about")}>
                Découvrir le projet
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("team")}
              >
                Notre équipe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Context */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Contexte Académique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Institution
                  </h3>
                  <p className="text-sm">
                    École Nationale Supérieure Polytechnique de Maroua
                  </p>
                  <p className="text-sm">
                    Département d'Informatique et Télécommunication
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Formation
                  </h3>
                  <p className="text-sm">Spécialité : Génie Logiciel</p>
                  <p className="text-sm">Niveau : 5</p>
                  <p className="text-sm">Année scolaire : 2025/2026</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Cours
                </h3>
                <p className="text-sm">Sécurité et Génie Logiciel (GLO 519)</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">3 Crédits</Badge>
                  <Badge variant="outline">Cours/TD: 25h</Badge>
                  <Badge variant="outline">TP: 15h</Badge>
                  <Badge variant="outline">TPE: 5h</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Teacher Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Encadrement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">
                    Dr. BOUDJOU Hortense
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    IT Security / Enseignante-chercheur, Women Sciences and
                    Technologies, STE
                  </p>
                  <a
                    href="https://www.linkedin.com/in/dr-boudjou-hortense-3593ba299/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="mt-2">
                      <Linkedin className="w-4 h-4 mr-2" />
                      Profil LinkedIn
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              À propos du projet
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Une solution complète pour la gestion de patrimoine immobilier
              meublé
            </p>
          </div>

          {/* Problem & Solution */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <Shield className="w-5 h-5 text-destructive" />
                  </div>
                  Problématique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  Le marché de la location de biens meublés connaît une forte
                  expansion, mais les propriétaires font face à des défis
                  majeurs :
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Suivi complexe des contrats et paiements</li>
                  <li>Dispersion des informations</li>
                  <li>Risques d'erreurs et perte d'efficacité</li>
                  <li>Manque d'outils centralisés</li>
                  <li>Communication difficile avec les locataires</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  Notre Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  Immob. est une plateforme web centralisée et sécurisée offrant
                  :
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Gestion complète du parc immobilier</li>
                  <li>Automatisation des tâches répétitives</li>
                  <li>Tableaux de bord et indicateurs clés</li>
                  <li>Sécurité robuste des données</li>
                  <li>Interface intuitive et moderne</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6 space-y-2">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>Objectifs du Projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <h3 className="font-semibold text-sm">
                      Efficacité opérationnelle
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatisation des tâches répétitives et centralisation des
                    données
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <h3 className="font-semibold text-sm">
                      Sécurité et conformité
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Protection des données et respect du RGPD avec traçabilité
                    complète
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <h3 className="font-semibold text-sm">
                      Optimisation financière
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Indicateurs clés pour des décisions éclairées
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* RGPD Compliance */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Conformité RGPD</CardTitle>
                  <CardDescription>
                    Protection et sécurité des données personnelles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Immob. respecte strictement le Règlement Général sur la
                Protection des Données (RGPD) pour garantir la confidentialité
                et l'intégrité des informations.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Mesures de sécurité
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Chiffrement des données sensibles</li>
                    <li>Authentification forte et multi-facteurs</li>
                    <li>Contrôle d'accès basé sur les rôles (RBAC)</li>
                    <li>Audit et traçabilité complète</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    Droits des utilisateurs
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Droit d'accès aux données personnelles</li>
                    <li>Droit de rectification et de suppression</li>
                    <li>Droit à la portabilité des données</li>
                    <li>Consentement explicite pour le traitement</li>
                  </ul>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Architecture monoténante garantissant une isolation totale des
                  données pour chaque propriétaire.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="technologies" className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Stack Technologique
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Un choix équilibré de technologies modernes et éprouvées
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technologies.map((tech, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tech.color}`}>
                      {tech.icon}
                    </div>
                    {tech.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tech.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Justification du choix technologique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Notre stack a été soigneusement sélectionné pour éviter la
                complexité d'une architecture API REST complète, tout en
                garantissant performance et sécurité :
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>
                    <strong className="text-foreground">Django</strong> :
                    Maturité et sécurité intégrée (protection XSS, CSRF,
                    injection SQL)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>
                    <strong className="text-foreground">Inertia-Django</strong>{" "}
                    : Bridge pour intégrer React sans complexité API
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>
                    <strong className="text-foreground">
                      React + Shadcn UI
                    </strong>{" "}
                    : Composants réutilisables et développement rapide
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>
                    <strong className="text-foreground">PostgreSQL</strong> :
                    Robustesse pour les données relationnelles complexes
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Notre Équipe</h2>
            <p className="text-lg text-muted-foreground">
              Étudiants en Génie Logiciel - Niveau 5
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {member.github && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://github.com/${member.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-4 h-4 mr-1" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {member.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-4 h-4 mr-1" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-bold">Immob.</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 - Projet TPE GLO 519 - École Nationale Supérieure
              Polytechnique de Maroua
            </p>
            <div className="flex gap-2">
              {!isAuthenticated && (
                <Button variant="ghost" size="sm">
                  <Link href="accounts/login/">Login</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Link href="dashboard/">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
