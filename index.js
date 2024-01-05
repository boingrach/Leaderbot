import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import getCommands from "./commands/getCommands.js";
import { config } from "dotenv";
config();
import cleaner from "./utility/vip-cleaner.js";
import top20StatsMain from "./utility/top20StatsMain.js";
import top20StatsTemp from "./utility/top20StatsTemp.js";
import getDonate from "./utility/getDonate.js";
import getBanFromBattlemetrics from "./utility/getBansFromBattlemetrics.js";
import getSteamIDFromMessage from "./utility/getSteamIDFromMessage.js";
//import chartInitialization from "./chartInitialization.js";
import { exec } from "child_process";
import getSteamIdModal from "./utility/getSteamIdModal.js";
import getSteamIdFormSubmit from "./utility/getSteamIdFormSubmit.js";
import donateInteraction from "./utility/donateInteraction.js";
import checkDonateNew from "./utility/checkDonateNew.js";
import bonusInteraction from "./utility/bonusInteraction.js";
import checkVipInteraction from "./utility/checkVipInteraction.js";

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

client.commands = new Collection();
const commands = await getCommands();

for (const command of commands) {
  if ("data" in command && "execute" in command)
    client.commands.set(command.data.name, command);
  else logger.verbose("discord", 1, `The command missing! in index.js`);
}

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // Список каналов
  const leaderboadChannelMainId = client.channels.cache.get(
    "1069615679281561600"
  );
  const leaderboadChannelTempId = client.channels.cache.get(
    "1119326545572544562"
  );
  const guildId = client.guilds.cache.get("735515208348598292");
  const donateChannelId = client.channels.cache.get("1073712072220754001");
  const checkDonateChannelId = client.channels.cache.get("1073712072220754001");
  const vipChannelId = client.channels.cache.get("819484295709851649");
  const vipBonusChannelId = client.channels.cache.get("1161743444411175024");
  const bansChannelId = "1115705521119440937";
  const memeChannelId = "1151479560047706162";
  const activitiAdminsChannelId = process.env.ADMINACTIVITY_CHANNELID;
  const vipManualChannelId = process.env.VIP_CHANNELID;
  const statsChannesId1 = process.env.STATS_CHANNELID;
  const statsChannesId2 = process.env.STATS_CHANNELID2;
  const db = process.env.DATABASE_URL;
  const steamApi = process.env.STEAM_API;
  const donateUrl = process.env.DONATE_URL;
  const adminsUrl = process.env.ADMINS_URL;

  setInterval(() => {
    checkDonateNew(guildId, db, steamApi);
    console.log("checkDonate");
  }, 60000);

  // Обновление двух таблиц лидеров
  setInterval(() => {
    top20StatsMain(leaderboadChannelMainId, db);
    top20StatsTemp(leaderboadChannelTempId, db);
    //chartInitialization(tickRateChannelId);
  }, 600000);

  // Очистка Vip пользователей, удаление ролей + отправка им уведомлений
  cleaner.vipCleaner((ids) =>
    ids.forEach(async (element) => {
      let role =
        guildId.roles.cache.find((r) => r.name === "VIP") ||
        (await guildId.roles.fetch("1072902141666136125"));
      let getUserList = await guildId.members
        .fetch({ cache: true })
        .catch(console.error);
      let findUser = getUserList.find((r) => r.user.id === element);
      if (!findUser) return;
      findUser
        .send(
          "Ваш Vip статус на сервере RNS закончился, для продления вип статуса перейдите по ссылке https://discord.com/channels/735515208348598292/983671106680528897"
        )
        .catch((error) => {
          console.log("Невозможно отправить сообщение пользователю");
        });
      findUser.roles.remove(role);
    })
  );

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // if (message.channelId === "1189653903738949723") {
    //   const imagePath1 = "../image1.png";
    //   const imagePath2 = "../image2.png";

    //   const attachment1 = new AttachmentBuilder(imagePath1, {
    //     name: "image1.png",
    //   });
    //   const attachment2 = new AttachmentBuilder(imagePath2, {
    //     name: "image2.png",
    //   });

    //   message.channel.send({ files: [attachment2] });

    //   const embed1 = new EmbedBuilder().setColor("#275318").setDescription(
    //     `⠀⠀В награду за активность на наших игровых серверах, мы поощряем игроков предоставлением **VIP** статуса. Для этого в игре действует система бонусных баллов.
    //       ⠀Каждому игроку начисляется 1 бонусный балл за 1 минуту, проведенную на игровом сервере, на обычной карте и 2 бонусных балла за 1 минуту на seed-карте.
    //       ⠀За каждые __15000 бонусных__ баллов можно активировать **VIP** статус сроком на 1 месяц. Узнать количество начисленных бонусных баллов можно в игре на нашем сервере написав в чат команду \`"!bonus"\`.

    //       ⠀Чтобы активировать **VIP** за бонусные баллы нажмите на кнопку \`"VIP статус за бонусные баллы"\`.

    //       ⠀Пожалуйста, обратите внимание, что **VIP** статус в игре начнет действовать только после смены карты на сервере!`
    //   );

    //    message.channel.send({ embeds: [embed1] });

    //   const cancel = new ButtonBuilder()
    //     .setCustomId("donatVip")
    //     .setLabel("VIP статус за донат")
    //     .setStyle("Success");

    //   const bonus = new ButtonBuilder()
    //     .setCustomId("bonusVip")
    //     .setLabel("VIP статус за бонусные баллы")
    //     .setStyle("Success");

    //   const checkVip = new ButtonBuilder()
    //     .setCustomId("checkVip")
    //     .setLabel("Проверить VIP статус")
    //     .setStyle("Primary");

    //   const row = new ActionRowBuilder().addComponents(cancel, bonus, checkVip);

    //   await message.channel.send({
    //     components: [row],
    //   });
    // }

    // Автоудаление сообщений в каналах в которых можно использовать только команды
    const allowedCommandChannels = [
      activitiAdminsChannelId,
      vipManualChannelId,
      statsChannesId1,
      statsChannesId2,
    ];

    if (allowedCommandChannels.includes(message.channel.id)) {
      if (!message.interaction) {
        try {
          await message.delete();
        } catch (error) {
          console.error("Error deleting message:", error);
        }
      }
    }

    const user = message.guild.members.cache.get(message.author.id);
    const vipRole = message.guild.roles.cache.get("1072902141666136125");

    // Канал для вывода списка донатов
    if (message.channelId === checkDonateChannelId.id)
      await getDonate(process.env.DONATE_URL, donateChannelId);

    // Канал для автовыдачи Vip слота за бонусы
    if (message.channelId === vipBonusChannelId.id) {
      client.users.fetch("132225869698564096", false).then((user) => {
        user.send(`${message.author.username}\n${message.content} VIP бонус`);
      }); //Отправляет уведомление в лс меламори

      await getSteamIDFromMessage(
        true,
        db,
        message,
        steamApi,
        donateUrl,
        vipRole,
        user,
        (result) => {}
      );
    }

    // Канал для автовыдачи Vip слота
    if (message.channelId === vipChannelId.id) {
      console.log(
        `Получен запрос на получение Vip слота от игрока ${message.author.username}`
      );

      client.users.fetch("132225869698564096", false).then((user) => {
        user.send(`${message.author.username}\n${message.content} VIP донат`);
      }); //Отправляет уведомление в лс меламори

      await getSteamIDFromMessage(
        false,
        db,
        message,
        steamApi,
        donateUrl,
        vipRole,
        user,
        (result) => {}
      );
    }

    if (bansChannelId.includes(message.channelId)) {
      getBanFromBattlemetrics(message);
    }

    if (memeChannelId.includes(message.channelId)) {
      if (message.attachments.size > 0) {
        const isImage = message.attachments.every(
          (attachment) =>
            /\.(jpg|jpeg|png|gif)$/.test(attachment.url) ||
            /\.(jpg|jpeg|png|gif)(\?.*)?$/.test(attachment.url)
        );

        if (!isImage) {
          message.delete();
        }
      } else if (
        !/\.(jpg|jpeg|png|gif)$/.test(message.content) &&
        !/\.(jpg|jpeg|png|gif)(\?.*)?$/.test(message.content)
      ) {
        message.delete();
      }
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    const command = interaction.client.commands.get(interaction.commandName);

    if (interaction.isModalSubmit()) {
      const steamIdField = interaction.fields.fields.get("steamid64input");

      if (steamIdField) {
        const steamLink = steamIdField.value;
        getSteamIdFormSubmit(interaction, steamLink, db, steamApi);
      }
    }

    if (interaction.isChatInputCommand()) {
      try {
        await command.execute(interaction);
      } catch (error) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isButton()) {
      const commandName = interaction?.message?.interaction?.commandName;
      const buttonId = interaction?.customId;

      if (buttonId === "SteamID") {
        await getSteamIdModal(interaction);
      }
      if (buttonId === "donatVip") {
        await donateInteraction(interaction, db);
      }
      if (buttonId === "bonusVip") {
        await bonusInteraction(interaction, db);
      }
      if (buttonId === "checkVip") {
        await checkVipInteraction(interaction, adminsUrl);
      }

      if (commandName === "restart") {
        const userID = interaction.user.id;
        const { customId } = interaction;
        const serverNumber = customId.replace("server", "");

        try {
          exec(`pm2 restart SERVER${serverNumber}`, (error) => {
            if (error) {
              console.error(`Ошибка: ${error}`);
            }
          });

          await interaction.channel.send({
            content: `<@${userID}> Бот #${serverNumber} RNS перезагружен!`,
          });
          await buttonInteraction(interaction);
          console.log(`<@${userID}> Бот #${serverNumber} RNS перезагружен!`);
        } catch (error) {
          console.error("Ошибка при обработке взаимодействия:", error);
        }
        return;
      }
    }
  });
});

await client.login(process.env.CLIENT_TOKEN);
