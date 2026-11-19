# Aziza Store

Catalogue de soins pour le visage, le corps et les cheveux. Le site utilise les photos du catalogue fourni et conserve la sélection dans le navigateur.

## Démarrage local

Depuis la racine du dépôt, lancer `python3 -m http.server 4173`, puis ouvrir `http://localhost:4173`.

Les libellés et catégories se trouvent dans `store.js`. Le logo sur fond transparent est disponible dans `images/aziza-logo.png`.

## Administration

Le tableau de bord est disponible à l’adresse `/admin` quand le projet tourne avec Cloudflare Workers. Le serveur HTTP Python permet de prévisualiser la vitrine et ses données de démonstration.

Le déploiement utilise toujours la commande de build actuelle :

```sh
mkdir -p dist
cp index.html style.css store.js dist/
cp -R images dist/
npx wrangler deploy --assets ./dist
```

Dans Cloudflare, ajouter `ADMIN_PASSWORD` en tant que **Secret** du Worker `aziza-store`, avec un mot de passe d’au moins 16 caractères. Pour tester localement, définir ce secret dans un fichier `.dev.vars` ignoré par Git et utiliser `npx wrangler dev` après avoir préparé `dist`.

Le magasin utilise un Durable Object SQLite pour conserver les réglages, les modifications du catalogue, les vues et les commandes préparées. Le numéro WhatsApp se configure dans le tableau de bord. Un numéro vide conserve le mode de démonstration. Les coordonnées et l’adresse du client sont transmises via WhatsApp. La base conserve l’identifiant de commande, les articles, le montant et le statut. Après vérification sur WhatsApp, l’administrateur peut marquer une commande comme confirmée ou annulée.
