export const CATEGORIES = [
  {
    id: "musique",
    name: "Musique",
    icon: "Music",
    description: "Les meilleurs artistes, voix, styles urbains, traditionnels et révélations musicales de l'Afrique et de la diaspora.",
    prizesCount: 24,
    prizes: [
      "Artiste masculin de l'année",
      "Artiste féminin de l'année",
      "Artiste masculin Diaspora",
      "Artiste féminin Diaspora",
      "Tube des vacances",
      "Meilleur clip vidéo de l'année",
      "Meilleur groupe musical",
      "Meilleure collaboration musicale",
      "Artiste Gospel",
      "Artiste tradi-moderne",
      "Artiste variété urbaine",
      "Étoile montante variété urbaine",
      "Tube de l'année",
      "Artiste Rap de l'année",
      "Étoile montante Rap de l'année",
      "Artiste Drill de l'année",
      "Étoile montante Drill de l'année",
      "Artiste Slam masculin",
      "Artiste Slam féminin",
      "Feat Urbain",
      "Artiste Afrique de l'Ouest",
      "Artiste Amapiano",
      "Album de l'année",
      "Artiste Lover"
    ]
  },
  {
    id: "danse",
    name: "Danse et performance",
    icon: "Sparkles",
    description: "Les danseurs, chorégraphes, DJs et performeurs scéniques qui enflamment les scènes et le public.",
    prizesCount: 7,
    prizes: [
      "DJ Platine de l'année",
      "Meilleur animateur événementiel",
      "Chorégraphe",
      "Groupe de danse féminin",
      "Groupe de danse masculin",
      "Meilleur acteur ou actrice",
      "Meilleur web humoriste"
    ]
  },
  {
    id: "arts",
    name: "Arts et créativité",
    icon: "Palette",
    description: "Peintres, photographes, réalisateurs, stylistes et créateurs visuels qui façonnent l'esthétique contemporaine.",
    prizesCount: 10,
    prizes: [
      "Meilleur artiste peintre",
      "Meilleur photographe",
      "Meilleur réalisateur de clips",
      "Styliste ou créateur de mode",
      "Meilleur mannequin",
      "Créateur de contenu digital",
      "Meilleur réalisateur de films",
      "Architecte de l'année",
      "Dessinateur",
      "Maison d'esthétique"
    ]
  },
  {
    id: "industrie",
    name: "Industrie musicale",
    icon: "Briefcase",
    description: "Les bâtisseurs de l'ombre, producteurs, managers, beatmakers et lieux culturels incontournables.",
    prizesCount: 8,
    prizes: [
      "Label / Maison de production de l'année",
      "Meilleur beatmaker",
      "Meilleur manager d'artiste",
      "Promoteur / booker de l'année",
      "Promoteur / booker Diaspora",
      "Meilleur média culturel",
      "Présentateur Radio/TV",
      "Bar, Club, Maquis"
    ]
  },
  {
    id: "speciaux",
    name: "Prix spéciaux",
    icon: "Trophy",
    description: "Les distinctions suprêmes décernées aux figures emblématiques et coups de cœur du festival.",
    prizesCount: 3,
    prizes: [
      "Révélation de l'année",
      "PRIMART d'Or, Grand Prix",
      "Femme des Arts"
    ]
  }
];

export const ALL_PRIZES = CATEGORIES.flatMap(cat => 
  cat.prizes.map(prize => ({
    name: prize,
    category: cat.name,
    categoryId: cat.id
  }))
);
