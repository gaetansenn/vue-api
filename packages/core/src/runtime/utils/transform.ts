import { ref, unref, type MaybeRef } from 'vue';
import { IContext } from './context';
import { camelCase, isEmpty, isObject, get, set } from '.';

export type MappingFunction = (args: { model: any, key?: string, newModel?: any, parentModel?: any, originModel?: any, context?: IContext }) => any;
export type FilterFunction = (m: any) => boolean;
export type Field = FieldObject | string
export interface FieldObject {
  key: string;
  newKey?: string;
  fields?: Field[];
  mapping?: MappingFunction;
  filter?: FilterFunction;
  default?: any;
  merge?: boolean;
  scope?: string;
}

export type TransformFormat = 'camelCase';

export interface ITransformOptions {
  scope?: string;
  format?: TransformFormat;
  context: IContext;
}

function formatKey (key: string, format?: TransformFormat) {
  switch (format) {
    case 'camelCase': {
      return camelCase(key)
    }
    default: return key
  }
}

function extractModel<T>(fields: Field[] = [], model: any, context?: IContext, format?: TransformFormat, parentModel?: any, originModel?: any): T | null | undefined {
  if (isEmpty(model)) return null;

  // Inject originInput
  if (!originModel) originModel = model

  // Init output model
  const newModel: any = {}

  fields.forEach((field: Field) => {
    const key: string = (isObject(field) ? (field as FieldObject).newKey || (field as FieldObject).key : field) as string

    // We normalize to camelCase if format is true
    const normalizedKey = formatKey(key, format)

    // Check for empty value and handle default value
    if (isObject(field)) {
      if (model === null || isEmpty(model) || (!(field as FieldObject).mapping) && (get(model, (field as FieldObject).key) === null || get(model, (field as FieldObject).key) === undefined)) {
        if (!(field as FieldObject).default) return

        set(newModel, normalizedKey, (typeof (field as FieldObject).default === 'function') ? (field as FieldObject).default(context) : (field as FieldObject).default)
        return
      }
    } else if (model === null || isEmpty(model) || get(model, field as string) === null) return

    // Return value if only key access
    if ((isObject(field) && (!(field as FieldObject).mapping && !((field as FieldObject).fields))) || !isObject(field)) {
      set(newModel, normalizedKey, get(model, isObject(field) ? (field as FieldObject).key as string : field as string))
      return get(newModel, normalizedKey)
    }

    const mapFields = (sourceModel: any) => {
      if (!get(sourceModel, (field as FieldObject).key) && (field as FieldObject).default) return (field as FieldObject).default
      if (Array.isArray(get(sourceModel, (field as FieldObject).key)))
        return get(sourceModel, (field as FieldObject).key).filter((m: any) => {
          if ((field as FieldObject).filter) return (field as FieldObject).filter(m)
          else return true
        }).map((m: any) => extractModel((field as FieldObject).fields, m, context, format, sourceModel, originModel))
      else
        return extractModel((field as FieldObject).fields, get(sourceModel, (field as FieldObject).key), context, format, sourceModel, originModel)
    }

    let result = false

    // Handle mapping
    if ((field as FieldObject).mapping) {
      try {
        // Mapping method should always return a value (`return` will break the `forEach` method)
        result = ((field as FieldObject).mapping as MappingFunction)({ model: (field as FieldObject).scope ? get(originModel, (field as FieldObject).scope) : model, key: (field as FieldObject).key, newModel, parentModel, originModel, context })
      } catch (err) {
        console.error('error of mapping', err)
      }
    }
    // Handle fields and inject mapping result if present
    if ((field as FieldObject).fields) result = mapFields(result ? { [`${(field as FieldObject).key}`]: result, ...parentModel } : model)
    if (!(field as FieldObject).mapping && !((field as FieldObject).fields) && (field as FieldObject).default) result = get(model, (field as FieldObject).key) || (field as FieldObject).default

    // Avoid adding mapping result when null
    if ((field as FieldObject).merge && result !== null) Object.assign(newModel, result)
    else set(newModel, normalizedKey, result)
  })

  return newModel
}

function expandWildcardFields(fields: Field[], model: any): Field[] {
  function expandField(field: Field, parentScope?: string): Field[] {
    if (typeof field === 'string') {
      return field.includes('*') ? expandWildcardString(field, model).map(f => ({ key: f })) : [{ key: field }];
    }

    if (typeof field !== 'object') return [field];

    const { key, scope, fields: subFields, ...rest } = field;

    let expandedFields: Field[] = [];
    const expandedKeys = key.includes('*') ? expandWildcardString(key, model) : [key];

    expandedKeys.forEach(expandedKey => {
      const newScope = scope || parentScope;

      if (subFields) {
        const expandedSubFields = subFields.flatMap(subField => expandField(subField, newScope || expandedKey));
        expandedFields.push({
          ...rest,
          key: expandedKey,
          ...(newScope ? { scope: newScope } : {}),
          fields: expandedSubFields
        });
      } else {
        expandedFields.push({
          ...rest,
          key: expandedKey,
          ...(newScope ? { scope: newScope } : {})
        });
      }
    });

    return expandedFields;
  }

  return fields.flatMap(field => expandField(field));
}

// Fonction auxiliaire pour expandre une chaîne contenant un wildcard
function expandWildcardString(str: string, model: any): string[] {
  const parts = str.split('.');
  const wildcardIndex = parts.indexOf('*');
  
  if (wildcardIndex === -1) return [str];

  const beforeWildcard = parts.slice(0, wildcardIndex);
  const afterWildcard = parts.slice(wildcardIndex + 1);

  let currentObject = model;
  for (const part of beforeWildcard) {
    currentObject = currentObject[part];
  }

  return Object.keys(currentObject).map(key => 
    [...beforeWildcard, key, ...afterWildcard].join('.')
  );
}

export function useTransform<T>(model: MaybeRef<T>, fields: Field[], options?: ITransformOptions) {
  const unrefModel = unref(model);
  const expandedFields = expandWildcardFields(fields, unrefModel);

  function getEmpty(): Partial<T> {
    const emptyModel: Partial<T> = {};

    function processFields(fields: Field[], currentModel: any) {
      fields.forEach(field => {
        if (typeof field === 'string') {
          set(currentModel, field, null);
        } else if (typeof field === 'object') {
          const { key, fields: subFields, default: defaultValue } = field;
          const value = defaultValue !== undefined ? defaultValue : null;
          
          if (subFields) {
            const subModel = {};
            set(currentModel, key, subModel);
            processFields(subFields, subModel);
          } else {
            set(currentModel, key, value);
          }
        }
      });
    }

    processFields(expandedFields, emptyModel);
    return emptyModel;
  }

  return {
    getEmpty,
    value: extractModel(expandedFields, unrefModel, options?.context, options?.format)
  };
}