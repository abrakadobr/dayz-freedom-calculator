// vue.svg.loader.js
const SVGO = require("svgo");

module.exports = (svg) => {
  const res = SVGO.optimize(svg, {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            inlineStyles: {
              onlyMatchedOnce: false,
            },
            // Keep removeXMLProcInst and removeEditorsNSData from your original config
            removeXMLProcInst: true,
            removeEditorsNSData: true,
          },
        },
      },
    ],
  });

  const ret = `<template> ${res.data} </template>`;
  return ret;
};
