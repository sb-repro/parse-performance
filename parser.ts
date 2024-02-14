import { MessageTemplateTheme, SendbirdTheme } from "./types";

type SourceData = Record<string, unknown>;
type MappedData = Record<string, unknown> | Array<unknown>;

interface MappingParams<T> {
  template: T;
  source: SourceData;
}

export function mapData<
  T extends Record<string, unknown> | Array<unknown> | string,
>({ template, source }: MappingParams<T>): T {
  if (!["object", "string"].includes(typeof template) || !template)
    return template;

  const regex = /\{([^}]+)\}/g;
  const flattenedSource = flattenObject(source);

  function replaceVariablePlaceholder(value: unknown) {
    return typeof value === "string"
      ? value.replace(regex, (_, placeholder) => {
          const value = flattenedSource[placeholder];
          return value || `{${placeholder}}`;
        })
      : mapData({ template: value as any, source });
  }

  if (typeof template === "string") {
    return replaceVariablePlaceholder(template) as T;
  }

  if (Array.isArray(template)) {
    return template.map(replaceVariablePlaceholder) as T;
  }

  const result: MappedData = {};
  for (const key in template) {
    if (Object.prototype.hasOwnProperty.call(template, key)) {
      const value = template[key];
      result[key] = replaceVariablePlaceholder(value);
    }
  }

  return result as T;
}

const flattenObjectHelper = (
  currentObject: Record<string, any>,
  flattenObject: Record<string, any>,
  parentKeyPath = "",
): void => {
  for (const [key, value] of Object.entries(currentObject)) {
    const currentKeyPath = parentKeyPath ? `${parentKeyPath}.${key}` : key;
    if (value && typeof value === "object") {
      flattenObjectHelper(value, flattenObject, currentKeyPath);
    } else {
      flattenObject[currentKeyPath] = value;
    }
  }
};

/**
 * Returns flattened object.
 * ex.
 * given { key-1: { key-1.1: 'value-1.1' }, key-2: 'value-2' }
 * returns { key-1.key-1.1: 'value-1.1', key-2: 'value-2' }
 */
export function flattenObject(
  object: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = {};
  flattenObjectHelper(object, result);
  return result;
}

const NumberValueKeys = [
  "version",
  "size",
  "top",
  "left",
  "right",
  "bottom",
  "maxTextLines",
  "value",
  "pixelWidth",
  "pixelHeight",
  "radius",
];


function convertArgbToRgba(string: string) {
  if (!string.startsWith("#")) {
    return string;
  }
  if (string.length === 9) {
    return `#${string.slice(3)}${string[1]}${string[2]}`;
  }
  if (string.length === 5) {
    return `#${string.slice(2)}${string[1]}`;
  }
  return string;
}

const splitColorVariables = (
  colorVariables: Record<string, any>,
): [Record<string, string>, Record<string, string>] => {
  const light = {} as Record<string, string>;
  const dark = {} as Record<string, string>;

  for (const key in colorVariables) {
    if (Object.prototype.hasOwnProperty.call(colorVariables, key)) {
      const value = colorVariables[key];
      if (typeof value === "string") {
        const [lightColor, darkColor] = value.split(",");
        light[key] = convertArgbToRgba(lightColor);
        dark[key] = convertArgbToRgba(darkColor || lightColor); // when dark color is not provided, use light color
      } else {
        light[key] = value;
        dark[key] = value;
      }
    }
  }
  return [light, dark];
};

export function selectColorVariablesByTheme({
  colorVariables,
  theme,
}: {
  colorVariables: Record<string, unknown>;
  theme: SendbirdTheme;
}): Record<string, string> {
  const [light, dark] = splitColorVariables(colorVariables);
  return theme === "light" ? light : dark;
}
