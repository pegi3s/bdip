import { TermStanza } from '../../obo/TermStanza';

/** Returns the chain of category IDs from the root ancestor down to `category` itself. */
export function getIdHierarchy(category: TermStanza): string[] {
  // Base case: if no parents, return just this ID
  if (!category.hasParents()) {
    return [category.id];
  }

  // Get the hierarchy of the parents
  const parentIds = category.getParents().map((parent) => getIdHierarchy(parent));
  return parentIds.flat().concat(category.id);
}

/** Returns the chain of human-readable category names from the root ancestor down to `category`. */
export function getNameHierarchy(category: TermStanza): string[] {
  // Base case: if no parents, return just this name
  if (!category.hasParents()) {
    return [category.name!.replaceAll('_', ' ')];
  }

  // Get the hierarchy of the parents
  const parentNames = category.getParents().map((parent) => getNameHierarchy(parent));
  return parentNames.flat().concat(category.name!.replaceAll('_', ' '));
}
