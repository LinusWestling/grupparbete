const argon2 = require('argon2')
const crypto = require('node:crypto')
const userRepository = require('../repositories/userRepository')

const hashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

const dummyHash = argon2.hash(crypto.randomBytes(32).toString('hex'), hashOptions)

// Skapa ett fel som controllern senare kan hantera.
function createError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

async function register({ username, email, password, requestOrganization = false } = {}) {
  // Kontrollera att alla fält är text.
  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw createError(400, 'Användarnamn, e-postadress och lösenord krävs.')
  }

  const cleanUsername = username.trim()
  const cleanEmail = email.trim().toLowerCase()

  if (cleanUsername.length < 3 || cleanUsername.length > 50) {
    throw createError(400, 'Användarnamnet måste vara mellan 3 och 50 tecken långt.')
  }

  if (cleanEmail.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw createError(400, 'Ange en giltig e-postadress.')
  }

  if (password.length < 15 || password.length > 128) {
    throw createError(400, 'Lösenordet måste vara mellan 15 och 128 tecken långt.')
  }

  // Hasha lösenorder innan det sparas.
  const passwordHash = await argon2.hash(password, hashOptions)
  const orgRequestStatus = requestOrganization === true ? 'pending' : 'none'

  try {
    const id = await userRepository.createUser(
      cleanUsername,
      cleanEmail,
      passwordHash,
      'user',
      orgRequestStatus,
    )

    return { id, org_request_status: orgRequestStatus }
  } catch (error) {
    if (error.code == 'ER_DUP_ENTRY') {
      throw createError(409, 'Användarnamnet eller e-postadressen används redan.')
    }

    throw error
  }
}

async function login({ email, password } = {}) {
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.length > 255 ||
    password.length > 128
  ) {
    throw createError(400, 'Ange din e-postadress och ditt lösenord.')
  }

  // Hämta kontot från databasen.
  const user = await userRepository.findByEmail(email.trim().toLowerCase())

  // Kontrollera lösenordet mot den spareade hashen.
  const correctPassword = await argon2.verify(user ? user.password_hash : await dummyHash, password)

  if (!user || !correctPassword) {
    throw createError(401, 'Fel e-postadress eller lösenord.')
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    org_request_status: user.org_request_status,
  }
}

async function getCurrentUser(userId) {
  if (!userId) {
    throw createError(401, 'Du är inte inloggad.')
  }

  const user = await userRepository.findById(userId)

  if (!user) {
    throw createError(401, 'Kontot finns inte längre.')
  }

  return user
}

module.exports = { register, login, getCurrentUser }
