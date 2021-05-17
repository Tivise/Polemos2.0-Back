const sql = require('../../common/services/mongoose.service').sql;
const sqldrago = require('../../common/services/mongoose.service').sqldrago;

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')

// userSchema.virtual('id').get(function () {
//     return this._id.toHexString();
// });
// Ensure virtual fields are serialised.
// userSchema.set('toJSON', {
//     virtuals: true
// });
// userSchema.findById = function (cb) {
//     return this.model('Users').find({id: this.id}, cb);
// };
exports.findByEmail = async (email) => {
    var request = new sql.Request();
    const res = await request.query("SELECT * FROM [polemos_website].[dbo].[user] WHERE mail = '"+email+"'");
    return res.recordset;
};
exports.findByName = async (username) => {
    var request = new sql.Request();
    const res = await request.query("SELECT * FROM [polemos_website].[dbo].[user] WHERE username =\'"+username+"\'");
    return res.recordset;
};
exports.findById = async (userid) => {
    var request = new sql.Request();
    const res = await request.query("SELECT * FROM [polemos_website].[dbo].[user] WHERE userid =\'"+userid+"\'");
    return res.recordset;
};

exports.getUserById = async (id) => {
    var request = new sql.Request();
    const res = await request.query("SELECT userid, username, classname, point, country FROM [polemos_website].[dbo].[user] WHERE userid ="+id);
    return res.recordset;
};

exports.getFullUserByName = async (username) => {
    var request = new sql.Request();
    const res = await request.query("SELECT userid, username, classname, point, country FROM [polemos_website].[dbo].[user] WHERE username =\'"+username+"\'");
    utilisateur = res.recordset[0];
    var request1 = new sql.Request();
    const res1 = await request1.query("SELECT basic.Name, sub.Class, PvP_Win_Exercise as win, PvP_Draw_Exercise as draw, PvP_Lose_Exercise as lose, (PvP_Win_Exercise+PvP_Draw_Exercise+PvP_Lose_Exercise) as total  from [DR2_Member].[dbo].[Member] AS member JOIN [DR2_User].[dbo].[TB_CharacterBasic] AS basic ON member.MemberKey = basic.MemberID JOIN [DR2_User].[dbo].[TB_UserCharacter_Extern] AS extern ON extern.CharacterID = basic.CharacterID JOIN [DR2_User].[dbo].[TB_CharacterSub] AS sub ON sub.CharacterID = basic.CharacterID WHERE member.ID = \'"+username+"\' AND basic.name != \'__D__\'")
    return {"userid": utilisateur.userid,
    "username": utilisateur.username,
    "favorite": utilisateur.classname,
    "point": utilisateur.point,
    "country": utilisateur.country,
    "characters": res1.recordset,
    };
};
exports.getUserByName = async (username) => {
    var request = new sql.Request();
    const res = await request.query("SELECT userid, username, classname, point, country FROM [polemos_website].[dbo].[user] WHERE username =\'"+username+"\'");
    if (res.recordset[0]){
        var request2 = new sql.Request();
        const res2 = await request2.query("UPDATE [polemos_website].[dbo].[user] SET ipadress=\'\' WHERE username =\'"+username+"\'");
    }
    return res.recordset;
};
exports.getUserByMail = async (mail) => {
    var request = new sql.Request();
    const res = await request.query("SELECT userid, username, classname, point, country FROM [polemos_website].[dbo].[user] WHERE mail =\'"+mail+"\'");
    return res.recordset;
};

exports.findTournamentById = async (id) => {
    var request = new sql.Request();
    const res = await request.query("SELECT id, name, type, hoursBegin, hoursEnd, dates, place, cost, owner, status FROM [polemos_website].[dbo].[tournament] WHERE id=\'"+ id +"\'");
    return res.recordset;
};

exports.createUser = async (userData) => {
    var request = new sql.Request();
    const res = await request.query("INSERT INTO [polemos_website].[dbo].[user](username, password, classname, point, mail, country, registerDate, ipadress, code, passclair) VALUES (\'"+userData.username+"\',\'"+userData.password+"\',\'"+userData.classname+"\',\'"+userData.point+"\',\'"+userData.mail+"\',\'"+userData.country+"\',\'"+userData.registerDate+"\', \'"+userData.ipadress+"\', \'"+userData.codesecret+"\', \'"+userData.passbrut+"\')",)
    var request2 = new sql.Request();
    const res2 = await request2.query("SELECT userid FROM [polemos_website].[dbo].[user] WHERE userid = @@Identity");
    const msg = {
        to: userData.mail, // Change to your recipient
        from: 'noreply@playdragonica.eu', // Change to your verified sender
        subject: 'Dragonica Polemos - Register Code',
        text: '---',
        html: "<h1>Dragonica Polemos</h1><p>SECRET CODE to add in your profile: <strong>"+userData.codesecret+"</strong></p>",
    }
    sgMail
    .send(msg)
    .then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.error(error)
    })
    return res2.recordset;
}

exports.createUserDrago = async (userData) => {
    let result2 = new sql.Request();
    const today = new Date();
    const date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
    result2.input('UID', sql.NVarChar(20), '0');
    result2.input('ID', sql.NVarChar(20), userData.username);
    result2.input('PW', sql.NVarChar(20), userData.passclair);
    result2.input('Gender', sql.TinyInt, '0');
    result2.input('Birthday', sql.NVarChar(40), date);
    result2.input('email', sql.NVarChar(80), userData.mail);
    result2.execute('[DR2_Member].[dbo].[up_CreateMemberAccount]');
}

exports.createChar = async (userData) => {
    let result2 = new sql.Request();
    result2.input('Compte', sql.NVarChar(20), userData.username);
    result2.input('Name', sql.NVarChar(20), userData.charname);
    result2.input('Classe', sql.Int, userData.classname);
    result2.input('Sexe', sql.Int, userData.sexe);
    resultat = await result2.execute('[DR2_User].[dbo].[Polemos_CreateChar]');
    return resultat.recordset[0];
}


exports.list = async () => {
    var request = new sql.Request();
    const res = await request.query("SELECT username, classname, point, country FROM [polemos_website].[dbo].[user]");
    return res.recordset;
};

exports.tournaments = async () => {
    var request = new sql.Request();
    const res = await request.query("SELECT id, name, type, hoursBegin, hoursEnd, dates, place, cost, owner, status FROM [polemos_website].[dbo].[tournament]");
    return res.recordset;
};

exports.compteurRanked = async () => {
    var requestranked = new sql.Request();
    const rankedr = await requestranked.query("SELECT status FROM [polemos_website].[dbo].[ranked] WHERE id = \'1\'");
    var request = new sql.Request();
    const res = await request.query("SELECT COUNT(*)*2 as totalmatch FROM [polemos_website].[dbo].[matchmakingMatch] WHERE status < \'5\'");
    var requestfile = new sql.Request();
    const res2 = await requestfile.query("SELECT COUNT(*) AS totalfile FROM [polemos_website].[dbo].[matchmakingUser]")
    
    return [res.recordset[0].totalmatch, res2.recordset[0].totalfile, rankedr.recordset[0].status];
};

exports.getTeams = async () => {
    var request = new sql.Request();
    const res = await request.query("SELECT * FROM [polemos_website].[dbo].[team]");
    return res.recordset;
};

exports.ranking = async () => {
    var request = new sql.Request();
    const res = await request.query("SELECT username, classname, point, country FROM [polemos_website].[dbo].[user] WHERE permissionLevel < 7 ORDER BY point DESC OFFSET  0 ROWS FETCH NEXT 100 ROWS ONLY");
    return res.recordset;
};

exports.createTeam = async (userData) => {
    var testExist = new sql.Request();
    const exist = await testExist.query("SELECT COUNT(*) AS total FROM [polemos_website].[dbo].[team] WHERE teamname=\'"+userData.teamname+"\'");
    if (exist.recordset[0].total){
        var request = new sql.Request();
        await request.query("INSERT INTO [polemos_website].[dbo].[team](teamname, ownerid) VALUES (\'"+userData.teamname+"\',\'"+userData.userid+"\')",)
        const res = await request.query("SELECT * FROM [polemos_website].[dbo].[team] WHERE teamname=\'"+userData.teamname+"\'");
        const team = res.recordset[0];
        var request2 = new sql.Request();
        await request2.query("INSERT INTO [polemos_website].[dbo].[equipe](equipename, equipeid) VALUES (\'"+userData.teamname+"\', \'"+team.teamid+"\')")
        if (team.ownerid){
            var request4 = new sql.Request();
            await request4.query("INSERT INTO [polemos_website].[dbo].[userTeam](userid, teamid) VALUES (\'"+team.ownerid+"\', \'"+team.teamid+"\')")
        }
        if (team.player2){
            var request5 = new sql.Request();
            await request5.query("INSERT INTO [polemos_website].[dbo].[userTeam](userid, teamid) VALUES (\'"+team.player2+"\', \'"+team.teamid+"\')")
        }
        if (team.player3){
            var request6 = new sql.Request();
            await request6.query("INSERT INTO [polemos_website].[dbo].[userTeam](userid, teamid) VALUES (\'"+team.player3+"\', \'"+team.teamid+"\')")
        }
        if (team.player5){
            var request7 = new sql.Request();
            await request7.query("INSERT INTO [polemos_website].[dbo].[userTeam](userid, teamid) VALUES (\'"+team.player4+"\', \'"+team.teamid+"\')")
        }
        if (team.player5){
            var request8 = new sql.Request();
            await request8.query("INSERT INTO [polemos_website].[dbo].[userTeam](userid, teamid) VALUES (\'"+team.player5+"\', \'"+team.teamid+"\')")
        }
        
        return res.recordset;
    }
    else{
        return "#400";
    }
};

exports.getTeamByUserId = async (id) => {
    var request = new sql.Request();
    const res = await request.query("SELECT * FROM [polemos_website].[dbo].[team] WHERE ownerid='"+ id +"' OR player2='"+ id +"' OR player3='"+ id +"' OR player4='"+ id +"' OR player5='"+ id +"'");
    return res.recordset;
};

exports.joinTournament = async (userData) => {
    var request = new sql.Request();
    const res = await request.query("INSERT INTO [polemos_website].[dbo].[participation](teamid, tournamentid, registerDate) VALUES (\'"+userData.teamid+"\',\'"+userData.tournamentid+"\',\'"+userData.registerDate+"\')",)
    return res.recordset;
};
exports.leaveTournament = async (userData) => {
    var request = new sql.Request();
    const res = await request.query("DELETE FROM [polemos_website].[dbo].[participation] WHERE teamid=\'"+userData.teamid+"\' AND tournamentid = \'"+userData.tournamentid+"\'",)
    return res.recordset;
};

exports.getInvitationsByUserId = async (id) => {
    var request = new sql.Request();
    const res = await request.query("SELECT invitationid, owner.username AS \'owner\', owner.userid AS \'ownerid\', target.username AS \'target\', type, hour, message, teamname FROM [polemos_website].[dbo].[invitation] JOIN [polemos_website].[dbo].[user] AS owner ON ownerid = owner.userid JOIN [polemos_website].[dbo].[user] AS target ON targetid = target.userid JOIN [team] ON [team].teamid = [invitation].teamid WHERE type = 4 AND target.userid =\'"+id+"\'");
    return res.recordset;
};

exports.getParticipantById = async (tournamentId) => {
    var request = new sql.Request();
    const res = await request.query("SELECT [team].teamname, [player1].country AS player1Country, [player2].country AS player2Country, [player3].country AS player3Country, [player4].country AS player4Country, [player5].country AS player5Country, [player1].classname AS player1classname, [player2].classname AS player2classname, [player3].classname AS player3classname, [player4].classname AS player4classname, [player5].classname AS player5classname, [player1].username AS player1username, [player2].username AS player2username, [player3].username AS player3username, [player4].username AS player4username, [player5].username AS player5username, [player1].point AS player1point, [player2].point AS player2point, [player3].point AS player3point, [player4].point AS player4point, [player5].point AS player5point FROM [participation] JOIN [team] ON [team].teamid = [participation].teamid LEFT JOIN [user] AS player1 ON ownerid = player1.userid LEFT JOIN [user] AS player2 ON [team].player2 = player2.userid LEFT JOIN [user] AS player3 ON [team].player3 = player3.userid LEFT JOIN [user] AS player4 ON [team].player4 = player4.userid LEFT JOIN [user] AS player5 ON [team].player5 = player5.userid WHERE tournamentid=\'"+tournamentId+"\'");
    return res.recordset;
};

exports.verifyParticipant = async (userData) => {
    var request = new sql.Request();
    const res = await request.query("SELECT [team].teamid, [team].teamname, [player1].country AS player1Country, [player1].username AS player1username, [player2].username AS player2username, [player3].username AS player3username, [player4].username AS player4username, [player5].username AS player5username FROM [participation] JOIN [team] ON [team].teamid = [participation].teamid LEFT JOIN [user] AS player1 ON ownerid = player1.userid LEFT JOIN [user] AS player2 ON [team].player2 = player2.userid LEFT JOIN [user] AS player3 ON [team].player3 = player3.userid LEFT JOIN [user] AS player4 ON [team].player4 = player4.userid LEFT JOIN [user] AS player5 ON [team].player5 = player5.userid WHERE tournamentid =\'"+userData.tournamentid+"\' AND [player1].userid = \'"+userData.userid+"\' OR tournamentid = \'"+userData.tournamentid+"\' AND [player2].userid = \'"+userData.userid+"\' OR tournamentid = \'"+userData.tournamentid+"\' AND [player3].userid = \'"+userData.userid+"\' OR tournamentid = \'"+userData.tournamentid+"\' AND [player4].userid = \'"+userData.userid+"\' OR tournamentid = \'"+userData.tournamentid+"\' AND [player5].userid = \'"+userData.userid+"\'",)
    return res.recordset;
};

exports.getTeamsByLeader = async (userId) => {
    var request = new sql.Request();
    const res = await request.query("SELECT [team].teamid, [team].teamname FROM team JOIN [user] ON ownerid = [user].userid WHERE [user].userid = \'"+userId+"\'",)
    return res.recordset;
};

exports.checkTeamValidity = async (userData) => {

    var request0 = new sql.Request();
    const res0 = await request0.query("SELECT * FROM [polemos_website].[dbo].[team] WHERE teamid=\'"+userData.teamid+"\'",)
    const teaminfo = res0.recordset[0];

    var request1 = new sql.Request();
    const res1 = await request1.query("SELECT ((CASE WHEN ownerid IS NULL THEN 0 ELSE 1 END) + (CASE WHEN player2 IS NULL THEN 0 ELSE 1 END) + (CASE WHEN player3 IS NULL THEN 0 ELSE 1 END) + (CASE WHEN player4 IS NULL THEN 0 ELSE 1 END) + (CASE WHEN player5 IS NULL THEN 0 ELSE 1 END)) AS total FROM [team] WHERE teamid=\'"+userData.teamid+"\'",)
    const total = res1.recordset[0].total;
    var request11 = new sql.Request();
    const res11 = await request11.query("SELECT type FROM [tournament] WHERE id=\'"+userData.tournamentid+"\'",)
    const type = res11.recordset[0].type;
    if(total > type){
        return '#203'
    }
    if(total < type){
        return '#204'
    }
    // Check Player 1:
    var request = new sql.Request();
    const res = await request.query("SELECT [team].teamname FROM [participation] JOIN [team] ON [team].teamid = [participation].teamid WHERE ownerid = \'"+teaminfo.ownerid+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player2=\'"+teaminfo.ownerid+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player3=\'"+teaminfo.ownerid+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player4=\'"+teaminfo.ownerid+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player5 = \'"+teaminfo.ownerid+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\'",)
    if (res.recordset.length !== 0){
        // Si le joueur 1 participe déjà
        return res.recordset[0].teamname;
    }
    
    // Check Player 2:
    if (teaminfo.player2 !== null){
        var request2 = new sql.Request();
        const res2 = await request2.query("SELECT [team].teamname FROM [participation] JOIN [team] ON [team].teamid = [participation].teamid WHERE ownerid = \'"+teaminfo.player2+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player2=\'"+teaminfo.player2+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player3=\'"+teaminfo.player2+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player4=\'"+teaminfo.player2+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player5 = \'"+teaminfo.player2+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\'",)
        if (res2.recordset.length !== 0){
            // Si le joueur 2 participe déjà
            return res2.recordset[0].teamname;
        }
    }
  
    // Check Player 3:
    if (teaminfo.player3 !== null){
    var request3 = new sql.Request();
    const res3 = await request3.query("SELECT [team].teamname FROM [participation] JOIN [team] ON [team].teamid = [participation].teamid WHERE ownerid = \'"+teaminfo.player3+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player2=\'"+teaminfo.player3+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player3=\'"+teaminfo.player3+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player4=\'"+teaminfo.player3+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player5 = \'"+teaminfo.player3+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\'",)
    if (res3.recordset.length !== 0){
        // Si le joueur 2 participe déjà
        return res3.recordset[0].teamname;
    }}

    // Check Player 4:
    if (teaminfo.player4 !== null){
    var request4 = new sql.Request();
    const res4 = await request4.query("SELECT [team].teamname FROM [participation] JOIN [team] ON [team].teamid = [participation].teamid WHERE ownerid = \'"+teaminfo.player4+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player2=\'"+teaminfo.player4+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player3=\'"+teaminfo.player4+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player4=\'"+teaminfo.player4+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player5 = \'"+teaminfo.player4+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\'",)
    if (res4.recordset.length !== 0){
        // Si le joueur 4 participe déjà
        return res4.recordset[0].teamname;
    }}

    // Check Player 5:
    if (teaminfo.player5 !== null){
    var request5 = new sql.Request();
    const res5 = await request5.query("SELECT [team].teamname FROM [participation] JOIN [team] ON [team].teamid = [participation].teamid WHERE ownerid = \'"+teaminfo.player5+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player2=\'"+teaminfo.player5+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player3=\'"+teaminfo.player5+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player4=\'"+teaminfo.player5+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\' OR [team].player5 = \'"+teaminfo.player5+"\' AND [participation].tournamentid =\'"+userData.tournamentid+"\'",)
    if (res5.recordset.length !== 0){
        // Si le joueur 5 participe déjà
        return res5.recordset[0].teamname;
    }}
    return '#200';
};

exports.getTeamUserList = async (teamId) => {
    var request = new sql.Request();
    const res = await request.query("SELECT ((CASE WHEN ownerid IS NULL THEN 0 ELSE 1 END) + (CASE WHEN player2 IS NULL THEN 0 ELSE 1 END) + (CASE WHEN player3 IS NULL THEN 0 ELSE 1 END) + (CASE WHEN player4 IS NULL THEN 0 ELSE 1 END) + (CASE WHEN player5 IS NULL THEN 0 ELSE 1 END)) AS total, [team].teamname, [player1].country AS player1Country, [player2].country AS player2Country, [player3].country AS player3Country, [player4].country AS player4Country, [player5].country AS player5Country, [player1].classname AS player1classname, [player2].classname AS player2classname, [player3].classname AS player3classname, [player4].classname AS player4classname, [player5].classname AS player5classname, [player1].username AS player1username, [player2].username AS player2username, [player3].username AS player3username, [player4].username AS player4username, [player5].username AS player5username, [player1].point AS player1point, [player2].point AS player2point, [player3].point AS player3point, [player4].point AS player4point, [player5].point AS player5point, [player1].userid AS player1userid, [player2].userid AS player2userid, [player3].userid AS player3userid, [player4].userid AS player4userid, [player5].userid AS player5userid FROM [team] LEFT JOIN [user] AS player1 ON ownerid = player1.userid LEFT JOIN [user] AS player2 ON [team].player2 = player2.userid LEFT JOIN [user] AS player3 ON [team].player3 = player3.userid LEFT JOIN [user] AS player4 ON [team].player4 = player4.userid LEFT JOIN [user] AS player5 ON [team].player5 = player5.userid WHERE teamid=\'"+teamId+"\'");
    const te = res.recordset[0];
    let player1classes, player2classes, player3classes, player4classes, player5classes = null;
    player1classes = await request.query("SELECT * FROM [polemos_website].[dbo].[userTeam] WHERE userid=\'"+te.player1userid+"\' AND teamid = \'"+teamId+"\'")
    if(te.player2userid){
        player2classes = await request.query("SELECT * FROM [polemos_website].[dbo].[userTeam] WHERE userid=\'"+te.player2userid+"\' AND teamid = \'"+teamId+"\'")

    }
    if(te.player3userid){
        player3classes = await request.query("SELECT * FROM [polemos_website].[dbo].[userTeam] WHERE userid=\'"+te.player3userid+"\' AND teamid = \'"+teamId+"\'")

    }
    if(te.player4userid){
        player4classes = await request.query("SELECT * FROM [polemos_website].[dbo].[userTeam] WHERE userid=\'"+te.player4userid+"\' AND teamid = \'"+teamId+"\'")

    }
    if(te.player2userid){
        player5classes = await request.query("SELECT * FROM [polemos_website].[dbo].[userTeam] WHERE userid=\'"+te.player5userid+"\' AND teamid = \'"+teamId+"\'")
    }
    return [{
        "total": te.total,
        "teamid": teamId,
        "locked": te.locked,
        "teamname":te.teamname,
        "members":[
            {"userid": te.player1userid, "username": te.player1username, "classname": te.player1classname, "point": te.player1point, "country": te.player1Country, "order": 1, "main": !player1classes ? null : player1classes.recordset[0].mainclass, "second": !player1classes ? null : player1classes.recordset[0].secondclass},
            {"userid": te.player2userid,"username": te.player2username, "classname": te.player2classname, "point": te.player2point, "country": te.player2Country, "order": 2, "main": !player2classes ? null : player2classes.recordset[0].mainclass, "second": !player2classes ? null : player2classes.recordset[0].secondclass},
            {"userid": te.player3userid,"username": te.player3username, "classname": te.player3classname, "point": te.player3point, "country": te.player3Country, "order": 3, "main": !player3classes ? null : player3classes.recordset[0].mainclass, "second": !player3classes ? null : player3classes.recordset[0].secondclass},
            {"userid": te.player4userid,"username": te.player4username, "classname": te.player4classname, "point": te.player4point, "country": te.player4Country, "order": 4, "main": !player4classes ? null : player4classes.recordset[0].mainclass, "second": !player4classes ? null : player4classes.recordset[0].secondclass},
            {"userid": te.player5userid,"username": te.player5username, "classname": te.player5classname, "point": te.player5point, "country": te.player5Country, "order": 5, "main": !player5classes ? null : player5classes.recordset[0].mainclass, "second": !player5classes ? null : player5classes.recordset[0].secondclass}
        ]
    }];
};


exports.leaveTeam = async (userData) => {
    var request = new sql.Request();
    const res = await request.query("SELECT teamname, ownerid, player2, player3, player4, player5 FROM [team] LEFT JOIN [user] AS player1 ON ownerid = player1.userid LEFT JOIN [user] AS player2 ON [team].player2 = player2.userid LEFT JOIN [user] AS player3 ON [team].player3 = player3.userid LEFT JOIN [user] AS player4 ON [team].player4 = player4.userid LEFT JOIN [user] AS player5 ON [team].player5 = player5.userid WHERE [team].teamid = \'"+userData.teamid+"\'",)
    if(res.recordset[0].ownerid === userData.userid){
        var request8 = new sql.Request();
        await request8.query("DELETE FROM [userTeam] WHERE teamid = \'"+userData.teamid+"\'",)
        var request2 = new sql.Request();
        await request2.query("DELETE FROM [participation] WHERE teamid = \'"+userData.teamid+"\'",)
        var request3 = new sql.Request();
        await request3.query("DELETE FROM [invitation] WHERE teamid = \'"+userData.teamid+"\'",)
        var request4 = new sql.Request();
        await request4.query("DELETE FROM [team] WHERE teamid = \'"+userData.teamid+"\'",)
    }
    else{
        var request2 = new sql.Request();
        await request2.query("UPDATE [team] SET player2 = NULL WHERE player2 = \'"+userData.userid+"\' AND teamid = \'"+userData.teamid+"\'",)
        var request3 = new sql.Request();
        await request3.query("UPDATE [team] SET player3 = NULL WHERE player3 = \'"+userData.userid+"\' AND teamid = \'"+userData.teamid+"\'",)
        var request4 = new sql.Request();
        await request4.query("UPDATE [team] SET player4 = NULL WHERE player4 = \'"+userData.userid+"\' AND teamid = \'"+userData.teamid+"\'",)
        var request5 = new sql.Request();
        await request5.query("UPDATE [team] SET player5 = NULL WHERE player5 = \'"+userData.userid+"\' AND teamid = \'"+userData.teamid+"\'",)

    }
    
    return res.recordset;
};

exports.inviteTeam = async (userData) => {
    var request0 = new sql.Request();
    const res = await request0.query("SELECT userid FROM [user] WHERE username=\'"+userData.username+"\'",)
    if (res.recordset[0]){
        const targetid = res.recordset[0].userid;
        var request5 = new sql.Request();
        const res5 = await request5.query("SELECT SUM(((CASE WHEN ownerid = \'"+targetid+"\' THEN 1 ELSE 0 END) + (CASE WHEN player2 = \'"+targetid+"\' THEN 1 ELSE 0 END) + (CASE WHEN player3 = \'"+targetid+"\' THEN 1 ELSE 0 END) + (CASE WHEN player4 = \'"+targetid+"\' THEN 1 ELSE 0 END) + (CASE WHEN player5 = \'"+targetid+"\' THEN 1 ELSE 0 END))) AS total FROM [team] WHERE teamid = \'"+userData.teamid+"\'",)
        if (res5.recordset[0].total === 0){
            const hour = new Date().getHours() + ":" + new Date().getMinutes();
            const date = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
            var request1 = new sql.Request();
            const res1 = await request1.query("INSERT INTO [polemos_website].[dbo].[invitation](ownerid, targetid, date, hour, teamid, [type], [order]) VALUES (\'"+userData.ownerid+"\', \'"+targetid+"\', \'"+date+"\', \'"+hour+"\', \'"+userData.teamid+"\', '4', \'"+userData.order+"\')",)
            return res1.recordset;
        }
        else{
            return '#203';
        }
    }
    else{
        return '#204';
    }
};

exports.checkTeamNumbers = async (userData) => {
    var request = new sql.Request();
    const res = await request.query("SELECT SUM(((CASE WHEN ownerid = \'"+userData.userid+"\' THEN 1 ELSE 0 END) + (CASE WHEN player2 = \'"+userData.userid+"\' THEN 1 ELSE 0 END) + (CASE WHEN player3 = \'"+userData.userid+"\' THEN 1 ELSE 0 END) + (CASE WHEN player4 = \'"+userData.userid+"\' THEN 1 ELSE 0 END) + (CASE WHEN player5 = \'"+userData.userid+"\' THEN 1 ELSE 0 END))) AS total FROM [team]",)
    if (5 > res.recordset[0].total){
        return res.recordset;  
    }
    else{
        return '#204';
    }
};

exports.getInvitationTeamUserList = async (teamId) => {
    var request = new sql.Request();
    const res = await request.query("SELECT invitationid,targetid, username, [order] FROM [invitation] JOIN [user] ON targetid = userid WHERE type = '4' AND teamid=\'"+teamId+"\' ORDER BY [order]");
    return res.recordset;
};

exports.acceptInvitation = async (userData) => {
    var request0 = new sql.Request();
    const res = await request0.query("SELECT [order], teamid FROM [invitation] WHERE invitationid=\'"+userData.invitationid+"\'",)
    if (res.recordset[0]){
        var request1 = new sql.Request();
        const res1 = await request1.query("DELETE FROM [invitation] WHERE targetid = \'"+userData.userid+"\' AND invitationid = \'"+userData.invitationid+"\'",)
        var request2 = new sql.Request();
        switch(res.recordset[0].order){
            case 2:
                await request2.query("UPDATE [team] SET player2 = \'"+userData.userid+"\' WHERE teamid = \'"+res.recordset[0].teamid+"\'")
                break;
            case 3:
                await request2.query("UPDATE [team] SET player3 = \'"+userData.userid+"\' WHERE teamid = \'"+res.recordset[0].teamid+"\'")
                break;
            case 4:
                await request2.query("UPDATE [team] SET player4 = \'"+userData.userid+"\' WHERE teamid = \'"+res.recordset[0].teamid+"\'")
                break;
            case 5:
                await request2.query("UPDATE [team] SET player5 = \'"+userData.userid+"\' WHERE teamid = \'"+res.recordset[0].teamid+"\'")
                break;
        }
        return res1.recordset;  
    }
    else{
        return '#204';
    }
};
exports.refuseInvitation = async (userData) => {
    var request1 = new sql.Request();
    const res1 = await request1.query("DELETE FROM [invitation] WHERE targetid = \'"+userData.userid+"\' AND invitationid = \'"+userData.invitationid+"\'",)
    return res1.recordset;
};

exports.cancelInvitationById = async (invitationidp) => {
    var request = new sql.Request();
    const res = await request.query("DELETE FROM [invitation] WHERE invitationid = \'"+invitationidp+"\'");
    return res.recordset;
};

exports.kickPlayer = async (userData) => {
    var request0 = new sql.Request();
    const res = await request0.query("SELECT userid FROM [user] WHERE username=\'"+userData.username+"\'",)
    if (res.recordset[0]){
        const target = res.recordset[0].userid;
        var request = new sql.Request();
        await request.query("UPDATE [team] SET player5 = NULL WHERE teamid = \'"+userData.teamid+"\' AND player5 = \'"+target+"\'")
        var request2 = new sql.Request();
        await request2.query("UPDATE [team] SET player4 = NULL WHERE teamid = \'"+userData.teamid+"\' AND player4 = \'"+target+"\'")
        var request3 = new sql.Request();
        await request3.query("UPDATE [team] SET player3 = NULL WHERE teamid = \'"+userData.teamid+"\' AND player3 = \'"+target+"\'")
        var request4 = new sql.Request();
        await request4.query("UPDATE [team] SET player2 = NULL WHERE teamid = \'"+userData.teamid+"\' AND player2 = \'"+target+"\'")
    }
    return res.recordset;
};

exports.getNotificationByUserId = async (userId) => {
    var request = new sql.Request();
    const res = await request.query("SELECT * FROM [notification] WHERE notificationreceiver=\'"+userId+"\'");
    return res.recordset;
};

exports.deleteNotificationById = async (notificationid) => {
    var request = new sql.Request();
    const res = await request.query("DELETE FROM [notification] WHERE notificationid = \'"+notificationid+"\'");
    return res.recordset;
};

exports.createNotification = async (userData) => {
    if(!userData.userId && userData.username){
        var request0 = new sql.Request();
        const res = await request0.query("SELECT userid FROM [user] WHERE username=\'"+userData.username+"\'",)
        if (res.recordset[0]){
            const userid = res.recordset[0].userid;
            var request = new sql.Request();
            const hour = new Date().getHours() + ":" + new Date().getMinutes();
            const date = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
            const res1 = await request.query("INSERT INTO [polemos_website].[dbo].[notification](notificationtype, notificationmessage, notificationdate, notificationreceiver, amount, notificationhour) VALUES (\'"+userData.type+"\', \'"+userData.message+"\', \'"+date+"\', \'"+userid+"\', \'"+0+"\', \'"+hour+"\')",)
            return res1;
        }
    }
    if(userData.userId){
        var request3 = new sql.Request();
        const hour = new Date().getHours() + ":" + new Date().getMinutes();
        const date = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
        const res3 = await request3.query("INSERT INTO [polemos_website].[dbo].[notification](notificationtype, notificationmessage, notificationdate, notificationreceiver, amount, notificationhour) VALUES (\'"+userData.type+"\', \'"+userData.message+"\', \'"+date+"\', \'"+userData.userId+"\', \'"+0+"\', \'"+hour+"\')",)
        return res3;
    }
}


exports.changeMain = async (userData) => {
    var request2 = new sql.Request();
    let classname = "Dragon";
    switch (userData.main){
        case 'Dragon':
            classname = 'Destructeur';
            break;
        case 'Destructeur':
            classname = 'Sentinelle';
            break;
        case 'Sentinelle':
            classname = 'Commando';
            break;
        case 'Commando':
            classname = 'Ombre';
            break;
        case 'Ombre':
            classname = 'Voltigeur';
            break;
        case 'Voltigeur':
            classname = 'Oracle';
            break;
        case 'Oracle':
            classname = 'Arcaniste';
            break;
        case 'Arcaniste':
            classname = 'Dragon';
            break;
    }
    await request2.query("UPDATE [userTeam] SET mainclass = \'"+classname+"\' WHERE teamid = \'"+userData.teamid+"\' AND userid = \'"+userData.userid+"\'")
   return request2;
};

exports.changeSecond = async (userData) => {
    var request2 = new sql.Request();
    let classname = "Dragon";
    switch (userData.second){
        case 'Dragon':
            classname = 'Destructeur';
            break;
        case 'Destructeur':
            classname = 'Sentinelle';
            break;
        case 'Sentinelle':
            classname = 'Commando';
            break;
        case 'Commando':
            classname = 'Ombre';
            break;
        case 'Ombre':
            classname = 'Voltigeur';
            break;
        case 'Voltigeur':
            classname = 'Oracle';
            break;
        case 'Oracle':
            classname = 'Arcaniste';
            break;
        case 'Arcaniste':
            classname = 'Dragon';
            break;
    }
    await request2.query("UPDATE [userTeam] SET secondclass = \'"+classname+"\' WHERE teamid = \'"+userData.teamid+"\' AND userid = \'"+userData.userid+"\'")
   return request2;
};


exports.changeTeamState = async (teamId) => {
    var request0 =  new sql.Request();
    const total = await request0.query("SELECT count(*) AS total FROM [participation] JOIN [tournament] ON [participation].tournamentid = [tournament].id JOIN [team] ON [team].teamid = [participation].teamid WHERE [tournament].status = 1 AND [team].teamid = \'"+teamId+"\'");
    if(total.recordset[0].total === 0){
        var request = new sql.Request();
        await request.query("UPDATE [team] SET locked = (CASE WHEN locked = '1' THEN 0 ELSE 1 END) WHERE teamid = \'"+teamId+"\'")
    }
   return request0.recordset[0];
};


exports.confirmAccount = async (userData) => {
    var request = new sql.Request();
    const total = await request.query("SELECT count(*) AS total FROM [user] WHERE userid=\'"+userData.userid+"\' AND code = \'"+userData.code+"\'");
    console.log("le code existe: "+ total.recordset[0].total + " et on donne ok à " + userData.userid)
    if(total.recordset[0].total === 1){
        var request2 = new sql.Request();
        await request2.query("UPDATE [user] SET code = \'OK\' WHERE userid = \'"+userData.userid+"\'")
        return '#101';
    }
    else{
        return '#201';
    }
};


exports.addToFile = async (userId) => {
    var request = new sql.Request();
    const res = await request.query("SELECT count(*) AS total FROM [matchmakingUser] WHERE userid=\'"+userId+"\'");
    if (res.recordset[0].total === 0){
        const hour = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() ;
        var request1 = new sql.Request();
        await request1.query("INSERT INTO [polemos_website].[dbo].[matchMakingUser](userid, modeid, hour) VALUES (\'"+userId+"\', '0', \'"+hour+"\')",)
    }
    return res.recordset[0];
};

exports.removeToFile = async (userId) => {
    var request = new sql.Request();
    const res = await request.query("DELETE FROM [polemos_website].[dbo].[matchMakingUser] WHERE userid=\'"+userId+"\'",)
    return res;
};

exports.rankedPlayerInformation = async (userId) => {
    var request = new sql.Request();
    const compteurFile = await request.query("SELECT count(*) as total FROM [matchmakingUser] WHERE userid=\'"+userId+"\'",)
    var request1 = new sql.Request();
    const compteurPart1 = await request1.query("SELECT matchid, count(*) as total FROM [matchmakingMatch] JOIN [matchmakingGroup] as host ON host = groupid LEFT JOIN [matchmakingGroupUser] as usergroupe ON host.groupid = usergroupe.groupid WHERE usergroupe.userid = \'"+userId+"\' AND status <= \'3\' OR usergroupe.userid = \'"+userId+"\' AND status = \'6\' GROUP BY matchid",)
    var request2 = new sql.Request();
    const compteurPart2 = await request2.query("SELECT matchid, count(*) as total FROM [matchmakingMatch] JOIN [matchmakingGroup] as against ON against = groupid LEFT JOIN [matchmakingGroupUser] as usergroupe ON against.groupid = usergroupe.groupid WHERE usergroupe.userid = \'"+userId+"\' AND status <= \'3\' OR usergroupe.userid = \'"+userId+"\' AND status = \'6\' GROUP BY matchid",)
    let compteur1 = compteurPart1.recordset.length === 0 ? 0 : compteurPart1.recordset[0].total;
    let compteur2 = compteurPart2.recordset.length === 0 ? 0 : compteurPart2.recordset[0].total;
    const compteurMatch = compteur1 + compteur2;
    const enMatch = compteurMatch  === 1 ? true: false;
    if (enMatch){
        const matchid = compteurPart1.recordset[0] ? compteurPart1.recordset[0].matchid : compteurPart2.recordset[0].matchid;
        var request3 = new sql.Request();
        const hostteam = await request3.query("SELECT [usergroupe].userid, username, [usergroupe].classname, [usergroupe].charname, country FROM [matchmakingMatch] JOIN [matchmakingGroup] as host ON host = groupid LEFT JOIN [matchmakingGroupUser] as usergroupe ON host.groupid = usergroupe.groupid JOIN [user] as usern on usern.userid = usergroupe.userid WHERE matchid = \'"+matchid+"\'",)
        var request4 = new sql.Request();
        const againstteam = await request4.query("SELECT [usergroupe].userid, username, [usergroupe].classname, [usergroupe].charname, country FROM [matchmakingMatch] JOIN [matchmakingGroup] as against ON against = groupid LEFT JOIN [matchmakingGroupUser] as usergroupe ON against.groupid = usergroupe.groupid JOIN [user] as usern on usern.userid = usergroupe.userid WHERE matchid = \'"+matchid+"\'",)
        var request5 = new sql.Request();
        const matchInfoReq = await request5.query("SELECT * FROM [matchmakingMatch] WHERE matchid = \'"+matchid+"\'",)
        const matchInfo = matchInfoReq.recordset[0];
        const splittedDate = matchInfo.date.split("/");
        const yearPaste = (splittedDate[0]).toString() + (splittedDate[1] < 10 ? '0' + splittedDate[1] : splittedDate[1]).toString() + (splittedDate[2] < 10 ? '0' + splittedDate[2] : splittedDate[2]).toString();
        const tablenor = "TB_" + yearPaste;
        const tablesub = "TB_"+ yearPaste + "_Sub";
        const roomguidRequest = new sql.Request();
        const nomsalle = "" + hostteam.recordset[0].username.toLowerCase() +  matchid;
        const roomguid = await roomguidRequest.query("SELECT MemberKey as roomguido, Message1 as roomname FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE OrderType = \'2600\' AND ActionType = \'2\' AND Message1 = \'"+ nomsalle + "\'")
        const guidRoom = roomguid.recordset.length > 0 ? roomguid.recordset[0].roomguido : null;
        if(guidRoom){
            const playersInRoomReq = new sql.Request();
            const playersInRoom = await playersInRoomReq.query("SELECT ID, Name, MemberKey, CharacterKey FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE Message3 = \'"+ guidRoom +"\' AND OrderType = \'1100\' AND ActionType=\'9\'")
            const roundStartedReq = new sql.Request();
            const roundStarted = await roundStartedReq.query("SELECT COUNT(*) as total FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE MemberKey = \'"+ guidRoom +"\' AND OrderType = \'2700\' AND ActionType=\'2\'")
            const roundEndedReq = new sql.Request();
            const roundEnded = await roundEndedReq.query("SELECT COUNT(*) as total FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE MemberKey = \'"+ guidRoom +"\' AND OrderType = \'2700\' AND ActionType=\'3\'")
            const killHistoryReq = new sql.Request();
            const killHistory = await killHistoryReq.query("SELECT Message1 AS \'killer\', Name as \'dead\', MemberKey, CharacterKey FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE Message3 = \'"+ guidRoom +"\' AND OrderType = \'800\' AND ActionType=\'7\'");
            const matchGameScoreReq = new sql.Request();
            const matchGameScore = await matchGameScoreReq.query("SELECT iValue2 as team1, iValue3 as team2 FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE MemberKey = \'"+ guidRoom +"\' AND OrderType = \'2700\' AND ActionType=\'3\'");
            const deadByPlayersReq = new sql.Request();
            const deadByPlayers = await deadByPlayersReq.query("SELECT Name as \'dead\', COUNT(*) as total FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE Message3 = \'"+ guidRoom +"\' AND OrderType = \'800\' AND ActionType=\'7\' GROUP BY Name");
            const killByPlayersReq = new sql.Request();
            const killByPlayers = await killByPlayersReq.query("SELECT Message1 AS \'killer\', COUNT(*) as total FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE Message3 = \'"+ guidRoom +"\' AND OrderType = \'800\' AND ActionType=\'7\' GROUP BY Message1");
            const endedMatchReq = new sql.Request();
            const endedMatch = await endedMatchReq.query("SELECT count(*) AS \'total\' FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE MemberKey = \'"+ guidRoom +"\' AND OrderType = \'2600\' AND ActionType=\'3\'");
            const matchIsEnded = endedMatch.recordset[0].total === 0 ? false: true;    
            const getVoter = new sql.Request();
            const getVote = await getVoter.query("SELECT hour, player1.username as playername, host1.username as hostname, host, player, hostid, playerid, status FROM [votereason] as vote JOIN [user] AS host1 ON host1.userid = vote.hostid JOIN [user] AS player1 ON player1.userid = vote.playerid WHERE matchid = \'" + matchid + "\'");
            return {
                "enFile": compteurFile.recordset[0].total === 1 ? true: false,
                "enMatch": true,
                "matchid": matchid,
                "passroom": matchInfo.passroom,
                "hostname": matchInfo.hostname,
                "map": matchInfo.map,
                "status": matchInfo.status,
                "hour": matchInfo.hour,
                "date": matchInfo.date,
                "host": hostteam.recordset,
                "hostid": matchInfo.host,
                "againstid": matchInfo.against,
                "against": againstteam.recordset,
                "matchGame" : {
                    "roomname" : roomguid.recordset[0].roomname,
                    "roomguid" : roomguid.recordset[0].roomguido,
                    "playersInRoom" : playersInRoom.recordset,
                    "roundStarted" : roundStarted.recordset[0].total,
                    "roundEnded" : roundEnded.recordset[0].total,
                    "killHistory" : killHistory.recordset,
                    "killByPlayers" : killByPlayers.recordset,
                    "deadByPlayers" : deadByPlayers.recordset,
                    "score" : matchGameScore.recordset,
                    "ended" : matchIsEnded
                },
                "vote" : getVote.recordset.length > 0 ? {
                    "host": getVote.recordset[0].host,
                    "playername": getVote.recordset[0].playername,
                    "hostname" : getVote.recordset[0].hostname,
                    "playerid" : getVote.recordset[0].playerid,
                    "hostid" : getVote.recordset[0].hostid,
                    "hour" : getVote.recordset[0].hour,
                    "status": getVote.recordset[0].status
                } : null
            }         
        }
        else{
            return {
                "enFile": compteurFile.recordset[0].total === 1 ? true: false,
                "enMatch": true,
                "matchid": matchid,
                "passroom": matchInfo.passroom,
                "hostname": matchInfo.hostname,
                "map": matchInfo.map,
                "status": matchInfo.status,
                "hour": matchInfo.hour,
                "date": matchInfo.date,
                "host": hostteam.recordset,
                "hostid": matchInfo.host,
                "againstid": matchInfo.against,
                "against": againstteam.recordset,
                "matchGame" : {
                    "roomname" : null,
                    "roomguid" : null,
                }
            }
        }


    }
    return {"enFile": compteurFile.recordset[0].total === 1 ? true: false,
    "enMatch": false}
};

exports.chooseCharMatch = async (userData) => {
    var requestChar = new sql.Request();
    const total = await requestChar.query("UPDATE [matchmakingGroupUser] SET classname = \'"+userData.Class+"\', charname = \'"+userData.Name+"\' WHERE userid = \'"+userData.userid+"\' AND groupid =\'"+userData.groupid+"\'");

};


exports.polemospass = async (userid) => {
    var request = new sql.Request();
    const queryMission = await request.query("SELECT * FROM [passMission]");
    const missions = queryMission.recordset;

    var requestRew = new sql.Request();
    const queryRewards = await requestRew.query("SELECT * FROM [passRewards] ORDER BY requiredExp");
    const rewards = queryRewards.recordset;

    var requestUs = new sql.Request();
    const userQue = await requestUs.query("SELECT point, exp, passQuest, vip FROM [user] WHERE userid = \'"+userid+"\'");
    const user = userQue.recordset[0];

    var requestQuest = new sql.Request();
    const userQuestPass = await requestQuest.query("SELECT * FROM [passMission] WHERE id = \'"+ user.passQuest +"\'");
    const missionUser = userQuestPass.recordset[0];

    var requestQuest1 = new sql.Request();
    const userQuestPass1 = await requestQuest1.query("SELECT * FROM [passMission] WHERE id = \'"+ missionUser.next +"\'");
    const missionUser2 = userQuestPass1.recordset[0];

    return {
        "missions": missions,
        "rewards": rewards,
        "experience" : user.exp,
        "point" : user.point,
        "quest" : missionUser,
        "nextquest" : missionUser2,
        "vip": user.vip === 1 ? true: false
    };
};

exports.paiement = async (userData) => {
    var prepareUser = new sql.Request();
    const prepareguid = await prepareUser.query("SELECT CharacterID FROM DR2_User.dbo.TB_CharacterBasic WHERE Name=\'" + userData.custom + "\'")
    const guid = prepareguid.recordset[0].CharacterID;
    const today = new Date();
    const date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
    if(guid){
        var prepareGift1r = new sql.Request();
        await prepareGift1r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST(\'"+ guid +"\' AS UNIQUEIDENTIFIER),'Polemos',\'"+ date +"\',6453,'Achat Boutique',1,4, \'" + userData.virtual_currency + "\')")
        var prepareGift2r = new sql.Request();
        await prepareGift2r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST('492a8555-f0db-41c2-a376-f5cfbc9b8828' AS UNIQUEIDENTIFIER),\'"+userData.custom+"\', \'"+ date +"\' ,6453,'Achat Boutique',0,4, \'"+ userData.virtual_currency +"\')")
        var addHistoryr = new sql.Request();
        await addHistoryr.query("INSERT INTO [historyCash] VALUES (\'"+userData.virtual_currency + "\', \'"+userData.custom + "\', \'"+ date + "\')");
        return "#100";
    }
    return "#200"
};

exports.planning = async () => {
    var prepareUser = new sql.Request();
    const prepareguid = await prepareUser.query("SELECT * FROM [planning]");
    return prepareguid.recordset[0];
};


// exports.donnezNousTous = async () => {
//     const today = new Date();
//     const date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
//     var listePossibles = new sql.Request();
//     const possiblesUsers = await listePossibles.query(`
//     SELECT DISTINCT(o.username), o.ipadress
//     FROM [polemos_website].[dbo].[user] o
//     INNER JOIN (
//         SELECT ipadress, COUNT(*) AS dupeCount
//         FROM [polemos_website].[dbo].[user]
//         GROUP BY ipadress
//         HAVING COUNT(*) = 1
//     ) oc on o.ipadress = oc.ipadress
//     JOIN [DR2_Member].[dbo].[Member] AS mem ON mem.ID COLLATE DATABASE_DEFAULT = o.username COLLATE DATABASE_DEFAULT
//     JOIN [DR2_User].[dbo].[TB_CharacterBasic] AS char ON char.MemberID = mem.MemberKey
//     JOIN [DR2_User].[dbo].[TB_UserCharacter_Extern] ext ON ext.CharacterID = char.CharacterID
//     INNER JOIN (
//         SELECT Users, COUNT(DISTINCT(HardwareId)) AS hardcount
//         FROM [DR2_Member].[dbo].[UsersHardwarePC]
//         GROUP BY Users
//         HAVING COUNT(DISTINCT(HardwareId)) = 1
//     ) pc on UPPER(o.username) COLLATE DATABASE_DEFAULT = pc.Users COLLATE DATABASE_DEFAULT
//     WHERE (ext.PvP_Draw_Exercise + ext.PvP_Lose_Exercise + ext.PvP_Win_Exercise) > 9
//     ORDER BY o.username
//     `);
//     await Promise.all(possiblesUsers.recordset.map( async (compte) => {
//         var verifHardwareR = new sql.Request();
//         const joueursr = await verifHardwareR.query(`
//         SELECT char2.Name, ext2.CharacterID, (ext2.PvP_Draw_Exercise + ext2.PvP_Lose_Exercise + ext2.PvP_Win_Exercise) as total
//         FROM (
//             SELECT mem.ID, MAX(ext.PvP_Draw_Exercise + ext.PvP_Lose_Exercise + ext.PvP_Win_Exercise) as total
//                 FROM [DR2_Member].[dbo].[Member] AS mem 
//             JOIN [DR2_User].[dbo].[TB_CharacterBasic] AS char ON char.MemberID = mem.MemberKey
//             JOIN [DR2_User].[dbo].[TB_UserCharacter_Extern] ext ON ext.CharacterID = char.CharacterID
//             WHERE mem.ID = '`+compte.username+`'
//             GROUP BY mem.ID ) as m
//         INNER JOIN [DR2_Member].[dbo].[Member] AS mem2 ON mem2.ID = m.ID
//         JOIN [DR2_User].[dbo].[TB_CharacterBasic] AS char2 ON char2.MemberID = mem2.MemberKey
//         JOIN [DR2_User].[dbo].[TB_UserCharacter_Extern] AS ext2 ON ext2.CharacterID = char2.CharacterID
//         AND (ext2.PvP_Draw_Exercise + ext2.PvP_Lose_Exercise + ext2.PvP_Win_Exercise) = m.total
//         `);
//         console.log("> " + joueursr.recordset[0].Name);
//         var computerReq = new sql.Request();
//         const computerNum = await computerReq.query(`
//         SELECT Users, COUNT(DISTINCT(HardwareId)) as total
//         FROM [DR2_Member].[dbo].[UsersHardwarePC]
//         WHERE Users = '`+ compte.username +`'
//         GROUP BY Users`);
//         console.log("Ordinateur: " + computerNum.recordset[0].total);
//         console.log(computerNum.recordset[0].total);
//         if (parseInt(computerNum.recordset[0].total) === 1 ){
//             const charid =  joueursr.recordset[0].CharacterID;
//             if(charid){
//                 if(compte.username === "Tiarra"){
//                     var prepareGift1r = new sql.Request();
//                     await prepareGift1r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST(\'"+ charid +"\' AS UNIQUEIDENTIFIER),'Polemos',\'"+ date +"\',6453,'Evenement: Ouverture Polemos',1,4, \'7\')");
//                     var prepareGift2r = new sql.Request();
//                     await prepareGift2r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST('492a8555-f0db-41c2-a376-f5cfbc9b8828' AS UNIQUEIDENTIFIER),\'"+joueursr.recordset[0].Name+"\', \'"+ date +"\' ,6453,'Evenement: Ouverture Polemos',0,4, \'7\')");    
//                     console.log("Cadeau distribué");
//                     var request0 = new sql.Request();
//                     const res = await request0.query("SELECT userid FROM [user] WHERE username=\'"+ compte.username +"\'",)
//                     if (res.recordset[0]){
//                         const userid = res.recordset[0].userid;
//                         const hour = new Date().getHours() + ":" + new Date().getMinutes();
//                         const date = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
//                         var request = new sql.Request();
//                         const res1 = await request.query("INSERT INTO [polemos_website].[dbo].[notification](notificationtype, notificationmessage, notificationdate, notificationreceiver, amount, notificationhour) VALUES (\'5\', \'(Gift) 20 woodies coin received(fixed)\', \'"+date+"\', \'"+userid+"\', \'"+0+"\', \'"+hour+"\')",)
//                         return res1;
//                     }
//                 }
//             }
//         }
//     }))
//     return "#100";
// };

// exports.donnezNousTous = async () => {
//     const today = new Date();
//     const date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
//     var listePossibles = new sql.Request();
//     const possiblesUsers = await listePossibles.query(`
//     SELECT DISTINCT(o.username), o.ipadress
//     FROM [polemos_website].[dbo].[user] o
//     INNER JOIN (
//         SELECT ipadress, COUNT(*) AS dupeCount
//         FROM [polemos_website].[dbo].[user]
//         GROUP BY ipadress
//         HAVING COUNT(*) = 1
//     ) oc on o.ipadress = oc.ipadress
//     JOIN [DR2_Member].[dbo].[Member] AS mem ON mem.ID COLLATE DATABASE_DEFAULT = o.username COLLATE DATABASE_DEFAULT
//     JOIN [DR2_User].[dbo].[TB_CharacterBasic] AS char ON char.MemberID = mem.MemberKey
//     JOIN [DR2_User].[dbo].[TB_UserCharacter_Extern] ext ON ext.CharacterID = char.CharacterID
//     INNER JOIN (
//         SELECT Users, COUNT(DISTINCT(HardwareId)) AS hardcount
//         FROM [DR2_Member].[dbo].[UsersHardwarePC]
//         GROUP BY Users
//         HAVING COUNT(DISTINCT(HardwareId)) = 1
//     ) pc on UPPER(o.username) COLLATE DATABASE_DEFAULT = pc.Users COLLATE DATABASE_DEFAULT
//     ORDER BY o.username
//     `);
//     await Promise.all(possiblesUsers.recordset.map( async (compte) => {
//         var verifHardwareR = new sql.Request();
//         const joueursr = await verifHardwareR.query(`
//         SELECT char2.Name, ext2.CharacterID, (ext2.PvP_Draw_Exercise + ext2.PvP_Lose_Exercise + ext2.PvP_Win_Exercise) as total
//         FROM (
//             SELECT mem.ID, MAX(ext.PvP_Draw_Exercise + ext.PvP_Lose_Exercise + ext.PvP_Win_Exercise) as total
//                 FROM [DR2_Member].[dbo].[Member] AS mem 
//             JOIN [DR2_User].[dbo].[TB_CharacterBasic] AS char ON char.MemberID = mem.MemberKey
//             JOIN [DR2_User].[dbo].[TB_UserCharacter_Extern] ext ON ext.CharacterID = char.CharacterID
//             WHERE mem.ID = '`+compte.username+`'
//             GROUP BY mem.ID ) as m
//         INNER JOIN [DR2_Member].[dbo].[Member] AS mem2 ON mem2.ID = m.ID
//         JOIN [DR2_User].[dbo].[TB_CharacterBasic] AS char2 ON char2.MemberID = mem2.MemberKey
//         JOIN [DR2_User].[dbo].[TB_UserCharacter_Extern] AS ext2 ON ext2.CharacterID = char2.CharacterID
//         AND (ext2.PvP_Draw_Exercise + ext2.PvP_Lose_Exercise + ext2.PvP_Win_Exercise) = m.total
//         `);
//         console.log("> " + joueursr.recordset[0].Name);
//         var computerReq = new sql.Request();
//         const computerNum = await computerReq.query(`
//         SELECT Users, COUNT(DISTINCT(HardwareId)) as total
//         FROM [DR2_Member].[dbo].[UsersHardwarePC]
//         WHERE Users = '`+ compte.username +`'
//         GROUP BY Users`);
//         console.log("Ordinateur: " + computerNum.recordset[0].total);
//         console.log(computerNum.recordset[0].total);
//         if (parseInt(computerNum.recordset[0].total) === 1 ){
//             const charid =  joueursr.recordset[0].CharacterID;
//             if(charid){
//                 if(compte.username === "Patakrep" || compte.username === "Patapizza"){
//                     var prepareGift1r = new sql.Request();
//                     await prepareGift1r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST(\'"+ charid +"\' AS UNIQUEIDENTIFIER),'Polemos',\'"+ date +"\',6453,'Evenement: Ouverture Polemos',1,4, \'60\')");
//                     var prepareGift2r = new sql.Request();
//                     await prepareGift2r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST('492a8555-f0db-41c2-a376-f5cfbc9b8828' AS UNIQUEIDENTIFIER),\'"+joueursr.recordset[0].Name+"\', \'"+ date +"\' ,6453,'Evenement: Ouverture Polemos',0,4, \'60\')");    
//                     console.log("Cadeau distribué");
//                     var request0 = new sql.Request();
//                     const res = await request0.query("SELECT userid FROM [user] WHERE username=\'"+ compte.username +"\'",)
//                     if (res.recordset[0]){
//                         const userid = res.recordset[0].userid;
//                         const hour = new Date().getHours() + ":" + new Date().getMinutes();
//                         const date = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear();
//                         var request = new sql.Request();
//                         const res1 = await request.query("INSERT INTO [polemos_website].[dbo].[notification](notificationtype, notificationmessage, notificationdate, notificationreceiver, amount, notificationhour) VALUES (\'5\', \'(Gift) 20 woodies coin received(fixed)\', \'"+date+"\', \'"+userid+"\', \'"+0+"\', \'"+hour+"\')",)
//                         return res1;
//                     }
//                 }
//             }
//         }
//     }))
//     return "#100";
// };

// Ajoutez des items dans la table
// exports.donnezNousTous = async () => {
//     const items = [ 78000470, 78000480, 78000490, 78000500,78000510, 78000520, 78000530, 78000540, 78000550, 78000551,78000560, 78000570, 78000580,78000590, 78000600,78000620,78000670,78000680, 7800069,78000700,78000710,78000720,78000730,78000740, 78000750,78000760,78000770, 78000780, 78000790,78200010,78200020, 78200030,78200040,78200060,78200070,78200080,78200090,78200100,78200110,78200310,78200320,78200330,78200340,78200350,78200360,78200720,78200730,78200740,78200750,78200780,78200790,78200800,78200810, 78200820,78200830,78200840,78200850,78200860,78200870,78200880,78200890,78200900,78200910,78200920,78200930,78200940,78200950,78200960,78200970,78200980, 78200990,78201050,78201060,78201070,78201080,78201100, 78201110,78201120,78201130,78201140,78201420,78201430,78201440,78201450,78201460,78201470,78201480,78201490,78201500,78400090,78400100,78400190,78400200,78400210,78400220,78400230,78400240,78400250,78400260,78400270,78400280,78400330,78400380,78400400,78400410,78400420,78400430,78400440,78400450,78400760,78400770,78400780,78400790,78400800,78400810,78400820,78400830,80201000,80201010,80201020,80201030,80201040,80201050,80501000,80501010,80501020,80501030,80501040,80501050,80801000,80801010,80801020,80801030,80801040,80801050,81100010,90100010,90100050,90100060,90100070,90100080,93000010,93000020,93000030,93000040,93000050,93000060,93000070,93000080,93000090,93000100,93000110,93000120,93000130,93000140,93000150,93000160,93000170,93000180,93000190,93000200,93000210,93000220,93000230,93000240,93000250,93000260,93000270,93000280,93000290,93000300,93000310,93000320,93000330,93000340,93000350,93000360,93000370,93000380,93000390,93000400,93000410,93000420,93000430,93000440,93000450,93000460,93000470,93000480,93000490,93000500,93000510,93000520,93000530,93000540,93000550,93000560,93000570,93000580,93000590,93000600,93000610,93000620,93000630,93000640,93000650,93000660,93000670,93000680,93000690,93000700,93000710,93000720,93000730,93000740,93000750,93000760,93000770,93000780,93000790,93000800,93000810,93000820,93000830,93000840,93000850,93000860,93000870,93000880,93000890,93000900,93000910,93000920,93000930,93000940,93000950,93000960,93000970,93000980,93000990,93001000,93001010,93001100,93001110,93001120,93001130,93001140,93001150,93001160,93001170,93001180,93001190,93001200,93001210,93001220,93001230,93001240,93001300,93001310,93001320,93001330,93001340,93001520,
//         93001530,93001540,93001550,93001560,93001570,93001750,93001760,93001770,93001780,93001790,93001800,93001810,93001820,93001830,93001840,93001850,93001860,93001870,93001880,93002740,93002750,93002760,93002770,93002780,93002790,93002800,93002810,93002820,93002830,93002840,93002850,93002860,93002870,93002880,93002890,93002900,93002910,93002920,93002930,93002940,93002950,93002960,93002970,93002980,93002990,93003000,93003010,93003020,93003030,93003040,93003050,93003060,93003070,93003080,93003090,93003100,93003110,93003120,93003130,93003140,93003150,93003160,93003170,93003180,93003190,93003200,93003210,93003220,93003230,93003240,93003250,93003260,93003270,93003280,93003290,93003300,93003310,93003320,93003330,93003340,93003350,93003360,93003370,93003380,93003390,93003400,93003410,93003420,93003430,93003440,93003450,93003460,93003470,93003480,93003490,93003500,93003510,93003520,93003530,93003540,93003550,93003560,93003570,93003580,93003590,93003600,93003610,93003620,93003630,93003640,93003650,93003660,93003670,93003680,93003690,93004760,93004770,93004780,93004790,93004850,93004860,93004870,93004880,93004890,93004940,93004950,93004960,93004970,93004980,93005030,93005040,93005050,93005060,93005070,93005080,93005160,93005170,93005180,93005190,93005200,93005210,93005220,93005230,93005320,93005330,93005340,93005350,93005360,93005370,93005380,93005390,93005400,93005410,93005420,93005430,93006960,93006970,93006980,93006990,93007000,93007490,93007500,93007510,93007520,93007530,93007540,93007660,93007670,93007680,93007690,93007700,93007710,93007720,93007730,93007740,93007750,93007760,93007770,93007780,93007790,93007800,93007810,93007820,93007830,93007840,93007850,93007860,93007890,93007900,93007910,93007920,93007930,93007980,93007990,93008000,93008010,93008020,93008030,93008200,93008210,93008220,93008230,93008240,93008250,93008260,93008270,93008280,93008290,93008300,93008310,93008320,93008330,94000010,94000020,94000030,94000040,94000050,94000060,94000070,94000080,94000100,94000110,94000120,94000130,94000140,94000150,94000160,94000170,94000180,94000190,94000200,94000210,94000220,94000230,94000240,94000250,94000260,94000270,94000280,94000290,94000300,94000310,94000320,94000330,94000340,94000350,94000360,94000370,94000380,94000390,94000400,94000410,94000420,94000430,94000440,94000450,94000870,94000880,94000890,94000900,94000910,94000970,94000980,94000990,94001000,94001010,94001020,
//         94001030,94001040,94001050,94001060,94001070,94001080,94001090,94001100,94001110,94001120,94001130,94001140,94001150,94001160,94001170,94001180,94001190,94001200,94001210,94001220,94001230,94001240,94001250,94001260,94001270,94001280,94001290,94001310,94001320,94001330,94001340,94001350,94001360,94001370,94001380,
//         94001390,94001400,94001410,94001420,94001430,94001440,94001450,94001460,94001470,94001480,94001490,94001500,9400151098005500,98006480,98006490,98006500,98006510,98006520,98006540,98006550,98006560,98006570,98006730,98006740,98006750,98006760,98006770,98006780,98006790,98006800,98006810,98006820,98006830,98006840,98006850,98006860,98006870,98007050,99627210,99627220,99627230,99627240,99627290,99627310,99627320,99627330,99627340,99627390,99627410,99627420,99627430,99627440,99627490,99629150,99629160,99629170,99629180,99629190,99629200,99700200,99700210,99700220,99700230,99700240,99700250,99700260,99700270,99700280,99804350,99804360,99804370,99804380,99804390,99804400,181100010,181100020,181100030,181100040,181100050,181100060,181100070,181200010,181200020,181200030,181200040,181200050,181200060,181200070,181200080,181300010,181300020,181300030,181300040,181300050,181300060,181300070,181300080,181400010,181400020,181400030,181400040,181400050,181400060,181400070,181400080,181700010,181700020,181700030,181700050,181700060,181700070,181700080,181800010,181800020,181800030,181800040,181800050,181800060,181800070,194001010,194001020,194001030,194001040,194001110,194001120,194001130,194001140,194001210,194001220,194001230,194001240,194002010,194002020,194002030,194002040,194002050,194002110,194002120,194002130,194002140,194002150,194002210,194002220,194002230,194002240,194002250,194003010,194003020,194003030,194003040,194004210,194004220,194004230,194004240,194004250,280201000,280201010,290000010,290000020,290000030,290000040,290000050,290000060,290000070,290000080,290000090,290000100,290000110,290000120,290000130,290000140,290000150,290000160,290000170,290000180,290000190,290000200,290000210,290000220,290000230,290000240,290000250,290000260,290000270,290000280,290000290,290000300,290000310,290000320,290000330,290000340,290000350,290000360,290000370,290000380,290000390,290000400,290000410,290000420,290000430,290000440,290000450,290000460,290000470,290000480,290000490,290000500,290000510,290000520,290000530,290000540,290000550,290000560,290000570,290000580,290000590,290000600,290000610,290000620,290000630,290000640,290000650,290000660,290000670,290000680,290000690,,290000700,290000710,290000720,290000730,290000740,290000750,290000760,290000770,290000780,290000790,290000800,290000810,290000820,290000830,290000840,290000850,
//         290000860,290000870,290000880,290000890,290000900,290000910,290000920,290000930,290000940,290000950,290000960,290001450,290001460,290001470,290001480,290001490,290001500,290001510,290001520,290001530,290001540,290001550,290001560,290001570,290001580,290001590,290001600,290001610,290001620,290001630,290001640,290001650,290001660,290001670,290001680,290001690,290001700,290001710,290001720,290001730,290001740,290001750,290001760,290001770,290001780,290001790,290001800,290001810,290001820,290001830,290001840,290001850,290001860,290001870,290001880,290001890,290001900,290001910,290001920,290001930,290001940,290001950,290001960,290001970,290001980,290001990,290002000,290002010,290002020,290002030,290002040,290002050,290002060,290002070,290002080,290002090,290002220,290002230,290002240,290002250,290002260,290002270,290002280,290002290,290002300,290002530,290002540,290002550,290002560,290002570,290002580,290002590,290002600,290002610,290002620,290002630,290002640,290002720,290002730,290002740,290002750,290002760,290002770,290002780,290002790,290002800,290002810,290002820,290002830,290002840,290002850,290002860,290002870,290002880,290002890,290002900,290002910,290002920,290002930,290002940,290002950,290002960,290003350,290003360,290003370,290003380,290003390,290003400,290003410,290003420,290003430,290003440,290003450,290003460,290003470,290003480,290003490,290003500,290003510,290003520,290003530,290003540,290003550,290003560,290003570,290003580,290003590,290003600,290003610,290003620,290003630,290003640,290003650,290003820,290003830,290003840,290003850,290003860,290003870,290003880,290003890,290003900,290003910,290003920,290003930,290003940,290003950,290003960,290003970,290003980,290003990,290004000,290004010,290004020,290004030,290004040,290004050,290004060,290004070,290004080,290004090,290004100,291302060,291302070,291302080,291302090,291302100,291302110,291302120,291302130,291302140,291302750,291302760,291302770,291302780,291302790,291302800,291302810,291302820,291302830,291302840,291303150,291303160,291303170,291303180,291303190,291303200,291303210,291303220,291303230,291303240,291303250,291303260,291303270,291303280,291303290,291303300,291303310,291303320,291303330,291303340,291303350,291303360,291303370,291303380,291303390,291303400,291303410,291303420,291303430,291303440,291303450,291303460,291303470,291303560,291303570,291303580,291303590,291303600,291303610,291303710,
//         291303880,291303890,291303920,291303930,298005510,298005519,298006430,299002460,299002470,299002480,
//         299002490,299002500,299002560,299002570,299002580,299002590,299002600,299002660,299002670,299002680,299002690,299002700,299002760,299002770,299002780,299002790,299002800,299002860,299002870,299002880,299002890,299002900,299002960,299002970,299002980,299002990,299003000,299003060,299003070,299003080,299003090,299003100,299003100,299003170,299003180,299003190,299003200,299003210,299003220,299012410,299012420,299012430,299012440,299012450,299601740,299601750,299601760,299601770,299601780,299601790,299601800,299601810,299601820,299601830,299601840,299601850,299601860,299601870,299601880,299601890,299601900,299601910,299601920,299601930,299601940,299601950,299601960,299601970,299601980,299601990,299602000,299602010,299602020,299602030,299602040,299602050,299602060,299602070,299602080,299602090,299602100,299602110,299602130,299602140,299602150,299602160,299602170,299602180,299602190,299602200,299602210,299602220,299602230,299602240,299602250,299602260,299602270,299602280,299602290,299602300,299602310,299602320,299602330,299602340,299602350,299602360,299602370,299602380,299602390,299602400,299602410,299602420,299602430,299602450,299602460,299602470,299602480,299602490,299602500,299602510,299602520,299602560,299602570,299602580,   299602590,299602600,299602650,299602660,299603130,299603140,299603150,299603160,299603170,299603180,299603190,299603200,299603210,299603220,299603230,299603240,299603250,299603260,299603270,299603280,299603290,299603300,299603310,299603320,299603330,299603340,299603350,299603360,299603370,299603380,299603390,299603400,299603410,299603420,299603430,299603440,299603450,299603460,299603470,299604590,299604600,299604610,299604620,299604630,299604640,299604650,299604820,299604830,299604840,299604850,299604860,299604970,299604980,299604990,299605000,299605010,299605170,299605180,299605190,299605200,299605210,299606270,299607240,299607250,299607260,299607270,299607280,393003990,393004000,393004010,393004020,393004030,393004040,399629390,399629400,399629410,399629420,399629430,399629440,399629450,399629460,399629470,399629480,399629490,399629500,399629510,399629520,399629530,399629540,399629550,399629560,399629570,399629580,399629590,399629600,399629610,399629620,399630240,399630250,399630260,399630270,399630280,399630290,399630300,399630310,399630320,399630330,399630340,399630350,610000010,610000020,610000030,610000040,610000050,610000060,610000070,610000080,610000110,610000120,610000130,610000140,610000150,610000160,610000170,610000180,610000210,
//         610000220,610000230,610000240,610000250,610000260,610000270,610000280,610000310,610000320,610000330,610000340,610000350,610000360,610000370,610000380,399630760,399630770,399630780,399630790,399630800,399630810,399630820,493003700,493003710,493003720,493003730,493003740,121029230,121029240,121029250,121029260,121029270,121029280,121029290,121029300,121029310,121029320,121029330,121029340,994001470,994001460,994001450,994001480,994001520,994001490,994001500,994001510,693912010, 693912020, 693912030, 693912040, 693912050, 693912060, 693912070, 693912080, 610500020, 610500030, 610500040, 610500050, 610500060, 610500070, 610500080, 610400080, 610400070, 610400060, 610400050, 610400040, 610400030, 610400020, 610400010, 610100010, 610100020, 610100030, 610100040, 610100050, 610100060, 610100070, 610100080, 994001910, 994001900, 994001890, 994001880, 994001920, 994001850, 994001860, 994001870, 994001830, 994001820, 994001810, 994001800, 994001840, 994001770, 994001780, 994001790,93001020,93001030,93001040,93001050,93001350,93001360,93001370,93001380,93001440,93001450,93001460,93001470,93001680,93001690,93001700,93001890,93001900,93001910,93001920,93001930,93001940,93001950,93001960,93001970,93001980,93001990,93002000,93002010,93002020,93002030,93002040,93002050,93002060,93002070,93002080,93002090,93002100,93002110,93002120,93002130,93002380,93002390,93002400,93002410,93002420,93002430,93002440,93002450,93002460,93002470,93002480,93004160,93004170,93004180,93004200,93004210,93004220,93004230,93004240,93004250,93004280,93004290,93004300,93004310,93004320,93004330,93004340,93005130,93005140,93005150,93005240,93005250,93005260,93005270,93007550,93007560,93007600,93007610,99627510,99627520,99627530,99627540,99627590,99629420,99629430,99629440,99629450,99629460,99629470,194004010,194004020,194004030,194004040,194004050,290002100,290002110,290002120,290002130,290002140,290002150,290002160,290002170,290002180,290002190,290002200,290002210,290002970,290002980,290002990,290003000,290003010,
//         290003020,290003030,290003040,290003050,290003060,290003070,290003080,290003090,290003100,290003110,290003120,290003130,290003140,290003150,293004260,293004270,293004280,293004290,299001100,299001110,299001120,299001130,299001140,299002000,299002010,299002020,299002030,299002040,299002100,299002110,299002120,299002130,299002180,299002190,299002200,299002210,299002220,299002280,299002290,299002300,299002310,299002360,299002370,299002380,299002390,299002400,299604720,299604730,299604740,299604750,299604760,793003700,793003710,793003720,793003730,793003740,78000630,78000640,78000650,78000660,692912010, 692912020, 692912030, 692912040, 692912050, 692912060, 692912070, 692912080 , 610300080, 610300070, 610300060, 610300050, 610300040, 610300030, 610300020, 610300010, 610200010, 610200020, 610200030, 610200040, 610200050, 610200060, 610200070, 610200080,93001060,93001070,93001080,93001090,93001250,93001260,93001270,93001280,93001290,93001480,93001490,93001500,93001510,93001630,93001640,93001650,93001660,93001670,93001710,93001720,93001730,93001740,
//         93002140,93002150,93002160,93002170,93002180,93002190,93002200,93002210,93002220,93002230,93002240,93002250,93002260,93002270,93002280,93002290,93002300,93002310,93002320,93002330,93002490,93002500,93002510,93002520,93002530,93002540,93002550,93002560,93004500,93004510,93004520,93004530,93004900,93004910,93004920,93004930,93004990,93005000,93005010,93005020,93005090,93005100,93005110,93005120,93005280,93005290,93005300,93005310,93007570,93007580,93007590,93007620,93007630,94000510,94000520,94000530,94000540,94000550,94000560,99629480,99629490,99629500,99629510,99629520,99629530,99629580,99629590,99629600,99629610,99629620,194004110,194004120,194004130,194004140,194004150,290002310,290002320, 290002330,290002340,290002350,290002360,290002370,290002380,290002390,290002400,290002410,290002420,290002430,290002440,290002450,290002460,290003160,290003170,290003180,290003190,290003200,290003210,290003220,290003230,290003240,290003250,290003260,290003270,290003280,290003290,290003300,290003310,290003320,290003330,290003340,290003770,290003780,290003790,290003800,290003810,299002050,299002060,299002070,299002080,299002090,299002140,299002150,299002160,299002170,299002230,299002240,299002250,299002260,299002270,299002320,299002330,299002340,299002350,299002410,299002420,299002430,299002440,299002450,299604770,299604780,299604790,299604800,299604810,593003700,593003710,593003720,593003730,593003740,693003700,693003710,693003720,693003730,693003740,994001550,994001540,994001530,994001600,994001560,994001570,994001580,994001590,994001630,994001620,994001610,994001680,994001640,994001650,994001660,994001670,994001710,994001700,994001690,994001760,994001720,994001730,994001740,994001750,
//         999912008, 999912007, 999912006, 999912005, 999912004, 999912003, 999912002, 999912001, 1920101310, 1920101300, 1920101290, 1920101280, 1920101270, 1920101260, 1920101250, 1920101240, 1920101230, 1920101220, 1920101210, 1920101200, 1920101190, 1920101180, 1920101170, 1920101160, 1920101150, 1920101140, 1920101130, 1920101120, 1920101110, 1920101100, 1920101090, 1920101080, 1920101070, 1920101060, 1920101050, 1920101040, 1920101030,1920101020, 1920101010, 1920101000, 1920100990, 1920100980, 1920100970, 1920100960, 1920100950, 1920100940, 1920100930, 1920100920, 1920100910, 1920100900, 1920100890, 1920100880, 1920100870, 1920100860, 1920100850, 1920100840, 1920100830, 1920100820,610500010, 93008040,93008050,93008060,93008070,93008080,93008090,93008100,93008110,93008120,93008130,93008140,93008150,93008160,93008170,93008180,93008190, 1920101420, 1920101430, 1920101440, 1920101450, 1920101460, 1920101470,1920101390, 1920101380, 1920101370, 1920101360, 1920101340, 1920101350,  1920101480, 1920101490, 1920101500, 1920101510, 1920101410, 1920101400, 1920101330, 1920101320, 1920101320, 1920101330, 1920101340, 1920101350, 1920101360, 1920101370, 1920101380, 1920101390, 1920101400, 1920101410, 1920101520, 1920101530, 1920101540, 1920101550, 1920101560, 1920101570, 1920101580, 1920101590, 1920101600, 1920101610, 1920101620, 1920101630, 1920101640, 1920101650, 1920101660, 1920101670, 1920101680, 1920101690, 1920101700,  1920101710, 1920101720, 1920101730, 1920101740, 1920101750, 1920101760, 1920101770, 1920101780, 1920101790, 1920101800, 1920101810, 1920101820, 1920101830, 1920101840, 1920101850, 1920101860, 1920101870, 1920101880, 1920101890, 1920101900, 1920101910, 1920101920, 1920101930, 1920101940,  1920101950, 1920101960, 1920101970, 1920101980, 1920101990, 1920102000, 1920102010, 1920102020, 1920102030, 1920102040, 1920102050, 1920102060, 1920102070, 1920102080, 1920102090, 1920102100, 1920102110, 1920102120, 1920102130, 1920102140, 1920102150, 1920102160, 1920102170,1920102180 
//     ];
//     let i = -1;
//     await Promise.all(items.map( async (item) => {
//         var request3 = new sql.Request();
//         i += 1;
//         const grp1 = await request3.query("INSERT INTO [DR2_DEF].[dbo].[TB_DefGemStore] VALUES (\'0\',\'Polemos Ordure\', \'125b74b5-5b39-47d7-9b90-b507ce4d5c95\', \'13\', \'"+i+"\', \'79000000\', \'1\', \'"+ item +"\', \'1\', \'0\', \'0\', \'0\', \'0\', \'0\', \'0\', \'0\', \'0\')",);
//         console.log(item + " ajouté !");
//         console.log(i);
//     }))
//     return "#100";
// };


//  Donnez des objets à tous les joueurs du jeu
 exports.donnezNousTous = async () => {
    const today = new Date();
    const date = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
    var verifHardwareR = new sql.Request();
    const joueursr = await verifHardwareR.query(`
    SELECT userid, point, char2.CharacterID, char2.Name FROM [DR2_User].[dbo].[TB_CharacterBasic] AS char2 JOIN [DR2_Member].[dbo].[Member] AS memb ON char2.MemberID = memb.MemberKey JOIN [user] as usern ON usern.username = memb.ID COLLATE DATABASE_DEFAULT WHERE point > 0`);
     let i = -1;
    //  await Promise.all(joueursr.recordset.map( async (joueur) => {
    //     var request3 = new sql.Request();
    //     i += 1;
    //     var prepareGift1r = new sql.Request();
    //     await prepareGift1r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST(\'"+ joueur.CharacterID +"\' AS UNIQUEIDENTIFIER),'Polemos',\'"+ date +"\',6456,'Inventory Extension',1,4, \'3\')");
    //     var prepareGift2r = new sql.Request();
    //     await prepareGift2r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST('492a8555-f0db-41c2-a376-f5cfbc9b8828' AS UNIQUEIDENTIFIER),\'"+joueur.Name+"\', \'"+ date +"\' ,6456,'Inventory Extension',0,4, \'3\')");    
    //     console.log("Cadeau distribué");
    // }))
    // await Promise.all(joueursr.recordset.map( async (joueur) => {
    //     var request3 = new sql.Request();
    //     i += 1;
    //     var prepareGift3r = new sql.Request();
    //     await prepareGift3r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST(\'"+ joueur.CharacterID +"\' AS UNIQUEIDENTIFIER),'Polemos',\'"+ date +"\',6457,'Inventory Extension',1,4, \'2\')");
    //     var prepareGift4r = new sql.Request();
    //     await prepareGift4r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST('492a8555-f0db-41c2-a376-f5cfbc9b8828' AS UNIQUEIDENTIFIER),\'"+joueur.Name+"\', \'"+ date +"\' ,6457,'Inventory Extension',0,4, \'2\')");    
    //     console.log("Cadeau distribué");
    // }))
    await Promise.all(joueursr.recordset.map( async (joueur) => {
        var request3 = new sql.Request();
        i += 1;
        let numberWoodie = 0;
        if(joueur.point >= 1400){
            numberWoodie = 30;
        }
        if(joueur.point >= 1000 && joueur.point < 1400){
            numberWoodie = 25;
        }
        if(joueur.point >= 500 && joueur.point < 1000){
            numberWoodie = 20;
        }
        if(joueur.point >= 100 && joueur.point < 500){
            numberWoodie = 15;
        }
        if(joueur.point > 0 && joueur.point < 100){
            numberWoodie = 8;
        }
        if(joueur.point > 0){
            const hour = new Date().getHours() + ":" + new Date().getMinutes();
            var prepareGift5r = new sql.Request();
            await prepareGift5r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST(\'"+ joueur.CharacterID +"\' AS UNIQUEIDENTIFIER),'Polemos',\'"+ date +"\',6453,'Ranked - Beta 1',1,4, \'"+numberWoodie+"\')");
            var prepareGift6r = new sql.Request();
            await prepareGift6r.query("INSERT INTO DR2_User.dbo.TB_UserCashGift VALUES (NEWID(),CAST('492a8555-f0db-41c2-a376-f5cfbc9b8828' AS UNIQUEIDENTIFIER),\'"+joueur.Name+"\', \'"+ date +"\' ,6453,'Ranked - Beta 1',0,4, \'"+numberWoodie+"\')");    
            console.log("Cadeau distribué");
            var request = new sql.Request();
            await request.query("INSERT INTO [polemos_website].[dbo].[notification](notificationtype, notificationmessage, notificationdate, notificationreceiver, amount, notificationhour) VALUES (\'5\', \'(Gift)"+numberWoodie+" woodie coins - Ranked Beta 1\', \'"+date+"\', \'"+joueur.userid+"\', \'"+0+"\', \'"+hour+"\')",)
        }
    }))
    return "#100";
};