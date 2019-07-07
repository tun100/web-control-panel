#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as process from 'process';
import * as inquirer from 'inquirer';
var sqlite3 = require('sqlite3').verbose();
var ora = require('ora');
var _ = require('lodash');
var sh = require('shelljs');
var gutils = require('global-code-utils');

var { getCrtPath, readDir, isFile, isDir } = gutils;

function getCwdDir(targetPath) {
	return path.join(process.cwd(), targetPath);
}

function isPathExists(targetPath) {
	return fs.existsSync(targetPath);
}

function plainlog(...str) {
	console.log(...str);
}

function getArgWithoutExec() {
	return _.drop(process.argv, 2);
}

function isEmptyOrHelpArg() {
	var arr = getArgWithoutExec();
	return _.isEmpty(arr) || _.first(arr) === 'help';
}

function exitProgram(code) {
	return process.exit(code);
}

// crt project variables and functions
let wcp_system_conf = {};

function createNewInfoSession(msg: string) {
	return ora(msg).start();
}

function getAppHomeDir(targetPath: string = '') {
	var storedir = path.join(os.homedir(), '.wcpstore', targetPath);
	return storedir;
}

function getStoreDir(targetPath: string = '') {
	return path.join(wcp_system_conf['storedir'] || '', targetPath);
}

function execCmd(cmd: string, silent = false) {
	return new Promise((r, e) => {
		var ref = sh.exec(
			cmd,
			{
				silent,
				async: true,
			},
			(err, res) => {
				if (err) {
					e(err);
				} else {
					r(res);
				}
			}
		);
	});
}

const dbutils = {
	count: async function(db, sql: string, param?: {}) {
		var res = await dbutils.all(db, `select count(*) as ctn from (${sql}) ctntb`);
		return _.get(res, '0.ctn');
	},
	handleIfEmpty: async function(db, sql: string, param: {}, ifempty: () => {}, returndata?: boolean) {
		var res_ctn = await dbutils.count(db, sql, param);
		if (res_ctn === 0) {
			await ifempty();
		}
		if (returndata) {
			var res_data = await dbutils.all(db, sql, param);
			return res_data;
		}
	},
	all: async function(db, sql: string, param?: {}) {
		return new Promise((res_func, err_func) => {
			db.all(sql, param, function(error, res) {
				if (error) {
					err_func(error);
				} else {
					res_func(res);
				}
			});
		});
	},
	run: async function(db, sql: string, param?: {}) {
		return new Promise((res_func, err_func) => {
			db.run(sql, param, function(error, res) {
				if (error) {
					err_func(error);
				} else {
					res_func(res);
				}
			});
		});
	},
	runsafe: async function(db, sql: string, param?: {}) {
		try {
			return await dbutils.run(db, sql, param);
		} catch (error) {
			// ignore error, dbrunsafe doesn't print the error
		}
	},
};

async function initdb(db) {
	// create table
	await dbutils.run(
		db,
		`CREATE TABLE IF NOT EXISTS wcp_project (
            id integer PRIMARY KEY autoincrement,
			atype text,
			aname text,
            apath text,
			ajson text,
			templateid integer,
            createtime TIMESTAMP default (datetime('now', 'localtime'))
        )`
	);
	await dbutils.run(
		db,
		`CREATE TABLE IF NOT EXISTS wcp_system (
            id integer PRIMARY KEY autoincrement,
            aname text,
            avalue text,
            ajson text,
            createtime TIMESTAMP default (datetime('now', 'localtime'))
        )`
	);
	await dbutils.run(
		db,
		`CREATE TABLE IF NOT EXISTS wcp_template (
            id integer PRIMARY KEY autoincrement,
            atype text,
            aname text,
			apath text,
			ajson text,
			updatetime timestamp,
            createtime TIMESTAMP default (datetime('now', 'localtime'))
        )`
	);
	await dbutils.run(
		db,
		`CREATE TABLE IF NOT EXISTS wcp_log (
            id integer PRIMARY KEY autoincrement,
            atype text,
            atitle text,
            adesc text,
            actn text,
            createtime TIMESTAMP default (datetime('now', 'localtime'))
        )`
	);
	// WCP_SYSTEM
	let wcp_system_data = await dbutils.handleIfEmpty(
		db,
		`select * from wcp_system`,
		{},
		async function() {
			await dbutils.run(
				db,
				`insert into wcp_system (aname,avalue) values('storedir','${getAppHomeDir('storedir')}');`
			);
		},
		true
	);
	wcp_system_conf = _.chain(wcp_system_data).groupBy(x => x['aname']).mapValues(x => _.get(x, '0.avalue')).value();
}

const func_helptext = () => {
	return `web-control-panel help
Usage: wcp [command] [flags]

Displays help information.

Options: 
wcp view # serve a website, it's could help you manage all project
wcp list-project # list all project you have created
wcp new-project [dirpath] # create a webpack project at target path, default is crt cwd
wcp set-storedir [dirpath] # set dirpath for store project dependecies and files
wcp reset # RESET ALL CONFIG AND DATABASE FILE

Meta Directory:
All of project meta information is in ${getAppHomeDir()}

Store Directory:
All of dependencies and files is in ${getStoreDir()}

About me:
Welcome to star or fork :)
Github: https://github.com/tun100/
Repository: https://github.com/tun100/web-control-panel`;
};

async function entryfunc() {
	// mkdir crt
	let apphome = getAppHomeDir('');
	sh.mkdir('-p', apphome);
	// initialize sqlite datafile and data conn
	let db = new sqlite3.Database(getAppHomeDir('meta.db'));
	await initdb(db);
	// start work flow
	if (isEmptyOrHelpArg()) {
		// print help text
		plainlog(func_helptext());
	} else {
		// get and auto create store dir
		const storedir = getStoreDir();
		if (!isPathExists(storedir)) {
			msgref = createNewInfoSession(`homedir not settings(${storedir}), creating...`);
			sh.mkdir('-p', storedir);
			msgref.succeed(`creating homedir(${storedir}) success`);
		}
		// init store dir
		await dbutils.handleIfEmpty(db, `select * from wcp_template`, {}, async function() {
			let templateDefaultFolder = getStoreDir('default');
			await dbutils.run(
				db,
				`insert into wcp_template(atype,aname,apath) values('system','default','${templateDefaultFolder}')`,
				{}
			);
			sh.mkdir('-p', templateDefaultFolder);
			sh.cp(
				'-rf',
				[getCrtPath('../store/*', __dirname), getCrtPath('../store/.*', __dirname)],
				templateDefaultFolder
			);
		});
		// start analyze arguments
		let argArr: string[] = getArgWithoutExec();
		let command = _.first(argArr);
		let options = _.get(argArr, 1);
		var initstr: string = 'initializing task...';
		switch (command) {
			case 'reset':
				var res_should_reset = await inquirer.prompt([
					{
						type: 'confirm',
						name: 'value',
						message: `Do you really wanna RESET? This operation will clear all CONFIG and DATABASE FILE !!!`,
						default: true,
					},
				]);
				if (res_should_reset['value']) {
					let storedir = getStoreDir();
					let appdir = getAppHomeDir();
					sh.rm('-rf', appdir);
					sh.rm('-rf', storedir);
					plainlog('already reset web-control-panel');
				}
				break;
			case 'list-project':
				var project_list = await dbutils.all(db, `select * from wcp_project`, {});
				var project_name_list_str = _.join(_.map(project_list, x => `[${x['id']}]: ${x['aname']}`), '\n');
				plainlog(project_name_list_str);
				break;
			case 'set-storedir':
				var msgref = createNewInfoSession(initstr);
				let crtpath_storedir = getStoreDir();
				let newpath_storedir = options;
				sh.cp('-rf', crtpath_storedir, newpath_newproject);
				await dbutils.run(db, `update wcp_system set avalue='${newpath_storedir}' where aname='storedir'`);
				plainlog('update storedir success');
				break;
			case 'new-project':
				var msgref = createNewInfoSession(initstr);
				// check path
				if (_.isNil(options)) {
					options = getCwdDir('');
				}
				var newpath_newproject = options;
				let subfiles = fs.readdirSync(newpath_newproject);
				if (!_.isEmpty(subfiles)) {
					msgref.stop();
					var res_should_del = await inquirer.prompt([
						{
							type: 'confirm',
							name: 'value',
							message: `path ${newpath_newproject} contains ${_.size(subfiles)} files, do you wanna remove these files?`,
							default: true,
						},
					]);
					if (res_should_del['value']) {
						msgref = createNewInfoSession(`deleteing target dir files...`);
						sh.rm('-rf', newpath_newproject);
						msgref.succeed(`deleteing target dir`);
						msgref = createNewInfoSession('program will continue task');
					} else {
						msgref.info(
							`path already created, wcp need an empty and non created dir, the path is ${newpath_newproject}`
						);
						exitProgram(-1);
					}
				}
				sh.mkdir('-p', newpath_newproject);
				msgref.succeed(`new project path is ${newpath_newproject}`);
				msgref.stop();
				msgref = createNewInfoSession(`initializing project files...`);
				sh.cp('-rf', [getCrtPath('../template/*', __dirname)], newpath_newproject);
				msgref.succeed(`finish project files initialize`);
				msgref = createNewInfoSession(`get current wcp template list...`);
				let template_list = await dbutils.all(db, `select * from wcp_template`, {});
				let usage_template = null;
				if (_.size(template_list) !== 1) {
					let template_aname_list = _.map(template_list, x => x['aname']);
					var res_choose_template = await inquirer.prompt([
						{
							type: 'list',
							name: 'value',
							choices: template_aname_list,
							message: 'which template do you wanna use?',
							default: _.first(template_aname_list),
						},
					]);
					usage_template = _.find(template_list, x => x['aname'] == res_choose_template['value']);
				} else {
					usage_template = _.first(template_list);
				}
				await dbutils.run(db, `delete from wcp_project where apath='${newpath_newproject}'`);
				// atype apath templateid
				await dbutils.run(
					db,
					`insert into wcp_project (atype,aname,apath,templateid) values('webpack','${path.basename(
						newpath_newproject
					)}','${newpath_newproject}',${usage_template.id})`
				);
				msgref.succeed(`finish template choose, the name is ${_.get(usage_template, 'aname')}`);
				msgref = createNewInfoSession(`create project record in database...`);
				msgref.succeed(
					`Congratulation! Create new Project Successd! You could manage the project in web control panel. To access web control panel, you should run command "wcp view"`
				);
				break;
			case 'view':
				break;
		}
	}
}

entryfunc();

// dependency
async function unuse_dependency() {
	// var toolres = await inquirer.prompt([
	// 	{
	// 		type: 'list',
	// 		name: 'value',
	// 		choices: ['npm', 'cnpm', 'yarn'],
	// 		message: 'which one do you wanna use?',
	// 		default: 'npm',
	// 	},
	// ]);
	// // install dependencies
	// var toolname = toolres['value'];
	// sh.cd(newpath_newproject);
	// msgref.stop();
	// msgref = createOra(`installing dependencies...`);
	// switch (toolname) {
	// 	case 'npm':
	// 	case 'cnpm':
	// 		sh.exec(`${toolname} i -S -D --verbose`);
	// 	case 'yarn':
	// 		sh.exec(`yarn`);
	// }
	// msgref.succeed(`finish install dependencies`);
}
