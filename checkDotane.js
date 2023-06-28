import fetchDonate from "./fetchDonate.js";
import fetch from "node-fetch";

async function checkDonate(steamApi, tempSteamId, donateUrl, callback) {
  let retryCount = 0;
  let matchFound = false;
  try {
    while (retryCount < 3 && !matchFound) {
      let response = await fetch(donateUrl);

      if (!response.ok) {
        if (matchFound) return;
        console.log(
          "Не удалось получить список донатов. Повторная попытка через 20 секунд..."
        );
        await sleep(20000);
        retryCount++;
      } else {
        if (matchFound) return;
        const json = await response.json();
        const steamIdRegex =
          /^https?:\/\/steamcommunity.com\/id\/(?<steamId>.*)/;
        console.log("response", tempSteamId);

        for (const element of tempSteamId) {
          const currentSteamId = element[2];

          for (const jsonEl of json.data) {
            const comment = jsonEl.comment;
            const steamID64 = comment.trim().match(/[0-9]{17}/);
            const groupsId = comment.trim().match(steamIdRegex)?.groups;
            const splitSteamId = groupsId?.steamId?.split("/")[0];

            if (typeof groupsId !== "undefined") {
              try {
                const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApi}&vanityurl=${splitSteamId}`;
                const responseSteam = await fetch(resolveUrl);
                const dataSteam = await responseSteam.json();
                console.log("dataSteam", dataSteam);

                if (
                  dataSteam.response.success === 1 &&
                  dataSteam.response.steamid === currentSteamId
                ) {
                  fetchDonate(element, jsonEl);
                  console.log(`${currentSteamId} найден в списках донатов`);
                  matchFound = true;
                }
              } catch (error) {
                console.log("Не удалось получить steamID");
                throw new Error(error);
              }
            }
            if (steamID64?.[0] === currentSteamId) {
              fetchDonate(element, jsonEl);
              console.log(`${currentSteamId} найден в списках донатов`);
              matchFound = true;
            }
            if (matchFound) break;
          }
          if (matchFound) break;
          console.log("Закончил проверку");
        }

        if (matchFound) return;
      }
      if (!matchFound) {
        console.log(
          "Совпадений не найдено. Повторная попытка через 30 секунд..."
        );
        await sleep(30000);
        retryCount++;
      }
    }

    if (retryCount === 3 && !matchFound) {
      console.log("Совпадений не найдено");
    }

    callback();
  } catch (error) {
    console.log(error);
  }
}

function sleep(ms) {
  const start = new Date().getTime();
  while (new Date().getTime() - start < ms) {}
}

export default checkDonate;
