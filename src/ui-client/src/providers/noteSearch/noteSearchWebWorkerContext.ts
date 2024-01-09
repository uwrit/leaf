/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 
export const workerContext = `
const STOP_WORDS = new Set(["\\n", "\\t", "(", ")", '"', ";"])

let resultsCache
let resultsCacheTerms = ""
let unigramIndex = new Map()
let docIndex = new Map()

// eslint-disable-next-line
const handleWorkMessage = payload => {
  switch (payload.message) {
    case INDEX:
      return indexDocuments(payload)
    case FLUSH:
      return flushNotes(payload)
    case SEARCH:
      return searchNotes(payload)
    case REMOVE:
      return removeDataset(payload)
    default:
      return null
  }
}

const removeDataset = payload => {
  const { dataset } = payload
  console.log(['removing', dataset])
  docIndex.forEach((v, k, m) => {
    if (v.datasetId === dataset.id) {
      m.delete(k)
    }
  })
  unigramIndex.forEach((v, k, m) => {
    v.instances = v.instances.filter(inst => inst.datasetId !== dataset.id)
  })
  console.log('remove succeeded, searching')
  console.log([docIndex, unigramIndex])
  return searchNotes(payload)
}

const indexDocuments = payload => {
  const { requestId } = payload
  const { datasets } = payload
  const notes = []
  const patients = new Set()

  /* Process as notes */
  for (let i = 0; i < datasets.length; i++) {
    const result = datasets[i]
    const schema = result.dataset.schema
    let j = 0
    for (const patId of Object.keys(result.dataset.results)) {
      if (!patients.has(patId)) {
        patients.add(patId)
      }
      for (const row of result.dataset.results[patId]) {
        const note = {
          responderId: result.responder.id,
          id: result.responder.id + "_" + j.toString(),
          date: row[schema.sqlFieldDate],
          datasetId: result.query.id,
          personId: patId,
          text: row[schema.sqlFieldValueString],
          type: result.query.name
        }
        notes.push(note)
        j++
      }
    }
  }

  /* Index text */
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i]
    const tokens = tokenizeDocument(note)
    const doc = {
      ...note,
      date: note.date ? new Date(note.date) : undefined
    }
    let prev

    for (let j = 0; j < tokens.length; j++) {
      const token = tokens[j]
      const lexeme = token.lexeme

      if (STOP_WORDS.has(lexeme)) continue

      // Radix-tree check

      let indexed = unigramIndex.get(lexeme)

      if (indexed) {
        indexed.instances.push(token)
      } else {
        indexed = { lexeme, instances: [token], next: new Map() }
        unigramIndex.set(lexeme, indexed)
      }

      if (prev) {
        let prevIndexed = prev.next.get(lexeme)
        if (!prevIndexed) {
          prev.next.set(lexeme, indexed)
        }
      }
      prev = indexed
    }
    docIndex.set(doc.id, doc)
  }

  resultsCache = {
    documents: [],
    totalDocuments: notes.length,
    totalPatients: patients.size,
    totalTermHits: 0
  }

  return { requestId, result: resultsCache }
}

const flushNotes = payload => {
  const { requestId } = payload
  unigramIndex.clear()
  docIndex.clear()
  return { requestId }
}

const returnPaginatedResults = config => {
  const offset = config.pageNumber * config.pageSize
  const sliced = resultsCache.documents.slice(offset, offset + config.pageSize)
  return { ...resultsCache, documents: sliced }
}

const searchNotes = payload => {
  const { requestId, config, terms } = payload
  const result = {
    documents: [],
    totalDocuments: 0,
    totalPatients: 0,
    totalTermHits: 0
  }
  const searchTerms = terms.join("_")
  let precedingHits = new Map()

  /**
   * If user simply paginating, return cached results
   **/
  if (resultsCache && searchTerms === resultsCacheTerms) {
    return { requestId, result: returnPaginatedResults(config) }
  }

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i]
    const hits = search(term)

    if (!hits.size) return { requestId, result }

    if (precedingHits.size) {
      const merged = new Map()
      precedingHits.forEach((v, k) => {
        if (hits.has(k)) {
          const both = hits.get(k).concat(v)
          merged.set(k, both)
        }
      })
      precedingHits = merged
    } else {
      precedingHits = hits
    }
  }

  precedingHits.forEach((v, k) => {
    const doc = { ...docIndex.get(k), lines: [] }
    const hits = v.sort((a, b) => a.charIndex.start - b.charIndex.start)
    const context = getSearchResultDocumentContext(doc, hits)
    result.documents.push(context)
    result.totalTermHits += hits.length
  })
  result.totalPatients = new Set(result.documents.map(d => d.personId)).size
  result.totalDocuments = result.documents.length

  resultsCache = result
  resultsCacheTerms = searchTerms

  return { requestId, result: returnPaginatedResults(config) }
}

const getSearchResultDocumentContext = (doc, hits) => {
  const contextCharDistance = 50
  const groups = []

  // Group by character distance
  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i]
    const group = [hit]

    let nextIndex = 1
    while (true) {
      const nextHit = i < hits.length - 1 ? hits[i + nextIndex] : undefined

      // If overlapping
      if (
        nextHit &&
        hit.lineIndex === nextHit.lineIndex &&
        hit.charIndex.end + contextCharDistance >=
          nextHit.charIndex.start - contextCharDistance
      ) {
        // Merge lines
        group.push(nextHit)
        hits.splice(i + nextIndex, 1)
        nextIndex++
      } else {
        groups.push(group)
        break
      }
    }
  }

  const result = { ...doc, lines: [] }

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    let line = { index: group[0].lineIndex, content: [] }
    for (let j = 0; j < group.length; j++) {
      const backLimit = j > 0 ? group[j].charIndex.start : undefined
      const forwLimit =
        j < group.length - 1 ? group[j + 1].charIndex.start : undefined
      const context = getContext(
        doc,
        group[j],
        contextCharDistance,
        backLimit,
        forwLimit
      )
      line.content = line.content.concat(context)
    }
    result.lines.push(line)
  }

  return result
}

const getContext = (doc, hit, contextCharDistance, backLimit, forwLimit) => {
  const _backLimit =
    backLimit === undefined
      ? hit.charIndex.start - contextCharDistance
      : backLimit
  const _forwLimit =
    forwLimit === undefined
      ? hit.charIndex.end + contextCharDistance
      : forwLimit
  let backContext = doc.text.substring(_backLimit, hit.charIndex.start)
  let forwContext = doc.text.substring(hit.charIndex.end, _forwLimit)

  if (!backLimit && backContext) backContext = "..." + backContext
  if (!forwLimit && forwContext) forwContext += "..."

  let back_i = backContext.length - 1
  while (back_i > -1) {
    if (backContext[back_i] === "\\n") {
      backContext = backContext.substring(back_i, backContext.length - 1)
      break
    }
    back_i--
  }
  let forw_i = 1
  while (forw_i < forwContext.length - 1) {
    if (forwContext[forw_i] === "\\n") {
      forwContext = forwContext.substring(0, forw_i)
      break
    }
    forw_i++
  }

  const output = [
    {
      type: "MATCH",
      text: doc.text.substring(hit.charIndex.start, hit.charIndex.end),
      matchedTerm: hit.searchTerm
    }
  ]
  if (backContext.trim()) output.unshift({ type: "CONTEXT", text: backContext })
  if (forwContext.trim()) output.push({ type: "CONTEXT", text: forwContext })

  return output
}

const getHitPointers = term => {
  const cleaned = term.trim().toLocaleLowerCase()

  if (cleaned.startsWith("(") && cleaned.indexOf(")") > -1) {
    return getParenHitPointers(cleaned)
  }
  if (
    cleaned.indexOf("|") > -1 &&
    cleaned.indexOf("(") === -1 &&
    cleaned.indexOf(")") === -1
  ) {
    return getOrHitPointers(cleaned.split("|").filter(t => t.trim().length))
  }
  if (cleaned.indexOf(" ") > -1) {
    return getSequenceHitPointers(cleaned)
  }
  if (cleaned.indexOf("*") > -1) {
    return getWildcardHitPointers(cleaned)
  }

  const direct = unigramIndex.get(cleaned)
  if (!direct) {
    return {
      instances: [],
      lexeme: term,
      next: new Map()
    }
  }
  return direct
}

const getWildcardHitPointers = term => {
  const startsWith = [...unigramIndex.values()].filter(v =>
    v.lexeme.startsWith(term.replace("*", ""))
  )
  return unionPointers(startsWith)
}

const getOrHitPointers = terms => {
  const pointers = terms.map(t => getHitPointers(t))
  return unionPointers(pointers)
}

const getParenHitPointers = term => {
  const firstOpenParen = term.indexOf("(")
  const lastCloseParen = term.lastIndexOf(")")
  const unparened = term.substring(firstOpenParen + 1, lastCloseParen)
  return getHitPointers(unparened)
}

const splitTerms = term => {
  const cleanedTerm = term.trim()
  const terms = []
  let current = 0
  let lastAdd = 0
  while (current < cleanedTerm.length) {
    const c = cleanedTerm[current]
    if (c === "(") {
      const currentTextWindow = cleanedTerm.substring(current)
      let closeParenIndex = currentTextWindow.lastIndexOf(")")
      if (closeParenIndex > -1) {
        closeParenIndex += current
        const precedingText = cleanedTerm.substring(lastAdd, current).trim()
        const parentText = cleanedTerm
          .substring(current, closeParenIndex + 1)
          .trim()
        terms.push(precedingText)
        terms.push(parentText)
        lastAdd = closeParenIndex + 1
        current = closeParenIndex
      } else {
        break
      }
    }
    current++
  }
  if (terms.length) {
    if (lastAdd < cleanedTerm.length - 1) {
      terms.push(cleanedTerm.substring(lastAdd))
    }
    return terms
      .map(t => (t.indexOf("(") === -1 ? t.split(" ") : [t]))
      .flatMap(t => t)
      .filter(t => t.trim().length)
  }
  if (cleanedTerm.indexOf("|") === -1) {
    return cleanedTerm.split(" ").filter(t => t.length)
  }
  return [cleanedTerm]
}

const getSequenceHitPointers = searchTerm => {
  const terms = splitTerms(searchTerm)
  const output = {
    instances: [],
    lexeme: searchTerm,
    next: new Map()
  }

  // First term
  const term = terms[0]
  const hit = getHitPointers(term)

  if (!hit) return output
  let expected = new Map(
    hit.instances.filter(t => !!t.nextId).map(t => [t.nextId, [t]])
  )
  let next = hit.next

  // Following
  for (let j = 1; j < terms.length; j++) {
    const term = terms[j]
    if (STOP_WORDS.has(term)) {
      continue
    }
    const hit = getHitPointers(term)
    if (hit) {
      let matched = hit.instances.filter(t => expected.has(t.id))
      if (!matched.length) return output

      if (j < terms.length - 1) {
        expected = new Map(
          matched
            .filter(t => !!t.nextId)
            .map(t => [t.nextId, [...expected.get(t.id), t]])
        )
        next = hit.next
      } else {
        expected = new Map(matched.map(t => [t.id, [...expected.get(t.id), t]]))
      }
    } else {
      return output
    }
  }

  expected.forEach((v, k) => {
    const e = expected.get(k)
    const last = v[v.length - 1]
    expected.set(k, [
      {
        ...e[0],
        charIndex: { start: e[0].charIndex.start, end: last.charIndex.end },
        nextId: last.nextId
      }
    ])
  })

  output.instances = [...expected.values()].map(v => v[0])
  return output
}

const unionPointers = pointers => {
  const instances = pointers.flatMap(v => v.instances)

  const next = new Map()
  for (const pointer of pointers) {
    const current = next.get(pointer.lexeme)
    if (current) {
      current.instances = current.instances.concat(pointer.instances)
    } else {
      next.set(pointer.lexeme, pointer)
    }
  }

  return {
    instances,
    lexeme: pointers.map(p => p.lexeme).join(" | "),
    next
  }
}

const search = term => {
  const result = new Map()
  const hit = getSequenceHitPointers(term.text)

  if (hit) {
    for (let i = 0; i < hit.instances.length; i++) {
      const instance = hit.instances[i]

      if (result.has(instance.docId)) {
        result.get(instance.docId).push({ ...instance, searchTerm: term })
      } else {
        result.set(instance.docId, [{ ...instance, searchTerm: term }])
      }
    }
  }
  return result
}

const tokenizeDocument = note => {
  const source = note.text.toLocaleLowerCase()
  const tokens = []
  const spaces = new Set([" ", "\\n", "\\t", "\\r"])
  let line = 0
  let start = 0
  let current = 0

  const scanToken = () => {
    const c = advance()

    switch (c) {
      case " ":
      case "\\r":
      case "\\t":
        break

      case "\\n":
        toNewLine()
        break

      default:
        toToken()
        break
    }
  }

  const toNewLine = () => {
    line++
  }

  const toToken = () => {
    while (!isSpecialCharacter(peek()) && isAlphaNumeric(peek())) advance()
    addToken()
  }

  const peek = () => {
    if (isAtEnd()) return "\0"
    return source[current]
  }

  const isAlpha = c => {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z")
  }

  const isAlphaNumeric = c => {
    return isAlpha(c) || isDigit(c)
  }

  const isDigit = c => {
    return c >= "0" && c <= "9"
  }

  const isAtEnd = () => {
    return current >= source.length
  }

  const isSpecialCharacter = c => {
    return !isAlphaNumeric(c)
  }

  const advance = () => {
    return source[current++]
  }

  const addToken = () => {
    const text = source.substring(start, current)
    const token = {
      lexeme: text,
      charIndex: { start, end: current },
      datasetId: note.datasetId,
      docId: note.id,
      id: note.id + "_" + tokens.length.toString(),
      index: tokens.length,
      lineIndex: line
    }
    if (tokens.length) {
      const prev = tokens[tokens.length - 1]
      if (prev.lineIndex === token.lineIndex) {
        tokens[tokens.length - 1].nextId = token.id
      }
    }
    tokens.push(token)
  }

  while (!isAtEnd()) {
    start = current
    scanToken()
  }
  return tokens
}
`;