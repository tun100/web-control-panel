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

function createOra(msg: string) {
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
            apath text,
            ajson text,
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
	// check wcp_system table
	var wcp_system_data = await dbutils.all(db, `select * from wcp_system`);
	if (_.isEmpty(wcp_system_data)) {
		await dbutils.run(
			db,
			`insert into wcp_system (aname,avalue) values('storedir','${getAppHomeDir('storedir')}');`
		);
	}
	// after check, requery data
	wcp_system_data = await dbutils.all(db, `select * from wcp_system`);
	// settings wp_system_conf
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
			msgref = createOra(`homedir not settings(${storedir}), creating...`);
			sh.mkdir('-p', storedir);
			msgref.succeed(`creating homedir(${storedir}) success`);
		}
		// init store dir
		msgref = createOra('init storedir...');
		// await dbutils.all(db,`select * from `)
		msgref.succeed('finish init storedir');
		// start analyze arguments
		let argArr: string[] = getArgWithoutExec();
		let command = _.first(argArr);
		let options = _.get(argArr, 1);
		var msgref = createOra('initializing task...');
		switch (command) {
			case 'list-project':
				break;
			case 'set-storedir':
				let crtpath_storedir = getStoreDir();
				let newpath_storedir = options;
				sh.cp('-rf', crtpath_storedir, newpath_newproject);
				await dbutils.run(db, `update wcp_system set avalue='${newpath_storedir}' where aname='storedir'`);
				plainlog('update storedir success');
				break;
			case 'new-project':
				// check path
				if (_.isNil(options)) {
					options = getCwdDir('');
				}
				var newpath_newproject = options;
				if (isPathExists(newpath_newproject)) {
					msgref.stop();
					var res_should_del = await inquirer.prompt([
						{
							type: 'confirm',
							name: 'value',
							message: `path ${newpath_newproject} already exists, do you wanna delete it?`,
							default: true,
						},
					]);
					if (res_should_del['value']) {
						msgref = createOra(`deleteing target dir files...`);
						sh.rm('-rf', newpath_newproject);
						msgref.succeed(`deleteing target dir`);
						msgref = createOra('program will continue task');
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
				msgref = createOra(`initializing project files...`);
				sh.cp(
					'-rf',
					[getCrtPath('../template/*', __dirname), getCrtPath('../template/.*', __dirname)],
					newpath_newproject
				);
				msgref.succeed(`finish init project files`);
				// ask user which dep tools to use
				var toolres = await inquirer.prompt([
					{
						type: 'list',
						name: 'value',
						choices: ['npm', 'cnpm', 'yarn'],
						message: 'which one do you wanna use?',
						default: 'npm',
					},
				]);
				// install dependencies
				var toolname = toolres['value'];
				sh.cd(newpath_newproject);
				msgref.stop();
				msgref = createOra(`installing dependencies...`);
				switch (toolname) {
					case 'npm':
					case 'cnpm':
						sh.exec(`${toolname} i -S -D --verbose`);
					case 'yarn':
						sh.exec(`yarn`);
				}
				msgref.succeed(`finish install dependencies`);
				break;
			case 'view':
				break;
		}
	}
}

entryfunc();
