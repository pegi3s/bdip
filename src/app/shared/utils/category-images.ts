import { TermStanza } from '../../obo/TermStanza';

/**
 * Checks whether a category has at least one associated image, either directly
 * (leaf category, looked up in the DIAF containers map) or through any of its
 * descendant categories.
 *
 * @param {TermStanza} category - The category to check.
 * @param {Map<string, Set<string>>} containersMap - Map of category ID to the set of image names associated with it.
 * @returns {boolean} True if the category or any descendant has at least one image.
 */
export function categoryHasImages(
  category: TermStanza,
  containersMap: Map<string, Set<string>>,
): boolean {
  if (!category.hasChildren()) {
    return (containersMap.get(category.id)?.size ?? 0) > 0;
  }
  return category.getChildren().some((child) => categoryHasImages(child, containersMap));
}
