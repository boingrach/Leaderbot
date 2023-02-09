import fs from "fs";
import { exec } from "node:child_process";
import { config } from "dotenv";
config();
const adminsCfgPath = process.env.ADMINS_URL;
const vipCreater = async (steamID, nickname, time, summ, discordId) => {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };
  const summPerDay = summ / 9.863;
  const currentTime = new Date().getTime();
  const updatedTIme = new Date(currentTime + summPerDay * 24 * 60 * 60 * 1000);
  const getTime = updatedTIme.toLocaleDateString("en-GB", options);
  const endTime = getTime.replace(/\//g, ".");
  fs.readFile(`${adminsCfgPath}Admins.cfg`, "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const newData = data.concat(
      `\r\nAdmin=${steamID}:Reserved // DiscordID ${discordId} do ${endTime}`
    );
    if (newData.length) {
      fs.writeFile(`${adminsCfgPath}Admins.cfg`, newData, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`User ${nickname} added`);

        fs.writeFile(`${adminsCfgPath}AdminsBackup.cfg`, data, (err) => {
          if (err) {
            console.error(err);
            return;
          }

          console.log("\x1b[33m", "\r\n Backup created AdminsBackup.cfg\r\n");

          exec("../syncconfig.sh", (err, stdout, stderr) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(stdout);
          });
        });
      });
    }
  });
};
export default {
  vipCreater,
};
