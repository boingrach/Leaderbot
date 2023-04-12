import fs from "fs";
import getStatsOnDiscord from "./getStatsOnDiscord.js";

function getStatsOnDiscordWithoutSteamID(db, adminUrl, message) {
  let steamId = [];
  const regexp =
    /^Admin=[0-9]*:Reserved [//]* DiscordID [0-9]* do [0-9]{2}\.[0-9]{2}\.[0-9]{4}/gm;
  fs.readFile(`${adminUrl}Admins.cfg`, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    data.split("\r\n").map((e) => {
      const user = e.match(regexp);
      if (user) {
        const getUser = user.filter((el) => el.includes(message.author.id));
        if (getUser.length > 0) {
          steamId.push(getUser.toString().match(/[0-9]{17}/));
        }
      }
    });
    getStatsOnDiscord(db, steamId.toString(), message);
  });
}
export default getStatsOnDiscordWithoutSteamID;
