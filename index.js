#!/usr/bin/env node

const commandLineArgs = require('command-line-args')
const csv = require('csv-parser')
const fs = require('fs')
const clipboardy = require('clipboardy')
const smartquotes = require('smartquotes')

const quit = (message) => {
  console.log(message)
  process.exit(9)
}

const cliOptions = [
  {name: 'input', defaultOption: true},
  {name: 'format', defaultValue: 'markdown'},
  {name: 'start', defaultValue: '1970-1-1'},
]

const cli = commandLineArgs(cliOptions)

try {

  // Ensure we have an input file to parse
  if (typeof cli.input === 'undefined') quit('You must specify an input file.')
  if (!fs.existsSync(cli.input)) quit(`Input file ${cli.input} couldn't be found or doesn't exist.`)

  // Prepare structured data
  const links = {}
  const headers = ['Name', 'Category', 'Created', 'Property', 'Summary', 'Tags', 'URL']

  // Configure minimum date
  const start = Date.parse(cli.start)
  if (isNaN(start)) quit(`We couldn't parse ${cli.start} as a date.`)

  console.log('Parsing ...')

  // Open and parse CSV
  fs.createReadStream(cli.input)
    .pipe(csv({headers, skipLines: 1}))
    .on('data', (data) => {
      let item = {}
      Object.keys(data).forEach((row) => {
        item[row] = data[row]
      })
      let parsedCreatedDate = Date.parse(item['Created'])

      if (isNaN(parsedCreatedDate) || parsedCreatedDate < start) return

      if (item['Name'].trim().length === 0) return

      // Punctuate title
      if (!['.','!','?'].includes(item['Name'].charAt(item['Name'].length - 1))) item['Name'] += '.'

      // Smart quotes for description
      item['Summary'] = smartquotes(item['Summary'])

      if (typeof links[data['Category']] === 'undefined') links[data['Category']] = {}
      if (!Array.isArray(links[data['Category']][data['Tags']])) links[data['Category']][data['Tags']] = []
      links[data['Category']][data['Tags']].push(item)
    })
    .on('end', () => {
      let output = ''
      const categories = Object.keys(links)
      categories.sort()

      categories.forEach((category) => {
        if (category) {
          switch (cli.format) {
            case 'markdown':
              output += `### ${category}\n\n`
              break;
            case 'html':
              output += `<h3>${category}</h3>\n`
              break;
          }
        }

        const tags = Object.keys(links[category])
        tags.sort()

        tags.forEach((tag) => {
          if (tag === 'Tags' || !Array.isArray(links[category][tag])) return

          if (tag) {
            switch (cli.format) {
              case 'markdown':
                output += `#### ${tag}\n\n`
                break
              case 'html':
                output += `<h4>${tag}</h4>\n`
                break
            }
          }

          links[category][tag].forEach((item) => {
            switch (cli.format) {
              case 'markdown':
                output += `[${item.Name}](${item.URL}) ${item.Summary.trim()}\n\n`
                break
              case 'html':
                output += `<p><a href="${item.URL}">${item.Name}</a> ${item.Summary.trim()}</p>\n`
                break
            }
          })

          clipboardy.writeSync(output)
          console.log(output)

        })
      })

    })

  console.log('Done')

} catch (err) {
  quit(err)
}
