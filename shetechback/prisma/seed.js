import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  console.log('Nettoyage de la base de données...');
  await prisma.progressionLecon.deleteMany();
  await prisma.coursQuizResultat.deleteMany();
  await prisma.formationQuizResultat.deleteMany();
  await prisma.coursQuizQuestion.deleteMany();
  await prisma.formationQuiz.deleteMany();
  await prisma.coursQuiz.deleteMany();
  await prisma.pieceJointe.deleteMany();
  await prisma.audio.deleteMany();
  await prisma.video.deleteMany();
  await prisma.lecon.deleteMany();
  await prisma.cours.deleteMany();
  await prisma.module.deleteMany();
  await prisma.progressionFormation.deleteMany();
  await prisma.certificat.deleteMany();
  await prisma.formation.deleteMany();
  await prisma.parcours.deleteMany();
  await prisma.user.deleteMany();

  console.log('Création de l\'admin...');
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.create({
    data: {
      nom: 'Admin SheTech',
      email: 'admin@shetech.com',
      motDePasse: adminPassword,
      role: 'admin',
    },
  });

  console.log('Création d\'une apprenante...');
  const userPassword = await bcrypt.hash('User123!', 10);
  const user = await prisma.user.create({
    data: {
      nom: 'Marie Diallo',
      email: 'marie@shetech.com',
      motDePasse: userPassword,
      role: 'apprenante',
      niveau: 'débutante',
    },
  });

  console.log('Création d\'un mentor...');
  const mentorPassword = await bcrypt.hash('Mentor123!', 10);
  const mentor = await prisma.user.create({
    data: {
      nom: 'Fatou Mentorat',
      email: 'mentor@shetech.com',
      motDePasse: mentorPassword,
      role: 'mentor',
    },
  });

  console.log('Création de parcours...');
  const parcours = await prisma.parcours.create({
    data: {
      titre: 'Développement Web',
      description: 'Apprendre les technologies modernes du web',
      ordre: 1,
    },
  });

  console.log('Création de formations...');
  const formation1 = await prisma.formation.create({
    data: {
      titre: 'Fondamentaux du Web',
      description: 'HTML, CSS et JavaScript essentiels pour débuter',
      niveau: 'débutant',
      prix: 0,
      domaine: 'Développement Web',
      ordre: 1,
      parcoursId: parcours.id,
    },
  });

  const formation2 = await prisma.formation.create({
    data: {
      titre: 'React Avancé',
      description: 'Maîtriser React et ses patterns avancés',
      niveau: 'intermédiaire',
      prix: 0,
      domaine: 'Développement Web',
      ordre: 2,
      parcoursId: parcours.id,
    },
  });

  console.log('Création de modules...');
  const module1 = await prisma.module.create({
    data: {
      formationId: formation1.id,
      numero: 1,
      titre: 'HTML & CSS Fondamentaux',
      description: 'Les bases du HTML et du CSS modernes',
      duree: 40,
      heuresParSemaine: 8,
      langages: ['HTML', 'CSS'],
      competences: ['Structurer une page web', 'Styliser avec CSS'],
      livrables: ['Pages HTML/CSS'],
      couleur: '#FF6B9D',
      icone: '🎨',
    },
  });

  const module2 = await prisma.module.create({
    data: {
      formationId: formation1.id,
      numero: 2,
      titre: 'JavaScript Essentiels',
      description: 'JavaScript pour l\'interactivité',
      duree: 60,
      heuresParSemaine: 10,
      langages: ['JavaScript'],
      competences: ['Programmer en JS', 'Manipuler le DOM'],
      livrables: ['Script JS interactif'],
      couleur: '#FFD93D',
      icone: '⚡',
    },
  });

  console.log('Création de cours...');
  const cours1 = await prisma.cours.create({
    data: {
      moduleId: module1.id,
      titre: 'Introduction au HTML',
      description: 'Les premières bases du HTML5',
      ordre: 1,
    },
  });

  const cours2 = await prisma.cours.create({
    data: {
      moduleId: module1.id,
      titre: 'Styliser avec CSS',
      description: 'Flexbox, Grid et animations CSS',
      ordre: 2,
    },
  });

  const cours3 = await prisma.cours.create({
    data: {
      moduleId: module2.id,
      titre: 'Variables et Types',
      description: 'Comprendre les variables JavaScript',
      ordre: 1,
    },
  });

  console.log('Création de leçons avec ressources...');
  const lecon1 = await prisma.lecon.create({
    data: {
      coursId: cours1.id,
      titre: 'Les balises HTML essentielles',
      description: 'Découvrir les balises HTML principales',
      type: 'théorie',
      ordre: 1,
      dureeMinutes: 15,
      contenuTexte: 'Les balises HTML structurent le contenu...',
    },
  });

  await prisma.video.create({
    data: {
      leconId: lecon1.id,
      titre: 'Tutoriel HTML basique',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      type: 'embed',
    },
  });

  await prisma.pieceJointe.create({
    data: {
      leconId: lecon1.id,
      nom: 'Guide des balises HTML',
      url: '/uploads/lecons/html-guide.pdf',
      type: 'pdf',
      taille: 1024000,
    },
  });

  const lecon2 = await prisma.lecon.create({
    data: {
      coursId: cours1.id,
      titre: 'Créer ma première page',
      description: 'Pratiquer avec HTML',
      type: 'pratique',
      ordre: 2,
      dureeMinutes: 30,
      contenuTexte: 'Créez une page web simple...',
    },
  });

  const lecon3 = await prisma.lecon.create({
    data: {
      coursId: cours2.id,
      titre: 'Flexbox en profondeur',
      description: 'Maîtriser Flexbox',
      type: 'théorie',
      ordre: 1,
      dureeMinutes: 20,
      contenuTexte: 'Flexbox permet de créer des layouts...',
    },
  });

  console.log('Création de quiz...');
  const quiz1 = await prisma.coursQuiz.create({
    data: {
      coursId: cours1.id,
      titre: 'Quiz HTML Basique',
      description: 'Testez vos connaissances en HTML',
    },
  });

  await prisma.coursQuizQuestion.create({
    data: {
      quizId: quiz1.id,
      question: 'Quel est le rôle de la balise <div>?',
      options: ['Créer une division', 'Créer une vidéo', 'Créer une liste', 'Créer un lien'],
      reponse: 0,
      ordre: 1,
    },
  });

  await prisma.coursQuizQuestion.create({
    data: {
      quizId: quiz1.id,
      question: 'Quelle balise est correcte pour un titre?',
      options: ['<title>', '<h1>', '<header>', '<heading>'],
      reponse: 1,
      ordre: 2,
    },
  });

  console.log('Enregistrement des progressions...');
  await prisma.progressionLecon.create({
    data: {
      userId: user.id,
      leconId: lecon1.id,
      completee: true,
      dateCompletee: new Date(),
      tempsPasseMinutes: 15,
    },
  });

  await prisma.progressionFormation.create({
    data: {
      userId: user.id,
      formationId: formation1.id,
      pourcentage: 33,
    },
  });

  console.log('✅ Seeding complété!');
  console.log(`
Admin: admin@shetech.com / Admin123!
User: marie@shetech.com / User123!
Mentor: mentor@shetech.com / Mentor123!
  `);
}

seed()
  .catch(e => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
