const UserModel = require('../models/users.model');
const crypto = require('crypto');
const sql = require('../../common/services/mongoose.service').sql;

exports.insert = (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    UserModel.getUserByName(req.body.username).then((result1) => {
        if(result1.length == 0){
            UserModel.getUserByMail(req.body.mail).then((result2) => {
                if(result2.length == 0){
                    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    const reusername = /^[a-zA-Z0-9]+([a-zA-Z0-9](_|-| )[a-zA-Z0-9])*[a-zA-Z0-9]+$/;
                    if(re.test(req.body.mail) &&  reusername.test(req.body.username) && req.body.username.length < 20){
                        req.body.passbrut = req.body.password;
                        let salt = crypto.randomBytes(16).toString('base64');
                        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                        req.body.password = salt + "$" + hash;
                        req.body.permissionLevel = 1;
                        req.body.ipadress = ip;
                        req.body.codesecret = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
                        const today = new Date();
                        const date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
                        req.body.registerDate = date;

                        UserModel.createUser(req.body)
                        .then((result3) => {
                            res.status(201).send(result3);
                        });
                    }
                }
                else{
                    res.status(400).send("Erreur: Utilisateur ou mail déjà utilisé");
                }
            });
        }
        else{
            res.status(400).send("Erreur: Utilisateur ou mail déjà utilisé");
        }
    });
};

exports.list = (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("plutot ici trouvé" + ip);
    UserModel.list()
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getUserById = (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);
    UserModel.getUserById(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.getUserByName = (req, res) => {
    UserModel.getUserByName(req.params.username)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.getFullUserByName = (req, res) => {
    UserModel.getFullUserByName(req.params.username)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.getUserByMail = (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);
    UserModel.getUserByMail(req.params.mail)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.tournaments = (req, res) => {
    UserModel.tournaments()
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.compteurRanked = (req, res) => {
    UserModel.compteurRanked()
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getTeams = (req, res) => {
    UserModel.getTeams()
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.ranking = (req, res) => {
    UserModel.ranking()
        .then((result) => {
            res.status(200).send(result);
        })
};


exports.getTournamentById = (req, res) => {
    UserModel.findTournamentById(req.params.tournamentId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.getTeamByUserId = (req, res) => {
    UserModel.getTeamByUserId(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};


exports.createTeam = (req, res) => {
    UserModel.checkTeamNumbers(req.body)
    .then((result2) => {
        if (result2 !== '#204'){
            UserModel.createTeam(req.body)
            .then((result) => {
                console.log(result);
                res.sendStatus(201);
            });
        }
        else{
            res.sendStatus(204)
        }
    });
};

exports.joinTournament = (req, res) => {
    const today = new Date();
    const date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
    req.body.registerDate = date;
    UserModel.joinTournament(req.body)
        .then((result) => {
            res.status(201).send(result);
        });
};
exports.leaveTournament = (req, res) => {
    UserModel.leaveTournament(req.body)
        .then((result) => {
            res.status(201).send(result);
        });
};


exports.getInvitationsByUserId = (req, res) => {
    UserModel.getInvitationsByUserId(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.getParticipantById = (req, res) => {
    UserModel.getParticipantById(req.params.tournamentId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.verifyParticipant = (req, res) => {
    UserModel.verifyParticipant(req.body)
        .then((result) => {
            res.status(201).send(result);
        });
};

exports.getTeamsByLeader = (req, res) => {
    UserModel.getTeamsByLeader(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.checkTeamValidity = (req, res) => {
    UserModel.checkTeamValidity(req.body)
        .then((result) => {
            console.log(result);
            if(result === '#200'){
                res.sendStatus(201);
            }
            else if (result === '#203'){
                res.sendStatus(203);
            }
            else if (result === '#204'){
                res.sendStatus(204);
            }
            else{
                res.status(202).send(result);
            }
        });
};

exports.getTeamUserList = (req, res) => {
    UserModel.getTeamUserList(req.params.teamId)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.leaveTeam = (req, res) => {
    UserModel.leaveTeam(req.body)
        .then((result) => {
            const message = req.body.teamname + " left your team";
            UserModel.createNotification({'type':4, 'message':message, 'userid':req.body.owner})
            res.status(201).send(result);
        });
};

exports.inviteTeam = (req, res) => {
    UserModel.inviteTeam(req.body)
        .then((result) => {
            if (result === '#204'){
                res.sendStatus(204);
            }
            else if(result === '#203'){
                res.sendStatus(203);
            }
            else{
                const message = req.body.teamname + " invited you";
                UserModel.createNotification({'type':0, 'message':message, 'username':req.body.username})
                res.sendStatus(201);
            }
        });
};

exports.checkTeamNumbers = (req, res) => {
    UserModel.checkTeamNumbers(req.body)
        .then((result) => {
            if (result === '#204'){
                res.sendStatus(204);
            }
            else{
                res.sendStatus(201);
            }
        });
};

exports.acceptInvitation = (req, res) => {
    UserModel.checkTeamNumbers(req.body)
    .then((result2) => {
        if (result2 !== '#204'){
            UserModel.acceptInvitation(req.body)
            .then((result) => {
                const message = req.body.username + " accepted your invitation";
                UserModel.createNotification({'type':2, 'message':message, 'userId':req.body.owner})
                res.sendStatus(201);
            });
        }
        else{
            res.sendStatus(204)
        }
    });
};

exports.refuseInvitation = (req, res) => {
    UserModel.refuseInvitation(req.body)
    .then((result) => {
        const message = req.body.username + " refused your invitation";
        UserModel.createNotification({'type':1, 'message':message, 'userId':req.body.owner})
        res.sendStatus(201);
    });
};

exports.getInvitationTeamUserList = (req, res) => {
    UserModel.getInvitationTeamUserList(req.params.teamId)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.cancelInvitationById = (req, res) => {
    UserModel.cancelInvitationById(req.params.invitationidp)
        .then((result) => {
            res.sendStatus(201);
        })
};
/*
type 0 = kick player from team
type 1 = invite player from team
*/
exports.kickPlayer = (req, res) => {
    UserModel.kickPlayer(req.body)
    .then((result) => {
        UserModel.createNotification({'type':0, 'message':"You are kicked from team", 'username':req.body.username})
        res.sendStatus(201);
    });
};

exports.getNotificationByUserId = (req, res) => {
    UserModel.getNotificationByUserId(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.deleteNotificationById = (req, res) => {
    UserModel.deleteNotificationById(req.params.notificationid)
        .then((result) => {
            res.sendStatus(201);
        })
};

exports.changeMain = (req, res) => {
    UserModel.changeMain(req.body)
    .then((result) => {
        res.sendStatus(201);
    });
};
exports.changeSecond = (req, res) => {
    UserModel.changeSecond(req.body)
    .then((result) => {
        res.sendStatus(201);
    });
};
exports.changeTeamState = (req, res) => {
    UserModel.changeTeamState(req.params.teamId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.confirmAccount = (req, res) => {
    UserModel.confirmAccount(req.body)
    .then((result) => {
        if(result == '#101'){
            UserModel.findById(req.body.userid)
            .then((user)=>{
                UserModel.createUserDrago(user[0])
                .then((result4) => {
                    res.status(201).send(result4);
                })
            })
        }
        res.sendStatus(201);

    });
};

exports.addToFile = (req, res) => {
    UserModel.addToFile(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};
exports.removeToFile = (req, res) => {
    UserModel.removeToFile(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};
exports.rankedPlayerInformation = (req, res) => {
    UserModel.rankedPlayerInformation(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};
exports.chooseCharMatch = (req, res) => {
    UserModel.chooseCharMatch(req.body)
        .then((result) => {
            res.status(201).send(result);
        });
};

exports.createChar = (req, res) => {
    UserModel.createChar(req.body)
        .then((result) => {
            const code = result[''];
            console.log(code);
            if(code === 400){
                res.status(201).send("Trop de personnage");
            }
            else if(code === 200){
                res.status(201).send("Nom de personnage déjà utilisé");
            }
            else if(code === 300){
                res.status(201).send("Veuillez vous déconnecter du jeu");
            }
            else if(code === 100){
                res.status(201).send("Personnage crée");
            }
            else{
                res.status(201).send("Erreur inconnu: contactez un administrateur!")
            }
        });
};

exports.paiement = (req, res) => {
    const status = req.body.status ? req.body.status.replace('/[^a-zA-Z0-9]+/', '') : '';
    const code = req.body.code ? req.body.code.replace('/[^a-zA-Z0-9]+/', '') : '';
    const rate = req.body.rate ? req.body.rate.replace('/[^a-zA-Z0-9\-]+/') : '';
    const payout = req.body.payout ? parseFloat(req.body.payout) : '';
    const privateKey = req.body.privateKey ? req.body.privateKey.replace('/[^a-zA-Z0-9]+/', '') : '';
    const virtualCurrency = req.body.virtual_currency ? req.body.virtual_currency.replace('/[^a-zA-Z0-9]+/', '') : '';

    const custom = req.body.custom ? req.body.custom.replace('/[^a-zA-Z0-9\-\_]+/', '') : '';
    console.log(req.body);
    console.log(status);
    console.log(privateKey)
    if(status == 'success' && privateKey == 'd931266ba73d276519a03c4f6df6f7dea94dc7e3') {
        UserModel.paiement(req.body)
        .then((result) => {
            if(result === '#100'){
                res.status(200).send(result);
            }
            else{
                res.status(400).send(result);
            }
        });
    }
};

exports.donnezNousTous = (req, res) => {
    UserModel.donnezNousTous()
        .then((result) => {
            console.log(result);
            res.status(200).send(result);
        })
};

exports.planning = (req, res) => {
    UserModel.planning()
        .then((result) => {
            res.status(200).send(result);
        })
};


exports.polemospass = (req, res) => {
    UserModel.polemospass(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};