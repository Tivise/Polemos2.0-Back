const UsersController = require('./controllers/users.controller');
const PermissionMiddleware = require('../common/middlewares/auth.permission.middleware');
const ValidationMiddleware = require('../common/middlewares/auth.validation.middleware');
const config = require('../common/config/env.config');

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function (app) {
    app.post('/users', [
        UsersController.insert
    ]);
    app.get('/users', [
        UsersController.list
    ]);
    app.get('/users/:userId', [
        UsersController.getUserById
    ]);
    app.get('/users/name/:username', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getUserByName
    ]);
    app.get('/fulluser/name/:username', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getFullUserByName
    ]);
    app.get('/users/mail/:mail', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getUserByMail
    ]);



    app.get('/ranking', [
        UsersController.ranking
    ]);

    app.get('/compteurRanked', [
        UsersController.compteurRanked
    ]);

    app.get('/tournaments', [
        UsersController.tournaments
    ]);

    app.get('/tournaments/:tournamentId', [
        UsersController.getTournamentById
    ]);
    app.post('/tournament/join/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.joinTournament
    ]);
    app.post('/tournament/leave/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.leaveTournament
    ]);
    app.get('/tournament/participant/:tournamentId', [
        UsersController.getParticipantById
    ]);
    app.post('/tournament/verify/byparticipantid/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.verifyParticipant
    ]);

    app.get('/teams/', [
        UsersController.getTeams
    ]);

    app.get('/team/:userId', [
        UsersController.getTeamByUserId
    ]);
    app.post('/team/create/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.createTeam
    ]);
    app.get('/team/leader/:userId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getTeamsByLeader
    ]);
    app.get('/team/userlist/:teamId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getTeamUserList
    ]);

    app.get('/invitation/:userId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getInvitationsByUserId
    ]);

    app.post('/team/validity/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.checkTeamValidity
    ]);

    app.post('/team/leave/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.leaveTeam
    ]);
    app.post('/team/invite/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.inviteTeam
    ]);

    app.post('/invitation/accept/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.acceptInvitation
    ]);
    app.post('/invitation/refuse/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.refuseInvitation
    ]);

    app.get('/team/invitations/:teamId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getInvitationTeamUserList
    ]);
    app.get('/team/cancel/:invitationidp', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.cancelInvitationById
    ]);

    app.post('/kick/player/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.kickPlayer
    ]);

    app.get('/notification/:userId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.getNotificationByUserId
    ]);

    app.get('/notification/remove/:notificationid', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.deleteNotificationById
    ]);

    app.post('/changeMain/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.changeMain
    ]);
    app.post('/changeSecond/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.changeSecond
    ]);
    app.get('/team/state/:teamId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.changeTeamState
    ]);

    app.post('/confirmAccount/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.confirmAccount
    ]);

    app.get('/matchmaking/add/:userId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.addToFile
    ]);

    app.get('/matchmaking/remove/:userId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.removeToFile
    ]);

    app.get('/matchmaking/rank/:userId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.rankedPlayerInformation
    ]);

    app.post('/createChar/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.createChar
    ]);

    app.post('/matchmaking/match/chooseChar/', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.chooseCharMatch
    ]);
    app.post('/paiement/', [
        UsersController.paiement
    ]);

    app.post('/paiementVIP/', [
        UsersController.paiement
    ]);

    
    app.get('/donnezNousTous/', [
        UsersController.donnezNousTous
    ]);

    app.get('/planning/', [
        UsersController.planning
    ]);

    app.get('/polemospass/:userId', [
        ValidationMiddleware.validJWTNeeded,
        UsersController.polemospass
    ]);

};
