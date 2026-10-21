# 🤝 Communauté SheTech

## Vue d'ensemble

La section **Communauté** est le cœur de l'engagement sur SheTech. Elle permet aux apprenantes de se connecter, s'entraider, découvrir des profils et participer à un forum vivant.

## 📋 Fonctionnalités

### 1. **Forum de Discussion**
- **Créer une question** : Les utilisateurs peuvent poser des questions avec un titre, une description et une catégorie
- **Répondre** : D'autres utilisateurs peuvent répondre aux questions
- **Marquer comme résolu** : L'auteur peut marquer une réponse comme solution
- **Votes/Likes** : Système de votes pour les questions et réponses utiles
- **Filtres et recherche** : Chercher par mot-clé et filtrer par catégorie

#### Catégories disponibles :
- Développement Web
- Intelligence Artificielle
- Marketing Digital
- E-commerce
- Leadership
- Freelance
- Design UI/UX
- Cybersécurité

### 2. **Découverte de Profils**
- **Voir les profils** des autres utilisateurs
- **Bio personnalisée** : Chaque utilisateur peut rédiger sa bio
- **Niveau** : Affiche le niveau de compétence (Débutante, Intermédiaire, Avancée)
- **Compteurs** : Posts publiés et nombre de suiveurs
- **Système de suivi** : Suivre les utilisateurs qui t'intéressent

### 3. **Top Contributeurs**
- **Classement** : Les utilisateurs les plus actifs
- **Stats** : Nombre de contributions
- **Suivi rapide** : Suivre directement depuis le classement

## 🗄️ Structure de Base de Données

### Tables créées

#### `community_posts`
```
id, user_id, title, content, category, is_solved, views, created_at, updated_at
```

#### `community_responses`
```
id, post_id, user_id, content, is_solution, created_at, updated_at
```

#### `community_votes`
```
id, user_id, target_type (post|response), target_id, vote_type, created_at
```

#### `user_follows`
```
id, follower_id, following_id, created_at
```

#### `user_achievements`
```
id, user_id, badge_name, description, earned_at
```

#### Nouvelles colonnes dans `users`
```
bio, avatar, formation_principale, niveau, created_at
```

## 🔌 API Endpoints

### Posts (Questions)

#### `GET /community/posts`
Récupère les questions du forum
- **Query params** :
  - `search` : Chercher par mot-clé
  - `category` : Filtrer par catégorie

**Réponse** :
```json
[
  {
    "id": 1,
    "title": "Comment apprendre React ?",
    "content": "Je débute en React...",
    "category": "Développement Web",
    "author_name": "Marie",
    "is_solved": false,
    "views": 45,
    "votes": 12,
    "response_count": 3,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

#### `POST /community/posts` ⚠️ Authentifié
Créer une question
```json
{
  "title": "Comment apprendre React ?",
  "content": "Je débute en React et...",
  "category": "Développement Web"
}
```

### Réponses

#### `GET /community/posts/:postId/responses`
Récupère les réponses d'une question

#### `POST /community/responses` ⚠️ Authentifié
Ajouter une réponse
```json
{
  "post_id": 1,
  "content": "Regarde ces ressources..."
}
```

#### `PUT /community/responses/:id/solution` ⚠️ Authentifié
Marquer une réponse comme solution
```json
{
  "is_solution": true
}
```

### Votes

#### `POST /community/votes` ⚠️ Authentifié
Voter/liker une question ou réponse
```json
{
  "target_id": 1,
  "target_type": "post"
}
```

### Profils Utilisateurs

#### `GET /community/users`
Lister tous les profils (avec stats)

#### `GET /community/users/:userId`
Récupérer un profil spécifique

#### `PUT /community/users/profile` ⚠️ Authentifié
Mettre à jour son profil
```json
{
  "bio": "Je suis passionnée par le développement web",
  "niveau": "Intermédiaire",
  "formation_principale": "Développement Web"
}
```

### Suivi (Follow)

#### `POST /community/follow` ⚠️ Authentifié
Suivre un utilisateur
```json
{
  "following_id": 5
}
```

#### `DELETE /community/follow/:followingId` ⚠️ Authentifié
Ne plus suivre un utilisateur

## 🎨 UI/UX

### Onglets principaux
1. **Forum** - Voir/créer/répondre aux questions
2. **Profils** - Découvrir d'autres utilisateurs
3. **Top Contributeurs** - Voir le classement

### Codes couleurs
- **Accent** : `#C45C7A` (Rose)
- **Solution marquée** : Vert (`#66bb6a`)
- **Background** : Gris clair (`#f9f8f7`)

##  Utilisation

### Pour les utilisateurs

1. **Participer au forum**
   ```
   Tableau de bord → Communauté → Forum
   ```

2. **Créer une question**
   - Cliquer sur "➕ Nouvelle question"
   - Remplir titre, description et catégorie
   - Cliquer "Publier la question"

3. **Répondre à une question**
   - Cliquer "Voir réponses"
   - Écrire ta réponse
   - Cliquer "Répondre"

4. **Découvrir des profils**
   ```
   Tableau de bord → Communauté → Profils
   ```

5. **Suivre un utilisateur**
   - Cliquer "+ Suivre" sur le profil

## 🔒 Sécurité

- ✅ Authentification JWT requise pour créer/répondre
- ✅ Utilisateurs ne peuvent modifier que leurs propres posts
- ✅ Validation des données
- ✅ Protection contre les injections SQL (requêtes préparées)

## 🎯 Prochaines étapes (optionnel)

- [ ] Système de badges/achievements
- [ ] Notifications en temps réel
- [ ] Système de points/karma
- [ ] Modération avancée
- [ ] Recherche avancée avec filtres
- [ ] Tri par popularité/récent
- [ ] Avatars utilisateurs
- [ ] Messages privés

## Notes d'implémentation

- Les migrations SQL sont dans `migrations/create_community_tables.sql`
- Les endpoints API sont dans `server.js` (lignes 690-850 approx)
- Le composant React est dans `shetechfront/src/Community.jsx`
- Intégration dans le Dashboard via `Dashboard.jsx`

---

**Version** : 1.0  
**Date** : Mai 2026  
**Statut** : ✅ Production Ready
