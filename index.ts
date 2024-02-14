import bench from "benny";
import { MessageTemplateItem, SendbirdTheme } from "./types";
import { mapData, selectColorVariablesByTheme } from "./parser";
import {
  dummyMessageTemplateMessageOne,
  dummyMessageTemplateMessageTwo,
} from "./templates";

const parseTemplateWithRecursive = (
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

const parseTemplateWithReplace = (
  templateString: string,
  colorVariables: Record<string, string>,
  theme: SendbirdTheme,
): MessageTemplateItem[] => {
  const selectedThemeColorVariables = selectColorVariablesByTheme({
    colorVariables,
    theme,
  });

  Object.entries(selectedThemeColorVariables).forEach(([key, value]) => {
    templateString = templateString.replace(new RegExp(`{${key}}`, "g"), value);
  });

  return JSON.parse(templateString).body.items;
};

const parseTemplateWithReplaceReplacer = (
  templateString: string,
  colorVariables: Record<string, string>,
  theme: SendbirdTheme,
): MessageTemplateItem[] => {
  const selectedThemeColorVariables = selectColorVariablesByTheme({
    colorVariables,
    theme,
  });

  const string = templateString.replace(/{([^{}]+)}/g, (_, placeholder) => {
    const value = selectedThemeColorVariables[placeholder];
    return value || `{${placeholder}}`;
  });

  console.log(string);

  return JSON.parse(string).body.items;
};

const parseTemplateWithReplaceAll = (
  templateString: string,
  colorVariables: Record<string, string>,
  theme: SendbirdTheme,
): MessageTemplateItem[] => {
  const selectedThemeColorVariables = selectColorVariablesByTheme({
    colorVariables,
    theme,
  });

  Object.entries(selectedThemeColorVariables).forEach(([key, value]) => {
    templateString = templateString.replaceAll(`{${key}}`, value);
  });

  return JSON.parse(templateString).body.items;
};

const colorA = JSON.parse(dummyMessageTemplateMessageOne.data).colorVariables;
const colorB = JSON.parse(dummyMessageTemplateMessageTwo.data).colorVariables;

// console.log(
//   "1",
//   parseTemplateWithReplace(
//     dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
//     colorA,
//     "light",
//   ),
// );
//
// console.log(
//   "2",
//   parseTemplateWithReplaceReplacer(
//     dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
//     colorA,
//     "light",
//   ),
// );
//
// console.log(
//   "3",
//   parseTemplateWithRecursive(
//     JSON.parse(dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data)
//       .body.items,
//     colorA,
//     "light",
//   ),
// );
//
bench.suite(
  "template parsing",
  bench.add("replace - A", () => {
    parseTemplateWithReplace(
      dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
      colorA,
      "light",
    );
  }),
  bench.add("replace - B", () => {
    parseTemplateWithReplace(
      dummyMessageTemplateMessageTwo.extendedMessagePayload.sub_data,
      colorB,
      "light",
    );
  }),

  bench.add("replace+replacer - A", () => {
    parseTemplateWithReplaceReplacer(
      dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
      colorA,
      "light",
    );
  }),
  bench.add("replace+replacer - B", () => {
    parseTemplateWithReplaceReplacer(
      dummyMessageTemplateMessageTwo.extendedMessagePayload.sub_data,
      colorB,
      "light",
    );
  }),

  bench.add("replaceAll - A", () => {
    parseTemplateWithReplaceAll(
      dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
      colorA,
      "light",
    );
  }),
  bench.add("replaceAll - B", () => {
    parseTemplateWithReplaceAll(
      dummyMessageTemplateMessageTwo.extendedMessagePayload.sub_data,
      colorB,
      "light",
    );
  }),

  bench.add("recursive - A", () => {
    const templateItems = JSON.parse(
      dummyMessageTemplateMessageOne.extendedMessagePayload.sub_data,
    ).body.items;
    parseTemplateWithRecursive(templateItems, colorA, "light");
  }),
  bench.add("recursive - B", () => {
    const templateItems = JSON.parse(
      dummyMessageTemplateMessageTwo.extendedMessagePayload.sub_data,
    ).body.items;
    parseTemplateWithRecursive(templateItems, colorB, "light");
  }),

  bench.cycle(),
  bench.complete(),
  bench.save({ file: "result", format: "chart.html" }),
);
