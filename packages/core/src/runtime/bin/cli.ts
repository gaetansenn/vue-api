#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { generateComposables } from '../utils/export'

const main = defineCommand({
  meta: {
    name: 'generate-composables',
    version: '1.0.0',
    description: 'A tool to generate composables',
  },
  args: {
    dir: {
      type: 'positional',
      description: 'Path to the base directory',
      required: false
    },
  },
  async run({ args }) {
    await generateComposables(args).catch((error) => {
      console.error('Error while generating composables:', error)
      process.exit(1)
    })
  },
})

runMain(main)
