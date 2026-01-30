const authSimulation = (req, res, next) => {
    // Check for x-user-role header
    const userRole = req.headers['x-user-role'];

    // Provide role in request for controllers to use if needed
    req.userRole = userRole;

    next();
};

const restrictTo = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions.'
            });
        }
        next();
    };
};

module.exports = {
    authSimulation,
    restrictTo
};
