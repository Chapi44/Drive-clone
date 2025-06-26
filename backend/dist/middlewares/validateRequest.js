"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => (req, res, next) => {
    var _a;
    try {
        schema.parse(req.body);
        next();
    }
    catch (err) {
        const formatted = (_a = err.errors) === null || _a === void 0 ? void 0 : _a.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));
        res.status(400).json({ error: "Validation failed", details: formatted });
    }
};
exports.validateRequest = validateRequest;
