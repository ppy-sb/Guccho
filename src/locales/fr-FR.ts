import enGB from './en-GB'
import type { GlobalI18n } from './@types'
import { Rank } from '~/def'
import { Scope, UserPrivilege } from '~/def/user'

export default {
  mode: enGB.mode,
  ruleset: enGB.ruleset,
 rank: {
    [Rank.PPv2]: 'Performance(v2)',
    [Rank.PPv1]: 'Performance(v1)',
    [Rank.RankedScore]: 'Score Classé',
    [Rank.TotalScore]: 'Score Total',
    [Rank.Score]: 'Score',
  },
  titles: {
    'leaderboard': 'Classement',
    'status': 'Statut',
    'settings': 'Paramètres',
    'relations': 'Amis & Bloqués',
    'userpage': 'Mon Profil',
    'admin-panel': 'Panneau Administrateur',
    'logs': 'Logs',
    'articles': 'Articles',
  },
  global: {
    'logout': 'Déconnexion',
    'login': 'Connexion',
    'register': 'Inscription',
    'pp': 'pp',
    'player': 'Joueur',
    'rank': 'Rang',
    'mods': 'Mods',
    'played-at': 'Temps de jeu',
    'acc': 'Acc',
    'accuracy': 'Précision',
    'play-count': 'Nombre de parties',
    'beatmapsets': 'Beatmapsets',
    'beatmaps': 'Beatmaps',
    'users': 'Utilisateur',
    'session': 'Session',
  },
  priv: {
    [UserPrivilege.Disabled]: 'Désactivé',
    [UserPrivilege.Restricted]: 'Restreint',
    [UserPrivilege.Registered]: 'Enregistré',
    [UserPrivilege.Inactive]: 'Inactif',
    [UserPrivilege.Normal]: 'Normal',
    [UserPrivilege.Supported]: 'Supporté',
    [UserPrivilege.Supporter]: 'Supporter',
    [UserPrivilege.Verified]: 'Vérifié',
    [UserPrivilege.Alumni]: 'Alumni',
    [UserPrivilege.TournamentStuff]: 'TournamentStuff',
    [UserPrivilege.ChannelModerator]: 'Modérateur de Salon',
    [UserPrivilege.Moderator]: 'Modérateur',
    [UserPrivilege.BeatmapNominator]: 'BN',
    [UserPrivilege.Staff]: 'Staff',
    [UserPrivilege.Admin]: 'Admin',
    [UserPrivilege.Owner]: 'Propriétaire',
    [UserPrivilege.Bot]: 'Bot',
  },
  scope: {
    [Scope.Self]: 'Moi',
    [Scope.Friends]: 'Amis',
    [Scope.Public]: 'Tout le Monde',
  },
  service: {
    logs: 'Logs',
    ranks: 'Classement',
    sessions: 'Connexion Web',
  },
} satisfies GlobalI18n as GlobalI18n
