import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
config();
import cleaner from "./vip-cleaner.js";
import editEmbed from "./editEmbed.js";
import getDonate from "./getDonate.js";
import checkDonate from "./checkDotane.js";
import fetch from "node-fetch";
import dateDonateExpires from "./dateDonateExpires.js";
import getStatsOnDiscord from "./getStatsOnDiscord.js";

import {
  setIntervalAsync,
  clearIntervalAsync,
} from "set-interval-async/dynamic";
import {
  setTimeout as setTimeoutPromise,
  setInterval,
} from "node:timers/promises";

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channel = client.channels.cache.get("1069615679281561600");
  const guild = client.guilds.cache.get("735515208348598292");
  const donateChannel = client.channels.cache.get("1073712072220754001");
  const db = process.env.DATABASE_URL;
  let tempSteamId = [];
  // const username = "ACTEPUKC";
  // const discriminator = "9551";
  // const members = await guild.members.fetch();
  // const member = members.find(
  //   (m) =>
  //     m.user.username === username && m.user.discriminator === discriminator
  // );
  // member.roles.add("1072902141666136125");
  setIntervalAsync(async () => {
    checkDonate(tempSteamId, process.env.DONATE_URL, () => {
      tempSteamId = [];
    });
  }, 30000);

  const getStats = [
    editEmbed({
      channel,
      db,
      sort: "kills",
      messageId: "1069615769610108938",
      authorName: "Топ 20 игроков по убийствам",
      seconds: 1000,
    }),
    editEmbed({
      channel,
      db,
      sort: "death",
      messageId: "1069615861582811178",
      authorName: "Топ 20 игроков по смертям",
      seconds: 5000,
    }),
    editEmbed({
      channel,
      db,
      sort: "revives",
      messageId: "1069615953438048276",
      authorName: "Топ 20 медиков",
      seconds: 10000,
    }),
    editEmbed({
      channel,
      db,
      sort: "teamkills",
      messageId: "1069616004457578627",
      authorName: "Топ 20 тимкилеров",
      seconds: 15000,
    }),
    editEmbed({
      channel,
      db,
      sort: "kd",
      messageId: "1069616217884741693",
      authorName: "Топ 20 игроков по соотношению убийств к смертям",
      seconds: 20000,
    }),
  ];

  async function startEmbedEdit() {
    const interval = 18000000;
    for await (const startTime of setInterval(
      interval,
      Promise.all(getStats)
    )) {
      console.log("Statistics updated");
      Promise.all(getStats);
    }
  }
  startEmbedEdit();

  cleaner.vipCleaner((ids) =>
    ids.forEach(async (element) => {
      let role =
        guild.roles.cache.find((r) => r.name === "VIP") ||
        (await guild.roles.fetch("1072902141666136125"));
      let user = guild.members.cache.get(element);
      let getUserList = await guild.members
        .fetch({ cache: true })
        .catch(console.error);
      let findUser = getUserList.find((r) => r.user.id === element);
      findUser.send(
        "Ваш Vip статус на сервере RNS закончился, для продления вип статуса перейдите по ссылке https://discord.com/channels/735515208348598292/983671106680528897"
      );
      findUser.roles.remove(role);
    })
  );

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channelId === "1073712072220754001")
      getDonate(process.env.DONATE_URL, donateChannel);
    if (message.channelId === "819484295709851649") {
      const content = message.content;
      let steamID64 = content.match(/[0-9]{17}/);
      let steamId = /^https?:\/\/steamcommunity.com\/id\/(?<steamId>.*)/;
      let groupsId = content.match(steamId)?.groups;

      let splitSteamId = groupsId?.steamId.split("/")[0];
      client.users.fetch("132225869698564096", false).then((user) => {
        user.send(message.author.username, content);
        user.send(content);
      });

      if (!steamID64 && !groupsId) {
        client.users.send(
          message.author,
          "Проверьте правильность ввода steamID64 или ссылки на профиль Steam\nSTEAMID64 можно получить на сайте https://steamid.io/\nSteamid должен быть тот же, что был указан в комментарии доната.\nДискорд для связи на случай затупа: ACTEPUKC#9551"
        );
        message.delete();
        return;
      }

      if (typeof groupsId !== "undefined") {
        const responseSteam = await fetch(
          `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=78625F21328E996397F2930B25F4C91F&vanityurl=${splitSteamId}`
        );
        const dataSteam = await responseSteam.json();
        if (dataSteam.response.success === 1) {
          tempSteamId.push([
            message.author.username,
            message.author.id,
            dataSteam.response.steamid,
            message,
          ]);
        }
      }
      if (steamID64) {
        tempSteamId.push([
          message.author.username,
          message.author.id,
          steamID64.toString(),
          message,
        ]);
      }

      const filter = (reaction, user) => {
        const id = [
          //"132225869698564096",
          //"365562331121582090",
          //"887358770211082250",
          "755025905595842570",
        ];
        const userId = user.id;
        return (
          (["👍"].includes(reaction.emoji.name) && id.includes(userId)) ||
          (["❌"].includes(reaction.emoji.name) && id.includes(userId))
        );
      };
      message
        .awaitReactions({ filter, max: 1, time: 60000, errors: ["time"] })
        .then((collected) => {
          const reaction = collected.first();
          if (typeof reaction == "undefined") return;
          if (reaction.emoji?.name === "❌") return;
          if (reaction.emoji?.name === "👍") {
            let role = message.guild.roles.cache.get("1072902141666136125");
            let user = message.guild.members.cache.get(message.author.id);
            user.roles.add(role);
            message.channel.send({
              content: `Игроку <@${message.author.id}> - выдан VIP статус, спасибо за поддержку!`,
            });
            setTimeout(() => {
              message.delete();
            }, 5000);
          }
        })
        .catch((collected) => {
          client.users.send(
            message.author,
            "Проверьте правильность ввода steamID64 или ссылки на профиль Steam\nSTEAMID64 можно получить на сайте https://steamid.io/\nSteamid должен быть тот же, что был указан в комментарии доната.\nДискорд для связи на случай затупа: ACTEPUKC#9551!"
          );
          message.delete();
        });
    }
    if (message.channelId === "1091073082510278748") {
      if (message.content.includes("!vip")) {
        dateDonateExpires(message.author.id, process.env.ADMINS_URL, message);
        return;
      }
      if (message.content.includes("!stats")) {
        if (message.content.split(" ").length > 1) {
          getStatsOnDiscord(
            process.env.DATABASE_URL,
            message.content.split(" ")[1],
            message
          );
          return;
        }
      }
      message.delete();
    }
  });
});
client.login(process.env.CLIENT_TOKEN);
