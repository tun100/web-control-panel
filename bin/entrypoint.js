#!/usr/bin/env node
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
var fs = require("fs");
var path = require("path");
var inquirer = require("inquirer");
var utils_1 = require("./utils");
var sqlite3 = require('sqlite3').verbose();
var ora = require('ora');
var _ = require('lodash');
var sh = require('shelljs');
var gutils = require('global-code-utils');
var exitProgram = gutils.exitProgram, isEmptyOrHelpArg = gutils.isEmptyOrHelpArg, getArgWithoutExec = gutils.getArgWithoutExec, plainlog = gutils.plainlog, isPathExists = gutils.isPathExists, getCwdDir = gutils.getCwdDir, getCrtPath = gutils.getCrtPath, readDir = gutils.readDir, isFile = gutils.isFile, isDir = gutils.isDir;
exports.wcp_system_conf = {};
function initdb(db) {
    return __awaiter(this, void 0, void 0, function () {
        var wcp_system_data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // create table
                return [4 /*yield*/, utils_1.dbutils.run(db, "CREATE TABLE IF NOT EXISTS wcp_project (\n            id integer PRIMARY KEY autoincrement,\n\t\t\tatype text,\n\t\t\taname text,\n            apath text,\n\t\t\tajson text,\n\t\t\ttemplateid integer,\n            createtime TIMESTAMP default (datetime('now', 'localtime'))\n        )")];
                case 1:
                    // create table
                    _a.sent();
                    return [4 /*yield*/, utils_1.dbutils.run(db, "CREATE TABLE IF NOT EXISTS wcp_system (\n            id integer PRIMARY KEY autoincrement,\n            aname text,\n            avalue text,\n            ajson text,\n            createtime TIMESTAMP default (datetime('now', 'localtime'))\n        )")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, utils_1.dbutils.run(db, "CREATE TABLE IF NOT EXISTS wcp_template (\n            id integer PRIMARY KEY autoincrement,\n            atype text,\n            aname text,\n\t\t\tapath text,\n\t\t\tajson text,\n\t\t\tupdatetime timestamp,\n            createtime TIMESTAMP default (datetime('now', 'localtime'))\n        )")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, utils_1.dbutils.run(db, "CREATE TABLE IF NOT EXISTS wcp_log (\n            id integer PRIMARY KEY autoincrement,\n            atype text,\n            atitle text,\n            adesc text,\n            actn text,\n            createtime TIMESTAMP default (datetime('now', 'localtime'))\n        )")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, utils_1.dbutils.handleIfEmpty(db, "select * from wcp_system", {}, function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, utils_1.dbutils.run(db, "insert into wcp_system (aname,avalue) values('storedir','" + utils_1.getAppHomeDir('storedir') + "');")];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        }, true)];
                case 5:
                    wcp_system_data = _a.sent();
                    exports.wcp_system_conf = _.chain(wcp_system_data).groupBy(function (x) { return x['aname']; }).mapValues(function (x) { return _.get(x, '0.avalue'); }).value();
                    return [2 /*return*/];
            }
        });
    });
}
var func_helptext = function () {
    return "web-control-panel help\nUsage: wcp [command] [flags]\n\nDisplays help information.\n\nOptions: \nwcp view # serve a website, it's could help you manage all project\nwcp list-project # list all project you have created\nwcp new-project [dirpath] # create a webpack project at target path, default is crt cwd\nwcp set-storedir [dirpath] # set dirpath for store project dependecies and files\nwcp reset # RESET ALL CONFIG AND DATABASE FILE\n\nMeta Directory:\nAll of project meta information is in " + utils_1.getAppHomeDir() + "\n\nStore Directory:\nAll of dependencies and files is in " + utils_1.getStoreDir() + "\n\nAbout me:\nWelcome to star or fork :)\nGithub: https://github.com/tun100/\nRepository: https://github.com/tun100/web-control-panel";
};
function entryfunc() {
    return __awaiter(this, void 0, void 0, function () {
        var apphome, db, storedir, argArr, command, options, initstr, _a, res_should_reset, storedir_1, appdir, project_list, project_name_list_str, msgref, crtpath_storedir, newpath_storedir, msgref, newpath_newproject, subfiles, res_should_del, template_list, usage_template, template_aname_list, res_choose_template;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    apphome = utils_1.getAppHomeDir('');
                    sh.mkdir('-p', apphome);
                    db = new sqlite3.Database(utils_1.getAppHomeDir('meta.db'));
                    return [4 /*yield*/, initdb(db)];
                case 1:
                    _b.sent();
                    if (!isEmptyOrHelpArg()) return [3 /*break*/, 2];
                    // print help text
                    plainlog(func_helptext());
                    return [3 /*break*/, 20];
                case 2:
                    storedir = utils_1.getStoreDir();
                    if (!isPathExists(storedir)) {
                        msgref = utils_1.createNewInfoSession("homedir not settings(" + storedir + "), creating...");
                        sh.mkdir('-p', storedir);
                        msgref.succeed("creating homedir(" + storedir + ") success");
                    }
                    // init store dir
                    return [4 /*yield*/, utils_1.dbutils.handleIfEmpty(db, "select * from wcp_template", {}, function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var templateDefaultFolder;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            templateDefaultFolder = utils_1.getStoreDir('default');
                                            return [4 /*yield*/, utils_1.dbutils.run(db, "insert into wcp_template(atype,aname,apath) values('system','default','" + templateDefaultFolder + "')", {})];
                                        case 1:
                                            _a.sent();
                                            sh.mkdir('-p', templateDefaultFolder);
                                            sh.cp('-rf', [getCrtPath('../store/*', __dirname), getCrtPath('../store/.*', __dirname)], templateDefaultFolder);
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                case 3:
                    // init store dir
                    _b.sent();
                    argArr = getArgWithoutExec();
                    command = _.first(argArr);
                    options = _.get(argArr, 1);
                    initstr = 'initializing task...';
                    _a = command;
                    switch (_a) {
                        case 'reset': return [3 /*break*/, 4];
                        case 'list-project': return [3 /*break*/, 6];
                        case 'set-storedir': return [3 /*break*/, 8];
                        case 'new-project': return [3 /*break*/, 10];
                        case 'view': return [3 /*break*/, 19];
                    }
                    return [3 /*break*/, 20];
                case 4: return [4 /*yield*/, inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'value',
                            message: "Do you really wanna RESET? This operation will clear all CONFIG and DATABASE FILE !!!",
                            "default": true
                        },
                    ])];
                case 5:
                    res_should_reset = _b.sent();
                    if (res_should_reset['value']) {
                        storedir_1 = utils_1.getStoreDir();
                        appdir = utils_1.getAppHomeDir();
                        sh.rm('-rf', appdir);
                        sh.rm('-rf', storedir_1);
                        plainlog('already reset web-control-panel');
                    }
                    return [3 /*break*/, 20];
                case 6: return [4 /*yield*/, utils_1.dbutils.all(db, "select * from wcp_project", {})];
                case 7:
                    project_list = _b.sent();
                    project_name_list_str = _.join(_.map(project_list, function (x) { return "[" + x['id'] + "]: " + x['aname']; }), '\n');
                    plainlog(project_name_list_str);
                    return [3 /*break*/, 20];
                case 8:
                    msgref = utils_1.createNewInfoSession(initstr);
                    crtpath_storedir = utils_1.getStoreDir();
                    newpath_storedir = options;
                    sh.cp('-rf', crtpath_storedir, newpath_newproject);
                    return [4 /*yield*/, utils_1.dbutils.run(db, "update wcp_system set avalue='" + newpath_storedir + "' where aname='storedir'")];
                case 9:
                    _b.sent();
                    plainlog('update storedir success');
                    return [3 /*break*/, 20];
                case 10:
                    msgref = utils_1.createNewInfoSession(initstr);
                    // check path
                    if (_.isNil(options)) {
                        options = getCwdDir('');
                    }
                    newpath_newproject = options;
                    subfiles = fs.readdirSync(newpath_newproject);
                    if (!!_.isEmpty(subfiles)) return [3 /*break*/, 12];
                    msgref.stop();
                    return [4 /*yield*/, inquirer.prompt([
                            {
                                type: 'confirm',
                                name: 'value',
                                message: "path " + newpath_newproject + " contains " + _.size(subfiles) + " files, do you wanna remove these files?",
                                "default": true
                            },
                        ])];
                case 11:
                    res_should_del = _b.sent();
                    if (res_should_del['value']) {
                        msgref = utils_1.createNewInfoSession("deleteing target dir files...");
                        sh.rm('-rf', newpath_newproject);
                        msgref.succeed("deleteing target dir");
                        msgref = utils_1.createNewInfoSession('program will continue task');
                    }
                    else {
                        msgref.info("path already created, wcp need an empty and non created dir, the path is " + newpath_newproject);
                        exitProgram(-1);
                    }
                    _b.label = 12;
                case 12:
                    sh.mkdir('-p', newpath_newproject);
                    msgref.succeed("new project path is " + newpath_newproject);
                    msgref.stop();
                    msgref = utils_1.createNewInfoSession("initializing project files...");
                    sh.cp('-rf', [getCrtPath('../template/*', __dirname)], newpath_newproject);
                    msgref.succeed("finish project files initialize");
                    msgref = utils_1.createNewInfoSession("get current wcp template list...");
                    return [4 /*yield*/, utils_1.dbutils.all(db, "select * from wcp_template", {})];
                case 13:
                    template_list = _b.sent();
                    usage_template = null;
                    if (!(_.size(template_list) !== 1)) return [3 /*break*/, 15];
                    template_aname_list = _.map(template_list, function (x) { return x['aname']; });
                    return [4 /*yield*/, inquirer.prompt([
                            {
                                type: 'list',
                                name: 'value',
                                choices: template_aname_list,
                                message: 'which template do you wanna use?',
                                "default": _.first(template_aname_list)
                            },
                        ])];
                case 14:
                    res_choose_template = _b.sent();
                    usage_template = _.find(template_list, function (x) { return x['aname'] == res_choose_template['value']; });
                    return [3 /*break*/, 16];
                case 15:
                    usage_template = _.first(template_list);
                    _b.label = 16;
                case 16: return [4 /*yield*/, utils_1.dbutils.run(db, "delete from wcp_project where apath='" + newpath_newproject + "'")];
                case 17:
                    _b.sent();
                    // atype apath templateid
                    return [4 /*yield*/, utils_1.dbutils.run(db, "insert into wcp_project (atype,aname,apath,templateid) values('webpack','" + path.basename(newpath_newproject) + "','" + newpath_newproject + "'," + usage_template.id + ")")];
                case 18:
                    // atype apath templateid
                    _b.sent();
                    msgref.succeed("finish template choose, the name is " + _.get(usage_template, 'aname'));
                    msgref = utils_1.createNewInfoSession("create project record in database...");
                    msgref.succeed("Congratulation! Create new Project Successd! You could manage the project in web control panel. To access web control panel, you should run command \"wcp view\"");
                    return [3 /*break*/, 20];
                case 19: return [3 /*break*/, 20];
                case 20: return [2 /*return*/];
            }
        });
    });
}
entryfunc();
// dependency
function unuse_dependency() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
