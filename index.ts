import bench from "benny";
import { MessageTemplateItem, SendbirdTheme } from "./types";
import { mapData, selectColorVariablesByTheme } from "./parser";
import {
  dummyMessageTemplateMessageOne,
  dummyMessageTemplateMessageTwo,
} from "./templates";

const getFilledMessageTemplateWithData = (
  template: MessageTemplateItem[],
  colorVariables: Record<string, string>,
  theme: SendbirdTheme,
): MessageTemplateItem[] => {
  const selectedThemeColorVariables = selectColorVariablesByTheme({
    colorVariables,
    theme,
  });

  return mapData({
    template,
    source: { ...selectedThemeColorVariables },
  });
};

const getFilledMessageTemplateWithDataRegex1 = (
  templateString: string,
  colorVariables: Record<string, string>,
  theme: SendbirdTheme,
): MessageTemplateItem[] => {
  const selectedThemeColorVariables = selectColorVariablesByTheme({
    colorVariables,
    theme,
  });

  Object.entries(selectedThemeColorVariables).forEach(([key, value]) => {
    templateString = templateString.replace(`{${key}}`, value);
  });

  return JSON.parse(templateString).body.items;
};

const getFilledMessageTemplateWithDataRegex2 = (
  templateString: string,
  colorVariables: Record<string, string>,
  theme: SendbirdTheme,
): MessageTemplateItem[] => {
  const selectedThemeColorVariables = selectColorVariablesByTheme({
    colorVariables,
    theme,
  });

  const string = templateString.replace(/\{([^"{}]*)}/g, (_, placeholder) => {
    const value = selectedThemeColorVariables[placeholder];
    return value || `{${placeholder}}`;
  });

  return JSON.parse(string).body.items;
};

const colorA = JSON.parse(dummyMessageTemplateMessageOne.data).colorVariables;
const colorB = JSON.parse(dummyMessageTemplateMessageTwo.data).colorVariables;

// console.log(
//   "1",
//   getFilledMessageTemplateWithDataRegex1(
//     dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
//     colorA,
//     "light",
//   ),
// );
//
// console.log(
//   "2",
//   getFilledMessageTemplateWithDataRegex2(
//     dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
//     colorA,
//     "light",
//   ),
// );
//
// console.log(
//   "3",
//   getFilledMessageTemplateWithData(
//     JSON.parse(dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data)
//       .body.items,
//     colorA,
//     "light",
//   ),
// );
// //
bench.suite(
  "template parsing",
  bench.add("parse regex-1-A", () => {
    getFilledMessageTemplateWithDataRegex1(
      dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
      colorA,
      "light",
    );
  }),
  bench.add("parse regex-1-B", () => {
    getFilledMessageTemplateWithDataRegex1(
      dummyMessageTemplateMessageTwo.extendedMessagePayload.sub_data,
      colorB,
      "light",
    );
  }),

  bench.add("parse regex-2-A", () => {
    getFilledMessageTemplateWithDataRegex2(
      dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
      colorA,
      "light",
    );
  }),
  bench.add("parse regex-2-B", () => {
    getFilledMessageTemplateWithDataRegex2(
      dummyMessageTemplateMessageTwo.extendedMessagePayload.sub_data,
      colorB,
      "light",
    );
  }),
  bench.add("parse recursively-1-A", () => {
    const templateItems = JSON.parse(
      dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
    ).body.items;
    getFilledMessageTemplateWithData(templateItems, colorA, "light");
  }),
  bench.add("parse recursively-1-B", () => {
    const templateItems = JSON.parse(
      dummyMessageTemplateMessageTwo.extendedMessagePayload.sub_data,
    ).body.items;
    getFilledMessageTemplateWithData(templateItems, colorB, "light");
  }),
  bench.cycle(),
  bench.complete(),
  bench.save({ file: "result", format: "chart.html" }),
);
