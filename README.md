# Notion links to blog post

This node script takes a CSV export of a Notion link database and turns it into a markdown or HTML formatted blog post.

## Get started

Make sure you have node and npm installed.

Then: `npm install`

## Usage

You can run this with `node index.js input-file.csv > output.md`

Optionally, include the parameter `format` set to `html` to output to an HTML file. For example:

`node index.js input-file.csv --format=html > output.html`

This script is also designed to be run directly and aliased from your bash profile. Once you give it execution rights, you can just run:

`./index.js input.csv > output.md`
