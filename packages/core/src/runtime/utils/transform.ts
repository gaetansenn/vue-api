import type { MaybeRef } from 'vue';
import { IContext } from './context';
import { camelCase, isEmpty, isObject } from '.';

export type MappingFunction = (args: { model: any, key?: string, newModel?: any, parentModel?: any, originModel?: any, context?: IContext }) => any;
export type FilterFunction = (m: any) => boolean;
export type Field = FieldObject | string
export interface FieldObject {
  key?: string; // original key to read
  newKey?: string; // new key to rename to
  fields?: FieldObject[] | FieldFunction;
  mapping?: MappingFunction;
  filter?: FilterFunction;
  default?: any;
  merge?: boolean;
}


export type FieldFunction = (context?: IContext) => FieldObject[];
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

function extractModel<T>(fields: (Field[] | FieldFunction) = [], model: any, context?: IContext, format?: TransformFormat, parentModel?: any, originModel?: any): T | null | undefined {
  if (isEmpty(model)) return null;

  // Inject originInput
  if (!originModel) originModel = model

  // Init output model
  const newModel: any = {}

  if (typeof fields === 'function') fields = fields(context)

  fields.forEach((field: Field) => {
    const key: string = (isObject(field) ? (field as FieldObject).newKey || (field as FieldObject).key : field) as string

    // We normalize to camelCase if format is true
    const normalizedKey = formatKey(key, format)

    // @ts-ignore: Ignoring the TypeScript error on the next line
    if (typeof (field as Field).fields === 'function') fields = (field as Field).fields(context)

    // Check for empty value
    if (isObject(field)) {
      if (model === null || isEmpty(model) || model[(field as FieldObject).key as string] === null) {
        if (!(field as FieldObject).default) return

        newModel[normalizedKey] = (typeof (field as FieldObject).default === 'function') ? (field as FieldObject).default(context) : (field as FieldObject).default
        return newModel[normalizedKey]
      }
    } else if (model === null || isEmpty(model) || model[field as string] === null) return

    // Return value if only key access
    if ((isObject(field) && (!(field as FieldObject).mapping && !((field as FieldObject).fields))) || !isObject(field)) {
      newModel[normalizedKey] = model[isObject(field) ? (field as FieldObject).key as string : field as string]
      return newModel[normalizedKey]
    }

    // Mapping method should always return a value (`return` will break the `forEach` method)
    const mapMapping = () => ((field as FieldObject).mapping as MappingFunction)({ model, key: (field as FieldObject).key, newModel, parentModel, originModel, context })
    const mapFields = (sourceModel: any) => {
      if (!sourceModel[(field as FieldObject).key as string] && (field as FieldObject).default) return (field as FieldObject).default
      if (Array.isArray(sourceModel[(field as FieldObject).key as string]))
        return sourceModel[(field as FieldObject).key as string].filter((m: any) => {
          if ((field as FieldObject).filter) return (field as FieldObject).filter(m)
          else return true
        }).map((m: any) => extractModel((field as FieldObject).fields, m, context, format, sourceModel, originModel))
      else
        return extractModel((field as FieldObject).fields, sourceModel[(field as FieldObject).key as string], context, format, sourceModel, originModel)
    }

    let result = false

    // Handle mapping
    if ((field as FieldObject).mapping) {
      try {
        result = mapMapping()
      } catch (err) {
        console.log('error of mapping', err)
      }
    }
    // Handle fields and inject mapping result if present
    if ((field as FieldObject).fields) result = mapFields(result ? { [`${(field as FieldObject).key}`]: result, ...parentModel } : model)
    if (!(field as FieldObject).mapping && !((field as FieldObject).fields) && (field as FieldObject).default) result = model[(field as FieldObject).key as string] || (field as FieldObject).default

    // Avoid adding mapping result when null
    if ((field as FieldObject).merge && result !== null) Object.assign(newModel, result)
    else newModel[normalizedKey] = result
  })

  return newModel
}

export function useTransform<T>(model: MaybeRef<T>, fields: (Field[] | FieldFunction) = [], context?: IContext, options?: ITransformOptions) {
  function getEmpty<T> (fields: Field[] = []) {
    const model: T = {} as T

    fields.forEach((field) => {
      if (typeof field === 'string') model[field as keyof T] = null as any
      else model[field.key as keyof T] = null as any
    })

    return model
  }

  return {
    getEmpty,
    value: extractModel(fields, model, context, options?.format)
  }
}