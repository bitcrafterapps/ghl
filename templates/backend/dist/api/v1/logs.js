"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const logger_1 = require("../../logger");
const logger = logger_1.LoggerFactory.getLogger('LogsApi');
const router = (0, express_1.Router)();
// Helper function to safely get count from query result
const getCountFromResult = (result) => {
    if (!result || !result.rows || !result.rows[0])
        return 0;
    const countRow = result.rows[0];
    if (typeof countRow.count === 'number')
        return countRow.count;
    if (typeof countRow.count === 'string')
        return parseInt(countRow.count, 10);
    // If count is in a different format or property
    const countValue = Object.values(countRow)[0];
    if (typeof countValue === 'number')
        return countValue;
    if (typeof countValue === 'string')
        return parseInt(countValue, 10);
    return 0;
};
// Get all logs with pagination
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;
        logger.debug(`Getting logs with pagination: page=${page}, limit=${limit}`);
        const tableName = 'application_logs';
        const schema = process.env.POSTGRES_SCHEMA || 'ThreeBears';
        // Get total count
        const countResult = yield db_1.db.execute(`
      SELECT COUNT(*) FROM "${schema}"."${tableName}"
    `);
        const total = getCountFromResult(countResult);
        // Get logs with pagination
        const result = yield db_1.db.execute(`
      SELECT * FROM "${schema}"."${tableName}" 
      ORDER BY timestamp DESC 
      LIMIT ${limit} OFFSET ${offset}
    `);
        res.json({
            data: result.rows,
            meta: {
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        logger.error('Error getting logs:', error);
        res.status(500).json({
            error: {
                message: 'Failed to retrieve logs',
                details: error instanceof Error ? error.message : String(error)
            }
        });
    }
}));
// Get logs by date
router.get('/date/:date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;
        logger.debug(`Getting logs for date: ${date}`);
        if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return res.status(400).json({
                error: {
                    message: 'Invalid date format. Use YYYY-MM-DD'
                }
            });
        }
        const tableName = 'application_logs';
        const schema = process.env.POSTGRES_SCHEMA || 'ThreeBears';
        // Get total count
        const countResult = yield db_1.db.execute(`
      SELECT COUNT(*) FROM "${schema}"."${tableName}"
      WHERE DATE(timestamp) = '${date}'
    `);
        const total = getCountFromResult(countResult);
        // Get logs for the specified date
        const result = yield db_1.db.execute(`
      SELECT * FROM "${schema}"."${tableName}"
      WHERE DATE(timestamp) = '${date}'
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
        res.json({
            data: result.rows,
            meta: {
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        logger.error('Error getting logs by date:', error);
        res.status(500).json({
            error: {
                message: 'Failed to retrieve logs',
                details: error instanceof Error ? error.message : String(error)
            }
        });
    }
}));
// Get logs by date range
router.get('/range', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;
        logger.debug(`Getting logs for date range: ${startDate} to ${endDate}`);
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: {
                    message: 'Both startDate and endDate are required query parameters'
                }
            });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            return res.status(400).json({
                error: {
                    message: 'Invalid date format. Use YYYY-MM-DD'
                }
            });
        }
        const tableName = 'application_logs';
        const schema = process.env.POSTGRES_SCHEMA || 'ThreeBears';
        // Get total count
        const countResult = yield db_1.db.execute(`
      SELECT COUNT(*) FROM "${schema}"."${tableName}"
      WHERE DATE(timestamp) >= '${startDate}' AND DATE(timestamp) <= '${endDate}'
    `);
        const total = getCountFromResult(countResult);
        // Get logs for the specified date range
        const result = yield db_1.db.execute(`
      SELECT * FROM "${schema}"."${tableName}"
      WHERE DATE(timestamp) >= '${startDate}' AND DATE(timestamp) <= '${endDate}'
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
        res.json({
            data: result.rows,
            meta: {
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        logger.error('Error getting logs by date range:', error);
        res.status(500).json({
            error: {
                message: 'Failed to retrieve logs',
                details: error instanceof Error ? error.message : String(error)
            }
        });
    }
}));
exports.default = router;
