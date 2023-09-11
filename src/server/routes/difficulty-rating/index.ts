// TODO have choice about how we handle star calc traffic
export default defineEventHandler((event) => {
  return sendRedirect(event, 'https://osu.ppy.sh/difficulty-rating')
})
