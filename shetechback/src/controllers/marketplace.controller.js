import prisma from '../lib/prisma.js';

export const getProduits = async (req, res) => {
  const { categorie } = req.query;
  try {
    const produits = await prisma.marketplaceProduit.findMany({
      where: categorie ? { categorie: { equals: categorie, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { vendeur: { select: { nom: true } } },
    });
    res.json(produits.map(p => ({ ...p, vendeur_nom: p.vendeur?.nom, created_at: p.createdAt })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getMesProduits = async (req, res) => {
  try {
    const produits = await prisma.marketplaceProduit.findMany({
      where: { vendeurId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(produits.map(p => ({ ...p, created_at: p.createdAt })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createProduit = async (req, res) => {
  const { titre, description, prix, categorie, image_url } = req.body;
  if (!titre || !description || prix === undefined || !categorie)
    return res.status(400).json({ message: 'Titre, description, prix et categorie sont obligatoires' });
  try {
    const p = await prisma.marketplaceProduit.create({
      data: { vendeurId: req.user.id, titre, description, prix: Number(prix), categorie, imageUrl: image_url || null },
    });
    res.status(201).json({ message: 'Produit créé', id: p.id });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateProduit = async (req, res) => {
  const { titre, description, prix, categorie, image_url } = req.body;
  try {
    const existing = await prisma.marketplaceProduit.findUnique({ where: { id: Number(req.params.id) }, select: { vendeurId: true } });
    if (!existing) return res.status(404).json({ message: 'Produit introuvable' });
    if (existing.vendeurId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Non autorisé' });
    await prisma.marketplaceProduit.update({
      where: { id: Number(req.params.id) },
      data: { titre, description, prix: Number(prix), categorie, imageUrl: image_url || null },
    });
    res.json({ message: 'Produit mis à jour' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Produit introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteProduit = async (req, res) => {
  try {
    const existing = await prisma.marketplaceProduit.findUnique({ where: { id: Number(req.params.id) }, select: { vendeurId: true } });
    if (!existing) return res.status(404).json({ message: 'Produit introuvable' });
    if (existing.vendeurId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Non autorisé' });
    await prisma.marketplaceProduit.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Produit introuvable' });
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getPanier = async (req, res) => {
  try {
    const items = await prisma.marketplacePanier.findMany({
      where: { acheteurId: req.user.id },
      include: { produit: { include: { vendeur: { select: { nom: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items.map(i => ({
      ...i, produit_titre: i.produit?.titre, produit_prix: i.produit?.prix,
      vendeur_nom: i.produit?.vendeur?.nom, created_at: i.createdAt,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const ajouterPanier = async (req, res) => {
  const { produit_id, quantite = 1 } = req.body;
  if (!produit_id) return res.status(400).json({ message: 'produit_id est obligatoire' });
  try {
    await prisma.marketplacePanier.upsert({
      where: { acheteurId_produitId: { acheteurId: req.user.id, produitId: Number(produit_id) } },
      update: { quantite: { increment: Number(quantite) } },
      create: { acheteurId: req.user.id, produitId: Number(produit_id), quantite: Number(quantite) },
    });
    res.json({ message: 'Produit ajouté au panier' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const modifierQuantitePanier = async (req, res) => {
  const { quantite } = req.body;
  if (!quantite || Number(quantite) < 1)
    return res.status(400).json({ message: 'Quantité invalide' });
  try {
    const item = await prisma.marketplacePanier.findFirst({ where: { id: Number(req.params.id), acheteurId: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Article introuvable dans le panier' });
    await prisma.marketplacePanier.update({ where: { id: Number(req.params.id) }, data: { quantite: Number(quantite) } });
    res.json({ message: 'Quantité mise à jour' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const supprimerPanier = async (req, res) => {
  try {
    const item = await prisma.marketplacePanier.findFirst({ where: { id: Number(req.params.id), acheteurId: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Article introuvable dans le panier' });
    await prisma.marketplacePanier.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Article supprimé du panier' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const commander = async (req, res) => {
  try {
    const panier = await prisma.marketplacePanier.findMany({
      where: { acheteurId: req.user.id },
      include: { produit: { select: { prix: true, vendeurId: true } } },
    });
    if (panier.length === 0) return res.status(400).json({ message: 'Votre panier est vide' });

    const commandes = panier.map(item => ({
      acheteurId: req.user.id,
      produitId: item.produitId,
      vendeurId: item.produit.vendeurId,
      quantite: item.quantite,
      prixUnitaire: item.produit.prix,
      prixTotal: Number(item.produit.prix) * item.quantite,
    }));

    const ids = await prisma.$transaction(async (tx) => {
      const created = await Promise.all(commandes.map(c => tx.marketplaceCommande.create({ data: c })));
      await tx.marketplacePanier.deleteMany({ where: { acheteurId: req.user.id } });
      return created.map(c => c.id);
    });

    res.status(201).json({ message: 'Commande passée avec succès', commande_ids: ids });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getMesCommandes = async (req, res) => {
  try {
    const commandes = await prisma.marketplaceCommande.findMany({
      where: { acheteurId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { produit: { select: { titre: true, imageUrl: true } }, vendeur: { select: { nom: true } } },
    });
    res.json(commandes.map(c => ({
      ...c, produit_titre: c.produit?.titre, produit_image: c.produit?.imageUrl,
      vendeur_nom: c.vendeur?.nom, created_at: c.createdAt, prix_total: c.prixTotal,
    })));
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
