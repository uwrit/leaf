/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
// eslint-disable-next-line
const handleWorkMessage = payload => {
  switch (payload.message) {
    case REINDEX_DATASETS:
      return reindexCacheFromExternal(payload)
    case SEARCH_DATASETS:
      return searchDatasets(payload)
    case ALLOW_DATASET_IN_SEARCH:
      return allowDataset(payload)
    case ALLOW_ALL_DATASETS:
      return allowAllDatasets(payload)
    case SET_SEARCH_MODE:
      return setSearchMode(payload)
    default:
      return null
  }
}

/*
 * Shared cache.
 */
const demographics = {
  id: "demographics",
  shape: 3,
  category: "",
  isEncounterBased: false,
  name: "Basic Demographics",
  tags: []
}
const firstCharCache = new Map()
let excluded = new Map([
  [PATIENT_LIST, new Map([[demographics.id, demographics]])],
  [NOTE_SEARCH, new Map([[demographics.id, demographics]])]
])
let allDs = new Map()
let currentMode = PATIENT_LIST
let allCatDs = new Map()
let defaultOrder = new Map()

/*
 * Set whether the worker should return search results to an admin (i.e., no exclusions), patient list datasets, or note search datasets.
 */
const setSearchMode = payload => {
  const { requestId, searchMode } = payload
  currentMode = searchMode
  return { requestId, result: returnDefault() }
}

/*
 * Return the default display depending on whether the current mode is admin or user.
 */
const returnDefault = () => {
  return {
    categories: allCatDs.get(currentMode),
    displayOrder: defaultOrder.get(currentMode)
  }
}

/*
 * Flatten categorized datasets map into an array of datasets.
 */
const getAllDatasetsArray = () => {
  const copy = new Map(allDs)
  if (currentMode !== ADMIN) {
    copy.delete(demographics.id)
  }
  return [...copy.values()].filter(ds => filterByMode(ds))
}

const getDefaultExcluded = () => {
  return new Map([
    [PATIENT_LIST, new Map([[demographics.id, demographics]])],
    [NOTE_SEARCH, new Map([[demographics.id, demographics]])]
  ])
}

/*
 * Reset excluded datasets cache. Called when users
 * reset the cohort and the patient list too is reset.
 */
const allowAllDatasets = payload => {
  const { requestId } = payload

  excluded = getDefaultExcluded()
  /*
   * Get default display and sort order.
   */
  const reSorted = dedupeAndSort(getAllDatasetsArray())
  allCatDs.set(currentMode, reSorted.categories)
  defaultOrder.set(currentMode, reSorted.displayOrder)

  return { requestId, result: returnDefault() }
}

/*
 * Allow or disallow a dataset to be included in search results.
 * Called as users add/remove datasets from the patient list screen.
 */
const allowDataset = payload => {
  const { datasetId, allow } = payload

  if (allow) {
    excluded.get(currentMode).delete(datasetId)
  } else {
    const ds = allDs.get(datasetId)
    if (ds) {
      excluded.get(currentMode).set(ds.id, ds)
    }
  }
  const datasets = getAllDatasetsArray().filter(
    ds => !excluded.get(currentMode).has(ds.id)
  )
  const reSorted = dedupeAndSort(datasets)
  allCatDs.set(currentMode, reSorted.categories)
  defaultOrder.set(currentMode, reSorted.displayOrder)

  return searchDatasets(payload)
}

/*
 * Search through available datasets.
 */
const searchDatasets = payload => {
  const { searchString, requestId } = payload
  const terms = searchString.trim().split(" ")
  const termCount = terms.length
  const firstTerm = terms[0]
  const datasets = firstCharCache.get(firstTerm[0])
  const dsOut = []

  if (!searchString) {
    return { requestId, result: returnDefault() }
  }
  if (!datasets) {
    return {
      requestId,
      result: { categories: new Map(), displayOrder: new Map() }
    }
  }

  // ******************
  // First term
  // ******************

  /*
   * Foreach dataset compare with search term one. If demographics
   * are disabled this is for a user, so leave out excluded datasets.
   */
  if (currentMode !== ADMIN) {
    for (let i1 = 0; i1 < datasets.length; i1++) {
      const ds = datasets[i1]
      if (
        !excluded.get(currentMode).has(ds.id) &&
        ds.token.startsWith(firstTerm)
      ) {
        dsOut.push(ds)
      }
    }
    /*
     * Else this is for an admin in the admin panel, so there are no exclusions.
     */
  } else {
    for (let i1 = 0; i1 < datasets.length; i1++) {
      const ds = datasets[i1]
      if (ds.token.startsWith(firstTerm)) {
        dsOut.push(ds)
      }
    }
  }

  if (terms.length === 1) {
    return { requestId, result: dedupeAndSortTokenized(dsOut) }
  }

  // ******************
  // Following terms
  // ******************

  /*
   * For datasets found in loop one
   */
  const dsFinal = []
  for (let dsIdx = 0; dsIdx < dsOut.length; dsIdx++) {
    const otherTokens = dsOut[dsIdx].tokenArray.slice()
    let hitCount = 1

    /*
     * Foreach term after the first (e.g. [ 'white', 'blood' ])
     * filter what first loop found and remove if no hit
     */
    for (let i2 = 1; i2 < termCount; i2++) {
      const term = terms[i2]

      /*
       * For each other term associated with the dataset name
       */
      for (let j = 0; j < otherTokens.length; j++) {
        if (otherTokens[j].startsWith(term)) {
          hitCount++
          otherTokens.splice(j, 1)
          break
        }
      }
      if (!otherTokens.length) break
    }
    if (hitCount === termCount) {
      dsFinal.push(dsOut[dsIdx])
    }
  }

  return { requestId, result: dedupeAndSortTokenized(dsFinal) }
}

/*
 * Extract datasets from tokenized refs and returns
 * a sorted, deduped result array.
 */
const dedupeAndSortTokenized = refs => {
  let ds = refs.map(r => r.dataset)
  if (currentMode === PATIENT_LIST) {
    ds = ds.filter(d => !d.isNote)
  } else if (currentMode === NOTE_SEARCH) {
    ds = ds.filter(d => d.isNote)
  }
  return dedupeAndSort(ds)
}

const filterByMode = ref => {
  if (currentMode === ADMIN) return true
  if (ref.id === demographics.id) return false
  else if (currentMode === PATIENT_LIST) return !ref.isNote
  else if (currentMode === NOTE_SEARCH) return !!ref.isNote
}

/*
 * Remove duplicates, sort alphabetically, and
 * return a displayable categorized array of datasets.
 */
const dedupeAndSort = refs => {
  const addedDatasets = new Set()
  const addedRefs = []
  const out = new Map()
  const displayOrder = new Map()
  let includesDemographics = false

  /*
   * Get unique only.
   */
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i]
    if (!addedDatasets.has(ref.id)) {
      if (ref.shape === 3) {
        includesDemographics = true
      } else {
        if (!ref.category) {
          ref.category = ""
        }
        addedRefs.push(ref)
        addedDatasets.add(ref.id)
      }
    }
  }

  /*
   * Sort
   */
  const sortedRefs = addedRefs.sort((a, b) => {
    if (a.category === b.category) {
      return a.name > b.name ? 1 : -1
    }
    return a.category > b.category ? 1 : -1
  })
  if (includesDemographics) {
    sortedRefs.unshift(demographics)
  }
  const len = sortedRefs.length
  const lastIdx = len - 1

  /*
   * Add to map
   */
  for (let i = 0; i < len; i++) {
    const ref = sortedRefs[i]
    const catObj = out.get(ref.category)
    const order = {
      prevId: i > 0 ? sortedRefs[i - 1].id : sortedRefs[lastIdx].id,
      nextId: i < lastIdx ? sortedRefs[i + 1].id : sortedRefs[0].id
    }
    displayOrder.set(ref.id, order)

    if (catObj) {
      catObj.datasets.set(ref.id, ref)
    } else {
      out.set(ref.category, {
        category: ref.category,
        datasets: new Map([[ref.id, ref]])
      })
    }
  }
  return { categories: out, displayOrder }
}

const reindexCacheFromExternal = payload => {
  const { requestId, datasets } = payload
  const sorted = reindexCache(datasets)
  return { requestId, result: sorted }
}

/*
 * Reset the dataset search cache and (re)load
 * it with inbound datasets.
 */
const reindexCache = datasets => {
  /*
   * Ensure 'Demographics'-shaped datasets are excluded (they shouldn't be here, but just to be safe).
   */
  const all = datasets.slice().filter(ds => ds.shape !== 3)
  all.unshift(demographics)
  allDs.clear()
  allCatDs.clear()
  firstCharCache.clear()
  excluded = getDefaultExcluded()

  /*
   * Foreach dataset
   */
  for (let i = 0; i < all.length; i++) {
    const ds = all[i]

    let tokens = ds.name
      .toLowerCase()
      .split(" ")
      .concat(ds.tags.map(t => t.toLowerCase()))
    if (ds.category) {
      tokens = tokens.concat(ds.category.toLowerCase().split(" "))
    }
    if (ds.description) {
      tokens = tokens.concat(ds.description.toLowerCase().split(" "))
    }
    allDs.set(ds.id, ds)

    for (let j = 0; j <= tokens.length - 1; j++) {
      const token = tokens[j]
      const ref = {
        id: ds.id,
        dataset: ds,
        token,
        tokenArray: tokens.filter(t => t !== token)
      }
      const firstChar = token[0]

      /*
       * Cache the first first character for quick lookup.
       */
      if (!firstCharCache.has(firstChar)) {
        firstCharCache.set(firstChar, [ref])
      } else {
        firstCharCache.get(firstChar).push(ref)
      }
    }
  }

  /*
   * Set user search default display.
   */
  const trueCurrentMode = currentMode
  for (const mode of [ADMIN, PATIENT_LIST, NOTE_SEARCH]) {
    currentMode = mode
    const filtered = all.slice().filter(d => filterByMode(d))
    const sorted = dedupeAndSort(filtered)
    allCatDs.set(mode, sorted.categories)
    defaultOrder.set(mode, sorted.displayOrder)
  }
  currentMode = trueCurrentMode

  return returnDefault()
}
`;