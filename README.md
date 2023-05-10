# comptanar

Un produit pour faire des comptes annuels officiels

Suivi : https://github.com/orgs/comptanar/projects/1/views/1

## Objectif

### Général

Produire facilement et de manière fiable les informations qu'une entreprise doit déclarer aux impôts (TVA, Impôts sur les Sociétés et liasse fiscale)

[Déclarer nous-même](https://hackmd.io/KMSyKgOzT_SnHeCmKLvxBw)
https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/edi/liste_des_partenaires_edi_actifs.pdf


### Court terme

Reproduire les comptes annuels de l'exercice 2020 de l'Échappée Belle



## Déroulé

### Creation d'instance

Depuis le site comptanar centrale (`https://comptanar.github.io/` pour le moment), on demande à ouvrir une instance à partir de son compte Github.
En passant [toctoctoc](https://github.com/Scribouilli/toctoctoc), on partage les accès pour pouvoir créer un repo github dans lequel il y a les fichiers de données 

Les fichiers de données seront exposé dans la branche principale.


## Artefact

- Dans l'organisation Compt-Anar [un repo pour le code source](https://github.com/DavidBruant/comptanar) de [https://compte-anar.github.io] (ou `https://comptanar.fr/`)
- Dans l'organisation Compt-Anar [un repo _template_](https://github.com/comptanar/comptabilite) contenant le code source et les fichiers template de données 
- [Logiciel Comptable](https://github.com/comptanar/logiciel-comptable)
- Votre repo avec vos fichier de donnée et vos sources
- [Toctoctoc](https://github.com/Scribouilli/toctoctoc), pour la gestion de droit d'authorisation Github



## Développement

Installer l'application

```sh
npm install
```

Démarrer le serveur de l'instance principale

```sh
npm start
```
Lancer les tests

```sh
npm run test
```

Lancer un build

```sh
npm run build
```

Lancer le serveur de dev

```sh
npm run dev
```


### Conventions

#### Langue

Les commits, la documentation, les commentaires, les noms de fonctions et variable doivent être **en langue française**

#### Guide stylistique

Plutôt 4 espaces et pour le reste, on verra plus tard

#### Typage et documentation

On fait au mieux pour typer en [TypeScript version JSDoc](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

Il y a un compromis à trouver entre passer trop de temps à satisfaire le compilateur TypeScript et avancer ce qui est directement utile aux utilisateur.rice.s. Donc, on utilise facilement le type `any` ou `// @ts-ignore` et c'est ok


#### CSS

Ce repo utilise SCSS (version de SASS qui ressemble très fort à du CSS), principalement pour le nesting et les variables

