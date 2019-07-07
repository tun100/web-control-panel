"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var path = require("path");
var os = require("os");
var ora = require('ora');
var _ = require('lodash');
var sh = require('shelljs');
var entrypoint_1 = require("./entrypoint");
function createNewInfoSession(msg) {
    return ora(msg).start();
}
exports.createNewInfoSession = createNewInfoSession;
function getAppHomeDir(targetPath) {
    if (targetPath === void 0) { targetPath = ''; }
    var storedir = path.join(os.homedir(), '.wcpstore', targetPath);
    return storedir;
}
exports.getAppHomeDir = getAppHomeDir;
function getStoreDir(targetPath) {
    if (targetPath === void 0) { targetPath = ''; }
    return path.join(entrypoint_1.wcp_system_conf['storedir'] || '', targetPath);
}
exports.getStoreDir = getStoreDir;
exports.dbutils = {
    count: function (db, sql, param) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exports.dbutils.all(db, "select count(*) as ctn from (" + sql + ") ctntb")];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, _.get(res, '0.ctn')];
                }
            });
        });
    },
    handleIfEmpty: function (db, sql, param, ifempty, returndata) {
        return __awaiter(this, void 0, void 0, function () {
            var res_ctn, res_data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exports.dbutils.count(db, sql, param)];
                    case 1:
                        res_ctn = _a.sent();
                        if (!(res_ctn === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, ifempty()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!returndata) return [3 /*break*/, 5];
                        return [4 /*yield*/, exports.dbutils.all(db, sql, param)];
                    case 4:
                        res_data = _a.sent();
                        return [2 /*return*/, res_data];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    all: function (db, sql, param) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (res_func, err_func) {
                        db.all(sql, param, function (error, res) {
                            if (error) {
                                err_func(error);
                            }
                            else {
                                res_func(res);
                            }
                        });
                    })];
            });
        });
    },
    run: function (db, sql, param) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (res_func, err_func) {
                        db.run(sql, param, function (error, res) {
                            if (error) {
                                err_func(error);
                            }
                            else {
                                res_func(res);
                            }
                        });
                    })];
            });
        });
    },
    runsafe: function (db, sql, param) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, exports.dbutils.run(db, sql, param)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
