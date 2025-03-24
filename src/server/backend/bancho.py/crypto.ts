import bcrypt from 'bcryptjs'
import md5 from 'md5'

export async function encryptBanchoPassword(pw: string, rounds = 11) {
  const pwMd5 = md5(pw)
  const salt = await bcrypt.genSalt(rounds)
  const pwBcrypt = await bcrypt.hash(pwMd5, salt)
  return pwBcrypt
}
export async function compareBanchoPassword(pw: string, pwBcrypt: string) {
  const pwMd5 = md5(pw)
  return await bcrypt.compare(pwMd5, pwBcrypt)
}
