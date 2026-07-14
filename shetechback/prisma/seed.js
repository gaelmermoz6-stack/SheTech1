import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed SheTech...');

  // ─── UTILISATEURS ────────────────────────────────────────────────────────────
  const hash = (p) => bcrypt.hash(p, 10);

  const [mentor1, mentor2] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'amina.diallo@shetech.com' },
      update: {},
      create: {
        nom: 'Amina Diallo', email: 'amina.diallo@shetech.com',
        motDePasse: await hash('Mentor123!'), role: 'mentor', niveau: 'experte',
        bio: 'Ingénieure logicielle avec 8 ans d\'expérience en développement web et mobile. Passionnée par l\'enseignement et l\'autonomisation des femmes dans le numérique.',
      },
    }),
    prisma.user.upsert({
      where: { email: 'fatou.ndiaye@shetech.com' },
      update: {},
      create: {
        nom: 'Fatou Ndiaye', email: 'fatou.ndiaye@shetech.com',
        motDePasse: await hash('Mentor123!'), role: 'mentor', niveau: 'experte',
        bio: 'Data Scientist spécialisée en IA et machine learning. 6 ans d\'expérience dans des startups tech africaines.',
      },
    }),
  ]);

  const [app1, app2, app3, app4] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'marie.konan@shetech.com' },
      update: {},
      create: { nom: 'Marie Konan', email: 'marie.konan@shetech.com', motDePasse: await hash('App123!'), role: 'apprenante', niveau: 'débutante', bio: 'Étudiante en informatique à Abidjan, passionnée par le développement web.' },
    }),
    prisma.user.upsert({
      where: { email: 'aissatou.barry@shetech.com' },
      update: {},
      create: { nom: 'Aissatou Barry', email: 'aissatou.barry@shetech.com', motDePasse: await hash('App123!'), role: 'apprenante', niveau: 'intermédiaire', bio: 'Développeuse junior à Conakry, en quête de nouvelles compétences en data science.' },
    }),
    prisma.user.upsert({
      where: { email: 'kadiatou.camara@shetech.com' },
      update: {},
      create: { nom: 'Kadiatou Camara', email: 'kadiatou.camara@shetech.com', motDePasse: await hash('App123!'), role: 'apprenante', niveau: 'débutante', bio: 'Lycéenne au Sénégal, première passion : créer des applications mobiles.' },
    }),
    prisma.user.upsert({
      where: { email: 'rokia.traore@shetech.com' },
      update: {},
      create: { nom: 'Rokia Traoré', email: 'rokia.traore@shetech.com', motDePasse: await hash('App123!'), role: 'apprenante', niveau: 'intermédiaire', bio: 'Designer UX à Bamako, je veux approfondir mes compétences techniques.' },
    }),
  ]);

  console.log('✅ Utilisateurs créés');

  // ─── FORMATIONS ──────────────────────────────────────────────────────────────
  const [fWeb, fData, fIA, fDesign, fCyber] = await Promise.all([
    prisma.formation.create({ data: { titre: 'Développement Web : HTML, CSS & JavaScript', description: 'Maîtrisez les fondamentaux du web moderne. De la structure HTML aux interactions JavaScript, construisez vos premières pages web professionnelles et responsives.', niveau: 'débutante', domaine: 'developpement_web', prix: 0 } }),
    prisma.formation.create({ data: { titre: 'Python pour la Data Science', description: 'Apprenez Python et les bibliothèques essentielles (NumPy, Pandas, Matplotlib) pour analyser des données réelles. Transformez des données brutes en insights précieux.', niveau: 'intermédiaire', domaine: 'data_science', prix: 0 } }),
    prisma.formation.create({ data: { titre: 'Introduction à l\'Intelligence Artificielle', description: 'Découvrez les concepts clés de l\'IA : machine learning, réseaux de neurones et traitement du langage. Aucun prérequis mathématique avancé nécessaire.', niveau: 'débutante', domaine: 'intelligence_artificielle', prix: 0 } }),
    prisma.formation.create({ data: { titre: 'Design UI/UX avec Figma', description: 'Créez des interfaces utilisateur élégantes et intuitives. Maîtrisez Figma pour prototyper, tester et livrer des designs qui captivent les utilisateurs.', niveau: 'débutante', domaine: 'design', prix: 0 } }),
    prisma.formation.create({ data: { titre: 'Cybersécurité : Les fondamentaux', description: 'Comprenez les menaces numériques et apprenez à protéger vos systèmes. Du chiffrement aux bonnes pratiques de sécurité, devenez actrice de la cybersécurité en Afrique.', niveau: 'débutante', domaine: 'cybersecurite', prix: 0 } }),
  ]);

  console.log('✅ Formations créées');

  // ─── MODULES + LEÇONS + VIDÉOS (Formation Web) ───────────────────────────────
  const modWeb1 = await prisma.module.create({ data: { formationId: fWeb.id, titre: 'Les bases du HTML', duree: 120 } });
  const modWeb2 = await prisma.module.create({ data: { formationId: fWeb.id, titre: 'CSS et mise en page', duree: 150 } });
  const modWeb3 = await prisma.module.create({ data: { formationId: fWeb.id, titre: 'JavaScript interactif', duree: 180 } });

  const [l1, l2, l3] = await Promise.all([
    prisma.lecon.create({ data: { moduleId: modWeb1.id, titre: 'Structure d\'une page HTML', type: 'texte', contenuTexte: 'HTML (HyperText Markup Language) est le langage de base du web. Il structure le contenu d\'une page en utilisant des balises (tags). Une page HTML commence toujours par <!DOCTYPE html>, suivi de <html>, <head> et <body>. La balise <head> contient les métadonnées comme le titre de la page et les liens vers les styles CSS. La balise <body> contient tout le contenu visible.', duree: 30 } }),
    prisma.lecon.create({ data: { moduleId: modWeb1.id, titre: 'Les balises essentielles', type: 'texte', contenuTexte: 'Les balises HTML les plus utilisées : <h1> à <h6> pour les titres, <p> pour les paragraphes, <a href="..."> pour les liens, <img src="..." alt="..."> pour les images, <ul>/<ol>/<li> pour les listes, <div> pour les conteneurs, <span> pour le texte inline. Chaque balise a une sémantique précise qui aide les moteurs de recherche et les lecteurs d\'écran.', duree: 40 } }),
    prisma.lecon.create({ data: { moduleId: modWeb1.id, titre: 'Formulaires HTML', type: 'video', videoUrl: 'https://www.youtube.com/embed/example1', contenuTexte: 'Les formulaires permettent de collecter des données utilisateur. Les éléments clés : <form>, <input> (text, email, password, checkbox, radio), <select>, <textarea>, <button>. L\'attribut action définit où envoyer les données, method peut être GET ou POST.', duree: 45 } }),
  ]);

  await Promise.all([
    prisma.video.create({ data: { leconId: l3.id, titre: 'Créer votre premier formulaire', url: 'https://www.youtube.com/embed/example1', description: 'Tutoriel pas à pas pour créer un formulaire d\'inscription complet', duree: '12:30' } }),
    prisma.lecon.create({ data: { moduleId: modWeb2.id, titre: 'Sélecteurs CSS et propriétés', type: 'texte', contenuTexte: 'CSS (Cascading Style Sheets) contrôle l\'apparence des éléments HTML. Les sélecteurs ciblent des éléments : .classe, #id, balise, balise:hover. Les propriétés principales : color, background-color, font-size, margin, padding, border, width, height, display, position. La cascade détermine quelle règle s\'applique quand plusieurs règles ciblent le même élément.', duree: 35 } }),
    prisma.lecon.create({ data: { moduleId: modWeb2.id, titre: 'Flexbox et Grid', type: 'texte', contenuTexte: 'Flexbox et Grid sont les deux systèmes de mise en page modernes. Flexbox (display: flex) est idéal pour aligner des éléments en ligne ou colonne. Grid (display: grid) permet des mises en page bidimensionnelles complexes. flex-direction, justify-content, align-items sont les propriétés Flexbox essentielles. grid-template-columns et grid-template-rows définissent la structure Grid.', duree: 50 } }),
    prisma.lecon.create({ data: { moduleId: modWeb3.id, titre: 'Variables et types de données JS', type: 'texte', contenuTexte: 'JavaScript utilise let, const et var pour déclarer des variables. Les types de base : string, number, boolean, null, undefined, object. Les fonctions s\'écrivent avec function ou en arrow function (=>). Les tableaux (Array) et objets (Object) sont les structures de données fondamentales. ES6+ apporte des fonctionnalités modernes : destructuration, spread operator, template literals.', duree: 60 } }),
    prisma.lecon.create({ data: { moduleId: modWeb3.id, titre: 'Manipulation du DOM', type: 'video', videoUrl: 'https://www.youtube.com/embed/example2', contenuTexte: 'Le DOM (Document Object Model) représente la page HTML comme un arbre d\'objets JavaScript. document.querySelector() et getElementById() sélectionnent des éléments. innerHTML, textContent modifient le contenu. addEventListener() capture les interactions utilisateur. classList.add/remove/toggle gèrent les classes CSS dynamiquement.', duree: 55 } }),
  ]);

  // ─── MODULES + LEÇONS (Formation Data Science) ───────────────────────────────
  const modData1 = await prisma.module.create({ data: { formationId: fData.id, titre: 'Python : les bases', duree: 180 } });
  const modData2 = await prisma.module.create({ data: { formationId: fData.id, titre: 'Analyse avec Pandas', duree: 200 } });

  await Promise.all([
    prisma.lecon.create({ data: { moduleId: modData1.id, titre: 'Installation et environnement Python', type: 'texte', contenuTexte: 'Python est un langage de programmation polyvalent, idéal pour la data science. Installez Python via Anaconda pour avoir directement NumPy, Pandas et Jupyter Notebook. Jupyter Notebook est un environnement interactif où vous pouvez écrire du code Python, visualiser des résultats et documenter votre analyse. pip est le gestionnaire de paquets Python.', duree: 30 } }),
    prisma.lecon.create({ data: { moduleId: modData1.id, titre: 'Listes, dictionnaires et boucles', type: 'texte', contenuTexte: 'Les listes Python [1, 2, 3] sont des séquences ordonnées modifiables. Les dictionnaires {"clé": valeur} stockent des paires clé-valeur. Les boucles for et while itèrent sur des séquences. Les list comprehensions [x*2 for x in liste] offrent une syntaxe élégante pour transformer des listes. Les fonctions def ma_fonction(param): encapsulent du code réutilisable.', duree: 45 } }),
    prisma.lecon.create({ data: { moduleId: modData2.id, titre: 'Introduction à Pandas', type: 'texte', contenuTexte: 'Pandas est la bibliothèque Python de référence pour la manipulation de données. Le DataFrame est une table de données bidimensionnelle avec des colonnes nommées. pd.read_csv() charge des fichiers CSV. df.head(), df.info(), df.describe() explorent rapidement un dataset. df.dropna() supprime les valeurs manquantes. df.groupby() agrège les données par catégorie.', duree: 60 } }),
    prisma.lecon.create({ data: { moduleId: modData2.id, titre: 'Visualisation avec Matplotlib', type: 'video', videoUrl: 'https://www.youtube.com/embed/example3', contenuTexte: 'Matplotlib crée des graphiques en Python. plt.plot() pour les courbes, plt.bar() pour les histogrammes, plt.scatter() pour les nuages de points. plt.xlabel(), plt.ylabel(), plt.title() ajoutent des labels. plt.show() affiche le graphique. Seaborn, construit sur Matplotlib, offre des visualisations statistiques plus esthétiques avec moins de code.', duree: 50 } }),
  ]);

  // ─── MODULES + LEÇONS (Formation IA) ─────────────────────────────────────────
  const modIA1 = await prisma.module.create({ data: { formationId: fIA.id, titre: 'Concepts fondamentaux de l\'IA', duree: 120 } });
  const modIA2 = await prisma.module.create({ data: { formationId: fIA.id, titre: 'Machine Learning en pratique', duree: 160 } });

  await Promise.all([
    prisma.lecon.create({ data: { moduleId: modIA1.id, titre: 'Qu\'est-ce que l\'Intelligence Artificielle ?', type: 'texte', contenuTexte: 'L\'Intelligence Artificielle (IA) est la simulation de l\'intelligence humaine par des machines. Elle englobe le machine learning (apprentissage automatique), le deep learning (apprentissage profond) et le traitement du langage naturel. L\'IA étroite (ANI) excelle dans une tâche spécifique. L\'IA générale (AGI) reste théorique. Des exemples concrets : recommandations Netflix, reconnaissance vocale, diagnostic médical par image.', duree: 35 } }),
    prisma.lecon.create({ data: { moduleId: modIA1.id, titre: 'Types d\'apprentissage automatique', type: 'texte', contenuTexte: 'Il existe trois grands types d\'apprentissage : Supervisé (avec étiquettes) : classification (spam/pas spam), régression (prédire un prix). Non supervisé (sans étiquettes) : clustering (regrouper des clients similaires), réduction de dimensionnalité. Par renforcement : l\'agent apprend par essai-erreur pour maximiser une récompense (jeux, robotique). Le choix dépend des données disponibles et du problème à résoudre.', duree: 40 } }),
    prisma.lecon.create({ data: { moduleId: modIA2.id, titre: 'Introduction à scikit-learn', type: 'texte', contenuTexte: 'Scikit-learn est la bibliothèque Python de machine learning. Flux de travail standard : charger les données → préparer les features → diviser en train/test → entraîner le modèle → évaluer. Exemple : from sklearn.linear_model import LogisticRegression; model = LogisticRegression(); model.fit(X_train, y_train); score = model.score(X_test, y_test). Les métriques : accuracy, precision, recall, F1-score.', duree: 55 } }),
  ]);

  // ─── MODULE QUIZ ─────────────────────────────────────────────────────────────
  await prisma.moduleQuiz.createMany({
    data: [
      { moduleId: modWeb1.id, question: 'Quelle balise HTML est utilisée pour créer un lien hypertexte ?', optionA: '<link>', optionB: '<a>', optionC: '<href>', optionD: '<url>', reponseCorrecte: 'b', explication: 'La balise <a href="url"> crée un lien hypertexte. L\'attribut href spécifie la destination du lien.', ordre: 1 },
      { moduleId: modWeb1.id, question: 'Quelle balise définit le contenu principal visible d\'une page HTML ?', optionA: '<head>', optionB: '<meta>', optionC: '<body>', optionD: '<html>', reponseCorrecte: 'c', explication: '<body> contient tout le contenu visible de la page. <head> contient les métadonnées.', ordre: 2 },
      { moduleId: modWeb1.id, question: 'Comment afficher une image en HTML ?', optionA: '<image src="photo.jpg">', optionB: '<img href="photo.jpg">', optionC: '<picture src="photo.jpg">', optionD: '<img src="photo.jpg" alt="description">', reponseCorrecte: 'd', explication: '<img src="..." alt="..."> est la balise correcte. L\'attribut alt est important pour l\'accessibilité.', ordre: 3 },
      { moduleId: modWeb2.id, question: 'Quelle propriété CSS rend un élément flexible (flexbox) ?', optionA: 'display: block', optionB: 'display: flex', optionC: 'position: flex', optionD: 'layout: flex', reponseCorrecte: 'b', explication: 'display: flex active le modèle de boîte flexible (Flexbox) sur un conteneur.', ordre: 1 },
      { moduleId: modWeb2.id, question: 'Comment centrer horizontalement des éléments enfants avec Flexbox ?', optionA: 'align-items: center', optionB: 'text-align: center', optionC: 'justify-content: center', optionD: 'margin: auto', reponseCorrecte: 'c', explication: 'justify-content: center centre les éléments enfants sur l\'axe principal (horizontal par défaut).', ordre: 2 },
      { moduleId: modData1.id, question: 'Quelle syntaxe Python crée une liste ?', optionA: '(1, 2, 3)', optionB: '{1, 2, 3}', optionC: '[1, 2, 3]', optionD: '<1, 2, 3>', reponseCorrecte: 'c', explication: 'Les listes Python utilisent les crochets []. Les parenthèses () créent des tuples, les accolades {} créent des ensembles ou dictionnaires.', ordre: 1 },
      { moduleId: modData1.id, question: 'Quel mot-clé Python permet de rendre une variable accessible dans toute une fonction depuis l\'extérieur ?', optionA: 'global', optionB: 'var', optionC: 'public', optionD: 'extern', reponseCorrecte: 'a', explication: 'Le mot-clé global permet de modifier une variable globale depuis l\'intérieur d\'une fonction. Sans lui, l\'assignation créerait une nouvelle variable locale.', ordre: 2 },
      { moduleId: modIA1.id, question: 'Quel type d\'apprentissage utilise des données étiquetées ?', optionA: 'Non supervisé', optionB: 'Par renforcement', optionC: 'Supervisé', optionD: 'Génératif', reponseCorrecte: 'c', explication: 'L\'apprentissage supervisé utilise des données avec des étiquettes (labels) pour apprendre à prédire des sorties.', ordre: 1 },
      { moduleId: modIA1.id, question: 'Quelle application est un exemple d\'IA dans la vie quotidienne ?', optionA: 'Une calculatrice de base', optionB: 'Un éditeur de texte', optionC: 'La reconnaissance vocale de Siri', optionD: 'Un tableur Excel', reponseCorrecte: 'c', explication: 'La reconnaissance vocale (Siri, Google Assistant) utilise du deep learning pour comprendre le langage humain.', ordre: 2 },
    ],
  });

  console.log('✅ Modules, leçons et quiz créés');

  // ─── PROJETS BRIEFS ──────────────────────────────────────────────────────────
  const [brief1, brief2, brief3] = await Promise.all([
    prisma.projetBrief.create({ data: { formationId: fWeb.id, titre: 'Portfolio personnel', description: 'Créez votre portfolio personnel en HTML, CSS et JavaScript pour présenter vos projets et compétences.', consignes: '1. Page d\'accueil avec votre présentation\n2. Section "À propos"\n3. Galerie de projets\n4. Formulaire de contact fonctionnel\n5. Design responsive (mobile-first)', livrables: 'Lien GitHub du projet + URL de démonstration en ligne' } }),
    prisma.projetBrief.create({ data: { formationId: fData.id, titre: 'Analyse du marché tech africain', description: 'Analysez un dataset réel sur l\'adoption du numérique en Afrique et créez des visualisations pertinentes.', consignes: '1. Chargez et nettoyez le dataset avec Pandas\n2. Identifiez 3 insights clés\n3. Créez au moins 5 visualisations avec Matplotlib/Seaborn\n4. Rédigez un rapport d\'analyse', livrables: 'Jupyter Notebook + rapport PDF' } }),
    prisma.projetBrief.create({ data: { formationId: fIA.id, titre: 'Classificateur de plantes médicinales', description: 'Entraînez un modèle de machine learning pour classifier des images de plantes médicinales africaines.', consignes: '1. Collectez ou utilisez un dataset fourni\n2. Prétraitez les images\n3. Entraînez au moins 2 modèles différents\n4. Comparez les performances', livrables: 'Code Python + rapport de résultats + présentation' } }),
  ]);

  console.log('✅ Projets briefs créés');

  // ─── PROGRESSIONS ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.progression.create({ data: { userId: app1.id, formationId: fWeb.id, pourcentage: 65 } }),
    prisma.progression.create({ data: { userId: app2.id, formationId: fData.id, pourcentage: 40 } }),
    prisma.progression.create({ data: { userId: app2.id, formationId: fWeb.id, pourcentage: 100 } }),
    prisma.progression.create({ data: { userId: app3.id, formationId: fWeb.id, pourcentage: 20 } }),
    prisma.progression.create({ data: { userId: app4.id, formationId: fDesign.id, pourcentage: 80 } }),
  ]);

  // ─── SESSIONS MENTORAT ────────────────────────────────────────────────────────
  const now = new Date();
  await Promise.all([
    prisma.sessionMentorat.create({ data: { mentorId: mentor1.id, userId: app1.id, dateSession: new Date(now.getTime() + 2 * 86400000), type: 'individuel', statut: 'réservé', sujet: 'Aide pour créer un projet portfolio avec React', lienReunion: 'https://meet.google.com/abc-defg-hij' } }),
    prisma.sessionMentorat.create({ data: { mentorId: mentor2.id, userId: app2.id, dateSession: new Date(now.getTime() + 5 * 86400000), type: 'individuel', statut: 'réservé', sujet: 'Optimisation du modèle de classification' } }),
    prisma.sessionMentorat.create({ data: { mentorId: mentor1.id, userId: app3.id, dateSession: new Date(now.getTime() - 7 * 86400000), type: 'groupe', statut: 'terminé', sujet: 'Introduction au développement web', notes: 'Session très productive. Kadiatou a bien compris les bases du HTML et CSS.' } }),
  ]);

  console.log('✅ Sessions de mentorat créées');

  // ─── COMMUNITY POSTS ──────────────────────────────────────────────────────────
  const [post1, post2, post3, post4] = await Promise.all([
    prisma.communityPost.create({ data: { userId: app1.id, titre: 'Comment bien débuter en développement web en Afrique ?', contenu: 'Bonjour à toutes ! Je cherche des conseils pour bien démarrer le développement web avec peu de ressources. Quels sont vos meilleurs conseils pour apprendre efficacement ? Quels projets avez-vous réalisés pour votre portfolio ? Merci d\'avance pour vos retours !', tags: 'developpement_web,debutante,conseil' } }),
    prisma.communityPost.create({ data: { userId: app2.id, titre: 'Ressources gratuites pour apprendre Python', contenu: 'Je partage une liste de ressources gratuites que j\'ai trouvées pour apprendre Python : 1) FreeCodeCamp (cours Python), 2) Kaggle Learn (notebooks interactifs), 3) CS50 Python de Harvard (gratuit en ligne). N\'hésitez pas à ajouter vos propres découvertes !', tags: 'python,data_science,ressources', estResolu: true } }),
    prisma.communityPost.create({ data: { userId: app3.id, titre: 'Erreur dans mon code JavaScript - forEach ne fonctionne pas', contenu: 'J\'ai un problème avec forEach sur un tableau. Mon code : const fruits = ["mangue", "papaye"]; fruits.forEach(fruit => { console.log(fruit) }); L\'erreur dit "fruits is not iterable". Quelqu\'un peut m\'aider ? Je débute en JS...', tags: 'javascript,bug,debutante' } }),
    prisma.communityPost.create({ data: { userId: app4.id, titre: 'Figma vs Adobe XD : lequel choisir pour débuter le design ?', contenu: 'Je veux me lancer dans le design UI/UX. J\'hésite entre Figma et Adobe XD. Figma semble être plus populaire mais Adobe XD est intégré dans la suite Adobe. Quel outil recommandez-vous pour une débutante ? Et pourquoi ?', tags: 'design,figma,adobe,ux' } }),
  ]);

  // Réponses aux posts
  await Promise.all([
    prisma.communityResponse.create({ data: { postId: post1.id, userId: mentor1.id, contenu: 'Excellente question ! Mon conseil numéro 1 : commencez par des projets concrets qui vous tiennent à cœur. Créez un site pour votre association locale, une boutique en ligne pour votre famille... La motivation est clé. FreeCodeCamp et MDN Web Docs sont vos meilleurs amis pour les ressources gratuites.', estSolution: true } }),
    prisma.communityResponse.create({ data: { postId: post1.id, userId: app2.id, contenu: 'Je confirme ! J\'ai commencé avec FreeCodeCamp il y a 8 mois et aujourd\'hui j\'ai mon premier stage. La clé c\'est la régularité : 1h par jour minimum, même les weekends.' } }),
    prisma.communityResponse.create({ data: { postId: post2.id, userId: mentor2.id, contenu: 'Excellente liste ! J\'ajouterais : Real Python (realpython.com) pour des tutoriels avancés, et le cours "Python for Everybody" de l\'Université du Michigan sur Coursera (audit gratuit). Colab de Google est aussi parfait pour pratiquer sans rien installer.' } }),
    prisma.communityResponse.create({ data: { postId: post3.id, userId: mentor1.id, contenu: 'Le problème vient probablement de la façon dont tu as déclaré le tableau. Essaie : const fruits = ["mangue", "papaye"]; (vérifie les guillemets et les crochets). Si tu vois encore l\'erreur, partage le message d\'erreur complet et la ligne exacte qui échoue.', estSolution: true } }),
    prisma.communityResponse.create({ data: { postId: post4.id, userId: mentor1.id, contenu: 'Figma sans hésiter pour 2024 ! Raisons : 100% gratuit pour les projets personnels, collaboration en temps réel, fonctionne dans le navigateur (pas d\'installation), communauté immense avec des templates gratuits, et c\'est l\'outil standard de l\'industrie actuellement.', estSolution: true } }),
  ]);

  console.log('✅ Posts communauté créés');

  // ─── MARKETPLACE ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.marketplaceProduit.create({ data: { vendeurId: mentor1.id, titre: 'Pack de templates HTML/CSS pour portfolio', description: '10 templates de portfolio professionnels entièrement personnalisables. HTML/CSS purs, responsive, avec documentation complète. Parfait pour votre première présence en ligne.', prix: 5000, categorie: 'template', imageUrl: null, estActive: true } }),
    prisma.marketplaceProduit.create({ data: { vendeurId: mentor2.id, titre: 'Dataset : Startups tech africaines 2024', description: 'Dataset nettoyé avec 500+ startups tech africaines (pays, secteur, financement, année de création). Idéal pour vos projets de data science et analyses.', prix: 2500, categorie: 'dataset', imageUrl: null, estActive: true } }),
    prisma.marketplaceProduit.create({ data: { vendeurId: mentor1.id, titre: 'Session de code review (1h)', description: 'Je révise votre code (HTML/CSS/JS/React) et vous donne un feedback détaillé avec des suggestions d\'amélioration et les bonnes pratiques à adopter.', prix: 15000, categorie: 'service', imageUrl: null, estActive: true } }),
    prisma.marketplaceProduit.create({ data: { vendeurId: mentor2.id, titre: 'Guide : Préparer son CV tech pour le marché africain', description: 'Guide PDF de 45 pages avec exemples de CV, conseils de recruteurs africains, liste d\'entreprises tech qui recrutent et modèles LinkedIn optimisés.', prix: 3000, categorie: 'guide', imageUrl: null, estActive: true } }),
  ]);

  console.log('✅ Produits marketplace créés');

  // ─── FOLLOWS ─────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.userFollow.create({ data: { followerId: app1.id, followingId: mentor1.id } }),
    prisma.userFollow.create({ data: { followerId: app2.id, followingId: mentor2.id } }),
    prisma.userFollow.create({ data: { followerId: app3.id, followingId: mentor1.id } }),
    prisma.userFollow.create({ data: { followerId: app4.id, followingId: mentor1.id } }),
    prisma.userFollow.create({ data: { followerId: app1.id, followingId: app2.id } }),
  ]);

  console.log('✅ Follows créés');

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('📊 Résumé :');
  console.log('   - 2 mentors + 4 apprenantes');
  console.log('   - 5 formations (web, data, IA, design, cyber)');
  console.log('   - 7 modules avec leçons, vidéos et quiz');
  console.log('   - 3 projets briefs');
  console.log('   - 4 posts communauté avec réponses');
  console.log('   - 4 produits marketplace');
  console.log('   - 3 sessions mentorat');
  console.log('\n🔑 Comptes disponibles :');
  console.log('   Admin   : admin@shetech.com / Admin123!');
  console.log('   Mentor  : amina.diallo@shetech.com / Mentor123!');
  console.log('   Mentor  : fatou.ndiaye@shetech.com / Mentor123!');
  console.log('   App     : marie.konan@shetech.com / App123!');
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
