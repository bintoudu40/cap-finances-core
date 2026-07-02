// @ts-nocheck
import printValue from '../printValue';

export const locale = {
  mixed: {
    default: '${path} est invalide',
    required: '${path} est un champ obligatoire',
    oneOf: '${path} doit être l\'une des valeurs suivantes : ${values}',
    notOneOf: '${path} ne doit pas être l\'une des valeurs suivantes : ${values}',
    notType: ({ path, type, value, originalValue }) => {
      let isCast = originalValue != null && originalValue !== value;
      let msg =
        `${path} doit être de type \`${type}\`, ` +
        `mais la valeur finale était : \`${printValue(value, true)}\`` +
        (isCast
          ? ` (convertie depuis la valeur \`${printValue(originalValue, true)}\`).`
          : '.');
      if (value === null) {
        msg += `\n Si "null" est voulu comme valeur vide, marquez le schéma avec \`.nullable()\``;
      }
      return msg;
    },
    defined: '${path} doit être défini',
  },
  string: {
    length: '${path} doit contenir exactement ${length} caractères',
    min: '${path} doit contenir au moins ${min} caractères',
    max: '${path} doit contenir au maximum ${max} caractères',
    matches: '${path} doit correspondre à : "${regex}"',
    email: '${path} doit être une adresse e-mail valide',
    url: '${path} doit être une URL valide',
    trim: '${path} ne doit pas contenir d\'espaces en début ou fin',
    lowercase: '${path} doit être en minuscules',
    uppercase: '${path} doit être en majuscules',
  },
  number: {
    min: '${path} doit être supérieur ou égal à ${min}',
    max: '${path} doit être inférieur ou égal à ${max}',
    lessThan: '${path} doit être inférieur à ${less}',
    moreThan: '${path} doit être supérieur à ${more}',
    notEqual: '${path} ne doit pas être égal à ${notEqual}',
    positive: '${path} doit être un nombre positif',
    negative: '${path} doit être un nombre négatif',
    integer: '${path} doit être un entier',
  },
  date: {
    min: '${path} doit être postérieur à ${min}',
    max: '${path} doit être antérieur à ${max}',
  },
  boolean: {},
  object: {
    noUnknown: '${path} ne peut pas avoir de clés non définies dans la forme de l\'objet',
  },
  array: {
    min: '${path} doit contenir au moins ${min} éléments',
    max: '${path} doit contenir au maximum ${max} éléments',
  },
};
