import { ref, unref, type MaybeRef } from 'vue';
import { IContext } from './context';
import { camelCase, isEmpty, isObject, get, set } from '.';

export type MappingFunction = (args: { model: any, key?: string, newModel?: any, parentModel?: any, originModel?: any, context?: IContext }) => any;
export type FilterFunction = (m: any) => boolean;
export type Field = FieldObject | string
export interface FieldObject {
  key: string;
  newKey?: string;
  path?: string;
  fields?: Field[];
  mapping?: MappingFunction;
  filter?: FilterFunction;
  default?: any;
  merge?: boolean;
  scope?: string;
  omit?: string[];
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
    let updatedModel = model

    let key: string = (isObject(field) ? (field as FieldObject).newKey || (field as FieldObject).key : field) as string

    // We normalize to camelCase if format is true
    const normalizedKey = formatKey(key, format)

    // Update current value with custom path
    if (isObject(field) && (field as FieldObject).path) {
      const pathValue = get(originModel, (field as FieldObject).path)
      set(newModel, normalizedKey, pathValue)

      updatedModel = pathValue
      // We set key as new path has been created
      key = ''
    }

    // Check for empty value and handle default value
    if (isObject(field)) {
      if (updatedModel === null || isEmpty(updatedModel) || !(field as FieldObject).mapping || ((field as FieldObject).path || (!(field as FieldObject).fields)) ? false : get(updatedModel, (field as FieldObject).key) === null || get(updatedModel, (field as FieldObject).key) === undefined) {
          if (!(field as FieldObject).default) return

          set(newModel, normalizedKey, (typeof (field as FieldObject).default === 'function') ? (field as FieldObject).default(context) : (field as FieldObject).default)
          return
      }
    } else if (model === null || isEmpty(model) || get(model, field as string) === null) return

    // Return value if only key access
    if ((isObject(field) && (!(field as FieldObject).mapping && !((field as FieldObject).fields)) && !((field as FieldObject).path)) || !isObject(field)) {
      set(newModel, normalizedKey, get(model, isObject(field) ? (field as FieldObject).key as string : field as string))
      return get(newModel, normalizedKey)
    }

    const mapFields = (sourceModel: any) => {
      const hasScopeOrPath = (field as FieldObject).fields.findIndex((f: Field) => isObject(f) && ((f as FieldObject).scope || (f as FieldObject).path)) !== -1
      let currentValue = (field as FieldObject).path ? sourceModel : get(sourceModel, (field as FieldObject).key)

      // Ignore mapping if currentVaule is undefined and no field with scope / path provided
      if (!hasScopeOrPath && !currentValue) return
      else currentValue = sourceModel
    
      if (!currentValue && (field as FieldObject).default) return (field as FieldObject).default
      // Handle array
      if (Array.isArray(currentValue))
        return currentValue.filter((m: any) => {
          if ((field as FieldObject).filter) return (field as FieldObject).filter(m)
          else return true
        }).map((m: any) => {
          return extractModel((field as FieldObject).fields, m, context, format, sourceModel, originModel)
        })
      else
      {
        return extractModel((field as FieldObject).fields, currentValue, context, format, sourceModel, originModel)
      }
    }

    let result = undefined

    // Handle mapping
    if ((field as FieldObject).mapping) {
      try {
        // Mapping method should always return a value (`return` will break the `forEach` method)
        result = ((field as FieldObject).mapping as MappingFunction)({ model: (field as FieldObject).scope ? get(originModel, (field as FieldObject).scope) : updatedModel, key: (field as FieldObject).key, newModel, parentModel, originModel, context })
      } catch (err) {
        console.error('error of mapping', err)
      }
    }
    // Handle fields and inject mapping result if present
    if ((field as FieldObject).fields) result = mapFields(result ? { [`${(field as FieldObject).key}`]: result, ...parentModel } : updatedModel)
    if (!(field as FieldObject).mapping && !((field as FieldObject).fields) && (field as FieldObject).default) result = get(model, (field as FieldObject).key) || (field as FieldObject).default

    // Avoid adding mapping result when undefined
    if (result !== undefined) {
      if ((field as FieldObject).merge) Object.assign(newModel, result)
      else set(newModel, normalizedKey, result)
    }
  })

  return newModel
}

function expandWildcardFields(fields: Field[], model: any): Field[] {
  function expandField(field: Field, currentModel: any): Field[] {
    if (typeof field === 'string') {
      return field.includes('*') ? expandWildcardString(field, currentModel) : [field];
    }

    if (typeof field !== 'object') return [field];

    const { key, newKey, fields: subFields, omit = [], ...rest } = field;

    let expandedFields: Field[] = [];

    if (key.includes('*')) {
      const expandedKeys = expandWildcardString(key, currentModel);
      expandedFields = expandedKeys.map(expandedKey => {
        const subModel = get(currentModel, expandedKey);
        return {
          ...rest,
          key: expandedKey,
          ...(newKey ? { newKey: newKey.replace('*', expandedKey.split('.').pop()!) } : {}),
          ...(subFields ? { fields: expandSubFields(subFields, subModel, omit) } : {})
        };
      });
    } else {
      const subModel = get(currentModel, key);
      if (subFields) {
        expandedFields.push({
          ...(newKey ? { newKey } : {}),
          key,
          fields: expandSubFields(subFields, subModel, omit),
          ...rest
        });
      } else if (key === '*') {
        expandedFields = Object.keys(currentModel)
          .filter(k => !omit.includes(k))
          .map(k => Object.keys(rest).length ? { ...rest, key: k } : k);
      } else if (key.endsWith('.*')) {
        const baseKey = key.slice(0, -2);
        if (isObject(subModel)) {
          expandedFields = Object.keys(subModel)
            .filter(k => !omit.includes(k))
            .map(k => `${baseKey}.${k}`);
        }
      } else {
        expandedFields.push(field);
      }
    }

    return expandedFields;
  }

  function expandSubFields(subFields: Field[], subModel: any, omit: string[]): Field[] {
    let expandedSubFields: Field[] = [];
    let customFields: Field[] = [];

    subFields.forEach(subField => {
      if (typeof subField === 'object' && !subField.key?.includes('*')) {
        customFields.push(subField);
      } else {
        const subSubModel = Array.isArray(subModel) ? subModel[0] : subModel;
        expandedSubFields = [...expandedSubFields, ...expandField(subField, subSubModel)];
      }
    });

    if (subFields.includes('*')) {
      const subSubModel = Array.isArray(subModel) ? subModel[0] : subModel;
      const allKeys = isObject(subSubModel) ? Object.keys(subSubModel) : [];
      expandedSubFields = [
        ...expandedSubFields,
        ...allKeys.filter(k => !omit.includes(k) && !expandedSubFields.some(f => (typeof f === 'string' ? f : f.key) === k))
      ];
    }

    expandedSubFields = expandedSubFields.filter(f => 
      typeof f === 'string' ? !omit.includes(f) : !omit.includes(f.key)
    );

    return [...expandedSubFields, ...customFields];
  }

  return fields.flatMap(field => expandField(field, model));
}

function expandWildcardString(str: string, model: any): string[] {
  const parts = str.split('.');
  const wildcardIndex = parts.indexOf('*');
  
  if (wildcardIndex === -1) return [str];

  const beforeWildcard = parts.slice(0, wildcardIndex);
  const afterWildcard = parts.slice(wildcardIndex + 1);

  let currentObject = model;
  for (const part of beforeWildcard) {
    currentObject = currentObject[part];
    if (!currentObject) return [str];
  }

  if (!isObject(currentObject)) return [str];

  return Object.keys(currentObject)
    .map(key => [...beforeWildcard, key, ...afterWildcard].join('.'));
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