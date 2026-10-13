import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import satori from "satori";
import sharp from "sharp";

const width = 1200;
const height = 630;
const projectRoot = new URL("../", import.meta.url);
const outputPath = new URL("public/og-nuestra-boda.png", projectRoot);

const [romanticFont, ralewayFont] = await Promise.all([
  readFile(new URL("app/fonts/romantic-lovely.ttf", projectRoot)),
  readFile(new URL("app/fonts/raleway-300.ttf", projectRoot)),
]);

const card = {
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f6f7ec",
      color: "#171715",
      padding: "42px",
    },
    children: {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #8a9fb4",
          background: "#ffffff",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Romantic Lovely",
                fontSize: "172px",
                fontWeight: 400,
                lineHeight: 0.72,
                marginTop: "18px",
              },
              children: [
                { type: "div", props: { children: "Nuestra" } },
                { type: "div", props: { style: { marginTop: "22px" }, children: "Boda" } },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                width: "520px",
                height: "1px",
                marginTop: "36px",
                background: "#cd9d9d",
              },
              children: "",
            },
          },
          {
            type: "div",
            props: {
              style: {
                marginTop: "25px",
                fontFamily: "Raleway",
                fontSize: "34px",
                fontWeight: 300,
                letterSpacing: "12px",
                textTransform: "uppercase",
              },
              children: "WALTER Y YOVANA",
            },
          },
        ],
      },
    },
  },
};

const svg = await satori(card, {
  width,
  height,
  fonts: [
    { name: "Romantic Lovely", data: romanticFont, weight: 400, style: "normal" },
    { name: "Raleway", data: ralewayFont, weight: 300, style: "normal" },
  ],
});

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(fileURLToPath(outputPath));
