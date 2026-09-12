import { router, type Href } from 'expo-router';

export function goBackOrReplace(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

/**
 * The reflection composer doubles as a plain journal entry when it is opened
 * without a show. This id is what "no show attached" looks like in the route.
 */
export const FREE_REFLECTION_ID = 'free';

export function reflectHref(showId: string): Href {
  return { pathname: '/reflect/[showId]', params: { showId } };
}
