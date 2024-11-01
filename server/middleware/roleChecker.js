const ROLES = {
  /** User role */
  USER: 'User',
  /** Moderator role */
  MODERATOR: 'Moderator'
}

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Extract user's role from decoded token attached to request
    const userRole = req.user?.role
    // Handle undefined user role
    if (!userRole) {
      return res.status(403).json({ msg: 'Access denied. User role is undefined.' })
    }

    // Check if user's role is included in allowedRoles array
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ msg: 'Access denied. Insufficient privileges.' })
    }

    // Continue to the next middleware if user's role is allowed
    next()
  }
}

module.exports = { checkRole, ROLES }