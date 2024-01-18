export function minifyAst(rules) {
  return rules.map(r => ([
    r.hash,
    r.selectors,
    r.declarations.filter(d => d.type !== 'comment').map(d => ([d.property, d.value])),
  ])).filter(r => r[2].length > 0);
}
