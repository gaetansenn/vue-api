import { ref, unref, type MaybeRef } from 'vue';
import { IContext } from './context';
import { camelCase, isEmpty, isObject, get, set } from '.';

export type MappingFunction = (args: { model: any, key?: string, newModel?: any, parentModel?: any, originModel?: any, context?: IContext }) => any;
export type FilterFunction = (m: any) => boolean;
export type Field = FieldObject | string

type WithoutBoth<T, K1 extends keyof T, K2 extends keyof T> = 
  (T & { [K in K1]?: never } & { [K in K2]?: never }) | 
  (T & { [K in K1]: T[K1] } & { [K in K2]?: never }) | 
  (T & { [K in K1]?: never } & { [K in K2]: T[K2] });

export interface FieldObjectBase {
  key: string;
  newKey?: string;
  fields?: Field[];
  mapping?: MappingFunction;
  filter?: FilterFunction;
  default?: any;
  merge?: boolean;
  scope?: string;
  path?: string;
  omit?: string[];
}

export type FieldObject = WithoutBoth<FieldObjectBase, 'scope', 'path'>;

export type TransformFormat = 'camelCase';

export interface ITransformOptions {
  scope?: string;
  format?: TransformFormat;
  context?: IContext;
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

    const hasPath = (field as FieldObject).path
    const hasScope = (field as FieldObject).scope

    let key: string = (isObject(field) ? (field as FieldObject).newKey || (field as FieldObject).key : field) as string

    // We normalize to camelCase if format is true
    const normalizedKey = formatKey(key, format)

    // Update current value with custom path
    if (isObject(field) && ((field as FieldObject).path || (field as FieldObject).scope)) {
      const pathValue = get(originModel, (field as FieldObject).path || (field as FieldObject).scope)

      if ((field as FieldObject).path) set(newModel, normalizedKey, pathValue)

      updatedModel = pathValue
      // We set key as new path has been created
      if ((field as FieldObject).path) key = ''
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
      const hasFieldsScopeOrPath = (field as FieldObject).fields.findIndex((f: Field) => isObject(f) && ((f as FieldObject).scope || (f as FieldObject).path)) !== -1

      // Ignore mapping if currentVaule is undefined and no field with scope / path provided
      if (!hasFieldsScopeOrPath && !sourceModel) return
    
      if (!sourceModel && (field as FieldObject).default) return (field as FieldObject).default

      // We inject model with key if no scope or path
      if (!hasScope && !hasPath) {
        sourceModel = get(sourceModel, (field as FieldObject).key as string)
      }

      // Handle array
      if (Array.isArray(sourceModel))
        return sourceModel.filter((m: any) => {
          if ((field as FieldObject).filter) return (field as FieldObject).filter(m)
          else return true
        }).map((m: any) => {
          return extractModel((field as FieldObject).fields, m, context, format, sourceModel, originModel)
        })
      else
      {
        return extractModel((field as FieldObject).fields, sourceModel, context, format, sourceModel, originModel)
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
  const createFieldObject = (field: FieldObjectBase): FieldObject => {
    const { scope, path, ...rest } = field;
    
    if (scope && path) {
      throw new Error("FieldObject cannot have both 'scope' and 'path'.");
    }
  
    return {
      ...rest,
      ...(scope ? { scope } : {}),
      ...(path ? { path } : {}),
    } as FieldObject
  };

  function expandField(field: Field, currentModel: any): Field[] {
    if (typeof field === 'string') {
      return expandWildcardString(field, currentModel).map(expandedField => expandedField);
    }

    if (typeof field !== 'object') return [field];

    const { key, newKey, fields: subFields, omit = [], path, ...rest } = field;

    let expandedFields: Field[] = [];
    let subModel = path ? get(model, path) : get(currentModel, key);

    if (key.includes('*')) {
      const expandedKeys = expandWildcardString(key, currentModel);
      expandedFields = expandedKeys.flatMap(expandedKey => {
        if (subFields) {
          return {
            key: expandedKey,
            fields: expandSubFields(subFields, get(currentModel, expandedKey), omit),
            ...rest
          };
        } else {
          return expandedKey;
        }
      });
    } else if (key === '*' && Array.isArray(subModel)) {
      expandedFields = subModel.map((_, index) => `${index}`);
    } else {
      if (subFields) {
        expandedFields.push(createFieldObject({
          ...(newKey ? { newKey } : {}),
          key,
          fields: expandSubFields(subFields, subModel, omit),
          ...rest,
          ...(path ? { path } : {})
        }))
      } else if (key === '*') {
        if (isObject(subModel)) {
          expandedFields = Object.keys(subModel)
            .filter(k => !omit.includes(k));
        }
      } else if (key.endsWith('.*')) {
        const baseKey = key.slice(0, -2);
        if (isObject(subModel)) {
          expandedFields = Object.keys(subModel)
            .filter(k => !omit.includes(k))
            .map(k => `${baseKey}.${k}`);
        }
      } else {
        expandedFields.push(createFieldObject({ ...field, ...(path ? { path } : {}) }));
      }
    }

    // Apply omit filter after expansion for wildcard fields
    if ((key === '*' || key.endsWith('.*')) && omit.length > 0) {
      expandedFields = expandedFields.filter(f => {
        const fieldKey = typeof f === 'string' ? f : f.key;
        return !omit.includes(fieldKey);
      });
    }

    return expandedFields;
  }

  function expandSubFields(subFields: Field[], subModel: any, parentOmit: string[]): Field[] {
    let expandedSubFields: Field[] = [];
    let customFields: Field[] = [];

    subFields.forEach(subField => {
      if (typeof subField === 'object' && subField.key === '*') {
        if (isObject(subModel)) {
          const omit = [...parentOmit, ...(subField.omit || [])];
          expandedSubFields = Object.keys(subModel)
            .filter(k => !omit.includes(k))
            .map(k => k);
        }
      } else if (typeof subField === 'object' && !subField.key?.includes('*')) {
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
        ...allKeys.filter(k => !parentOmit.includes(k) && !expandedSubFields.some(f => (typeof f === 'string' ? f : f.key) === k))
      ];
    }

    return [...expandedSubFields, ...customFields];
  }

  // Apply omit filter at the end of the entire expansion process
  const expandedFields = fields.flatMap(field => expandField(field, model));
  return expandedFields.filter(field => {
    if (typeof field === 'object' && field.key === '*' && field.omit) {
      return !field.omit.includes(field.key);
    }
    return true;
  });
}

function expandWildcardString(str: string, model: any): string[] {
  const parts = str.split('.');
  const wildcardIndex = parts.indexOf('*');
  
  if (wildcardIndex === -1) return [str];

  const beforeWildcard = parts.slice(0, wildcardIndex);
  const afterWildcard = parts.slice(wildcardIndex + 1);

  let currentObject = model;
  for (const part of beforeWildcard) {
    if (!currentObject || typeof currentObject !== 'object') return [str];
    currentObject = currentObject[part];
  }

  if (!currentObject || typeof currentObject !== 'object') return [str];

  return Object.keys(currentObject).flatMap(key => {
    const newStr = [...beforeWildcard, key, ...afterWildcard].join('.');
    if (newStr.includes('*')) {
      return expandWildcardString(newStr, model);
    }
    return [newStr];
  });
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
    value: extractModel(expandedFields, unrefModel, options?.context || {}, options?.format)
  };
}

// const input = {
//   user: {
//     name: 'Jane Doe',
//     details: {
//       age: 25,
//       city: 'New York',
//     },
//   },
// };

// const fields = [
//   {
//     key: 'user', 
//     fields: [
//       'name',
//       {
//         key: 'details', 
//         fields: [
//           'age',
//           { key: 'city', newKey: 'location' },
//         ]
//       },
//     ]
//   },
// ];

export function newExtractModel<T>(fields: Field[], model: any, format?: TransformFormat, parentModel?: any, originModel?: any) {
  // Ignore empty model
  if (isEmpty(model)) return null;

  // Init originModel for recursive
  if (!originModel) originModel = model

  // Init output model
  const outputModel: any = {}

  const currentModel = model

  fields.forEach((field: Field) => {
    const isObjectField = isObject(field)
    const hasMapping = (field as FieldObject).mapping
    const hasFields = (field as FieldObject).fields
    const hasPath = (field as FieldObject).path

    let key: string = (isObjectField ? (field as FieldObject).newKey || (field as FieldObject).key : field) as string
   
    // We normalize to camelCase if format is true
    const normalizedKey = formatKey(key, format)

    // Return value if only key access
    if (isObjectField && !hasMapping && !hasFields && !hasPath || !isObject(field)) {
      set(outputModel, normalizedKey, get(model, isObject(field) ? (field as FieldObject).key as string : field as string))

      // Exist current field iteration
      return
    }

    let result: any = undefined

    // Map field function 
    const mapField = () => {
      // We check if key is 
      const sourceModel = currentModel[normalizedKey]

      if (Array.isArray(sourceModel)) return sourceModel.map((item: any) => newExtractModel((field as FieldObject).fields, item, format, currentModel, originModel))
      else return newExtractModel((field as FieldObject).fields, sourceModel, format, currentModel, originModel)
    }

    // Handle object field
    if (isObjectField && hasFields) {
      result = mapField()
    }

    if (result !== undefined) {
      set(outputModel, normalizedKey, result)
    }
  })

  return outputModel
}

export function newUseTransform<T>(model: MaybeRef<T>, fields: Field[], options?: ITransformOptions) {
  const unrefModel = unref(model);

  return newExtractModel(fields, unrefModel, options?.format)
}