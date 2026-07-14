import { Router } from 'express';
import { verifierToken } from '../middlewares/auth.middleware.js';
import {
  getProduits, getMesProduits, createProduit, updateProduit, deleteProduit,
  getPanier, ajouterPanier, modifierQuantitePanier, supprimerPanier,
  commander, getMesCommandes,
} from '../controllers/marketplace.controller.js';

const router = Router();

router.get('/marketplace/produits', verifierToken, getProduits);
router.get('/marketplace/mes-produits', verifierToken, getMesProduits);
router.post('/marketplace/produits', verifierToken, createProduit);
router.put('/marketplace/produits/:id', verifierToken, updateProduit);
router.delete('/marketplace/produits/:id', verifierToken, deleteProduit);

router.get('/marketplace/panier', verifierToken, getPanier);
router.post('/marketplace/panier', verifierToken, ajouterPanier);
router.put('/marketplace/panier/:id', verifierToken, modifierQuantitePanier);
router.delete('/marketplace/panier/:id', verifierToken, supprimerPanier);

router.post('/marketplace/commander', verifierToken, commander);
router.get('/marketplace/mes-commandes', verifierToken, getMesCommandes);

export default router;
