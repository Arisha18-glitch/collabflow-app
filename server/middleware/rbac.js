/**
 * RBAC (Role-Based Access Control) Middleware
 * Ensures the authenticated user has one of the required roles.
 * Must be used AFTER the `protect` middleware which sets `req.user`.
 * 
 * @param {string[]} allowedRoles - Array of roles allowed to access the route (e.g. ['Owner', 'Editor'])
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized — no user context found' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Forbidden — insufficient permissions. Requires one of: ${allowedRoles.join(', ')}` 
            });
        }

        next();
    };
};

module.exports = { requireRole };
