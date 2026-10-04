// @ts-nocheck
import React from 'react';
import ChatBot from 'react-chatbotify';
import { useCurrentOrganization } from '@/hooks/query';

/**
 * Assistant comptable — chatbot d'aide en français (basé sur des règles, sans IA).
 * Guide les gérants non-comptables (pharmacies, boutiques, restaurants, salons)
 * sur la comptabilité OHADA (Bénin/Sénégal) et l'utilisation de l'application.
 */

// Content below is SYSCOHADA/OHADA-specific (account codes, TVA/MECeF/IPRES rules),
// so the bot only makes sense for Bénin/Sénégal organizations.
const OHADA_LOCATIONS = ['BJ', 'SN'];

const DISCLAIMER =
  'ℹ️ Ces informations sont indicatives. Confirmez avec votre comptable ou les services fiscaux (DGI/DGID). Les taux changent chaque année.';

const MENU = [
  '🧾 Vente / facture',
  '💸 Dépense / achat',
  '📱 Mobile Money',
  '🧮 TVA & impôts',
  '👥 Paie & charges sociales',
  '📊 Rapports & comptes',
  '📅 Clôture du mois',
  '❓ Aide sur l\'application',
  '👤 Contacter le support',
];

const MENU_MAP = {
  [MENU[0]]: 'vente', [MENU[1]]: 'depense', [MENU[2]]: 'mobile', [MENU[3]]: 'tva',
  [MENU[4]]: 'paie', [MENU[5]]: 'rapports', [MENU[6]]: 'cloture', [MENU[7]]: 'aide_app', [MENU[8]]: 'support',
};

function routeByKeyword(text) {
  const t = (text || '').toLowerCase();
  if (/(vente|facture|client|encaiss|vendre)/.test(t)) return 'vente';
  if (/(d[ée]pense|achat|charge|payer|fournisseur|loyer)/.test(t)) return 'depense';
  if (/(mobile|orange|wave|momo|moov|money)/.test(t)) return 'mobile';
  if (/(tva|imp[ôo]t|taxe|tps|cgu|fiscal|d[ée]clar|aib|mecef)/.test(t)) return 'tva';
  if (/(paie|salaire|salari|social|cnss|ipres|css|cotisation|employ)/.test(t)) return 'paie';
  if (/(rapport|bilan|r[ée]sultat|grand livre|balance|[ée]tat)/.test(t)) return 'rapports';
  if (/(cl[ôo]ture|fin de mois|checklist|mensuel|rapprochement|fin d.ann[ée]e)/.test(t)) return 'cloture';
  if (/(compte|plan comptable|411|401|521|571|701|601|c.?est quoi)/.test(t)) return 'comptes';
  if (/(app|application|comment|param|langue|utilis|cr[ée]er)/.test(t)) return 'aide_app';
  if (/(support|humain|aide|contact|probl[èe]me|t[ée]l[ée]phone)/.test(t)) return 'support';
  return null;
}
const routeMenu = (params) => MENU_MAP[params.userInput] || routeByKeyword(params.userInput) || 'incompris';

const flow = {
  start: {
    message:
      'Bonjour 👋 Je suis votre assistant comptable. Je peux vous aider sur vos ventes, dépenses, la TVA, la paie, vos rapports et l\'utilisation de l\'application. Que voulez-vous faire ?',
    options: MENU,
    path: routeMenu,
  },
  incompris: {
    message: 'Je n\'ai pas bien compris 🤔. Choisissez une option, ou tapez un mot-clé (ex. « TVA », « salaire », « clôture »).',
    options: MENU,
    path: routeMenu,
  },

  // ---- VENTE / FACTURE ----
  vente: {
    message:
      'Pour enregistrer une vente :\n1️⃣ Menu « Ventes » → « Factures » → « Nouvelle facture »\n2️⃣ Choisissez le client, ajoutez les articles et la TVA 18 % si vous y êtes assujetti\n3️⃣ Enregistrez et envoyez\n\nL\'écriture se fait automatiquement : 411 Clients, 701 Ventes, 4431 TVA facturée.',
    options: ['⚠️ Suis-je assujetti à la TVA ?', '🧾 Facture conforme (Bénin)', '↩️ Menu principal'],
    path: (p) => p.userInput.includes('TVA') ? 'tva_assujetti' : p.userInput.includes('conforme') ? 'mecef' : 'start',
  },

  // ---- DÉPENSE ----
  depense: {
    message:
      'Pour enregistrer une dépense :\n1️⃣ Menu « Dépenses » → « Nouvelle dépense »\n2️⃣ Choisissez le compte de charge (601 Achats, 622 Loyer, 626 Téléphone, 605 Eau/électricité…)\n3️⃣ Choisissez le paiement : 571 Caisse, 521 Banque ou Mobile Money\n\nL\'application passe l\'écriture automatiquement.',
    options: ['📂 Quel compte choisir ?', '↩️ Menu principal'],
    path: (p) => p.userInput.includes('compte') ? 'comptes' : 'start',
  },

  // ---- MOBILE MONEY ----
  mobile: {
    message:
      'Le Mobile Money se gère comme un compte de trésorerie :\n• 5521 Orange Money\n• 5522 Wave\n• 5523 MTN MoMo\n• 5524 Moov Money\n\n👉 Encaissement : enregistrez le paiement sur le bon portefeuille.\n👉 Frais : compte 627 « Frais Mobile Money ».\n👉 Chaque mois, rapprochez le solde de l\'app avec le relevé de l\'opérateur.\n\n' + DISCLAIMER,
    options: ['↩️ Menu principal'],
    path: 'start',
  },

  // ---- TVA & IMPÔTS ----
  tva: {
    message: 'TVA & impôts — que voulez-vous savoir ?',
    options: ['Suis-je assujetti à la TVA ?', 'Calculer ma TVA à payer', 'Régimes simplifiés (TPS / CGU)', 'Facture normalisée (MECeF)', '↩️ Menu principal'],
    path: (p) => {
      const t = p.userInput;
      if (t.includes('assujetti')) return 'tva_assujetti';
      if (t.includes('Calculer')) return 'tva_calcul';
      if (t.includes('simplifi')) return 'regimes';
      if (t.includes('MECeF') || t.includes('normalis')) return 'mecef';
      return 'start';
    },
  },
  tva_assujetti: {
    message:
      '🇧🇯 Bénin : vous facturez la TVA (18 %) seulement si votre CA annuel dépasse 50 000 000 FCFA. En dessous : régime TPS, sans TVA (sauf option réel).\n🇸🇳 Sénégal : TVA 18 % (seuil à confirmer avec la DGID).\n\n' + DISCLAIMER,
    options: ['Calculer ma TVA à payer', '↩️ Menu principal'],
    path: (p) => p.userInput.includes('Calculer') ? 'tva_calcul' : 'start',
  },
  tva_calcul: {
    message:
      'TVA à payer = TVA collectée − TVA déductible.\n• Collectée sur ventes → 4431\n• Déductible sur achats → 4453\n• Solde à payer → 4441\n\n👉 Consultez la « Balance générale » ou le « Grand livre » (menu Rapports) pour voir les soldes de ces comptes.\n\n' + DISCLAIMER,
    options: ['📊 Rapports & comptes', '↩️ Menu principal'],
    path: (p) => p.userInput.includes('Rapports') ? 'rapports' : 'start',
  },
  regimes: {
    message:
      'Régimes simplifiés :\n🇧🇯 Bénin — TPS : CA < 50 M FCFA. Barème fixe pour les micro (CA ≤ 20 M), ≈ 2 % du CA pour les petites (20–50 M). Impôt libératoire (pas de TVA).\n🇸🇳 Sénégal — CGU : personnes physiques, CA ≤ 50 M FCFA TTC. Regroupe 6 impôts (dont la TVA) en un seul.\n\n' + DISCLAIMER,
    options: ['↩️ Menu principal'],
    path: 'start',
  },
  mecef: {
    message:
      '🇧🇯 Bénin : si vous êtes assujetti à la TVA, vos factures doivent être émises via le système certifié MECeF / e-MECeF (e-mecef.impots.bj). La facture doit comporter : votre IFU et celui du client, le montant TVA comprise, le numéro de machine (NIM) et la signature électronique.\n🇸🇳 Sénégal : facturation électronique certifiée en cours d\'adoption.\n\n👉 Parlez-en à votre hébergeur pour la mise en place.\n\n' + DISCLAIMER,
    options: ['↩️ Menu principal'],
    path: 'start',
  },
  // ---- PAIE & SOCIAL ----
  paie: {
    message:
      'Paie & charges sociales :\n1️⃣ Salaire brut → charge 661 (Salaires)\n2️⃣ Charges sociales employeur → 664\n3️⃣ Net à payer au salarié → 421\n\nTaux (employeur / employé) :\n🇸🇳 Sénégal : IPRES retraite 14 % (8,4 / 5,6) ; CSS allocations familiales 7 % (employeur) ; cadres +6 %.\n🇧🇯 Bénin : CNSS pension 10 % (6,4 / 3,6) ; allocations familiales 9 % (employeur).\n\nL\'impôt sur le salaire (IR) est retenu et reversé séparément.\n\n' + DISCLAIMER,
    options: ['↩️ Menu principal'],
    path: 'start',
  },

  // ---- RAPPORTS & COMPTES ----
  rapports: {
    message:
      'Vos rapports sont dans le menu « Rapports » :\n• Bilan — ce que vous possédez et ce que vous devez\n• Compte de résultat — produits − charges = bénéfice / perte\n• Balance générale — tous les comptes et leurs soldes\n• Grand livre — le détail de chaque compte',
    options: ['📂 Comprendre un compte', '↩️ Menu principal'],
    path: (p) => p.userInput.includes('compte') ? 'comptes' : 'start',
  },
  comptes: {
    message: 'De quel compte voulez-vous comprendre le sens ?',
    options: ['411 Clients', '401 Fournisseurs', '521 Banque / 571 Caisse', '701 Ventes / 601 Achats', '4431 TVA', '↩️ Menu principal'],
    path: (p) => {
      const t = p.userInput;
      if (t.includes('411')) return 'c_clients';
      if (t.includes('401')) return 'c_fournisseurs';
      if (t.includes('Banque') || t.includes('521')) return 'c_treso';
      if (t.includes('701') || t.includes('Ventes')) return 'c_resultat';
      if (t.includes('TVA') || t.includes('4431')) return 'tva_calcul';
      return 'start';
    },
  },
  c_clients: { message: '411 Clients = l\'argent que vos clients vous doivent (ventes à crédit non encore payées). Quand le client paie, le montant passe de 411 vers votre trésorerie.', options: ['📂 Un autre compte', '↩️ Menu principal'], path: (p) => p.userInput.includes('autre') ? 'comptes' : 'start' },
  c_fournisseurs: { message: '401 Fournisseurs = l\'argent que vous devez à vos fournisseurs (achats à crédit). Quand vous payez, le montant sort de votre trésorerie et solde le 401.', options: ['📂 Un autre compte', '↩️ Menu principal'], path: (p) => p.userInput.includes('autre') ? 'comptes' : 'start' },
  c_treso: { message: 'Trésorerie (votre argent disponible) :\n• 521 Banque\n• 571 Caisse (espèces)\n• 5521–5524 Mobile Money\n\nTout encaissement les augmente, toute dépense les diminue.', options: ['📂 Un autre compte', '↩️ Menu principal'], path: (p) => p.userInput.includes('autre') ? 'comptes' : 'start' },
  c_resultat: { message: '701 Ventes = revenus de marchandises ; 706 Prestations = revenus de services (coiffure, restauration…). 601 Achats = ce que vous achetez pour revendre. Produits (classe 7) − charges (classe 6) = votre résultat.', options: ['📂 Un autre compte', '↩️ Menu principal'], path: (p) => p.userInput.includes('autre') ? 'comptes' : 'start' },

  // ---- CLÔTURE DU MOIS ----
  cloture: {
    message:
      '✅ Checklist de clôture mensuelle :\n1. Saisir toutes les ventes et dépenses du mois\n2. Enregistrer les salaires et charges\n3. Rapprocher banque, caisse et Mobile Money avec les relevés\n4. Vérifier la TVA (collectée − déductible, comptes 4431/4453/4441)\n5. Contrôler la cohérence des soldes\n\n📅 En fin d\'année : produire le Bilan et le Compte de résultat.',
    options: ['🧮 Calculer ma TVA à payer', '📥 Importer des transactions', '↩️ Menu principal'],
    path: (p) => p.userInput.includes('TVA') ? 'tva_calcul' : p.userInput.includes('Importer') ? 'import_help' : 'start',
  },
  import_help: {
    message: '👉 Pour importer vos transactions : ouvrez « Cash Flow » dans le menu, puis « Importer des transactions non catégorisées ». Vous pouvez charger un fichier (Excel/CSV) de vos opérations.',
    options: ['↩️ Menu principal'],
    path: 'start',
  },

  // ---- AIDE APP ----
  aide_app: {
    message:
      'Aide sur l\'application :\n• Créer un client : « Ventes » → « Clients » → « Nouveau »\n• Créer un article : « Articles » → « Nouveau »\n• Voir vos rapports : menu « Rapports »\n• Changer la langue : « Préférences »\n• Inviter un collègue : « Préférences » → « Utilisateurs »',
    options: ['📊 Rapports & comptes', '👤 Contacter le support', '↩️ Menu principal'],
    path: (p) => p.userInput.includes('Rapports') ? 'rapports' : p.userInput.includes('support') ? 'support' : 'start',
  },

  // ---- SUPPORT ----
  support: {
    message: 'Besoin d\'une aide humaine ? Contactez le support :\n✉️ loicsohou@gmail.com\n📞 +1 514 467 5756\n\nDécrivez votre problème et le nom de votre organisation, on vous répond rapidement. 🙏',
    options: ['↩️ Menu principal'],
    path: 'start',
  },
};

const settings = {
  general: { primaryColor: '#0b8043', secondaryColor: '#066b36', fontFamily: 'inherit' },
  tooltip: { mode: 'START', text: 'Besoin d\'aide ? 💬' },
  header: { title: 'Assistant comptable', showAvatar: true },
  notification: { disabled: true },
  chatInput: { enabledPlaceholderText: 'Écrivez votre question…', sendButtonText: 'Envoyer' },
  chatHistory: { storageKey: 'bigcapital_assistant_fr', viewChatHistoryButtonText: 'Voir l\'historique' },
  botBubble: { simStream: false },
  footer: { text: 'Assistant comptable — aide indicative' },
};

export default function AssistantChatbot() {
  const { data: organization } = useCurrentOrganization();

  if (!organization || !OHADA_LOCATIONS.includes(organization.metadata?.location)) {
    return null;
  }
  return <ChatBot flow={flow} settings={settings} />;
}
