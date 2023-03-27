import bcrypt from 'bcryptjs'
export async function encrypt(md5HashedPassword: string, rounds = 11) {
  const salt = await bcrypt.genSalt(rounds)
  const pwBcrypt = await bcrypt.hash(md5HashedPassword, salt)
  return pwBcrypt
}
export async function compare(pwMd5: string, pwBcrypt: string) {
  return await bcrypt.compare(pwMd5, pwBcrypt)
}
