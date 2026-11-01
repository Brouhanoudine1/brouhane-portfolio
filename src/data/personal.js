export const personal = {
  name: 'Brouhanoudine OMOROU',
  shortName: 'Brouhanoudine',
  title: 'Étudiant en génie logiciel · 3e année',
  location: 'Lomé, Togo',
  bio: "Étudiant en 3e année de génie logiciel à Lomé, je construis des applications web modernes avec React et Laravel. J'aime transformer une idée en produit clair et agréable à utiliser, en soignant autant le code que l'expérience utilisateur.",
  availability: 'Disponible pour un stage',
  email: 'contact.brouhanoudine@gmail.com',
  github: 'https://github.com/Brouhanoudine1',
  linkedin: 'https://www.linkedin.com/in/brouhanoudine-omorou',
  cvUrl: '/dev-brouhane_cv.pdf',
  contactEndpoint: import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact',
  roles: ['Développeur Front-end', 'Développeur Full-Stack', 'Étudiant ingénieur'],
  stats: [
    { value: 3, suffix: '+', label: 'Projets réalisés' },
    { value: 9, suffix: '', label: 'Technologies explorées' },
    { value: 3, suffix: '', label: "Années d'études" },
  ],
}
