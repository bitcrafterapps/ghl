"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    var _a;
    const authenticatedReq = req;
    if (!authenticatedReq.authenticatedUser) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (!((_a = authenticatedReq.authenticatedUser.roles) === null || _a === void 0 ? void 0 : _a.includes('Site Admin'))) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
