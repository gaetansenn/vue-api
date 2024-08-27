import type { MaybeRef } from 'vue';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import camelCase from 'lodash/camelCase';
import { IContext } from './context';

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
    const key: string = (isObject(field) ? field.newKey || field.key : field) as string

    // We normalize to camelCase if format is true
    const normalizedKey = formatKey(key, format)

    // @ts-ignore: Ignoring the TypeScript error on the next line
    if (typeof (field as Field).fields === 'function') fields = (field as Field).fields(context)

    // Check for empty value
    if (isObject(field)) {
      if (model === null || isEmpty(model) || model[field.key as string] === null) {
        if (!field.default) return

        newModel[normalizedKey] = (typeof field.default === 'function') ? field.default(context) : field.default
        return newModel[normalizedKey]
      }
    } else if (model === null || isEmpty(model) || model[field] === null) return

    // Return value if only key access
    if ((isObject(field) && (!field.mapping && !field.fields)) || !isObject(field)) {
      newModel[normalizedKey] = model[isObject(field) ? field.key as string : field]
      return newModel[normalizedKey]
    }

    // Mapping method should always return a value (`return` will break the `forEach` method)
    const mapMapping = () => (field.mapping  as MappingFunction)({ model, key: field.key, newModel, parentModel, originModel, context })
    const mapFields = (sourceModel: any) => {
      if (!sourceModel[field.key as string] && field.default) return field.default
      if (Array.isArray(sourceModel[field.key as string]))
        return sourceModel[field.key as string].filter((m: any) => {
          if (field.filter) return field.filter(m)
          else return true
        }).map((m: any) => extractModel(field.fields, m, context, format, sourceModel, originModel))
      else
        return extractModel(field.fields, sourceModel[field.key as string], context, format, sourceModel, originModel)
    }

    let result = false

    // Handle mapping
    if (field.mapping) {
      try {
        result = mapMapping()
      } catch (err) {
        console.log('error of mapping', err)
      }
    }
    // Handle fields and inject mapping result if present
    if (field.fields) result = mapFields(result ? { [`${field.key}`]: result, ...parentModel } : model)
    if (!field.mapping && !field.fields && field.default) result = model[field.key as string] || field.default

    // Avoid adding mapping result when null
    if (field.merge && result !== null) Object.assign(newModel, result)
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