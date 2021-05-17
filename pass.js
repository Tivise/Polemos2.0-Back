var sql = require("mssql");
var sqldrago = require("mssql");
const { cpuUsage } = require("process");

var config = {
    user: 'polemos',
    password: '45l@eUGYUYUGY44#',
    server: 'localhost', 
    database: 'polemos_website' 
};

var config2 = {
    user: 'polemos',
    password: '45l@eUGYUYUGY44#',
    server: 'localhost', 
    database: 'DR2_Member' 
};
sql.connect(config, function (err) {

    err ?
    console.log("Erreur de connexion au serveur SQL: " + err)
    :
    console.log("MATCHMAKING - POLEMOS V1.0");
});
const interval = setInterval(() => {
    const visibilite = async () => {
        const hourmtn = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
        const today = new Date();
        const datemtn = today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate();
        const hournow = (new Date().getHours() * 60 * 60) + (new Date().getMinutes() * 60) + new Date().getSeconds();
    
        // MATCHMAKING: Récupération des joueurs en matchmaking
        var request = new sql.Request();
        const result = await request.query("SELECT * FROM [matchmakingUser]");
        Promise.all(result.recordset.map( async (joueur) => {
            const joueurRecup = async () => {
                var request1 = new sql.Request();
                await request1.query("DELETE FROM [matchmakingUser] WHERE userid = \'"+joueur.userid+"\'");
                console.log(joueur.userid + " a été supprimé de la file (raison: trop de délai).)")
            }
            const hourList = joueur.hour.split(':');
            const hour =  (parseInt(hourList[0]) * 60 * 60) + (parseInt(hourList[1]) * 60) + parseInt(hourList[2]);
            if((hournow - hour) > 900){
                joueurRecup();
                
            }
        }))
        // MATCHMAKING: Répartition des joueurs de la file et création de match (quand + de 5 joueurs dans la file).
        if(result.recordset.length >= 5){
            console.log("Préparation d'un match:")
            var request2 = new sql.Request();
            const joueurs = await request2.query("SELECT * FROM [matchmakingUser] ORDER BY RAND() OFFSET  0 ROWS FETCH NEXT 4 ROWS ONLY");
            const players = joueurs.recordset;
            var request3 = new sql.Request();
            const grp1 = await request3.query("INSERT INTO [polemos_website].[dbo].[matchMakingGroup](date, hour) OUTPUT Inserted.groupid VALUES (\'"+datemtn+"\',\'"+hourmtn+"\')",);
            console.log("Suppression de 4 joueurs de la file: un match a été trouvé pour eux :) !")
            var requestremove = new sql.Request();
            const remove = await requestremove.query("DELETE FROM [polemos_website].[dbo].[matchMakingUser] WHERE userid = \'"+players[0].userid+"\' OR userid = \'"+players[1].userid+"\' OR userid = \'"+players[2].userid+"\' OR userid = \'"+players[3].userid+"\'",);
            const groupe1id = grp1.recordset[0].groupid;
            var request31 = new sql.Request();
            const user1group1 = await request31.query("INSERT INTO [polemos_website].[dbo].[matchMakingGroupUser](userid, groupid) VALUES (\'"+players[0].userid+"\',\'"+groupe1id+"\')",);
            var request32 = new sql.Request();
            const user2group1 = await request32.query("INSERT INTO [polemos_website].[dbo].[matchMakingGroupUser](userid, groupid) VALUES (\'"+players[3].userid+"\',\'"+groupe1id+"\')",);
            var request4 = new sql.Request();
            const grp2 = await request4.query("INSERT INTO [polemos_website].[dbo].[matchMakingGroup](date, hour) OUTPUT Inserted.groupid VALUES (\'"+datemtn+"\',\'"+hourmtn+"\')",);
            const groupe2id = grp2.recordset[0].groupid;
            var request41 = new sql.Request();
            const user1group2 = await request41.query("INSERT INTO [polemos_website].[dbo].[matchMakingGroupUser](userid, groupid) VALUES (\'"+players[1].userid+"\',\'"+groupe2id+"\')",);
            var request42 = new sql.Request();
            const user2group2 = await request42.query("INSERT INTO [polemos_website].[dbo].[matchMakingGroupUser](userid, groupid) VALUES (\'"+players[2].userid+"\',\'"+groupe2id+"\')",);
            var request5 = new sql.Request();
            const passroom = Math.random().toString(36).substr(2, 5);
            const mtch = await request5.query("INSERT INTO [polemos_website].[dbo].[matchMakingMatch](hostname, host, against, map, hour, date, status, passroom) VALUES (\'"+players[0].userid+"\',\'"+groupe1id+"\',\'"+groupe2id+"\', \'Labyrinthe Mystérieux\',\'"+hourmtn+"\',\'"+datemtn+"\', \'0\', \'"+passroom+"\')",);
            console.log("Le match a été crée avec succès.");
        }
    
        // MATCHMAKING: Vérification des status des matchs: Si win, donnez des polemos points aux joueurs.
        // (ici l'erreur qui boucle)
        var request60 = new sql.Request();
        const matches = await request60.query("SELECT * FROM [matchmakingMatch] WHERE status < 5");
        const matchVerif = async () => { Promise.all(matches.recordset.map( async (match) =>{
                const splittedDate = match.date.split("/");
                const yearPaste = (splittedDate[0]).toString() + (splittedDate[1] < 10 ? '0' + splittedDate[1] : splittedDate[1]).toString() + (splittedDate[2] < 10 ? '0' + splittedDate[2] : splittedDate[2]).toString();
                const tablenor = "TB_" + yearPaste;
                const tablesub = "TB_"+ yearPaste + "_Sub";
                var requesthost = new sql.Request();
                const hostteam = await requesthost.query("SELECT [usergroupe].userid, username, [usergroupe].classname, [usergroupe].charname, country FROM [matchmakingMatch] JOIN [matchmakingGroup] as host ON host = groupid LEFT JOIN [matchmakingGroupUser] as usergroupe ON host.groupid = usergroupe.groupid JOIN [user] as usern on usern.userid = usergroupe.userid WHERE matchid = \'"+match.matchid+"\'");
                const roomguidRequest = new sql.Request();
                const roomguid = await roomguidRequest.query("SELECT MemberKey as roomguido, Message1 as roomname FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE OrderType = \'2600\' AND ActionType = \'2\' AND Message1=\'" + hostteam.recordset[0].username.toLowerCase() + match.matchid +"\'");
                const guidRoom = roomguid.recordset.length > 0 ? roomguid.recordset[0].roomguido: null;
                if(match.status > 0 && match.status < 5){
                    var request51 = new sql.Request();
                    const result = await request51.query("SELECT count(*) AS \'total\' FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE MemberKey = CONVERT(uniqueidentifier,\'"+ guidRoom +"\') AND OrderType = \'2600\' AND ActionType=\'3\'");
                    // Si match terminé
                    if (result.recordset[0].total > 0 && match.status < 5){
                        console.log("[MATCH] #" + match.matchid + " > Match terminé");
                        let killhost = 0;
                        let killagainst = 0;
                        var killByPlayersReq = new sql.Request();
                        const playerkills = await killByPlayersReq.query("SELECT Message1 AS \'killer\', COUNT(*) as total FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE Message3 = CONVERT(uniqueidentifier,\'"+ guidRoom +"\') AND OrderType = \'800\' AND ActionType=\'7\' GROUP BY Message1");
                        playerkills.recordset.map( (tueur) => {
                            hostteam.recordset.map( (hostplayer) => {
                                if( hostplayer.charname === tueur.killer ){
                                    killhost = killhost + tueur.total;
                                }                                    
                            })
                        })
                        var againstteamp = new sql.Request();
                        const againstteam = await againstteamp.query("SELECT [usergroupe].userid, username, [usergroupe].classname, [usergroupe].charname, country FROM [matchmakingMatch] JOIN [matchmakingGroup] as host ON against = groupid LEFT JOIN [matchmakingGroupUser] as usergroupe ON host.groupid = usergroupe.groupid JOIN [user] as usern on usern.userid = usergroupe.userid WHERE matchid = \'"+match.matchid+"\'");
                        playerkills.recordset.map( (tueur) => {
                            againstteam.recordset.map( (againstplayer) => {
                                if( againstplayer.charname === tueur.killer ){
                                    killagainst = killagainst + tueur.total;
                                }                                    
                            })
                        })
                        if(killhost > killagainst){
                            console.log("1 fois");
                            Promise.all(playerkills.recordset.map( async (tueur) => {
                                Promise.all(hostteam.recordset.map( async (hostplayer) => {
                                        console.log("attribution à " + hostplayer.charname);
                                        if( hostplayer.charname === tueur.killer ){
                                            if (tueur.total > 4){
                                                const matchRankedreq = new sql.Request();
                                                const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+15 WHERE userid=\'"+ hostplayer.userid +"\'");
                                            }
                                            else{
                                                const matchRankedreq = new sql.Request();
                                                const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+3 WHERE userid=\'"+ hostplayer.userid +"\'");
                                            }
                                        }
                                        const matchRankedwreq = new sql.Request();
                                        const recompensewin = await matchRankedwreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+35 WHERE userid=\'"+ hostplayer.userid +"\'");
                                }))
                                Promise.all(againstteam.recordset.map( async (againstplayer) => {
                                        console.log("relégation à " + againstplayer.charname);
                                        if(againstplayer.charname === tueur.killer ){
                                            if (tueur.total > 4){
                                                const matchRankedreq = new sql.Request();
                                                const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+11 WHERE userid=\'"+ againstplayer.userid +"\'");
                                            }
                                            else{
                                                const matchRankedreq = new sql.Request();
                                                const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+3 WHERE userid=\'"+ againstplayer.userid +"\'");
                                            }
                                        }
                                        const matchRankedreq = new sql.Request();
                                        const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point-40 WHERE userid=\'"+ againstplayer.userid +"\'");
                                }))
                            }))
                        }
                        if(killhost < killagainst){
                            console.log("1 fois");
                            Promise.all(playerkills.recordset.map( async (tueur) => {
                                Promise.all(hostteam.recordset.map( async (hostplayer) => {
                                        console.log("attribution à " + hostplayer.charname);
                                        if( hostplayer.charname === tueur.killer ){
                                            if (tueur.total > 4){
                                                const matchRankedreq = new sql.Request();
                                                const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+11 WHERE userid=\'"+ hostplayer.userid +"\'");
                                            }
                                            else{
                                                const matchRankedreq = new sql.Request();
                                                const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+3 WHERE userid=\'"+ hostplayer.userid +"\'");
                                            }
                                        }
                                        const matchRankedwreq = new sql.Request();
                                        const recompensewin = await matchRankedwreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point-40 WHERE userid=\'"+ hostplayer.userid +"\'");
                                }))
                                Promise.all(againstteam.recordset.map( async (againstplayer) => {
                                        console.log("relégation à " + againstplayer.charname);
                                        if(againstplayer.charname === tueur.killer ){
                                            if (tueur.total > 4){
                                                const matchRankedreq = new sql.Request();
                                                const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+15 WHERE userid=\'"+ againstplayer.userid +"\'");
                                            }
                                            else{
                                                const matchRankedreq = new sql.Request();
                                                const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+3 WHERE userid=\'"+ againstplayer.userid +"\'");
                                            }
                                        }
                                        const matchRankedreq = new sql.Request();
                                        const recompense = await matchRankedreq.query("UPDATE [polemos_website].[dbo].[user] SET point = point+35 WHERE userid=\'"+ againstplayer.userid +"\'");
                                }))
                            }))
                        }
                        var endmatchq = new sql.Request();
                        const endmatch = await endmatchq.query("UPDATE [polemos_website].[dbo].[matchmakingMatch] SET status = \'5\' WHERE matchid=\'"+ match.matchid +"\'");
                        console.log("----------------------------------------------")
                    }
                    if(match.status === 2){
                        const roundStartedReq = new sql.Request();
                        const roundStarted = await roundStartedReq.query("SELECT COUNT(*) as total FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE MemberKey = CONVERT(uniqueidentifier,\'"+ guidRoom +"\') AND OrderType = \'2700\' AND ActionType=\'2\'")
                        if(roundStarted.recordset.total > 0){
                            var tooLongLobby = new sql.Request();
                            const longLobby = await tooLongLobby.query("UPDATE [polemos_website].[dbo].[matchmakingMatch] SET status = \'3\' WHERE matchid=\'"+ match.matchid +"\'");
                        }
                    }
                }
                if(match.status === 0){
                    var classnameshostr = new sql.Request();
                    const classnameshost = await classnameshostr.query("SELECT COUNT(*) as total FROM [matchmakingGroupUser] as groupuser JOIN [matchmakingMatch] as matchhost ON groupuser.groupid = matchhost.host WHERE matchhost.matchid = \'"+ match.matchid +"\' and groupuser.classname IS NULL");
                    var classnamesagainstr = new sql.Request();
                    const classnamesagainst = await classnamesagainstr.query("SELECT COUNT(*) as total FROM [matchmakingGroupUser] as groupuser JOIN [matchmakingMatch] as matchhost ON groupuser.groupid = matchhost.against WHERE matchhost.matchid = \'"+ match.matchid +"\' and groupuser.classname IS NULL");
                    const classnamesNull = classnameshost.recordset[0].total + classnamesagainst.recordset[0].total;
                    if(classnamesNull === 0){
                        console.log("[MATCH] #" + match.matchid +  " > Tous les joueurs ont choisi un personnage");
                        var finalizeErrorMatchr = new sql.Request();
                        const finalizeErrorMatch = await finalizeErrorMatchr.query("UPDATE [polemos_website].[dbo].[matchmakingMatch] SET status = \'2\' WHERE matchid=\'"+ match.matchid +"\'");
                    }
                }
                if(guidRoom && match.status < 5){
                    var hostrq = new sql.Request();
                    const hostteam = await hostrq.query("SELECT [usergroupe].userid, username, [usergroupe].classname, [usergroupe].charname, country FROM [matchmakingMatch] JOIN [matchmakingGroup] as host ON host = groupid LEFT JOIN [matchmakingGroupUser] as usergroupe ON host.groupid = usergroupe.groupid JOIN [user] as usern on usern.userid = usergroupe.userid WHERE matchid = \'"+match.matchid+"\'",);
                    var againstteamrq = new sql.Request();
                    const againstteam = await againstteamrq.query("SELECT [usergroupe].userid, username, [usergroupe].classname, [usergroupe].charname, country FROM [matchmakingMatch] JOIN [matchmakingGroup] as against ON against = groupid LEFT JOIN [matchmakingGroupUser] as usergroupe ON against.groupid = usergroupe.groupid JOIN [user] as usern on usern.userid = usergroupe.userid WHERE matchid = \'"+match.matchid+"\'",);
                    const playersInRoomReq = new sql.Request();
                    const playersInRoom = await playersInRoomReq.query("SELECT ID, Name, MemberKey, CharacterKey FROM [DR2_Log].[dbo].["+ tablesub +"] AS sub JOIN [DR2_Log].[dbo].["+ tablenor +"] AS nor ON nor.LogGuid = sub.LogGUID WHERE Message3 = CONVERT(uniqueidentifier,\'"+ guidRoom +"\') AND OrderType = \'1100\' AND ActionType=\'9\'");
                    let missingSomeone = 0; 
                    const playerListSite = (hostteam.recordset).concat(againstteam.recordset);
                    playerListSite.map( (joueur) =>{
                        for (let i=0; i < playersInRoom.recordset.length; i++){
                            if( Object.values(playersInRoom.recordset[i]).indexOf(joueur.charname) !== -1) {
                                missingSomeone++;
                            }
                        }    
                    })
                    if(playersInRoom.recordset.length !== (hostteam.recordset.length + againstteam.recordset.length) || missingSomeone !== playerListSite.length){
                        const finalizeErrorMatchr = new sql.Request();
                        const finalizeErrorMatch = await finalizeErrorMatchr.query("UPDATE [polemos_website].[dbo].[matchmakingMatch] SET status = \'6\' WHERE matchid=\'"+ match.matchid +"\'");
                        console.log("[MATCHMAKING MATCH] They are " + missingSomeone + " players but needed " + playerListSite.length);
                    }
            }
        }))}
        matchVerif();
    
        // MATCH : Récupération des matchs : si les joueurs mettent trop de temps, le match est supprimé.
        var request50 = new sql.Request();
        const resultl = await request50.query("SELECT * FROM [matchmakingMatch]");
        const matchs = resultl.recordset;
        matchs.map( (match) => {
            const deleteMatch = async () => {
                const hourList = match.hour.split(':');
                const hour =  (parseInt(hourList[0]) * 60 * 60) + (parseInt(hourList[1]) * 60) + parseInt(hourList[2]);
                if(match.status === 0 && (hournow - hour) > 120 ||  match.status === 6  || match.status === 2 && (hournow - hour) > 3500 ){
                    console.log(match.status === 0 ? "#" + match.matchid+  "> Les joueurs n'ont pas choisi leurs personnages assez vite!": (match.status === 6 ? " > Erreur dans le format du match en jeu (joueur absent, pas de création, ...)": "§Le match a duré plus de 40 minutes§"));
                    console.log("#" + match.matchid + " > Suppression du match en cours...");
                    const removeMatch = new sql.Request();
                    const remove1 = removeMatch.query("DELETE FROM [polemos_website].[dbo].[matchMakingMatch] WHERE matchid = \'"+match.matchid+"\'",);
                    const removeGroupUser = new sql.Request();
                    const remove2 = removeGroupUser.query("DELETE FROM [polemos_website].[dbo].[matchMakingGroupUser] WHERE groupid = \'"+match.host+"\' OR groupid = \'"+match.against+"\'",);
                    const removeGroups = new sql.Request();
                    const remove3 = removeGroups.query("DELETE FROM [polemos_website].[dbo].[matchMakingGroup] WHERE groupid = \'"+match.host+"\' OR groupid = \'"+match.against+"\'",);
                    console.log("#" + match.matchid + " > Suppression du match effectuée.");
                }
            }
            deleteMatch();
        })
    }
    visibilite();
}, 2000);
return () => clearInterval(interval);


exports.sql = sql;
exports.sqldrago = sqldrago;
